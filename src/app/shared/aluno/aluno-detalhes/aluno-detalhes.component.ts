import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Aluno } from '../../../models/alunos.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { AlunoService } from '../../../services/alunos.service';
import { ToastrService } from 'ngx-toastr';
import { showError } from '../../../utils';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { JornadaSupera_List_Aluno } from '../../../models/jornada-supera-list.model';

@Component({
	selector: 'app-aluno-detalhes',
	standalone: false,
	templateUrl: './aluno-detalhes.component.html',
	styleUrl: './aluno-detalhes.component.css',
	providers: [ConfirmationService],
})
export class AlunoDetalhesComponent implements OnInit, OnDestroy {
	aluno_Id: number = 0;
	object!: Aluno
	loading = true;
	error: string = '';
	subscription: Subscription[] = [];
	tabIndex = 0;
	instance: DynamicDialogComponent | undefined;

	maximized = false;

	constructor(
		private alunoService: AlunoService,
		private confirmationService: ConfirmationService,
		private toastrService: ToastrService,
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
	) {
		this.instance = this.dialogService.getInstance(this.ref);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.aluno_Id = this.instance.data['aluno_Id'];
			this.loadPage();
		}
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	close() {
		this.ref.close();
	}

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}


	loadPage() {
		this.loading = true;

		lastValueFrom(this.alunoService.getVigencia(this.aluno_Id));
		lastValueFrom(this.alunoService.getHistorico(this.aluno_Id));
		lastValueFrom(this.alunoService.get(this.aluno_Id))
			.then(res => {
				this.object = res;
				this.loading = false;
			})
			.catch(res => {
				this.close();
			});
	}

	showError(header: string, message: string, e: any) {
		showError(this.confirmationService, header, message, e);
	}

	async sendConfirmation(form: NgForm, e: any) {
		if (form.invalid) {
			return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e);
		}

		this.confirmationService.confirm({
			target: e.target,
			message: 'Tem certeza que deseja salvar os dados da turma?',
			header: 'Salvar dados',
			acceptLabel: 'Salvar',
			acceptIcon: 'pi pi-check',
			acceptButtonStyleClass: 'p-button-rounded',
			rejectLabel: 'Cancelar',
			rejectIcon: 'pi pi-times',
			rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
			accept: () => {
				this.send(e)
			}
		})
	}

	send(e: any) {
		this.loading = true;

		this.request()
			.then(res => {
				this.loading = false;
				if (res.success) {
					this.toastrService.success(`Registro atualizado com sucesso.`);

					lastValueFrom(this.alunoService.getList())

					this.confirmationService.confirm({
						target: e.target,
						message: 'Os dados do aluno foram atualizados com sucesso. <br> Deseja sair e voltar para página de alunos?',
						header: 'Sucesso',
						acceptLabel: 'Sair',
						acceptIcon: 'pi pi-arrow-left',
						acceptButtonStyleClass: 'p-button-rounded',
						rejectLabel: 'Não sair',
						rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
						accept: () => {
							this.close();
						}
					})

				}
				else {
					this.error = res.message;
					this.showError('Erro', this.error, e);
				}
			})
			.catch((res: HttpErrorResponse) => {
				this.error = res.error.message;
				this.loading = false;
				this.showError('Erro', this.error, e);
			})
	}

	request() {
		return lastValueFrom(this.alunoService.edit(this.object))
	}
}
