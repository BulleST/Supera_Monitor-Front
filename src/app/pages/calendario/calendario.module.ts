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
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { CadastrarTurmaExtraComponent } from './evento/aula/cadastrar-turma-extra/cadastrar-turma-extra.component';
import { ToolbarComponent } from './full-calendar/toolbar/toolbar.component';
import { HeaderComponent } from './full-calendar/header/header.component';
import { CalculoPerfilCognitivoComponent } from './full-calendar/calculo-perfil-cognitivo/calculo-perfil-cognitivo.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PrimeiraAulaAlunoComponent } from './evento/aula/primeira-aula-aluno/primeira-aula-aluno.component';
import { CalendarioAlunoOptionsComponent } from './agendar-aula-1/calendario/calendario.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { LegendaComponent } from './full-calendar/legenda/legenda.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AlunoContatoFaltaComponent } from './aluno-contato-falta/aluno-contato-falta.component';
import { AgendarAula1Component } from './agendar-aula-1/agendar-aula-1.component';
import { AgendarAlunoComponent } from './agendar-aluno/agendar-aluno.component';

@NgModule({
    declarations: [
        CalendarioComponent,
        CadastrarSuperacaoComponent,
        CadastrarOficinaComponent,
        CadastrarReuniaoComponent,
        CadastrarAula0Component,
        AgendarAula1Component,
        CadastrarInscricaoComponent,
        CancelarEventoComponent,
        EventoComponent,
        EditarAula0Component,
        EditarAulaComponent,
        EditarOficinaComponent,
        EditarSuperacaoComponent,
        EditarReuniaoComponent,
        PrimeiraAulaAlunoComponent,
        CalendarioAlunoOptionsComponent,
        SelectedEventoComponent,
        CadastrarTurmaExtraComponent,
        ToolbarComponent,
        HeaderComponent,
        CalculoPerfilCognitivoComponent,
        AgendarReposicaoComponent,
        AgendarFaltaComponent,
        AgendarAula1Component,
        AgendarAlunoComponent,
        LegendaComponent,
        AlunoContatoFaltaComponent,
        
    ],
    imports: [
        CommonModule,
        CalendarioRoutingModule,
        SharedModule,
        DragDropModule,
    ],
    bootstrap: [CalendarioComponent]
})
export class CalendarioModule { }
