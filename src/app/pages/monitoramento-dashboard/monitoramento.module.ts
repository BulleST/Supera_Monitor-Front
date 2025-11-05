import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoRoutingModule } from './monitoramento.routing';
import { MonitoramentoComponent } from './monitoramento.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { VerAulaComponent } from './ver-aula/ver-aula.component';
import { FiltroPopoverComponent } from './filtro-popover/filtro-popover.component';
import { LegendaPopoverComponent } from './legenda-popover/legenda-popover.component';
import { AulaParticipacaoComponent } from './aula-participacao/aula-participacao.component';


@NgModule({
  declarations: [
    MonitoramentoComponent,
    AgendarFaltaComponent,
    AgendarReposicaoComponent,
    VerAulaComponent,
    FiltroPopoverComponent,
    LegendaPopoverComponent,
    AulaParticipacaoComponent
  ],
  imports: [
    CommonModule,
    MonitoramentoRoutingModule,
    SharedModule
  ]
})
export class MonitoramentoModule { }
