import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlunosRoutingModule } from './alunos.routing';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';

@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
        AgendarFaltaComponent,
    ],
    imports: [
        CommonModule,
        AlunosRoutingModule,
        SharedModule,
    ],
})
export class AlunosModule { }
