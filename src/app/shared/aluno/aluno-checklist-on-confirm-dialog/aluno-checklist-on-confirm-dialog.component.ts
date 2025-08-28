import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Aluno_CheckList_Item, Checklist_Item } from '../../../models/checklist.model';
import { ChecklistService } from '../../../services/checklist.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp, showError } from '../../../utils';
import { lastValueFrom } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { AlunoService } from '../../../services/alunos.service';
import { UserService } from '../../../services/user.service';
import { AccountService } from '../../../services/account.service';

@Component({
    selector: 'app-aluno-checklist-on-confirm-dialog',
    standalone: false,
    templateUrl: './aluno-checklist-on-confirm-dialog.component.html',
    styleUrl: './aluno-checklist-on-confirm-dialog.component.css',
    providers: [ConfirmationService],
})
export class AlunoChecklistOnConfirmDialogComponent implements OnChanges {
    visible = false;
    observacao = '';
    celular = '';
    loading = false;

    @Input() aluno!: Aluno;
    @Input() alunoChecklistItem: any; //Aluno_CheckList_Item | Aluno_Checklist_Item_View;
    @Input() item!: Checklist_Item;

    @Output() onCancel = new EventEmitter<boolean>();
    @Output() onFinish = new EventEmitter<any>();

    constructor(
        private service: ChecklistService,
        private toastr: ToastrService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private mensagemWhatsapp: MensagemWhatsapp,
        private alunoService: AlunoService,
        private userService: UserService,
        private accountService: AccountService,
    ) { }        


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            this.celular = this.aluno?.celular;
            this.cdr.markForCheck();
        }
        if (changes['alunoChecklistItem']) {
            this.alunoChecklistItem = changes['alunoChecklistItem'].currentValue;
            this.celular = this.alunoChecklistItem?.celular;
            this.cdr.markForCheck();
        }
        if (changes['item']) {
            this.item = changes['item'].currentValue;
        }
    }

    show(aluno?: Aluno, alunoChecklistItem?: Aluno_CheckList_Item) {
        this.visible = true;
        
        if (aluno) {
            this.aluno = aluno;
        }

        if (alunoChecklistItem)
            this.alunoChecklistItem = alunoChecklistItem;

        if (!this.aluno) {
            this.loadAluno();
        }
    }

    hide() {
        this.visible = false;
        this.cdr.markForCheck(); // Marca para verificação na próxima detecção
        this.cdr.detectChanges();
    }

    onHide() {
        this.onCancel.emit(false);
    }

    showError(header: string, message: string, e: any, error: any) {
        showError(this.confirmationService, header, message, e, error.toString());
    }

    async loadAluno() {
        this.loading = true;

        await lastValueFrom(this.alunoService.get(this.alunoChecklistItem.aluno_Id))
            .then(res => {
                this.aluno = res;
                this.celular = res.celular;
                this.loading = false;
            })
            .catch(res => {
                console.error('Não foi possível carregar aluno em aluno-checklist-on-confirm-dialog.component.ts')
                this.loading = false;
            });

        this.cdr.markForCheck(); // Marca para verificação na próxima detecção
        this.cdr.detectChanges()
    }

    send(e: any) {
        this.loading = true;
        this.alunoChecklistItem.observacoes = this.observacao
        lastValueFrom(this.service.markAsDone(this.alunoChecklistItem.id, this.alunoChecklistItem.observacoes))
            .then(res => {
                this.observacao = '';
                this.loading = false;
                this.toastr.success(`Checklist ${this.item.nome} finalizado com sucesso!`);

                res.object.account_Finalizacao = this.accountService.accountValue!.name;
                this.onFinish.emit(res.object);
                this.onCancel.complete();
                this.hide();
            })
            .catch(res => {
                this.showError('Erro', 'Não foi possível finalizar o checklist.', e, res)
                this.hide();
                this.onCancel.emit(true);
            });
    }


    enviarMensagemCondicao() {

        let id = this.alunoChecklistItem.checklist_Item_Id;
        let aluno = {
            nome: this.aluno?.nome ?? this.alunoChecklistItem.aluno,
            celular: this.aluno?.celular ?? this.alunoChecklistItem.celular,
            email: this.aluno?.email ?? this.alunoChecklistItem.email,
            diaSemana: this.aluno?.diaSemana ?? this.alunoChecklistItem.diaSemana,
            horario: this.aluno?.horario ?? this.alunoChecklistItem.horario,
            professor: this.aluno?.professor ?? this.alunoChecklistItem.professor,
            linkGrupo: this.aluno?.linkGrupo ?? this.alunoChecklistItem.linkGrupo
        }

        this.mensagemWhatsapp.enviarMensagemCondicao(aluno, id);
    }

}
