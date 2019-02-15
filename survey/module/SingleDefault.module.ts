import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import ClickEvent = JQuery.ClickEvent;

export class SingleDefault extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, show: boolean, name: string, etc?: boolean}} = {}; //전체 INPUT

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
        //let $div:  = $(document.createDocumentFragment());
        //QUESTION
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span></div>`) as JQuery<HTMLDivElement>;
        $questionWrapper.append(this.htmlEntitiesDecode(this.que.QuestionText));
        $questionWrapper.appendTo($div);
        this.$questionWrapper = $questionWrapper;
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded12"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        for(let ex of this.examples) {
            let col = 12;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`);
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let $radio = $(`<input type="radio" name="${this.que.QtnName}" value="${ex.ExampleVal}" id="${formID}"/>`) as JQuery<HTMLInputElement>;
            //응답값이 있다면 체크
            this.$forms[formID] = {form: $radio[0], name: this.que.QtnName, show: ex.Show||false};
            let $label = $(`<label class="example-label example-label-radio ml-1 my-0 text-left" for="${formID}"></label>`);
            $radio.appendTo($label);
            $label.appendTo($example);

            $radio.on('click', (evt) =>{
                this.eventDefault({$this: $radio});
            });
            //findEtcValue
            //TODO: ETC 이름 규칙 확인
            if (this.que.AnsEtcOpen && this.findEtcValue(ex.ExampleVal)) {
                let etcFormID = `${this.que.QtnName}_${ex.ExampleVal}_etc`;
                let $etc = $(`<input type="text" name="${etcFormID}" id="${etcFormID}" class="form-control form-control-sm ml-1" disabled data-disabled="disabled"/>`) as JQuery<HTMLInputElement>;
                //기타값 불러오기
                if (this.answered[etcFormID]) {
                    $etc[0].disabled = false;
                    $etc[0].value = this.answered[etcFormID].value;
                }
                this.$forms[etcFormID] = {form: $etc[0], name: formID, etc: true, show: true};
                this.validForms[etcFormID] = true;
                $etc.appendTo($example);
                $radio.on('click', (evt)=>{
                    return this.eventEtcOpenYN({evt: evt, $this: $radio, $targetForm: $etc});
                });
            }
            let $span = $(`<span class="ml-1 example-span" data-form-id="${formID}"></span>`).html(this.htmlEntitiesDecode(ex.ExampleText));
            $span.appendTo($label);
            if (ex.Show)$example.appendTo($exampleRow);
            let answered = this.answered[this.que.QtnName];
            $radio = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $radio}) as JQuery<HTMLInputElement>;
        }
        $exampleWrapper.appendTo($div);
        //폼 체크 강제로 할 수 있도록..
        this.validForms = {[this.que.QtnName]: true};
        //선택 가능한 보기가 1개라면.

        if (this.showExamplesCnt === 1) {
            //let find = this.examples.find(ex=> ex.Show);
            //if (find) this.$forms[`${this.que.QtnName}_${find.ExampleVal}`].form.checked = true;
            this.validForms[this.que.QtnName] = false;
        } else if (this.showExamplesCnt === 0) {
            this.validForms[this.que.QtnName] = false;
        }

        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    eventDefault ({ $this }: { $this: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        if (checked) {
            Object.values(this.$forms).filter(obj => obj.etc).forEach(obj => {
                obj.form.value = '';
                obj.form.disabled = true;
            });
        }
        return true;
    }

    eventEtcOpenYN ({ evt,  $this, $targetForm }: {evt: ClickEvent, $this: JQuery<HTMLInputElement>, $targetForm: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        $targetForm[0].disabled = !checked;
        if (!checked)$targetForm[0].value = '';
        return true;
    }

    getData(): object {
        let surveyData: object = {};
        this.$form.serializeArray().forEach(d =>{
            surveyData[d.name] = d.value;
        });
        return surveyData;
    }

    getNextRoutes(): {route: string, outMarker: string} {
        for(let d of this.$form.serializeArray()) {
            let routes = this.examples.find(ex => ex.ExampleVal.toString() === d.value);
            if(routes) return {route: routes.SkipByExample, outMarker: `${d.name}=${d.value}`};
        }
        return {route: '', outMarker: ''};
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

        let validQuestions = Object.keys(this.validForms);
        //FORM RADIO 검사
        let valid = validQuestions.find(questionNumber => {
            let forms = Object.values(this.$forms).filter(obj => obj.name === questionNumber).map(obj => obj.form);
            let checked = forms.find(form => form.checked);
            if (checked) return true;
            return false;
        });


        if (!valid) {
            this.valid = false;
            this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
            let focus = Object.values(this.$forms).find(obj => !obj.etc && obj.show);
            if (focus) this.formValidDecoration({result: this.valid, dom: focus.form});
            return this.valid;
        }

        //FORM 기타 검사
        if (Object.values(this.$forms).filter(obj => obj.etc).length) {
            let etc = Object.values(this.$forms).filter(obj => obj.etc)
                        .map(obj => {
                            this.formValidDecoration({result: true, dom: obj.form});
                            return obj.form;
                        }).find ( $input => {
                return $input.value === '' && $input.disabled === false
            });
            if (etc) {
                this.valid = false;
                this.validMsg = this.config.langCls.needEtcMsg(this.que.QtnName);
                this.formValidDecoration({result: this.valid, dom: etc});
                return this.valid;
            }
        }

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
