import SurveyConfig from "../cls/SurveyConfig";
import {Lang, LogicMode} from "../enum/Config";
import {SurveyManager} from '../survey/SurveyManager';
import $http from 'axios';
(async () => {
    function getQS (key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }


    const objectID = getQS('_id');
    if (objectID) {
        let result = await $http.post(`/api/getInfoByObjectID`, {_id: objectID});
        if (result.status === 200) {
            let data = result.data;
            let params = {
                projectID: data.projectID,
                groupID: data.groupID,
                responseID: data.responseID,
                jumpPage: '',
                jumpQtn: '',
                surveyConfig: new SurveyConfig({language: Lang.KOR, logicMode: LogicMode.ASP}),
            };
            let surveyManager = new SurveyManager(params);
        }
    } else {
        let params = {
            projectID: getQS('pid'),
            groupID: getQS('grpid'),
            responseID: getQS('resid'),
            jumpPage: getQS('jumpPage'),
            jumpQtn: getQS('jumpQtn'),
            surveyConfig: new SurveyConfig({language: Lang.KOR, logicMode: LogicMode.ASP})
        };
        let surveyManager = new SurveyManager(params);
    }
})();


