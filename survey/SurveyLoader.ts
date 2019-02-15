import {Que} from '../vo/Que.vo';
import $http from 'axios';
import {DataSet, QuotaSet} from "../vo/DataSet.vo";
import {NextModule, QuestionType} from "../enum/QuestionType";
import {GroupID, LogicMode} from "../enum/Config"
import Common from "../cls/Common";
import SurveyConfig from "../cls/SurveyConfig";
import ProjectConfig from "../vo/ProjectConfig.vo";
import Ex from "../vo/Ex.vo";


export default class SurveyLoader {
    projectID: string;
    objectID: string = '';
    responseID: string;
    groupID: string;
    surveyMode: string;
    quesMode: string;
    answered?: DataSet;
    questionsObject: {[key:string]: Que} = {};
    questionsPaging: {[key: number]: Array<Que>} = {};
    questionsArray: Array<Que> = [];
    currentQuestion: Array<Que> = [];
    currentPage: number = 1;
    totalPage: number = 1;
    surveyConfig: SurveyConfig;
    projectConfig?: ProjectConfig;
    pageUserScript?: string;
    quota?: Array<QuotaSet>;
    loopCnt: number = 0;
    jumpPage?: number;
    jumpQtn?: string;

    constructor({ projectID, surveyMode, quesMode, groupID, responseID, jumpPage, jumpQtn, surveyConfig }: { projectID: string, surveyMode: string, quesMode: string, groupID: string, responseID: string, jumpPage: string, jumpQtn: string, surveyConfig: SurveyConfig }) {
        this.projectID = projectID;
        this.surveyMode = surveyMode;
        this.quesMode = quesMode;
        this.groupID = groupID;
        this.responseID = responseID;
        this.surveyConfig = surveyConfig;
        if (jumpPage !== '') this.jumpPage = +jumpPage;
        if (jumpQtn !== '') this.jumpQtn = jumpQtn;

    }

    //최초로 한번만 가져온다
    private async getSurvey(): Promise<{
        questionsPaging: { [key: number]: Array<Que> },
        questionsObject: { [key: string]: Que},
        questionsArray: Array<Que>,
        currentQuestion: Array<Que>,
        answered: DataSet,
        currentPage: number,
        totalPage: number,
        errMsg?: string,
        pageUserScript?: string ,
        quota?: Array<QuotaSet>,
        projectConfig?: ProjectConfig,
        userAgent: object
        }>
    {
        let rtn: {
            questionsPaging: { [key: number]: Array<Que> },
            questionsObject: { [key: string]: Que},
            questionsArray: Array<Que>,
            currentQuestion: Array<Que>,
            answered: DataSet,
            currentPage: number,
            totalPage: number,
            errMsg?: string,
            pageUserScript?: string ,
            quota?: Array<QuotaSet>,
            projectConfig: ProjectConfig,
            userAgent: object
        };
        rtn = {questionsPaging: {}, questionsObject: {}, questionsArray: [], currentQuestion: [], answered: {} as DataSet, currentPage:1, totalPage: 1, quota: [], projectConfig: {} as ProjectConfig, userAgent: {}};
        console.time('getSurvey');
        let response = await $http.post('/api/getSurvey', {projectID: this.projectID, responseID: this.responseID, groupID: this.groupID, mode: 'file'});
        if(response.status === 200) {
            rtn.answered = response.data.answered;
            rtn.questionsObject = response.data.questionsObject;
            rtn.questionsArray = Object.values(response.data.questionsObject);
            rtn.questionsPaging =rtn.questionsArray.reduce((a,b) => {
                a[b.PageNum] = a[b.PageNum] || [];
                a[b.PageNum].push(b);
                return a;
            }, Object.create(null));
            if (rtn.questionsArray[rtn.questionsArray.length-1]) rtn.totalPage = rtn.questionsArray[rtn.questionsArray.length-1].PageNum;
            if (response.data.pageUserScript) rtn.pageUserScript = response.data.pageUserScript;
            rtn.quota = response.data.quota;
            rtn.userAgent = response.data.userAgent;
            this.totalPage = rtn.totalPage;
        }
        let responseConfig = await $http.post('/api/getConfig',{projectID: this.projectID});
        if (responseConfig.status === 200) rtn.projectConfig = responseConfig.data;
        console.timeEnd('getSurvey');

        console.log(`%c
███████╗██╗   ██╗██████╗ ██╗   ██╗███████╗██╗   ██╗    ██████╗ ███████╗ ██████╗ ██████╗ ██╗     ███████╗
██╔════╝██║   ██║██╔══██╗██║   ██║██╔════╝╚██╗ ██╔╝    ██╔══██╗██╔════╝██╔═══██╗██╔══██╗██║     ██╔════╝
███████╗██║   ██║██████╔╝██║   ██║█████╗   ╚████╔╝     ██████╔╝█████╗  ██║   ██║██████╔╝██║     █████╗  
╚════██║██║   ██║██╔══██╗╚██╗ ██╔╝██╔══╝    ╚██╔╝      ██╔═══╝ ██╔══╝  ██║   ██║██╔═══╝ ██║     ██╔══╝  
███████║╚██████╔╝██║  ██║ ╚████╔╝ ███████╗   ██║       ██║     ███████╗╚██████╔╝██║     ███████╗███████╗
╚══════╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝   ╚═╝       ╚═╝     ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚══════╝

        `,'color:red;font-size:0.7rem;');


        return rtn;
    }

