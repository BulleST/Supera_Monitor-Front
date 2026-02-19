import { Component } from '@angular/core';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChecklistItemId } from '../../../models/checklist-item-id.enum';
import { showAluno } from '../../../utils/show-aluno';
import { showEvento } from '../../../utils/show-editar-evento';
import { EventoService } from '../../../services/evento.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
	selector: 'app-aluno-checklist-detalhes',
	standalone: false,
	templateUrl: './aluno-checklist-detalhes.component.html',
	styleUrl: './aluno-checklist-detalhes.component.css',
})
export class AlunoChecklistDetalhesComponent {

	instance: DynamicDialogComponent | undefined;
	loading = false;
	view = new AlunoChecklistDetalhesView;

	exibirBotaoShowEvento = false;
	eventoNome = '';
	maximized = false;

    subscription: Subscription[] = [];

	constructor(
		private eventoService: EventoService,
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
	) {

		this.instance = this.dialogService.getInstance(this.ref);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {

			this.view = this.instance.data['view'];

			this.exibirBotaoShowEvento = [
				ChecklistItemId.Agendamento1Oficina,
				ChecklistItemId.Agendamento2Oficina,
				ChecklistItemId.Agendamento1Superacao,
				ChecklistItemId.Agendamento2Superacao,
				ChecklistItemId.AgendamentoAulaZero,
				ChecklistItemId.AgendamentoPrimeiraAula,
				ChecklistItemId.Comparecimento1Oficina,
				ChecklistItemId.Comparecimento2Oficina,
				ChecklistItemId.Comparecimento1Superacao,
				ChecklistItemId.Comparecimento2Superacao,
				ChecklistItemId.ComparecimentoAulaZero,
				ChecklistItemId.ComparecimentoPrimeiraAula,
			].includes(this.view.checklistItemId)
				&& !!this.view.evento_Id;

			this.eventoNome =
				this.view.checklistItemId == ChecklistItemId.Agendamento1Oficina ? 'Oficina' :
					this.view.checklistItemId == ChecklistItemId.Agendamento2Oficina ? 'Oficina' :
						this.view.checklistItemId == ChecklistItemId.Comparecimento1Oficina ? 'Oficina' :
							this.view.checklistItemId == ChecklistItemId.Comparecimento2Oficina ? 'Oficina' :

								this.view.checklistItemId == ChecklistItemId.AgendamentoAulaZero ? 'Aula Zero' :
									this.view.checklistItemId == ChecklistItemId.ComparecimentoAulaZero ? 'Aula Zero' :

										this.view.checklistItemId == ChecklistItemId.AgendamentoPrimeiraAula ? 'Aula' :
											this.view.checklistItemId == ChecklistItemId.ComparecimentoPrimeiraAula ? 'Aula' :

												this.view.checklistItemId == ChecklistItemId.Agendamento1Superacao ? 'Superação' :
													this.view.checklistItemId == ChecklistItemId.Agendamento2Superacao ? 'Superação' :
														this.view.checklistItemId == ChecklistItemId.Comparecimento1Superacao ? 'Superação' :
															this.view.checklistItemId == ChecklistItemId.Comparecimento2Superacao ? 'Superação' :
																'Aula';
		}
	}

	close(finalizado: boolean) {
        this.subscription.forEach(item => item.unsubscribe());
		this.ref.close(finalizado);
	}

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}

	showAluno() {
        showAluno(this.dialogService, this.view.aluno_Id);
	}

    async showEvento() {
        if (this.view.evento_Id) {
            const evento = await lastValueFrom(this.eventoService.get(this.view.evento_Id));
            this.eventoService.setEvento(evento);

            const ref = showEvento(
                evento,
                this.dialogService
            );
            const onClose = ref.onClose.subscribe(res => this.eventoService.setEvento(undefined));
            this.subscription.push(onClose);
        }
    }

}


export class AlunoChecklistDetalhesView {
	alunoChecklistItemId: number = 0
	checklistItemId: number = 0
	checklistId: number = 0

	checklist: string = '';
	checklistItem: string = '';
	prazo: Date = new Date;
	dataFinalizacao?: Date;
	account?: string;
	observacoes?: string;
	evento_Id?: number;

	aluno: string = '';
	aluno_Id: number = 0

	celular?: string;
	turma?: string;
	corLegenda?: string;
}
