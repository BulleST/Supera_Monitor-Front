import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialComponent } from './initial.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const calendario = () => import('./../calendario/calendario.module').then(res => res.CalendarioModule);
const alunos = () => import('./../alunos/alunos.module').then(res => res.AlunosModule);
const roteiro = () => import('./../roteiro/roteiro.module').then(res => res.RoteiroModule);
const professores = () => import('./../professores/professores.module').then(res => res.ProfessoresModule);
const turmas = () => import('./../turmas/turmas.module').then(res => res.TurmasModule);
const usuarios = () => import('./../usuarios/usuarios.module').then(res => res.UsuariosModule);

const routes: Routes = [
    {
        path: '', component: InitialComponent, children: [
            { path: 'jornada-supera', component: MonitoramentoComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'alunos', loadChildren: alunos },
            { path: 'calendario', loadChildren: calendario },
            { path: 'roteiro', loadChildren: roteiro },
            { path: 'educadores', loadChildren: professores },
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


