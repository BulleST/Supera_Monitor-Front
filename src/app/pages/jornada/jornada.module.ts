import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JornadaRoutingModule } from './jornada.routing';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
    declarations: [
        FormComponent,
        ListComponent
    ],
    imports: [
        CommonModule,
        JornadaRoutingModule,
        SharedModule,
    ]
})
export class JornadaModule { }
