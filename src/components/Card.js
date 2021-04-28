import React, {useState, useEffect, useRef} from 'react';
import {Editor, EditorState, convertToRaw} from 'draft-js';
import {useParams} from "react-router-dom";
import {ApiHelper} from '../modules/ApiHelper'; 

const Card = () => {
    const [editorState, setEditorState] = useState(() => 
        EditorState.createEmpty(),
    );
    var today = new Date();
    var now = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

    const [value, setValue] = useState('');
    // const [User, setUser] = useState("Jung");
    const [time, setTime] = useState();
    const { userId } = useParams();
    const [cardPosition, setCardPostion] = useState(0);
    const [card, setCard] = useState();
    const editorRef = useRef();
    // const onChange = (evt) => setValue(evt.target.value);
    
    const onChange = (editorState) => {
      setEditorState(editorState);
    }

    useEffect(()=> {
        console.log(convertToRaw(editorState.getCurrentContent()).blocks[0])
        setTime(now);
        console.log(time);
        updateData();

    }, [editorState]);
    
    const focusEditor = () => {
      if(editorRef.current){
        editorRef.current.focus();
      }
    }

    
    const styleMap = {
      'HIGHLIGHT': {
        'backgroundColor': '#faed27',
      },
      'RED': {
        color:'red',
      }
    };
    
    const getData = async () => {
      const response = await ApiHelper('http://localhost:8082/card/find', null, 'POST',{
        cardposition: cardPosition,
      })
      console.log(response[0])
      setCard(response)
      setEditorState(response.content)
    }
    
    useEffect(() => {
      getData()
    }, [])

    const createData = async () => {
        const response = await ApiHelper('http://localhost:8082/card/create', null, 'POST', {
            content: convertToRaw(editorState.getCurrentContent()),
            created: time,
            updater: userId,
            cardpostion: cardPosition,
          }
        )
        console.log("Saving")
        if (response){
          console.log(response)
        }
      }

    const updateData = async () => {
        const response = await ApiHelper('http://localhost:8082/card/update', null, 'POST', {
            content: convertToRaw(editorState.getCurrentContent()),
            created: time,
            cardposition: cardPosition,
          }
        )
        console.log("Updating");
        console.log(time);
        console.log(convertToRaw(editorState.getCurrentContent()));

        if (response){
          console.log(response)
        }
    }  
    const deleteData = async () => {
      const response = await ApiHelper('http://localhost:8082/card/delete',null,'POST', {
        cardposition: cardPosition
      })
      console.log(response)
    }

    return (
        <div className = "cards">
            <Editor
          customStyleMap={styleMap}
          editorState={editorState}
          onChange={onChange}
          />
            <br/>
            <div onClick = {createData}> click to save</div>
            <div onClick = {updateData}> click to update</div>
            <div onClick = {deleteData}> click to delete</div>
        </div>
    );
  }
  
  export default Card;
  
  // <Editor editorState={editorState} onChange = {setEditorState}/>
  // ref={editorRef}