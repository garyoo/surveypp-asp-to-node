import { ReportManager } from "../report/ReportManager";


(async function () {
    function getQS (key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }
    let reportManager = new ReportManager(getQS('pid'), false);
    await reportManager.init();
})();