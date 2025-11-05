import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

import { InitialComponent } from './initial.component';

const calendario = () => import('./../calendario/calendario.module').then(res => res.CalendarioModule);
const alunos = () => import('./../alunos/alunos.module').then(res => res.AlunosModule);
const roteiro = () => import('./../roteiro/roteiro.module').then(res => res.RoteiroModule);
const professores = () => import('./../professores/professores.module').then(res => res.ProfessoresModule);
const turmas = () => import('./../turmas/turmas.module').then(res => res.TurmasModule);
const usuarios = () => import('./../usuarios/usuarios.module').then(res => res.UsuariosModule);
const monitoramento = () => import('../monitoramento-dashboard/monitoramento.module').then(res => res.MonitoramentoModule);
const jornadaSupera = () => import('../jornada-supera/jornada-supera.module').then(res => res.JornadaSuperaModule);

const routes: Routes = [
    {
        path: '', component: InitialComponent, children: [
            { path: 'jornada-supera', loadChildren: jornadaSupera, canActivate: [AuthGuard] },
            { path: 'monitoramento', loadChildren: monitoramento, canActivate: [AuthGuard] },
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


