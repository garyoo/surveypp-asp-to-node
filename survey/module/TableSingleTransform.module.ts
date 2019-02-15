import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import Ex from "../../vo/Ex.vo";
import ClickEvent = JQuery.ClickEvent;
//TODO: 모바일에서 표형태 다시 그려야함
export class TableSingleTransform extends SurveyModule{

    $forms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean, show?: boolean}};
    $mobileForms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean, show?: boolean}};
    matrix: Array<Ex> = [];
    measure: Array<Ex> = [];
    $matrixCols: {[key:string]: {idx: number, $domArray: Array<JQuery<HTMLDivElement>>}} = {};
    validForms: {[key:string]: {flag: boolean, group: Set<string>}};
    responsiveDivision: string = 'lg';
    $defaultWrapper?: JQuery<HTMLDivElement>;
    $mobileWrapper?: JQuery<HTMLDivElement>;
    //MARK: 테이블형은 direction 파라미터를 함께 받는다
    //뒤로 가기 시 전체를 보여주기 위해서임.

    constructor({ que, answered, questions, pageUserScript, direction }: { que: Que, answered: object, questions: object, pageUserScript?: string, direction?: boolean }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript, direction: direction});
        this.valid = false;
        this.$forms = {};
        this.$mobileForms = {};
        this.validForms = {};
        this.measure = this.examples.filter(ex => ex.ExampleVal>100);
        this.matrix = this.examples.filter(ex => ex.ExampleVal<100);
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        let matrixWidth = 40;
        let $rowsObject = {};        //가로 세로 변환을 위해 $row를 기억하고 있자
        //QUESTION
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;

        let $exampleCol:JQuery<HTMLDivElement> = $(`<div class="col-12 py-4 table-responsive"></div>`);

        let $tableDiv:JQuery<HTMLDivElement> = $(`<div class="d-none d-${this.responsiveDivision}-table w-100 h-100" style="border-collapse:collapse;"></div>`);
        $exampleCol.appendTo($exampleRow);
        $tableDiv.appendTo($exampleCol);
        let $row: JQuery<HTMLDivElement> = $(`<div class="d-block d-${this.responsiveDivision}-table-row"></div>`);
        let $col: JQuery<HTMLDivElement> = $(`<div class="d-none d-${this.responsiveDivision}-table-cell border"></div>`);
        $row.appendTo($tableDiv);
        $col.appendTo($row);
        $col.css({'width':`${matrixWidth}%`});

        for(let [idx,ex] of this.matrix.entries()) {
            let $rowMatrix: JQuery<HTMLDivElement> = $(`<div class="d-block d-${this.responsiveDivision}-table-row mb-4 mb-${this.responsiveDivision}-0 w-100" data-row="${ex.ExampleVal}" data-idx="${idx}"></div>`);
            $rowsObject[idx] = {$dom: $rowMatrix};
        }

        for(let [idx,ex] of this.measure.entries()) {
            let formName: string = `${this.que.QtnName}_${ex.ExampleVal-100}`;
            $col = $(`<div class="d-none d-${this.responsiveDivision}-table-cell border text-center align-middle bg-secondary font-weight-bold p-2">${this.htmlEntitiesDecode(ex.ExampleText)}</div>`);
            $col.appendTo($row);
            $col.css({'width':`${(100-matrixWidth)/this.measure.length}%`});

            //폼 체크 강제로 할 수 있도록..
            //MARK: 다중 체크 이므로.
            this.validForms[`${formName}`] = {flag: true, group: new Set(this.matrix.map(m => `${this.que.QtnName}_${ex.ExampleVal-100}_${m.ExampleVal}`))};
            this.$matrixCols[`${formName}`] = {idx: idx, $domArray: []};
            if (ex.hidden === true && this.direction === true) {
                this.$matrixCols[`${formName}`].$domArray.push($col);
                $col.css({'visibility':'hidden','opacity':0}).attr('data-aos',this.aosMode);
                //$col.removeClass('d-${this.responsiveDivision}-table-cell');
            }

            if (idx === 0) {
                for(let key in $rowsObject) {
                    let obj = $rowsObject[key];
                    obj.$dom.appendTo($tableDiv);
                }
            }

            for(let [idx2,ex2] of this.matrix.entries()) {
                let formID: string = `${formName}_${ex2.ExampleVal}`;
                if ($rowsObject[idx2]) {
                    if (idx === 0){
                        $col = $(`<div class="d-none d-${this.responsiveDivision}-table-cell border"></div>`);
                        $col.appendTo($rowsObject[idx2].$dom);
                        let $matrixLabel = $(`<span class="d-block px-1 py-2"></span>`).html(this.htmlEntitiesDecode(ex2.ExampleText));
                        $matrixLabel.appendTo($col);
                    }

                    $col = $(`<div class="d-block d-${this.responsiveDivision}-table-cell border example-cols-div" data-name="${formName}"></div>`);
                    $col.appendTo($rowsObject[idx2].$dom);

                    if (this.$matrixCols[formName]) this.$matrixCols[formName].$domArray.push($col);
                    if (ex.hidden === true && this.direction === true) {
                        $col.css({'visibility':'hidden','opacity':0}).attr('data-aos',this.aosMode);
                        //$col.removeClass('d-block d-${this.responsiveDivision}-table-cell').addClass('d-none');
                    }

                    let $label: JQuery<HTMLLabelElement> = $(`<label class="w-100 h-100 align-middle text-left text-${this.responsiveDivision}-center m-0 p-2 p-${this.responsiveDivision}-0 example-label example-label-matrix"></label>`);
                    let $radio: JQuery<HTMLInputElement> = $(`<input type="radio" name="${formName}" value = "${ex2.ExampleVal}" data-idx="${idx}" data-name="${formName}" data-view="default"/>`);
                    this.$forms[formID] = {form: $radio[0], name: `${formName}`, etc: false};
                    $radio.on('click', (evt) => {
                        this.eventDefault({$this: $radio, ex: ex, evt: evt})
                    });
                    $label.appendTo($col);
                    $radio.appendTo($label);
                    //모바일용 LABEL
                    let $smallText = $(`<span class="d-inline-flex d-${this.responsiveDivision}-none ml-1"></span>`).appendTo($label);
                    $smallText.html(this.htmlEntitiesDecode(ex2.ExampleText));
                    let answered = this.answered[formID];
                    $radio = this.existsAnswered({exVal: ex2.ExampleVal.toString(), ansVal: answered, $input: $radio}) as JQuery<HTMLInputElement>;
                }
            }
        }

        //모바일용 따로 그려줌
        let $mobileDiv: JQuery<HTMLDivElement> = $(`<div class="d-block d-${this.responsiveDivision}-none w-100 h-100" style="border-collapse:collapse;"></div>`);
        $mobileDiv.appendTo($exampleCol);

        for(let [idx,ex] of this.measure.entries()) {
            let formName: string = `${this.que.QtnName}_${ex.ExampleVal-100}`;
            let $table: JQuery<HTMLDivElement> = $(`<div class="d-table w-100 example-cols-table"></div>`);
            let $tr: JQuery<HTMLDivElement> = $(`<div class="d-table-row"></div>`);
            let $td: JQuery<HTMLDivElement> = $(`<div class="d-table-cell font-weight-bold border bg-secondary p-2 text-center">${this.htmlEntitiesDecode(ex.ExampleText)}</div>`);

            $td.appendTo($tr);
            $tr.appendTo($table);
            $table.appendTo($mobileDiv);
            if (ex.hidden === true && this.direction === true){
                $table.css({'visibility':'hidden','opacity':0}).attr('data-aos',this.aosMode);
            }
            if (this.$matrixCols[formName]) this.$matrixCols[formName].$domArray.push($table);
            for(let [idx2,ex2] of this.matrix.entries()) {
                let formID: string = `${formName}_${ex2.ExampleVal}`;
                let $tr: JQuery<HTMLDivElement> = $(`<div class="d-table-row"></div>`);
                let $td: JQuery<HTMLDivElement> = $(`<div class="d-table-cell font-weight-bold border p-2 text-left example-cols-div" data-name="${formName}-mobile"></div>`);
                let $radio: JQuery<HTMLInputElement> = $(`<input type="radio" name="${formName}-mobile" id="${formID}-mobile" value = "${ex2.ExampleVal}" data-idx="${idx}" data-name="${formName}" data-view="mobile"/>`);//$(`<input type="checkbox" id="${formID}-mobile"/>`);
                this.$mobileForms[formID] = {form: $radio[0], name: `${formName}`, etc: false};
                $radio.on('click', (evt) => {
                    this.eventDefault({$this: $radio, ex: ex, evt: evt})
                    //this.$forms[formID].form.click();
                });
                let $label: JQuery<HTMLLabelElement> = $(`<label class="px-2 m-0 d-inline-flex example-label example-label-matrix" for="${formID}-mobile"></label>`);
                $radio.appendTo($td);
                $label.appendTo($td);
                $label.append(`<span class="d-inline-flex d-${this.responsiveDivision}-none ml-1">${this.htmlEntitiesDecode(ex2.ExampleText)}</span>`);
                $td.appendTo($tr);
                $tr.appendTo($table);
            }
        }
        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        this.$defaultWrapper = $tableDiv;
        this.$mobileWrapper = $mobileDiv;

        return $div;
    }


    /*
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
        this.measure = this.examples.filter(ex => ex.ExampleVal>100);
        this.matrix = this.examples.filter(ex => ex.ExampleVal<100);

        let $exampleCol = $(`<div class="col-12 table-responsive py-4"></div>`).appendTo($exampleRow);
        let $tableDiv = $(`<div class="d-block d-sm-table w-100 h-100" style="border-collapse: collapse;"></div>`).appendTo($exampleCol);

        let $row: JQuery<HTMLDivElement> = $(`<div class="d-block d-sm-table-row"></div>`);
        $row.appendTo($tableDiv);
        let matrixWidth = 40;
        let $col: JQuery<HTMLDivElement> = $(`<div class="d-none d-table-cell border"></div>`);
        $col.appendTo($row);
        $col.css({'width':`${matrixWidth}%`});
        for(let [idx,ex] of this.measure.entries()) {
            $col = $(`<div class="d-none d-sm-table-cell border text-center align-middle bg-secondary font-weight-bold p-2">${this.htmlEntitiesDecode(ex.ExampleText)}</div>`);
            $col.appendTo($row);
            $col.css({'width':`${(100-matrixWidth)/this.measure.length}%`});

            let mobileCol: JQuery<HTMLDivElement> = $(`<div class="d-block d-sm-none border text-center align-middle bg-secondary font-weight-bold p-2">${this.htmlEntitiesDecode(ex.ExampleText)}</div>`);
            mobileCol.appendTo($row);

            //폼 체크 강제로 할 수 있도록..
            //MARK: 다중 체크 이므로.
            this.validForms[`${this.que.QtnName}_${ex.ExampleVal-100}`] = {flag: true, group: new Set(this.matrix.map(m => `${this.que.QtnName}_${ex.ExampleVal-100}_${m.ExampleVal}`))};
            this.$matrixCols[`${this.que.QtnName}_${ex.ExampleVal-100}`] = {idx: idx, $domArray: []};
            if (ex.hidden === true && this.direction === true) {
                this.$matrixCols[`${this.que.QtnName}_${ex.ExampleVal-100}`].$domArray.push($col);
                $col.css({'visibility':'hidden','opacity':0}).attr('data-aos',this.aosMode);
                //$col.removeClass('d-sm-table-cell');
            }
        }

        let idx = 0;
        //가로 세로 변환을 위해 $row를 기억하고 있자
        let $rowsObject = {};
        for(let ex of this.matrix) {
            $row = $(`<div class="d-block d-sm-table-row mb-4 mb-sm-0" data-row="${ex.ExampleVal}" data-idx="${idx}"></div>`) as JQuery<HTMLDivElement>;
            $rowsObject[idx] = {$dom: $row};
            $row.appendTo($tableDiv);
            if (ex.hidden === true && this.direction === true) {
                $row.removeClass('d-block d-sm-table-row').addClass('d-none');
            }
            $col = $(`<div class="d-block d-sm-table-cell border"></div>`);
            $col.appendTo($row);
            let $matrixLabel = $('<span class="d-none d-sm-block px-1 py-2"></span>').html(this.htmlEntitiesDecode(ex.ExampleText));
            $matrixLabel.appendTo($col);

            let $matrixSmallLabel = $('<span class="d-block d-sm-none font-weight-bold text-center w-100 bg-secondary px-1 py-2"></span>').html(this.htmlEntitiesDecode(ex.ExampleText));
            $matrixSmallLabel.appendTo($col);
            for(let [idx2,ex2] of this.measure.entries()) {
                let rowName = `${this.que.QtnName}_${ex2.ExampleVal-100}`;
                let formID = `${rowName}`;
                $col = $(`<div class="d-block d-sm-table-cell border text-center p-0 m-0 align-middle example-cols-div" data-name="${rowName}"></div>`) as JQuery<HTMLDivElement>;
                $col.appendTo($row);
                if (this.$matrixCols[rowName]) this.$matrixCols[rowName].$domArray.push($col);
                if (ex2.hidden === true && this.direction === true) {
                    $col.css({'visibility':'hidden','opacity':0}).attr('data-aos',this.aosMode);
                    //$col.removeClass('d-block d-sm-table-cell').addClass('d-none');
                }
                let $label = $(`<label class="w-100 h-100 align-middle text-left text-sm-center m-0 p-2 p-sm-0 example-label example-label-matrix"></label>`).appendTo($col);
                let $radio: JQuery<HTMLInputElement> = $(`<input type="radio" name="${formID}" value = "${ex2.ExampleVal-100}" data-idx="${idx2}" data-name="${rowName}"/>`);

                this.$forms[`${formID}_${ex.ExampleVal}`] = {form: $radio[0], name: `${formID}`, etc: false};
                $radio.appendTo($label);
                $radio.on('click', (evt) => {
                    this.eventDefault({$this: $radio, ex: ex})
                });

                //모바일용 LABEL
                let $smallText = $(`<span class="d-inline-flex d-sm-none ml-1"></span>`).appendTo($label);
                $smallText.html(this.htmlEntitiesDecode(ex2.ExampleText));
                let answered = this.answered[formID];
                $radio = this.existsAnswered({exVal: ex2.ExampleVal.toString(), ansVal: answered, $input: $radio}) as JQuery<HTMLInputElement>;
            }
            idx += 1;
        }

        $exampleWrapper.appendTo($div);
        this.domHtml = $div[0].outerHTML;
        return $div;
    }
    */
    eventDefault ({$this, ex ,evt}: { $this: JQuery<HTMLInputElement>, ex: Ex, evt: ClickEvent}): boolean {
        let checked = $this.is(':checked');
        let idx = Number($this[0].getAttribute('data-idx'));
        let name = $this.get(0).name;
        let isMobile: boolean = $this.get(0).getAttribute('data-view') === 'mobile';

        //색 제거
        if (!isMobile) {
            if (this.$matrixCols[name]) this.$matrixCols[name].$domArray.forEach($dom => $dom.removeClass('selected'));
        } else {
            $this.closest('div.example-cols-table').find('div.selected').removeClass('selected');
        }
        //색 추가
        $this.closest('div.example-cols-div').addClass(checked ? 'selected' : '');
        let nextDom = Object.values(this.$matrixCols).find(obj => obj.idx === idx+1);
        if (nextDom){
            if (nextDom.$domArray.filter($div => $div.css('visibility') === 'hidden' && $div.hasClass(isMobile ? 'example-cols-div' : 'example-cols-table')).length) {
                nextDom.$domArray.forEach($div => {
                    $div.css({'visibility':'visible','opacity':1.0});
                    //$div.removeClass('d-none').addClass('d-block d-${this.responsiveDivision}-table-cell')
                });
            }
        }
        if (evt.originalEvent) {
            if (evt.originalEvent.isTrusted ) {
                let syncRadio = Object.values(isMobile ? this.$forms : this.$mobileForms)
                                        .find(obj =>  $this[0].getAttribute('data-name') === obj.form.getAttribute('data-name') && $this[0].value === obj.form.value);
                if (syncRadio && evt.originalEvent.isTrusted === true) syncRadio.form.click();
            }
        }

        /*
            let syncCheckbox = Object.values(isMobile ? this.$forms : this.$mobileForms).find(obj => obj.form.name === $this.get(0).name);
            if (syncCheckbox) syncCheckbox.form.click();

            let currentDom = Object.values(this.$matrixCols).find(obj => obj.idx === idx);
            if (currentDom) currentDom.$domArray.forEach($div => $div.removeClass('bg-warning text-white'));
         */
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

        //전체 체크를 푼 경우
        if (this.validForms[this.que.QtnName]){
            this.valid = true;
            return this.valid;
        }

        //검증이 필요한 ROW들만.
        let validQuestions = Object.keys(this.validForms).filter(key => this.validForms[key].flag);
        let formCheckbox = Object.values(this.$forms).filter(obj => !obj.etc);

        console.log(validQuestions);


        for(let questionName of validQuestions) {
            let $div: Array<JQuery<HTMLDivElement>> = this.$matrixCols[questionName].$domArray.filter($div => $div.get(0).getAttribute('data-name') === questionName);
            if ($div.length) {
                $div.forEach($d => $d.removeClass('bg-warning text-white'));
            }
            let checked = formCheckbox.filter(obj => questionName === obj.name).find(obj => obj.form.checked);
            if (checked === undefined) {
                this.valid = false;
                $div.forEach($d => $d.get(0).className = 'd-block d-sm-table-cell border text-center p-0 m-0 align-middle bg-warning text-white');
                this.validMsg = this.config.langCls.defaultMsg(questionName);
                let focus = Object.values(this.$forms).find(obj => obj.name === questionName);
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
