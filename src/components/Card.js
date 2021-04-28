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

    // const onChange = (evt) => setValue(evt.target.value);
    
    useEffect(()=> {
        console.log(convertToRaw(editorState.getCurrentContent()).blocks[0])
        setTime(now);
        console.log(time);
        updateData();
        //이제 여기에서 전체 card content가 아닌, 델타값만 업데이트 할 수 있도록,,

    }, [editorState]);


    const createData = async () => {
        const response = await ApiHelper('http://localhost:8082/card', null, 'POST', {
            content: convertToRaw(editorState.getCurrentContent()),
            created: time,
            updater: userId,
          }
        )
        console.log("Saving")
        if (response){
          console.log(response)
        }
      }

    const updateData = async () => {
        const response = await ApiHelper('http://localhost:8082/card', null, 'PUT', {
            content: convertToRaw(editorState.getCurrentContent()),
            created: time,
            updater: userId,
          }
        )
        console.log("Updating");
        console.log(time);
        console.log(convertToRaw(editorState.getCurrentContent()));

        if (response){
          console.log(response)
        }
    }  

    return (
        <div className = "cards">
            <Editor editorState={editorState} onChange = {setEditorState}/>
            
            <br/>
            <div onClick = {createData}> click to save</div>
            <div onClick = {updateData}> click to update</div>
        </div>
    );
}

export default Card;
