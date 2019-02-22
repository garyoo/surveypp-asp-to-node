import {Que} from "../vo/Que.vo";
import $ from "jquery";
import Ex from "../vo/Ex.vo";
import {QuestionType, TableEDP} from "../enum/QuestionType";
import SurveyConfig from "../managers/SurveyConfig";
import Common from "../managers/Common";
import {GlobalReplacer} from "../enum/Config";
import ImageManager from "../managers/ImageManager";

/*
* TODO: 모듈별로 카테고리(value > 10000?) 적용해야함..
* TODO: 보기 로테이숀
*
*
*
* */

export class SurveyModule {
    que: Que;   //질문 JSON
    valid: boolean; //검증 됨?
    stayTime: number;   //머문 시간
    validMsg: string;   //검증 메세지
    domHtml?: string;   //HTML
    startDt: number;    //시작 TIME
    $form: JQuery<HTMLFormElement>;
    answered: {};
    questions: {};
    aosMode: string;
    examples: Array<Ex>;
    categories: Array<Ex>;
    etcArray?: Array<number>;
    pageUserScript?: string;
    $dom?: JQuery<HTMLDivElement>;
    $questionWrapper?: JQuery<HTMLDivElement>;
    userFunc?: {rendering: Function, submit: Function};
    validForms: {};
    direction?: boolean;
    config: SurveyConfig;
    $forms: {[key: string]: {form: HTMLElement, name: string, hidden?: boolean}};
    focus?: HTMLElement;    //검증 시 포커스해줄 element
    $customDom: {[key: string]: JQuery<HTMLDivElement>} = {};   //MBOX같은 특수한 치환..
    showExamplesCnt: number;

    constructor( { que, answered, questions, aosMode, pageUserScript, direction}: { que: Que, answered: object, questions: object, aosMode?: string, pageUserScript?: string, direction?: boolean} ) {
        this.que = Object.assign({},que);
        this.stayTime = 0;
        this.valid = false;
        this.validMsg = '';
        this.$form = $(`<form class="form-inline survey-form position-relative" name="form-post-${this.que.QtnName}"></form>`);
        this.startDt = new Date().valueOf();
        this.answered = answered;
        this.questions = questions;
        this.aosMode = aosMode || 'fade-in';
        this.categories = this.que.Examples.filter(ex => ex.ExampleVal>10000);
        this.examples = this.sortExamples();
        this.validForms = {};
        this.validForms[que.QtnName] = true;    //MARK: 기본적으로 TRUE
        this.$forms = {};
        this.config = SurveyConfig.Instance;

        //기타값 배열로 만들기
        if (this.que.AnsEtcVal !== "0" && this.que.AnsEtcVal !== "") {
            this.etcArray = this.que.AnsEtcVal.split(",")
                                .filter(etc => !isNaN(+etc))
                                .map(etc => +(etc.replace(/[^0-9]/g,'')));
        }
        this.getModuleColumnSet();
        if (direction !== undefined) this.direction = direction;
        this.replacer();
        this.setProtoType();

        //선택 가능한 보기 개수
        this.showExamplesCnt =
                            que.QtnType == QuestionType.Description? 1 :
                                que.QtnType == QuestionType.ImageDisplay? 1 :
                                    this.examples.filter(ex => ex.Show).length;

        console.log(`%c${que.QtnName} %c${QuestionType[que.QtnType]} (${que.QtnType}, %cPAGE=> ${que.PageNum}) %c보기 개수${this.examples.filter(ex => ex.Show).length}`,
            'color:red;font-size:1.2rem;',
            'color:blue;font-size:0.8rem;',
            'color:green;font-size:0.8rem;',
            'color:gray;font-size:0.8rem;');
    }

    render (): JQuery<HTMLDivElement> {
        return $('<div></div>');
    }

    get stayTimeCalc(): number {
        return (new Date().valueOf() - this.startDt) / 1000;
    }

    getData(): object {
        return {};
    }

    getNextRoutes(): {route: string, outMarker: string} {
        return {route: '', outMarker: ''};
    }

