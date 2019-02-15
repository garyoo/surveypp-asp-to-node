import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class QuotaCheck extends SurveyModule{
    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1"></span></div>`) as JQuery<HTMLDivElement>;
        $questionWrapper.append(this.htmlEntitiesDecode(this.que.QuestionText));
        $questionWrapper.appendTo($div);
        this.$questionWrapper = $questionWrapper;
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded12"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;

        for(let ex of this.que.Examples) {
            let col = 12;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`);
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            //응답값이 있다면 체크
            let $label = $(`<label class="example-label example-label-radio ml-1 my-0 text-left" for="${formID}"></label>`);
            $label.appendTo($example);
            $label.text(ex.ExampleText);
            if (ex.Checked) $label.addClass('text-danger font-weight-bold');
            $example.appendTo($exampleRow);
        }
        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    getData(): object {
        let surveyData: object = {[this.que.QtnName]: true};
        return surveyData;
    }

    get formCheck() {
        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTime);
        } else {
            this.valid = true;
        }
        return this.valid;
    }
}


export class QuotaOver extends SurveyModule{
    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false"></div>`);
        $(`<div class="alert alert-secondary border">${this.que.QuestionText}</div>`).appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    getData(): object {
        let surveyData: object = {[this.que.QtnName]: true};
        return surveyData;
    }

    get formCheck() {
        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTime);
        } else {
            this.valid = true;
        }
        return this.valid;
    }
}
