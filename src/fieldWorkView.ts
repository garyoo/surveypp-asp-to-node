import FieldWorkManager from '../cls/FieldWorkManager';

(() => {
    function getQS (key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }


    const pid = getQS('pid');
    let fieldWorkManager = new FieldWorkManager({projectID: pid});
    console.log(pid);
})();