    //치환
    replacer(): void {
        //레이블로 변환...
        let queMatches = this.que.QuestionText.match(/\@(.*?)\:/g);
        if (queMatches) {
            queMatches.forEach(replace => {
                let find = replace.replace(/@|:/g,'');
                let replaceValue;
                let answered = this.answered[find];
                let question: Que = this.questions[find];
                //TODO : 값 불러오는 건 다른 방식으로 개선 해야할 듯
                if (question === undefined)question = this.questions[find.split('_')[0]];
                //응답한 값이 있다면!!!
                if (answered && question) {
                    replaceValue = answered.value;
                    let example = question.Examples.find(ex => ex.ExampleVal.toString() === replaceValue.toString());
                    if (example) replaceValue = `<span class="replace-label ${find}" data-original-label="${replace}">${example.ExampleText||replaceValue}</span>`;
                    //replaceValue = example.ExampleText||replaceValue;
                    let regExp = new RegExp(replace, 'g');
                    replaceValue = this.htmlEntitiesDecode(replaceValue);
                    this.que.QuestionText = this.que.QuestionText.replace(regExp,replaceValue);
                }
            });
        }

        queMatches = this.que.QuestionText.match(/\#(.*?)\:/g);
        if (queMatches) {
            queMatches.forEach(replace => {
                let find = replace.replace(/#|:/g,'');
                let replaceValue;
                let answered = this.answered[find];
                if (answered) {
                    replaceValue = answered.value;
                    let regExp = new RegExp(replace, 'g');
                    replaceValue = this.htmlEntitiesDecode(replaceValue);
                    this.que.QuestionText = this.que.QuestionText.replace(regExp,replaceValue);
                }
            });
        }

        //TODO: MBOX같이 REPLACE할만한 게 있는지..
        for(let replacer of Object.values(GlobalReplacer)) {
            let regExp = new RegExp(replacer,'gi');
            let match = this.que.QuestionText.match(regExp);
            if (match) {
                let split = this.que.QuestionText.split(replacer);
                if (split.length) {
                    this.que.QuestionText = split.shift()||this.que.QuestionText;
                }
                //MBOX
                if(split.length) {
                    let mboxContent = split.shift();
                    if (mboxContent) this.$customDom[replacer] = $(`<div class="rounded alert bg-default shadow-sm w-100 p-4 mbox">${mboxContent}</div>`);
                }
            }
        }

        this.examples = this.examples.map(ex => {
            return this.replaceExample(ex);
        });
    }

    //보기 치환자---
    replaceExample(ex: Ex): Ex {
        let _ex = Object.assign({Show: true},ex);
        try{
            //로직땜에 우선 모두 TRUE
            //_ex.Show = true;
            let matches = _ex.ExampleText.match(/\@(.*?)\:/g);
            if (matches) {
                matches.forEach(replace => {
                    let find = replace.replace(/@|:/g,'');
                    let replaceValue;
                    let answered = this.answered[find];
                    let question: Que = this.questions[find];
                    if (answered && question) {
                        replaceValue = answered.value;
                        let example = question.Examples.find(ex => ex.ExampleVal.toString() === replaceValue);
                        if (example) replaceValue = example.ExampleText||replaceValue;
                        let regExp = new RegExp(replace, 'g');
                        replaceValue = this.htmlEntitiesDecode(replaceValue);
                        _ex.ExampleText = _ex.ExampleText.replace(regExp,replaceValue);
                    }
                });
            }

            //#A1a_0_9_etc:
            matches = _ex.ExampleText.match(/\#(.*?)\:/g);
            if (matches) {
                matches.forEach(replace => {
                    let find = replace.replace(/#|:/g,'');
                    let replaceValue;
                    let answered = this.answered[find];
                    if (this.answered[find]) {
                        replaceValue = `<span class="replace-label ${find}" data-original-label="${replace}">${this.answered[find].value}</span>`;
                        let regExp = new RegExp(replace, 'g');
                        _ex.ExampleText = _ex.ExampleText.replace(regExp,replaceValue)
                    }
                });
            }

            //로직 처리
            if(_ex.FlowbyResponse) {
                let flow = _ex.FlowbyResponse;
                _ex.Show = this.replaceResponse(flow).flag;
            }
        } catch (e) {
            console.log(e);
        }
        return _ex;
    }

    replaceResponse (flow: string): {flag: boolean} {
        //첫째로 조건에 나오는 문번호가 DB에 없을 수 있기 때문에 벗기자
        let dv = Common.duplicateFlowQuestionNumber(flow);
        flow = Common.flowReplacer(flow);
        let answered = Object.assign({},this.answered);
        let ques = {};

        dv.forEach(d =>{
            ques[d] = "";
        });

        let evalFunc = "";
        for(let key in ques){
            let value = answered[key];
            if (value === undefined) {
                value = "";
            } else {
                value = JSON.stringify(value.value|| '');
            }
            evalFunc += `const ${key} = `;
            let replaceNumber = value.replace(/\"/g,'');
            if(isNaN(Number(replaceNumber))) replaceNumber = JSON.stringify(replaceNumber);
            if(replaceNumber === "" ) replaceNumber = JSON.stringify(replaceNumber);
            evalFunc += replaceNumber;
            evalFunc += ";";
        }
        evalFunc += `return (${flow.replace(/"(\d)"/g,'$1')});`;
        let logicResult = new Function (evalFunc);
        return {flag: logicResult()};
    }

    replaceNumberToKor(num: string): string {
        let digit = ["","만","억","조","경","해","자","양","구","간","정","재","극","항하사","아승기","나유타","불가사의","무량대수"];
        let n = num.replace(/\D/g,"");
        let fn = new Intl.NumberFormat('ko');

        let l = n.length-4;
        l = n.length-4;
        while(l > 0) {
            n = n.substr(0,l) + "," + n.substr(l);
            l -= 4;
        }
        let s = n.split(",");
        let out = '';
        for(let i=1 ; i<=s.length ; i++){
            let t = parseInt( s[s.length-i] ,10);
            let e = digit[i-1];
            if (e === undefined ) e = '10' +(i-1)*4;
            if ( t!==0 ) out = fn.format(t) + '' + e + '' + out ;
        }

        return out.toString();
    }

    //응답했던 문항은 값 표시
    existsAnswered({ exVal, ansVal, $input }: {exVal: string, ansVal:object, $input: JQuery<HTMLElement>}): JQuery<HTMLElement> {
        if (ansVal === undefined) return $input;
        if (ansVal['value'] === undefined) return $input;
        let value = ansVal['value'];
        let questionType = this.que.QtnType;
        switch (questionType) {
            case QuestionType.SingleDefault:
                if (exVal === value) {
                    $input.prop('checked',true);
                }
                break;
            case QuestionType.NumberDefault:
                $input.val(value);
                break;
            case QuestionType.SingleMeasure:
                if (exVal === value) {
                    $input.prop('checked',true);
                    $input.trigger('click');
                }
                break;
            case QuestionType.MultiSelection:
            case QuestionType.TableMultiTransform:
                if (exVal === value) {
                    //$input.prop('checked',true);
                    $input.trigger('click');
                }
                break;
            case QuestionType.TextMulti:
            case QuestionType.TextSingle:
            case QuestionType.AddressSearch:
            case QuestionType.NumberSum:
                $input.val(value);
                break;
            case QuestionType.Hidden:
                $input.val(value);
                break;
            case QuestionType.TableSingle:
            case QuestionType.TableSingleBoth:
                if (exVal === value) {
                    $input.prop('checked',true);
                    $input.trigger('click');
                }
                break;
            case QuestionType.SingleDropDown:
                if (exVal === value) {
                    $input.prop('selected', true);
                }
                break;
        }
        return $input;
    }

    //HTML DECODE
    //성능 저하의 원인
    htmlEntitiesDecode(text: string): string {
        let map = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": "\"",
            "&#39;": "'"
        };
        return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, (m) => map[m]);
    }

    userScript(): {rendering: Function, submit: Function, pageRendering: Function} {
        let func: Function;
        let rtnFunc: {rendering: Function, submit: Function, pageRendering: Function} = {rendering: new Function(), submit: new Function(), pageRendering: new Function() };
        try{
            if (this.pageUserScript) {
                func = new Function ('$','QtnName','PageNum','$dom', '__QUESTIONS', '__ANSWERED', this.pageUserScript);
                rtnFunc = func($,this.que.QtnName,this.que.PageNum, this.$dom, this.questions, this.answered);
            }
        }catch(e){
            console.log(e.message);
        }

        return rtnFunc;
    }

    //TEST 모드라고..
    testModeNotice(msg?: string): JQuery<HTMLDivElement> {
        let $div: JQuery<HTMLDivElement> = $(`<div class="mt-4 d-block"></div>`);
        let $alert: JQuery<HTMLDivElement> = $(`<div class="mt-4 alert alert-danger">This question show only test Mode.</div>`);
        $alert.appendTo($div);
        if(msg) {
            $(`<div class="mt-2 alert alert-warning">${msg}</div>`).appendTo($div);
        }
        return  $div;
    }

    get formCheck () {
        return this.valid;
    }

    questionAlert(flag: boolean) {
        if (!this.$dom) return;
        if (flag) {
            this.$dom.removeClass('border border-warning rounded');
        } else {
            this.$dom.addClass('border border-warning rounded');
        }
    }

    invalidNotice(msg: string): void {
        this.$form.find('div.invalid-tooltip').remove();
        let $div = $(`<div class="invalid-tooltip">${msg}</div>`) as JQuery<HTMLDivElement>;
        $div.addClass('d-block');
        $div.appendTo(this.$form);
    }

    //배열 랜덤
    sortArrayRandom(arr: Array<any>): Array<any> {
        return arr.sort(() => Math.random() - 0.5);;
    }

    //배열 로테이션
    sortArrayRotation(arr: Array<any>): Array<any> {
        let rtn: Array<any> = [];
        let pickIndex = Math.floor(Math.random() * arr.length);
        arr.forEach(() => {
            rtn.push(arr[pickIndex]);
            pickIndex += 1;
            if(pickIndex>=arr.length) pickIndex = 0;
        });
        return rtn;
    }

    sortExamples(): Array<Ex> {
        let exArr = this.que.Examples.slice(0);
        let matrix = exArr.filter(ex => ex.ExampleVal > 100).slice(0);
        let measure = exArr.filter(ex => ex.ExampleVal < 100).slice(0);
        let ansDpType = this.que.AnsDpType;
        let examples: Array<Ex> = [];
        //TABLE형태
        if (this.que.QtnType > 60 && this.que.QtnType < 70) {
            if (ansDpType === TableEDP.DefaultAllDisplay) {             //11    Default + All Display
                examples = exArr;
            } else if (ansDpType === TableEDP.RandomAllDisplay) {       //12	Random + All Display
                examples = measure.concat(this.sortArrayRandom(matrix));
            } else if (ansDpType === TableEDP.RotationAllDisplay) {     //13	Rotation + All Display
                examples = measure.concat(this.sortArrayRotation(matrix));
            } else if (ansDpType === TableEDP.DefaultStepByStep) {      //21	Default + Step by Step
                examples = measure.concat(matrix.map((obj, idx) => {
                    let copy = Object.assign({},obj);
                    if (idx > 0)copy.hidden = true;
                    return copy;
                }));
            } else if (ansDpType === TableEDP.RandomStepByStep) {       //22	Random + StepByStep : 기본값
                examples = measure.concat(this.sortArrayRandom(matrix).map((obj, idx) => {
                    let copy = Object.assign({}, obj);
                    if (idx > 0) copy.hidden = true;
                    return copy;
                }));
            } else if (ansDpType === TableEDP.RotationStepByStep) {     //23	Rotation + StepByStep
                examples = measure.concat(this.sortArrayRotation(matrix).map((obj, idx) => {
                    let copy = Object.assign({}, obj);
                    if (idx > 0) copy.hidden = true;
                    return copy;
                }));
            } else {
                examples = exArr;
            }
            //T61, T62, T63, T64, T65, T66
            /*
                TODO: 아래 건 뭐냐
                31	Default + StepByStep(next item btn)
                32	Random + StepByStep(next item btn)
                33	Rotation + StepByStep(next item btn)

            * */
        } else if(this.que.QtnType === QuestionType.SingleMeasure) {
            examples = exArr;
        } else {
            if (!this.categories.length) {  //카테고리가 없는 경우
                if (ansDpType === 2) {
                    //랜덤
                    examples = this.sortArrayRandom(exArr);
                } else if (ansDpType === 3) {
                    //로테이션
                    examples = this.sortArrayRotation(exArr);
                } else {
                    examples = exArr;
                }
            } else {    //카테고리가 있는 경우
                let cateObj = {};
                this.categories.forEach(ex =>{
                    if (cateObj[ex.Eidx] === undefined) cateObj[ex.Eidx] = [];
                });
                let idx = 0;
                Object.keys(cateObj).forEach(key => {
                    let cur = this.categories[idx];
                    let next = this.categories[idx+1];
                    let start, end;
                    start = cur.Eidx;
                    end = next ? next.Eidx : -1;
                    if(start && end !== -1){
                        cateObj[key] = exArr.filter(ex => ex.Eidx > start && ex.Eidx < end);
                    } else {
                        cateObj[key] = exArr.filter(ex => ex.Eidx > start);
                    }
                    idx +=1;
                });

                let cateKeyArr = Object.keys(cateObj);
                if (ansDpType === 2) {
                    cateKeyArr = this.sortArrayRandom(cateKeyArr);
                    cateKeyArr.forEach(key => {
                        let cate = exArr.find(ex => ex.Eidx.toString() === key);
                        if (cate) examples.push(cate);
                        examples.push(...this.sortArrayRandom(cateObj[key]));
                    });
                } else if(ansDpType === 3) {
                    cateKeyArr = this.sortArrayRotation(cateKeyArr);
                    cateKeyArr.forEach(key => {
                        let cate = exArr.find(ex => ex.Eidx.toString() === key);
                        if (cate) examples.push(cate);
                        examples.push(...this.sortArrayRotation(cateObj[key]));
                    });
                } else {
                    examples = exArr;
                }
            }
        }
        return examples;
    }

    formValidDecoration({result, dom}: {result: boolean, dom?: HTMLElement}): void {
        if (!dom) return;
        if(dom.tagName) {
            if (dom.tagName === 'INPUT') {
                let input: HTMLInputElement = dom as HTMLInputElement;
                if (result === true) {
                    $(input).removeClass('border border-danger');
                } else {
                    $(input).addClass('border border-danger');
                    input.focus();
                    this.focus = input;
                }
            } else if (dom.tagName === 'TEXTAREA') {
                let input: HTMLTextAreaElement = dom as HTMLTextAreaElement;
                if (result === true) {
                    $(input).removeClass('border border-danger');
                } else {
                    $(input).addClass('border border-danger');
                    input.focus();
                    this.focus = input;
                }
            } else if (dom.tagName === 'SELECT') {
                let input: HTMLSelectElement = dom as HTMLSelectElement;
                if (result === true) {
                    $(input).removeClass('border border-danger');
                } else {
                    $(input).addClass('border border-danger');
                    input.focus();
                    this.focus = input;
                }
            } else if (dom.tagName === 'IMG') {
                let input: HTMLImageElement = dom as HTMLImageElement;
                if (result === true) {
                    $(input).removeClass('border border-danger');
                } else {
                    $(input).addClass('border border-danger');
                    input.focus();
                    this.focus = input;
                }
            }
        }
    }

    //프로토 타입 함수들..
    setProtoType() {
        let qtnType: QuestionType = this.que.QtnType;
        $.fn['tableToMixTable'] = function () {
            this.addClass('my-2 d-table w-100').css({'table-layout': 'fixed'});

            //순위형 Descrition이 있다면?
            if (qtnType === QuestionType.RankSelection) {
                if (this.find('div.rank-wrapper').length) {
                    let $tableRow = $('<div class="d-block w-100 rounded mt-3"></div>').insertBefore(this);
                    let $div = $('<div class="w-100"></div>').appendTo($tableRow);
                    this.find('div.rank-wrapper').addClass('w-100 align-middle text-left border-light h-100 p-3').removeClass('alert alert-secondary rounded').detach().appendTo($div);
                }
            }

            let $tableRow = $('<div class="d-table-row w-100"></div>').appendTo(this);
            this.find('div.question-wrapper').addClass('d-table-cell w-25 h-100 align-middle text-center border-right-0 border-light bg-secondary').removeClass('alert alert-secondary rounded').detach().appendTo($tableRow);
            this.find('div.example-wrapper').addClass('d-table-cell w-75 h-100 align-middle text-left border-light').removeClass('rounded').detach().appendTo($tableRow);
            this.find('span.question-number').remove();


            return this;
        }
    }

    //보기 찾아주는 함수

    findEtcValue(exampleVal: number): boolean {
        if (this.etcArray === undefined)return false;
        return (this.etcArray.find(etc => etc === exampleVal) ? true : false);
    }

    getModuleColumnSet(): Set<string> {
        let que = this.que;
        let tableTypes: Array<number> = [61,62,63,64,65,66,67,68,69,75,76,82,83];

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

        let columnSet: Set<string> = new Set();
        switch (que.QtnType) {
            case QuestionType.SingleDefault:    //11	단일 기본형
            case QuestionType.SinglePopup:      //12	단일 팝업형
            case QuestionType.SingleMeasure:    //13	단일 척도형
            case QuestionType.SingleDropDown:   //14	단일 선택형(dropdown)
            case QuestionType.SingleSearch:     //16	단일 검색형
            case QuestionType.SingleImageMap:   //17	단일-이미지맵핑
                columnSet.add(que.QtnName);
                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            /*------------------------------------------------------------------------------------------------------*/
            case QuestionType.SingleBPTO:           //15	BPTO
            case QuestionType.SingleMaxDiff:        //18 MaxDiff
                columnSet = new Set([`${que.QtnName}_L`,`${que.QtnName}_R`]);
                break;
            /*------------------------------------------------------------------------------------------------------*/
            case QuestionType.MultiSelection:        //21	다중 선택형
            case QuestionType.MultiSearch:          //26	다중 검색형
            case QuestionType.MultiImageClickable:  //27	다중 이미지클릭커블
                if (que.ResponseCount === 0 || que.ResponseCntForce === 2) {
                    columnSet = new Set(examples.map(ex => `${que.QtnName}_${ex}`));
                } else {
                    columnSet = new Set(Array.from({length: que.ResponseCount}, (v, k) => `${que.QtnName}_${k+1}`));
                }
                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            /*------------------------------------------------------------------------------------------------------*/
            case QuestionType.RankSelection:        //31	순위 선택형
            case QuestionType.RankSearch:           //36	순위 검색형
            case QuestionType.RankImageClickable:   //37	순위 이미지클릭커블
                let responseCnt = que.ResponseCount;
                if (que.ResponseCount === 0 || que.ResponseCntForce === 2) {
                    responseCnt = examples.length;
                    if (que.AnsNonVal !== 0) responseCnt -= 1;
                    if (que.AnsDntknowVal !== 0) responseCnt -= 1;
                }

                columnSet = new Set(responseCnt ? Array.from({length: que.ResponseCount}, (v, k) => `${que.QtnName}_${k+1}`) : examples.map(ex => `${que.QtnName}_${ex}`));

                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            /*------------------------------------------------------------------------------------------------------*/
            case QuestionType.NumberDefault:        //41	숫자 기본형
            case QuestionType.NumberUnitConvert:    //43	숫자 단위환산형
                columnSet = new Set(que.Examples.length === 1 ? [que.QtnName] : examples.map(ex => `${que.QtnName}_${ex}`));
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                break;
            case QuestionType.NumberSum:            //42	숫자 비율(합계)형
                columnSet = new Set(que.Examples.length === 1 ? [que.QtnName] : examples.map(ex => `${que.QtnName}_${ex}`));
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                columnSet.add(`${que.QtnName}_TOTAL`);
                break;
            case QuestionType.TextSingle:           //51	주관식 단일형
            case QuestionType.TextMulti:            //52	주관식 다중형
            case QuestionType.TextCoding:           //53	주관식 코딩형
            case QuestionType.TextMobileNumber:     //54	기타 휴대폰번호 입력형
                columnSet = new Set(examples.length === 1 ? [que.QtnName] : examples.map(ex => `${que.QtnName}_${ex}`));
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                if (que.AnsDntknowVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsDntknowVal}`);
                break;
            case QuestionType.TableSingle:          //61	테이블 단일형
            case QuestionType.TableSingleBoth:      //63	테이블 단일형-좌우대칭
                columnSet = new Set(examples.map(ex => `${que.QtnName}_${ex}`));
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                if (que.AnsDntknowVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsDntknowVal}`);
                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.TableSingleTransform: //65	테이블 단일형-행렬전환
                columnSet = new Set(items.map(item => `${que.QtnName}_${item}`));
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                if (que.AnsDntknowVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsDntknowVal}`);
                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.TableMulti:       //62	테이블 다중형
            case QuestionType.TableMultiBoth:   //64	테이블 다중형-좌우대칭
                if (!que.ResponseCount) {
                    for(let ex of examples) {
                        for(let item of items){
                            columnSet.add(`${que.QtnName}_${ex}_${item}`);
                        }
                    }
                } else {
                    for(let ex of examples) {
                        for(let i=1;i<=que.ResponseCount;i++) {
                            columnSet.add(`${que.QtnName}_${ex}_${i}`);
                        }
                    }
                }
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                if (que.AnsDntknowVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsDntknowVal}`);

                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.TableMultiTransform:      //66	테이블 다중형-행렬전환
                if (!que.ResponseCount) {
                    for(let item of items) {
                        for(let ex of examples){
                            columnSet.add(`${que.QtnName}_${item}_${ex}`);
                        }
                    }
                } else {
                    for(let item of items) {
                        for(let i=1;i<=que.ResponseCount;i++) {
                            columnSet.add(`${que.QtnName}_${item}_${i}`);
                        }
                    }
                }
                if (que.AnsNonVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsNonVal}`);
                if (que.AnsDntknowVal !== 0) columnSet.add(`${que.QtnName}_${que.AnsDntknowVal}`);

                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.TableSingleSideBySide:    //67	테이블 단일형-SideBySide
                for(let ex of examples) {
                    columnSet.add(`${que.QtnName}L_${ex}`);
                    columnSet.add(`${que.QtnName}R_${ex}`);
                }
                break;
            case QuestionType.TableMultiSideBySide:     //68	테이블 다중형-SideBySide
                if (!que.ResponseCount) {
                    for(let ex of examples) {
                        for(let item of items) {
                            columnSet.add(`${que.QtnName}L_${ex}_${item}`);
                            columnSet.add(`${que.QtnName}R_${ex}_${item}`);
                        }
                    }
                } else {
                    for(let ex of examples) {
                        for(let i=1;i<=que.ResponseCount;i++) {
                            columnSet.add(`${que.QtnName}L_${ex}_${i}`);
                            columnSet.add(`${que.QtnName}R_${ex}_${i}`);
                        }
                    }
                }
                break;
            case QuestionType.TableRankSelection:   //69	테이블 순위형
                let responseCount = que.ResponseCount;
                if (responseCount === 0 || que.ResponseCntForce === 2) {
                    responseCount = examples.length;
                    if (que.AnsNonVal !== 0) responseCount -= 1;
                }

                for(let ex of examples) {
                    for(let i=1;i<=responseCount;i++) {
                        columnSet.add(`${que.QtnName}_${ex}_${i}`);
                    }
                }

                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.TableNumber:  //75	테이블 숫자입력형
                for(let ex of examples) {
                    for(let item of items){
                        columnSet.add(`${que.QtnName}_${ex}_${item}`);
                    }
                }

                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.TableNumberTransform: //76	테이블 숫자입력 행렬전환형
                for(let item of items) {
                    for(let ex of examples){
                        columnSet.add(`${que.QtnName}_${item}_${ex}`);
                    }
                }

                if(this.etcArray) {
                    if (this.etcArray.length && (que.AnsEtcOpen === 1 || que.AnsEtcOpen === 2)) this.etcArray.forEach(aev => columnSet.add(`${que.QtnName}_${aev}_etc`));
                }
                break;
            case QuestionType.SliderSingleMeasure:   //81	슬라이더-단일척도형
                columnSet.add(que.QtnName);
                break;
            case QuestionType.SliderTableSingle:        //82	슬라이더-테이블단일형
            case QuestionType.SliderTableSingleVideo:   //83	슬라이더-테이블동영상제시형
                columnSet = new Set(examples.map(ex => `${que.QtnName}_${ex}`));
                break;
            case QuestionType.UserCustom:   //사용자 정의 문항
                if (examples.length === 1) {
                    columnSet.add(que.QtnName);
                } else {
                    columnSet = new Set(examples.map(ex => `${que.QtnName}_${ex}`));
                }
                break;
            case QuestionType.AddressSearch:    //93	주소검색
            case QuestionType.RandomQuestion:   //92	랜덤문항
            case QuestionType.Hidden:           //91	숨김문항
            case QuestionType.FileUploadByPHP:  //95	파일 업로드(php 기반)
            case QuestionType.FileUploadByASP:  //96	파일 업로드(asp, Flash 기반)
                if (examples.length === 1) {
                    columnSet.add(que.QtnName);
                } else {
                    columnSet = new Set(examples.map(ex => `${que.QtnName}_${ex}`));
                }
                break;
            case QuestionType.Geo:  //94	위치정보(위경도)
                if (examples.length === 1) {
                    columnSet.add(`${que.QtnName}_Pos`);
                } else {
                    columnSet = new Set(examples.map(ex => `${que.QtnName}_Pos_${ex}`));
                }
                break;
        }
        return columnSet;


    }

    //URL이상한 이미지들
    imageChecker($div: JQuery<HTMLDivElement>) {
        let imageManager = new ImageManager($div);
        imageManager.matchImages();
    }

}
