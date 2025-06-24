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
import { ReagendarEventoComponent } from './reagendar-evento/reagendar-evento.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { AgendarReposicaoAlunoComponent } from './agendar-reposicao-aluno/agendar-reposicao-aluno.component';
import { CadastrarTurmaExtraComponent } from './evento/aula/cadastrar-turma-extra/cadastrar-turma-extra.component';
import { ReposicaoComponent } from './evento/aula/reposicao/reposicao.component';
import { InserirAlunoComponent } from './evento/inserir-aluno/inserir-aluno.component';
import { PrimeiraAulaAlunoComponent } from './primeira-aula-aluno/primeira-aula-aluno.component';
import { CadastrarAula1Component } from './evento/aula-1/cadastrar-aula-1.component';

const routes: Routes = [{
    path: '', component: CalendarioComponent, children: [

        { path: 'turma-extra/agendar', component: CadastrarTurmaExtraComponent },
        { path: 'aula-zero/agendar', component: CadastrarAula0Component },
        { path: 'primeira-aula/agendar', component: CadastrarAula1Component },
        { path: 'superacao/agendar', component: CadastrarSuperacaoComponent },
        { path: 'reuniao/agendar', component: CadastrarReuniaoComponent },
        { path: 'oficina/agendar', component: CadastrarOficinaComponent },
        { path: 'oficina/inscrever/:evento_id', component: CadastrarInscricaoComponent },
        

        { path: ':evento_nome/:evento_id', component: EventoComponent },
        { path: ':evento_nome/reposicao/:evento_id', component: ReposicaoComponent },
        { path: ':evento_nome/inserir-aluno/:evento_id', component: InserirAlunoComponent },
        { path: ':evento_nome/chamada/:evento_id', component: EventoComponent },
        { path: ':evento_nome/reagendar/:evento_id', component: ReagendarEventoComponent },
        { path: ':evento_nome/cancelar/:evento_id', component: CancelarEventoComponent },
        { path: ':evento_nome/primeira-aula/:evento_id', component: PrimeiraAulaAlunoComponent },
        
        { path: 'agendar-reposicao/:aluno_id', component: AgendarReposicaoAlunoComponent },
        { path: 'aluno/:aluno_id', component: AlunoFormComponent }
    ]
},];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CalendarioRoutingModule { }
