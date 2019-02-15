import $ from 'jquery';
import 'bootstrap';
import 'aos/dist/aos.css';
import ReportLoader from "./ReportLoader";
import {Que} from "../vo/Que.vo";
import {QuestionType} from "../enum/QuestionType";
import ClickEvent = JQuery.ClickEvent;

class ReportTable {
    reportInputs: Array<HTMLInputElement> = [];
    reportTds: Array<{name: string, value: string, dom:HTMLElement}> = [];
    reportData: Array<Que> = [];
    $tableWrapper: JQuery<HTMLDivElement>;
    $tableDiv?: JQuery<HTMLDivElement>;
    $table: JQuery<HTMLTableElement>;
    $toolbar: JQuery<HTMLDivElement>;
    $saveBtn: JQuery<HTMLButtonElement>;
    $htmlCopyBtn: JQuery<HTMLButtonElement>;
    $removeBtn: JQuery<HTMLButtonElement>;
    //$pasteTextArea: JQuery<HTMLTextAreaElement>;

    constructor(private reportLoader: ReportLoader, private questions: Array<Que>, public reportQues: Array<string>, private reportValues: Array<{name: string, value:string, cnt:string}>, private objectID: string, private onlyView: boolean) {
        this.$tableWrapper = $('<div class="border border-light rounded bg-white p-3 w-100 my-2 table-wrapper"></div>');
        this.$saveBtn = $('<button type="button" class="ml-2 float-right btn btn-primary btn-sm"></button>');
        this.$htmlCopyBtn = $('<button type="button" class="ml-2 float-right btn btn-danger btn-sm"></button>');
        this.$removeBtn = $('<button type="button" class="mr-2 float-right btn btn-warning btn-sm"></button>');

        this.$toolbar = $('<div class="d-block my-2 py-2"></div>');
        //this.$pasteTextArea = $('<textarea rows="1" cols="3" style="resize: none;" class="float-left"></textarea>');
        this.$table = $('<table id="new-report-table" class="table table-sm table-bordered my-2"></table>');
    }

    init () {
        this.$tableWrapper.empty();
        this.$table.empty();
        if (this.reportQues.length === 0) {
            this.$tableWrapper.remove();
        }
        this.reportInputs = [];
        this.reportTds = [];
        this.$tableDiv = this.renderQuotaTable();
        this.$tableDiv.appendTo(this.$tableWrapper);
        this.renderFillValues();
    }


