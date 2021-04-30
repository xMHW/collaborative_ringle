import React, {useEffect, useRef, useState} from 'react';
import './App.css';
// import {useParams} from "react-router-dom";
import {ApiHelper} from './modules/ApiHelper.js';
import Card from './components/Card.js';
import {useParams} from "react-router-dom";


const App = () => {
  const [tree, setTree] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [locRefs, setlocRefs] = useState([]);
  const {userId} = useParams();

  useEffect(( ) => {
    getTree()
  }, [])

  // useEffect(( ) => {
  //   getTree()
  // }, [tree])




  const createLoc = async () => {
    const response = await ApiHelper('http://localhost:8082/loc/create', null, 'POST', {
      refs: [],
    })
  }

  //아무런 정보가 없을 때, 트리/카드 하나 생성하도록?
  const createTree = async () => {
    const response = await ApiHelper('http://localhost:8082/tree/create', null, 'POST', {
      cards: [],
    })
  }

  //트리 데이터 서버를 통해 받아오기, tree데이터는 uuid만 어레이로 저장
  const getTree = async () => {
    const response = await ApiHelper('http://localhost:8082/tree/find/all', null, 'GET', null)
    console.log(response)
    setTree(response[0].cards)
    console.log(tree)
  }


  const updateTree = async (page, tree) => {
    //page와 cards 받아오기
    const response = await ApiHelper('http://localhost:8082/tree/update', null, 'POST', {
      page: page,
      cards: tree,
    })
    console.log("updating tree")
    console.log(response)
  }

  // console.log(tree)

  const findPrevCard = (uuid, actionType) => {
    const index = tree.indexOf(uuid)
    if (index === -1){
      return
    }
    if (index === 0){
      return
    }
    //본 카드 위에있는 카드의 uuid가져오기
    setCurrentCard(tree[index-1]);

    if(actionType === "delete"){
      const copied = [...tree]
      copied.splice(index, 1);
      setTree(copied);
      //tree 업데이트 됬음을 알려서 -> !!!!!!!!!!!!!!!!!!
    }
  }

  const findNextCard = (uuid) => {
    const index = tree.indexOf(uuid)
    if (index === -1){
      return
    }
    if (!tree[index+1]){
      return
    }
    //본 카드 다음에 있는 카드의 uuid 가져오기
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
  


  return <>
  <div style = {{padding:16, width:1100, backgroundColor: 'white', maxWidth:1100, borderRadius:8, display: 'inline-block'}}>
    {
      tree.map((id) => <Card key={id}
      // initContentState = {obj.initContentState}
      uuid = {id}
      currentCard = {currentCard}
      findPrevCard = {findPrevCard}
      findNextCard = {findNextCard}
      createdNewCard = {createdCard}
      setCurrentCard = {setCurrentCard}
    />)
    }
    </div>
    
    
    </>
}

export default App;
// createNewCard={add} 
// findPrevCard={findPrevCard}
// findNextCard={findNextCard}
// updateId={updateId}
// updateData={updateData}

/* <div className = "superFancyBlockQuote" ref = {thisRef} contentEditable = {true} placeholder = "write">
    
    </div> */

// <div onClick = {printRef}>  Print Typed Content</div>
// <div onClick = {creating}>  Save Ref</div>
// <div onClick = {updating}>  Update Ref</div>
// <div onClick = {removing}>  Remove Ref</div>
