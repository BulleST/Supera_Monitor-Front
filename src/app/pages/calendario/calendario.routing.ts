import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastrarSuperacaoComponent } from './agendar/cadastrar-superacao/cadastrar-superacao.component';
import { CadastrarOficinaComponent } from './agendar/cadastrar-oficina/cadastrar-oficina.component';
import { CadastrarAula0Component } from './agendar/cadastrar-aula-0/cadastrar-aula-0.component';
import { CadastrarReuniaoComponent } from './agendar/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarInscricaoComponent } from './cadastrar-inscricao/cadastrar-inscricao.component';
import { CalendarioComponent } from './calendario.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { CadastrarTurmaExtraComponent } from './agendar/cadastrar-turma-extra/cadastrar-turma-extra.component';
import { AgendarReposicaoComponent } from './agendar/agendar-reposicao/agendar-reposicao.component';
import { AgendarFaltaComponent } from './agendar/agendar-falta/agendar-falta.component';
import { EditarAulaComponent } from './editar-aula/editar-aula.component';
import { EditarEventoComponent } from './editar-evento/editar-evento.component';
import { AgendarPrimeiraAulaComponent } from './agendar/agendar-primeira-aula/agendar-primeira-aula.component';


const routes: Routes = [{
    path: '', component: CalendarioComponent, children: [
        { path: 'agendar/turma-extra', component: CadastrarTurmaExtraComponent },
        { path: 'agendar/aula-zero', component: CadastrarAula0Component },
        { path: 'agendar/superacao', component: CadastrarSuperacaoComponent },
        { path: 'agendar/reuniao', component: CadastrarReuniaoComponent },
        { path: 'agendar/oficina', component: CadastrarOficinaComponent },
        
        { path: 'agendar/reposicao', component: AgendarReposicaoComponent },
        { path: 'agendar/primeira-aula', component: AgendarPrimeiraAulaComponent },
        { path: 'agendar/falta', component: AgendarFaltaComponent },
        
        { path: 'inscrever/oficina/:evento_id', component: CadastrarInscricaoComponent },
        { path: 'inscrever/aula-zero/:evento_id', component: CadastrarInscricaoComponent },
        { path: 'inscrever/superacao/:evento_id', component: CadastrarInscricaoComponent },
        
        { path: 'finalizar/aula/:evento_id', component: EditarAulaComponent },
        { path: 'finalizar/:evento_nome/:evento_id', component: EditarEventoComponent },
        
        { path: 'cancelar/:evento_nome/:evento_id', component: CancelarEventoComponent },
    ]
},];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CalendarioRoutingModule { }
