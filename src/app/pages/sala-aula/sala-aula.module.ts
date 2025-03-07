import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalaAulaRoutingModule } from './sala-aula-routing.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';


@NgModule({
  declarations: [
    ListComponent,
    FormComponent
  ],
  imports: [
    CommonModule,
    SalaAulaRoutingModule
  ]
})
export class SalaAulaModule { }
