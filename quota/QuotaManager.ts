import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'argon-design-system-free/assets/css/argon.css';
import 'aos/dist/aos.css';
import QuotaLoader from "./QuotaLoader";
import {Que} from "../vo/Que.vo";
import {QuestionType} from "../enum/QuestionType";
import ClickEvent = JQuery.ClickEvent;

class QuotaTable {
    quotaInputs: Array<HTMLInputElement> = [];
    quotaTds: Array<{name: string, value: string, dom:HTMLElement}> = [];
    quotaData: Array<Que> = [];
    $tableWrapper: JQuery<HTMLDivElement>;
    $tableDiv?: JQuery<HTMLDivElement>;
    $table: JQuery<HTMLTableElement>;
    $toolbar: JQuery<HTMLDivElement>;
    $saveBtn: JQuery<HTMLButtonElement>;
    $htmlCopyBtn: JQuery<HTMLButtonElement>;
    $removeBtn: JQuery<HTMLButtonElement>;
    $pasteTextArea: JQuery<HTMLTextAreaElement>;

    constructor(private quotaLoader: QuotaLoader, private questions: Array<Que>, public quotaQues: Array<string>, private quotaValues: Array<{name: string, value:string, cnt:string}>, private objectID: string, private onlyView: boolean) {
        this.$tableWrapper = $('<div class="border border-light rounded bg-white p-3 w-100 my-2 table-wrapper"></div>');
        this.$saveBtn = $('<button type="button" class="ml-2 float-right btn btn-primary btn-sm"></button>');
        this.$htmlCopyBtn = $('<button type="button" class="ml-2 float-right btn btn-danger btn-sm"></button>');
        this.$removeBtn = $('<button type="button" class="mr-2 float-right btn btn-warning btn-sm"></button>');

        this.$toolbar = $('<div class="d-block my-2 py-2"></div>');
        this.$pasteTextArea = $('<textarea rows="1" cols="3" style="resize: none;" class="float-left"></textarea>');
        this.$table = $('<table id="new-quota-table" class="table table-sm table-bordered my-2"></table>');
    }

    init () {
        this.$tableWrapper.empty();
        this.$table.empty();
        if (this.quotaQues.length === 0) {
            this.$tableWrapper.remove();
        }
        this.quotaInputs = [];
        this.quotaTds = [];
        this.$tableDiv = this.renderQuotaTable();
        this.$tableDiv.appendTo(this.$tableWrapper);
        this.renderFillValues();
    }


    quotaSave(evt: ClickEvent){
        let $noInput = this.quotaInputs.filter(form => !form.value.length);
        $noInput.forEach(form => form.value = '0');
        let sum = this.quotaInputs.map(form => isNaN(+form.value) ? 0 : +form.value).reduce((a,b) => {
            return a + b;
        });
        if(!confirm(`총 ${sum}Sample 저장합니다.`))return false;

        let saveData= {
            quota: this.quotaData.map(que => { return {questionName: que.QtnName, pageNum: que.PageNum, idx: que.Qidx}}),
            quotaValues: this.quotaInputs.map(form => {return {name: form.name, value: form.getAttribute('data-value'), cnt: form.value}}),
        };
        this.quotaLoader.setQuota(saveData)
            .then(result => {alert(result['msg'||'저장 완료'])})
            .catch(err => {});
        evt.preventDefault();
    }

    copyTableHtml(evt: ClickEvent) {
        let $tempTA: JQuery<HTMLTextAreaElement> = $('<textarea></textarea>');
        $tempTA.appendTo('body').val(this.$table[0].outerHTML);
        $tempTA[0].select();
        document.execCommand('copy');
        $tempTA.remove();
    }

    removeQuota(evt: ClickEvent) {
        if (this.objectID === undefined) {
            this.$tableWrapper.remove();
            this.quotaQues = [];
            return;
        }
        if (!confirm('해당 쿼터를 삭제하시겠습니까?')) return;
        this.quotaLoader.removeQuota(this.objectID)
            .then(result => {
                alert(result['msg'||'삭제 완료']);
                this.$tableWrapper.remove();
            })
            .catch(err => {});

    }

    renderFillValues() {
        this.quotaInputs.forEach(input => {
            let name = input.name;
            let value = input.getAttribute('data-value');
            let find = this.quotaValues.find(obj => obj.name === name && obj.value === value);
            if(find) input.value = find.cnt;
        });
    }