    public async getNext(saveData: { projectID: string, objectID: string, groupID: string, responseID: string, fieldWorkID: string, pageNum: number, surveyData: Array<object>, routes: {route: string, outMarker: string}, }): Promise<boolean> {
        try {
            let response = await $http.post('/api/setSurveyData', saveData);
            if (response.status === 200) {
                if(response.data.errMsg){
                    alert(response.data.errMsg);
                }
                if (response.data.answered) {
                    this.answered = response.data.answered;
                    //MARK: ROUTE 로직?
                    switch (saveData.routes.route.toUpperCase()) {
                        case 'S':
                            let ct = await this.checkTerminate(saveData.routes);
                            this.currentQuestion = await this.goOut(QuestionType.Terminate, ct.routes);
                            this.currentPage = this.totalPage;
                            return true;
                            break;
                        case 'C':
                            break;
                        case 'Q':
                            break;
                        default:
                            break;
                    }

                    //MARK: 쿼터 체크
                    let cq = await this.checkQuota();
                    if (!cq.result) {
                        let que = await this.goOut(QuestionType.QuotaOver, cq.quota);
                        this.currentQuestion = que;
                        this.currentPage = this.totalPage;
                    } else {
                        let lastModule = this.getLastModule();
                        this.currentQuestion = await this.getCurrentPage(lastModule); //NEXT METHODS;
                        if (this.currentQuestion.find(cq => cq.QtnType === QuestionType.End)){
                            this.currentQuestion = await this.goOut(QuestionType.End);
                        }
                    }
                }
            }
        } catch (e) {
            alert(e.message);
            console.log(e);
        }
        return true;
    }

    public async getPrev(saveData: object): Promise<Array<Que>>{
        try {
            let response = await $http.post('/api/setSurveyPrev', saveData);
            if (response.status === 200) {
                if(response.data.errMsg){
                    alert(response.data.errMsg);
                }
                if (response.data.answered) {
                    this.answered = response.data.answered;
                    let lastModule = this.getLastModule();
                    this.currentQuestion = this.getPrevPage(lastModule);    //PREV METHODS
                }
            }
        } catch (e) {
            console.log(e);
        }
        return this.currentQuestion;
    }

