import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventoComponent } from './evento/evento.component';
import { CadastrarSuperacaoComponent } from './evento/superacao/cadastrar-superacao/cadastrar-superacao.component';
import { CadastrarOficinaComponent } from './evento/oficina/cadastrar-oficina/cadastrar-oficina.component';
import { CadastrarAula0Component } from './evento/aula-0/cadastrar-aula-0/cadastrar-aula-0.component';
import { CadastrarReuniaoComponent } from './evento/reuniao/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarInscricaoComponent } from './evento/oficina/cadastrar-inscricao/cadastrar-inscricao.component';
import { FormComponent as AlunoFormComponent } from '../alunos/form/form.component';
import { CalendarioComponent } from './calendario.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { CadastrarTurmaExtraComponent } from './evento/aula/cadastrar-turma-extra/cadastrar-turma-extra.component';
import { PrimeiraAulaAlunoComponent } from './evento/aula/primeira-aula-aluno/primeira-aula-aluno.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AgendarAula1Component } from './agendar-aula-1/agendar-aula-1.component';
import { AgendarAlunoComponent } from './agendar-aluno/agendar-aluno.component';
import { AlunoContatoFaltaComponent } from './aluno-contato-falta/aluno-contato-falta.component';


const routes: Routes = [{
    path: '', component: CalendarioComponent, children: [
        { path: 'turma-extra/agendar', component: CadastrarTurmaExtraComponent },
        { path: 'aula-zero/agendar', component: CadastrarAula0Component },
        { path: 'aula/primeira-aula/:evento_id', component: PrimeiraAulaAlunoComponent },
        { path: 'primeira-aula/agendar', component: AgendarAula1Component },
        { path: 'superacao/agendar', component: CadastrarSuperacaoComponent },
        { path: 'reuniao/agendar', component: CadastrarReuniaoComponent },
        { path: 'oficina/agendar', component: CadastrarOficinaComponent },
        { path: 'oficina/inscrever/:evento_id', component: CadastrarInscricaoComponent },
        { path: 'contato/:evento_id/:aluno_id', component: AlunoContatoFaltaComponent },
        
        { path: 'reposicao/agendar', component: AgendarReposicaoComponent },
        { path: 'reposicao/agendar/:aluno_id', component: AgendarReposicaoComponent },
        { path: 'aluno/:aluno_id', component: AlunoFormComponent },
        
        { path: 'agendar-falta', component: AgendarFaltaComponent },
        { path: 'agendar-falta/:aluno_id', component: AgendarFaltaComponent },

        { path: ':evento_nome/:evento_id', component: EventoComponent },
        { path: ':evento_nome/inserir-aluno/:evento_id', component: AgendarAlunoComponent },
        { path: ':evento_nome/cancelar/:evento_id', component: CancelarEventoComponent },
        
    ]
},];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CalendarioRoutingModule { }
