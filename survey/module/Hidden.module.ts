import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class Hidden extends SurveyModule{
    $forms: {[key: string]: {min?: number, max?: number, form: HTMLInputElement, show?: boolean, name: string}};
    $etcTexts: Array<HTMLInputElement>;
    constructor({ que, answered, questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({que: que, answered: answered, questions: questions, pageUserScript: pageUserScript});
        this.valid = false;
        this.$forms = {};
        this.$etcTexts = [];
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;

        //QUESTION
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false"></div>`);
        //$div.addClass('d-none');
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1">${this.que.QtnName}.</span>${this.que.QuestionText}</div>`);
        $questionWrapper.appendTo($div);
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        for(let ex of this.examples) {
            let col = 12;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-${col} form-group"></div>`);
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let $hidden = $(`<input type="radio" name="${this.que.QtnName}" value="${ex.ExampleVal}" id="${formID}"/>`) as JQuery<HTMLInputElement>;
            //응답값이 있다면 체크
            this.$forms[formID] = {form: $hidden[0], name: formID};

            let $label = $(`<label class="example-label example-label-radio ml-1 my-0" for="${formID}"></label>`);
            $hidden.appendTo($example);
            $label.appendTo($example);

            $hidden.on('click', (evt) =>{
                this.eventDefault({$this: $hidden});
            });

            //TODO: ETC 이름 규칙 확인
            if (this.que.AnsEtcOpen && this.que.AnsEtcVal.toString() === ex.ExampleVal.toString()) {
                formID = `${this.que.QtnName}_${this.que.AnsEtcVal}_etc`;
                let $etc = $(`<input type="text" name="${formID}" id="${formID}" class="form-control form-control-sm ml-1" disabled data-disabled="disabled"/>`) as JQuery<HTMLInputElement>;
                this.$forms[formID] = {form: $etc[0], name: formID};
                this.$etcTexts.push($etc[0]);
                $etc.appendTo($example);
                $hidden.on('click', (evt)=>{
                    console.log(evt);
                    return this.eventEtcOpenYN({$this: $hidden, $targetForm: $etc});
                })
            }
            $label.html($('<div></div>').html(ex.ExampleText).text());

            if (ex.Show) {
                $example.appendTo($exampleRow);
            }
            let answered = this.answered[this.que.QtnName];
            $hidden = this.existsAnswered({exVal: ex.ExampleVal.toString(), ansVal: answered, $input: $hidden}) as JQuery<HTMLInputElement>;;
        }
        $exampleWrapper.appendTo($div);
        //선택 가능한 보기가 1개라면.

        if (this.showExamplesCnt === 1) {
            /*
            let find = this.examples.find(ex=> ex.Show);
            if (find){
                this.$forms[`${this.que.QtnName}_${find.ExampleVal}`].form.checked = true;
            }
            */
            //$div.addClass('d-none');
        }
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    eventDefault ({ $this }: { $this: JQuery<HTMLInputElement> }): boolean {
        let checked = $this.is(':checked');
        if (checked) {
            this.$etcTexts.forEach(etc =>{
                etc.value = '';
                etc.disabled = true;
            });
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

    getNextRoutes(): {route: string, outMarker: string} {
        for(let d of this.$form.serializeArray()) {
            let routes = this.examples.find(ex => ex.ExampleVal.toString() === d.value);
            if(routes) return {route: routes.SkipByExample, outMarker: `${d.name}=${d.value}`};
        }
        return {route: '', outMarker: ''};
    }


    get formCheck() {
        if (!this.$form.serializeArray().length) {
            this.valid = false;
            return this.valid;
        }

        if (this.$etcTexts.length) {
            let etc = this.$etcTexts.find ( $input => {
                return $input.value === '' && $input.disabled === false
            });
            if (etc) {
                this.valid = false;
                etc.focus();
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
