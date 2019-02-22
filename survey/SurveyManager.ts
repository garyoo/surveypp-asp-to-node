import $ from 'jquery';
import {Que} from '../vo/Que.vo';
import SurveyLoader from "./SurveyLoader";
import {SurveyModule} from './SurveyModule';
import {QuestionType} from "../enum/QuestionType";
import SurveyConfig from "../managers/SurveyConfig";
import AlertManager from "../managers/AlertManager";
import TestManager from "../managers/TestManager";
import ProjectConfig from '../vo/ProjectConfig.vo';
import {GroupID} from "../enum/Config";

//MODULES
import {SingleDefault} from "./module/SingleDefault.module";
import {NumberDefault} from "./module/NumberDefault.module";
import {SingleMeasure} from "./module/SingleMeasure.module";
import {NumberUnitConvert} from "./module/NumberUnitConvert.module";
import {MultiSelection} from "./module/MultiSelction.module";
import {TextMulti} from "./module/TextMulti.module";
import {End} from "./module/End.module";
import {Hidden} from "./module/Hidden.module";
import {SingleDropDown} from "./module/SingleDropDown.module";
import {RankSelection} from "./module/RankSelection.module";
import {TableSingle} from "./module/TableSingle.module";
import {TableSingleBoth} from "./module/TableSingleBoth.module";
import {TextSingle} from "./module/TextSingle.module";
import {QuotaCheck, QuotaOver} from "./module/QuotaCheck";
import {Terminate, TerminateCheck} from "./module/Terminate.module";
import {TextMobileNumber} from "./module/TextMobileNumber";
import {Description} from './module/Description.module';
import {ImageDisplay} from "./module/Image.module";
import {VideoDisplay} from "./module/VideoDisplay.module";
import {TableMulti} from "./module/TableMulti.module";
import {TableMultiTransform} from "./module/TableMultiTransform.module";
import {TableSingleTransform} from "./module/TableSingleTransform.module";
import {RandomQuestion} from "./module/RandomQuestion.module";
import {AddressSearch} from "./module/AddressSearch.module";
import {NumberSum} from "./module/NumberSum.module";
import {TableNumber} from "./module/TableNumber.module";
import {MultiImageClickable} from "./module/MultiImageClickable.module";
import {RankImageClickable} from "./module/RankImageClickable.module";

//CSS
import AOS from 'aos';
import 'bootstrap';
import 'aos/dist/aos.css';


class SurveyBtn {
    $wrapperDiv: JQuery<HTMLDivElement>;
    $nextBtn: JQuery<HTMLButtonElement>;
    $prevBtn?: JQuery<HTMLButtonElement>;
    $nextDiv?: JQuery<HTMLDivElement>;
    $prevDiv?: JQuery<HTMLDivElement>;

    constructor ({ prevBtnLabel, nextBtnLabel = '다음 페이지'}: { prevBtnLabel?: string, nextBtnLabel: string }) {
        this.$wrapperDiv = $('<div class="row"></div>');
        this.$nextBtn = $('<button class="btn btn-block btn-danger"></button>');
        this.$nextBtn.text(nextBtnLabel);
        if (prevBtnLabel !== undefined) {
            this.$prevBtn = $('<button class="btn btn-block btn-facebook"></button>');
            this.$prevBtn.text(prevBtnLabel);
        }
        this.stateChange(true);
    }

    render (): JQuery<HTMLDivElement> {
        this.$wrapperDiv.empty();
        this.$nextDiv = $('<div class="col-12"></div>');
        this.$nextBtn.appendTo(this.$nextDiv);
        if (this.$prevBtn) {
            this.$nextDiv.removeClass('col-12').addClass('col-6');
            this.$prevDiv = $('<div class="col-6"></div>');
            this.$prevBtn.appendTo(this.$prevDiv);
            if(this.$prevDiv) this.$prevDiv.appendTo(this.$wrapperDiv);
        }
        if(this.$nextDiv) this.$nextDiv.appendTo(this.$wrapperDiv);
        return this.$wrapperDiv;
    }

    stateChange (disabled: boolean): void {
        this.$nextBtn[0].disabled = disabled;
        if(this.$prevBtn) this.$prevBtn[0].disabled = disabled;
    }

    end (): void {
        //this.nextBtn.addClass('d-none');
    }
}

class SurveyProgress {
    current: number;
    total: number;
    progressWrapper? : JQuery<HTMLDivElement>;
    progressLabel: JQuery<HTMLDivElement>;
    progressPercentage : JQuery<HTMLDivElement>;
    progressBar: JQuery<HTMLDivElement>;
    logoWrapper?: JQuery<HTMLDivElement>;
    logoDivObject: {default: JQuery<HTMLDivElement>, mobile: JQuery<HTMLDivElement>, pad: JQuery<HTMLDivElement>};
    theme: string = 'primary';

