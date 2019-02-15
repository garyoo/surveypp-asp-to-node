import {SurveyModule} from "../SurveyModule";
import {Que} from "../../vo/Que.vo";
import $ from "jquery";
import Ex from "../../vo/Ex.vo";

// TODO: 모바일에서의 이미지 레이아웃
// TODO: 없음 추가
export class MultiImageClickable extends SurveyModule {
    $forms: { [key: string]: { form: HTMLInputElement, name: string, etc: boolean, checkbox: boolean, image: HTMLImageElement} };

    constructor({que, answered, questions, pageUserScript}: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
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
        let $div: JQuery<HTMLDivElement>;
        //QUESTION
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let QuestionText = this.que.QuestionText.split('|');
        let QuestionWord = this.htmlEntitiesDecode(QuestionText.shift() as string);
        let QuestionImgURL: string = QuestionText.join(',');
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper" ><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${QuestionWord}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row position-relative"  style="margin:0 auto;"></div>`).appendTo($exampleContainer);
        let $canvasWrapper = $(`<div class="example-col-div" style="margin:0 auto; position:relative"></div>`);
        let $img:JQuery<HTMLImageElement> = $(`<img id="img-${this.que.QtnName}" class="position-absolute"src="${QuestionImgURL}" style="margin:0 auto;" usemap="#map-${this.que.QtnName}"/>`);
        let $areaWrapper = $(`<map id="map-${this.que.QtnName}" name="map-${this.que.QtnName}"></map>`);
        let $InputWrapper = $(`<div class="example-row my-2 row" style="display:none"></div>`);
        if (this.que.AnsColCount > 12) this.que.AnsColCount = 12;
        for (let ex of this.examples) {
            let col = 12;

            //REPLACE METHOD
            let formID: string = `${this.que.QtnName}_${ex.ExampleVal}`;
            if (this.que.AnsColCount) col = Math.round(12 / this.que.AnsColCount);
            let text= ex.ExampleText.split('|');
            let exampleText = this.htmlEntitiesDecode(text.shift() as string);
            let exampleCoords = text.join(',');
            let exampleCoordsTmp = exampleCoords.split(',');
            let exampleCoordsX1:number = parseInt(exampleCoordsTmp[0],10);
            let exampleCoordsY1:number = parseInt(exampleCoordsTmp[1],10);
            let exampleCoordsX2:number = parseInt(exampleCoordsTmp[2],10);
            let exampleCoordsY2:number = parseInt(exampleCoordsTmp[3],10);
            let $mapHilight:JQuery<HTMLDivElement> = $(`<div class="position-absolute" id="div-${ex.QtnName}-${ex.ExampleVal}" style="background-color:#ffff00; left:${exampleCoordsX1}px; top:${exampleCoordsY1}px; width:${exampleCoordsX2-exampleCoordsX1}px; height:${exampleCoordsY2-exampleCoordsY1}px; opacity:0.5; display:none;"></div>`);
            let $example: JQuery<HTMLElement> = $(`<area shape="rect"  value="${ex.ExampleVal}" id="area_${ex.ExampleVal}" coords="${exampleCoordsX1},${exampleCoordsY1},${exampleCoordsX2},${exampleCoordsY2}" target=${this.que.QtnName} oncontextmenu="return false;">`);
            let $checkbox: JQuery<HTMLInputElement> = $(`<input type="checkbox" id="${formID}" name="${formID}" value="${ex.ExampleVal}">`);
            this.$forms[`${formID}`] = {form: $checkbox[0], name: formID, etc: false, checkbox: true, image: $img.get(0)};
            let $span = $(`<span class="ml-1 example-span" data-form-id="${formID}"></span>`).html(this.htmlEntitiesDecode(exampleText));
            $span.appendTo($checkbox);

            if (ex.Show){
                $example.appendTo($areaWrapper);
                $mapHilight.appendTo($canvasWrapper);
                $canvasWrapper.appendTo($exampleRow);
                $areaWrapper.appendTo($exampleRow);
                $InputWrapper.appendTo($exampleRow);
                $checkbox.appendTo($InputWrapper);
            }
            $example.on('click', (evt) => {
                this.eventDefault(ex);
            });
            $mapHilight.on('click', (evt) => {
                this.eventDefault(ex);
            });
            let answered = this.answered[formID];
            $checkbox = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $checkbox}) as JQuery<HTMLInputElement>;
            this.validForms[formID] = ex.Show; //부분적으로 체크를 풀 때
        }
        $exampleWrapper.appendTo($div);
        this.validForms[this.que.QtnName] = this.examples.find(ex=> ex.Show? true: false) ? true : false;    //전체를 풀때
        this.domHtml = $div[0].outerHTML;

        let image = new Image();
        image.onload = () => {
            if(image.width) $canvasWrapper[0].style.width = `${image.width}px`;
            if(image.height) $canvasWrapper[0].style.height = `${image.height}px`;
        };
        image.src = QuestionImgURL;
        $img.prependTo($canvasWrapper);
        return $div;
    }

    getData(): object {
        let surveyData: object = {};

        for (let key in this.$forms) {
            surveyData[key] = '';
        }

        this.$form.serializeArray().forEach(d => {
            surveyData[d.name] = d.value;
        });
        return surveyData;
    }

    eventDefault (ex: Ex): boolean {
        let mapHilightID = `#div-${ex.QtnName}-${ex.ExampleVal}`
        let input = `#${ex.QtnName}_${ex.ExampleVal}`
        let disabled = $(mapHilightID).css('display')

        if(disabled=="none"){
            $(mapHilightID).css('display','inline');
            $(input).prop('checked',true);
        }
        else{
            $(mapHilightID).css('display','none');
            $(input).prop('checked',false);
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

        this.valid = true;
        let formCb = Object.values(this.$forms).filter(obj => !obj.etc  && this.validForms[obj.name]).map(obj => obj.form as HTMLInputElement);
        let formImg = Object.values(this.$forms).map(obj => obj.image);
        let checked = formCb.find(cb => cb.checked);

        if (!checked) {
            this.valid = false;
            let focus = formImg.find(cb => !cb.hidden);
            this.validMsg = this.config.langCls.defaultMsg(this.que.QtnName);
            if (focus) this.formValidDecoration({result: this.valid, dom: focus});
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