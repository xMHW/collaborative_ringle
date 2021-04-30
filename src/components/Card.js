import React, {useState, useEffect, useRef} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier, selectionState} from 'draft-js';
import {useParams} from "react-router-dom";
import {ApiHelper} from '../modules/ApiHelper'; 

const Card = ({uuid, currentCard, findPrevCard, findNextCard, createdNewCard}) => {
    const [editorState, setEditorState] = useState(() => 
        EditorState.createEmpty(),
    );
    var today = new Date();
    const [time, setTime] = useState(); // created에 들어갈 시간 데이터
    const { userId } = useParams(); //현재 페이지에 접속한 이용자 파라미터
    const [card, setCard] = useState(); //현재 커서가 있는 카드의 content text
    // const [uuid, setUuid] = useState(uuid); //현재 커서가 있는 카드의 uuid, 엔터 클릭시 생성된 카드의 uuid
    const [hasEnded, setHasEnded] = useState(false); // 커서의 위치가 끝이면, 변경됨을 알려줌
    // const editorRef = useRef();
    
    const onChange = (editorState) => {
      setEditorState(editorState);
      updateData(uuid)
    }
    
    useEffect(()=> {
      console.log(convertToRaw(editorState.getCurrentContent()).blocks[0])
      var now = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      setTime(now);
      // updateData(uuid);
    }, [editorState]);
    


    useEffect(() => {
      getData(uuid)
    }, [])
    

    const getData = async (uuid) => {
      const response = await ApiHelper('http://localhost:8082/card/find', null, 'POST',{
        _id: uuid,
      })
      console.log(uuid)
      console.log(response)
      setCard(response)
      if (response){
        console.log(response[0].content)
        const parsedContent = JSON.parse(response[0].content)
        const defaultEditorState = EditorState.createWithContent(convertFromRaw(parsedContent))
        setEditorState(defaultEditorState)  
      }else{
        console.log("No Response so default empty editor state returned")
      }
    }
    //위의 카드로 올라갈때의 설정
    const goingUp = () => {
      const currentContent = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      //start는 현재 카드에서의 커서의 위치 반환(텍스트의 index와 동일)
      let start = selectionState.getStartOffset();
      if (start === 0){
        //현재 카드줄에 텍스트가 없다면
        if(!currentContent.hasText()){
          findPrevCard(uuid, 'delete');
          //currentCard의 uuid를 위의 카드값으로 변경
        }else{
          findPrevCard(uuid);
        }
      }
    }
    //아래의 카드로 내려갈때의 설정
    const goingDown = () => {
      const currentContent = editorState.getCurrentContent();
      //현재 카드에 적혀있는 텍스트의 길이
      const length = currentContent.getPlainText().length;
      const selectionState = editorState.getSelection();
      //현재 카드에 있는 커서의 위치
      let start = selectionState.getStartOffset();

      if(length === start){
        console.log('ended');
        setHasEnded(Math.random());
      }else{
        console.log('Not ended yet');
        setHasEnded(false);
      }
    }

// 백스페이스 key = backspace, keyCode = 8

    //키를 누를때 반응하는 함수
    const onKeyDown = (evt) => {
      console.log("In Key Down")
      console.log(evt.keyCode)
      if (evt.key === "ArrowUp"){
        goingUp()
        console.log("arrow up")
        return
      }
      if (evt.key === "ArrowDown"){
        goingDown()
        console.log("arrow down")
        return
      }
      //탭을 눌렀을 때 -> 탭만 vs 쉬프트_탭
      if (evt.key === "Tab"){
        // setCurrentCard()
      }
      //엔터를 눌렀을 때
      if (evt.keyCode === 13){
        //새로운 카드를 생성해야함
        //엔터시 다음 줄로는 넘어가지 않도록 막아야함..쉬프트 엔터는 또 다르게,,
        newCard();
        //커서 위치도 옯겨가야함!

      }
    }

    //새로운, 빈, 카드 데이터 생성
    const newCard = async () => {
      const newCardEditorState = EditorState.createEmpty();
      const newCardContentState = newCardEditorState.getCurrentContent();
      const newCardRaw = convertToRaw(newCardContentState);
      const newCardRawToString = JSON.stringify(newCardRaw);
      const response = await ApiHelper('http://localhost:8082/card/create', null, 'POST', {
        content: newCardRawToString, //엔터를 누르는 곳 뒤에 텍스트가 있다면, 
        created: time,
        updater: userId,
      })
      console.log("new Card");
      console.log(response)
      //새로운 카드의 id 로 uuid 업데이트
      createdNewCard(response._id);
      console.log(response._id)
    }

    //카드 데이터 셋 생성
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

    //카드 텍스트 업데이트
    const updateData = async (uuid) => {
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        const rawToString = JSON.stringify(raw);
        const response = await ApiHelper('http://localhost:8082/card/update', null, 'POST', {
            _id: uuid,
            content: rawToString,
            created: time,
            updater: userId,
          }
        )
        console.log("Updating");
        console.log(time);
        if (response){
          console.log(response)
        }
    }
    
    //카드 데이터셋 삭제
    const deleteData = async (uuid) => {
      const response = await ApiHelper('http://localhost:8082/card/delete',null,'POST', {
        id: uuid,
      })
      console.log(response)
    }


    return (
        <div className = "cards" onKeyDown={onKeyDown}>
          <Editor
          editorState={editorState}
          onChange={onChange}
        />
        <div onClick = {deleteData}> click to delete</div>
        </div>
    );
  }
  export default Card;
  
  // <Editor editorState={editorState} onChange = {setEditorState}/>
  // ref={editorRef}
  // <br/>
  // <div onClick = {updateData}> click to update</div>
  // <div onClick = {createData}> click to save</div>
  // <div onClick = {deleteData}> click to delete</div>