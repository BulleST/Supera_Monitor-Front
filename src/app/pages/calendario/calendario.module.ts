import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CalendarioRoutingModule } from './calendario.routing';
import { CalendarioComponent } from './calendario.component';

import { CadastrarSuperacaoComponent } from './cadastrar-evento/cadastrar-superacao/cadastrar-superacao.component';
import { CadastrarOficinaComponent } from './cadastrar-evento/cadastrar-oficina/cadastrar-oficina.component';
import { CadastrarAula0Component } from './cadastrar-evento/cadastrar-aula-0/cadastrar-aula-0.component';
import { CadastrarReuniaoComponent } from './cadastrar-evento/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarInscricaoComponent } from './cadastrar-inscricao/cadastrar-inscricao.component';
import { CadastrarTurmaExtraComponent } from './cadastrar-evento/cadastrar-turma-extra/cadastrar-turma-extra.component';

import { EditarEventoComponent } from './editar-evento/editar-evento.component';

import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';

// Calendario
import { SelectedEventoComponent } from './full-calendar/selected-evento/selected-evento.component';
import { ToolbarComponent } from './full-calendar/toolbar/toolbar.component';
import { HeaderComponent } from './full-calendar/header/header.component';
import { CalculoPerfilCognitivoComponent } from './full-calendar/calculo-perfil-cognitivo/calculo-perfil-cognitivo.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { LegendaComponent } from './full-calendar/legenda/legenda.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AgendarAlunoComponent } from './agendar-aluno/agendar-aluno.component';
import { AlunoContatoFaltaComponent } from './aluno-contato-falta/aluno-contato-falta.component';
import { SalaAulaPipe } from '../../utils/sala-aula.pipe';
import { DialogService } from 'primeng/dynamicdialog';
import { AgendarPrimeiraAulaComponent } from './agendar-primeira-aula/agendar-primeira-aula.component';
import { AlunoSelectComponent } from './agendar-primeira-aula/aluno-select/aluno-select.component';
import { EventoSelectedComponent } from './agendar-primeira-aula/evento-selected/evento-selected.component';
import { CalendarioSelectComponent } from './agendar-primeira-aula/calendario-select/calendario-select.component';

@NgModule({
    declarations: [
        CalendarioComponent,
        CadastrarSuperacaoComponent,
        CadastrarOficinaComponent,
        CadastrarReuniaoComponent,
        CadastrarAula0Component,
        CadastrarInscricaoComponent,
        CancelarEventoComponent,
        SelectedEventoComponent,
        CadastrarTurmaExtraComponent,
        ToolbarComponent,
        HeaderComponent,
        CalculoPerfilCognitivoComponent,
        AgendarReposicaoComponent,
        AgendarFaltaComponent,
        AgendarAlunoComponent,
        LegendaComponent,
        AlunoContatoFaltaComponent,
        EditarEventoComponent,
        AgendarPrimeiraAulaComponent,
        AlunoSelectComponent,
        EventoSelectedComponent,
        CalendarioSelectComponent,
        
    ],
    imports: [
        CommonModule,
        CalendarioRoutingModule,
        SharedModule,
        DragDropModule,
        SalaAulaPipe
    ],
    providers: [
        DialogService
    ],
    bootstrap: [CalendarioComponent]
})
export class CalendarioModule { }
