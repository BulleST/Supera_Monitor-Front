import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JornadaSuperaRoutingModule } from './jornada-supera.routing';
import { FiltroPopoverComponent } from './filtro-popover/filtro-popover.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { ChecklistItemComponent } from './checklist-item/checklist-item.component';
import { ChecklistItemAlunoComponent } from './checklist-item-aluno/checklist-item-aluno.component';
import { ExibicaoCardsComponent } from './exibicao-cards/exibicao-cards.component';
import { ExibicaoListaComponent } from './exibicao-lista/exibicao-lista.component';
import { SharedModule } from '../../shared/shared.module';
import { ChecklistPopoverComponent } from './exibicao-lista/checklist-popover/checklist-popover.component';
import { ChecklistStatusComponent } from './exibicao-lista/checklist-status/checklist-status.component';


@NgModule({
	declarations: [
		FiltroPopoverComponent,
		ChecklistComponent,
		ChecklistItemComponent,
		ChecklistItemAlunoComponent,
		ExibicaoCardsComponent,
		ExibicaoListaComponent,
		ChecklistPopoverComponent,
		ChecklistStatusComponent,
	],
	imports: [
		CommonModule,
		JornadaSuperaRoutingModule,
		SharedModule
	]
})
export class JornadaSuperaModule { }
