import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JornadaSuperaRoutingModule } from './jornada-supera.routing';
import { FiltroPopoverComponent } from './filtro-popover/filtro-popover.component';
import { ChecklistComponent } from './exibicao-cards/checklist/checklist.component';
import { ChecklistItemComponent } from './exibicao-cards/checklist-item/checklist-item.component';
import { ChecklistItemAlunoComponent } from './exibicao-cards/checklist-item-aluno/checklist-item-aluno.component';
import { SharedModule } from '../../shared/shared.module';
import { ChecklistPopoverComponent } from './exibicao-lista/checklist-popover/checklist-popover.component';
import { ChecklistStatusComponent } from './exibicao-lista/checklist-status/checklist-status.component';
import { ExibicaoCardsComponent } from './exibicao-cards/exibicao-cards.component';
import { ExibicaoListaComponent } from './exibicao-lista/exibicao-lista.component';
import { JornadaSuperaComponent } from './jornada-supera.component';
import { HeaderToolbarComponent } from './header-toolbar/header-toolbar.component';


@NgModule({
	declarations: [
		JornadaSuperaComponent,
		FiltroPopoverComponent,
		ChecklistComponent,
		ChecklistItemComponent,
		ChecklistItemAlunoComponent,
		ExibicaoCardsComponent,
		ExibicaoListaComponent,
		ChecklistPopoverComponent,
		ChecklistStatusComponent,
  HeaderToolbarComponent,
	],
	imports: [
		CommonModule,
		JornadaSuperaRoutingModule,
		SharedModule
	]
})
export class JornadaSuperaModule { }
