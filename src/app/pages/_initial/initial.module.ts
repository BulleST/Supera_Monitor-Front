import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoJornadaSuperaComponent } from './monitoramento-jornada-supera/monitoramento-jornada-supera.component';
import { MonitoramentoDashboardComponent } from './monitoramento-dashboard/monitoramento-dashboard.component';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        NavMenuComponent,
        MonitoramentoJornadaSuperaComponent,
        MonitoramentoDashboardComponent,
    ],
    imports: [
        CommonModule,
        InitialRoutingModule,
        SharedModule
    ],
    bootstrap: [InitialComponent]
})
export class InitialModule {
}
