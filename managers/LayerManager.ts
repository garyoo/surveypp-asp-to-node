import AOS from 'aos';
import 'aos/dist/aos.css';

class LoadingLayer{
    body: HTMLDivElement;
    messageBox: HTMLDivElement;

    constructor(private params?: {imageUrl?: string, message?: string}) {
        this.body = document.createElement('div');
        this.body.style.backgroundColor = 'rgba(255,255,255,0.7)';
        this.body.style.width = '100vw';
        this.body.style.height = '100vh';
        this.body.style.position = 'fixed';
        this.body.style.top = '0';
        this.body.style.left = '0';
        this.body.style.zIndex = '1049';

        this.messageBox = document.createElement('div');
        this.messageBox.style.width = '20vw';
        this.messageBox.style.height = '20vh';
        this.messageBox.style.position = 'relative';
        this.messageBox.style.marginLeft = 'auto';
        this.messageBox.style.marginRight = 'auto';
        this.messageBox.style.marginTop = 'calc(-50vh /2)';
        this.messageBox.style.top = '50%';
        this.messageBox.style.backgroundColor = '#e3e3e3';
        this.messageBox.style.border = 'solid 5px #f2f2f2';
        this.messageBox.style.borderRadius = '5px 5px';

        this.messageBox.style.backgroundImage = 'url("/assets/loading2.gif")';
        this.messageBox.style.backgroundRepeat = 'no-repeat';
        this.messageBox.style.backgroundPosition = 'center';
        this.messageBox.style.backgroundSize = 'contain';
        this.messageBox.style.backgroundColor = '#fff';
        this.messageBox.style.padding = '5px';
        this.messageBox.setAttribute('data-aos','fade-up');

        AOS.init();

        if(this.params) {
            if (this.params.imageUrl) {
                this.messageBox.style.backgroundImage = `url("${this.params.imageUrl}")`;
            }
            if(this.params.message) {
                this.messageBox.style.backgroundImage = '';
            }
            this.messageBox.appendChild(this.getMessageHead(this.params.message));
        } else {
            this.messageBox.appendChild(this.getMessageHead('Loading...'));
        }
        this.body.append(this.messageBox);
    }

    getMessageHead(message?: string): HTMLHeadElement {
        let text = document.createElement('h5');
        text.innerText = message||'Loading...';
        text.style.textAlign = 'center';
        text.style.color = '#000';
        return text;

    }


    toggle(flag: boolean): void {
        if (flag) {
            document.body.appendChild(this.body);
        } else {
            document.body.removeChild(this.body);
        }
    }

}

export default class LayerManager {

    loadingLayer?: LoadingLayer|null;


    constructor() {

    }


    loading(params?: {imageUrl?: string, message?: string}) {
        if(this.loadingLayer) {
            this.loadingLayer.toggle(false);
            this.loadingLayer = null;
            return;
        }

        this.loadingLayer = new LoadingLayer(params);
        this.loadingLayer.toggle(true);
        //document.body.appendChild(this.loadingLayer);
    }

}