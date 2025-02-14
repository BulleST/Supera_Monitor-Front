import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialComponent } from './initial.component';
import { HomeComponent } from './home/home.component';
import { ReposicaoComponent } from './reposicao/reposicao.component';
import { AulaComponent } from './aula/aula.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import { FormComponent as AlunoFormComponent  } from '../alunos/form/form.component';

const professores = () => import('./../professores/professores.module').then(res => res.ProfessoresModule);
const alunos = () => import('./../alunos/alunos.module').then(res => res.AlunosModule);
const turmas = () => import('./../turmas/turmas.module').then(res => res.TurmasModule);
const usuarios = () => import('./../usuarios/usuarios.module').then(res => res.UsuariosModule);

const routes: Routes = [
    {
        path: '', component: InitialComponent, children: [
            { path: 'checklist', component: MonitoramentoComponent },
            { path: 'home', component: HomeComponent, children: [
                { path: 'aula/:aula_id', component: AulaComponent },
                { path: 'chamada/:aula_id', component: AulaComponent },
                { path: 'reposicao/:aluno_id', component: ReposicaoComponent },
                { path: 'aluno/:id', component: AlunoFormComponent }
            ] },
            { path: 'professores', loadChildren: professores },
            { path: 'alunos', loadChildren: alunos },
            { path: 'turmas', loadChildren: turmas },
            { path: 'usuarios', loadChildren: usuarios },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InitialRoutingModule { }


