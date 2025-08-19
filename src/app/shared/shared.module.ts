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
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Alunos
import { AlunoPopoverComponent } from './aluno/aluno-popover/aluno-popover.component';
import { AlunoChecklistDialogComponent } from './aluno/aluno-checklist-dialog/aluno-checklist-dialog.component';
import { AlunoChecklistComponent } from './aluno/aluno-checklist/aluno-checklist.component';
import { AlunoReposicaoDialogComponent } from './aluno/aluno-reposicao-dialog/aluno-reposicao-dialog.component';
import { AlunoChecklistOnConfirmDialogComponent } from './aluno/aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';

// Outros componentes
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SalaAulaComponent } from './sala-aula/sala-aula.component';
import { EventoItemComponent } from '../pages/calendario/full-calendar/evento-item/evento-item.component';
import { EventoItemHoverComponent } from '../pages/calendario/full-calendar/evento-item-hover/evento-item-hover.component';

// Pipes
import { NameAbvPipe } from '../utils/name.pipe';
import { NameFirstWordPipe } from '../utils/name-first-word.pipe';
import { SalaAulaPipe } from '../utils/sala-aula.pipe';
import { LoadingBrainComponent } from '../parts/loading-brain/loading-brain.component';
import { TableHeaderFilterComponent } from './table/table-header-filter/table-header-filter.component';
import { AlunoReposicaoTooltipComponent } from '../shared/aluno/aluno-reposicao-tooltip/aluno-reposicao-tooltip.component';
import { LegendColorComponent } from './professor/legend-color/legend-color.component';

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        AlunoReposicaoTooltipComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
        LoadingBrainComponent,
        TableHeaderFilterComponent,
        TableHeaderFilterComponent,
        LegendColorComponent,
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
        AlunoReposicaoTooltipComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
        LoadingBrainComponent,
        TableHeaderFilterComponent,
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
