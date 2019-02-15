import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import Ex from "../../vo/Ex.vo";
import {GlobalReplacer} from "../../enum/Config";

export class TableSingle extends SurveyModule{

    $forms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean, show?: boolean}};
    pass: boolean = false;
    matrix: Array<Ex> = [];
    measure: Array<Ex> = [];
    $matrixRows: {[key:number]: JQuery<HTMLDivElement>} = {};
    //MARK: 테이블형은 direction 파라미터를 함께 받는다
    //뒤로 가기 시 전체를 보여주기 위해서임.

    constructor({ que, answered, questions, pageUserScript, direction }: { que: Que, answered: object, questions: object, pageUserScript?: string, direction?: boolean }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript, direction: direction});
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
        let $questionWrapper:JQuery<HTMLDivElement> = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        //TODO: 문항 별로 CUSTOM DOM처리(ex: MBOX)
        if (this.$customDom[GlobalReplacer.MBOX]) this.$customDom[GlobalReplacer.MBOX].appendTo($div);

        let $exampleWrapper:JQuery<HTMLDivElement> = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer:JQuery<HTMLDivElement> = $(`<div class="container"></div>`);
        $exampleContainer.appendTo(this.$form);
        let $exampleRow:JQuery<HTMLDivElement> = $(`<div class="example-row my-2 row"></div>`);
        $exampleRow.appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        this.matrix = this.examples.filter(ex => ex.ExampleVal>100);
        this.measure = this.examples.filter(ex => ex.ExampleVal<100);

        let $exampleCol:JQuery<HTMLDivElement> = $(`<div class="col-12 table-responsive py-4"></div>`);
        $exampleCol.appendTo($exampleRow);
        let $tableDiv:JQuery<HTMLDivElement> = $(`<div class="d-block d-sm-table w-100 h-100" style="border-collapse:collapse;"></div>`);
        $tableDiv.appendTo($exampleCol);

        let $row: JQuery<HTMLDivElement> = $(`<div class="d-none d-sm-table-row"></div>`);
        $row.appendTo($tableDiv);
        let matrixWidth = 40;
        let $col = $(`<div class="d-table-cell border"></div>`).appendTo($row);
        $col.css({'width':`${matrixWidth}%`});
        for(let ex of this.measure) {
            $col = $(`<div class="d-none d-sm-table-cell border text-center align-middle bg-secondary font-weight-bold p-2">${this.htmlEntitiesDecode(ex.ExampleText)}</div>`).appendTo($row);
            $col.css({'width':`${(100-matrixWidth)/this.measure.length}%`});
        }

        let idx = 0;
        for(let ex of this.matrix) {
            let formID = `${this.que.QtnName}_${ex.ExampleVal-100}`;
            //폼 체크 강제로 할 수 있도록..
            this.validForms[formID] = true;
            $row = $(`<div class="d-block d-sm-table-row mb-4 mb-sm-0" data-row="${ex.ExampleVal}" data-idx="${idx}" data-name="${formID}"></div>`);
            $row.appendTo($tableDiv);
            this.$matrixRows[idx] = $row;
            if (ex.hidden === true && this.direction === true) {
                $row.css({'visibility':'hidden','opacity':0}).attr('data-aos',this.aosMode);
                //$row.removeClass('d-block d-sm-table-row').addClass('d-none');
            }
            $col = $(`<div class="d-block d-sm-table-cell border"></div>`).appendTo($row);
            let $matrixLabel: JQuery<HTMLSpanElement> = $(`<span class="d-none d-sm-block px-1 py-2">${this.htmlEntitiesDecode(ex.ExampleText)}</span>`);
            $matrixLabel.appendTo($col);

            let $matrixSmallLabel: JQuery<HTMLSpanElement> = $(`<span class="d-block d-sm-none font-weight-bold text-center w-100 bg-secondary px-1 py-2">${this.htmlEntitiesDecode(ex.ExampleText)}</span>`);
            $matrixSmallLabel.appendTo($col);

            for(let ex2 of this.measure) {
                $col = $(`<div class="d-block d-sm-table-cell border text-center p-0 m-0 align-middle example-cols-div"></div>`).appendTo($row);
                let $label:JQuery<HTMLLabelElement> = $(`<label class="w-100 h-100 align-middle text-left text-sm-center m-0 p-2 p-sm-0 example-label example-label-matrix"></label>`);
                $label.appendTo($col);
                let $radio:JQuery<HTMLInputElement> = $(`<input type="radio" name="${formID}" value = "${ex2.ExampleVal}" data-idx="${idx}"/>`);
                this.$forms[`${formID}_${ex2.ExampleVal}`] = {form: $radio[0], name: formID, etc: false};
                $radio.appendTo($label);
                $radio.on('click', (evt) => {
                    this.eventDefault({$this: $radio, ex: ex})
                });

                //모바일용 LABEL
                let $smallText:JQuery<HTMLSpanElement> = $(`<span class="d-inline-flex d-sm-none ml-1">${this.htmlEntitiesDecode(ex2.ExampleText)}</span>`);
                $smallText.appendTo($label);
                let answered = this.answered[formID];
                $radio = this.existsAnswered({exVal: ex2.ExampleVal.toString(), ansVal: answered, $input: $radio}) as JQuery<HTMLInputElement>;
            }
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
        //색상 적용
        this.$matrixRows[idx].find('div.example-cols-div').removeClass('selected');
        $this.closest('div.example-cols-div').addClass(checked ? 'selected' : '').removeClass(!checked ? 'selected': '');

        if (checked) {
            if (this.$matrixRows[idx+1]) {
                if (this.$matrixRows[idx+1].css('visibility') === 'hidden') {
                    this.$matrixRows[idx+1].css({'visibility':'visible','opacity':1.0});
                    //스크롤
                }
                //this.$matrixRows[idx+1].get(0).scrollIntoView();
                /*
                if (this.$matrixRows[idx+1].hasClass('d-none')) {
                    this.$matrixRows[idx+1].addClass('d-block d-sm-table-row').removeClass('d-none');
                }*/
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
        //MARK: 값이 있던 없던 빈 칼럼이라도 데이터 저장
        let surveyData : object = Array.from(this.getModuleColumnSet()).reduce((a,b) => {
            a[b] = '';
            return a;
        }, Object.create(null));

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
                $div[0].className = 'd-block d-sm-table-row mb-4 mb-sm-0 bg-warning text-white';
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
