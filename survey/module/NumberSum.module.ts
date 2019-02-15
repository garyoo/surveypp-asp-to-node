import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import KeyUpEvent = JQuery.KeyUpEvent;

export class NumberSum extends SurveyModule{
    $forms: {[key: string]: {min: number, max: number, form: HTMLInputElement, name: string, checkbox: boolean, total?: boolean}};
    $sumInput: JQuery<HTMLInputElement>;
    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.valid = false;
        this.$forms = {};
        this.$sumInput = $(`<input type="number" class="form-control form-control-sm" name="${que.QtnName}_TOTAL" id="${que.QtnName}_TOTAL" value="0" readonly/>`);
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }



    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper: JQuery<HTMLDivElement> = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;

        let headers: Array<HTMLSpanElement> = [];

        for(let [idx, ex] of this.examples.entries()) {
            let col = 12;
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let min: number = +this.que.AnsMinVal, max: number = +this.que.AnsMaxVal;
            if(ex.AnsMinVal !== undefined && ex.AnsMinVal.valueOf()) min = ex.AnsMinVal;
            if(ex.AnsMaxVal !== undefined && ex.AnsMaxVal.valueOf()) max = ex.AnsMaxVal;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let text= ex.ExampleText.split('|');
            let $example:JQuery<HTMLDivElement> = $(`<div class="example-cols my-1 col-12 col-sm-${col} d-block form-group"></div>`);
            $example.appendTo($exampleRow);

            //보기가 하나일 경우는 문번호를 따라간다.
            if(this.examples.length === 1)formID = `${this.que.QtnName}`;
            let $input: JQuery<HTMLInputElement>;
            let $label: JQuery<HTMLLabelElement>|null = null;

            if (ex.ExampleVal === this.que.AnsNonVal) {
                $input = $(`<input type="checkbox" name="${formID}" id="${formID}" class="ans-non-cb" value="${ex.ExampleVal}"/>`);
                $input.get(0).addEventListener('click', (evt) => {
                    return this.eventDefault({$this: $input});
                });
                $label = $(`<label for="${formID}"></label>`);
                this.$forms[formID] = {min: min, max: max, form: $input[0], name: formID, checkbox: true};
            } else if(ex.ExampleVal === this.que.AnsDntknowVal) {
                $input = $(`<input type="checkbox" name="${formID}" id="${formID}" class="ans-dnt-know-cb" value="${ex.ExampleVal}"/>`);
                $label = $(`<label for="${formID}"></label>`) as JQuery<HTMLLabelElement>;
                $input.get(0).addEventListener('click', (evt) => {
                    return this.eventDefault({$this: $input});
                });
                this.$forms[formID] = {min: min, max: max, form: $input[0], name: formID, checkbox: true};
            } else {
                $input = $(`<input type="number" class="form-control form-control-sm" name="${formID}" id="${formID}" pattern="[0-9]*" min="${min}" max="${max}" maxlength="${max.toString().length}"/>`) as JQuery<HTMLInputElement>;
                $input.on('keyup', (evt) => {
                    return this.eventSum($input, evt);
                });
                let answered = this.answered[formID];
                $input = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $input}) as JQuery<HTMLInputElement>;
                this.$forms[formID] = {min: min, max: max, form: $input[0], name: formID, checkbox: false};
                //폼 체크 강제로 할 수 있도록..
                this.validForms[formID] = true;
            }
            if(text.length === 2 ){
                let $lead: JQuery<HTMLSpanElement> = $(`<span class="mr-1 example-head d-inline-block font-weight-bold">${this.htmlEntitiesDecode(text.shift() as string)}</span>`);
                $lead.appendTo($label||$example);
                headers.push($lead[0]);
                if ($input) $input.appendTo($example);
                let $trail: JQuery<HTMLSpanElement> = $(`<span class="ml-1 example-trail d-inline-block">${this.htmlEntitiesDecode(text.shift() as string)}</span>`);
                $trail.appendTo($label||$example);
            } else {
                if ($label) {
                    if ($input) $input.appendTo($label);
                    $(`<span class="ml-1 example-trail example-span">${this.htmlEntitiesDecode(ex.ExampleText)}</span>`).appendTo($label);
                    $label.appendTo($example);
                } else {
                    if ($input) $input.appendTo($example);
                    $(`<span class="ml-1 example-trail">${this.htmlEntitiesDecode(ex.ExampleText)}</span>`).appendTo($example);
                }
            }
            if (idx === this.examples.length-1) {
                let $example:JQuery<HTMLDivElement> = $(`<div class="border-top example-cols my-1 col-12 form-group py-1 text-right d-block align-middle"></div>`);
                $example.appendTo($exampleRow);
                $example.append(`<span class="sum-desc font-weight-bold">TOTAL: </span>`);
                this.$sumInput.appendTo($example);
                let answered: {value: string, dt: number, ip: string} = this.answered[`${this.que.QtnName}_TOTAL`];
                if(answered)this.$sumInput[0].value = answered.value;
                this.$forms[`${this.que.QtnName}_TOTAL`] = {min: min, max: max*this.examples.length, form: this.$sumInput[0], name: `${formID}_TOTAL`, checkbox: false, total: true};
            }
        }

        $(document).ready(() => {
            let maxWidth = Math.max.apply(null, headers.map(h => h.offsetWidth));
            headers.forEach(span => span.style.width = `${maxWidth*1.2}px`);
        });

        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    eventDefault ({ $this }: { $this: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        if (checked) {
            //다른 체크박스들이 있으면 풀고.
            let find = Object.values(this.$forms).find(obj => obj.form !== $this.get(0) && obj.checkbox && obj.form.checked);
            if (find) find.form.checked = !checked;
            Object.values(this.$forms).filter(obj => !obj.checkbox).forEach(obj => {
                obj.form.value = '';
                obj.form.disabled = checked;
                this.validForms[obj.name] = !checked;
            });
        } else {
            let find = Object.values(this.$forms).find(obj => obj.form !== $this.get(0) && obj.checkbox && obj.form.checked);
            if (find === undefined) {
                Object.values(this.$forms).filter(obj => !obj.checkbox).forEach(obj => {
                    obj.form.value = '';
                    obj.form.disabled = checked;
                    this.validForms[obj.name] = !checked;
                });
            }
        }
        return true;
    }

    eventSum ($this: JQuery<HTMLInputElement>, evt: KeyUpEvent): boolean {

        let min: number = 0;
        let max: number = Infinity;
        let value: number = isNaN(+$this[0].value) ? 0 : +$this[0].value;
        let findForm = Object.values(this.$forms).find(obj => obj.name === $this[0].name);
        if(findForm) {
            min = findForm.min;
            max = findForm.max;
        }

        $this.siblings('div.number-invalid-feedback').remove();
        if(value < min)$(`<div class="number-invalid-feedback min-number-invalid-feedback" style="font-size:80%;">${this.config.langCls.minValueMsg(min)}</div>`).appendTo($this.closest('div.example-cols'));
        else if(value>max)$(`<div class="number-invalid-feedback max-number-invalid-feedback" style="font-size:80%;">${this.config.langCls.maxValueMsg(max)}</div>`).appendTo($this.closest('div.example-cols'));

        let sum = Object.values(this.$forms)
            .filter(obj => !obj.checkbox && !obj.total)
            .map(obj => obj.form.value ? +obj.form.value : 0)
            .reduce((a,b) => {
                return a + b
            },0);
        this.$sumInput.val(sum);
        return true;
    }

    getData(): object {
        //MARK: 값이 있던 없던 빈 칼럼이라도 데이터 저장
        let dataSet = this.getModuleColumnSet();
        let surveyData : object = Array.from(dataSet).reduce((a,b) => {
            a[b] = '';
            return a;
        }, Object.create(null));
        this.$form.serializeArray().forEach(d =>{
            if (dataSet.has(d.name)) surveyData[d.name] = d.value;
        });
        return surveyData;
    }


    get formCheck() {
        if (this.userFunc) {
            if (this.userFunc.submit) {
                this.validForms = this.userFunc.submit(this.validForms);
            }
        }

        this.valid = true;
        for(let key in this.$forms) {
            let obj = this.$forms[key];
            this.validMsg = '';
            let form: HTMLInputElement = obj.form;
            this.formValidDecoration({result: this.valid, dom: form});
            let name = form.name;
            let value = obj.form.value;
            let checkbox = obj.checkbox;
            if (value.trim() === '' && this.validForms[key] === true && !checkbox) {
                this.valid = false;
                this.validMsg = this.config.langCls.defaultMsg(name);
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
            }
            if(isNaN(Number(value)) && !checkbox){
                this.valid = false;
                this.validMsg = this.config.langCls.onlyNumberMsg(name);
                obj.form.value = value.replace(/[^0-9]/g,'');
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
            }

            if (!isNaN(Number(obj.min)) && !checkbox) {
                if (+obj.min > +value) {
                    this.valid = false;
                    this.validMsg = this.config.langCls.minValueMsg(obj.min);
                    this.formValidDecoration({result: this.valid, dom: form});
                    return this.valid;
                }
            }

            if (!isNaN(Number(obj.max)) && !checkbox) {
                if (+obj.max < +value) {
                    this.valid = false;
                    this.validMsg = this.config.langCls.maxValueMsg(obj.max);
                    this.formValidDecoration({result: this.valid, dom: form});
                    return this.valid;
                }
            }
        }

        //합계 비교
        let sum = Object.values(this.$forms)
            .filter(obj => !obj.checkbox && !obj.total)
            .map(obj => obj.form.value ? +obj.form.value : 0)
            .reduce((a,b) => {
                return a + b
            },0);
        if(sum.toString() !== this.$sumInput[0].value.toString()) {
            this.valid = false;
            this.validMsg = this.config.langCls.notMatchSumValueMsg();
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
