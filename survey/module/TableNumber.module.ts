import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import Ex from "../../vo/Ex.vo";
import {GlobalReplacer} from "../../enum/Config";

export class TableNumber extends SurveyModule{
    $forms: {[key: string]: {idx: number, form: HTMLInputElement, name: string, etc: boolean, min: number, max: number}};
    matrix: Array<Ex> = [];
    measure: Array<Ex> = [];
    $matrixRows: {[key:number]: JQuery<HTMLDivElement>} = {};
    $sumForms: {[key:string]: {idx: number, form: HTMLInputElement, name: string}};
    //MARK: 테이블형은 direction 파라미터를 함께 받는다
    //뒤로 가기 시 전체를 보여주기 위해서임.

    constructor({ que, answered, questions, pageUserScript, direction }: { que: Que, answered: object, questions: object, pageUserScript?: string, direction?: boolean }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript, direction: direction});
        this.valid = false;
        this.$forms = {};
        this.$sumForms = {};
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
        console.log(que);
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
        let $exampleContainer:JQuery<HTMLDivElement> = $(`<div class="container-fluid"></div>`);
        $exampleContainer.appendTo(this.$form);
        let $exampleRow:JQuery<HTMLDivElement> = $(`<div class="example-row my-2 row"></div>`);
        $exampleRow.appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        this.matrix = this.examples.filter(ex => ex.ExampleVal>100);
        this.measure = this.examples.filter(ex => ex.ExampleVal<100);

        let $exampleCol:JQuery<HTMLDivElement> = $(`<div class="col-12 py-4"></div>`);
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
            $col.css({'width':`${(100-matrixWidth)/(this.measure.length+1)}%`});
        }
        $col = $(`<div class="d-none d-sm-table-cell border text-center align-middle bg-secondary font-weight-bold p-2">/</div>`).appendTo($row);
        $col.css({'width':`${(100-matrixWidth)/(this.measure.length+1)}%`});

        for(let [idx,ex] of this.matrix.entries()) {
            let formID = `${this.que.QtnName}_${ex.ExampleVal-100}`;
            let unitArray = ex.ExampleText.split('|');
            let unit = unitArray.length === 2 ? unitArray.pop() : '';
            let exampleText: string = unitArray.shift()||ex.ExampleText;
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
            let $matrixLabel: JQuery<HTMLSpanElement> = $(`<span class="d-none d-sm-block px-1 py-2">${this.htmlEntitiesDecode(exampleText)}</span>`);
            $matrixLabel.appendTo($col);

            let $matrixSmallLabel: JQuery<HTMLSpanElement> = $(`<span class="d-block d-sm-none font-weight-bold text-center w-100 bg-secondary px-1 py-2">${this.htmlEntitiesDecode(exampleText)}</span>`);
            $matrixSmallLabel.appendTo($col);

            for(let [idx2,ex2] of this.measure.entries()) {
                let min: number = +this.que.AnsMinVal, max: number = +this.que.AnsMaxVal;
                if(ex.AnsMinVal !== undefined && ex.AnsMinVal) min = ex.AnsMinVal;
                if(ex.AnsMaxVal !== undefined && ex.AnsMaxVal) max = ex.AnsMaxVal;
                $col = $(`<div class="d-block d-sm-table-cell border text-center p-0 m-0 align-middle example-cols-div"></div>`).appendTo($row);
                let $input:JQuery<HTMLInputElement> = $(`<input type="number" min="${min}" max="${max}" name="${formID}" data-idx="${idx}" class="${unit === '' ? 'w-100' : 'w-75'} form-control form-control-sm d-inline-flex"/>`);
                this.$forms[`${formID}_${ex2.ExampleVal}`] = {idx: idx, form: $input[0], name: formID, etc: false, min: min, max: max};
                let $label: JQuery<HTMLDivElement> = $(`<div class="d-block my-1"></div>`);
                $label.appendTo($col);
                //모바일용 LABEL
                let $smallText:JQuery<HTMLSpanElement> = $(`<span class="d-block d-sm-none mb-1">${this.htmlEntitiesDecode(ex2.ExampleText)}</span>`);
                $smallText.appendTo($label);
                $input.appendTo($label);
                if (unit !== '') $(`<span class="number-table-unit w-25">${unit}</span>`).appendTo($label);
                let answered = this.answered[formID];
                $input = this.existsAnswered({exVal: ex2.ExampleVal.toString(), ansVal: answered, $input: $input}) as JQuery<HTMLInputElement>;

                $input.on('keyup',(evt) => {
                    return this.eventDefault({$this: $input, ex: ex2});
                });

                if(idx2 === this.measure.length-1){
                    $col = $(`<div class="d-block d-sm-table-cell border text-center p-0 m-0 align-middle example-cols-div"></div>`).appendTo($row);
                    let $sumInput: JQuery<HTMLInputElement> = $(`<input type="number" min="${min}" max="${max}" class="form-control form-control-sm d-inline-flex border-0 ${unit === '' ? 'w-100' : 'w-75'}" data-idx="${idx}" value="0" readonly/>`);
                    $label = $(`<div class="d-block my-1"></div>`);
                    $label.appendTo($col);
                    $sumInput.appendTo($label);
                    if (unit !== '') $(`<span class="number-table-unit w-25">${unit}</span>`).appendTo($label);
                    this.$sumForms[`${formID}_SUM`] = {idx: idx, form: $sumInput.get(0), name: `${formID}_SUM`};
                }
            }
        }
        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    //KEYUP
    eventDefault ({$this, ex}: { $this: JQuery<HTMLInputElement>, ex: Ex}): boolean {
        let value =  $this.get(0).value;
        let name = $this.get(0).name;
        let idx = $this.get(0).getAttribute('data-idx');
        if (isNaN(+value)) {
        } else {
            let sumObj: {idx: number, form: HTMLInputElement, name: string}|undefined = Object.values(this.$sumForms).find(obj => obj.idx.toString() === idx);
            let sum : number = Object.values(this.$forms).filter(obj => obj.idx.toString() === idx).map(obj => obj.form).reduce((a,b) => {return a + (+b.value)},0);
            if (sumObj) sumObj.form.value = `${sum}`;
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

        for(let key in this.$forms) {
            let obj = this.$forms[key];
            this.validMsg = '';
            let form: HTMLInputElement = obj.form;
            let value = obj.form.value;
            if (value.trim() === '') {
                this.valid = false;
                this.validMsg = this.config.langCls.defaultMsg(obj.name);
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
            }
            if(isNaN(Number(value))){
                this.valid = false;
                this.validMsg =  this.config.langCls.onlyNumberMsg(obj.name);
                obj.form.value = value.replace(/[^0-9]/g,'');
                this.formValidDecoration({result: this.valid, dom: form});
                return this.valid;
            }

            if (!isNaN(Number(obj.min))) {
                if (+obj.min > +value) {
                    this.valid = false;
                    this.validMsg = this.config.langCls.minValueMsg(obj.min);
                    this.formValidDecoration({result: this.valid, dom: form});
                    return this.valid;
                }
            }

            if (!isNaN(Number(obj.max))) {
                if (+obj.max < +value) {
                    this.valid = false;
                    this.validMsg = this.config.langCls.maxValueMsg(obj.max);
                    this.formValidDecoration({result: this.valid, dom: form});
                    return this.valid;
                }
            }
        }

        //합계
        let maxVal: number = +this.que.AnsMaxVal;
        if (maxVal>0) {
            for(let [idx,ex] of this.matrix.entries()) {
                let sum : number = Object.values(this.$forms).filter(obj => obj.idx === idx).map(obj => obj.form).reduce((a,b) => {return a + (+b.value)},0);
                if(sum !== maxVal){
                    this.valid = false;
                    this.validMsg = this.config.langCls.sumValueMsg(this.que.AnsMaxVal);
                    let find: {idx: number, form: HTMLInputElement, name: string}|undefined = Object.values(this.$sumForms).find(obj => obj.idx === idx);
                    if (find) {
                        this.formValidDecoration({result: this.valid, dom: find.form});
                    }
                    return this.valid;
                }
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
