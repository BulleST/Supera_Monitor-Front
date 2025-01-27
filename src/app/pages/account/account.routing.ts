import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { TermosDeUsoComponent } from './termos-de-uso/termos-de-uso.component';
import { AccountComponent } from './account.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
    { path: '', component: AccountComponent, children: [
        { path: '', redirectTo: 'login', pathMatch: 'prefix', },
        {
            path: 'login', component: LoginComponent    , children: [
                { path: 'termos-de-uso', component: TermosDeUsoComponent },
            ]
        },
        { path: 'forgot-password', component: ForgotPasswordComponent },
        { path: 'reset-password', component: ResetPasswordComponent },
        { path: 'verify-email', component: VerifyEmailComponent },
    ]}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountRoutingModule { }
