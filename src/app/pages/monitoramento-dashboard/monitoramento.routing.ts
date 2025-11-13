import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonitoramentoComponent } from './monitoramento.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';

const routes: Routes = [
	{
		path: '', component: MonitoramentoComponent, children: [
			{ path: 'agendar/reposicao/:aluno_id/:evento_reposicao_de', component: AgendarReposicaoComponent },
			{ path: 'agendar-falta/:aluno_id', component: AgendarFaltaComponent },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MonitoramentoRoutingModule { }
