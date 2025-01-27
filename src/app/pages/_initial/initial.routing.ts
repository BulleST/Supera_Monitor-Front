import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialComponent } from './initial.component';
import { HomeComponent } from './home/home.component';
const user = () => import('./../user/user.module').then(res => res.UserModule);

const routes: Routes = [
    {
        path: '', component: HomeComponent, children: [
            { path: 'users', loadChildren: user },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InitialRoutingModule { }


