import { Que } from '../vo/Que.vo'


export default class Common {

    static replacer: {
        OR: {regExp: RegExp, convert: string},
        AND: {regExp: RegExp, convert: string},
        EQUAL_WHITESPACE: {regExp: RegExp, convert: string},
        LESS: {regExp: RegExp, convert: string},
        GREATER: {regExp: RegExp, convert: string},
        NOT_EQUAL: {regExp: RegExp, convert: string},
        INTEGER: {regExp: RegExp, convert: string},
        CNT: {regExp: RegExp, convert: string}
    } = {
        OR: {
            regExp: new RegExp(/\s+(OR)+\s*/,'gi'),
            convert: " || "
        },
        AND: {
            regExp: new RegExp(/\s+(AND)+\s*/,'gi'),
            convert: " && "
        },
        EQUAL_WHITESPACE: {
            regExp: new RegExp(/=/,'g'),
            //regExp: new RegExp(/(?<!\>|\<)(\=)(?<!\={2,})/,'g'),
            convert: " == "
        },
        LESS: {
            regExp: new RegExp(/> ==/,'g'),
            convert: " >= "
        },
        GREATER: {
            regExp: new RegExp(/< ==/,'g'),
            convert: " <= "
        },
        NOT_EQUAL: {
            regExp: new RegExp(/<>/,'gi'),
            convert: " != "
        },
        INTEGER: {
            regExp: new RegExp(/INT\(([^\)]+)\)/,'gi'),
            convert: "$1"
        },
        CNT: {
            regExp: new RegExp(/CNT\(([^\)]+)\)/, 'gi'),
            convert: "$1"
        }
    };
    constructor() {

    }

    static duplicateFlowQuestionNumber(flow: string): Set<string> {
        let flowUnwrap = flow;
        flowUnwrap = flowUnwrap.replace(this.replacer.EQUAL_WHITESPACE.regExp,this.replacer.EQUAL_WHITESPACE.convert);        //EQUAL
        flowUnwrap = flowUnwrap.replace(this.replacer.OR.regExp,' ');
        flowUnwrap = flowUnwrap.replace(this.replacer.AND.regExp,' ');
        flowUnwrap = flowUnwrap.replace(this.replacer.LESS.regExp,this.replacer.LESS.convert);        //LESS
        flowUnwrap = flowUnwrap.replace(this.replacer.GREATER.regExp,this.replacer.GREATER.convert);        //GREATER
        flowUnwrap = flowUnwrap.replace(this.replacer.NOT_EQUAL.regExp,' ');
        flowUnwrap = flowUnwrap.replace(this.replacer.INTEGER.regExp,this.replacer.INTEGER.convert);  //인티저 치환 제거
        flowUnwrap = flowUnwrap.replace(this.replacer.CNT.regExp,this.replacer.CNT.convert);  //CNT
        flowUnwrap = flowUnwrap.replace(/\(|\)/g,' ');  //괄호 제거
        flowUnwrap = flowUnwrap.replace(/"(.*?)"/g,' ');     //따옴표 사이 문자 제거
        flowUnwrap = flowUnwrap.replace(/\>|\</g,' ');  //부등호 제거
        flowUnwrap = flowUnwrap.replace(/\=/g,' ');  //등호 제거
        let dv = flowUnwrap.split(" ").filter(d => d !== "" && isNaN(Number(d)));
        return new Set(dv);
    }

    static flowReplacer(flow: string): string {
        let flowUnwrap = flow;
        flowUnwrap = flowUnwrap.replace(this.replacer.EQUAL_WHITESPACE.regExp,this.replacer.EQUAL_WHITESPACE.convert);        //OR
        flowUnwrap = flowUnwrap.replace(this.replacer.LESS.regExp,this.replacer.LESS.convert);        //LESS
        flowUnwrap = flowUnwrap.replace(this.replacer.GREATER.regExp,this.replacer.GREATER.convert);        //GREATER
        flowUnwrap = flowUnwrap.replace(this.replacer.OR.regExp,this.replacer.OR.convert);        //OR
        flowUnwrap = flowUnwrap.replace(this.replacer.AND.regExp,this.replacer.AND.convert);        //OR
        flowUnwrap = flowUnwrap.replace(this.replacer.NOT_EQUAL.regExp,this.replacer.NOT_EQUAL.convert);        //EQUAL
        flowUnwrap = flowUnwrap.replace(this.replacer.INTEGER.regExp,this.replacer.INTEGER.convert);  //인티저 치환 제거
        flowUnwrap = flowUnwrap.replace(this.replacer.CNT.regExp,this.replacer.CNT.convert);  //CNT


        return flowUnwrap;
    }

}