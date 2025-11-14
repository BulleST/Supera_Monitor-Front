import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { JornadaSuperaStatus } from '../../../models/jornada-supera-status.model';
import { MensagemWhatsapp, showError } from '../../../utils';
import { ChecklistService } from '../../../services/checklist.service';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { NgForm } from '@angular/forms';
import { ChecklistItemId, checklistsMensagemWhatsapp } from '../../../models/checklist-item-id.enum';
import { showAgendarAulaZero } from '../../../utils/show-agendar-superacao';
import { showAgendarSuperacao } from '../../../utils/show-agendar-aula-zero';

@Component({
	selector: 'app-finalizar-checklist',
	standalone: false,
	templateUrl: './finalizar-checklist.component.html',
	styleUrl: './finalizar-checklist.component.css',
	providers: [ConfirmationService]
})
export class FinalizarChecklistComponent implements OnInit {

	instance: DynamicDialogComponent | undefined;
	observacoes: string = '';
	loading = false;
	view = new FinalizarChecklistComponentView;

	checklistsMensagemWhatsapp = checklistsMensagemWhatsapp;

	ChecklistItemId = ChecklistItemId;

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private confirmationService: ConfirmationService,
		private toastr: ToastrService,
		private service: ChecklistService,
		private jornadaSuperaService: JornadaSuperaService,
		private mensagemWhatsapp: MensagemWhatsapp,
	) {

		this.instance = this.dialogService.getInstance(this.ref);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {

			this.view = this.instance.data['view'];
		}
	}

	close(finalizado: boolean) {
		this.ref.close(finalizado);
	}

	showError(header: string, message: string, e: any, error: any) {
		showError(this.confirmationService, header, message, e, error.toString());
	}

	showAgendarAulaZero() {
		var ref = showAgendarAulaZero(this.dialogService, this.view.alunoId);
		let onClose = ref.onClose.subscribe(agendamentoConcluido => {
			if (agendamentoConcluido) {
				this.toastr.success(`Checklist ${this.view.checklistItem} finalizado com sucesso!`);
				this.close(true);
			}
		});
	}

	showAgendarSuperacao() {
		var ref = showAgendarSuperacao(this.dialogService, this.view.alunoId);
		let onClose = ref.onClose.subscribe(agendamentoConcluido => {
			if (agendamentoConcluido) {
				this.toastr.success(`Checklist ${this.view.checklistItem} finalizado com sucesso!`);
				this.close(true);
			}
		});
	}

	enviarMensagemCondicao() {
		var aluno = {nome: this.view.aluno, celular: this.view.celular}
		this.mensagemWhatsapp.enviarMensagemCondicao(aluno, this.view.checklistItemId);
	}

	sendConfirmation(form: NgForm, e: any) {

		if (!form.valid) {
			this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e, null);
			this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
			return;
		}


		this.confirmationService.confirm({
			target: e.target,
			message: `Tem certeza que deseja finalizar o checklist ${this.view.checklistItem}?`,
			header: 'Finalizar checklist?',
			acceptIcon: 'pi pi-check',
			rejectIcon: 'pi pi-times',
			acceptLabel: 'Finalizar',
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

	send(e: any) {
		this.loading = true;

		lastValueFrom(this.service.markAsDone(this.view.alunoChecklistItemId, this.observacoes))
			.then(res => {
				this.loading = false;
				if (res.success == true) {
					this.toastr.success(`Checklist ${this.view.checklistItem} finalizado com sucesso!`);
					this.close(true);
					if (window.location.pathname.includes('jornada-supera')) {
						this.jornadaSuperaService.onReload.emit();
					}
				}
				else {
					this.showError('Erro', 'Não foi possível finalizar o checklist.', e, res.message)
				}
			})
			.catch(res => {
				this.showError('Erro', 'Não foi possível finalizar o checklist.', e, res)
			});
	}


}


export class FinalizarChecklistComponentView {

	alunoId: number = 0
	alunoChecklistItemId: number = 0
	checklistItemId: number = 0
	checklistId: number = 0

	checklistItem: string = '';
	aluno: string = '';
	turma?: string;
	corLegenda?: string;
	celular?: string;
	prazo: Date = new Date;
	status: JornadaSuperaStatus = JornadaSuperaStatus.ARealizar;

}