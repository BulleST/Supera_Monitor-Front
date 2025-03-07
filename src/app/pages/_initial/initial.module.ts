import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';
import { HomeComponent } from './home/home.component';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import { SelectedAlunoComponent } from './home/selected-aluno/selected-aluno.component';
import { SelectedAulaComponent } from './home/selected-aula/selected-aula.component';
import { ReagendarAulaComponent } from './home/reagendar-aula/reagendar-aula.component';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        HomeComponent,
        NavMenuComponent,
        MonitoramentoComponent,
        SelectedAlunoComponent,
        SelectedAulaComponent,
        ReagendarAulaComponent,
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
