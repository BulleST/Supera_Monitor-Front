import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoJornadaSuperaComponent } from './monitoramento-jornada-supera/monitoramento-jornada-supera.component';
import { MonitoramentoDashboardComponent } from './monitoramento-dashboard/monitoramento-dashboard.component';
import { FiltroPopoverComponent } from './monitoramento-dashboard/filtro-popover/filtro-popover.component';
import { NameFirstWordPipe } from '../../utils/name-first-word.pipe';
// import { AlunoPopoverComponent } from '../../shared/aluno-popover/aluno-popover.component';
// import { AlunoPopoverChecklistComponent } from './aluno-popover-checklist/aluno-popover-checklist.component';
// import { AlunoPopoverDetailsComponent } from './aluno-popover-details/aluno-popover-details.component';
// import { AlunoPopoverComponent } from './aluno-popover/aluno-popover.component';
// import { AlunoPopoverChecklistComponent } from './aluno-popover-checklist/aluno-popover-checklist.component';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        NavMenuComponent,
        MonitoramentoJornadaSuperaComponent,
        MonitoramentoDashboardComponent,
        FiltroPopoverComponent,
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
