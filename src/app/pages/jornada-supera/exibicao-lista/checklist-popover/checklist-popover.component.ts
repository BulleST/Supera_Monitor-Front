import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { lastValueFrom, Subscription } from 'rxjs';
import { MensagemWhatsapp } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { JornadaSupera_List_Aluno, JornadaSupera_List_Checklist, JornadaSupera_List_Checklist_Item_Aluno } from '../../../../models/jornada-supera-list.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {  FinalizarChecklistComponentView } from '../../../../shared/checklist/finalizar-checklist/finalizar-checklist.component';
import { AlunoChecklistDetalhesView } from '../../../../shared/checklist/aluno-checklist-detalhes/aluno-checklist-detalhes.component';
import { showChecklistDetalhes } from '../../../../utils/show-aluno-checklist-detalhes';
import { showFinalizarChecklist } from '../../../../utils/show-finalizar-checklist';
import { ChecklistItemId, checklistsMensagemWhatsapp } from '../../../../models/checklist-item-id.enum';
import { showAgendarAulaZero } from '../../../../utils/show-agendar-superacao';
import { showAgendarSuperacao } from '../../../../utils/show-agendar-aula-zero';
import { showAgendarPrimeiraAula } from '../../../../utils/show-agendar-primeira-aula';
import { AlunoService } from '../../../../services/alunos.service';
import { showAgendarOficina } from '../../../../utils/show-agendar-oficina';
import { EventoService } from '../../../../services/evento.service';

@Component({
    selector: 'app-checklist-popover-jornada',
    standalone: false,
    templateUrl: './checklist-popover.component.html',
    styleUrl: './checklist-popover.component.css',
    providers: [DialogService]
})
export class ChecklistPopoverComponent implements OnDestroy, OnChanges {

    @Input() checklist!: JornadaSupera_List_Checklist;
    @Input() aluno!: JornadaSupera_List_Aluno;

    subscription: Subscription[] = [];
    checklistsMensagemWhatsapp = checklistsMensagemWhatsapp;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private alunoService: AlunoService,
        private eventoService: EventoService,
        private dialogService: DialogService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
    ) {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklist']) {
            this.checklist = changes['checklist'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
    }

    toggle(e: any, aluno: JornadaSupera_List_Aluno, checklist: JornadaSupera_List_Checklist) {
        this.popover.toggle(e);
        this.aluno = aluno;
        this.checklist = checklist
    }


    hide() {
        if (this.popover)
            this.popover.hide();
    }

    enviarMensagem(aluno: JornadaSupera_List_Aluno) {
        if (!aluno.celular) {
            this.toastr.error('Nenhum celular cadastrado');
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    enviarMensagemCondicao(item: JornadaSupera_List_Checklist_Item_Aluno, aluno: JornadaSupera_List_Aluno) {
        this.mensagemWhatsapp.enviarMensagemJornadaSupera(aluno, item.checklist_Item_Id);
    }

    async finalizarChecklist(item: JornadaSupera_List_Checklist_Item_Aluno) {
        let ref: DynamicDialogRef | null = null;
        if (item.checklist_Item_Id == ChecklistItemId.AgendamentoAulaZero) {
            ref = showAgendarAulaZero(this.dialogService, this.aluno.id);
        }
        else if (item.checklist_Item_Id == ChecklistItemId.Agendamento1Superacao || item.checklist_Item_Id == ChecklistItemId.Agendamento2Superacao) {
            ref = showAgendarSuperacao(this.dialogService, this.aluno.id);
        }
        else if (item.checklist_Item_Id == ChecklistItemId.AgendamentoPrimeiraAula) {
            const aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
            this.alunoService.setAluno(aluno);

            ref = showAgendarPrimeiraAula(this.dialogService, aluno, undefined)
        }
        else if (item.checklist_Item_Id == ChecklistItemId.Agendamento1Oficina || item.checklist_Item_Id == ChecklistItemId.Agendamento2Oficina) {
            const aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
            this.alunoService.setAluno(aluno);

            ref = showAgendarOficina(this.dialogService, aluno)
        }
        else {

            const view: FinalizarChecklistComponentView = {
                    alunoId: this.aluno.id,
                    alunoChecklistItemId: item.id,
                    checklistItemId: item.checklist_Item_Id,
                    checklistId: this.checklist.id,
    
                    checklistItem: item.checklist_Item,
                    aluno: this.aluno.nome,
                    turma: this.aluno.turma,
                    corLegenda: this.aluno.corLegenda,
                    celular: this.aluno.celular,
                    prazo: item.prazo,
                    status: item.status,
            }
    
            ref = showFinalizarChecklist(this.dialogService, view);
    
        }
        if (ref) {
            ref.onClose.subscribe(res => {
                console.log('onClose', res)
                item.finalizado = res;
                this.alunoService.setAluno(undefined);
                this.eventoService.setEvento(undefined);
            })
        }

    }

    showChecklistDetalhes(item: JornadaSupera_List_Checklist_Item_Aluno) {
        const view: AlunoChecklistDetalhesView = {
            alunoChecklistItemId: item.id,
            
            checklist: this.checklist.nome,
            checklistId: this.checklist.id,
            
            checklistItem: item.checklist_Item,
            checklistItemId: item.checklist_Item_Id,

            prazo: item.prazo,
            dataFinalizacao: item.dataFinalizacao,
            account: item.account,
            observacoes: item.observacoes,
            evento_Id: item.evento_Id,

            aluno_Id: this.aluno.id,
            aluno: this.aluno.nome,
            celular: this.aluno.celular,
            turma: this.aluno.turma,
            corLegenda: this.aluno.corLegenda,
            
        }
        const ref = showChecklistDetalhes(
            this.dialogService,
            view
        );
    }
}

