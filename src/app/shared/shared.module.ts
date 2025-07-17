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
// import { FormComponent as AlunoFormComponent } from '../pages/alunos/form/form.component';
// import { DadosCadastraisComponent as AlunoDadosCadastraisComponent } from '../pages/alunos/form/dados-cadastrais/dados-cadastrais.component';
// import { CalendarioComponent as AlunoCalendarioComponent } from '../pages/alunos/form/calendario/calendario.component';
// import { HistoricoComponent as AlunoHistoricoComponent } from '../pages/alunos/form/historico/historico.component';
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

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,
        // AlunoFormComponent,
        // AlunoDadosCadastraisComponent,
        // AlunoCalendarioComponent,
        // AlunoHistoricoComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
        LoadingBrainComponent,
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
        // AlunoFormComponent,
        // AlunoDadosCadastraisComponent,
        // AlunoCalendarioComponent,
        // AlunoHistoricoComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
        LoadingBrainComponent,
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
