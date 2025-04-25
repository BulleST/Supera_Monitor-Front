import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { RestricoesComponent  } from './form/restricoes/restricoes.component';

var restricao = { path: 'restricao/cadastrar', component: RestricoesComponent };
const routes: Routes = [
    {
        path: '', component: ListComponent, children: [
            // { path: 'cadastrar', component: FormComponent, children: [ restricao ]},
            { path: 'editar/:aluno_id', component: FormComponent, children: [ restricao ]},
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AlunosRoutingModule { }
