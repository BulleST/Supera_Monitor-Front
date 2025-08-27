import { Component, OnDestroy } from '@angular/core';
import { Evento } from '../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { CalendarioUtils, Crypto, getError, MensagemWhatsapp, showError } from '../../../utils';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { PseudoEvento } from '../../../models/reposicao.model';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';

@Component({
	selector: 'app-aluno-participacao-falta-contato-dialog',
	standalone: false,
	templateUrl: './aluno-participacao-falta-contato-dialog.component.html',
	styleUrl: './aluno-participacao-falta-contato-dialog.component.css',
	providers: [ConfirmationService],
})
export class AlunoParticipacaoFaltaContatoDialogComponent implements OnDestroy {
	visible = false;
	loading = false;
	subscription: Subscription[] = [];
	evento!: Evento;
	participacao!: Evento_Participacao_Aluno;

	alunoId: number = 0;
	alunoContactado: boolean = false;

	passado: boolean = false;

    roteiro?: Roteiro;
    roteiros: Roteiro[] = [];
	

    status = [
        { value: 1, label: 'Não compareceu' },
        { value: 2, label: 'Aguardando Retorno' },
        { value: 3, label: 'Optou por não repor' },
        { value: 4, label: 'Aula Cancelada' },
        { value: 5, label: 'Reposição Agendada' },
        { value: 6, label: 'Reposição Realizada' },
        { value: 7, label: 'Não Compareceu na reposição' },
        { value: 8, label: 'Reposição Desmarcada' },
        { value: 9, label: 'Outro' },
    ]


	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private service: EventoService,
		private roteiroService: RoteiroService,
		private crypto: Crypto,
		private mensagemWhatsapp: MensagemWhatsapp,
		private confirmationService: ConfirmationService,
		private calendarioUtils: CalendarioUtils,
		private toastr: ToastrService,
	
	) {

        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res;
            this.setRoteiro();
        });
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            lastValueFrom(this.roteiroService.getList())
        }

		this.activatedRoute.params.subscribe(res => {
			if (!res['evento_id']) {
				this.visible = false;
				this.visibleChange();
			}
			if (!res['aluno_id']) {
				this.visible = false;
				this.visibleChange();
			}
            this.alunoId = this.crypto.decrypt(res['aluno_id']);
		})

		let evento = this.service.getEvento().subscribe(res => {
			if (res) {
				this.evento = res;
				this.participacao = res.alunos.find(x => x.aluno_Id == this.alunoId) as Evento_Participacao_Aluno;

                if (this.evento && this.participacao) {
                    let hoje = moment(new Date)
                    this.passado = moment(this.evento.data).isSameOrBefore(hoje, 'date');
                    this.alunoContactado = !!this.participacao.alunoContactado;
                    this.visible = true;
                    this.setRoteiro();
                }

			}
		});
		this.subscription.push(evento);
	}


	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	visibleChange() {
		if (!this.visible) {
			let params = this.activatedRoute.snapshot.params;
			this.service.setEvento(undefined)
			this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
		}
	}


    setRoteiro() {
        if (this.roteiros && this.evento) {
            this.roteiro = this.roteiros.find(x => x.id == this.evento.roteiro_Id);
            if (!this.evento.roteiro_Id)
                this.evento.roteiro_Id = this.roteiro?.id;
                this.evento.tema = this.roteiro?.tema;
                this.evento.semana = this.roteiro?.semana;
        }
    }

    alunoContactadoChanged() {
        this.alunoContactado = !this.alunoContactado;
        if (!this.alunoContactado) {
            this.participacao.alunoContactado = undefined;
            this.participacao.statusContato_Id = undefined;
        }
        else {
            this.participacao.alunoContactado = new Date;
        }
    }

    enviarMensagemFalta(e: any) {
        if (this.evento && this.participacao) {
            this.mensagemWhatsapp.enviarMensagemFalta(this.evento, this.participacao, e);
        }
    }
	
	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage);
	}

    sendConfirmation(form: NgForm, e: any) {

        if (!form.valid) {
            this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e);
            this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
            return;
        }

        // playAlert();

        const data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja salvar o status de contato?`,
            header: 'Status de contato',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Salvar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            },
            reject: () => {
            }
        });
    }

    async send(e: any) {

        this.loading = true;

        let response: RequestResponse = { success: true, message: '', object: undefined };


        // Se a aula não existir, cria a aula
        if (this.evento.id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(this.evento)
            let participacao = response.object.alunos.find((x: Evento_Participacao_Aluno) => x.aluno_Id == this.alunoId) as Evento_Participacao_Aluno;

			this.participacao.id = participacao.id;

            if (!response.success) {
                return this.showError('Falta não registrada', `Ocorreu um erro ao registrar falta. <br> ${response.message}`, e);
            }
        }


        await lastValueFrom(this.service.atualizarParticipacao(this.participacao))
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.service.calendarioReload.emit(res.object.id);
                    this.toastr.success(`Status atualizado com sucesso`)
					this.visible = false;
					this.visibleChange();
                }
				else {
					this.showError('Erro', `Não foi possível atualizar status. <br> ${res.message}`, e)
				}
            })
            .catch(res => {
                this.loading = false;
                this.showError('Erro', `Não foi possível atualizar status. <br> ${getError(res)}`, e)
            })
    }

    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }
}
