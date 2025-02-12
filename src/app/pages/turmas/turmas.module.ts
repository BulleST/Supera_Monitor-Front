import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TurmasRoutingModule } from './turmas.routing';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../../shared/shared.module';
import { CalendarioComponent } from './calendario/calendario.component';


@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
        CalendarioComponent
    ],
    imports: [
        CommonModule,
        TurmasRoutingModule,
        SharedModule
    ]
})
export class TurmasModule { }
