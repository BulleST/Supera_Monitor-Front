import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlunosRoutingModule } from './alunos.routing';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../../shared/shared.module';
import { DadosCadastraisComponent } from './form/dados-cadastrais/dados-cadastrais.component';
import { ChecklistComponent } from './form/checklist/checklist.component';


@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
        DadosCadastraisComponent,
        ChecklistComponent
    ],
    imports: [
        CommonModule,
        AlunosRoutingModule,
        SharedModule,
    ]
})
export class AlunosModule { }
