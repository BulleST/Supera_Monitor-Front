import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
    {
        path: '', component: ListComponent, children: [
            { path: 'create', component: FormComponent },
            { path: 'edit/:id', component: FormComponent },
        ]
    },];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AlunosRoutingModule { }
