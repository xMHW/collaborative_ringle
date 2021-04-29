import React, {useEffect, useRef, useState} from 'react';
import './App.css';
// import {useParams} from "react-router-dom";
import {ApiHelper} from './modules/ApiHelper.js' 

const App = () => {
  const [tree, setTree] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [treeState, setTreeState] = useState([]);



  //아무런 정보가 없을 때, 트리/카드 하나 생성하도록?
  const createTree = async () => {
    const response = await ApiHelper('http://localhost:8082/tree/create', null, 'POST'), {
      cards: [],
      page: page,
    }
    return [];
  }

  //트리 데이터 서버를 통해 받아오기
  const getTree = async () => {
    const response = await ApiHelper('http://localhost:8082/tree/find/all', null, 'POST',{
      page: page,
    })
    //Tree를 어떤 방식으로 저장하게 되는가?
    const defaultTree = response.cards

    //Tree 존재하면, 받아오고, 없으면 생성
    if (response){
      setTreeState(defaultTree);
    }else{
      setTreeState(createTree());
    }
  }

  const updateTree = async () => {
    //page와 cards 받아오기
    
    const response = await ApiHelper('http://localhost:8082/tree/update', null, 'POST', {
      page: page,
      cards: cards,
    })
  }

  useEffect(( ) => {
    getTree()
    
  }, [])


  return <>
  <div style = {{padding:16, width:1100, backgroundColor: 'white', maxWidth:1100, borderRadius:8, display: 'inline-block'}}>
    {
      tree.map((obj) => <Card key = {obj.id}
      initContentState = {obj.initContentState}
      uuid = {obj.id}
      currentId = {currentId}
      createNewCard={add} 
      findPrevCard={findPrevCard}
      findNextCard={findNextCard}
      updateId={updateId}
      updateData={updateData}
      />)
    }
  </div>
  

  </>
}

export default App;

/* <div className = "superFancyBlockQuote" ref = {thisRef} contentEditable = {true} placeholder = "write">
    
    </div> */

// <div onClick = {printRef}>  Print Typed Content</div>
// <div onClick = {creating}>  Save Ref</div>
// <div onClick = {updating}>  Update Ref</div>
// <div onClick = {removing}>  Remove Ref</div>

// const value = {
  //   name: User,
  //   content: thisRef.current.textContent
  // }
  // const testPost = async () => {
  //   const response = await ApiHelper(
  //     'http://localhost:8082/product/find/all'
  //   )
  //   if (response){
  //     console.log(response)
  //     setHello(JSON.stringify(response))
  //   }
  // }

  // const creating = async () => {
  //   const response = await ApiHelper('http://localhost:8082/product', null, 'POST',
  //     value
  //   )
  //   console.log("Saved!")
  //   if (response){
  //     console.log(response)
  //   }
  // }

  // const updating = async () => {
  //   const response = await ApiHelper('http://localhost:8082/product', null, 'PUT',
  //   value
  //   )
  //   console.log("Updated")
  // }

  // const removing = async () => {
  //   const response = await ApiHelper(
  //     'http://localhost:8082/product/remove', null, 'POST', 
  //     {
  //       name: User
  //     }
  //   )
  //   console.log("Removed")
  // }

  // const printRef = () => {
  //   console.log(thisRef.current.textContent)
  // }

  // useEffect(() => {
  //   let id = window.addEventListener('keydown', handleUserKeyPress)
  //   return () => {
  //     window.removeEventListener('keydown', handleUserKeyPress)
  //   }
  // }, [Text])

  // useEffect(() => {
    
  // }, [])

    // const handleUserKeyPress = (e) => {
  //   //console.log(e.key)
  //   setText(e.key)
  // }