    constructor({ current, total }: {current: number, total: number}) {
        this.current = current;
        this.total = total;
        this.progressLabel = $(`<div class="progress-label"><span>Progress</span></div>`);
        this.progressPercentage = $(`<div class="progress-percentage"></div>`);
        this.progressBar = $(`<div class="progress-bar progress-bar-striped progress-bar-animated bg-${ this.theme }" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>`);

        this.logoDivObject = {
            default: $(`<div class="survey-logo d-none d-sm-none d-md-block"></div>`) as JQuery<HTMLDivElement>,
            mobile: $(`<div class="survey-logo d-block d-sm-none rounded"></div>`) as JQuery<HTMLDivElement>,
            pad: $(`<div class="survey-logo d-none d-sm-block d-md-none"></div>`) as JQuery<HTMLDivElement>
        };
        this.progress(current, total);
    }

    render (): JQuery<HTMLDivElement> {
        if (this.progressWrapper) {
        } else {
            this.progressWrapper = $('<div class="progress-wrapper"></div>');
            let $divInfo: JQuery<HTMLDivElement>,
                $divWrapper: JQuery<HTMLDivElement>;
            $divInfo = $('<div class="progress-info"></div>');
            $divInfo.appendTo(this.progressWrapper);

            $divWrapper = $('<div class="progress"></div>');
            $divWrapper.appendTo(this.progressWrapper);

            this.progressLabel.appendTo($divInfo);
            this.progressPercentage.appendTo($divInfo);
            this.progressBar.appendTo($divWrapper);
        }
        return this.progressWrapper;
    }

    progress (current: number, total: number) {
        this.current = current;
        this.total = total;
        let prog = (this.current/(this.total)) * 100;
        if (prog > 100) prog = 100;
        this.progressPercentage.html(`<span>${prog.toFixed(1)}%</span>`);
        this.progressBar.css({width:  `${prog}%` });
        this.progressBar.attr({'aria-valuenow': prog });
    }

    setLogo (config: ProjectConfig) {
        if (this.logoWrapper) return;
        if (!this.progressWrapper) return;
        this.logoWrapper = $(`<div class="logo-wrapper w-25"></div>`);
        this.logoWrapper.prependTo(this.progressWrapper);

        this.logoDivObject.default.appendTo(this.logoWrapper);
        this.logoDivObject.mobile.appendTo(this.logoWrapper);
        this.logoDivObject.pad.appendTo(this.logoWrapper);


        this.logoImageUrlCheck(config.titlelogo, ($img) => {
            this.logoDivObject.default.html($img);
        });

        this.logoImageUrlCheck(config.mobiletitlelogo, ($img) => {
            this.logoDivObject.mobile.html($img);
        });

        this.logoImageUrlCheck(config.padtitlelogo, ($img) => {
            this.logoDivObject.pad.html($img);
        });
    }

    logoImageUrlCheck (logoStr: string, cb: Function) {
        let url: string = '';
        try{
            let match = logoStr.match(/<img .*?>/g);
            if (match) {
                let tempImage: HTMLImageElement = $(match[0]).get(0) as HTMLImageElement;
                if (tempImage.src) url = tempImage.src;
            }
        } catch(e) {
            console.log(e.message);
        }

        let image = new Image();
        image.onload = () => {
            let $img: JQuery<HTMLImageElement> = $(`<img src="${url}" class="img-rounded" style="width:50px;" alt=''/>`);
            cb($img);
        };

        image.onerror = () => {
            let $img: JQuery<HTMLImageElement> = $(`<img src='https://t1.daumcdn.net/liveboard/emoticon/kakaofriends/v3/cheerup/emot_018_x3.gif' class="img-rounded" style="width:50px;" alt=""/>`);
            cb($img);
        };
        image.src = url;

    }

}

export class SurveyManager {
    projectID: string;
    objectID?: string;
    groupID: string;
    responseID: string;
    fieldWorkID?: string;
    currentQuestions?: Array<Que>;
    surveyBtnCls: SurveyBtn;
    surveyProgress?: SurveyProgress;
    currentModules: Array<SurveyModule> = [];
    surveyLoader: SurveyLoader;
    direction: boolean; //앞으로 가기 뒤로 가기
    pageUserScript?: string;
    surveyConfig: SurveyConfig;
    testManager?: TestManager;
    alertManager: AlertManager;
    $surveyContents: JQuery<HTMLDivElement> = $('#survey-contents');
    userAgent?: object;
    currentDomArray: Array<HTMLDivElement> = [];

