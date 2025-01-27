import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AccountComponent } from './account.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TermosDeUsoComponent } from './termos-de-uso/termos-de-uso.component';
import { LoginComponent } from './login/login.component';
import { AccountRoutingModule } from './account.routing';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
    declarations: [
        ForgotPasswordComponent,
        AccountComponent,
        VerifyEmailComponent,
        ResetPasswordComponent,
        TermosDeUsoComponent,
        LoginComponent,
    ],
    imports: [
        CommonModule,
        AccountRoutingModule,
        SharedModule
    ],
    bootstrap: [AccountComponent],
})
export class AccountModule { }
