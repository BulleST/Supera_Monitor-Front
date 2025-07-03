import { Component, OnDestroy } from '@angular/core';
import { Checklist } from '../../../models/checklist.model';
import { getError, showError } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { ChecklistService } from '../../../services/checklist.service';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno } from '../../../models/alunos.model';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { Aluno_Checklist_Item_View, JornadaSuperaRequest } from '../../../models/aluno-checklist-item-list.model';
import { AccountService } from '../../../services/account.service';

@Component({
    selector: 'app-monitoramento-jornada-supera',
    standalone: false,
    templateUrl: './monitoramento-jornada-supera.component.html',
    styleUrl: './monitoramento-jornada-supera.component.css',
    providers: [ConfirmationService]
})
export class MonitoramentoJornadaSuperaComponent implements OnDestroy {

    checklistObservacao: string = '';
    subscription: Subscription[] = [];
    request: JornadaSuperaRequest = new JornadaSuperaRequest;

    alunos: Aluno[] = [];
    alunosFiltered: Aluno[] = [];
    loadingAlunos = false;

    checklists: Checklist[] = [];
    loadingChecklist = true;

    list: Aluno_Checklist_Item_View[] = [];
    listFiltered: Aluno_Checklist_Item_View[] = [];
    loading = false;

    // true - cards
    // false - lista
    modoExibicao: boolean = true;

    constructor(
        private service: ChecklistService,
        private alunoService: AlunoService,
        private confirmationService: ConfirmationService,
        private accountService: AccountService
    ) {
        var onFinish = this.service.onFinish.subscribe(res => {

            console.log('onFinish', res);

            this.checklists = this.checklists.map((checklist, indexChecklist) => {
                checklist.items = checklist.items.map((item, indexItem) => {
              
                    item.alunos = item.alunos.filter(x => x.id != res.id)
                    return item;
                });
                return checklist;
            });

            this.alunos.map(async (aluno, alunoIndex) => {
                aluno.checklistCompleto = aluno.checklistCompleto.map((checklist, indexChecklist) => {
                    let index = checklist.items.findIndex(x => x.id == res.id);
                    if (index != -1) {
                        var item = checklist.items[index];
                        item.finalizado = true;
                        item.dataFinalizacao = res.dataFinalizacao;
                        item.account_Finalizacao_Id = res.account_Finalizacao_Id;
                        item.account_Finalizacao = res.account_Finalizacao;

                        checklist.items.splice(index, 1, item);
                    }
                    return checklist;
                });
                aluno = await this.alunoService.mapAluno(aluno, 'monitoramento-jornada-supera')
                return aluno;
            })
        });
        this.subscription.push(onFinish);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async update() {
        if (!this.checklists.length)
            await this.getChecklists();

        this.getChecklistList();
        this.getAlunosList();
    }


    async getChecklists() {
        this.loadingChecklist = true;
        await lastValueFrom(this.service.getList())
            .then(res => {
                this.checklists = res;
            });

        this.loadingChecklist = false;
    }

    getChecklistList() {
        this.loading = true;
        lastValueFrom(this.alunoService.getChecklist(this.request))
            .then(res => {
                this.list = res.map(item => {
                    if (!item.finalizado && moment(item.prazo).week() < moment(new Date).week())
                        item.status = 'Atrasado';
                    else if (!item.finalizado && moment(item.prazo).week() == moment(new Date).week())
                        item.status = 'Pendente'
                    else if (!item.finalizado && moment(item.prazo).week() > moment(new Date).week())
                        item.status = 'À realizar'
                    else if (item.finalizado)
                        item.status = 'Finalizado'
                    return item;
                });
                this.loading = false;

                this.applyPendentesSemana(this.request.pendentesSemana);
            })
            .catch(res => this.loading = false);

    }

    getAlunosList() {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getListWithChecklist(this.request))
        .then(res => {
            this.alunos = res;
            this.alunosFiltered = res;
            this.loadingAlunos = false;
        })

    }

    applyPendentesSemana(value: boolean) {
        this.request.pendentesSemana = value
        if (value) {
            this.listFiltered = this.list.filter(x => moment(x.prazo).week() == moment().week())
        } else {
            this.listFiltered = this.list;
        }
        this.setChecklist();
    }

    setChecklist() {
        this.checklists = this.checklists.map(checklist => {
            checklist.items = checklist.items.map(checklistItem => {
                let items = this.listFiltered.filter(x => x.checklist_Item_Id == checklistItem.id);
                checklistItem.alunos = items;
                return checklistItem;
            });
            return checklist;
        });
    }

    modoExibicaoChanged() {
        console.log('modoExibicaoChanged', this.modoExibicao)
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }
    
    applyFilter(request: JornadaSuperaRequest) {
        this.request = request;
        this.update();
    }

}
