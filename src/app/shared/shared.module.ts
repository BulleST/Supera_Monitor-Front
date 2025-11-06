import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { ToastrModule } from 'ngx-toastr';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Alunos
import { AlunoPopoverComponent } from './aluno/aluno-popover/aluno-popover.component';
import { AlunoChecklistDialogComponent } from './aluno/aluno-checklist-dialog/aluno-checklist-dialog.component';
import { AlunoChecklistComponent } from './aluno/aluno-checklist/aluno-checklist.component';
import { AlunoReposicaoDialogComponent } from './aluno/aluno-reposicao-dialog/aluno-reposicao-dialog.component';
import { AlunoChecklistOnConfirmDialogComponent } from './aluno/aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
import { AlunoAgendarFaltaDialogComponent } from './aluno/aluno-agendar-falta-dialog/aluno-agendar-falta-dialog.component';
import { AlunoParticipacaoFaltaContatoDialogComponent } from './aluno/aluno-participacao-falta-contato-dialog/aluno-participacao-falta-contato-dialog.component';
import { ReposicaoDeSelectComponent } from './aluno/aluno-reposicao-dialog/reposicao-de-select/reposicao-de-select.component';
import { ReposicaoParaSelectComponent } from './aluno/aluno-reposicao-dialog/reposicao-para-select/reposicao-para-select.component';
import { AlunoSelectComponent } from './aluno/aluno-reposicao-dialog/aluno-select/aluno-select.component';

// Outros componentes
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SalaAulaComponent } from './sala-aula/sala-aula.component';
import { EventoItemComponent } from '../pages/calendario/full-calendar/evento-item/evento-item.component';
import { EventoItemHoverComponent } from '../pages/calendario/full-calendar/evento-item-hover/evento-item-hover.component';
import { LoadingBrainComponent } from '../parts/loading-brain/loading-brain.component';
import { TableHeaderFilterComponent } from './table/table-header-filter/table-header-filter.component';
import { LegendColorComponent } from './professor/legend-color/legend-color.component';
import { IndisponivelTooltipComponent } from './evento/indisponivel-tooltip/indisponivel-tooltip.component';
import { CalendarioComponent } from './aluno/aluno-agendar-falta-dialog/calendario/calendario.component';

// Pipes
import { NameAbvPipe } from '../utils/name.pipe';
import { NameFirstWordPipe } from '../utils/name-first-word.pipe';
import { SalaAulaPipe } from '../utils/sala-aula.pipe';
import { AulaComponent } from './evento/aula/aula.component';
import { AlunoContatoFaltaComponent } from './aluno/aluno-contato-falta/aluno-contato-falta.component';
import { EventoParticipacaoStatusComponent } from './evento/evento-participacao-status/evento-participacao-status.component';

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        AlunoAgendarFaltaDialogComponent,
        AlunoParticipacaoFaltaContatoDialogComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
        LoadingBrainComponent,
        TableHeaderFilterComponent,
        TableHeaderFilterComponent,
        LegendColorComponent,
        IndisponivelTooltipComponent,
        CalendarioComponent,
        ReposicaoDeSelectComponent,
        ReposicaoParaSelectComponent,
        AlunoSelectComponent,
        AulaComponent,
        AlunoContatoFaltaComponent,
        EventoParticipacaoStatusComponent
    ],
    exports: [
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
        ProfileComponent,
        ChangePasswordComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        AlunoAgendarFaltaDialogComponent,
        AlunoParticipacaoFaltaContatoDialogComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
        LoadingBrainComponent,
        TableHeaderFilterComponent,
        LegendColorComponent,
        IndisponivelTooltipComponent,
        
        ReposicaoDeSelectComponent,
        ReposicaoParaSelectComponent,
        AlunoSelectComponent,
        AulaComponent,
        AlunoContatoFaltaComponent,
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
