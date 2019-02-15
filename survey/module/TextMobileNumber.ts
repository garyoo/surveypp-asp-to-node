import {Que} from "../../vo/Que.vo";
import $ from "jquery";
import {SurveyModule} from "../SurveyModule";
import KeyUpEvent = JQuery.KeyUpEvent;

export class TextMobileNumber extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, name: string, valid: boolean}};

    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.valid = false;
        this.$forms = {};
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        for(let ex of this.examples) {
            let col = 12;
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let min: number = +this.que.AnsMinVal, max: number = +this.que.AnsMaxVal;
            if(ex.AnsMinVal !== undefined && ex.AnsMinVal.valueOf()) min = ex.AnsMinVal;
            if(ex.AnsMaxVal !== undefined && ex.AnsMaxVal.valueOf()) max = ex.AnsMaxVal;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let text= ex.ExampleText.split('|');
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`).appendTo($exampleRow);
            //보기가 하나일 경우는 문번호를 따라간다.
            if(this.examples.length === 1)formID = `${this.que.QtnName}`;
            let $inputNumber: JQuery<HTMLInputElement> = $(`<input type="text" class="form-control form-control-sm" name="${formID}" id="${formID}" pattern="[\d -]+" maxlength="13"/>`);
            let answered = this.answered[formID];
            $inputNumber = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $inputNumber}) as JQuery<HTMLInputElement>;
            $inputNumber.on('keyup', this.onKeyupBind);
            this.$forms[formID] = {form: $inputNumber[0], name: formID, valid: false};
            if(text.length === 2 ){
                $(`<span class="mr-1 example-head">${this.htmlEntitiesDecode(text.shift() as string)}</span>`).appendTo($example);
                $inputNumber.appendTo($example);
                $(`<span class="ml-1 example-trail">${this.htmlEntitiesDecode(text.shift() as string)}</span>`).appendTo($example);
            } else {
                $inputNumber.appendTo($example);
                $(`<span class="ml-1 example-trail">${this.htmlEntitiesDecode(ex.ExampleText)}</span>`).appendTo($example);
            }
            this.validForms[formID] = true;
        }
        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    onKeyupBind(evt: KeyUpEvent){
        if (evt.which === 8 || evt.which === 37 || evt.which === 39) return;
        let match = new RegExp('[^0-9]','g');
        let regExp2 = new RegExp('[^\\d|-]','gi');
        if (evt.originalEvent === undefined) return;
        if (evt.originalEvent.key.match(match)) {
            evt.target.value = evt.target.value.replace(regExp2,'');
            return;
        }
        let value = evt.target.value as string;
        if (value.match(regExp2)) evt.target.value = value.replace(regExp2,'');
        value = evt.target.value.replace(match,'');
        if (value.length < 4) {
        } else if(value.length >3 && value.length < 8) {
            evt.target.value = `${value.replace(match,'').substring(0,3)}-${value.replace(match,'').substring(3,9)}`;
        } else {
            evt.target.value = `${value.replace(match,'').substring(0,3)}-${value.replace(match,'').substring(3,7)}-${value.replace(match,'').substring(7,11)}`;
        }
    }

    getData(): object {
        let surveyData: object = {};

        Object.keys(this.$forms).forEach(key => {
            surveyData[key] = '';
        });

        this.$form.serializeArray().forEach(d =>{
            surveyData[d.name] = d.value;
        });
        return surveyData;
    }

    get formCheck() {
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

        let formInput = Object.values(this.$forms)
            .filter(obj => this.validForms[obj.name])
            .map(obj => {
                this.formValidDecoration({result: true, dom: obj.form});
                return obj.form as HTMLInputElement;
            });
        let noAnswered = formInput.find(form => form.value.trim() === '');
        this.valid = true;
        if (noAnswered) {
            this.valid = false;
            this.validMsg = this.config.langCls.defaultMsg(noAnswered.getAttribute('name') || this.que.QtnName);
            this.formValidDecoration({result: this.valid, dom: noAnswered});
            return this.valid;
        }
        let regExp = new RegExp('(^01.|[0-9]{3})-([0-9]{4})-([0-9]{4})','g');
        let noMobile = formInput.find(form => !regExp.test(form.value.trim()));
        if (noMobile) {
            this.valid = false;
            this.validMsg = this.config.langCls.noMobileNumberMsg(noMobile.getAttribute('name') || this.que.QtnName);
            this.formValidDecoration({result: this.valid, dom: noMobile});
            return this.valid;
        }

        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            if (!this.valid) {
                if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTime);
                return this.valid;
            }
        }

        return this.valid;
    }
}
