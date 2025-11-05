import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { NameFirstWordPipe } from '../../utils/name-first-word.pipe';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        NavMenuComponent,
    ],
    imports: [
        CommonModule,
        InitialRoutingModule,
        SharedModule,
        NameFirstWordPipe,
    ],
    bootstrap: [InitialComponent]
})
export class InitialModule {
}
