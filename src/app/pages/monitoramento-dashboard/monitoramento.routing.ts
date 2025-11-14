import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonitoramentoComponent } from './monitoramento.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { EditarAulaComponent } from './editar-aula/editar-aula.component';
import { AgendarPrimeiraAulaComponent } from './agendar-primeira-aula/agendar-primeira-aula.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';

const routes: Routes = [
	{
		path: '', component: MonitoramentoComponent, children: [
			{ path: 'agendar/reposicao', component: AgendarReposicaoComponent },
			{ path: 'agendar/primeira-aula', component: AgendarPrimeiraAulaComponent },
			{ path: 'agendar/primeira-aula/:evento_id', component: AgendarPrimeiraAulaComponent },
			{ path: 'agendar/falta', component: AgendarFaltaComponent },
			{ path: 'agendar/falta/:aluno_id/:evento_id', component: AgendarFaltaComponent },
			{ path: 'finalizar/aula/:evento_id', component: EditarAulaComponent },

		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MonitoramentoRoutingModule { }
