import React, {useState, useEffect, useRef} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier, selectionState} from 'draft-js';
import {useParams} from "react-router-dom";
import {ApiHelper} from '../modules/ApiHelper'; 

const Card = ({uuid, currentCard, userId}) => {
    const [editorState, setEditorState] = useState(() => 
        EditorState.createEmpty(),
    );
    var today = new Date();
    
    const [value, setValue] = useState('');
    const [time, setTime] = useState();
    const [cardPosition, setCardPostion] = useState(1);
    const [card, setCard] = useState();
    const editorRef = useRef();
    // const onChange = (evt) => setValue(evt.target.value);
    
    const onChange = (editorState) => {
      setEditorState(editorState);
      updateData();
      // console.log(editorState);
    }
    
    useEffect(()=> {
      // console.log(convertToRaw(editorState.getCurrentContent()).blocks[0])
      var now = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      setTime(now);
      // console.log(time);
      // updateData();

    }, [editorState]);
    //요 위에 코드는 쓸모없는 것 같습니다. onChange Function이 여기 위의 코드랑 완벽하게 같은 역할을 하네요.

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
        _id: uuid,
      })
      setCard(response)
      const parsedContent = JSON.parse(response.content)
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

        const response = await ApiHelper('http://localhost:8082/card/create', null, 'POST', {
            content: rawToString,
            created: time,
            updater: userId,
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
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        const rawToString = JSON.stringify(raw);
        const response = await ApiHelper('http://localhost:8082/card/update', null, 'POST', {
            content: rawToString,
            created: time,
            _id: uuid,
            updater: userId,
          }
        )
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
        </div>
    );
  }
  
  export default Card;
  
  // onChange={onChange}
  // <Editor editorState={editorState} onChange = {setEditorState}/>
  // ref={editorRef}
  // <br/>
  // <div onClick = {updateData}> click to update</div>
  // <div onClick = {deleteData}> click to delete</div>
  // <div onClick = {createData}> click to save</div>