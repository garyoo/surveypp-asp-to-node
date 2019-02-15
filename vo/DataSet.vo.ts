export interface DataSet {
    _id: string;
    projectID: string;
    responseID: string;
    groupID: string;
    startSet: object;
    history: Array<{questionName: string}>;
    surveyData: object;
    fieldWorkID?: string;
    status?: number;
}

export interface QuotaSet {
    _id: string;
    projectID: string;
    questions: Array<string>;
    maxPage: number;
    quotaValues: Array<{name: string, value:string, cnt: number}>;
}