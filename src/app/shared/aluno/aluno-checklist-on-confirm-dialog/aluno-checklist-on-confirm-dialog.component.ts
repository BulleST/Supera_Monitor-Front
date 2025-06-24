import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Aluno_CheckList_Item, Checklist_Item } from '../../../models/checklist.model';
import { ChecklistService } from '../../../services/checklist.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp, showError } from '../../../utils';
import { lastValueFrom } from 'rxjs';
import { Aluno_Checklist_Item_View } from '../../../models/aluno-checklist-item-list.model';
import { Aluno } from '../../../models/alunos.model';
import { AlunoService } from '../../../services/alunos.service';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'app-aluno-checklist-on-confirm-dialog',
    standalone: false,
    templateUrl: './aluno-checklist-on-confirm-dialog.component.html',
    styleUrl: './aluno-checklist-on-confirm-dialog.component.css',
    providers: [ConfirmationService]
})
export class AlunoChecklistOnConfirmDialogComponent implements OnChanges {

    visible = false;
    observacao = '';
    celular = '';
    loading = false;

    @Input() aluno!: Aluno;
    @Input() alunoChecklistItem: any;//Aluno_CheckList_Item | Aluno_Checklist_Item_View;
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
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['alunoChecklistItem']) {
            this.alunoChecklistItem = changes['alunoChecklistItem'].currentValue;
            this.celular = this.alunoChecklistItem?.celular;
        }
        if (changes['item']) {
            this.item = changes['item'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            this.celular = this.aluno?.celular;
            this.cdr.markForCheck(); // Marca para verificação na próxima detecção
            this.cdr.detectChanges();
        }
    }

    show() {
        this.visible = true;
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
                this.hide();

                this.userService.get(res.object.account_Finalizacao_Id)
                    .then(user => {
                        res.object.account_Finalizacao = user.name;
                        this.onFinish.emit(res.object);
                        this.service.onFinish.emit(res.object)
                    });

            })
            .catch(res => {
                this.showError('Erro', 'Não foi possível finalizar o checklist.', e, res)
                this.hide();
                this.onCancel.emit(true);
            });
    }


    enviarMensagemAluno() {
        var nome = this.aluno.nome;
        return this.mensagemWhatsapp.enviarMensagem(nome, this.celular);
    }

    enviarMensagemCondicao() {
        if (this.alunoChecklistItem && this.aluno) {
            var id = this.alunoChecklistItem.checklist_Item_Id;
            // Apresentação do Diretor Franqueado 
            if (id == 8) {
                return this.enviarMensagemApresentacaoDiretorFranqueado();
                // Confirmação da adequação do aluno ao perfil da turma 
            } else if (id == 9) {
                return this.enviarMensagemAdequacaoTurma();
                // Agendar 1ª Oficina 
            } else if (id == 12) {
                return this.enviarMensagemLembreteOficina();
                // Feedback pós venda 
            } else if (id == 13) {
                return this.enviarMensagemFeedbackPosVenda();
                // Confirmação de preeechimento do feedback pós venda 
            } else if (id == 32) {
                return this.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda();
                // Mensagem de boas-vindas 
            } else if (id == 37) {
                return this.enviarMensagemBoasVindas();
                // Agendar Superação 
            } else if (id == 22) {
                return this.enviarMensagemLembreteSuperacao();
                // Agendar 2ª Superação 
            } else if (id == 29) {
                return this.enviarMensagemLembreteSuperacao();
                // Agendar 2ª Oficina 
            } else if (id == 23) {
                return this.enviarMensagemLembreteOficina();
            } else {
                return this.enviarMensagem();
            }
        }
        return this.enviarMensagem();
    }

    enviarMensagem() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem?.aluno;
        return this.mensagemWhatsapp.enviarMensagem(nome, this.celular);
    }

    enviarMensagemApresentacaoDiretorFranqueado() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(nome, this.celular);
    }

    enviarMensagemBoasVindas() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        var email = this.aluno?.email ?? this.alunoChecklistItem.email;
        var diaSemana = this.aluno?.diaSemana ?? this.alunoChecklistItem.diaSemana;
        var horario = this.aluno?.horario ?? this.alunoChecklistItem.horario;
        var professor = this.aluno?.professor ?? this.alunoChecklistItem.professor;
        var linkGrupo = this.aluno?.linkGrupo ?? this.alunoChecklistItem.linkGrupo;
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(nome, this.celular, email, diaSemana, horario, professor, linkGrupo);
    }

    enviarMensagemAdequacaoTurma() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(nome, this.celular);
    }

    enviarMensagemLembreteOficina() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(nome, this.celular);
    }

    enviarMensagemLembreteSuperacao() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(nome, this.celular);
    }

    enviarMensagemFeedbackPosVenda() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(nome, this.celular);
    }

    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda() {
        var nome = this.aluno?.nome ?? this.alunoChecklistItem.aluno;
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(nome, this.celular);
    }


}
