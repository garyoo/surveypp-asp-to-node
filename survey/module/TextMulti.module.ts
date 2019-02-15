import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class TextMulti extends SurveyModule{
    $forms: {[key: string]: {form: HTMLTextAreaElement, name: string}};

    constructor({ que, answered, questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript});
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
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
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
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let text= ex.ExampleText.split('|');
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`).appendTo($exampleRow);
            //보기가 하나일 경우는 문번호를 따라간다.
            if(this.examples.length === 1)formID = `${this.que.QtnName}`;
            let $textarea: JQuery<HTMLTextAreaElement>;
            $textarea= $(`<textarea class="form-control form-control-sm w-100" rows="5" name="${formID}" id="${formID}"></textarea>`);
            let answered = this.answered[formID];
            $textarea = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $textarea}) as JQuery<HTMLTextAreaElement>;
            this.$forms[formID] = {form: $textarea[0], name: formID};
            if(text.length === 2 ){
                $(`<span class="mr-1 example-head">${text.shift()}</span>`).appendTo($example);
                $textarea.appendTo($example);
                $(`<span class="ml-1 example-trail">${text.shift()}</span>`).appendTo($example);
            } else {
                $textarea.appendTo($example);
                $(`<span class="ml-1 example-trail">${ex.ExampleText}</span>`).appendTo($example);
            }
            this.validForms[formID] = true; //부분적으로 체크를 풀 때
        }
        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
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

    /*
    * TODO: 텍스트 중복 검사 옵션 추가
    * TODO: 모름, 없음 옵션 추가
    * */

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

        this.valid = true;
        let formTextArea = Object.values(this.$forms)
                            .filter(obj => this.validForms[obj.name])
                            .map(obj => {
                                this.formValidDecoration({result: true, dom: obj.form});
                                return obj.form as HTMLTextAreaElement;
                            });
        let noAnswered = formTextArea.find(form => form.value.trim() === '');
        if (noAnswered) {
            this.valid = false;
            this.validMsg = this.config.langCls.defaultMsg(noAnswered.getAttribute('name') || this.que.QtnName);
            this.formValidDecoration({result: this.valid, dom: noAnswered});
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
