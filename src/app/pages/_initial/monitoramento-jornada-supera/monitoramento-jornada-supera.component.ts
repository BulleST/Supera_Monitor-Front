import { Component, OnDestroy } from '@angular/core';
import { Checklist, Checklist_Item } from '../../../models/checklist.model';
import { getError, showError } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { ChecklistService } from '../../../services/checklist.service';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno } from '../../../models/alunos.model';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Professor } from '../../../models/professor.model';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { AccountService } from '../../../services/account.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoChecklistItemList, AlunoChecklistItemList_Request } from '../../../models/aluno-checklist-item-list.model';
import { playAlert, playSuccess } from '../../../utils/audio';

@Component({
    selector: 'app-monitoramento-jornada-supera',
    standalone: false,
    templateUrl: './monitoramento-jornada-supera.component.html',
    styleUrl: './monitoramento-jornada-supera.component.css',
    providers: [ConfirmationService]
})
export class MonitoramentoJornadaSuperaComponent implements OnDestroy {

    checklistObservacao = '';
    subscription: Subscription[] = [];
    request: AlunoChecklistItemList_Request = new AlunoChecklistItemList_Request;

    items: Checklist_Item[] = [];
    checklists: Checklist[] = [];
    loadingChecklist = true;

    list: AlunoChecklistItemList[] = [];
    listFiltered: AlunoChecklistItemList[] = [];
    loading = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    alunos: Aluno[] = [];
    loadingAlunos = false;


    constructor(
        private service: ChecklistService,
        private alunoService: AlunoService,
        private confirmationService: ConfirmationService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private turmaService: TurmaService,
        private accountService: AccountService,
        private professorService: ProfessorService,


    ) {

        let professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }
        let alunos = this.alunoService.list.subscribe(res => this.alunos = res);
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        this.accountService.account.subscribe(res => {
            if (!localStorage.getItem('professor_Id')) {
                this.request.professor_Id = res?.professor_Id;
            }
        })
        
        if (!!localStorage.getItem('professor_Id')) {
            this.request.professor_Id = parseInt(localStorage.getItem('professor_Id')!)
        }

        if (!!localStorage.getItem('turma_Id')) {
            this.request.turma_Id = parseInt(localStorage.getItem('turma_Id')!)
        }
        if (!!localStorage.getItem('aluno_Id')) {
            this.request.aluno_Id = parseInt(localStorage.getItem('aluno_Id')!)
        }

        this.update();

    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async update() {
        if (!this.checklists.length)
            await this.getChecklists();

        this.getList();
    }


    async getChecklists() {
        this.loadingChecklist = true;
        await lastValueFrom(this.service.getList())
            .then(res => {
                this.checklists = res;
                this.items = res.flatMap(x => x.items);
            });

        this.loadingChecklist = false;
    }