    private async goOut(status: QuestionType, examples?: Array<Ex>): Promise<Array<Que>> {
        try {
            let response;
            switch (status) {
                case QuestionType.Terminate:
                    response = await $http.post('/api/setStatus', {projectID: this.projectID, objectID: this.objectID, responseID: this.responseID, groupID: this.groupID, status: QuestionType.Terminate});
                    if (response.status === 200) {
                        if (response.data.answered) this.answered = response.data.answered;
                    }
                    if (this.groupID === GroupID.TG) {
                        return [this.getTerminateDesc(examples), this.getTerminate()];
                    }
                    return [this.getTerminate()];
                    break;
                case QuestionType.QuotaOver:
                    //TODO: DB에 STATUS
                    response = await $http.post('/api/setStatus', {projectID: this.projectID, objectID: this.objectID, responseID: this.responseID, groupID: this.groupID, status: QuestionType.QuotaOver});
                    if (response.status === 200) {
                        if (response.data.answered) this.answered = response.data.answered;
                    }
                    if (this.groupID === GroupID.TG) {
                        return [this.getQuotaCheck(examples),this.getQuotaOver()];
                    }
                    return [this.getQuotaOver()];
                    break;
                case QuestionType.End:
                    //TODO: DB에 STATUS
                    response = await $http.post('/api/setStatus', {projectID: this.projectID, objectID: this.objectID, responseID: this.responseID, groupID: this.groupID, status: QuestionType.End});
                    if (response.status === 200) {
                        if (response.data.answered) this.answered = response.data.answered;
                    }
                    return [this.getEnd()];
                    break;
                default:
                    break;
            }
        } catch(e) {

        }
        return [this.getEnd()];
    }

    private getLastModule () {
        if (this.answered === undefined) return '__start';
        let history = this.answered.history;
        if (history === undefined) return '__start';
        if (!Array.isArray(history)) return '__start';
        if(!history.length) return '__start';
        let lastModule;
        lastModule = history.slice(-1);

        if (!lastModule.length ) return '__start';
        lastModule = lastModule.pop();
        //JUMP PAGE가 있으면
        if (this.jumpPage) {
            let p = this.questionsPaging[this.jumpPage];
            if (p) {
                let q = p.find(_p => _p.PQID === 1);
                if (q) lastModule = q.QtnName;
            }
        }

        //JUMP QTN
        if (this.jumpQtn) {
            let q = this.questionsObject[this.jumpQtn];
            if (q) lastModule = q.QtnName;
        }

        this.jumpPage = undefined;
        this.jumpQtn = undefined;

        return lastModule;
    }

