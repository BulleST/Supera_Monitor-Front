import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarioAluno, CalendarioAlunoChecklistView, CalendarioAula } from '../../../../models/calendario.model';
import moment from 'moment';
import { ReposicaoAluno } from '../../../../models/reposicao.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../../../../utils';
import { AulaService } from '../../../../services/aulas.service';
import { Aluno_CheckList_Item, Checklist, Checklist_Item, checklists } from '../../../../models/checklist.model';
import { lastValueFrom } from 'rxjs';
import { ChecklistService } from '../../../../services/checklist.service';
import { UserService } from '../../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'app-selected-aluno',
    standalone: false,
    templateUrl: './selected-aluno.component.html',
    styleUrl: './selected-aluno.component.css',
    // providers: [ConfirmationService],
})
export class SelectedAlunoComponent implements OnChanges {
    visible = false;
    itemChecklists: Checklist_Item[] = [];
    loadingChecklist = true;

    checklists: Checklist[] = checklists;
    currentIndex = 0;
    currentChecklist: Checklist = checklists[0];
    prevChecklist?: Checklist = undefined;
    nextChecklist?: Checklist = checklists[1];

    @Input() selectedAluno?: CalendarioAluno;
    @Input() selectedAula: CalendarioAula = new CalendarioAula;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: AulaService,
        private checklistService: ChecklistService,
        private userService: UserService,

        private toastrService: ToastrService,
        private confirmationService: ConfirmationService
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedAula']) {
            this.selectedAula = changes['selectedAula'].currentValue;
        }
        if (changes['selectedAluno']) {
            this.selectedAluno = changes['selectedAluno'].currentValue;
            if (this.selectedAluno) {
                this.carregaChecklist()
            }
        }

        if (this.selectedAluno && this.selectedAula) {
            this.visible = true;
        } else {
            this.visible = false;
        }

        this.itemChecklists = checklists.find(x => x.nome == '1ª Semana')?.items as Checklist_Item[];
    }

    hideAluno() {
        if (!this.visible) {
            this.selectedAluno = undefined;
            this.visible = false
        }
    }

    // prev() {
    //     if (this.currentIndex == 0) {
    //         this.prevChecklist = undefined;
    //         this.nextChecklist = checklists[this.currentIndex + 1];
    //         return;
    //     }
    //     this.currentIndex -= 1;
    //     this.currentChecklist = checklists[this.currentIndex];
    //     this.prevChecklist = checklists[this.currentIndex - 1];
    //     this.nextChecklist = checklists[this.currentIndex + 1];


    // }

    // next() {
    //     if (this.currentIndex == (this.checklists.length - 1)) {
    //         this.prevChecklist = checklists[this.currentIndex - 1];
    //         this.nextChecklist = undefined;
    //         return
    //     }
    //     this.currentIndex += 1;
    //     this.currentChecklist = checklists[this.currentIndex];
    //     this.prevChecklist = checklists[this.currentIndex - 1];
    //     this.nextChecklist = checklists[this.currentIndex + 1];
    // }




    goToAluno(aluno: CalendarioAluno) {
        this.router.navigate(['aluno', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute });
    }


    goToReposicao(aluno: CalendarioAluno) {
        if (this.selectedAula) {
            var reposicao: ReposicaoAluno = {
                aluno: aluno.aluno,
                aluno_Id: aluno.aluno_Id,
                aluno_PerfilCognitivo: aluno.perfilCognitivo,
                aluno_PerfilCognitivo_Id: aluno.perfilCognitivo_Id,
                source_Sala_Id: this.selectedAula.sala_Id,
                source_Aula_Id: this.selectedAula.aula_Id,
                source_Data: this.selectedAula.data,
                source_Turma_Id: aluno.turma_Id,
                source_Turma: aluno.turma,
                source_Professor_Id: this.selectedAula.professor_Id,
                source_Professor: this.selectedAula.professor
            };
            this.service.reposicao.next(reposicao);

            reposicao.source_Data = moment(this.selectedAula.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                this.router.navigate(['reposicao', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute, queryParams: reposicao })
        }
    }

    async carregaChecklist() {
        if (this.selectedAluno) {
            this.loadingChecklist = true;

            await lastValueFrom(this.checklistService.getList())
                .then(res => {
                    this.checklists = res;
                    this.loadingChecklist = false;
                })
                .catch(res => this.loadingChecklist = false);

            this.loadingChecklist = true;
            lastValueFrom(this.checklistService.getChecklistAluno(this.selectedAluno!.aluno_Id))
                .then(res => {

                    this.selectedAluno!.checklists = this.checklists.map(checklist => {

                        var checklistAluno = new CalendarioAlunoChecklistView;
                        checklistAluno.id = checklist.id;
                        checklistAluno.nome = checklist.nome;
                        checklistAluno.items = res.filter(x => x.checklist_Id == checklist.id);
                        checklistAluno.prazo = checklistAluno.items[0].prazo;
                        checklistAluno.finalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                        checklistAluno.atrasados = checklistAluno.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                        checklistAluno.pendentesDaSemana = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);

                        return checklistAluno;
                    });

                    this.loadingChecklist = false;
                })
                .catch(res => {
                    this.loadingChecklist = false;
                })

        }
    }

    getChecklist(id: number, aluno: CalendarioAluno) {
        if (aluno.checklists)
            return aluno.checklists.find(x => x.id == id)
        return undefined
    }

    enviarMensagem() {
        if (this.selectedAluno && this.selectedAluno.celular) {
            var celular = this.selectedAluno.celular.replace(/\D/g, '')
            window.open(`https://api.whatsapp.com/send?phone=+${celular}&text=Olá ${this.selectedAluno.aluno}`)
        }
    }

    checkboxChange(item: Aluno_CheckList_Item, checklist: CalendarioAlunoChecklistView, model: NgModel, e: any) {
        if (model.control.value) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    this.loadingChecklist = true;
                    lastValueFrom(this.checklistService.markAsDone(item.id))
                        .then(res => {
                            this.loadingChecklist = false;
                            this.toastrService.success(`Checklist ${item.nome} finalizado com sucesso!`);
                            item.finalizado = true;
                            item.dataFinalizacao = res.object.dataFinalizacao;
                            item.account_Finalizacao_Id = res.object.account_Finalizacao_Id;
                            
                            checklist.prazo = checklist.items[0].prazo;
                            checklist.finalizados = checklist.items.filter((x: any) => x.finalizado)
                            checklist.atrasados = checklist.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                            checklist.pendentesDaSemana = checklist.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);

                        })
                },
                reject: () => {
                    model.control.setValue(false);
                }
            });
        }
    }

}
