import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';
import { HomeComponent } from './home/home.component';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        HomeComponent,
        NavMenuComponent,
        MonitoramentoComponent,
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
