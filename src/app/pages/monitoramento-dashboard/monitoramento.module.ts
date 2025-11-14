import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoRoutingModule } from './monitoramento.routing';
import { MonitoramentoComponent } from './monitoramento.component';
import { FiltroPopoverComponent } from './filtro-popover/filtro-popover.component';
import { LegendaPopoverComponent } from './legenda-popover/legenda-popover.component';
import { AulaParticipacaoComponent } from './aula-participacao/aula-participacao.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AgendarPrimeiraAulaComponent } from './agendar-primeira-aula/agendar-primeira-aula.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { EditarAulaComponent } from './editar-aula/editar-aula.component';


@NgModule({
	declarations: [
		MonitoramentoComponent,
		FiltroPopoverComponent,
		LegendaPopoverComponent,
		AulaParticipacaoComponent,
		AgendarFaltaComponent,
		AgendarPrimeiraAulaComponent,
		AgendarReposicaoComponent,
		EditarAulaComponent
	],
	imports: [
		CommonModule,
		MonitoramentoRoutingModule,
		SharedModule
	]
})
export class MonitoramentoModule { }
