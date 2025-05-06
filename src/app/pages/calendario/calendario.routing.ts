import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventoComponent } from './evento/evento.component';
import { CadastrarSuperacaoComponent } from './evento/superacao/cadastrar-superacao/cadastrar-superacao.component';
import { CadastrarOficinaComponent } from './evento/oficina/cadastrar-oficina/cadastrar-oficina.component';
import { CadastrarAula0Component } from './evento/aula-0/cadastrar-aula-0/cadastrar-aula-0.component';
import { CadastrarReuniaoComponent } from './evento/reuniao/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarInscricaoComponent } from './evento/oficina/cadastrar-inscricao/cadastrar-inscricao.component';
import { FormComponent as AlunoFormComponent } from '../alunos/form/form.component';
import { RestricoesComponent } from '../alunos/form/restricoes/restricoes.component';
import { CalendarioComponent } from './calendario.component';
import { ReagendarEventoComponent } from './reagendar-evento/reagendar-evento.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { AgendarReposicaoAlunoComponent } from './agendar-reposicao-aluno/agendar-reposicao-aluno.component';
import { CadastrarTurmaExtraComponent } from './evento/aula/cadastrar-turma-extra/cadastrar-turma-extra.component';

const routes: Routes = [{
    path: '', component: CalendarioComponent, children: [

        { path: 'turma-extra/agendar', component: CadastrarTurmaExtraComponent },
        { path: 'aula-zero/agendar', component: CadastrarAula0Component },
        { path: 'superacao/agendar', component: CadastrarSuperacaoComponent },
        { path: 'reuniao/agendar', component: CadastrarReuniaoComponent },
        { path: 'oficina/agendar', component: CadastrarOficinaComponent },
        { path: 'oficina/inscrever/:evento_id', component: CadastrarInscricaoComponent },

        { path: ':evento_nome/:evento_id', component: EventoComponent },
        { path: ':evento_nome/chamada/:evento_id', component: EventoComponent },
        { path: ':evento_nome/reagendar/:evento_id', component: ReagendarEventoComponent },
        { path: ':evento_nome/cancelar/:evento_id', component: CancelarEventoComponent },
        
        { path: 'aluno/reposicao/:aluno_id', component: AgendarReposicaoAlunoComponent },

        { path: 'aluno/:aluno_id', component: AlunoFormComponent, children: [
            { path: 'restricao/cadastrar', component: RestricoesComponent }
        ]}
    ]
},];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CalendarioRoutingModule { }
