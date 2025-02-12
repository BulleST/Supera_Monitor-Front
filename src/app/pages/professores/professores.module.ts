import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfessoresRoutingModule } from './professores.routing';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../../shared/shared.module';
import { CalendarioComponent } from './calendario/calendario.component';
import { FormComponent } from './form/form.component';


@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
        CalendarioComponent,
    ],
    imports: [
        CommonModule,
        ProfessoresRoutingModule,
        SharedModule,
    ]
})
export class ProfessoresModule { }
