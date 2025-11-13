import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfessoresRoutingModule } from './professores.routing';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../../shared/shared.module';
import { FormComponent } from './form/form.component';


@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
    ],
    imports: [
        CommonModule,
        ProfessoresRoutingModule,
        SharedModule,
    ]
})
export class ProfessoresModule { }
