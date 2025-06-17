import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno } from '../../../models/alunos.model';
import { showError } from '../../../utils';
import { ChecklistService } from '../../../services/checklist.service';
import { UserService } from '../../../services/user.service';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';
import { Aluno_CheckList_Item } from '../../../models/checklist.model';
import { AlunoChecklistCompleto } from '../../../models/calendario.model';
import { NgModel } from '@angular/forms';
import $ from 'jquery';

@Component({
    selector: 'app-aluno-checklist-dialog',
    standalone: false,
    templateUrl: './aluno-checklist-dialog.component.html',
    styleUrl: './aluno-checklist-dialog.component.css',
    providers: [ConfirmationService],
})
export class AlunoChecklistDialogComponent implements OnChanges, OnDestroy {

    @Input() aluno: Aluno = new Aluno;
    @Input() loading = false;

    visible = false;
    checklistObservacao = '';
    scrollLeft: number = 0;

    constructor(

        private checklistService: ChecklistService,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            console.log('aluno-checklist-dialog aluno', this.aluno)
        }
        if (changes['loading']) this.loading = changes['loading'].currentValue;

    }

    ngOnDestroy(): void {

    }

    visibleChanged() {
        if (this.visible) {
            var tab = $(`p-tab[ng-reflect-value="${this.aluno.checklist_Id ?? 1}"]`).last()
            this.scrollLeft = $(tab).offset()?.left ?? 0
            $('.p-tablist-viewport').animate({
                scrollLeft: this.scrollLeft
            }, 300)
        }
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    checkboxChange(item: Aluno_CheckList_Item, checklist: AlunoChecklistCompleto, model: NgModel, e: any) {
        if (model.control.value) {
            if (moment(item.prazo).week() > moment(new Date).week()) {
                this.showError('Checklist indisponível', 'Você não pode finalizar esse checklist ainda.', e);
                model.control.setValue(false);
                return;
            }

            // playAlert();

            this.confirmationService.confirm({
                key: 'checklistConfirmation',
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    this.loading = true;
                    item.observacoes = this.checklistObservacao
                    lastValueFrom(this.checklistService.markAsDone(item.id, item.observacoes))
                        .then(res => {
                            // playSuccess();
                            this.checklistObservacao = '';
                            this.loading = false;
                            this.toastrService.success(`Checklist ${item.nome} finalizado com sucesso!`);
                            item.finalizado = true;
                            item.dataFinalizacao = res.object.dataFinalizacao;
                            item.account_Finalizacao_Id = res.object.account_Finalizacao_Id;

                            checklist.prazo = checklist.items[0].prazo;
                            checklist.finalizados = checklist.items.filter((x: any) => x.finalizado)
                            checklist.atrasados = checklist.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                            checklist.pendentesDaSemana = checklist.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);

                            this.userService.get(item.account_Finalizacao_Id!)
                                .then(res => item.account_Finalizacao = res.name);

                        })
                },
                reject: () => {
                    model.control.setValue(false);
                }
            });
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }
}
