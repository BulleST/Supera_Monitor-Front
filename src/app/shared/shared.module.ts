import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { PrimengModule } from './primeng.module';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NameAbvPipe } from '../utils/name.pipe';
import { NameFirstWordPipe } from '../utils/name-first-word.pipe';
import { SalaAulaPipe } from '../utils/sala-aula.pipe';
import { AlunoDetalhesComponent } from './aluno/aluno-detalhes/aluno-detalhes.component';
import { TabDadosCadastraisComponent } from './aluno/aluno-detalhes/tab-dados-cadastrais/tab-dados-cadastrais.component';
import { TabVigenciaComponent } from './aluno/aluno-detalhes/tab-vigencia/tab-vigencia.component';
import { TabHistoricoComponent } from './aluno/aluno-detalhes/tab-historico/tab-historico.component';
import { AlunoDetalhesLoadingComponent } from './aluno/aluno-detalhes/aluno-detalhes-loading/aluno-detalhes-loading.component';
import { AlunoParticipacaoComponent } from './aluno/aluno-participacao/aluno-participacao.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AlunoChecklistDetalhesComponent } from './checklist/aluno-checklist-detalhes/aluno-checklist-detalhes.component';
import { AlunoChecklistStatusComponent } from './checklist/aluno-checklist-status/aluno-checklist-status.component';
import { ChecklistStatusComponent } from './checklist/checklist-status/checklist-status.component';
import { FinalizarChecklistComponent } from './checklist/finalizar-checklist/finalizar-checklist.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AgendarFaltaComponent } from './evento/agendar/agendar-falta/agendar-falta.component';
import { FaltaAlunoSelectComponent } from './evento/agendar/agendar-falta/falta-aluno-select/falta-aluno-select.component';
import { FaltaCalendarioSelectComponent } from './evento/agendar/agendar-falta/falta-calendario-select/falta-calendario-select.component';
import { FaltaEventoSelectedComponent } from './evento/agendar/agendar-falta/falta-evento-selected/falta-evento-selected.component';
import { AgendarPrimeiraAulaComponent } from './evento/agendar/agendar-primeira-aula/agendar-primeira-aula.component';
import { Aula1AlunoSelectComponent } from './evento/agendar/agendar-primeira-aula/aula1-aluno-select/aula1-aluno-select.component';
import { Aula1CalendarioSelectComponent } from './evento/agendar/agendar-primeira-aula/aula1-calendario-select/aula1-calendario-select.component';
import { Aula1EventoSelectedComponent } from './evento/agendar/agendar-primeira-aula/aula1-evento-selected/aula1-evento-selected.component';
import { AgendarOficinaComponent } from './evento/agendar/agendar-oficina/agendar-oficina.component';
import { OficinaAlunoSelectComponent } from './evento/agendar/agendar-oficina/oficina-aluno-select/oficina-aluno-select.component';
import { OficinaCalendarioSelectComponent } from './evento/agendar/agendar-oficina/oficina-calendario-select/oficina-calendario-select.component';
import { OficinaEventoSelectedComponent } from './evento/agendar/agendar-oficina/oficina-evento-selected/oficina-evento-selected.component';
import { AgendarReposicaoComponent } from './evento/agendar/agendar-reposicao/agendar-reposicao.component';
import { ReposicaoConfirmComponent } from './evento/agendar/agendar-reposicao/_reposicao-confirm/reposicao-confirm.component';
import { ReposicaoAlunoSelectComponent } from './evento/agendar/agendar-reposicao/reposicao-aluno-select/reposicao-aluno-select.component';
import { ReposicaoDeSelectComponent } from './evento/agendar/agendar-reposicao/reposicao-de-select/reposicao-de-select.component';
import { ReposicaoParaSelectComponent } from './evento/agendar/agendar-reposicao/reposicao-para-select/reposicao-para-select.component';
import { EditarAulaComponent } from './evento/editar-aula/editar-aula.component';
import { EditarEventoComponent } from './evento/editar-evento/editar-evento.component';
import { EditarAula0Component } from './evento/editar-evento/editar-aula-0/editar-aula-0.component';
import { EditarOficinaComponent } from './evento/editar-evento/editar-oficina/editar-oficina.component';
import { EditarReuniaoComponent } from './evento/editar-evento/editar-reuniao/editar-reuniao.component';
import { EditarSuperacaoComponent } from './evento/editar-evento/editar-superacao/editar-superacao.component';
import { EventoParticipacaoStatusComponent } from './evento/evento-participacao-status/evento-participacao-status.component';
import { IndisponivelTooltipComponent } from './indisponivel-tooltip/indisponivel-tooltip.component';
import { EventoReposicaoTooltipComponent } from './evento/evento-reposicao-tooltip/evento-reposicao-tooltip.component';
import { LegendColorComponent } from './legend-color/legend-color.component';
import { ProfileComponent } from './profile/profile.component';
import { SalaAulaComponent } from './sala-aula/sala-aula.component';
import { TableHeaderFilterComponent } from './table/table-header-filter/table-header-filter.component';
import { EventoItemHoverComponent } from './evento-item-hover/evento-item-hover.component';
import { EditarParticipacaoContatoComponent } from './evento/editar-participacao-contato/editar-participacao-contato.component';
import { EnviarMensagemAlunosComponent } from './evento/enviar-mensagem-alunos/enviar-mensagem-alunos.component';
import { AutoFocus } from "primeng/autofocus";
import { AlunoJornadaComponent } from './checklist/aluno-jornada/aluno-jornada.component';
import { AgendarAula0Component } from './evento/agendar/agendar-aula-0/agendar-aula-0.component';
import { AgendarSuperacaoComponent } from './evento/agendar/agendar-superacao/agendar-superacao.component';
import { TableComponent } from './evento/editar-aula/table/table.component';
import { CardComponent } from './evento/editar-aula/card/card.component';