    renderQuotaTable(): JQuery<HTMLDivElement> {
        let $tableWrapper: JQuery<HTMLDivElement> = $('<div class="bg-white p-3 w-100 my-2"></div>');
        if (!this.onlyView) this.$toolbar.appendTo($tableWrapper);
        this.$pasteTextArea.appendTo(this.$toolbar);
        this.$pasteTextArea.on('paste', evt => {
            if (!evt.originalEvent) return;
            let clipboardEvt: ClipboardEvent = evt.originalEvent as ClipboardEvent;
            let data = clipboardEvt.clipboardData.getData('text/plain');
            let quotas = data.split('\r\n').filter(n => n.length && !isNaN(+n.trim()));
            if (this.quotaInputs.length !== quotas.length) {
                alert(`셀의 개수가 일치하지 않습니다.(필요 개수:${this.quotaInputs.length}/입력 개수:${quotas.length}`);
                evt.preventDefault();
                return;
            }

            for(let i in quotas) {
                this.quotaInputs[i].value = quotas[i];
            }
            setTimeout(() => {this.$pasteTextArea.val('');},500);
        });

        this.$saveBtn.appendTo(this.$toolbar);
        this.$saveBtn.text('SAVE QUOTA');
        this.$saveBtn.on('click', evt =>{
            this.quotaSave(evt);
        });

        this.$htmlCopyBtn.appendTo(this.$toolbar);
        this.$htmlCopyBtn.text('TABLE COPY');
        this.$htmlCopyBtn.on('click', evt => {
            this.copyTableHtml(evt);
        });

        this.$removeBtn.appendTo(this.$toolbar);
        this.$removeBtn.text('REMOVE');
        this.$removeBtn.on('click', evt => {
            this.removeQuota(evt);
        });

        this.$table.css({'font-size': '0.7rem'});
        let $thead = $('<thead class="thead-light"></thead>').appendTo(this.$table);
        let $tbody = $('<tbody></tbody>').appendTo(this.$table);
        let $theadTr = $('<tr></tr>').appendTo($thead);
        this.quotaData = this.questions.filter(que => this.quotaQues.find(q => q.indexOf(que.QtnName) !== -1));

        if (this.quotaData.length === 1) {
            let que = this.quotaData[0];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $('<th colspan="2" class="text-center"></th>').appendTo($theadTr).css({'width':'80%'});
            let $badge = $(`<span class="badge badge-pill badge-danger">${que.QtnName}</span>`).css({'cursor':'pointer'});
            $badge.appendTo($theadTd);
            $badge.on('click', evt => {
                if (this.objectID === undefined) {
                    this.quotaQues.splice(this.quotaQues.findIndex(q => q === que.QtnName), 1);
                    this.init();
                }
            });
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            $trNew = $tr.clone().appendTo($tbody);
            $(`<td rowspan='${que.Examples.length+1}' class="text-center align-middle"></td>`).appendTo($trNew).html(que.QuestionText).css({'width':'30%'});

            que.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1"></td>`).appendTo($trNew).text(ex.ExampleText);
                let $quotaInput: JQuery<HTMLInputElement>;
                $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${que.QtnName}" data-value="${ex.ExampleVal}" min="0" max="99999" />`);
                let name = `${que.QtnName}`, value = `${ex.ExampleVal}`;
                let $td = $(`<td></td>`).appendTo($trNew);
                if(!this.onlyView)$quotaInput.appendTo($td);
                this.quotaInputs.push($quotaInput[0]);
                this.quotaTds.push({name: name, value: value, dom: $td[0]});
            });
        }
        else if (this.quotaData.length === 2 ) {
            let que1 = this.quotaData[0];
            let que2 = this.quotaData[1];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $(`<th colspan="${this.quotaData.length}" class="text-center"></th>`).appendTo($theadTr).css({'width':'80%'});
            for(let q of this.quotaData){
                let $badge = $(`<span class="badge badge-pill badge-danger mx-1">${q.QtnName}</span>`).css({'cursor':'pointer'});
                $badge.appendTo($theadTd);
                $badge.on('click', evt => {
                    if (this.objectID === undefined) {
                        this.quotaQues.splice(this.quotaQues.findIndex(_q => _q === q.QtnName), 1);
                        this.init();
                    }
                });

            }
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            que1.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1" rowspan="${que2.Examples.length}"></td>`).appendTo($trNew).text(ex.ExampleText).css({'width':`${80/this.quotaData.length}`});
                que2.Examples.forEach((ex2,idx2) => {
                    $(`<td class="text-center align-middle p-1""></td>`).appendTo($trNew).text(ex2.ExampleText).css({'width':`${80/this.quotaData.length}`});
                    let $quotaInput: JQuery<HTMLInputElement>;
                    let name = `${que1.QtnName}/${que2.QtnName}`, value = `${ex.ExampleVal}/${ex2.ExampleVal}`;
                    $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${name}" data-value="${value}" min="0" max="99999" />`);
                    let $td = $(`<td></td>`).appendTo($trNew);
                    if(!this.onlyView)$quotaInput.appendTo($td);
                    this.quotaInputs.push($quotaInput[0]);
                    this.quotaTds.push({name: name, value: value, dom: $td[0]});
                    if (que2.Examples.length-1 > idx2) $trNew = $tr.clone().appendTo($tbody);
                });
            });
        }
        else if (this.quotaData.length === 3 ) {
            let que1 = this.quotaData[0];
            let que2 = this.quotaData[1];
            let que3 = this.quotaData[2];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $(`<th colspan="${this.quotaData.length}" class="text-center"></th>`).appendTo($theadTr).css({'width':'80%'});
            for(let q of this.quotaData){
                let $badge = $(`<span class="badge badge-pill badge-danger mx-1">${q.QtnName}</span>`).css({'cursor':'pointer'});
                $badge.appendTo($theadTd);
                $badge.on('click', evt => {
                    if (this.objectID === undefined) {
                        this.quotaQues.splice(this.quotaQues.findIndex(_q => _q === q.QtnName), 1);
                        this.init();
                    }
                });
            }
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            que1.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1" rowspan="${(que2.Examples.length)*(que3.Examples.length)}"></td>`).appendTo($trNew).text(ex.ExampleText).css({'width':`${80/this.quotaData.length}`});
                que2.Examples.forEach((ex2, idx2) => {
                    $(`<td class="text-center align-middle p-1" rowspan="${que3.Examples.length}"></td>`).appendTo($trNew).text(ex2.ExampleText).css({'width':`${80/this.quotaData.length}`});
                    que3.Examples.forEach((ex3, idx3) => {
                        $(`<td class="text-center align-middle p-1"></td>`).appendTo($trNew).text(ex3.ExampleText).css({'width':`${80/this.quotaData.length}`});
                        let $quotaInput: JQuery<HTMLInputElement>;
                        let name = `${this.quotaData.map(que => que.QtnName).join('/')}`, value = `${ex.ExampleVal}/${ex2.ExampleVal}/${ex3.ExampleVal}`;
                        $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${name}" data-value="${value}" min="0" max="99999" />`);
                        let $td = $(`<td></td>`).appendTo($trNew);
                        if(!this.onlyView)$quotaInput.appendTo($td);
                        this.quotaInputs.push($quotaInput[0]);
                        this.quotaTds.push({name: name, value: value, dom: $td[0]});
                        if ((que2.Examples.length)*(que3.Examples.length) > ((idx3+1)*(idx2+1))) $trNew = $tr.clone().appendTo($tbody);
                    });
                });
            });
        }
        else if (this.quotaData.length === 4 ) {
            let que1 = this.quotaData[0];
            let que2 = this.quotaData[1];
            let que3 = this.quotaData[2];
            let que4 = this.quotaData[3];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $(`<th colspan="${this.quotaData.length}" class="text-center"></th>`).appendTo($theadTr).css({'width':'80%'});
            for(let q of this.quotaData){
                let $badge = $(`<span class="badge badge-pill badge-danger mx-1">${q.QtnName}</span>`).css({'cursor':'pointer'});
                $badge.appendTo($theadTd);
                $badge.on('click', evt => {
                    if (this.objectID === undefined) {
                        this.quotaQues.splice(this.quotaQues.findIndex(_q => _q === q.QtnName), 1);
                        this.init();
                    }
                });
            }
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            que1.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1" rowspan="${(que2.Examples.length)*(que3.Examples.length)*(que4.Examples.length)}"></td>`).appendTo($trNew).text(ex.ExampleText).css({'width':`${80/this.quotaData.length}`});
                que2.Examples.forEach((ex2, idx2) => {
                    $(`<td class="text-center align-middle p-1" rowspan="${que3.Examples.length*que4.Examples.length}"></td>`).appendTo($trNew).text(ex2.ExampleText).css({'width':`${80/this.quotaData.length}`});
                    que3.Examples.forEach((ex3, idx3) => {
                        $(`<td class="text-center align-middle p-1" rowspan="${que4.Examples.length}"></td>`).appendTo($trNew).text(ex3.ExampleText).css({'width':`${80/this.quotaData.length}`});
                        que4.Examples.forEach((ex4, idx4) => {
                            $(`<td class="text-center align-middle p-1"></td>`).appendTo($trNew).text(ex4.ExampleText).css({'width':`${80/this.quotaData.length}`});
                            let $quotaInput: JQuery<HTMLInputElement>;
                            let name = `${this.quotaData.map(que => que.QtnName).join('/')}`, value = `${ex.ExampleVal}/${ex2.ExampleVal}/${ex3.ExampleVal}/${ex4.ExampleVal}`;
                            $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${name}" data-value="${value}" min="0" max="99999" />`);
                            let $td = $(`<td></td>`).appendTo($trNew);
                            if(!this.onlyView)$quotaInput.appendTo($td);
                            this.quotaInputs.push($quotaInput[0]);
                            this.quotaTds.push({name: name, value: value, dom: $td[0]});
                            if ((que2.Examples.length)*(que3.Examples.length)*(que4.Examples.length) > ((idx4+1)*(idx3+1)*(idx2+1))) $trNew = $tr.clone().appendTo($tbody);
                        });
                    });
                });
            });
        }
        this.$table.appendTo($tableWrapper);
        if (this.onlyView) {

            this.quotaLoader.getQuotaCompleteCnt(this.quotaQues).then(result => {
                let _result: Array<{name: string, value: string, cnt: number, comCnt: number}> = result;
                this.quotaTds.forEach(q => {
                    $(q.dom).addClass('position-relative p-0 align-middle').css({height: '25px'});
                    let background = $('<div class="bg-cyan h-100"></div>').appendTo(q.dom);
                    let $span = $('<div class="position-absolute m-auto"></div>');
                    $span.css({'top':0, 'left':0, 'right':0, 'bottom':0, 'height':'50%'});
                    $span.appendTo(q.dom);
                    let find = result.find(r => r.name === q.name && r.value === q.value);
                    if (find) {
                        let width = +find.cnt === 0 ? 0 : (find.comCnt/+find.cnt)*100;
                        if (width >= 100) {
                            background.removeClass('bg-cyan').addClass('bg-warning');
                            $span.addClass('font-weight-bold text-white');
                            width = 100;
                        } else if (find.cnt.toString() === '0') {
                            background.removeClass('bg-cyan').addClass('bg-danger');
                            $span.addClass('font-weight-bold text-white')
                            width = 100;
                        }
                        background.css({'width': `${width}%`});
                        $span.text(`${find.comCnt}/${find.cnt}`);
                    }
                });
                //합계
                let $sumTr = $('<tr></tr>').appendTo(this.$table);
                $(`<td class="font-weight-bold" colspan="${this.quotaQues.length === 1 ? 2 : this.quotaQues.length}"></td>`).appendTo($sumTr).text('합계');
                let $td = $('<td class="position-relative p-0 align-middle" style="height:25px"></td>').appendTo($sumTr);
                let background = $('<div class="bg-cyan h-100"></div>').appendTo($td);
                let $span = $('<div class="position-absolute m-auto"></div>');
                $span.css({'top':0, 'left':0, 'right':0, 'bottom':0, 'height':'50%'});
                $span.appendTo($td);
                let all = result.reduce((a,b) => {return a + +b.cnt},0);
                let com = result.reduce((a,b) => {return a + +b.comCnt},0);
                let width = all === 0 ? 0 : (com/all)*100;
                if (width >= 100) {
                    background.removeClass('bg-cyan').addClass('bg-warning');
                    $span.addClass('font-weight-bold text-white');
                    width = 100;
                }
                background.css({'width': `${width}%`});
                $span.text(`${com}/${all}`);


            });
        }
        return $tableWrapper;
    }
}


