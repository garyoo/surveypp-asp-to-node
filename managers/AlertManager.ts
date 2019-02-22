import $ from 'jquery';
import alertifyjs from 'alertifyjs';
import 'alertifyjs/build/css/alertify.min.css';
import 'alertifyjs/build/css/themes/bootstrap.min.css';
import set = Reflect.set;
import ClickEvent = JQuery.ClickEvent;


export default class AlertManager  {
    private backgroundDiv?: HTMLDivElement;
    private modalDiv?: HTMLDivElement;
    private targetDom?: HTMLElement;
    private message?: string;
    private isBlock: boolean = false;
    private aosEffect: Array<string> = [
        'fade-up',
        'fade-down',
        'fade-right',
        'fade-left',
        'fade-up-right',
        'fade-up-left',
        'fade-down-right',
        'fade-down-left',
        'flip-left',
        'flip-right',
        'flip-up',
        'flip-down',
        'zoom-in',
        'zoom-in-up',
        'zoom-in-down',
        'zoom-in-left',
        'zoom-in-right',
        'zoom-out',
        'zoom-out-up',
        'zoom-out-down',
        'zoom-out-right',
        'zoom-out-left',
    ];
    private blockTF: boolean = false;

    constructor(){

    }

    block(): void{
        document.body.style.overflowY = 'hidden';
        this.backgroundDiv = document.createElement('div');
        this.backgroundDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.backgroundDiv.style.position = 'fixed';
        this.backgroundDiv.style.left = '0';
        this.backgroundDiv.style.top = '0';
        this.backgroundDiv.style.zIndex = '999';
        this.backgroundDiv.style.width = '100vw';
        this.backgroundDiv.style.height = '100vh';
        document.body.appendChild(this.backgroundDiv);
    }

    dialog(): void {
        if (this.isBlock) return;
        this.isBlock = true;
        this.block();
        this.modalDiv = document.createElement('div');
        let top: number = 0;
        let left: number = 0;

        if (this.targetDom) {
            let rect = this.targetDom.getBoundingClientRect();
            top = rect.top + window.pageYOffset - this.targetDom.clientTop + this.targetDom.offsetHeight/2;
            left = rect.left + window.pageXOffset - this.targetDom.clientLeft + this.targetDom.offsetWidth/2;
            left += 10; //BUBBLE ARROW
            this.targetDom.scrollIntoView();
        }

        this.modalDiv.setAttribute('data-aos',this.aosEffect[Math.floor(Math.random() * this.aosEffect.length)]);
        this.modalDiv.style.position = 'absolute';
        this.modalDiv.style.top = `${top}px`;
        this.modalDiv.style.left = `${left}px`;
        this.modalDiv.style.zIndex = '1000';
        this.modalDiv.className = 'text-white bg-danger rounded-bottom rounded-right survey-valid-dialog';
        let closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-sm btn-default';
        closeBtn.innerText = 'OK';

        closeBtn.addEventListener('click', evt=> this.enterClose());

        if (this.backgroundDiv) this.backgroundDiv.addEventListener('click', (evt) => this.backgroundClose(evt), false);

        this.modalDiv.innerHTML = `<div class="w-100 p-3 border-bottom font-weight-bold">${this.message}</div>`;
        let buttonDiv = document.createElement('div');
        buttonDiv.className = 'w-100 text-right p-2';
        this.modalDiv.appendChild(buttonDiv);
        buttonDiv.appendChild(closeBtn);
        document.body.appendChild(this.modalDiv);
        window.addEventListener('resize', () => this.enterClose(), false);
        document.addEventListener('keydown', (evt) => this.keyboardEvent(evt), false);
        this.blockTF = true;
    }

    enterClose(): void {
        this.close();
    }

    backgroundClose(evt: MouseEvent): void {
        this.close();
    }

    close(): void {
        if (this.blockTF) {
            if (this.backgroundDiv) document.body.removeChild(this.backgroundDiv);
            if (this.modalDiv) document.body.removeChild(this.modalDiv);
            document.body.style.overflowY = 'auto';
        }
        if (this.targetDom) {
            this.targetDom.focus();
        }

        this.blockTF = false;
        window.removeEventListener('resize', this.enterClose, false);
        document.removeEventListener('keydown', this.keyboardEvent, false);
        if (this.backgroundDiv) this.backgroundDiv.removeEventListener('click', this.backgroundClose, false);
        this.isBlock = false;
    }

    keyboardEvent(evt): void {
        if (evt.keyCode === 27 && !evt.ctrlKey) this.close();           //ESC
        else if(evt.keyCode === 13 && !evt.ctrlKey) this.close();      //ENTER
        else if(evt.keyCode === 3 && !evt.ctrlKey) this.close();      //SPACE
    }

    alert(queName: string, message: string, dom: HTMLElement) {
        this.message = message;
        if(dom) this.targetDom = dom;
        this.dialog();
    }
}
