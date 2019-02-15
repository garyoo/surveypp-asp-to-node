import {SurveyModule} from "../SurveyModule";
import {Que} from "../../vo/Que.vo";
import $ from "jquery";

export class NumberUnitConvert extends SurveyModule{
    $forms: {[key: string]: {min: number, max: number, form: HTMLInputElement, name: string}};
    $convertSpan: {[key: string]: {min: number, max: number, form: HTMLSpanElement}};

    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.valid = false;
        this.$forms = {};
        this.$convertSpan = {};
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div: JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        for(let ex of this.examples) {
            let col = 12;
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let $example: JQuery<HTMLElement>;
            let $inputNumber: JQuery<HTMLInputElement>;
            let $convertUnitWrapper: JQuery<HTMLDivElement>;
            let $convertUnitSpan: JQuery<HTMLSpanElement>;

            let min: number = +this.que.AnsMinVal, max: number = +this.que.AnsMaxVal;
            if(ex.AnsMinVal !== undefined && ex.AnsMinVal) min = ex.AnsMinVal;
            if(ex.AnsMaxVal !== undefined && ex.AnsMaxVal) max = ex.AnsMaxVal;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let text= ex.ExampleText.split('|');

            $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group" align="center"></div>`).appendTo($exampleRow);
            //보기가 하나일 경우는 문번호를 따라간다.
            if(this.examples.length === 1)formID = `${this.que.QtnName}`;

            $inputNumber = $(`<input type="number" class="form-control form-control-sm" name="${formID}" id="${formID}" pattern="[0-9]*" min="${min}" max="${max}" maxlength="${max.toString().length}"/>`);
            $convertUnitWrapper = $(`<div class="ml-1 d-none text-danger text-sm-left font-weight-bold" for="${formID}"></div>`);
            $convertUnitSpan = $(`<span class="convert-unit"></span>`);

            this.$forms[formID] = {min: min, max: max, form: $inputNumber[0], name: formID};
            if(text.length === 2 ){
                $(`<span class="mr-1 example-head">${text[0]}</span>`).appendTo($example);
                $inputNumber.appendTo($example);
                $(`<span class="ml-1 example-trail">${text[1]}</span>`).appendTo($example);
                $convertUnitWrapper.appendTo($example);

                //$(`<span class="mr-1 example-head">${text[0]}</span>`).appendTo($convertUnitWrapper);
                $convertUnitSpan.appendTo($convertUnitWrapper);
                $(`<span class="ml-1 example-trail">${this.que.Ansgrade}</span>`).appendTo($convertUnitWrapper);
            } else {
                $inputNumber.appendTo($example);
                $(`<span class="ml-1 example-trail">${ex.ExampleText}</span>`).appendTo($example);

                $convertUnitWrapper.appendTo($example);
                $(`<span class="mr-1 example-head">${ex.ExampleText}</span>`).appendTo($convertUnitWrapper);
                $convertUnitSpan.appendTo($convertUnitWrapper);
            }



            $inputNumber.on('keyup', (evt)=> {
                this.eventKeyUp({ $this: $inputNumber, $target: $convertUnitSpan, $wrapper: $convertUnitWrapper });
            });
        }

        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    eventKeyUp({ $this, $target, $wrapper }: { $this: JQuery<HTMLInputElement>, $target: JQuery<HTMLSpanElement>, $wrapper: JQuery<HTMLDivElement> }): boolean {
        if (isNaN(Number($this[0].value))) return false;
        let value: string;
        value = $this[0].value;
        let valueNumber: number = isNaN(+$this[0].value) ? 0 : +$this[0].value;
        $target[0].innerText = this.replaceNumberToKor((valueNumber * this.que.AnsUnit).toString());
        if(value === ''){
            $wrapper.addClass('d-none');
        } else {
            $wrapper.removeClass('d-none');
        }

        let min: number = 0;
        let max: number = Infinity;

        let findForm = Object.values(this.$forms).find(obj => obj.name === $this[0].name);
        if(findForm) {
            min = findForm.min;
            max = findForm.max;
        }

        $this.siblings('div.number-invalid-feedback').remove();
        if(valueNumber < min)$(`<div class="number-invalid-feedback min-number-invalid-feedback" style="font-size:80%;">${this.config.langCls.minValueMsg(min)}</div>`).appendTo($this.closest('div.example-cols'));
        else if(valueNumber > max)$(`<div class="number-invalid-feedback max-number-invalid-feedback" style="font-size:80%;">${this.config.langCls.maxValueMsg(max)}</div>`).appendTo($this.closest('div.example-cols'));
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
        this.valid = true;
        for(let key in this.$forms) {
            let obj = this.$forms[key];
            this.validMsg = '';
            let form: HTMLInputElement = obj.form;
            let value = obj.form.value;
            if (value.trim() === '') {
                this.valid = false;
                this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
                break;
            }
            if(isNaN(Number(value))){
                this.valid = false;
                this.validMsg =  this.config.langCls.onlyNumberMsg(this.que.QtnName);
                obj.form.value = value.replace(/[^0-9]/g,'');
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
                break;
            }

            if (!isNaN(Number(obj.min))) {
                if (+obj.min > +value) {
                    this.valid = false;
                    this.validMsg = this.config.langCls.minValueMsg(obj.min);
                    this.formValidDecoration({result: this.valid, dom: form});
                    return this.valid;
                    break;
                }
            }

            if (!isNaN(Number(obj.max))) {
                if (+obj.max < +value) {
                    this.valid = false;
                    this.validMsg = this.config.langCls.maxValueMsg(obj.max);
                    this.formValidDecoration({result: this.valid, dom: form});
                    return this.valid;
                    break;
                }
            }
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