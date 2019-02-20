import $ from "jquery";

class TopMenu {
    $navs: { [key: string]: { id:number, name:string | undefined} };
    $navLi: JQuery<HTMLLIElement>;

    constructor() {
        this.$navs = {};
        this.$navLi = $('li');
    }

    render() {
        let liCnt = $('li').length;
        for (let l=0; l< liCnt; l++) {
            this.$navs[l] = {id:l+1, name: this.$navLi.eq(l).attr('name')};
            this.$navLi.eq(l).on('mouseover', evt =>{
                this.eventShow(l);
            })
            this.$navLi.eq(l).on('mouseleave', evt =>{
                this.eventHide(l);
            })
        }
    }

    eventShow(l: number) {
        let liID = `#li-${this.$navs[l].name}`
        $(liID).addClass('show');
        $(`${liID} a`).attr('aria-expanded','true');
        $(`${liID} div`).addClass('show');
    }

    eventHide(l: number) {
        let liID = `#li-${this.$navs[l].name}`
        $(liID).removeClass('show');
        $(`${liID} a`).attr('aria-expanded','false');
        $(`${liID} div`).removeClass('show');
    }
}

(()=>{
    let topMenu = new TopMenu();
    topMenu.render();
})();