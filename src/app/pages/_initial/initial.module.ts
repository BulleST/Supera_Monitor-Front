import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoJornadaSuperaComponent } from './monitoramento-jornada-supera/monitoramento-jornada-supera.component';
import { MonitoramentoDashboardComponent } from './monitoramento-dashboard/monitoramento-dashboard.component';
import { NameFirstWordPipe } from '../../utils/name-first-word.pipe';
import { AulaParticipacaoPopoverComponent } from './monitoramento-dashboard/aula-participacao-popover/aula-participacao-popover.component';
import { FiltroPopoverComponent as FiltroJornadaSupera_Component } from './monitoramento-dashboard/filtro-popover/filtro-popover.component';
import { FiltroPopoverComponent as FiltroMonitoramento_Component } from './monitoramento-jornada-supera/filtro-popover/filtro-popover.component';
import { LegendaPopoverComponent } from './monitoramento-dashboard/legenda-popover/legenda-popover.component';
import { ChecklistComponent } from './monitoramento-jornada-supera/checklist/checklist.component';
import { ChecklistItemComponent } from './monitoramento-jornada-supera/checklist-item/checklist-item.component';
import { ChecklistItemAlunoComponent } from './monitoramento-jornada-supera/checklist-item-aluno/checklist-item-aluno.component';
import { ExibicaoCardsComponent } from './monitoramento-jornada-supera/exibicao-cards/exibicao-cards.component';
import { ExibicaoListaComponent } from './monitoramento-jornada-supera/exibicao-lista/exibicao-lista.component';
import { ChecklistPopoverComponent } from './monitoramento-jornada-supera/exibicao-lista/checklist-popover/checklist-popover.component';
import { ChecklistStatusComponent } from './monitoramento-jornada-supera/exibicao-lista/checklist-status/checklist-status.component';
import { AgendarReposicaoComponent } from './monitoramento-dashboard/agendar-reposicao/agendar-reposicao.component';
import { AgendarFaltaComponent } from './monitoramento-dashboard/agendar-falta/agendar-falta.component';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        NavMenuComponent,
        MonitoramentoJornadaSuperaComponent,
        MonitoramentoDashboardComponent,
        FiltroJornadaSupera_Component,
        FiltroMonitoramento_Component,
        AulaParticipacaoPopoverComponent,
        LegendaPopoverComponent,
        ChecklistComponent,
        ChecklistItemComponent,
        ChecklistItemAlunoComponent,
        ExibicaoCardsComponent,
        ExibicaoListaComponent,
        ChecklistPopoverComponent,
        ChecklistStatusComponent,
        AgendarReposicaoComponent,
        AgendarFaltaComponent,
    ],
    imports: [
        CommonModule,
        InitialRoutingModule,
        SharedModule,
        NameFirstWordPipe,
    ],
    bootstrap: [InitialComponent]
})
export class InitialModule {
}
