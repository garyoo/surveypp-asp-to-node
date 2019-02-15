import { Que } from "../../vo/Que.vo";
import $ from "jquery";
import { SurveyModule } from "../SurveyModule";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import 'plyr/dist/plyr.polyfilled.min';
import SurveyConfig from "../../cls/SurveyConfig";
import $http from 'axios';

export class VideoDisplay extends SurveyModule{
    $forms: {[key: string]: {form: HTMLVideoElement, show?: boolean, name: string, src?: string}} = {}; //전체 INPUT
    videos: Array<Plyr> = [];
    constructor({ que, answered , questions, pageUserScript }: { que: Que, answered: object, questions: object, pageUserScript?: string }) {
        super({ que: que, answered: answered, questions: questions, pageUserScript: pageUserScript });
        this.$dom = this.render();
        if (pageUserScript) {
            this.pageUserScript = pageUserScript;
            this.userFunc = this.userScript();
        }
    }

    render(): JQuery<HTMLDivElement> {
        let $div : JQuery<HTMLDivElement>;
        $div = $(`<div class="survey-wrapper p-1" data-aos="${this.aosMode}" data-aos-once="false" data-question="${this.que.QtnName}" id="survey-wrapper-${this.que.QtnName}"></div>`);
        let $questionWrapper = $(`<div class="alert alert-secondary border question-wrapper"><span data-question-number="${this.que.QtnName}" class="question-number mr-1 d-none">${this.que.QtnName}.</span></div>`) as JQuery<HTMLDivElement>;
        $questionWrapper.appendTo($div);
        this.$questionWrapper = $questionWrapper;
        let $exampleWrapper = $(`<div class="example-wrapper border border-secondary rounded12"></div>`);
        this.$form.appendTo($exampleWrapper);
        let $exampleContainer = $(`<div class="container"></div>`).appendTo(this.$form);
        let $exampleRow = $(`<div class="example-row my-2 row"></div>`).appendTo($exampleContainer);
        if (this.que.AnsColCount>12) this.que.AnsColCount = 12;
        for(let ex of this.examples) {
            let col = 12;
            if(this.que.AnsColCount) col = Math.round(12/this.que.AnsColCount);
            let $example = $(`<div class="example-cols my-1 col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 form-group text-center"></div>`);
            let formID = `${this.que.QtnName}_${ex.ExampleVal}`;
            let $video = $(`<video id="player-${formID}" Playsinline style="max-height:40vh;"></video>`) as JQuery<HTMLVideoElement>;
            $video.appendTo($example);
            this.$forms[formID] = {form: $video[0], name: formID, src: ex.ExampleText.trim()};
            $example.appendTo($exampleRow);
        }
        $exampleContainer.appendTo($questionWrapper);

        $(document).ready(evt => {
            for(let obj of Object.values(this.$forms)) {
                this.loadPlayers(obj.form, obj.name, obj.src);
            }
        });
        return $div;
    }

    getData(): object {
        let surveyData: object = {[this.que.QtnName]: true};
        return surveyData;
    }

    loadPlayers(video: HTMLVideoElement, id: string, src?: string) {
        try{
            if (!src) return;
            let playerID = `#player-${id}`;
            let url: string = src;
            let source: {src: string, type?:string, size: number, provider?: string} = {src: '', size: 640};
            if(src.includes('youtube.com')) {
                let v = src.split('v=').pop();
                if (v) src = v;
                source.src = src;
                source.provider = 'youtube';
            } else if(src.includes('vimeo.com')) {
                let v = src.split('vimeo.com/').pop();
                if(v) src= v;
                source.src = src;
                source.provider = 'vimeo';
            } else if (src.includes('.webm')) {
                source.src = src;
                source.type = 'video/webm';
            } else {
                source.src = src;
                source.type = 'video/mp4';
            }
            this.loadPlayerSuccess(playerID, source);
        } catch(e) {
            //console.log(e);
        }
    }

    loadPlayerSuccess(playerID: string, source: {src: string, type?:string, size: number, provider?: string}){
        let player = new Plyr(playerID, {
            enabled: true,
            hideControls: true,
            settings: [],
            controls: ['play-large', 'fullscreen'],
            source: {
                type: 'video',
                title: this.que.QtnName,
                sources: [source]
            }
        });

        player.source = {
            type: 'video',
            title: this.que.QtnName,
            sources: [source]
        };

        player.on('ready', evt => {
            if(!this.videos.includes(player)){
                this.videos.push(player);
                if (player.stopped === true || player.paused === true) player.play();
            }
        });

        player.on('ended', evt => {
            try{
                if (player.fullscreen.active) player.fullscreen.exit();
            } catch(e){
                console.log(e);
            }
        });
    }

    get formCheck() {
        this.valid = !this.videos.filter(v => !v.ended).length;
        if (!this.valid) {
            //MARK: VIDEO는 직접 처리 하자
            let video: Plyr = this.videos.find(v => !v.ended);
            if (video) {
                this.focus = video.elements.container;
                if (this.focus) this.focus.scrollIntoView();
            }

            this.validMsg = SurveyConfig.Instance.langCls.noEndedVideoMsg();
            return this.valid;
        }
        if (this.que.StayTime) {
            this.valid =  this.que.StayTime <= this.stayTimeCalc;
            if (!this.valid) this.validMsg = this.config.langCls.stayTimeMsg(this.que.QtnName, this.que.StayTime - this.stayTime);
        } else {
            this.valid = true;
        }
        return this.valid;
    }
}
