import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlunosRoutingModule } from './alunos.routing';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';
import { FormLoadingComponent } from './form/form-loading/form-loading.component';
import { FormComponent } from './form/form.component';
import { DadosCadastraisComponent } from './form/dados-cadastrais/dados-cadastrais.component';
import { HistoricoComponent } from './form/historico/historico.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';

@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
        FormLoadingComponent,
        DadosCadastraisComponent,
        HistoricoComponent,
        AgendarFaltaComponent,
    ],
    imports: [
        CommonModule,
        AlunosRoutingModule,
        SharedModule,
    ],
})
export class AlunosModule { }
