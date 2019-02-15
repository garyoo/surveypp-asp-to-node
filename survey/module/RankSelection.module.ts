import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import Ex from "../../vo/Ex.vo";
import ClickEvent = JQuery.ClickEvent;

export class RankSelection extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean, hidden: boolean}};
    $nonCheckbox?: JQuery<HTMLInputElement>;
    $rankDivObject: {[key:number]: {$div:JQuery<HTMLDivElement>, name: string}};
    rankValues: Array<Ex>;
    $focus?: HTMLInputElement;

    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.valid = false;
        this.$forms = {};
        this.$rankDivObject = {};
        this.rankValues = [];
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

        //RANK AREA
        let $rankWrapper = $(`<div class="alert alert-secondary border container-fluid rank-wrapper"></div>`).appendTo($div);
        if (this.que.ResponseCount) {
            for(let idx=1;this.que.ResponseCount>=idx;idx++) {
                let formID = `${this.que.QtnName}_${idx}`;
                let $row = $(`<div class="row"></div>`).appendTo($rankWrapper);
                let $rankCol = $(`<div class="col-12 col-sm-2"></div>`).appendTo($row);
                let $rankLabel = $(`<span class="rank-label rank-${idx}"></span>`).text(this.config.langCls.rankLabel(idx));
                $rankLabel.appendTo($rankCol);
                let $rankDiv = $(`<div class="col-12 col-sm-10 font-weight-bold" data-form-id="${formID}"></div>`) as JQuery<HTMLDivElement>;
                $rankDiv.appendTo($row);
                let $hidden = $(`<input type="hidden" name="${formID}"/>`) as JQuery<HTMLInputElement>;
                this.$forms[formID] = {form: $hidden[0], name: formID, etc: false, hidden: true};
                this.validForms[formID] = true;
                $hidden.appendTo(this.$form);
                this.$rankDivObject[idx] = {$div: $rankDiv, name: formID};
            }
        }


        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        for(let ex of this.examples) {
            let col = 12;
            //REPLACE METHOD
            let formID: string = `checkbox_${this.que.QtnName}_${ex.ExampleVal}`;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            //카테고리
            if (ex.ExampleVal>10000) {
                let $example = $(`<div class="example-cols my-1 col-12 form-group font-weight-bold" oncontextmenu="return false;"></div>`);
                $example.html($('<div></div>').html(ex.ExampleText).text());
                $example.appendTo($exampleRow);
            } else {
                let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group" oncontextmenu="return false;"></div>`);
                let $checkbox = $(`<input type="checkbox" name="${formID}" value="${ex.ExampleVal}" id="${formID}" />`) as JQuery<HTMLInputElement>;
                let $label = $(`<label class="example-label example-label-radio ml-1 my-0" for="${formID}"></label>`);
                $checkbox.appendTo($example);
                if (ex.Show) this.$forms[formID] = {form: $checkbox[0], name: formID, etc: false, hidden: false};
                if (this.$focus === undefined) this.$focus = $checkbox[0];
                $label.appendTo($example);
                $label.html(this.htmlEntitiesDecode(ex.ExampleText));
                $checkbox.on('click', (evt)=>{
                    return this.eventDefault({$this: $checkbox, ex: ex, evt: evt});
                });

                //기타 항목
                //TODO: ETC 이름 규칙 확인
                if (this.que.AnsEtcOpen && this.findEtcValue(ex.ExampleVal)) {
                    let etcFormID = `${this.que.QtnName}_${ex.ExampleVal}_etc`;
                    let $etc = $(`<input type="text" name="${etcFormID}" id="${etcFormID}" class="form-control form-control-sm ml-1" disabled data-disabled="disabled"/>`) as JQuery<HTMLInputElement>;
                    //기타 값 불러오기
                    if (this.answered[etcFormID]) $etc.val(this.answered[etcFormID].value);
                    this.$forms[etcFormID] = {form: $etc[0], name: etcFormID, etc: true, hidden: false};
                    $etc.appendTo($example);
                    $checkbox.on('click', (evt)=>{
                        return this.eventEtcOpenYN({$this: $checkbox, $targetForm: $etc});
                    });
                }

                //없음인 경우
                if (this.que.AnsNonVal.toString() === ex.ExampleVal.toString()) {
                    this.$nonCheckbox = $checkbox;
                    $checkbox.on('click', (evt)=>{
                        return this.eventNonClick({ $this: $checkbox });
                    });
                }

                if (ex.Show)$example.appendTo($exampleRow);
            }
    }
        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        //폼 체크 강제로 할 수 있도록..
        if (this.que.ResponseCount) {
            for(let i=1; i<=this.que.ResponseCount;i++) {
                let formID = `${this.que.QtnName}_${i}`;
                //응답한 경우 찍어주기
                //순위형인 경우 예외처리됨
                let answered = this.answered[formID];
                if (answered) {
                    if (answered.value) {
                        if (this.$forms[`checkbox_${this.que.QtnName}_${answered.value}`]) {
                            this.$forms[`checkbox_${this.que.QtnName}_${answered.value}`].form.click();
                        }
                    }
                }
                if (this.que.ResponseCntForce) {
                    if (this.que.ResponseCntForce < i) {
                        this.validForms[formID] = false;
                    }
                }
            }
        }
        return $div;
    }

    getData(): object {
        let surveyData: object = {};
        let filtered = Object.values(this.$forms).filter(obj => obj.hidden);
        filtered.forEach(item => {
            surveyData[item.name] = item.form.value;
        });
        return surveyData;
    }

    eventDefault ({ $this, ex, evt }: { $this: JQuery<HTMLInputElement>, ex: Ex, evt: ClickEvent }): boolean {
        let checked = $this.is(':checked');
        if (checked) {
            if (this.rankValues.length >= this.que.ResponseCount) {
                alert(`${this.config.langCls.maxRankMsg(this.que.QtnName, this.que.ResponseCount)}`);
                evt.preventDefault();
                return false;
            }
            if(this.rankValues.find(e => e.Eidx === ex.Eidx)) {

            }
            this.rankValues.push(ex);
        } else {
            let find = this.rankValues.findIndex(e => e.Eidx === ex.Eidx);
            if(find !== -1) {
                this.rankValues.splice(find,1);
            }
        }

        for(let key in this.$rankDivObject) {
            this.$rankDivObject[key].$div.empty();
            this.$forms[this.$rankDivObject[key].name].form.value = '';
        }

        this.rankValues.forEach ((rank, idx) => {
            this.$rankDivObject[idx+1].$div.html($('<div></div>').html(rank.ExampleText).text());
            this.$forms[this.$rankDivObject[idx+1].name].form.value = rank.ExampleVal.toString();
        });

        return true;
    }

    eventEtcOpenYN ({ $this, $targetForm }: { $this: JQuery<HTMLInputElement>, $targetForm: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        $targetForm[0].disabled = !checked;
        if (!checked) $targetForm[0].value = '';
        return true;
    }

    eventNonClick ({ $this }: { $this: JQuery<HTMLInputElement> }):boolean {
        for (let key in this.$forms) {
            let form = this.$forms[key].form as HTMLInputElement;
            if(form !== $this[0]){
                let type = form.getAttribute('type');
                if (type === 'checkbox') {
                    form.checked = false;
                } else if (type ==='text') {
                    form.value = '';
                    if (form.getAttribute('data-disabled')) form.disabled = true;
                }
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

        //전체 체크를 푼 경우
        if (this.validForms[this.que.QtnName] === false){
            this.valid = true;
            return this.valid;
        }

        //순위형 폼체크
        if (!Object.values(this.validForms).filter(val => val).length){
            this.valid = true;
            return this.valid;
        }

        if (this.rankValues.length < this.que.ResponseCntForce) {
            this.valid = false;
            this.validMsg = this.config.langCls.minSelect(this.que.QtnName, this.que.ResponseCntForce);
            if (this.$focus)  this.formValidDecoration({result: this.valid, dom: this.$focus});

            return this.valid;
        }

        if (this.rankValues.length > this.que.ResponseCount) {
            this.valid = false;
            this.validMsg = this.config.langCls.maxSelect(this.que.QtnName, this.que.ResponseCount);
            if (this.$focus)  this.formValidDecoration({result: this.valid, dom: this.$focus});
            return this.valid;
        }

        let etcForms = Object.values(this.$forms).filter(obj => obj.etc);
        if (etcForms.length) {
            let etc = etcForms.find(obj => obj.form.value === '' && obj.form.disabled === false);
            if (etc) {
                this.valid = false;
                this.validMsg = this.config.langCls.needEtcMsg(etc.name);
                this.formValidDecoration({result: this.valid, dom: etc.form});
                return this.valid;
            }
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
