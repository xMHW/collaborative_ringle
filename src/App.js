import React, {useEffect, useRef, useState} from 'react';
import './App.css';
// import {useParams} from "react-router-dom";
import {ApiHelper} from './modules/ApiHelper.js' 

const App = () => {
  // const { userId } = useParams();
  // const body = body
  // const method = method
  const [Text, setText] = useState("");
  const [Hello, setHello] = useState("");
  const [User, setUser] = useState("Jung");
  const thisRef = useRef("");
  const handleUserKeyPress = (e) => {
    //console.log(e.key)
    setText(e.key)
  }

  const value = {
    name: User,
    content: thisRef.current.textContent
  }
  const testPost = async () => {
    const response = await ApiHelper(
      'http://localhost:8082/product/find/all'
    )
    if (response){
      console.log(response)
      setHello(JSON.stringify(response))
    }
  }

  const creating = async () => {
    const response = await ApiHelper('http://localhost:8082/product', null, 'POST',
      value
    )
    console.log("Saved!")
    if (response){
      console.log(response)
    }
  }

  const updating = async () => {
    const response = await ApiHelper('http://localhost:8082/product', null, 'PUT',
    value
    )
    console.log("Updated")
  }

  const removing = async () => {
    const response = await ApiHelper(
      'http://localhost:8082/product/remove', null, 'POST', 
      {
        name: User
      }
    )
    console.log("Removed")
  }

  const printRef = () => {
    console.log(thisRef.current.textContent)
  }

  useEffect(() => {
    let id = window.addEventListener('keydown', handleUserKeyPress)
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress)
    }
  }, [Text])

  useEffect(() => {
    
  }, [])

  return <>
  <span>hello</span>
  <br></br>
  <span>{Hello}</span>
  <div className ="btn" onClick = {evt => testPost()}> Test Fetch </div>
  
  <div className = "superFancyBlockQuote" ref = {thisRef} contentEditable = {true} placeholder = "write">
    </div>

  <div onClick = {printRef}>  Print Typed Content</div>
  <div onClick = {creating}>  Save Ref</div>
  <div onClick = {updating}>  Update Ref</div>
  <div onClick = {removing}>  Remove Ref</div>
  </>
}

export default App;