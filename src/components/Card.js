import React, {useState, useEffect, useRef} from 'react';
import {Editor, EditorState, convertToRaw, convertFromRaw, Modifier, SelectionState, ContentBlock, ContentState, genKey} from 'draft-js';
import {useParams} from "react-router-dom";
import {ApiHelper} from '../modules/ApiHelper'; 
import useDidMountEffect from '../modules/usedidmounteffect';

let EditorStates = [];
// let editorStateHistory = [];

const Card = ({
  uuid, currentCard, findPrevCard, findNextCard, createdNewCardAtTree,
   setCurrentCard, deleteCurrentCardFromTree, setBackSpace, backSpace,
   mergePending, setMergePending, cardCreated, setCardCreated, goUp, setGoUp,
}) => {
    const [editorState, setEditorState] = useState(() => 
        EditorState.createEmpty(),
    );
    // const [editorStateHistory, setEditorStateHistory] = useState([]);
    var today = new Date();
    const [time, setTime] = useState(); // created에 들어갈 시간 데이터
    const { userId } = useParams(); //현재 페이지에 접속한 이용자 파라미터
    const [card, setCard] = useState(); //현재 커서가 있는 카드의 content text
    // const [uuid, setUuid] = useState(uuid); //현재 커서가 있는 카드의 uuid, 엔터 클릭시 생성된 카드의 uuid
    const [hasEnded, setHasEnded] = useState(false); // 커서의 위치가 끝이면, 변경됨을 알려줌
    const cursorRef = useRef();
    
    const onChange = (editState) => {
      setEditorState(editState);
      // updateData(uuid);
      setCurrentCard(uuid);
      // addHistory(editorState);
      // console.log(editorStateHistory.length);
    }

    //editorState History에 기록을 남길 최대 개수를 100개로 제한하기 위해서 setEditorStateHistory를 그냥 사용하지 않고, 개수체크해서 길이를 30아래로 유지하도록 합시다.
    // const addHistory = (editorState) => {
    //   if (editorStateHistory.length === 30) {
    //     editorStateHistory.pop();
    //     editorStateHistory.splice(0,0,editorState);
    //     return;
    //   }
    //   editorStateHistory.splice(0,0,editorState);
    // }
    
    useDidMountEffect(() => {
      // console.log(convertToRaw(editorState.getCurrentContent()).blocks[0])
      var now = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      setTime(now);
      updateData(uuid);
      console.log(editorState.getSelection(), uuid);
      // console.log(editorState.getSelection().getHasFocus());
      // EditorStates.push(editorState);
      // console.log(EditorStates);

      // console.log('uuid...');
      // console.log(uuid);
      // console.log(editorState.getCurrentContent().getPlainText());
    }, [editorState]);
    
    const checkDifference = () => {

    }
    
    useDidMountEffect(() => {
      if(currentCard == uuid) {
        // if(cardCreated) {
        //   cursorRef.current.focus();
        //   setEditorState(default_editor_state);
        //   setCardCreated(false);
        // }
        if(cursorRef.current){
          cursorRef.current.focus();
          // console.log(editorState.getSelection().getHasFocus());
          if(cardCreated) {
            const contentState = editorState.getCurrentContent();
            const selectionState = editorState.getSelection();
            const length = contentState.getPlainText().length;
            const mergedSelectionState = selectionState.merge({
              focusOffset: length,
              anchorOffset: length,
              hasFocus: true,
            });
            setEditorState(EditorState.acceptSelection(editorState, mergedSelectionState));
            setCardCreated(false);
          }
          if(backSpace){
            setEditorState(EditorState.moveFocusToEnd(editorState));
            if(mergePending){
              const contentState = editorState.getCurrentContent();
              const selectionState = editorState.getSelection();
              const focusKey = selectionState.getFocusKey();
              const length = contentState.getPlainText().length;
              const mergedContentState = mergeBlockToContentState(contentState, mergePending);
              const newCardRaw = convertToRaw(mergedContentState);
              const mergedEditorState2 = EditorState.createWithContent(convertFromRaw(newCardRaw))
              const mergedSelectionState = selectionState.merge({
                focusKey: focusKey,
                focusOffset: length,
                anchorOffset: length,
                hasFocus: true,
              })
              setEditorState(EditorState.acceptSelection(mergedEditorState2, mergedSelectionState));
              setMergePending(null);
            }
            setBackSpace(false);
          }
          if(goUp){
            setEditorState(EditorState.moveFocusToEnd(editorState));
            setGoUp(false);
          }
        }
      }
    },[currentCard])


    useEffect(() => {
      if(cardCreated) return;
      getData(uuid);
    }, [])
    

    const getData = async (uuid) => {
      const response = await ApiHelper('http://54.180.147.138/card/find', null, 'POST',{
        _id: uuid,
      })
      // console.log(uuid)
      // console.log(response)
      setCard(response)
      if (response){
        // console.log(response.content)
        const parsedContent = JSON.parse(response.content)
        const defaultEditorState = EditorState.createWithContent(convertFromRaw(parsedContent))
        setEditorState(defaultEditorState)  
      }else{
        // console.log("No Response so default empty editor state returned")
      }
    }
    //위의 카드로 올라갈때의 설정
    const goingUp = () => {
      const selectionState = editorState.getSelection();
      //start는 현재 카드에서의 커서의 위치 반환(텍스트의 index와 동일)
      let start = selectionState.getStartOffset();
      if (start === 0){
        //현재 카드줄에 텍스트가 없다면
        // if(!currentContent.hasText()){
        //   findPrevCard(uuid, 'delete');
        //   //currentCard의 uuid를 위의 카드값으로 변경
        // }else{
        //   findPrevCard(uuid);
        // }
        findPrevCard(uuid);
      }
    }
    //아래의 카드로 내려갈때의 설정
    const goingDown = () => {
      const currentContent = editorState.getCurrentContent();
      //현재 카드에 적혀있는 텍스트의 길이
      const length = currentContent.getLastBlock().getLength();
      const selectionState = editorState.getSelection();
      //현재 카드에 있는 커서의 위치
      let start = selectionState.getStartOffset();
      //현재 커서 위치가 카드줄의 마지막이라면
      if (start === length) {
        findNextCard(uuid);
      }
      // if(length === start){
      //   console.log('ended');
      //   setHasEnded(Math.random());
      // }else{
      //   console.log('Not ended yet');
      //   setHasEnded(false);
      // }
    }

// 백스페이스 key = backspace, keyCode = 8

    //키를 누를때 반응하는 함수
    const onKeyDown = (evt) => {
      // console.log("In Key Down")
      // console.log(evt.keyCode)
      //백스페이스를 눌렀을 때
      if (evt.keyCode === 8){
        // 커서 위치가 맨 처음이면서 동시에 카드에 들어있는 내용이 아예없다면! 지워버려야죠
        const contentState = editorState.getCurrentContent();
        const contentLength = contentState.getPlainText().length;
        const selectionState = editorState.getSelection();
        const start = selectionState.getFocusOffset();
        const mergeBlockMap = contentState.getBlockMap();
        const mergeBlock = contentState.getFirstBlock();
        if (start === 0) {
          if (contentLength === 0) {
            setBackSpace(true); //BackSpace로 이동할 때에는 위의 Card의 맨 끝으로 가야하기 위해서 선언한 State입니다. 위의 Card렌더링시에 BackSpace가 True이면 커서를 맨 끝으로 설정해 준 후에,
            deleteCurrentCardFromTree(uuid);
          }
          //카드에 들어있는 내용이 있다면, 위의 줄과 Merge해줘야 합니다.
          else{
            setBackSpace(true);
            setMergePending(mergeBlock);
            deleteCurrentCardFromTree(uuid);
          }
        }
      }
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
        //먼저 하나의 카드에 다음 줄로 넘어가는 것을 롤백해야함.
        const contentState = editorState.getCurrentContent();
        const focusPosition = editorState.getSelection().getFocusOffset();
        const contentLength = contentState.getPlainText().length;
        if(focusPosition == contentLength){
          console.log("newCard!!!!!!")
          setCardCreated(true);
          newCard();
          // setEditorState(EditorState.undo(editorState));
        }
        else{
          setEditorState(EditorState.undo(editorState));
          const selectionState = editorState.getSelection();
          const splitedBlocks = Modifier.splitBlock(contentState, selectionState);
          const modifiedContentState = ContentState.createFromBlockArray([splitedBlocks.getFirstBlock()]);
          const modifiedEditorState = EditorState.createWithContent(modifiedContentState);
          setEditorState(modifiedEditorState);
          const newContentState = ContentState.createFromBlockArray([splitedBlocks.getLastBlock()]);
          const newEditorState = EditorState.createWithContent(newContentState);
          newCard(newEditorState);
        }
        // setEditorState(editorStateHistory[1]);
        //커서 위치도 옯겨가야함!
      }
    }

    //새로운, 빈, 카드 데이터 생성
    const newCard = async (newCardEditorState = EditorState.createEmpty()) => {
      // const newCardEditorState = EditorState.createEmpty();
      const newCardContentState = newCardEditorState.getCurrentContent();
      const newCardRaw = convertToRaw(newCardContentState);
      const newCardRawToString = JSON.stringify(newCardRaw);
      const response = await ApiHelper('http://54.180.147.138/card/create', null, 'POST', {
        content: newCardRawToString, //엔터를 누르는 곳 뒤에 텍스트가 있다면, 
        created: time,
        updater: userId,
      })
      // console.log("new Card");
      // console.log(response)
      //새로운 카드의 id 로 uuid 업데이트
      createdNewCardAtTree(response._id);
      setCurrentCard(response._id);
      // console.log(response._id)
    }

    //카드 데이터 셋 생성
    const createData = async () => {
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        const rawToString = JSON.stringify(raw);
        const response = await ApiHelper('http://54.180.147.138/card/create', null, 'POST', {
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
        // console.log('update data');
        // console.log(contentState.getPlainText());
        const raw = convertToRaw(contentState);
        const rawToString = JSON.stringify(raw);
        const response = await ApiHelper('http://54.180.147.138/card/update', null, 'POST', {
            _id: uuid,
            content: rawToString,
            created: time,
            updater: userId,
          }
        )
        // console.log("Updating");
        // console.log(time);
        if (response){
          // console.log(response)
        }
    }
    
    //카드 데이터셋 삭제
    const deleteData = async () => {
      const response = await ApiHelper('http://54.180.147.138/card/delete',null,'POST', {
        _id: uuid,
      })
      console.log(response)
    }
    //ContentBlock 한개만 기존 contentState에 Merge하는 함수, 문제점이 있음! -> 기존에 contentState에 BlockMap에 추가해주며, 결과적으로 다음줄로 새로운 블럭이 나타납니다.
    const mergeBlockToContentState = (contentState, mergingBlock) => {
      const blockMap = contentState.getBlockMap();
      const lastBlock = contentState.getLastBlock();
      const newBlock = mergeBlockToAnotherBlock(lastBlock, mergingBlock);
      // console.log(uuid);
      // console.log(lastBlock.getText());
      // console.log(newBlock.getText());
      // console.log(blocksAsArray[blocksAsArray.legnth-1]);
      // const newBlock = new ContentBlock({
      //   key: genKey(),
      //   text: mergingBlock.getText(),
      //   type: mergingBlock.getType(),
      //   characterList: mergingBlock.getCharacterList(),
      //   depth: mergingBlock.getDepth(),
      //   data: mergingBlock.getData(),
      // });
      // const newBlockMap = blockMap.toSeq().concat([[newBlock.getKey(), newBlock]]).toOrderedMap();
      // const newBlockMap = blockMap.set(newBlock.getKey(), newBlock);
      const newContentState = ContentState.createFromBlockArray([newBlock]);
      // console.log(newBlockMap.get(newBlock.getKey()).getText());
      // return contentState.merge({blockMap: newBlockMap });
      return newContentState;
    }

    //수정중인 함수-> 하나의 contentBlock에 다른 contentBlock의 내용을 가져와서 Merge하는 함수
    const mergeBlockToAnotherBlock = (originalBlock, mergingBlock) => {
      const newBlock = new ContentBlock({
        key: originalBlock.getKey(),
        text: originalBlock.getText().concat(mergingBlock.getText()),
        characterList: originalBlock.getCharacterList(),
        depth: originalBlock.getDepth(),
        data: originalBlock.getData(),
      });
      return newBlock
    }

    // const selectionInitializedEditorState = () => {
    //   const newSelectionState = new SelectionState({
    //     hasFocus: true,
    //   });
    //   const newEditorState = EditorState.createEmpty();
    //   const initializedEditorState = EditorState.forceSelection(newEditorState, newSelectionState);
    //   return initializedEditorState;
    // }


    return (
        <div className = "cards" onKeyDown={onKeyDown}>
          {uuid}
          
          <Editor
          editorState={editorState}
          onChange={onChange}
          ref={cursorRef}
        />
        <p>{editorState.getCurrentContent().getPlainText()}</p>
        </div>
    );
  }
  export default Card;
  
  // <div onClick = {deleteData}> click to delete</div>
  // <div onClick = {createData}> click to save</div>
  // <Editor editorState={editorState} onChange = {setEditorState}/>
  // ref={editorRef}
  // <br/>
  // <div onClick = {updateData}> click to update</div>
  // <div onClick = {deleteData}> click to delete</div>