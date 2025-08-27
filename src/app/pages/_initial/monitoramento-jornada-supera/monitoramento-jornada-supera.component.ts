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
    providers: [ConfirmationService],
})
export class MonitoramentoJornadaSuperaComponent implements OnDestroy {

    checklistObservacao: string = '';
    subscription: Subscription[] = [];
    request: JornadaSuperaRequest = new JornadaSuperaRequest;

    alunos: Aluno[] = [];
    alunosFiltered: Aluno[] = [];
    loadingAlunos = true;

    checklists!: Checklist[];
    loadingChecklists = true;

    list: Aluno_Checklist_Item_View[] = [];
    listFiltered: Aluno_Checklist_Item_View[] = [];
    loadingChecklistAlunos = true;

    // true - cards
    // false - lista
    modoExibicao: boolean = false;

    constructor(
        private service: ChecklistService,
        private alunoService: AlunoService,
        private confirmationService: ConfirmationService,
        private accountService: AccountService,
        
    ) {
        let onFinish = this.service.onFinish.subscribe(res => {
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
                        let item = checklist.items[index];
                        item.finalizado = true;
                        item.dataFinalizacao = res.dataFinalizacao;
                        item.account_Finalizacao_Id = res.account_Finalizacao_Id;
                        item.account_Finalizacao = res.account_Finalizacao;

                        checklist.items.splice(index, 1, item);
                    }
                    return checklist;
                });
                aluno = await this.alunoService.mapAluno(aluno)
                return aluno;
            })
        });
        this.subscription.push(onFinish);


        let list = this.service.list.subscribe(res => this.checklists = res);
        this.subscription.push(list);

        let exibicaoLista = this.service.exibicaoLista.subscribe(res => this.alunos = res);
        this.subscription.push(exibicaoLista);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async update() {
        await this.getChecklists();
        this.getChecklistAlunos();
        this.getAlunosList();
    }


    async getChecklists() {
        this.loadingChecklists = true;
        await lastValueFrom(this.service.getList())
            .then(res => {
                this.loadingChecklists = false;
                this.checklists = res;
            })
            .catch(res => this.loadingChecklists = false);
    }

    getChecklistAlunos() {
        this.loadingChecklistAlunos = true;
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
                this.loadingChecklistAlunos = false;

                this.applyPendentesSemana(this.request.pendentesSemana);
            })
            .catch(res => this.loadingChecklistAlunos = false);

    }

    getAlunosList() {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getListWithChecklist(this.request))
        .then(res => {
            this.service.exibicaoLista.next(res);
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


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }
    
    applyFilter(request: JornadaSuperaRequest) {
        this.request = request;
        this.update();
    }

}
