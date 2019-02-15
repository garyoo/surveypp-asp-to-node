import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class TextSingle extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, name: string, checkbox: boolean}};

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
        let $div: JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount > 12) this.que.AnsColCount = 12;
        
        for (let [idx,ex] of this.examples.entries()) {
            let col = 12;
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let min: number = +this.que.AnsMinVal, max: number = +this.que.AnsMaxVal;
            if (ex.AnsMinVal !== undefined && ex.AnsMinVal.valueOf()) min = ex.AnsMinVal;
            if (ex.AnsMaxVal !== undefined && ex.AnsMaxVal.valueOf()) max = ex.AnsMaxVal;
            if (this.que.AnsColCount) col = Math.round(12 / this.que.AnsColCount);
            let text = ex.ExampleText.split('|');
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`).appendTo($exampleRow);
            //보기가 하나일 경우는 문번호를 따라간다.
            if (this.examples.length === 1) formID = `${this.que.QtnName}`;
            let $input;
            let $label;
            if (ex.ExampleVal === this.que.AnsNonVal) {
                $input = $(`<input type="checkbox" name="${formID}" id="${formID}" class="ans-non-cb" value="${ex.ExampleVal}"/>`) as JQuery<HTMLInputElement>;
                $input.get(0).addEventListener('click', (evt) => {
                    return this.eventDefault({$this: $input});
                });
                $label = $(`<label for="${formID}"></label>`) as JQuery<HTMLLabelElement>;
                this.$forms[formID] = {form: $input[0], name: formID, checkbox: true};
            } else if (ex.ExampleVal === this.que.AnsDntknowVal) {
                $input = $(`<input type="checkbox" name="${formID}" id="${formID}" class="ans-dnt-know-cb" value="${ex.ExampleVal}"/>`) as JQuery<HTMLInputElement>;
                $label = $(`<label for="${formID}"></label>`) as JQuery<HTMLLabelElement>;
                $input.get(0).addEventListener('click', (evt) => {
                    return this.eventDefault({$this: $input});
                });
                this.$forms[formID] = {form: $input[0], name: formID, checkbox: true};
            } else {
                $input = $(`<input type="text" class="form-control form-control-sm" name="${formID}" id="${formID}" data-disabled="disabled"/>`) as JQuery<HTMLInputElement>;
                let answered = this.answered[formID];
                $input = this.existsAnswered({
                    exVal: ex.ExampleVal.toString(),
                    ansVal: answered,
                    $input: $input
                }) as JQuery<HTMLInputElement>;
                this.$forms[formID] = {form: $input[0], name: formID, checkbox: false};
                //응답제어 옵션 값만큼 폼 체크
                this.validForms[formID] = this.que.ResponseCntForce>idx;
            }
            if (text.length === 2) {
                $(`<span class="mr-1 example-head">${this.htmlEntitiesDecode(text.shift() as string)}</span>`).appendTo($label || $example);
                if ($input) $input.appendTo($example);
                $(`<span class="ml-1 example-trail">${this.htmlEntitiesDecode(text.shift() as string)}</span>`).appendTo($label || $example);
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

    eventDefault ({ $this }: { $this: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        if (checked) {
            //다른 체크박스들이 있으면 풀고.
            let find = Object.values(this.$forms).find(obj => obj.form !== $this.get(0) && obj.checkbox && obj.form.checked);
            if (find) find.form.checked = !checked;
            Object.values(this.$forms).filter(obj => !obj.checkbox).forEach(obj => {
                obj.form.value = '';
                obj.form.disabled = checked;
                this.validForms[obj.name] = !checked;   //INPUT TEXT 검증
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
                break;
            }
            //MARK: 언어별로 정규식 구분
            let regExp = this.config.langCls.inputTextRegExp();
            if ((!value.match(regExp)) && (this.validForms[key] === true)) {
                this.valid = false;
                this.validMsg = this.config.langCls.onlyCharMsg(name);
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
            }
        }

        //전체 체크를 푼 경우
        if (this.validForms[this.que.QtnName] === false){
            this.valid = true;
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
