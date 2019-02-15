export default interface Ex {
    readonly Eidx: number,
    readonly SurveyID: number,
    readonly FlowbyResponse: string,
    readonly QtnName: string,
    readonly ExampleVal: number,
    ExampleText: string,
    readonly SkipByExample: string,
    readonly AnsMaxLen: number,
    readonly AnsMaxVal: number,
    readonly AnsMinVal: number,
    Show: boolean,
    hidden?: boolean,
    Checked?: boolean
}