    constructor({ projectID, groupID, responseID, jumpPage, jumpQtn, surveyConfig }: { projectID: string, groupID:string, responseID: string, jumpPage: string, jumpQtn: string, surveyConfig: SurveyConfig}) {
        this.projectID = projectID;
        this.groupID = groupID === '' ? 'NO_GROUP' : groupID;
        this.responseID = responseID === '' ? ('000000000' + Math.floor(Math.random() * 100000000) + 1).substr(-10) : responseID;
        this.surveyConfig =  surveyConfig;
        let btnParams = { nextBtnLabel: this.surveyConfig.nextBtnLabel};
        if (this.groupID === GroupID.TG) {
            btnParams['prevBtnLabel'] = this.surveyConfig.prevBtnLabel;
            document.addEventListener('keydown', evt => {
                if (evt.ctrlKey && evt.keyCode === 13) this.next();
            });
        }
        this.surveyBtnCls = new SurveyBtn(btnParams);
        this.surveyProgress = new SurveyProgress({current: 0, total: 0});
        this.direction = true;
        this.$surveyContents.addClass(this.groupID);

        let surveyLoaderParams = {
            projectID: this.projectID,
            surveyMode: 'test',
            quesMode: 'file',
            groupID: this.groupID,
            responseID: this.responseID,
            jumpPage: jumpPage||'',
            jumpQtn: jumpQtn||'',
            surveyConfig: surveyConfig
        };
        this.surveyLoader = new SurveyLoader(surveyLoaderParams);
        this.surveyLoader.init().then((data) =>{
            if (data) {
                if (data.pageUserScript) this.pageUserScript = data.pageUserScript;
                if (data.objectID) this.objectID = data.objectID;
                if (data.currentQuestion) {
                    this.currentQuestions = data.currentQuestion;
                    this.init();
                }
                if (data.userAgent) this.userAgent = data.userAgent;
            }
        });
        this.alertManager = new AlertManager();
    }

    init () {
        this.$surveyContents.html('Processing..');
        this.renderProgress();
        this.renderQuestion().then(() => {
            this.renderBtn();
            this.testManager = new TestManager(this.groupID, this.currentModules, this.userAgent);
        });
        /*
        MARK: 콜백형태
        this.renderQuestion(() => {
            this.renderBtn();
            this.testManager = new TestManager(this.groupID, this.currentModules, this.userAgent);
        });
        */
    }

    scrollTop () {
        window.scrollTo(0, 0);
    }

    /*
    renderQuestionQueue(questions: Array<Que>, cb: Function): void  {
        if (!this.currentQuestions) return;
        if (!this.currentQuestions.length) return;

        let currentQue: Que | null = this.currentQuestions.shift() || null;
        if (currentQue === null) return;

        console.time(`${currentQue.QtnName}`);

        let module = this.returnModuleType(currentQue);
        if (module) {
            if (currentQue.QtnType === QuestionType.End ) {
                this.surveyBtnCls.end();
            } else if (currentQue.QtnType === QuestionType.QuotaOver ) {
                this.surveyBtnCls.end();
            } else if (currentQue.QtnType === QuestionType.Terminate ) {
                this.surveyBtnCls.end();
            }
        }
        if (module.$dom) {
            module.$dom.get(0).style.opacity = '0.0';
            module.imageChecker(module.$dom);
            this.$surveyContents.append(module.$dom);
            if(module.$dom) module.$dom.get(0).style.opacity = '1.0';
            if (module.$dom) this.currentDomArray.push(module.$dom[0]);
        }
        if (module.userScript().rendering) module.userScript().rendering(module.$dom);

        this.currentModules.push(module);
        console.timeEnd(`${currentQue.QtnName}`);

        if (this.currentQuestions.length) {
            setTimeout(() => {
                this.renderQuestionQueue(questions, cb);
            },1);
        } else {
            cb();
            if(module.userScript().pageRendering) module.userScript().pageRendering(this.currentDomArray);
        }
    }
    */