    private getEnd (): Que {
        let que: Que;
        que = {
            AnsColCount: 0, AnsDntknowVal: 0, AnsDpType: 0, AnsEtcOpen: 0, AnsEtcVal: '', AnsMaxLen: 0, AnsMaxVal: 0, AnsMinVal: 0, AnsNonVal: 0, AnsUnit: 0, Ansgrade: '', Block: '', CateDpType: 0, FlowbyResponse: '',
            Gradation: 0, PQID: 0, PageNum: (this.totalPage+1), Qidx: 0,
            QtnName: '__end', QtnType: QuestionType.End,
            QuestionText: this.surveyConfig.langCls.defaultEndMsg(), RegDate: '', ResponseCntForce: 0, ResponseCount: 0, RotationGroup: '', ScaleWidth: 0, StayTime: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)), Examples: []
        };
        return que;
    }

    private getQuotaCheck(ex?: Array<Ex>): Que {
        let que: Que;
        que = {
            AnsColCount: 0, AnsDntknowVal: 0, AnsDpType: 0, AnsEtcOpen: 0, AnsEtcVal: '', AnsMaxLen: 0, AnsMaxVal: 0, AnsMinVal: 0, AnsNonVal: 0, AnsUnit: 0, Ansgrade: '', Block: '', CateDpType: 0, FlowbyResponse: '',
            Gradation: 0, PQID: 0, PageNum: (this.totalPage+1), Qidx: 0,
            QtnName: '__quotaCheck', QtnType: QuestionType.QuotaCheck,
            QuestionText: this.surveyConfig.langCls.defaultQuotaCheckMsg(), RegDate: '', ResponseCntForce: 0, ResponseCount: 0, RotationGroup: '', ScaleWidth: 0, StayTime: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)), Examples: ex || []
        };
        return que;
    }

    private getQuotaOver(): Que {
        let que: Que;
        que = {
            AnsColCount: 0, AnsDntknowVal: 0, AnsDpType: 0, AnsEtcOpen: 0, AnsEtcVal: '', AnsMaxLen: 0, AnsMaxVal: 0, AnsMinVal: 0, AnsNonVal: 0, AnsUnit: 0, Ansgrade: '', Block: '', CateDpType: 0, FlowbyResponse: '',
            Gradation: 0, PQID: 0, PageNum: (this.totalPage+1), Qidx: 0,
            QtnName: '__quotaOver', QtnType: QuestionType.QuotaOver,
            QuestionText: this.surveyConfig.langCls.defaultQuotaOverMsg(), RegDate: '', ResponseCntForce: 0, ResponseCount: 0, RotationGroup: '', ScaleWidth: 0, StayTime: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)), Examples: []
        };
        return que;
    }

    private getTerminate(): Que {
        let que: Que;
        que = {
            AnsColCount: 0, AnsDntknowVal: 0, AnsDpType: 0, AnsEtcOpen: 0, AnsEtcVal: '', AnsMaxLen: 0, AnsMaxVal: 0, AnsMinVal: 0, AnsNonVal: 0, AnsUnit: 0, Ansgrade: '', Block: '', CateDpType: 0, FlowbyResponse: '',
            Gradation: 0, PQID: 1, PageNum: (this.totalPage+1), Qidx: 0,
            QtnName: '__terminate', QtnType: QuestionType.Terminate,
            QuestionText: this.surveyConfig.langCls.defaultTerminateMsg(), RegDate: '', ResponseCntForce: 0, ResponseCount: 0, RotationGroup: '', ScaleWidth: 0, StayTime: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)), Examples: []
        };
        return que;
    }

    private getTerminateDesc(ex?: Array<Ex>): Que {
        let que: Que;
        que = {
            AnsColCount: 0, AnsDntknowVal: 0, AnsDpType: 0, AnsEtcOpen: 0, AnsEtcVal: '', AnsMaxLen: 0, AnsMaxVal: 0, AnsMinVal: 0, AnsNonVal: 0, AnsUnit: 0, Ansgrade: '', Block: '', CateDpType: 0, FlowbyResponse: '',
            Gradation: 0, PQID: 0, PageNum: (this.totalPage+1), Qidx: 0,
            QtnName: '__terminateCheck', QtnType: QuestionType.TerminateCheck,
            QuestionText: this.surveyConfig.langCls.defaultTerminateCheckMsg(), RegDate: '', ResponseCntForce: 0, ResponseCount: 0, RotationGroup: '', ScaleWidth: 0, StayTime: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)), Examples: ex || []
        };
        return que;
    }

    private getErrorPage(): Que {
        let que: Que;
        que = {
            AnsColCount: 0, AnsDntknowVal: 0, AnsDpType: 0, AnsEtcOpen: 0, AnsEtcVal: '', AnsMaxLen: 0, AnsMaxVal: 0, AnsMinVal: 0, AnsNonVal: 0, AnsUnit: 0, Ansgrade: '', Block: '', CateDpType: 0, FlowbyResponse: '',
            Gradation: 0, PQID: 0, PageNum: (this.totalPage+1), Qidx: 0,
            QtnName: '__error', QtnType: QuestionType.QuotaOver,
            QuestionText: this.surveyConfig.langCls.defaultQuotaOverMsg(), RegDate: '', ResponseCntForce: 0, ResponseCount: 0, RotationGroup: '', ScaleWidth: 0, StayTime: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)), Examples: []
        };
        return que;
    }

    public async getQuotaCntSpecific(questions: Array<{key: string, value: string}>): Promise<number> {
        let cnt = 0;
        try {
            let response = await $http.post('/api/getQuotaCntSpecific', {projectID: this.projectID, questions: questions});
            if (response.status === 200) {
                if(response.data.errMsg){
                    alert(response.data.errMsg);
                }
                if (response.data.cnt) {
                    cnt= response.data.cnt;
                }
            }
        } catch (e) {
            alert(e.message);
        }
        return cnt;
    }

    // 어디까지 응답했나 찾기-
    // TODO : 로직이 있는 경우 적용
    private async getCurrentPage (lastModule: string): Promise<Array<Que>> {
        let currentQues: Array<Que>;
        let page = 0;
        let lastModuleObject = this.questionsObject[lastModule];
        let filterTF =  ({item, last }: {item: Que, last: Que}) :boolean => {
            return lastModule === '__start' ? true : (item.PageNum === last.PageNum && item.PQID > last.PQID);
        };
        if (lastModule === '__start') {
            page = 1;
        } else if (lastModule === '__end') {
            this.currentPage = this.totalPage;
            return [this.getEnd()];
        } else if (lastModule === '__terminate') {
            this.currentPage = this.totalPage;
            return [this.getTerminate()];
        } else if (lastModule === '__quotaOver') {
            console.log(lastModule);
            this.currentPage = this.totalPage;
            return [this.getQuotaOver()];
        } else {
            if (lastModuleObject === undefined) {
                this.currentPage = this.totalPage;
                return [this.getErrorPage()];
            }
            let lastPage = lastModuleObject.PageNum;
            if (this.questionsPaging[lastPage+1] === undefined) return [this.getEnd()];

            //MARK: 페이지 기반으로 찾다가 바꿈.
            lastModule = this.getNextQuestion(lastModuleObject).QtnName;
            let flowResult = this.getFlowResponse(lastModule,1);
            if(flowResult.QtnType === QuestionType.End) return await this.goOut(QuestionType.End);
            if(flowResult.QtnType === QuestionType.Terminate) return await this.goOut(QuestionType.Terminate);
            page = flowResult.PageNum;
        }

        this.currentPage = page;
        if (this.questionsPaging[page] === undefined) return [this.getEnd()];
        let remainModule = this.questionsPaging[page].filter(item => filterTF({item: item, last: lastModuleObject}));
        if (remainModule.length) {
            currentQues = remainModule;
        } else {
            currentQues = this.questionsPaging[page].map(item => this.questionsObject[item.QtnName]);
        }
        let logicResultQues = this.getCurrentQuestionByDisplayLogic(currentQues);
        currentQues = logicResultQues.ques;
        lastModuleObject = logicResultQues.lastQue;

        //MARK: 현재 문항이 0개면 다음 페이지로 넘어가야함
        if (!currentQues.length) {
            let getNextQuestion = this.getNextQuestion(lastModuleObject);
            if (getNextQuestion) {
                return this.getCurrentPage(getNextQuestion.QtnName);
            }
        } else {
        }

        //MARK: PAGE에 문항이 2개 이상이고, HIDDEN이 있으면
        if (currentQues.length > 1 && currentQues.find(item => item.QtnType === QuestionType.Hidden) && currentQues.find(item => item.QtnType !== QuestionType.Hidden)){
            currentQues = currentQues.filter(item => item.QtnType !== QuestionType.Hidden);
        }
        return currentQues;
    }

    //바로 뒤에 문항 찾기
    private getNextQuestion(que: Que): Que {
        let lastPage = que.PageNum;
        if (this.questionsPaging[lastPage+1] === undefined) {
            console.error('no next');
            return this.getEnd();
        }

        //MARK: 페이지 기반으로 찾다가 바꿈.
        let remainModule = this.questionsPaging[lastPage].find(cq => cq.PageNum === que.PageNum && cq.PQID > que.PQID);
        if (!remainModule) remainModule = this.questionsPaging[lastPage+1][0];

        return remainModule;
    }

    private getCurrentQuestionByDisplayLogic(currentQues: Array<Que>): {ques:Array<Que>,lastQue: Que} {
        let returnQues: Array<Que> = [];
        for(let que of currentQues) {
            let logic = que.displayLogic || '';
            if (logic.trim() === '') {
                returnQues.push(que);
            } else {
                if (this.surveyConfig.logicMode === LogicMode.ASP) {
                    let dv = Common.duplicateFlowQuestionNumber(logic);
                    let evalFunc = this.getRewriteAnswered(dv);
                    logic = Common.flowReplacer(logic);
                    evalFunc += `return (${logic.replace(/"(\d+)"/g,'$1')});`;
                    let logicResult = new Function (evalFunc);
                    if (logicResult()) returnQues.push(que);
                } else if(this.surveyConfig.logicMode === LogicMode.JAVASCRIPT) {
                }
            }
        }

        return {ques: returnQues, lastQue: currentQues[currentQues.length-1]};
    }

    private getPrevPage(lastModule: string): Array<Que> {
        let currentQues: Array<Que>;
        let page = 0;

        if (lastModule === '__start') {
            page = 1;
        } else if (lastModule === '__end'){
            this.currentPage = this.totalPage;
            return [this.getEnd()];
        } else if (lastModule === '__terminate'){
            this.currentPage = this.totalPage;
            return [this.getTerminate()];
        } else {
            let lastPage = this.questionsObject[lastModule].PageNum;
            if (this.questionsPaging[lastPage] === undefined) return [this.getEnd()];
            let flowResult = this.getFlowResponse(lastModule);
            if(flowResult.QtnType === QuestionType.End) return [this.getEnd()];
            if(flowResult.QtnType === QuestionType.Terminate) return [this.getTerminate()];
            page = flowResult.PageNum;
        }
        this.currentPage = page;
        if (this.questionsPaging[page] === undefined) return [this.getEnd()];
        currentQues = this.questionsPaging[page].map(item => {
            return this.questionsObject[item.QtnName];
        });

        //MARK: PAGE에 문항이 2개 이상이고, HIDDEN이 있으면
        //TODO: 로직에 오류가 있을 수 있음.
        if (currentQues.length > 1 && currentQues.find(item => item.QtnType === QuestionType.Hidden && item.QtnName === lastModule)){
            currentQues = currentQues.filter(item => item.QtnType === QuestionType.Hidden);
        } else if (currentQues.length > 1 && currentQues.find(item => item.QtnType === QuestionType.Hidden) && currentQues.find(item => item.QtnType !== QuestionType.Hidden)) {
            currentQues = currentQues.filter(item => item.QtnType !== QuestionType.Hidden);
        }
        return currentQues;
    }

    private getFlowResponse (lastModule: string, cnt?: number): Que {
        if (cnt) {
            this.loopCnt += 1;
        } else {
            this.loopCnt = 1;
        }

        if(this.loopCnt>290)throw Error(`${this.loopCnt}`);

        let que: Que;
        que = this.questionsObject[lastModule];
        if (que === undefined) return this.getEnd();
        //로직이 있다면
        if(que.FlowbyResponse) {
            //로직 문법이 ASP네? ㅜㅜ
            if (this.surveyConfig.logicMode === LogicMode.ASP) {
                let flowResult = this.getFlowByASP(que);
                if (!flowResult.flag) {
                    if (flowResult.nextModule) {
                        //MARK : 탈락이면.
                        if (flowResult.nextModule.QtnType === QuestionType.Terminate) {
                            return flowResult.nextModule;
                        }
                        return this.getFlowResponse(flowResult.nextModule.QtnName, 1);
                    }
                } else {
                }
                //로직 문법이 JAVASCRIPT네?
            }  else if(this.surveyConfig.logicMode === LogicMode.JAVASCRIPT) {

            }
        }
        return que;
    }

    //ASP PRASER
    private getFlowByASP (que: Que): {flag: boolean, nextModule?: Que} {
        if (this.answered === undefined) return {flag: true};
        if (this.answered.surveyData === undefined) return {flag: true};
        let answered = this.answered.surveyData;
        let flowRaw = que.FlowbyResponse;

        if(flowRaw === undefined) return {flag: true};
        if(!flowRaw.trim().length) return {flag: true};
        let flowArray = flowRaw.split('|');
        let flow = flowArray[0];
        //첫째로 조건에 나오는 문번호가 DB에 없을 수 있기 때문에 벗기자
        let dv = Common.duplicateFlowQuestionNumber(flow);
        let notModule = flowArray[1];
        flow = Common.flowReplacer(flow);
        let evalFunc = this.getRewriteAnswered(dv);

        //MARK: 아래 치환은 string을 숫자형으로
        //EXAMPLE: "1" && "5"  ====> 1 && 5
        evalFunc += `return (${flow.replace(/"(\d+)"/g,'$1')});`;
        let logicResult = new Function (evalFunc);
        let flag: boolean = logicResult();
        console.log(`%c${que.PageNum}(${que.PageNum/Object.keys(this.questionsPaging).length * 100}) /%c${que.QtnName}-%c${que.FlowbyResponse}-%c${que.displayLogic} / %c${notModule}`,'color:red;font-size:1rem;','color:red;','color:blue;','color:grey;','color:pink;');
        if ( flag === false) {
            let nextModuleIdx = this.questionsArray.findIndex(q => q.Qidx === que.Qidx);
            if (nextModuleIdx >= this.questionsArray.length) return {flag: true, nextModule: this.getEnd()};
            let nextModule = this.questionsArray[nextModuleIdx+1];
            //MARK: 특수한 경우가 있음
            if (notModule) {
                if (notModule === NextModule.Terminate) {
                    nextModule = this.getTerminate();
                } else {
                    nextModule = this.questionsObject[notModule.replace(/\s/g,'')];
                    if (nextModule === undefined) {
                        nextModule = this.getNextQuestion(que);
                    }
                }
            } else {
                nextModule = this.getNextQuestion(que);
                return {flag: flag, nextModule: nextModule};
            }
            if (nextModule === undefined) flag = true;
            return {flag: flag, nextModule: nextModule};
        }
        return {flag: flag};
    }

    private getRewriteAnswered(dv: Set<string>): string {
        if (this.answered === undefined) return '';
        if (this.answered.surveyData === undefined) return '';
        let answered = this.answered.surveyData;
        let evalFunc = '';
        for(let key of Array.from(dv)){
            let value;
            let question: Que = this.questionsObject[key];
            value = answered[key];
            if (question) {
                //TODO: CNT를 적용할 수 있는 문항 유형들은 추후에 추가
                switch (question.QtnType) {
                    case QuestionType.TextSingle:
                        value = question.Examples.map(ex => answered[`${question.QtnName}_${ex.ExampleVal}`].value)
                            .filter(data => data !== undefined && data.trim().length);
                        break;
                    default:
                        break;
                }
            }
            if (value === undefined) {
                value = "";
                evalFunc += `const ${key} = ""`;
                evalFunc += ";";
            } else {
                if (Array.isArray(value)) {
                    evalFunc += `const ${key} = ${value.length};`;
                } else {
                    value = JSON.stringify(value.value|| '');
                    evalFunc += `const ${key} = `;
                    let replaceNumber = value.replace(/\"/g,'');
                    if(isNaN(Number(replaceNumber))) replaceNumber = JSON.stringify(replaceNumber);
                    if(replaceNumber === "" ) replaceNumber = JSON.stringify(replaceNumber);
                    evalFunc += replaceNumber;
                    evalFunc += ";";
                }
            }
        }

        return evalFunc;
    }

    async checkTerminate(routes: {route: string, outMarker: string}) : Promise<{result: boolean, routes?: Array<Ex>}> {
        let ex: Ex = {
            Eidx: 0,
            SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)),
            FlowbyResponse: '',
            QtnName: '',
            ExampleVal: 1,
            ExampleText: `${routes.outMarker} => ${routes.route}`,
            SkipByExample: '',
            AnsMaxLen: 0,
            AnsMaxVal: 0,
            AnsMinVal: 0,
            Checked: true,
            Show: true,
        };
        return {result: true, routes: [ex]};
    }

    async checkQuota (): Promise<{result: boolean, quota?: Array<Ex>}> {
        let quota: Array<QuotaSet> = [], answered: DataSet, surveyData: object = {};// = this.surveyLoader.quota;

        if (this.quota && this.answered) {
            answered = this.answered || {};
            surveyData = answered.surveyData|| {};
            //MARK: 현재 페이지와 maxpage가 같으면..
            quota = this.quota.filter(q => q.maxPage === this.currentPage);
            if(quota.length) {
                for(let q of quota) {
                    let check = q.questions.find(q => surveyData[q] === undefined);
                    let quotaValues = q.quotaValues.slice(0);
                    //  check가 undefined라면 응답이 모두 있는 거다
                    if (check === undefined) {
                        let values: Array<{key: string, value: string}> = q.questions.map(q => {
                            let obj: {key: string, value: string} = {key: '', value: ''};
                            obj.key = q;
                            obj.value = surveyData[q].value;
                            return obj;
                        });
                        let quotaCnt = quotaValues.find(quota => {
                            if (quota['name'] === values.map(v => v['key']).join('/') && quota['value'] === values.map(v => v['value']).join('/'))return true;
                            return false;
                        });
                        if (quotaCnt) {
                            let dataCnt = await this.getQuotaCntSpecific(values);
                            let cnt = +quotaCnt.cnt;
                            let rtnQuota = quotaValues.map(obj => obj);
                            let rtnExamples : Array<Ex> = rtnQuota.map((q,i) => {
                                let ex: Ex;
                                ex = {
                                    Eidx: i,
                                    SurveyID: Number(this.projectID.replace(/[^\d.-]/g, '').substr(0,5)),
                                    FlowbyResponse: '',
                                    QtnName: '',
                                    ExampleVal: i,
                                    ExampleText: `${q.name} - ${q.value} : ${q === quotaCnt ? dataCnt + '/' + q.cnt : q.cnt}`,
                                    SkipByExample: '',
                                    AnsMaxLen: 0,
                                    AnsMaxVal: 0,
                                    AnsMinVal: 0,
                                    Checked: q === quotaCnt,
                                    Show: true,
                                };
                                return ex;
                            });
                            //탈락
                            if (cnt <= dataCnt)return {result: false, quota: rtnExamples};
                        }
                    }
                }
            }
        }
        return {result: true};
    }

    public async init () {
        try{
            let getSurvey = await this.getSurvey();
            if (getSurvey.errMsg) {
                alert(getSurvey.errMsg);
                return false;
            }
            this.questionsPaging = getSurvey.questionsPaging;
            this.questionsObject = getSurvey.questionsObject;
            this.questionsArray = getSurvey.questionsArray;
            this.currentPage = getSurvey.currentPage;
            this.totalPage = getSurvey.totalPage;
            this.answered = getSurvey.answered;
            this.objectID = this.answered._id;
            if (getSurvey.pageUserScript) this.pageUserScript = getSurvey.pageUserScript;
            let lastModule = this.getLastModule();
            this.currentQuestion = await this.getCurrentPage(lastModule);
            this.quota = getSurvey.quota;
            this.projectConfig = getSurvey.projectConfig;

            return {
                objectID: this.objectID,
                answered: this.answered,
                questionsPaging: this.questionsPaging,
                questionsArray: this.questionsArray,
                currentQuestion: this.currentQuestion,
                currentPage: this.currentPage,
                totalPage: this.totalPage,
                pageUserScript: this.pageUserScript,
                quota: this.quota,
                projectConfig: this.projectConfig,
                userAgent: getSurvey.userAgent
            };
        } catch (e) {
            console.log(e);
        }
    }
}