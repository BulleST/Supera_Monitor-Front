import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialComponent } from './initial.component';
import { HomeComponent } from './home/home.component';
import { ReposicaoComponent } from './home/reposicao/reposicao.component';
import { AulaComponent } from './home/aula/aula.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import { FormComponent as AlunoFormComponent } from '../alunos/form/form.component';
import { RestricoesComponent } from '../alunos/form/restricoes/restricoes.component';
import { ReagendarAulaComponent } from './home/reagendar-aula/reagendar-aula.component';

const alunos = () => import('./../alunos/alunos.module').then(res => res.AlunosModule);
const jornada = () => import('./../jornada/jornada.module').then(res => res.JornadaModule);
const professores = () => import('./../professores/professores.module').then(res => res.ProfessoresModule);
const turmas = () => import('./../turmas/turmas.module').then(res => res.TurmasModule);
const usuarios = () => import('./../usuarios/usuarios.module').then(res => res.UsuariosModule);

const routes: Routes = [
    {
        path: '', component: InitialComponent, children: [
            { path: 'checklist', component: MonitoramentoComponent },
            {
                path: 'home', component: HomeComponent, children: [
                    { path: 'aula/reagendar/:aula_id', component: ReagendarAulaComponent },
                    { path: 'aula/:aula_id', component: AulaComponent },
                    { path: 'chamada/:aula_id', component: AulaComponent },
                    { path: 'reposicao/:aluno_id', component: ReposicaoComponent },
                    { path: 'aluno/:id', component: AlunoFormComponent, children: [
                        { path: 'restricao/cadastrar', component: RestricoesComponent }
                    ] }
                ]
            },
            { path: 'alunos', loadChildren: alunos },
            { path: 'jornada', loadChildren: jornada },
            { path: 'professores', loadChildren: professores },
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


