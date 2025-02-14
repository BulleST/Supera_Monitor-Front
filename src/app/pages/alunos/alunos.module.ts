import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlunosRoutingModule } from './alunos.routing';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';
// import { FormComponent } from './form/form.component';
// import { DadosCadastraisComponent } from './form/dados-cadastrais/dados-cadastrais.component';
// import { ChecklistComponent } from './form/checklist/checklist.component';
// import { CalendarioComponent } from './form/calendario/calendario.component';


@NgModule({
    declarations: [
        ListComponent,
        // FormComponent,
        // DadosCadastraisComponent,
        // ChecklistComponent,
        // CalendarioComponent
    ],
    imports: [
        CommonModule,
        AlunosRoutingModule,
        SharedModule,
    ],
})
export class AlunosModule { }