export class QuotaManager {
    quotaLoader: QuotaLoader;
    questions: Array<Que> = [];
    quotaObject: Array<{_id: string, projectID: string, questions: Array<string>, maxPage: number, quotaValues:Array<{name: string, value:string, cnt:string}>}> = [];
    newQuotaData: Array<Que> = [];
    $showQuotaArea: JQuery<HTMLDivElement>;
    $newQuotaArea: JQuery<HTMLDivElement>;
    $newQuotaBtn: JQuery<HTMLButtonElement>;
    $newQuotaCloseBtn: JQuery<HTMLButtonElement>;
    $questionList: JQuery<HTMLOListElement>;
    $quotaInputs: Array<HTMLInputElement>;
    authorize: boolean;


    constructor(private projectID: string, private onlyView: boolean) {
        this.authorize = false;

        this.quotaLoader = new QuotaLoader(this.projectID);
        this.$showQuotaArea = $('#show-quota-area');
        this.$newQuotaArea = $('#new-quota-area');
        this.$newQuotaBtn = $('#new-quota-btn');
        this.$newQuotaBtn.on('click', evt => {
            this.newQuotaToggle(true);
        });
        this.$newQuotaCloseBtn = $('#new-quota-close-btn');
        this.$newQuotaCloseBtn.on('click', evt => {
            this.newQuotaToggle(false);
            this.init();
        });

        //MARK: 보이는 경우에만
        if (this.onlyView === true) {
            this.$newQuotaCloseBtn.remove();
            this.$newQuotaBtn.remove();
            this.$newQuotaArea.remove();
        }

        this.$questionList = $('#question-list');
        this.$quotaInputs = [];
    }

