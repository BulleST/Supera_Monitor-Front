import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialComponent } from './initial.component';
import { MonitoramentoJornadaSuperaComponent } from './monitoramento-jornada-supera/monitoramento-jornada-supera.component';
import { MonitoramentoDashboardComponent } from './monitoramento-dashboard/monitoramento-dashboard.component';
import { AgendarReposicaoComponent } from './monitoramento-dashboard/agendar-reposicao/agendar-reposicao.component';
import { AuthGuard } from '../../guards/auth.guard';

const calendario = () => import('./../calendario/calendario.module').then(res => res.CalendarioModule);
const alunos = () => import('./../alunos/alunos.module').then(res => res.AlunosModule);
const roteiro = () => import('./../roteiro/roteiro.module').then(res => res.RoteiroModule);
const professores = () => import('./../professores/professores.module').then(res => res.ProfessoresModule);
const turmas = () => import('./../turmas/turmas.module').then(res => res.TurmasModule);
const usuarios = () => import('./../usuarios/usuarios.module').then(res => res.UsuariosModule);

const routes: Routes = [
    {
        path: '', component: InitialComponent, children: [
            { path: 'jornada-supera', component: MonitoramentoJornadaSuperaComponent, canActivate: [AuthGuard] },
            { path: 'dashboard', component: MonitoramentoDashboardComponent, canActivate: [AuthGuard], children: [
                { path: 'reposicao/agendar/:aluno_id', component: AgendarReposicaoComponent }
            ] },
            { path: 'alunos', loadChildren: alunos, canActivate: [AuthGuard] },
            { path: 'calendario', loadChildren: calendario, canActivate: [AuthGuard] },
            { path: 'roteiro', loadChildren: roteiro, canActivate: [AuthGuard] },
            { path: 'educadores', loadChildren: professores, canActivate: [AuthGuard] },
            { path: 'turmas', loadChildren: turmas, canActivate: [AuthGuard] },
            { path: 'usuarios', loadChildren: usuarios, canActivate: [AuthGuard] },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InitialRoutingModule { }


