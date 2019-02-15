/*

 *  해당 페이지는 로컬 /sp2/helper/execTable.asp를 참조함
  *
  *
  *
  * */
const fs = require('fs');
const path = require('path');

const test = async function(req,db,db2) {
    let questionFile = path.join(__dirname,'../survey', req.body.projectID, 'questions.json');
    let questions = [];

    if(fs.existsSync(questionFile)) {
        let quesObj = JSON.parse(fs.readFileSync(questionFile, 'utf-8').toString()).questionsObject;
        questions = Object.values(quesObj).sort((a, b) => {
            if (a.PageNum === b.PageNum) {
                return a.PQID < b.PQID ? -1 : a.PQID > b.PQID ? 1: 0;
            } else {
                return a.PageNum < b.PageNum ? -1 : a.PageNum > b.PageNum ? 1: 0;
            }
        });
    }
    return questionToDataField(questions);
};

const questionToDataField = (questions) => {
    let headers = [];

    let tableTypes = [61,62,63,64,65,66,67,68,69,75,76,82,83];

    for(let que of questions) {
        let qtnName = que['QtnName'];        //문항 이름
        let qtnType = que['QtnType'];        //문항 유형

        let tableTypes = [61,62,63,64,65,66,67,68,69,75,76,82,83];

        let examples = que.Examples.filter(ex => {         //보기
            if (ex.ExampleVal > 100) {
                return !tableTypes.includes(que.QtnType);
            }
            return true;
        }).map(ex => {
            return ex.ExampleVal;
        });

        let items = que.Examples.filter(ex => {          //척도
            if (ex.ExampleVal > 100) {
                return tableTypes.includes(que.QtnType);
            }
            return false;
        }).map(ex => {
            //테이블 형태는 100을 빼준다.
            if (ex.ExampleVal > 100 && tableTypes.includes(que.QtnType)){
                return ex.ExampleVal - 100;
            }
            return ex.ExampleVal;
        });



        let responseCount = que['ResponseCount'];  //응답 개수
        let ansDntKnowVal = que['AnsDntknowVal'];   //모름 값?
        let ansDpType = que['AnsDpType'];       //보기DP? 필요없을 것 같음
        let ansEtcOpen = que['AnsEtcOpen'];     //기타 여부
        let ansEtcVal = que['AnsEtcVal'];       //기타 값
        let ansEtcValArray = ansEtcVal.split(',').filter(aev => !isNaN(+aev) && aev !== "" && aev.toString() !== "0");  //기타값 배열
        let ansMaxLen = que['AnsMaxLen'];
        let ansMaxVal = que['AnsMaxVal'];
        let ansMinVal = que['AnsMinVal'];
        let ansNonVal = que['AnsNonVal'];
        let responseCntForce = que['ResponseCntForce'];

        switch (qtnType) {
            case 11:    //11	단일 기본형
            case 12:    //12	단일 팝업형
            case 13:    //13	단일 척도형
            case 14:    //14	단일 선택형(dropdown)
            case 16:    //16	단일 검색형
            case 17:    //17	단일-이미지맵핑
                headers.push(qtnName);
                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 15:    //15	BPTO
            case 18:    //18 MaxDiff
                headers.push([...`${qtnName}_L`,`${qtnName}_R`]);
                break;
            case 21:    //21	다중 선택형
            case 26:    //26	다중 검색형
            case 27:    //27	다중 이미지클릭커블
                if (responseCount === 0 || responseCntForce === 2){
                    headers.push(...examples.map(e => `${qtnName}_${e}`));
                } else {
                    for(let i=1;i<=responseCount;i++){
                        headers.push(`${qtnName}_${i}`);
                    }
                }
                break;
            case 31:    //31	순위 선택형
            case 36:    //36	순위 검색형
            case 37:    //37	순위 이미지클릭커블
                if (responseCount === 0 || responseCntForce === 2){
                    responseCount = examples.length;
                    if (ansNonVal>0) responseCount -= 1;
                    if (ansDntKnowVal>0) responseCount -= 1;
                }
                if (responseCount && isNaN(responseCount)) {
                    for(let i=1;i<=responseCount;i++){
                        headers.push(`${qtnName}_${i}`);
                    }
                } else {
                    headers.push(...examples.map(e => `${qtnName}_${e}`));
                }

                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 41:    //41	숫자 기본형
            case 42:    //42	숫자 비율(합계)형
            case 43:    //43	숫자 단위환산형
                if (examples.length === 1) {
                    headers.push(qtnName);
                } else {
                    headers.push(... examples.map(ex => `${qtnName}_${ex}`));
                }
                if(ansNonVal !== 0) headers.push(`${qtnName}_${ansNonVal}`);
                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 51:    //51	주관식 단일형
            case 52:    //52	주관식 다중형
            case 53:    //53	주관식 코딩형
            case 54:    //54	기타 휴대폰번호 입력형
                if (examples.length === 1) {
                    headers.push(qtnName);
                } else {
                    headers.push(... examples.map(ex => `${qtnName}_${ex}`));
                }
                if(ansNonVal !== 0) headers.push(`${qtnName}_${ansNonVal}`);
                if(ansDntKnowVal !== 0) headers.push(`${qtnName}_${ansDntKnowVal}`);
                break;
            case 61:    //61	테이블 단일형
            case 63:    //63	테이블 단일형-좌우대칭
                headers.push(...examples.map(e => `${qtnName}_${e}`));
                if(ansNonVal !== 0) headers.push(`${qtnName}_${ansNonVal}`);
                if(ansDntKnowVal !== 0) headers.push(`${qtnName}_${ansDntKnowVal}`);
                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 65:    //65	테이블 단일형-행렬전환
                headers.push(...items.map(e => `${qtnName}_${e}`));
                if(ansNonVal !== 0) headers.push(`${qtnName}_${ansNonVal}`);
                if(ansDntKnowVal !== 0) headers.push(`${qtnName}_${ansDntKnowVal}`);
                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 62:    //62	테이블 다중형
            case 64:    //64	테이블 다중형-좌우대칭
                if (responseCount === 0) {
                    for(let ex of examples) {
                        headers.push(...items.map(item => `${qtnName}_${ex}_${item}`));
                    }
                } else {
                    for(let ex of examples) {
                        for(let i=1;i<=responseCount;i++) {
                          headers.push(`${qtnName}_${ex}_${i}`);
                        }
                    }
                }
                if(ansNonVal !== 0) headers.push(`${qtnName}_${ansNonVal}`);
                if(ansDntKnowVal !== 0) headers.push(`${qtnName}_${ansDntKnowVal}`);
                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 66:    //66	테이블 다중형-행렬전환
                if (responseCount === 0) {
                    for(let item of items) {
                        headers.push(...examples.map(ex => `${qtnName}_${item}_${ex}`));
                    }
                } else {
                    for(let item of items) {
                        for(let i=1;i<=responseCount;i++) {
                            headers.push(`${qtnName}_${item}_${i}`);
                        }
                    }
                }
                if(ansNonVal !== 0) headers.push(`${qtnName}_${ansNonVal}`);
                if(ansDntKnowVal !== 0) headers.push(`${qtnName}_${ansDntKnowVal}`);
                //기타
                if ((ansEtcValArray.length) && (+ansEtcOpen === 1 || +ansEtcOpen === 2)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 67:    //67	테이블 단일형-SideBySide
                for(let ex of examples) {
                    headers.push(`${qtnName}L_${ex}`);
                    headers.push(`${qtnName}R_${ex}`);
                }
                break;
            case 68:    //68	테이블 다중형-SideBySide
                if (responseCount === 0) {
                    for(let ex of examples) {
                        headers.push(...items.map(item => `${qtnName}L_${ex}_${item}`));
                        headers.push(...items.map(item => `${qtnName}R_${ex}_${item}`));
                    }
                } else {
                    for(let ex of examples) {
                        for(let i=1;i<=responseCount;i++) {
                            headers.push(`${qtnName}L_${ex}_${i}`);
                            headers.push(`${qtnName}R_${ex}_${i}`);
                        }
                    }
                }
                break;
            case 69:    //69	테이블 순위형
                if (responseCount === 0 || responseCntForce === 2){
                    responseCount = examples.length;
                    if (ansNonVal>0) responseCount -= 1;
                }

                for(let ex of examples) {
                    for(let i=1;i<=responseCount;i++) {
                        headers.push(`${qtnName}_${ex}_${i}`);
                    }
                }

                //기타
                if ((ansEtcValArray.length)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 75:    //75	테이블 숫자입력형
                for(let ex of examples) {
                    headers.push(...items.map(item => `${qtnName}_${ex}_${item}`));
                }

                //기타
                if ((ansEtcValArray.length)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 76:    //76	테이블 숫자입력 행렬전환형
                for(let item of items) {
                    headers.push(...examples.map(ex => `${qtnName}_${item}_${ex}`));
                }

                //기타
                if ((ansEtcValArray.length)){
                    headers.push(...ansEtcValArray.map(aev => `${qtnName}_${aev}_etc`));
                }
                break;
            case 81:    //81	슬라이더-단일척도형
                headers.push(qtnName);
                break;
            case 82:    //82	슬라이더-테이블단일형
            case 83:    //83	슬라이더-테이블동영상제시형
                headers.push(... examples.map(ex => `${qtnName}_${ex}`));
                break;
            case 85:    //85	사용자정의문항
                if (examples.length === 1) {
                    headers.push(qtnName);
                } else {
                    headers.push(... examples.map(ex => `${qtnName}_${ex}`));
                }
                break;
            case 91:    //91	숨김문항
            case 92:    //92	랜덤문항
            case 93:    //93	주소검색
            case 95:    //95	파일 업로드(php 기반)
            case 96:    //96	파일 업로드(asp, Flash 기반)
                if (examples.length === 1) {
                    headers.push(qtnName);
                } else {
                    headers.push(... examples.map(ex => `${qtnName}_${ex}`));
                }
                break;
            case 94:    //94	위치정보(위경도)
                if (examples.length === 1) {
                    headers.push(`${qtnName}_Pos`);
                } else {
                    headers.push(... examples.map(ex => `${qtnName}_Pos_${ex}`));
                }
                break;
            default:
                break;
        }
    }
    return headers;
};
module.exports = questionToDataField;