    getList() {
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

                this.filtrarPendentesSemana();
            })
            .catch(res => this.loading = false);

    }

    filtrarPendentesSemana() {
        console.log('pendentesSemana', this.request.pendentesSemana)
        if (this.request.pendentesSemana) {
            this.listFiltered = this.list.filter(x => moment(x.prazo).week() == moment().week())
        } else {
            this.listFiltered = this.list;
        }
        this.setChecklist();
    }

    setChecklist() {
        this.checklists = this.checklists.map(checklist => {
            checklist.items = checklist.items.map(checklistItem => {
                let itens = this.listFiltered.filter(x => x.checklist_Item_Id == checklistItem.id);
                checklistItem.alunos = itens;
                return checklistItem;
            });
            return checklist;
        });
    }

    turmaChanged() {
        if (this.request.turma_Id) {
            let turma = this.turmas.find(x => x.id == this.request.turma_Id) as Turma; 
            this.request.professor_Id = turma.professor_Id;
        }

        this.setAlunosDisabled();
        

        let aluno = this.alunos.find(x => x.id == this.request.aluno_Id);
        if (this.request.turma_Id && aluno && aluno.turma_Id != this.request.turma_Id) {
            this.request.aluno_Id = undefined;
        }

        this.setLocalStorage();
    }

    professorChanged() {
        
        this.setTurmaDisabled();
        this.setAlunosDisabled();

        let aluno = this.alunos.find(x => x.id == this.request.aluno_Id);
        if (this.request.professor_Id && aluno && aluno.professor_Id != this.request.professor_Id) {
            this.request.aluno_Id = undefined;
        }

        let turma = this.turmas.find(x => x.id == this.request.turma_Id);
        if (this.request.turma_Id && turma && turma.id != this.request.turma_Id) {
            this.request.turma_Id = undefined;
        }
        
        this.setLocalStorage();

    }

    alunoChanged() {
        if (this.request.aluno_Id) {
            let aluno = this.alunos.find(x => x.id == this.request.aluno_Id) as Aluno;
            this.request.turma_Id = aluno.turma_Id;
            this.request.professor_Id = aluno.professor_Id;
        }
        
        this.setLocalStorage();
    }
    
    setTurmaDisabled() {
        this.turmas = this.turmas.map((x: any) => {
            x.disabled = this.request.professor_Id ? x.professor_Id == this.request.professor_Id ? false : true : false;
            return x;
        })

    }

    setAlunosDisabled() {
        this.alunos = this.alunos.map((x: any) => {
            if (this.request.turma_Id && this.request.professor_Id) {
                x.disabled = x.turma_Id == this.request.turma_Id && x.professor_Id == this.request.professor_Id ? false : true;
            } else if (this.request.turma_Id) {
                x.disabled = x.turma_Id == this.request.turma_Id ? false : true;
            } else if (this.request.professor_Id) {
                x.disabled = x.professor_Id == this.request.professor_Id ? false : true;
            }
            return x;
        });
    }
    
    setLocalStorage() {
        if(this.request.turma_Id) {
            localStorage.setItem('turma_Id', (this.request.turma_Id??null).toString());
        }else {
            localStorage.removeItem('turma_Id');
        }
        if(this.request.professor_Id) {
            localStorage.setItem('professor_Id', (this.request.professor_Id??null).toString());
        }else {
            localStorage.removeItem('professor_Id');
        }
        if(this.request.aluno_Id) {
            localStorage.setItem('aluno_Id', (this.request.aluno_Id??null).toString());
        }else {
            localStorage.removeItem('aluno_Id');
        }

    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    enviarMensagemAluno(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }
    enviarMensagem(aluno: AlunoChecklistItemList) {
        if(!aluno.aluno) {
            console.log('aluno', aluno)
        }
        return this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular);
    }

    enviarMensagemApresentacaoDiretorFranqueado(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(aluno.aluno, aluno.celular);
    }
    enviarMensagemBoasVindas(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(aluno.aluno, aluno.celular);
    }
    enviarMensagemAdequacaoTurma(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(aluno.aluno, aluno.celular);
    }
    enviarMensagemLembreteOficina(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(aluno.aluno, aluno.celular);
    }
    enviarMensagemLembreteSuperacao(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(aluno.aluno, aluno.celular);
    }
    enviarMensagemFeedbackPosVenda(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(aluno.aluno, aluno.celular);
    }
    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno: AlunoChecklistItemList) {
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.aluno, aluno.celular);
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    finalizarChecklist(e: any, item: AlunoChecklistItemList) {
        playAlert();

        this.confirmationService.confirm({
            key: 'checklistConfirmation',
            message: `Tem certeza que deseja marcar o item <b>"${item.checklist_Item}"</b> para o(a) aluno(a) <b>${item.aluno}</b> como finalizado?`,
            header: 'Finalizar item da jornada',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Finalizar',
            acceptButtonStyleClass: 'p-button-rounded px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-text',
            accept: async () => {
                this.loadingAlunos = true;
                item.observacoes = this.checklistObservacao
                lastValueFrom(this.service.markAsDone(item.id, this.checklistObservacao))
                    .then(res => {
                        playSuccess();

                        this.checklistObservacao = '';

                        let checklistIndex = this.checklists.findIndex(x => x.id == item.checklist_Id);
                        let checklist = this.checklists.find(x => x.id == item.checklist_Id);
                        if(checklistIndex != -1 && checklist ) {
                            let checklistItemIndex = checklist.items.findIndex(x => x.id == item.checklist_Item_Id);
                            let checklistItem = checklist.items.find(x => x.id == item.checklist_Item_Id);

                            if (checklistItem && checklistItemIndex != -1) {
                                let aluno = checklistItem.alunos.find(x => x.aluno_Id == item.aluno_Id);
                                let alunoIndex = checklistItem.alunos.findIndex(x => x.aluno_Id == item.aluno_Id);
                                if (aluno && alunoIndex != -1) {
                                    checklistItem.alunos.splice(alunoIndex, 1);
                                }
                            }
                        }

                    })
                    .catch(res => {
                        this.loadingAlunos = false;
                        this.showError('Não foi possível finalizar checklist.', getError(res), e);
                    })
            },
            reject: () => {
            }
        });

    }
}