    async renderQuestion (renderEnd?: Function) {
        if (this.currentQuestions) {
            this.currentModules = [];
            this.$surveyContents.empty();
            this.currentDomArray = [];

            let $fragment = $(document.createDocumentFragment());
            console.time(`survey Render start ${this.currentQuestions.length}questions`);
            for(let [idx,que] of this.currentQuestions.entries()) {
                let module = this.returnModuleType(que);
                if (module) {
                    if (module.$dom) {
                        if(module.showExamplesCnt > 0 || this.groupID === GroupID.TG)$fragment.append(module.$dom);
                        module.imageChecker(module.$dom);
                    }
                    if(this.groupID === GroupID.TG && module.showExamplesCnt === 0) $fragment.append(module.testModeNotice(`${que.QtnName}의 선택 가능한 보기 없음`));
                    if (module.userScript().rendering) module.userScript().rendering(module.$dom);
                    this.currentModules.push(module);

                    if (que.QtnType === QuestionType.End ) {
                        this.surveyBtnCls.end();
                    } else if (que.QtnType === QuestionType.QuotaOver ) {
                        this.surveyBtnCls.end();
                    } else if (que.QtnType === QuestionType.Terminate ) {
                        this.surveyBtnCls.end();
                    }
                    if (module.$dom) this.currentDomArray.push(module.$dom[0]);
                }
                if (idx === this.currentQuestions.length-1) {
                    if(module.userScript().pageRendering) module.userScript().pageRendering(this.currentDomArray);
                }
            }
            console.timeEnd(`survey Render start ${this.currentQuestions.length}questions`);
            let callBack = () => {
                $fragment.appendTo(this.$surveyContents);
                this.surveyBtnCls.stateChange(false);
                this.scrollTop();
                if (renderEnd)renderEnd();
                AOS.init();
            };

            callBack();
        }
    }

    renderBtn () {
        $('#survey-btns').empty();
        this.surveyBtnCls.render().appendTo('#survey-btns');
        this.surveyBtnCls.$nextBtn.on('click',  () => {
            if(this.next()) {
                this.save()
                    .then(data =>{
                        this.init();
                    })
                    .catch();
            }
        });

       if (this.surveyLoader.answered){
           let status = this.surveyLoader.answered.status;
           if (status) {
               switch (status) {
                   case QuestionType.QuotaOver:
                   case QuestionType.End:
                   case QuestionType.Terminate:
                       //this.surveyBtnCls.stateChange(true);
                       if (this.surveyBtnCls.$nextDiv) this.surveyBtnCls.$nextDiv.remove();
                       break;
                   default:
                       break;
               }
           }
       }

        if (this.surveyBtnCls.$prevBtn) {
           this.surveyBtnCls.$prevBtn.on('click', (evt) =>{
                this.prev().then(data =>{
                    this.init();
                }).catch();
           });
        }

    }

    renderProgress () {
        if (this.surveyProgress) {
            this.surveyProgress.render().appendTo('#survey-progress');
            this.surveyProgress.progress(this.surveyLoader.currentPage, this.surveyLoader.totalPage);
            if (this.surveyLoader.projectConfig) this.surveyProgress.setLogo(this.surveyLoader.projectConfig);
        }
    }

    next () {
        this.direction = true;
        let valid: boolean = true;
        let validMsg = '';
        let queName = '';
        let focusDom: HTMLElement = document.body;
        for (let m of this.currentModules) {
            valid = m.formCheck;
            if(!valid) {
                validMsg = m.validMsg;
                queName = m.que.QtnName;
                if (m.focus) focusDom = m.focus;
                break;
            }
        }
        if (!valid) {
            this.alertManager.alert(queName,validMsg === '' ? `[${queName}] 응답을 확인해주세요.` : validMsg, focusDom);
            //alert(validMsg === '' ? `[${queName}] 응답을 확인해주세요.` : validMsg);
        }
        return valid;
    }

    async save (): Promise<Boolean> {
        this.surveyBtnCls.stateChange(true);
        let valid: boolean = false;

        let saveData: {
            projectID: string,
            objectID: string,
            groupID: string,
            responseID: string,
            fieldWorkID: string,
            pageNum: number,
            surveyData: Array<object>,
            routes: {route: string, outMarker: string},
        };

        saveData = {
            projectID: this.projectID,
            objectID: this.objectID||'',
            groupID: this.groupID,
            responseID: this.responseID,
            fieldWorkID: this.fieldWorkID||'',
            pageNum: this.surveyLoader.currentPage,
            surveyData: [],
            routes: {route: '', outMarker: ''},
        };
        for (let m of this.currentModules) {
            //MARK: 한 페이지에 모듈이 여러개라면 가장 마지막 routes를 가져온다.
            if (saveData.routes.route === '' )saveData.routes = m.getNextRoutes();
            saveData.surveyData.push({name: m.que.QtnName, data: m.getData()});
        }
        try{
            await this.surveyLoader.getNext(saveData);
            this.currentQuestions = this.surveyLoader.currentQuestion;
            //PROGRESS
        } catch (e) {
            console.log(e);
        }
        return valid;
    }

