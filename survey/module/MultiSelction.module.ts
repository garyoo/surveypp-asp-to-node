import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class MultiSelection extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean, checkbox: boolean}};
    $nonCheckbox?: JQuery<HTMLInputElement>;
    $dntKnowCheckbox?: JQuery<HTMLInputElement>;

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
        //QUESTION
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
            //REPLACE METHOD
            let formID: string = `${this.que.QtnName}_${ex.ExampleVal}`;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group" oncontextmenu="return false;"></div>`);
            let $checkbox = $(`<input type="checkbox" name="${formID}" value="${ex.ExampleVal}" id="${formID}" />`) as JQuery<HTMLInputElement>;
            this.$forms[`${formID}`] = {form: $checkbox[0], name: formID, etc: false, checkbox: true};
            let $label = $(`<label class="example-label example-label-checkbox ml-1 my-0" for="${formID}"></label>`);
            $checkbox.appendTo($label);
            $label.appendTo($example);
            let $span = $(`<span class="ml-1 example-span" data-form-id="${formID}"></span>`).html(this.htmlEntitiesDecode(ex.ExampleText));
            $span.appendTo($label);
            //$label.html(this.htmlEntitiesDecode(ex.ExampleText));
            $checkbox.on('click', (evt)=>{
                return this.eventDefault({$this: $checkbox});
            });

            //기타 항목
            //TODO: ETC 이름 규칙 확인
            if (this.que.AnsEtcOpen && this.findEtcValue(ex.ExampleVal)) {
                let etcFormID = `${this.que.QtnName}_${ex.ExampleVal}_etc`;
                let $etc = $(`<input type="text" name="${etcFormID}" id="${etcFormID}" class="form-control form-control-sm ml-1" disabled data-disabled="disabled"/>`) as JQuery<HTMLInputElement>;
                this.$forms[etcFormID] = {form: $etc[0], name: etcFormID, etc: true, checkbox: false};
                this.validForms[etcFormID] = true;
                $etc.appendTo($example);
                $checkbox.on('click', (evt)=>{
                    return this.eventEtcOpenYN({$this: $checkbox, $targetForm: $etc});
                })
            }

            //모름인 경우
            if (this.que.AnsDntknowVal === ex.ExampleVal) {
                this.$dntKnowCheckbox = $checkbox;
                $checkbox.on('click', (evt)=>{
                    return this.eventDefault({ $this: $checkbox });
                });
            }            

            //없음인 경우
            if (this.que.AnsNonVal === ex.ExampleVal) {
                this.$nonCheckbox = $checkbox;
                $checkbox.on('click', (evt)=>{
                    return this.eventDefault({ $this: $checkbox });
                });
            }
            if (ex.Show)$example.appendTo($exampleRow);
            let answered = this.answered[formID];
            $checkbox = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $checkbox}) as JQuery<HTMLInputElement>;
            this.validForms[formID] = ex.Show; //부분적으로 체크를 풀 때
        }
        $exampleWrapper.appendTo($div);
        this.validForms[this.que.QtnName] = this.examples.find(ex=> ex.Show? true: false) ? true : false;    //전체를 풀때
        this.domHtml = $div[0].outerHTML;
        return $div;
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

    eventDefault ({ $this }: { $this: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        if (checked) {
            if(($this !== this.$dntKnowCheckbox)) {
                if (this.$dntKnowCheckbox) this.$dntKnowCheckbox[0].checked = false;
            }
            if($this !== this.$nonCheckbox) {
                if (this.$nonCheckbox) this.$nonCheckbox[0].checked = false;
            }
            if(($this === this.$dntKnowCheckbox) || ($this === this.$nonCheckbox)) {
                for (let key in this.$forms) {
                    let form: HTMLInputElement = this.$forms[key].form;
                    if(form !== $this[0]){
                        if (this.$forms[key].checkbox) {
                            form.checked = false;
                        } else if(this.$forms[key].etc) {
                            form.value = '';
                            if (form.getAttribute('data-disabled')) form.disabled = true;
                        }
                    }
                }
            }
        }
        return true;
    }

    eventEtcOpenYN ({ $this, $targetForm }: { $this: JQuery<HTMLInputElement>, $targetForm: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        $targetForm[0].disabled = !checked;
        if (!checked) $targetForm[0].value = '';
        return true;
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
        let formCb = Object.values(this.$forms).filter(obj => !obj.etc  && this.validForms[obj.name]).map(obj => obj.form as HTMLInputElement);
        let checked = formCb.find(cb => cb.checked);
        if (!checked) {
            this.valid = false;
            let focus = formCb.find(cb => !cb.checked);
            this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
            if (focus) this.formValidDecoration({result: this.valid, dom: focus});
            return this.valid;
        }

        let etcValid = Object.values(this.$forms).find(obj => obj.etc && obj.form.value === '' && !obj.form.disabled);
        if (etcValid) {
                this.valid = false;
                etcValid.form.focus();
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
