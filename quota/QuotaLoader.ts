import $http from 'axios';

export default class QuotaLoader {
    _questions?: {};
    constructor(private projectID: string){
        this.getQuestions().then((data) => {
            this.questions = data;
        });
    }

    get questions() {
        return this._questions;
    }

    set questions(value) {
        this._questions = value;
    }

    async getQuestions(): Promise<object> {
        try{
            let response = await $http.post('/api/getQuestions',{projectID: this.projectID});
            if (response.status === 200) return response.data.questionsObject;
            return {};
        } catch(e) {
            return {errMsg: e.message};
        }
    }

    async getQuota(): Promise<Array<{_id: string, projectID: string, questions: Array<string>, maxPage: number, quotaValues:Array<{name: string, value:string, cnt:string}>}>> {
        try{
            let response = await $http.post('/api/getQuota',{projectID: this.projectID});
            if (response.status === 200) return response.data;
            return [];
        } catch(e) {
            return [];
        }
    }

    async getQuotaCompleteCnt(questions: Array<string>): Promise<Array<{name: string, value: string, cnt: number, comCnt: number}>> {
        try{
            let response = await $http.post('/api/getQuotaCnt',{projectID: this.projectID, questions: questions});
            if (response.status === 200) return response.data;
            return [];
        } catch(e) {
            return [];
        }
        return [];
    }



    async setQuota(params: object): Promise<object> {
        try{
            let response = await $http.post('/api/setQuota',{projectID: this.projectID, ... params});
            if (response.status === 200) return response.data;
            return {};
        } catch(e) {
            return {errMsg: e.message};
        }
    }

    async removeQuota(objectID: string): Promise<object> {
        try{
            let response = await $http.post('/api/removeQuota',{projectID: this.projectID, objectID: objectID});
            if (response.status === 200) return response.data;
            return {};
        } catch(e) {
            return {errMsg: e.message};
        }
    }
}