import $ from "jquery";

export default class topMenu {
    $navItem: JQuery<HTMLButtonElement>;
    authorize: boolean;

    constructor() {
        this.authorize = false;
        this.$navItem = $('.nav-item');
        this.$navItem.on('mouseover', evt => {
            console.log('test');
        });
    }

    newQuotaToggle(flag: boolean): void {
        /*
        if (flag === true) {
            $('#new-quota-wrapper').removeClass('d-none');
            $('#show-quota-wrapper').addClass('d-none');
        } else {
            $('#new-quota-wrapper').addClass('d-none');
            $('#show-quota-wrapper').removeClass('d-none');
        }
        */
    }
}