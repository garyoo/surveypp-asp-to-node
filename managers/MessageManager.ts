import {Lang} from "../enum/Config";

export class MessageManager {
    constructor(private lang: Lang) {

    }

    defaultMsg(questionNumber: string): string {
        if(this.lang === Lang.KOR) {
            return `[${questionNumber}]을(를) 선택 혹은 입력해주세요.`;
        }
        return '';
    }

    defaultEndMsg(): string {
        if (this.lang === Lang.KOR) {
            return '설문에 응답해주셔서 감사합니다.';
        } else if (this.lang === Lang.ENG) {
            return 'Thank you for your response.';
        }
        return '';
    }

    defaultTerminateMsg(): string {
        if (this.lang === Lang.KOR) {
            return '탈락되셨습니다.';
        } else if (this.lang === Lang.ENG) {
            return 'Terminate';
        }
        return '';
    }

    defaultTerminateCheckMsg(): string {
        if (this.lang === Lang.KOR) {
            return 'Terminate (This message show only TEST mode).';
        } else if (this.lang === Lang.ENG) {
            return 'Terminate (This message show only TEST mode)';
        }
        return '';
    }

    defaultQuotaOverMsg(): string {
        if (this.lang === Lang.KOR) {
            return '응답이 중단됩니다.';
        } else if (this.lang === Lang.ENG) {
            return 'Thank you for your response.';
        }
        return '';
    }

    defaultQuotaCheckMsg(): string {
        if (this.lang === Lang.KOR) {
            return 'Quota Checker (This message show only TEST mode)';
        } else if (this.lang === Lang.ENG) {
            return 'Quota Checker (This message show only TEST mode)';
        }
        return '';
    }
    
    defaultErrorMsg(): string {
        if (this.lang === Lang.KOR) return '오류가 있습니다. 관리자에게 문의 해주세요';
        return '';
    }

    needEtcMsg(questionNumber: string): string {
        if(this.lang === Lang.KOR) {
            return `[${questionNumber}] 기타 값을 입력해주세요.`;
        }
        return '';
    }

    onlyNumberMsg(questionNumber: string): string {
        if(this.lang === Lang.KOR) {
            return `[${questionNumber}] 숫자로만 입력해주세요.`;
        }
        return '';
    }

    onlyCharMsg(questionNumber: string): string {
        if(this.lang === Lang.KOR) {
            return `[${questionNumber}] 한글,영어,숫자로만 입력해주세요.`;
        }
        return '';
    }

    //순위 관련
    maxRankMsg(questionNumber: string, rankCnt: number): string {
        if(this.lang === Lang.KOR) {
            return `[${questionNumber}]은(는) ${rankCnt}순위 까지만 선택 가능합니다.`;
        }
        return '';
    }

    minSelect(questionNumber: string, minCnt: number): string {
        if (this.lang === Lang.KOR) {
            return `[${questionNumber}]은(는) 최소한 ${minCnt}개는 선택해야 합니다.`;
        }
        return '';
    }

    maxSelect(questionNumber: string, maxCnt: number): string {
        if (this.lang === Lang.KOR) {
            return `[${questionNumber}]은(는) ${maxCnt}개 이하로 선택해야 합니다.`;
        }
        return '';
    }

    rankLabel(rank: number): string {
        if(this.lang === Lang.KOR) {
            return `${rank}순위`;
        } else if (this.lang === Lang.ENG) {
            return rank < 4 ? (rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd') : `${rank}th`;
        }
        return  '';
    }

    stayTimeMsg(questionNumber: string, stayTime: number): string {
        if (this.lang === Lang.KOR) {
            return `[${questionNumber}]은(는) ${Math.floor(stayTime)}초 후에 진행 가능합니다.`;
        }
        return '';
    }

    //휴대폰 번호
    noMobileNumberMsg(questionNumber: string) {
        if(this.lang === Lang.KOR) {
            return `[${questionNumber}]은(는) 정확한 휴대폰 번호가 아닙니다.`;
        }
        return '';
    }

    noEndedVideoMsg(){
        if(this.lang === Lang.KOR) {
            return `영상을 끝까지 시청해주시길 바랍니다.`;
        }
        return '';
    }

    notMatchSumValueMsg() {
        if(this.lang === Lang.KOR) {
            return `총 합계값이 다릅니다.`;
        }
        return ``;
    }

    minValueMsg(value: number){
        if(this.lang === Lang.KOR) {
            return `${value}보다 작을 수 없습니다.`;
        }
        return ``;
    }

    maxValueMsg(value: number){
        if(this.lang === Lang.KOR) {
            return `${value}보다 클 수 없습니다.`;
        }
        return ``;
    }

    sumValueMsg(value: number) {
        if(this.lang === Lang.KOR) {
            return `합계가 ${value}이여야 합니다.`;
        }
        return ``;
    }

    inputTextRegExp(): RegExp {
        if(this.lang === Lang.KOR) return new RegExp('^[가-힣a-zA-Z0-9 !?&,.:\\~@%/;\\()\\=_+\\"\\-\\r\\n]+$','g');
        return new RegExp('','g');

    }

}