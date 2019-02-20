import { QuotaDistManager } from "../quota/QuotaManager";


(async function () {
    function getQS (key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }
    let quotaDistManager = new QuotaDistManager(getQS('pid'));
    await quotaDistManager.init();
})();