    reportSave(evt: ClickEvent){
        let $noInput = this.reportInputs.filter(form => !form.value.length);
        $noInput.forEach(form => form.value = '0');
        let sum = this.reportInputs.map(form => isNaN(+form.value) ? 0 : +form.value).reduce((a,b) => {
            return a + b;
        });
        if(!confirm(`총 ${sum}Sample 저장합니다.`))return false;

        let saveData= {
            quota: this.reportData.map(que => { return {questionName: que.QtnName, pageNum: que.PageNum, idx: que.Qidx}}),
            quotaValues: this.reportInputs.map(form => {return {name: form.name, value: form.getAttribute('data-value'), cnt: form.value}}),
        };
        this.reportLoader.setReport(saveData)
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
            this.reportQues = [];
            return;
        }
        if (!confirm('해당 리포트를 삭제하시겠습니까?')) return;
        this.reportLoader.removeReport(this.objectID)
            .then(result => {
                alert(result['msg'||'삭제 완료']);
                this.$tableWrapper.remove();
            })
            .catch(err => {});

    }

    renderFillValues() {
        this.reportInputs.forEach(input => {
            let name = input.name;
            let value = input.getAttribute('data-value');
            let find = this.reportValues.find(obj => obj.name === name && obj.value === value);
            if(find) input.value = find.cnt;
        });
    }

    renderQuotaTable(): JQuery<HTMLDivElement> {
        let $tableWrapper: JQuery<HTMLDivElement> = $('<div class="bg-white p-3 w-100 my-2"></div>');
        if (!this.onlyView) this.$toolbar.appendTo($tableWrapper);
        //this.$pasteTextArea.appendTo(this.$toolbar);
        /*
        this.$pasteTextArea.on('paste', evt => {
            if (!evt.originalEvent) return;
            let clipboardEvt: ClipboardEvent = evt.originalEvent as ClipboardEvent;
            let data = clipboardEvt.clipboardData.getData('text/plain');
            let reports = data.split('\r\n').filter(n => n.length && !isNaN(+n.trim()));
            if (this.reportInputs.length !== reports.length) {
                alert(`셀의 개수가 일치하지 않습니다.(필요 개수:${this.reportInputs.length}/입력 개수:${reports.length}`);
                evt.preventDefault();
                return;
            }

            for(let i in reports) {
                this.reportInputs[i].value = reports[i];
            }
            setTimeout(() => {this.$pasteTextArea.val('');},500);
        });
        */

        this.$saveBtn.appendTo(this.$toolbar);
        this.$saveBtn.text('SAVE REPORT');
        this.$saveBtn.on('click', evt =>{
            this.reportSave(evt);
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
        this.reportData = this.questions.filter(que => this.reportQues.find(q => q.indexOf(que.QtnName) !== -1));

        if (this.reportData.length === 1) {
            let que = this.reportData[0];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $('<th class="text-center"></th>').appendTo($theadTr).css({'width':'80%'});
            let $badge = $(`<span class="badge badge-pill badge-danger">${que.QtnName}</span><span>${que.QuestionText}</span>`).css({'cursor':'pointer'});
            $badge.appendTo($theadTd);
            $badge.on('click', evt => {
                if (this.objectID === undefined) {
                    this.reportQues.splice(this.reportQues.findIndex(q => q === que.QtnName), 1);
                    this.init();
                }
            });
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            $trNew = $tr.clone().appendTo($tbody);
            //$(`<td rowspan='${que.Examples.length+1}' class="text-center align-middle"></td>`).appendTo($trNew).html(que.QuestionText).css({'width':'30%'});

            que.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1"></td>`).appendTo($trNew).text(ex.ExampleText);
                let $quotaInput: JQuery<HTMLInputElement>;
                //$quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${que.QtnName}" data-value="${ex.ExampleVal}" min="0" max="99999" />`);
                $quotaInput = $(`<span></span>`);
                let name = `${que.QtnName}`, value = `${ex.ExampleVal}`;
                let $td = $(`<td></td>`).appendTo($trNew);
                if(!this.onlyView)$quotaInput.appendTo($td);
                this.reportInputs.push($quotaInput[0]);
                this.reportTds.push({name: name, value: value, dom: $td[0]});
            });
        }
        else if (this.reportData.length === 2 ) {
            let que1 = this.reportData[0];
            let que2 = this.reportData[1];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $(`<th colspan="${this.reportData.length}" class="text-center"></th>`).appendTo($theadTr).css({'width':'80%'});
            for(let q of this.reportData){
                let $badge = $(`<span class="badge badge-pill badge-danger mx-1">${q.QtnName}</span>`).css({'cursor':'pointer'});
                $badge.appendTo($theadTd);
                $badge.on('click', evt => {
                    if (this.objectID === undefined) {
                        this.reportQues.splice(this.reportQues.findIndex(_q => _q === q.QtnName), 1);
                        this.init();
                    }
                });

            }
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            que1.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1" rowspan="${que2.Examples.length}"></td>`).appendTo($trNew).text(ex.ExampleText).css({'width':`${80/this.reportData.length}`});
                que2.Examples.forEach((ex2,idx2) => {
                    $(`<td class="text-center align-middle p-1""></td>`).appendTo($trNew).text(ex2.ExampleText).css({'width':`${80/this.reportData.length}`});
                    let $quotaInput: JQuery<HTMLInputElement>;
                    let name = `${que1.QtnName}/${que2.QtnName}`, value = `${ex.ExampleVal}/${ex2.ExampleVal}`;
                    $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${name}" data-value="${value}" min="0" max="99999" />`);
                    let $td = $(`<td></td>`).appendTo($trNew);
                    if(!this.onlyView)$quotaInput.appendTo($td);
                    this.reportInputs.push($quotaInput[0]);
                    this.reportTds.push({name: name, value: value, dom: $td[0]});
                    if (que2.Examples.length-1 > idx2) $trNew = $tr.clone().appendTo($tbody);
                });
            });
        }
        else if (this.reportData.length === 3 ) {
            let que1 = this.reportData[0];
            let que2 = this.reportData[1];
            let que3 = this.reportData[2];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $(`<th colspan="${this.reportData.length}" class="text-center"></th>`).appendTo($theadTr).css({'width':'80%'});
            for(let q of this.reportData){
                let $badge = $(`<span class="badge badge-pill badge-danger mx-1">${q.QtnName}</span>`).css({'cursor':'pointer'});
                $badge.appendTo($theadTd);
                $badge.on('click', evt => {
                    if (this.objectID === undefined) {
                        this.reportQues.splice(this.reportQues.findIndex(_q => _q === q.QtnName), 1);
                        this.init();
                    }
                });
            }
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            que1.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1" rowspan="${(que2.Examples.length)*(que3.Examples.length)}"></td>`).appendTo($trNew).text(ex.ExampleText).css({'width':`${80/this.reportData.length}`});
                que2.Examples.forEach((ex2, idx2) => {
                    $(`<td class="text-center align-middle p-1" rowspan="${que3.Examples.length}"></td>`).appendTo($trNew).text(ex2.ExampleText).css({'width':`${80/this.reportData.length}`});
                    que3.Examples.forEach((ex3, idx3) => {
                        $(`<td class="text-center align-middle p-1"></td>`).appendTo($trNew).text(ex3.ExampleText).css({'width':`${80/this.reportData.length}`});
                        let $quotaInput: JQuery<HTMLInputElement>;
                        let name = `${this.reportData.map(que => que.QtnName).join('/')}`, value = `${ex.ExampleVal}/${ex2.ExampleVal}/${ex3.ExampleVal}`;
                        $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${name}" data-value="${value}" min="0" max="99999" />`);
                        let $td = $(`<td></td>`).appendTo($trNew);
                        if(!this.onlyView)$quotaInput.appendTo($td);
                        this.reportInputs.push($quotaInput[0]);
                        this.reportTds.push({name: name, value: value, dom: $td[0]});
                        if ((que2.Examples.length)*(que3.Examples.length) > ((idx3+1)*(idx2+1))) $trNew = $tr.clone().appendTo($tbody);
                    });
                });
            });
        }
        else if (this.reportData.length === 4 ) {
            let que1 = this.reportData[0];
            let que2 = this.reportData[1];
            let que3 = this.reportData[2];
            let que4 = this.reportData[3];
            let $tr = $('<tr></tr>');
            let $trNew;
            let $theadTd = $(`<th colspan="${this.reportData.length}" class="text-center"></th>`).appendTo($theadTr).css({'width':'80%'});
            for(let q of this.reportData){
                let $badge = $(`<span class="badge badge-pill badge-danger mx-1">${q.QtnName}</span>`).css({'cursor':'pointer'});
                $badge.appendTo($theadTd);
                $badge.on('click', evt => {
                    if (this.objectID === undefined) {
                        this.reportQues.splice(this.reportQues.findIndex(_q => _q === q.QtnName), 1);
                        this.init();
                    }
                });
            }
            $('<th class="text-center"></th>').appendTo($theadTr).text('COUNT');
            que1.Examples.forEach(ex => {
                $trNew = $tr.clone().appendTo($tbody);
                $(`<td class="text-center align-middle p-1" rowspan="${(que2.Examples.length)*(que3.Examples.length)*(que4.Examples.length)}"></td>`).appendTo($trNew).text(ex.ExampleText).css({'width':`${80/this.reportData.length}`});
                que2.Examples.forEach((ex2, idx2) => {
                    $(`<td class="text-center align-middle p-1" rowspan="${que3.Examples.length*que4.Examples.length}"></td>`).appendTo($trNew).text(ex2.ExampleText).css({'width':`${80/this.reportData.length}`});
                    que3.Examples.forEach((ex3, idx3) => {
                        $(`<td class="text-center align-middle p-1" rowspan="${que4.Examples.length}"></td>`).appendTo($trNew).text(ex3.ExampleText).css({'width':`${80/this.reportData.length}`});
                        que4.Examples.forEach((ex4, idx4) => {
                            $(`<td class="text-center align-middle p-1"></td>`).appendTo($trNew).text(ex4.ExampleText).css({'width':`${80/this.reportData.length}`});
                            let $quotaInput: JQuery<HTMLInputElement>;
                            let name = `${this.reportData.map(que => que.QtnName).join('/')}`, value = `${ex.ExampleVal}/${ex2.ExampleVal}/${ex3.ExampleVal}/${ex4.ExampleVal}`;
                            $quotaInput = $(`<input type="number" class="form-control form-control-sm w-100" pattern="pattern="[0-9]*" name="${name}" data-value="${value}" min="0" max="99999" />`);
                            let $td = $(`<td></td>`).appendTo($trNew);
                            if(!this.onlyView)$quotaInput.appendTo($td);
                            this.reportInputs.push($quotaInput[0]);
                            this.reportTds.push({name: name, value: value, dom: $td[0]});
                            if ((que2.Examples.length)*(que3.Examples.length)*(que4.Examples.length) > ((idx4+1)*(idx3+1)*(idx2+1))) $trNew = $tr.clone().appendTo($tbody);
                        });
                    });
                });
            });
        }
        this.$table.appendTo($tableWrapper);
        if (this.onlyView) {

            this.reportLoader.getReportCompleteCnt(this.reportQues).then(result => {
                let _result: Array<{name: string, value: string, cnt: number, comCnt: number}> = result;
                this.reportTds.forEach(q => {
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
                $(`<td class="font-weight-bold" colspan="${this.reportQues.length === 1 ? 2 : this.reportQues.length}"></td>`).appendTo($sumTr).text('합계');
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


export class ReportManager {
    reportLoader: ReportLoader;
    questions: Array<Que> = [];
    reportObject: Array<{_id: string, projectID: string, questions: Array<string>, maxPage: number, reportValues:Array<{name: string, value:string, cnt:string}>}> = [];
    newReportData: Array<Que> = [];
    $showReportArea: JQuery<HTMLDivElement>;
    $newReportArea: JQuery<HTMLDivElement>;
    $newReportBtn: JQuery<HTMLButtonElement>;
    $newReportCloseBtn: JQuery<HTMLButtonElement>;
    $questionList: JQuery<HTMLOListElement>;
    $reportInputs: Array<HTMLInputElement>;
    authorize: boolean;


    constructor(private projectID: string, private onlyView: boolean) {
        this.authorize = false;
        this.reportLoader = new ReportLoader(this.projectID);
        this.$showReportArea = $('#show-report-area');
        this.$newReportArea = $('#new-report-area');
        this.$newReportBtn = $('#new-report-btn');
        this.$newReportBtn.on('click', evt => {
            this.newReportToggle(true);
        });
        this.$newReportCloseBtn = $('#new-report-close-btn');
        this.$newReportCloseBtn.on('click', evt => {
            this.newReportToggle(false);
            this.init();
        });

        //MARK: 보이는 경우에만
        if (this.onlyView === true) {
            this.$newReportCloseBtn.remove();
            this.$newReportBtn.remove();
            this.$newReportArea.remove();
        }

        this.$questionList = $('#question-list');
        this.$reportInputs = [];
    }

    async init(): Promise<void> {
        if (this.$newReportArea) this.$newReportArea.empty();
        this.questions = Object.values(await this.reportLoader.getQuestions());
        this.reportObject = await this.reportLoader.getReport();
        this.renderExistsReport();
        this.renderQuestions();
    }

    newReportToggle(flag: boolean): void {
        if (flag === true) {
            $('#new-report-wrapper').removeClass('d-none');
            $('#show-report-wrapper').addClass('d-none');
        } else {
            $('#new-report-wrapper').addClass('d-none');
            $('#show-report-wrapper').removeClass('d-none');
        }
    }

    renderExistsReport(): void {
        if (this.reportObject.length>0){
            this.$showReportArea.empty();
        }
        this.reportObject.forEach(report => {
            let reportTable = new ReportTable(this.reportLoader, this.questions, report.questions||[], report.reportValues||[], report._id, this.onlyView);
            reportTable.init();
            this.$showReportArea.append(reportTable.$tableWrapper);
        });
    }

    renderQuestions() {
        let reportTable = new ReportTable(this.reportLoader, this.questions, this.newReportData.map(q => q.QtnName), [], '', this.onlyView);

        this.$newReportArea.on('dragover', evt => {
            evt.preventDefault();
        }).on('drop', evt => {

            let dragEvent: DragEvent = evt.originalEvent as DragEvent;
            if (dragEvent.dataTransfer) {
                let data = dragEvent.dataTransfer;
                let questionNumber = data.getData('questionNumber');
                let find = this.questions.find(que => que.QtnName === questionNumber);
                let exists = reportTable.reportQues.find(q => q === questionNumber);//this.newQuotaData.find(que => que.QtnName === questionNumber);
                if (reportTable.reportQues.length > 3) {
                    alert('쿼터 문항은 최대 4문항까지 입니다.');
                    return false;
                }
                if (find && !exists) {
                    reportTable.reportQues.push(find.QtnName);
                    //this.quotaTable.$tableWrapper
                    this.$newReportArea.empty();
                    reportTable.init();
                    this.$newReportArea.append(reportTable.$tableWrapper);
                }
            }
        });

        this.questions.filter(que => (que.QtnType === QuestionType.SingleDefault || que.QtnType === QuestionType.MultiSelection)).forEach(que => {
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
            if(que.QtnType === 11) $li.append(`<span class="badge badge-pill badge-primary">S</span>${que.QtnName}`);
            if(que.QtnType === 21) $li.append(`<span class="badge badge-pill badge-primary">M</span>${que.QtnName}`);
        });
    }

}
