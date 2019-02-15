import {SurveyModule} from "../SurveyModule";
import {Que} from "../../vo/Que.vo";
import $ from 'jquery';

export class AddressSearch extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, show: boolean, name: string, postForm: HTMLInputElement, addressForm: HTMLInputElement}} = {}; //전체 INPUT
    daum: Function;
    constructor({ que, answered, questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript});
        this.valid = false;
        this.$forms = {};
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
        let evalFunc: string = `
                daum.postcode.load(function(){
                    new daum.Postcode({
                        oncomplete: function(data) {
                            try{
                            inputHidden.value = data.address;
                            inputPost.value = data.zonecode;
                            inputAddress.value = data.address;
                            inputDetailAddress.readOnly = false;
                            } catch(e){console.log(e);}
                        },
                        onclose: function() {
                        },
                        width: '100%'
                    }).embed(targetDom);
                });
            `;
        this.daum = new Function('targetDom','inputPost','inputAddress','inputDetailAddress','inputHidden', evalFunc);
        this.$dom = this.render();
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        let $questionWrapper: JQuery<HTMLDivElement>;
        let $exampleWrapper: JQuery<HTMLDivElement>;
        let $exampleContainer: JQuery<HTMLDivElement>;
        let $exampleRow: JQuery<HTMLDivElement>;

        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        $exampleContainer = $(`<div class="container"></div>`);
        $exampleRow = $(`<div class="example-row my-2 row"></div>`);


        $questionWrapper.appendTo($div);
        this.$questionWrapper = $questionWrapper;
        this.$form.appendTo($exampleWrapper);
        $exampleContainer.appendTo(this.$form);
        $exampleRow.appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;

        for(let ex of this.examples){
            let formID: string= `${this.que.QtnName}_${ex.ExampleVal}`;
            if (this.examples.length === 1) formID = `${this.que.QtnName}`;
            let col = 12;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);

            let $example: JQuery<HTMLDivElement>;
            let $inputPost: JQuery<HTMLInputElement>;
            let $inputAddress: JQuery<HTMLInputElement>;
            let $inputDetailAddress: JQuery<HTMLInputElement>;
            let $inputHidden: JQuery<HTMLInputElement>;
            let $searchBtn: JQuery<HTMLButtonElement>;
            let $postIframeDiv: JQuery<HTMLDivElement>;
            

            $inputPost= $(`<input type="text" id="${formID}-post" class="form-control form-control-sm mx-1" placeholder="우편번호" readonly/>`);
            $inputAddress = $(`<input type="text" id="${formID}-address" class="form-control form-control-sm mx-1 w-100" placeholder="주소" readonly/>`);
            $inputDetailAddress = $(`<input type="text" id="${formID}-detail-address" class="form-control form-control-sm mx-1 w-100" data-name="${formID}" placeholder="상세주소" ${this.direction ? 'readonly' : ''}/>`);
            $inputHidden = $(`<input type="hidden" name="${formID}" id="${formID}"/>`);
            $searchBtn = $(`<button type="button" class="btn btn-sm btn-default mx-1">주소 검색</button>`);
            $postIframeDiv = $(`<div class="d-block w-100"></div>`);

            $example= $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group text-right"></div>`);
            $inputPost.appendTo($example);
            $searchBtn.appendTo($example);
            $example.appendTo($exampleRow);

            $example= $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`);
            $inputAddress.appendTo($example);
            $example.appendTo($exampleRow);

            $example= $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`);
            $inputDetailAddress.appendTo($example);
            $example.appendTo($exampleRow);
            $inputDetailAddress.on('keyup', (evt) => {
                return this.eventDefault({$this: $inputDetailAddress});
            });

            $example= $(`<div class="example-cols my-1 col-12 col-sm-${col}"></div>`);
            $postIframeDiv.appendTo($example);
            $example.appendTo($exampleRow);
            $inputHidden.appendTo(this.$form);

            $searchBtn.on('click', () => {
                $inputPost[0].value = '';
                $inputAddress[0].value = '';
                $inputDetailAddress[0].value = '';
                this.daum($postIframeDiv[0], $inputPost[0], $inputAddress[0], $inputDetailAddress[0], $inputHidden[0]);
            });

            this.$forms[formID] = {form: $inputHidden[0], show: ex.Show||false, name: formID, postForm: $inputPost[0],addressForm: $inputAddress[0]};
            this.validForms[formID] = true;
            let answered: {value:string, dt: number, ip: string} = this.answered[formID];
            $inputHidden = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $inputHidden}) as JQuery<HTMLInputElement>;
            if (answered) {
                let addressSplit:Array<string> = answered.value.split('||');
                if (addressSplit.length === 3) {
                    $inputPost[0].value = addressSplit.shift()||'';
                    $inputAddress[0].value = addressSplit.shift()||'';
                    $inputDetailAddress[0].value = addressSplit.shift()||'';
                }
            }
        }
        $exampleWrapper.appendTo($div);
        return $div;
    }

    eventDefault ({ $this }: { $this: JQuery<HTMLInputElement> }): boolean {
        let find = Object.values(this.$forms).find(obj => obj.form.name === $this[0].getAttribute('data-name'));
        if (find) find.form.value = `${find.postForm.value} || ${find.addressForm.value} || ${$this[0].value}`;
        return true;
    }

    getData(): object {
        let surveyData: object = {};

        for(let key in this.$forms) {
            surveyData[key] = '';
        }

        this.$form.serializeArray().forEach(d =>{
            surveyData[d.name] = d.value;
        });
        return surveyData;
    }

    get formCheck() {
        this.valid = true;

        if (this.userFunc) {
            if (this.userFunc.submit) {
                this.validForms = this.userFunc.submit(this.validForms);
            }
        }

        //전체 체크를 푼 경우
        if (this.validForms[this.que.QtnName] === false){
            this.valid = true;
            return this.valid;
        }

        for(let obj of Object.values(this.$forms)) {
            this.formValidDecoration({result: this.valid, dom: obj.postForm});
            if (obj.postForm.value === ''){
                this.valid = false;
                this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
                this.formValidDecoration({result: this.valid, dom: obj.postForm});
                return this.valid;
            }
            this.formValidDecoration({result: this.valid, dom: obj.addressForm});
            if (obj.addressForm.value === ''){
                this.valid = false;
                this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
                this.formValidDecoration({result: this.valid, dom: obj.addressForm});
                return this.valid;
            }
        }
        //
        // let valid = Object.values(this.$forms).find(obj => obj.addressForm.value === '');
        // if (valid) {
        //     this.valid = false;
        //     this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
        //     this.formValidDecoration({result: this.valid, dom: valid.addressForm});
        //     return this.valid;
        // }


        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            this.questionAlert(this.valid);
            if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTime);
        } else {
            this.valid = true;
        }
        return this.valid;
    }


}