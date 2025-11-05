import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonitoramentoComponent } from './monitoramento.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AlunoContatoFaltaComponent } from '../../shared/aluno/aluno-contato-falta/aluno-contato-falta.component';
import { VerAulaComponent } from './ver-aula/ver-aula.component';

const routes: Routes = [
	{
		path: '', component: MonitoramentoComponent, children: [
			{ path: 'reposicao/agendar/:aluno_id/:evento_reposicao_de', component: AgendarReposicaoComponent },
			{ path: 'agendar-falta/:aluno_id', component: AgendarFaltaComponent },
			{ path: 'contato/:evento_id/:aluno_id', component: AlunoContatoFaltaComponent },
			{ path: 'aula/:evento_id', component: VerAulaComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MonitoramentoRoutingModule { }
