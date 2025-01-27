import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InitialRoutingModule } from './initial.routing';
import { InitialComponent } from './initial.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';

import { NavMenuComponent } from '../../parts/nav-menu/nav-menu.component';
import { HeaderComponent } from '../../parts/header/header.component';
import { SharedModule } from '../../shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';

@NgModule({
    declarations: [
        InitialComponent,
        HeaderComponent,
        HomeComponent,
        NavMenuComponent,
    ],
    imports: [
        CommonModule,
        InitialRoutingModule,
        SharedModule,
        FormsModule,
        FullCalendarModule
    ],
    bootstrap: [InitialComponent]
})
export class InitialModule {
}
