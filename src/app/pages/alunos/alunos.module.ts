import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlunosRoutingModule } from './alunos.routing';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
    declarations: [
        ListComponent,
        FormComponent
    ],
    imports: [
        CommonModule,
        AlunosRoutingModule,
        SharedModule,
    ]
})
export class AlunosModule { }
