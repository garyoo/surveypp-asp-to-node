import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class SingleDropDown extends SurveyModule{

    $forms: {[key: string]: {form: HTMLSelectElement, name: string, show?: boolean}};
    $etcTexts: Array<HTMLInputElement>;
    pass: boolean = false;

    constructor({ que, answered, questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript});
        this.valid = false;
        this.$forms = {};
        this.$etcTexts = [];
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;

        //QUESTION
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        let col = 12;
        if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
        let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`);
        $example.appendTo($exampleRow);
        let formID = `${this.que.QtnName}`;
        let $select = $(`<select  name="${formID}" class="form-control form-control-sm"></select>`) as JQuery<HTMLSelectElement>;
        $select.appendTo($example);
        this.$forms[formID] = {form: $select[0], name: formID};

        $select.on('change', (evt) =>{
            this.eventDefault({$this: $select});
        });
        $(`<option value="">----</option>`).appendTo($select);
        let answered = this.answered[this.que.QtnName];
        for(let ex of this.examples) {
            let $option = $(`<option value="${ex.ExampleVal}">${ex.ExampleText}</option>`);
            $option.appendTo($select);
            $option = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $option}) as JQuery<HTMLOptionElement>;
        }
        this.validForms[formID] = true;
        $exampleWrapper.appendTo($div);

        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    eventDefault ({ $this }: { $this: JQuery<HTMLSelectElement> }): boolean {
        return true;
    }

    eventEtcOpenYN ({ $this, $targetForm }: { $this: JQuery<HTMLInputElement>, $targetForm: JQuery<HTMLInputElement> }): boolean {
        return true;
    }

    getData(): object {
        let surveyData: object = {};
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

        this.valid = true;
        let formSelect = Object.values(this.$forms)
            .filter(obj => this.validForms[obj.name])
            .map(obj => {
                this.formValidDecoration({result: true, dom: obj.form});
                return obj.form as HTMLSelectElement;
            });
        let noAnswered = formSelect.find(form => form.value.trim() === '');
        if (noAnswered) {
            this.valid = false;
            this.validMsg = this.config.langCls.defaultMsg(noAnswered.getAttribute('name') || this.que.QtnName);
            this.formValidDecoration({result: this.valid, dom: noAnswered});
            return this.valid;
        }

        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTime);
        } else {
            this.valid = true;
        }
        return this.valid;
    }
}
