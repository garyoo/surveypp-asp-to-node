import {Lang, LogicMode} from "../enum/Config";
import {MessageManager} from "./MessageManager";


class BtnLabel {
    constructor (private language: Lang) {

    }
    get nextBtnLabel (): string {
        if (this.language === Lang.KOR){
            return '다음 페이지';
        }
        return 'Next';
    }

    get prevBtnLabel (): string {
        if (this.language === Lang.KOR){
            return '이전 페이지';
        }
        return 'Prev';
    }

}

//SINGLETON
export default class SurveyConfig {
    private static instance: SurveyConfig;
    lang: Lang;
    logicMode: LogicMode;
    nextBtnLabel: string;
    prevBtnLabel?: string;
    langCls: MessageManager;

    public static get Instance() {
        return SurveyConfig.instance;
    }

    static init ({ language, logicMode }: {language: Lang, logicMode: LogicMode}) {
        if(SurveyConfig.instance) {
            SurveyConfig.instance.logicMode = logicMode;
            SurveyConfig.instance.lang = language;
            let bl = new BtnLabel(language);
            SurveyConfig.instance.prevBtnLabel = bl.prevBtnLabel;
            SurveyConfig.instance.nextBtnLabel = bl.nextBtnLabel;
            SurveyConfig.instance.langCls = new MessageManager(language);
        }
    }

    constructor({ language, logicMode }:{language: Lang, logicMode: LogicMode}) {
        if(SurveyConfig.instance) {
            throw new Error('Exists cls');
            //SurveyConfig.instance = new SurveyConfig();
        }
        this.lang = language;
        this.logicMode = logicMode;
        let bl = new BtnLabel(language);
        this.prevBtnLabel = bl.prevBtnLabel;
        this.nextBtnLabel = bl.nextBtnLabel;
        this.langCls = new MessageManager(language);
        SurveyConfig.instance = this;
    }
}