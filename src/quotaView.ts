import { QuotaManager } from "../quota/QuotaManager";

(async function () {
    function getQS (key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }
    let quotaManager = new QuotaManager(getQS('pid'), true);
    let viewer = await quotaManager.init();
})();