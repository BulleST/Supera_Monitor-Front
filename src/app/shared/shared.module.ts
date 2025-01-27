import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimengModule } from './primeng.module';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withFetch,  withInterceptorsFromDi } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProfileComponent } from './profile/profile.component';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,
    ],
    exports: [
        FormsModule,
        PrimengModule,
        FontAwesomeModule,
        ToastrModule,
        FontAwesomeModule,
        NgxMaskDirective,
        FormsModule,
        NgxMaskPipe,
        ProfileComponent,
        ChangePasswordComponent,
        DragDropModule,
    ],
    imports: [
        CommonModule,
        PrimengModule,
        FormsModule,
        ToastrModule.forRoot({ enableHtml: true }),
        FontAwesomeModule,
        NgxMaskDirective,
        FormsModule,
        NgxMaskPipe,
        TranslateModule,
        DragDropModule
    ],
    providers: [
        provideHttpClient(withFetch()),
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class SharedModule { }
