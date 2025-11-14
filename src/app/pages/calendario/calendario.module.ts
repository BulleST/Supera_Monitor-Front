import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { CalendarioRoutingModule } from './calendario.routing';
import { SalaAulaPipe } from '../../utils/sala-aula.pipe';

import { CalendarioComponent } from './calendario.component';
import { AgendarFaltaComponent } from './agendar-falta/agendar-falta.component';
import { AgendarPrimeiraAulaComponent } from './agendar-primeira-aula/agendar-primeira-aula.component';
import { AgendarReposicaoComponent } from './agendar-reposicao/agendar-reposicao.component';
import { CadastrarAula0Component } from './cadastrar-evento/cadastrar-aula-0/cadastrar-aula-0.component';
import { CadastrarOficinaComponent } from './cadastrar-evento/cadastrar-oficina/cadastrar-oficina.component';
import { CadastrarReuniaoComponent } from './cadastrar-evento/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarSuperacaoComponent } from './cadastrar-evento/cadastrar-superacao/cadastrar-superacao.component';
import { CadastrarTurmaExtraComponent } from './cadastrar-evento/cadastrar-turma-extra/cadastrar-turma-extra.component';
import { CadastrarInscricaoComponent } from './cadastrar-inscricao/cadastrar-inscricao.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { EditarAulaComponent } from './editar-aula/editar-aula.component';
import { EditarEventoComponent } from './editar-evento/editar-evento.component';
import { CalculoPerfilCognitivoComponent } from './full-calendar/calculo-perfil-cognitivo/calculo-perfil-cognitivo.component';
import { EventoItemComponent } from './full-calendar/evento-item/evento-item.component';
import { HeaderComponent } from './full-calendar/header/header.component';
import { LegendaComponent } from './full-calendar/legenda/legenda.component';
import { SelectedEventoComponent } from './full-calendar/selected-evento/selected-evento.component';
import { ToolbarComponent } from './full-calendar/toolbar/toolbar.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AutoFocus } from "primeng/autofocus";
import { ReposicaoDeSelectComponent } from './cadastrar-evento/cadastrar-turma-extra/reposicao-de-select/reposicao-de-select.component';


@NgModule({
    declarations: [
        CalendarioComponent,
        AgendarFaltaComponent,
        AgendarPrimeiraAulaComponent,
        AgendarReposicaoComponent,
        CadastrarAula0Component,
        CadastrarOficinaComponent,
        CadastrarReuniaoComponent,
        CadastrarSuperacaoComponent,
        CadastrarTurmaExtraComponent,
        CadastrarInscricaoComponent,
        CancelarEventoComponent,
        EditarAulaComponent,
        EditarEventoComponent,
        CalculoPerfilCognitivoComponent,
        EventoItemComponent,
        HeaderComponent,
        LegendaComponent,
        SelectedEventoComponent,
        ToolbarComponent,
        ReposicaoDeSelectComponent,
    ],
    imports: [
    CommonModule,
    CalendarioRoutingModule,
    SharedModule,
    SalaAulaPipe,
    AutoFocus
],
    providers: [DialogService],
    bootstrap: [CalendarioComponent]
})
export class CalendarioModule { }
