import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlunosRoutingModule } from './alunos.routing';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';

@NgModule({
    declarations: [
        ListComponent,
    ],
    imports: [
        CommonModule,
        AlunosRoutingModule,
        SharedModule,
    ],
})
export class AlunosModule { }
