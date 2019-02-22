import $ from 'jquery';
import {SurveyModule} from "../survey/SurveyModule";
import {Que} from "../vo/Que.vo";

export default class TestManager {

    $bottomDiv: JQuery<HTMLDivElement> = $('<div class="w-100 position-fixed" style="height:50px;bottom:0;"></div>');
    questionEditMode: boolean = false;
    $questionSaveBtn: JQuery<HTMLButtonElement> = $(`<button class="btn btn-block btn-danger">저장</button>`);

    userAgentDiv?: HTMLDivElement;

    $currentEditQuestionWrapper?: JQuery<HTMLDivElement>;
    constructor(private groupID: string, private currentModules: Array<SurveyModule>, private userAgent?: object) {
        this.editQuestion();
        this.setUserAgent();
    }

    //BIND
    editQuestion() {
        for(let module of this.currentModules) {
            if (module.$dom) {
                this.$currentEditQuestionWrapper = module.$dom.find('div.question-wrapper') as JQuery<HTMLDivElement>;
                this.$currentEditQuestionWrapper.on('click', evt => {
                    if (evt.ctrlKey && !this.questionEditMode) {
                        if (!confirm(`${module.que.QtnName}의 질문 내용을 편집하시겠습니까?`))  return false;
                        this.questionEditMode = true;
                        this.$bottomDiv.appendTo(document.body);
                        this.$questionSaveBtn.appendTo(this.$bottomDiv);
                        let $textarea = $(`<textarea class="form-control-sm w-100 h-100" rows="15"></textarea>`) as JQuery<HTMLTextAreaElement>;
                        $textarea.get(0).value = module.que.QuestionText;
                        if (this.$currentEditQuestionWrapper) {
                            let $questionNo = this.$currentEditQuestionWrapper.find('span.question-number').detach();
                            this.$currentEditQuestionWrapper.empty();
                            $textarea.appendTo(this.$currentEditQuestionWrapper);
                            this.$questionSaveBtn.on('click', evt => {
                                if (this.questionEditMode) {
                                    if (!confirm(`${module.que.QtnName}의 질문 내용을 저장하시겠습니까?`)) return false;
                                    this.saveQuestion($textarea.get(0).value, module, $questionNo);
                                }
                            });
                        }
                    }
                });
            }
        }
    }

    saveQuestion(newQuestion: string, module: SurveyModule, $questionSpan: JQuery<HTMLSpanElement>) {
        module.que.QuestionText = newQuestion;
        if (this.$currentEditQuestionWrapper) {
            this.$currentEditQuestionWrapper.empty();
            $questionSpan.appendTo(this.$currentEditQuestionWrapper);
            this.$currentEditQuestionWrapper.append(newQuestion);
        }
        /*
        delete this.currentModule;
        delete this.$currentEditQuestionWrapper;
        delete this.$currentEidQuestionTextArea;
        */
        this.$bottomDiv.remove();
        this.questionEditMode = false;
    }


    setUserAgent() {
        let userAgentDiv = document.getElementById('user-agent') as HTMLDivElement;
        if (userAgentDiv) this.userAgentDiv = userAgentDiv;

        if (this.userAgentDiv && this.userAgent) {
            this.userAgentDiv.style.fontSize = '0.6rem';
            let ul = document.createElement('ul');
                ul.innerHTML =
                Object.keys(this.userAgent).map(key =>{
                    if (this.userAgent) {
                        let type =typeof(this.userAgent[key]);
                        if (type === "string") {
                            return `<li>${key} = ${this.userAgent[key]}</li>`;
                        } else if (type === 'boolean') {
                            return `<li>${key} = ${this.userAgent[key]}</li>`;
                        } else {

                        }
                    }
                    return ``;
                }).filter(obj => obj.length).join('');
            //this.userAgentDiv.innerHTML = ul.outerHTML;

        }
    }
}