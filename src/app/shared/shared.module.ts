import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch,  withInterceptorsFromDi } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { ToastrModule } from 'ngx-toastr';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,
    ],
    exports: [
        FormsModule,
        PrimengModule,
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
