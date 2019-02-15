import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import {SingleMeasureEDP} from '../../enum/QuestionType'
import Ex from "../../vo/Ex.vo";
export class SingleMeasure extends SurveyModule{
    $forms: {[key: string]: {form: HTMLInputElement, name: string, etc: boolean}};

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
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row p-1 rounded"></div>`).appendTo($exampleContainer);
        let $displayMid = $('<div class="col-12"></div>').appendTo($exampleRow);
        let $table = $('<div class="d-block d-sm-table w-100 rounded"></div>').css({'border-collapse':'collapse'});
        let $thead = $('<div class="d-sm-table-row bg-secondary"></div>').appendTo($table);
        let $secondThead = $('<div class="d-none bg-secondary"></div>').appendTo($table);
        let $thirdThead = $('<div class="d-none bg-secondary"></div>').appendTo($table);
        let $tbody = $('<div class="d-block d-sm-table-row bg-white"></div>').appendTo($table);
        let width = 100 / this.examples.length;

        let idx: number = 0;
        for(let ex of this.examples) {
            let $theadCols = $(`<div class="d-none d-sm-table-cell align-middle border text-center py-2"></div>`).css({'border-collapse':'collapse'});
            let $span = $(`<span class="example-label example-label-radio m-0" for="${this.que.QtnName}-${ex.ExampleVal}"></span>`);
            $span.appendTo($theadCols);
            $span.html($('<div></div>').html(ex.ExampleText).text());
            $('<div class="w-100 d-block d-sm-none"></div>').appendTo($thead);
            let $tbodyCols = $(`<div class="d-block d-sm-table-cell align-middle border text-sm-center text-left pl-2 pl-sm-0 example-cols-div py-1"></div>`).css({'border-collapse':'collapse'});
            let $tbodySecondCols = $(`<div class="d-block d-sm-table-cell align-middle border text-sm-center text-left pl-2 pl-sm-0 py-2"></div>`).css({'border-collapse':'collapse'});
            let $tbodyThirdCols = $(`<div class="d-block d-sm-table-cell align-middle border text-sm-center text-left pl-2 pl-sm-0 py-2"></div>`).css({'border-collapse':'collapse'});

            if (idx === 0) $tbodyCols.addClass('border-left');
            let formID = `${this.que.QtnName}-${ex.ExampleVal}`;
            let $radio = $(`<input type="radio" name="${this.que.QtnName}" value="${ex.ExampleVal}" id="${formID}" data-idx="${idx}"/>`) as JQuery<HTMLInputElement>;
            $radio.on('click', evt=> {
                return this.eventDefault({$this: $radio, ex: ex});
            });
            this.$forms[formID] = {form: $radio[0], name: this.que.QtnName, etc: false};
            let $label = $(`<label class="example-label example-label-radio w-100 py-2 mb-0" for="${this.que.QtnName}-${ex.ExampleVal}"></label>`);
            let $hiddenText = $('<span class="ml-2 d-inline-block d-sm-none"></span>').html($('<div></div>').html(ex.ExampleText).text());
            $label.appendTo($tbodyCols);
            $radio.appendTo($label);
            $hiddenText.appendTo($label);
            $theadCols.css({'width': `${width}%`});

            if (ex.Show){
                $theadCols.appendTo($thead);
                $tbodyCols.appendTo($tbody);
            }
            let answered = this.answered[this.que.QtnName];
            $radio = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $radio}) as JQuery<HTMLInputElement>;

            let $exSpan = $(`<span class="example-label example-label-radio mx-0 font-weight-bold my-2" for="${this.que.QtnName}-${ex.ExampleVal}"></span>`);
            let arrow = '-';
            let ceil = Math.ceil(this.examples.length/idx);

            //DP TYPE에 따른 옵션
            switch (this.que.AnsDpType) {
                case SingleMeasureEDP.Value:
                    if($secondThead.hasClass('d-none')) $secondThead.addClass('d-sm-table-row');
                    $tbodySecondCols.appendTo($secondThead);
                    if (idx === 0) $tbodySecondCols.addClass('border-left');
                    $exSpan.appendTo($tbodySecondCols);
                    arrow = ex.ExampleVal.toString();
                    $exSpan.text(arrow);
                    break;
                case SingleMeasureEDP.NoValue:

                    break;
                case SingleMeasureEDP.ValueAndArrow:
                    if($secondThead.hasClass('d-none')) $secondThead.addClass('d-sm-table-row');
                    $tbodySecondCols.appendTo($secondThead);
                    if (idx === 0) $tbodySecondCols.addClass('border-left');
                    $exSpan.appendTo($tbodySecondCols);

                    if (this.examples.length%2 === 0 ) {
                        arrow = idx === 0 ? '<' : Math.floor(this.examples.length/2) === idx ? '>' : ceil < idx ? '>' : '<';
                    } else {
                        arrow = idx === 0 ? '<' : Math.floor(this.examples.length/2) === idx ? '-' : ceil < idx ? '>' : '<';
                    }

                    $exSpan.text(arrow);

                    if($thirdThead.has('d-none')) $thirdThead.addClass('d-sm-table-row');
                    $tbodyThirdCols.appendTo($thirdThead);
                    if (idx === 0) $tbodyThirdCols.addClass('border-left');
                    $exSpan.clone().text(ex.ExampleVal.toString()).appendTo($tbodyThirdCols);
                    break;
                case SingleMeasureEDP.NoValueAndArrow:
                    if($secondThead.hasClass('d-none')) $secondThead.addClass('d-sm-table-row');
                    $tbodySecondCols.appendTo($secondThead);
                    if (idx === 0) $tbodySecondCols.addClass('border-left');
                    $exSpan.appendTo($tbodySecondCols);
                    if (this.examples.length%2 === 0 ) {
                        arrow = idx === 0 ? '<' : Math.floor(this.examples.length/2) === idx ? '>' : ceil < idx ? '>' : '<';
                    } else {
                        arrow = idx === 0 ? '<' : Math.floor(this.examples.length/2) === idx ? '-' : ceil < idx ? '>' : '<';
                    }
                    $exSpan.text(arrow);
                    break;
                default:
                    break;
            }
            idx += 1;
        }
        $table.appendTo($displayMid);
        $exampleWrapper.appendTo($div);
        //폼 체크 강제로 할 수 있도록..
        this.validForms = {[this.que.QtnName]: true};
        this.domHtml = $div[0].outerHTML;
        return $div;
    }


    eventDefault ({$this, ex}: {$this: JQuery<HTMLInputElement>, ex: Ex}): boolean {
        //클릭시 색 제거
        Object.values(this.$forms).forEach(obj => {
            let $radio: JQuery<HTMLInputElement> = $(obj.form);
            $radio.closest('div.example-cols-div').removeClass('selected');
        });
        $this.closest('div.example-cols-div').addClass('selected');
        return true;
    }
    /*

            this.$matrixRows[idx].find('div.example-cols-div').removeClass('selected');


     */

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
        //단수형 폼체크
        if (!this.validForms[this.que.QtnName]) {
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
            let focus = Object.values(this.$forms).find(obj => !obj.etc);
            if (focus) this.formValidDecoration({result: this.valid, dom: focus.form});
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
