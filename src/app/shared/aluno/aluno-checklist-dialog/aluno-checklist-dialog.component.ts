    import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
    import { Aluno } from '../../../models/alunos.model';
    import { Aluno_CheckList_Item } from '../../../models/checklist.model';
    import $ from 'jquery';
    import { AlunoChecklistOnConfirmDialogComponent } from '../aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
    import { NgModel } from '@angular/forms';
    import { MensagemWhatsapp } from '../../../utils';

    @Component({
        selector: 'app-aluno-checklist-dialog',
        standalone: false,
        templateUrl: './aluno-checklist-dialog.component.html',
        styleUrl: './aluno-checklist-dialog.component.css',
    })
    export class AlunoChecklistDialogComponent implements OnChanges, OnDestroy {

        @Input() aluno: Aluno = new Aluno;
        @Input() loading = false;
        @Output() onChecklistMark = new EventEmitter<any>();

        visible = false;
        scrollLeft: number = 0;

        selectedAlunoChecklistItem?: Aluno_CheckList_Item;
        @ViewChild('alunoChecklistOnConfirmDialog') alunoChecklistOnConfirmDialog!: AlunoChecklistOnConfirmDialogComponent;

        constructor(        
            private mensagemWhatsapp: MensagemWhatsapp,
        ) {

        }

        ngOnChanges(changes: SimpleChanges): void {
            if (changes['aluno']) {
                this.aluno = changes['aluno'].currentValue;
            }
            if (changes['loading']) this.loading = changes['loading'].currentValue;
        }

        ngOnDestroy(): void {

        }

        visibleChanged() {
            if (this.visible) {
                const tab = $(`p-tab[ng-reflect-value="${this.aluno.checklist_Id ?? 1}"]`).last()
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

        checkboxMark(alunoChecklistItem: Aluno_CheckList_Item, model: NgModel) {
            this.selectedAlunoChecklistItem = alunoChecklistItem;
            this.alunoChecklistOnConfirmDialog.alunoChecklistItem = alunoChecklistItem;
            this.alunoChecklistOnConfirmDialog.aluno = this.aluno;
            this.alunoChecklistOnConfirmDialog.show();

            const onCancel = this.alunoChecklistOnConfirmDialog.onCancel.subscribe(res => {
                console.log('onCancel', res)
                model.control.setValue(false);
                model.control.updateValueAndValidity();
                this.alunoChecklistOnConfirmDialog.hide();
                onCancel.unsubscribe();
            });

            const onFinish = this.alunoChecklistOnConfirmDialog.onFinish.subscribe(res => {
                console.log('onFinish', res)
                alunoChecklistItem.observacoes = res.observacoes;
                alunoChecklistItem.dataFinalizacao = res.dataFinalizacao;
                alunoChecklistItem.account_Finalizacao_Id = res.account_Finalizacao_Id;
                alunoChecklistItem.account_Finalizacao = res.account_Finalizacao;
                onFinish.unsubscribe();
            });

        }

        
            enviarMensagemCondicao(alunoChecklistItem: Aluno_CheckList_Item) {
                if (this.aluno && this.aluno.celular) {
                    const id = alunoChecklistItem.checklist_Item_Id;
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
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagem(nome, celular);
            }
        
            enviarMensagemApresentacaoDiretorFranqueado() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(nome, celular);
            }
        
            enviarMensagemBoasVindas() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                const email = this.aluno?.email;
                const diaSemana = this.aluno?.diaSemana;
                const horario = this.aluno?.horario;
                const professor = this.aluno?.professor;
                const linkGrupo = this.aluno?.linkGrupo;
                return this.mensagemWhatsapp.enviarMensagemBoasVindas(nome, celular, email, diaSemana, horario, professor, linkGrupo);
            }
        
            enviarMensagemAdequacaoTurma() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(nome, celular);
            }
        
            enviarMensagemLembreteOficina() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagemLembreteOficina(nome, celular);
            }
        
            enviarMensagemLembreteSuperacao() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(nome, celular);
            }
        
            enviarMensagemFeedbackPosVenda() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(nome, celular);
            }
        
            enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda() {
                const nome = this.aluno?.nome;
                const celular = this.aluno?.celular;
                return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(nome, celular);
            }

    }
