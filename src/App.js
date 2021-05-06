import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {useParams} from "react-router-dom";
import {ApiHelper} from './modules/ApiHelper.js';
import Card from './components/Card.js';
import { io } from 'socket.io-client';
import useDidMountEffect from './modules/usedidmounteffect';


const SOCKET_URL = "http://54.180.147.138:5000"
const DEFAULT_URL = "http://54.180.147.138"
// const SOCKET_URL = "http://54.180.147.138:5000"

const App = () => {
  const [tree, setTree] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [load, setLoad] = useState(false);
  const [locRefs, setlocRefs] = useState([]);
  const {userId} = useParams();
  const [backSpace, setBackSpace] = useState(false);
  const [mergePending, setMergePending] = useState(null);
  const [cardCreated, setCardCreated] = useState(false);
  const [goingUp, setGoingUp] = useState(false);
  const [socket, setSocket] = useState();
  const [treeDifference, setTreeDifference] = useState(false);
  const [treeCardCount, setTreeCardCount] = useState(0);


  useEffect(() => {
    getTree();
  }, []);

  useEffect(() => {
    if(checkTreeDifference(tree.length)) setTreeDifference(true);
    setTreeCardCount(tree.length);
  }, [tree]);

  const checkTreeDifference = (length) => {
    if(treeCardCount != length) return true;
    return false;
  };

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    }
  },[]);

  useDidMountEffect(() => {
    if (socket == null || tree == null || treeDifference == false) return;
    socket.emit("send-tree-changes", {delta: tree, id: userId});
    setTreeDifference(true);
  }, [socket, tree, treeDifference]);

  useDidMountEffect(() => {
    if (socket == null || tree == null) return;
    const handler = (deltamap) => {
      if(deltamap["id"] == userId) return;
      setTree(deltamap["delta"]);
    };
    socket.on("receive-tree-changes", handler);
  }, [socket, tree]);

  const createLoc = async () => {
    const response = await ApiHelper(`${DEFAULT_URL}/loc/create`, null, 'POST', {
      refs: [],
    })
  }

  //아무런 정보가 없을 때, 트리/카드 하나 생성하도록?
  const createTree = async () => {
    const response = await ApiHelper(`${DEFAULT_URL}/tree/create`, null, 'POST', {
      cards: [],
      page: 0,
    })
  }

  //트리 데이터 서버를 통해 받아오기, tree데이터는 uuid만 어레이로 저장
  const getTree = async () => {
    const response = await ApiHelper(`${DEFAULT_URL}/tree/find/all`, null, 'GET', null)
    // console.log(response)
    setTree(response[0].cards)
    // console.log(tree)
  }

  const validateTree = async (tree) => {
    const allCards = await ApiHelper(`${DEFAULT_URL}/card/find/all`, null, 'GET', null)
    // console.log(allCards);
    let result = allCards.map(({_id}) => _id)
    // console.log(result)
    for (var i = 0; i < tree.length; i++){
      if (result.indexOf(tree[i]) === -1){
        let indexOfSplice = tree.indexOf(tree[i]);
        tree.splice(indexOfSplice, 1);
        // console.log("Splicing", tree[i]);
      }
      // console.log("validating cards while updating")
    }
    const validatedTree = tree;
    setTree(validatedTree)
  }

  const updateTree = async (page, tree) => {
    //page와 cards 받아오기
    validateTree(tree);
    const response = await ApiHelper(`${DEFAULT_URL}/tree/update`, null, 'POST', {
      page: page,
      cards: ["608b3f2157e25818a1d3ff16","608b3f3557e25818a1d3ff17"],
    })
    // console.log("updating tree")
    // console.log(response)
  }

  // console.log(tree)

  const findPrevCard = (uuid) => {
    const index = tree.indexOf(uuid)
    if (index === -1){
      return
    }
    if (index === 0){
      return
    }
    //본 카드 위에있는 카드의 uuid가져오기
    setCurrentCard(tree[index-1]);
    setGoingUp(true);

    // if(actionType === "delete"){
    //   const copied = [...tree]
    //   copied.splice(index, 1);
    //   setTree(copied);
    //   //tree 업데이트 됬음을 알려서 -> !!!!!!!!!!!!!!!!!!
    // }
  }

  const findNextCard = (uuid) => {
    const index = tree.indexOf(uuid)
    if (index === -1){
      console.log("That card uuid is Invalid!!!!!!!")
      return
    }
    if (!tree[index+1]){
      console.log("There is no Card After this one!!!!!")
      return
    }
    //본 카드 다음에 있는 카드의 uuid 가져오기
    console.log("Nothing went wrong!")
    setCurrentCard(tree[index + 1]);
  }

  const createdCard = (createdId) => {
    const index = tree.indexOf(currentCard);
    let newTree = []
    if(index === -1){
      newTree = [
        ...tree, createdId
      ]
      setTree(newTree)
    }else{
      const copiedTree = [...tree]
      copiedTree.splice(index + 1, 0, 
        createdId
      );
      newTree= copiedTree;
      setTree(newTree);
    }

    updateTree(1, newTree);
    //트리가 업데이트 되었다는 것을 알려줘야 함!!!!!!!!!
  }
  
  const deleteCurrentCardFromTree = () => {
    const index = tree.indexOf(currentCard);
    setCurrentCard(tree[index-1]);
    let newTree = []
    if(index === -1){
      return
    }else{
      const copiedTree = [...tree]
      copiedTree.splice(index, 1);
      newTree = copiedTree;
      setTree(newTree)
    }
    updateTree(1, newTree);
  }




  return <>
  <div className="page">
    <div className ="toolBox">
          highlight = Command/control + h  <br/>
          bold = command/control + b <br/>
          bullet = '-' + space '&' tab/shift+tab
    </div>
    <div className="document">
      {
        tree.map((id) => <Card key={id}
        // initContentState = {obj.initContentState}
        uuid = {id}
        currentCard = {currentCard}
        findPrevCard = {findPrevCard}
        findNextCard = {findNextCard}
        createdNewCardAtTree = {createdCard}
        setCurrentCard = {setCurrentCard}
        deleteCurrentCardFromTree = {deleteCurrentCardFromTree}
        setBackSpace = {setBackSpace}
        backSpace = {backSpace}
        mergePending = {mergePending}
        setMergePending = {setMergePending}
        cardCreated = {cardCreated}
        setCardCreated = {setCardCreated}
        goUp = {goingUp}
        setGoUp = {setGoingUp}
        socket = {socket}
        setSocket = {setSocket}
      />)
      }
      </div>
    </div>
    </>
}

export default App;
// createNewCard={add} 
// findPrevCard={findPrevCard}
// findNextCard={findNextCard}
// updateId={updateId}
// updateData={updateData}
// initContentState = {obj.initContentState}

// {/* <div onClick = {createTree}>TreeCreate</div> */}
/* <div className = "superFancyBlockQuote" ref = {thisRef} contentEditable = {true} placeholder = "write">
    
    </div> */

// <div onClick = {printRef}>  Print Typed Content</div>
// <div onClick = {updating}>  Update Ref</div>
// <div onClick = {removing}>  Remove Ref</div>
