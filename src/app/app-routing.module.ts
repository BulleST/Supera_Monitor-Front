import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AppComponent } from './app.component';

const account = () => import('./pages/account/account.module').then(res => res.AccountModule);
const initial = () => import('./pages/_initial/initial.module').then(res => res.InitialModule);

const routes: Routes = [
    { path: '', loadChildren: initial/*, canActivate: [AuthGuard]  */ },
    { path: 'account', loadChildren: account },
    // { path: '**', redirectTo: '', pathMatch: 'full'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
