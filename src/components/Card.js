import React, {useState, useEffect, useRef} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier, selectionState} from 'draft-js';
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
        // updateData();

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
      setCard(response)
      const parsedContent = JSON.parse(response[0].content)
      // console.log(JSON.parse(response[0].content))
      // console.log(convertFromRaw(parsedContent))
      // console.log(response[0].content)
      const defaultEditorState = EditorState.createWithContent(convertFromRaw(parsedContent))
      setEditorState(defaultEditorState)
    }
    
    useEffect(() => {
      getData()
    }, [])

    const createData = async () => {
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        const rawToString = JSON.stringify(raw);
        // const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url : 'http://www.ringleplus.com',});
        // const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        // console.log(entityKey)
        // const selectionState = editorState.getSelection();
        // const contentStateWithLink = Modifier.applyEntity(
        //   contentStateWithEntity,
        //   selectionState,
        //   entityKey,
        //   );
        // console.log(convertToRaw(contentStateWithLink))
        // const newEditorState = EditorState.set(editorState, {currentContent: contentStateWithLink,});
        // const newState = newEditorState.getCurrentContent()

        const response = await ApiHelper('http://localhost:8082/card/create', null, 'POST', {
            content: rawToString,
            created: time,
            updater: userId,
            cardposition: cardPosition,
          }
          )
        // console.log(editorState.getCurrentContent());
        console.log(convertFromRaw(raw))
        // console.log(convertToRaw(newEditorState.getCurrentContent()));
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