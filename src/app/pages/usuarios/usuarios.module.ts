import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../../shared/shared.module';
import { UsuariosRoutingModule } from './usuarios.routing';

@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
    ],
    imports: [
        CommonModule,
        UsuariosRoutingModule,
        SharedModule,
    ]
})
export class UsuariosModule { }
