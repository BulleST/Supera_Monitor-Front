import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';

const routes: Routes = [
    {
        path: '', component: ListComponent, children: [
            // { path: 'cadastrar', component: FormComponent },
            { path: 'editar/:aluno_id', component: FormComponent },
            { path: 'agendar-falta/:aluno_id', component: AgendarFaltaComponent },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AlunosRoutingModule { }
