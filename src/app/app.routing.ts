import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const account = () => import('./pages/account/account.module').then(res => res.AccountModule);
const initial = () => import('./pages/_initial/initial.module').then(res => res.InitialModule);

const routes: Routes = [
    { path: '', redirectTo: 'calendario', pathMatch: 'full'},
    { path: '', loadChildren: initial /* , canActivate: [AuthGuard] */ },
    { path: 'accounts', loadChildren: account },
    // { path: '**', redirectTo: '', pathMatch: 'full'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
