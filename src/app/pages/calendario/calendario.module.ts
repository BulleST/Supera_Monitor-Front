import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { CalendarioRoutingModule } from './calendario.routing';
import { CalendarioComponent } from './calendario.component';
import { EventoComponent } from './evento/evento.component';
import { CadastrarSuperacaoComponent } from './evento/superacao/cadastrar-superacao/cadastrar-superacao.component';
import { CadastrarOficinaComponent } from './evento/oficina/cadastrar-oficina/cadastrar-oficina.component';
import { CadastrarAula0Component } from './evento/aula-0/cadastrar-aula-0/cadastrar-aula-0.component';
import { EditarAula0Component } from './evento/aula-0/editar-aula-0/editar-aula-0.component';
import { EditarOficinaComponent } from './evento/oficina/editar-oficina/editar-oficina.component';
import { EditarSuperacaoComponent } from './evento/superacao/editar-superacao/editar-superacao.component';
import { EditarAulaComponent } from './evento/aula/editar-aula/editar-aula.component';
import { CadastrarReuniaoComponent } from './evento/reuniao/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarInscricaoComponent } from './evento/oficina/cadastrar-inscricao/cadastrar-inscricao.component';
import { EditarReuniaoComponent } from './evento/reuniao/editar-reuniao/editar-reuniao.component';
import { SelectedEventoComponent } from './full-calendar/selected-evento/selected-evento.component';
import { ReagendarEventoComponent } from './reagendar-evento/reagendar-evento.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { CadastrarTurmaExtraComponent } from './evento/aula/cadastrar-turma-extra/cadastrar-turma-extra.component';
import { ToolbarComponent } from './full-calendar/toolbar/toolbar.component';
import { HeaderComponent } from './full-calendar/header/header.component';
import { CalculoPerfilCognitivoComponent } from './full-calendar/calculo-perfil-cognitivo/calculo-perfil-cognitivo.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReposicaoComponent } from './evento/aula/reposicao/reposicao.component';
import { InserirAlunoComponent } from './evento/inserir-aluno/inserir-aluno.component';
import { AgendarReposicaoAlunoComponent } from './agendar-reposicao-aluno/agendar-reposicao-aluno.component';

@NgModule({
    declarations: [
        CalendarioComponent,
        CadastrarSuperacaoComponent,
        CadastrarOficinaComponent,
        CadastrarReuniaoComponent,
        CadastrarAula0Component,
        CadastrarInscricaoComponent,
        CancelarEventoComponent,
        EventoComponent,
        EditarAula0Component,
        EditarAulaComponent,
        EditarOficinaComponent,
        EditarSuperacaoComponent,
        EditarReuniaoComponent,
        ReagendarEventoComponent,
        SelectedEventoComponent,
        CadastrarTurmaExtraComponent,
        ToolbarComponent,
        HeaderComponent,
        CalculoPerfilCognitivoComponent,
        ReposicaoComponent,
        InserirAlunoComponent,
        AgendarReposicaoAlunoComponent,
        
    ],
    imports: [
        CommonModule,
        CalendarioRoutingModule,
        SharedModule,
        DragDropModule
    ],
    bootstrap: [CalendarioComponent]
})
export class CalendarioModule { }