    async init(): Promise<void> {
        if (this.$newQuotaArea) this.$newQuotaArea.empty();
        this.questions = Object.values(await this.quotaLoader.getQuestions());
        this.quotaObject = await this.quotaLoader.getQuota();
        this.renderExistsQuota();
        this.renderQuestions();
    }

    newQuotaToggle(flag: boolean): void {
        if (flag === true) {
            $('#new-quota-wrapper').removeClass('d-none');
            $('#show-quota-wrapper').addClass('d-none');
        } else {
            $('#new-quota-wrapper').addClass('d-none');
            $('#show-quota-wrapper').removeClass('d-none');
        }
    }

    renderExistsQuota(): void {
        if (this.quotaObject.length>0){
            this.$showQuotaArea.empty();
        }
        this.quotaObject.forEach(quota => {
            let quotaTable = new QuotaTable(this.quotaLoader, this.questions, quota.questions||[], quota.quotaValues||[], quota._id, this.onlyView);
            quotaTable.init();
            this.$showQuotaArea.append(quotaTable.$tableWrapper);
        });
    }

    renderQuestions() {
        let quotaTable = new QuotaTable(this.quotaLoader, this.questions, this.newQuotaData.map(q => q.QtnName), [], '', this.onlyView);

        this.$newQuotaArea.on('dragover', evt => {
            evt.preventDefault();
        }).on('drop', evt => {

            let dragEvent: DragEvent = evt.originalEvent as DragEvent;
            if (dragEvent.dataTransfer) {
                let data = dragEvent.dataTransfer;
                let questionNumber = data.getData('questionNumber');
                let find = this.questions.find(que => que.QtnName === questionNumber);
                let exists = quotaTable.quotaQues.find(q => q === questionNumber);//this.newQuotaData.find(que => que.QtnName === questionNumber);
                if (quotaTable.quotaQues.length > 3) {
                    alert('쿼터 문항은 최대 4문항까지 입니다.');
                    return false;
                }
                if (find && !exists) {
                    quotaTable.quotaQues.push(find.QtnName);
                    //this.quotaTable.$tableWrapper
                    this.$newQuotaArea.empty();
                    quotaTable.init();
                    this.$newQuotaArea.append(quotaTable.$tableWrapper);
                }
            }
        });

        this.questions.filter(que => que.QtnType === QuestionType.SingleDefault).forEach(que => {
            let $li: JQuery<HTMLLIElement> = $('<li draggable="true"></li>');
            $li.on('dragstart', evt => {
                let dragEvent: DragEvent = evt.originalEvent as DragEvent;
                if (dragEvent.dataTransfer) {
                    dragEvent.dataTransfer.setData('questionNumber', que.QtnName);
                    $li.css({'font-weight': 'bold'});
                }
            }).on('dragend', evt => {
                $li.css({'font-weight': 'normal'});
            });
            $li.css({'font-size': '0.8rem'});
            $li.appendTo(this.$questionList);
            $li.text(que.QtnName);
        });
    }

}
