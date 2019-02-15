import  { QuestionType } from '../enum/QuestionType'
import Ex from './Ex.vo'
export interface Que {
    AnsColCount: number;
    readonly AnsDntknowVal: number;
    readonly AnsDpType: number;
    readonly AnsEtcOpen: number;
    readonly AnsEtcVal: string;
    readonly AnsMaxLen: number;
    readonly AnsMaxVal: number;
    readonly AnsMinVal: number;
    readonly AnsNonVal: number;
    readonly AnsUnit: number;
    readonly Ansgrade: string;
    readonly Block: string;
    readonly CateDpType: number;
    readonly FlowbyResponse: string;
    readonly Gradation: number;
    readonly PQID: number;
    readonly PageNum: number;
    readonly Qidx: number;
    readonly QtnName: string;
    readonly QtnType: QuestionType;
    QuestionText: string;
    readonly RegDate: String;
    readonly ResponseCntForce: number;
    readonly ResponseCount: number;
    readonly RotationGroup: string;
    readonly ScaleWidth: number;
    readonly StayTime: number;
    readonly SurveyID: number;
    readonly displayLogic?: string;
    Examples: Array<Ex>;
}