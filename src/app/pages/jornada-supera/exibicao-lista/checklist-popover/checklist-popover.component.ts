import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { Subscription } from 'rxjs';
import { MensagemWhatsapp } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { JornadaSupera_List_Aluno, JornadaSupera_List_Checklist, JornadaSupera_List_Checklist_Item_Aluno } from '../../../../models/jornada-supera-list.model';
import { DialogService } from 'primeng/dynamicdialog';
import { FinalizarChecklistComponent, FinalizarChecklistComponentModel } from '../../../../shared/checklist/finalizar-checklist/finalizar-checklist.component';
import { AlunoChecklistDetalhesComponent, AlunoChecklistDetalhesView } from '../../../../shared/checklist/aluno-checklist-detalhes/aluno-checklist-detalhes.component';
import { AlunoDetalhesComponent } from '../../../../shared/aluno/aluno-detalhes/aluno-detalhes.component';

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

    @ViewChild('popover') popover!: Popover;

    prazo!: Date;

    constructor(
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
            this.prazo = this.checklist.items[0].prazo;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
    }

    toggle(e: any, aluno: JornadaSupera_List_Aluno, checklist: JornadaSupera_List_Checklist) {
        this.popover.toggle(e);
        this.aluno = aluno;
        this.checklist = checklist
        this.prazo = this.checklist.items[0].prazo;
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
        this.mensagemWhatsapp.enviarMensagemCondicao(aluno, item.checklist_Item_Id);
    }

    finalizarChecklist(item: JornadaSupera_List_Checklist_Item_Aluno) {

        var view: FinalizarChecklistComponentModel = {
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
        var ref = this.dialogService.open(FinalizarChecklistComponent, {
            header: 'Finalizar Checklist',
            showHeader: false,
            closable: true,
            maximizable: false,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '95vw',
            style: {
                maxWidth: '500px',
            },
            data: {
                view: view
            }
        })

        ref.onClose.subscribe(res => item.finalizado = res)
    }

    showChecklistDetalhes(item: JornadaSupera_List_Checklist_Item_Aluno) {

        var view: AlunoChecklistDetalhesView = {
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

        var ref = this.dialogService.open(AlunoChecklistDetalhesComponent, {
            showHeader: false,
            closable: true,
            maximizable: true,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '95vw',
            style: {
                maxWidth: '500px',
            },
            data: {
                view: view
            }

        });
    }

}

