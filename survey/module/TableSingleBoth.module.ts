import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import Ex from "../../vo/Ex.vo";

export class TableSingleBoth extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean, show?: boolean}};
    matrix: Array<Ex> = [];
    measure: Array<Ex> = [];
    $matrixRows: {[key:number]: JQuery<HTMLDivElement>} = {};

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

        //QUESTION
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        this.matrix = this.examples.filter(ex => ex.ExampleVal>100);
        this.measure = this.examples.filter(ex => ex.ExampleVal<100);
        let $exmapleCol = $(`<div class="col-12 table-responsive py-4"></div>`).appendTo($exampleRow);
        let $tableDiv = $(`<div class="d-table w-100 h-100" style="border-collapse: collapse"></div>`).appendTo($exmapleCol);

        let $row = $(`<div class="d-table-row"></div>`) as JQuery<HTMLDivElement>;
        $row.appendTo($tableDiv);
        let matrixWidth = 20;
        let $col = $(`<div class="d-table-cell border"></div>`).appendTo($row);
        $col.css({'width':`${matrixWidth}%`});
        for(let ex of this.measure) {
            $col = $(`<div class="d-table-cell border text-center align-middle bg-secondary font-weight-bold p-2"></div>`).appendTo($row);
            $col.html($('<div></div>').html(ex.ExampleText).text());
            $col.css({'width':`${(100-(matrixWidth*2))/this.measure.length}%`});
        }
        $col = $(`<div class="d-table-cell border"></div>`).appendTo($row);
        $col.css({'width':`${matrixWidth}%`});

        let idx = 0;
        for(let ex of this.matrix) {
            let formID = `${this.que.QtnName}_${ex.ExampleVal-100}`;
            //폼 체크 강제로 할 수 있도록..
            this.validForms[formID] = true;
            let exSplit = ex.ExampleText.split('|');
            $row = $(`<div class="d-table-row h-100" data-row="${ex.ExampleVal}" data-idx="${idx}" data-name="${formID}"></div>`) as JQuery<HTMLDivElement>;
            $row.appendTo($tableDiv);
            this.$matrixRows[idx] = $row;
            if (ex.hidden === true && this.direction === true) {
                $row.removeClass('d-table-row').addClass('d-none');
            }
            $col = $(`<div class="d-table-cell border px-1 py-2 align-middle text-center"></div>`).appendTo($row);
            $col.html($('<div></div>').html(exSplit[0]).text());
            for(let ex2 of this.measure) {
                $col = $(`<div class="d-table-cell border text-center h-100 p-0 m-0 align-middle"></div>`).appendTo($row);
                let $label = $(`<label class="w-100 h-100 align-middle text-center m-0 p-0 example-label example-label-matrix"></label>`).appendTo($col);
                let $radio = $(`<input type="radio" name="${formID}" value = "${ex2.ExampleVal}" data-idx="${idx}"/>`) as JQuery<HTMLInputElement>;
                this.$forms[`${formID}_${ex2.ExampleVal}`] = {form: $radio[0], name: formID, etc: false};
                $radio.appendTo($label);
                $radio.on('click', (evt) => {
                    this.eventDefault({$this: $radio, ex: ex})
                });
                let answered = this.answered[formID];
                $radio = this.existsAnswered({exVal: ex2.ExampleVal.toString(), ansVal: answered, $input: $radio}) as JQuery<HTMLInputElement>;
            }
            $col = $(`<div class="d-table-cell border px-1 py-2 align-middle text-center"></div>`).appendTo($row);
            $col.html($('<div></div>').html(exSplit[1]).text());
            idx += 1;
        }

        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    eventDefault ({ $this, ex}: { $this: JQuery<HTMLInputElement>, ex: Ex}): boolean {
        let checked = $this.is(':checked');
        let idx = Number($this[0].getAttribute('data-idx'));
        let name = $this[0].getAttribute('name');
        if (checked) {
            if (this.$matrixRows[idx+1]) {
                if (this.$matrixRows[idx+1].hasClass('d-none')) {
                    this.$matrixRows[idx+1].addClass('d-table-row').removeClass('d-none');
                }
            }
            let $div = Object.values(this.$matrixRows).find($div => $div[0].getAttribute('data-name') === name) as JQuery<HTMLDivElement>;
            $div.removeClass('bg-warning text-white');
        }
        return true;
    }

    eventEtcOpenYN ({ $this, $targetForm }: { $this: JQuery<HTMLInputElement>, $targetForm: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        $targetForm[0].disabled = !checked;
        if (!checked) $targetForm[0].value = '';
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

        //검증이 필요한 ROW들만.
        let validQuestions = Object.keys(this.validForms).filter(key => this.validForms[key]);
        let formRadio = Object.values(this.$forms).filter(obj => !obj.etc);

        for(let questionName of validQuestions) {
            let $div = Object.values(this.$matrixRows).find($div => $div[0].getAttribute('data-name') === questionName) as JQuery<HTMLDivElement>;
            $div.removeClass('bg-warning text-white');
            let checked = formRadio.filter(obj => questionName === obj.name).find(obj => obj.form.checked);
            if (checked === undefined) {
                this.valid = false;
                $div.addClass('bg-warning text-white d-table-row').removeClass('d-none');
                let focus = Object.values(this.$forms).find(obj => obj.name === questionName);
                this.validMsg = this.config.langCls.defaultMsg(questionName);
                if (focus) this.formValidDecoration({result: this.valid, dom: focus.form});
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