@NgModule({
    declarations: [
        // > aluno
        AlunoDetalhesComponent,
        TabDadosCadastraisComponent,
        TabVigenciaComponent,
        TabHistoricoComponent,
        AlunoDetalhesLoadingComponent,
        AlunoParticipacaoComponent,

        ChangePasswordComponent,

        // > checklist
        AlunoChecklistDetalhesComponent,
        AlunoChecklistStatusComponent,
        ChecklistStatusComponent,
        FinalizarChecklistComponent,

        ConfirmDialogComponent,

        // > evento 
        // > evento > agendar > falta
        AgendarFaltaComponent,
        FaltaAlunoSelectComponent,
        FaltaCalendarioSelectComponent,
        FaltaEventoSelectedComponent,

        // > evento > agendar > primeira aula
        AgendarPrimeiraAulaComponent,
        Aula1AlunoSelectComponent,
        Aula1CalendarioSelectComponent,
        Aula1EventoSelectedComponent,

        // > evento > agendar > oficina
        AgendarOficinaComponent,
        OficinaAlunoSelectComponent,
        OficinaCalendarioSelectComponent,
        OficinaEventoSelectedComponent,

        // > evento > agendar > reposicao
        AgendarReposicaoComponent,
        ReposicaoConfirmComponent,
        ReposicaoAlunoSelectComponent,
        ReposicaoDeSelectComponent,
        ReposicaoParaSelectComponent,
        
        // > evento > agendar > aula zero
        AgendarAula0Component,

        // > evento > agendar > superacao
        AgendarSuperacaoComponent,

        // > evento > editar aula
        EditarAulaComponent,

        // > evento > editar evento
        EditarEventoComponent,
        EditarAula0Component,
        EditarOficinaComponent,
        EditarReuniaoComponent,
        EditarReuniaoComponent,
        EditarSuperacaoComponent,

        EventoParticipacaoStatusComponent,
        IndisponivelTooltipComponent,
        EventoReposicaoTooltipComponent,

        LegendColorComponent,
        ProfileComponent,
        SalaAulaComponent,
        TableHeaderFilterComponent,
        EventoItemHoverComponent,
        EditarParticipacaoContatoComponent,
        EnviarMensagemAlunosComponent,
        AlunoJornadaComponent,
        TableComponent,
        CardComponent,



    ],
    exports: [
        CommonModule,
        FormsModule,
        PrimengModule,
        ToastrModule,
        FontAwesomeModule,
        DragDropModule,
        ScrollingModule,
        FullCalendarModule,
        NgxMaskDirective,
        NgxMaskPipe,
        NameFirstWordPipe,
        NameAbvPipe,
        RouterModule,
        SalaAulaPipe,

        // Components
        LegendColorComponent,
        IndisponivelTooltipComponent,
        EventoItemHoverComponent,
        EventoReposicaoTooltipComponent,
        TableHeaderFilterComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoParticipacaoStatusComponent,

    ],
    imports: [
        CommonModule,
        RouterModule,
        PrimengModule,
        ToastrModule.forRoot({ enableHtml: true }),
        FontAwesomeModule,
        NgxMaskDirective,
        FormsModule,
        NgxMaskPipe,
        DragDropModule,
        ScrollingModule,
        FullCalendarModule,
        NameAbvPipe,
        NameFirstWordPipe,
        SalaAulaPipe,
        AutoFocus
    ],
    providers: [
        provideHttpClient(withFetch()),
        provideHttpClient(withInterceptorsFromDi()),
        NameAbvPipe,
        NameFirstWordPipe,
        SalaAulaPipe,
    ]
})
export class SharedModule { }