    async prev (): Promise<Boolean> {
        this.direction = false;
        this.surveyBtnCls.stateChange(true);
        let valid: boolean = false;
        let prevData: {
            projectID: string,
            objectID: string,
            groupID: string,
            responseID: string,
            fieldWorkID: string,
            pageNum: number,
            currentQuestions: Array<string>,
            eraseData: Array<string>
        };

        prevData = {
            projectID: this.projectID,
            objectID: this.objectID||'',
            groupID: this.groupID,
            responseID: this.responseID,
            fieldWorkID: this.fieldWorkID||'',
            pageNum: this.surveyLoader.currentPage,
            currentQuestions: this.currentQuestions ? this.currentQuestions.map(que => que.QtnName) : [],
            eraseData: []
        };

        for(let module of this.currentModules) {
            prevData.eraseData.push(...module.$form.serializeArray().map(nv => nv.name));
        }

        try {
            this.currentQuestions = await this.surveyLoader.getPrev(prevData);
        } catch(e) {
            console.log(e);
        }

        return valid;
    }

    returnModuleType (que: Que) {
        let module: SurveyModule;
        let type = que.QtnType;
        let answered = {};
        let questions = {};
        if (this.surveyLoader.answered) answered = this.surveyLoader.answered.surveyData;
        if (this.surveyLoader.questionsObject) questions = this.surveyLoader.questionsObject;
        let clsParams = {que: que, answered: answered, questions: questions, direction: this.direction};
        if (this.pageUserScript) clsParams['pageUserScript'] = this.pageUserScript;
        switch (type) {
            case QuestionType.Description:
                module = new Description(clsParams);
                break;
            case QuestionType.ImageDisplay:
                module = new ImageDisplay(clsParams);
                break;
            case QuestionType.SingleDefault:
                module = new SingleDefault(clsParams);
                break;
            case QuestionType.NumberDefault:
                module = new NumberDefault(clsParams);
                break;
            case QuestionType.SingleMeasure:
                module = new SingleMeasure(clsParams);
                break;
            case QuestionType.MultiSelection:
                module = new MultiSelection(clsParams);
                break;
            case QuestionType.NumberUnitConvert:
                module = new NumberUnitConvert(clsParams);
                break;
            case QuestionType.TextMulti:
                module = new TextMulti(clsParams);
                break;
            case QuestionType.End:
                module = new End(clsParams);
                break;
            case QuestionType.Terminate:
                module = new Terminate(clsParams);
                break;
            case QuestionType.TerminateCheck:
                module = new TerminateCheck(clsParams);
                break;
            case QuestionType.QuotaOver:
                module = new QuotaOver(clsParams);
                break;
            case QuestionType.QuotaCheck:
                module = new QuotaCheck(clsParams);
                break;
            case QuestionType.Hidden:
                module = new Hidden(clsParams);
                break;
            case QuestionType.SingleDropDown:
                module = new SingleDropDown(clsParams);
                break;
            case QuestionType.RankSelection:
                module = new RankSelection(clsParams);
                break;
            case QuestionType.TableSingle:
                module = new TableSingle(clsParams);
                break;
            case QuestionType.TableSingleBoth:
                module = new TableSingleBoth(clsParams);
                break;
            case QuestionType.TableSingleTransform:
                module = new TableSingleTransform(clsParams);
                break;
            case QuestionType.TextSingle:
                module = new TextSingle(clsParams);
                break;
            case QuestionType.TextMobileNumber:
                module = new TextMobileNumber(clsParams);
                break;
            case QuestionType.VideoDisplay:
                module = new VideoDisplay(clsParams);
                break;
            case QuestionType.TableMulti:
                module = new TableMulti(clsParams);
                break;
            case QuestionType.TableMultiTransform:
                module = new TableMultiTransform(clsParams);
                break;
            case QuestionType.RandomQuestion:
                module = new RandomQuestion(clsParams);
                break;
            case QuestionType.AddressSearch:
                module = new AddressSearch(clsParams);
                break;
            case QuestionType.NumberSum:
                module = new NumberSum(clsParams);
                break;
            case QuestionType.TableNumber:
                module = new TableNumber(clsParams);
                break;
            case QuestionType.MultiImageClickable:
                module = new MultiImageClickable(clsParams);
                break;
            case QuestionType.RankImageClickable:
                module = new RankImageClickable(clsParams);
                break;
            default:
                module = new End(clsParams);
        }
        return module;
    }
}