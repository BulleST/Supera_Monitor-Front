import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';


@NgModule({
    declarations: [
        ListComponent,
        FormComponent,
    ],
    imports: [
        CommonModule,
        UserRoutingModule,
        SharedModule,
        TranslateModule.forChild(),
    ],
    providers: [
        TranslatePipe
    ]
})
export class UserModule { }
