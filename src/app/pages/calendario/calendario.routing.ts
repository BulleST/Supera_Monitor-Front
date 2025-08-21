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
import { InserirAlunoComponent } from './evento/inserir-aluno/inserir-aluno.component';
import { PrimeiraAulaAlunoComponent } from './evento/aula/primeira-aula-aluno/primeira-aula-aluno.component';
import { CadastrarAula1Component } from './evento/aula-1/cadastrar-aula-1.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';


const routes: Routes = [{
    path: '', component: CalendarioComponent, children: [
        { path: 'turma-extra/agendar', component: CadastrarTurmaExtraComponent },
        { path: 'aula-zero/agendar', component: CadastrarAula0Component },
        { path: 'aula/primeira-aula/:evento_id', component: PrimeiraAulaAlunoComponent },
        { path: 'primeira-aula/agendar', component: CadastrarAula1Component },
        { path: 'superacao/agendar', component: CadastrarSuperacaoComponent },
        { path: 'reuniao/agendar', component: CadastrarReuniaoComponent },
        { path: 'oficina/agendar', component: CadastrarOficinaComponent },
        { path: 'oficina/inscrever/:evento_id', component: CadastrarInscricaoComponent },
        
        { path: 'reposicao/agendar', component: AgendarReposicaoComponent },
        { path: 'reposicao/agendar/:aluno_id', component: AgendarReposicaoComponent },
        { path: 'aluno/:aluno_id', component: AlunoFormComponent },
        
        { path: 'agendar-falta', component: AgendarFaltaComponent },
        { path: 'agendar-falta/:aluno_id', component: AgendarFaltaComponent },

        { path: ':evento_nome/:evento_id', component: EventoComponent },
        { path: ':evento_nome/inserir-aluno/:evento_id', component: InserirAlunoComponent },
        { path: ':evento_nome/cancelar/:evento_id', component: CancelarEventoComponent },
        
    ]
},];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CalendarioRoutingModule { }
