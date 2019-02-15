import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";

export class ImageDisplay extends SurveyModule{

constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $imageWrapper = $('<div class="alert alert-secondary border question-wrapper image-module text-center"></div>').appendTo($div);

        try{
            if( this.que.QuestionText.includes('<img')) {
                let src: string = '';
                let images = this.que.QuestionText.match(/<img .*?>/g);
                if (images) {
                    let $img = $(images[0]) as JQuery<HTMLImageElement>;
                    src = $img.get(0).src;
                    if (src) {
                        let image = new Image();
                        image.onload = (evt) => {
                            $imageWrapper[0].innerHTML = $img.get(0).outerHTML;
                        };

                        image.onerror = (evt) => {
                            $img.get(0).setAttribute('src','https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png');
                            $imageWrapper[0].innerHTML = $img.get(0).outerHTML;
                        };
                        image.src = src;
                    }
                }
            }
        } catch(e) {
            console.log(e);
        }



        //$imageWrapper[0].innerHTML = this.que.QuestionText;
        this.domHtml = $div[0].outerHTML;
        return $div;
    }

    getData(): object {
        let surveyData: object = {[this.que.QtnName]: true};
        return surveyData;
    }


    get formCheck() {
        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTimeCalc);
        } else {
            this.valid = true;
        }
        return this.valid;
    }
}
