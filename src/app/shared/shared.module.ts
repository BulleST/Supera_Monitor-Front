import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch,  withInterceptorsFromDi } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { ToastrModule } from 'ngx-toastr';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';
import { FullCalendarModule } from '@fullcalendar/angular';

// Alunos
import { FormComponent as AlunoFormComponent } from '../pages/alunos/form/form.component';
import { DadosCadastraisComponent as AlunoDadosCadastraisComponent } from '../pages/alunos/form/dados-cadastrais/dados-cadastrais.component';
import { CalendarioComponent as AlunoCalendarioComponent } from '../pages/alunos/form/calendario/calendario.component';
import { HistoricoComponent as AlunoHistoricoComponent } from '../pages/alunos/form/historico/historico.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
// End Alunos
import { RouterModule } from '@angular/router';
// import { AgendarReposicaoAlunoComponent } from '../pages/calendario/agendar-reposicao-aluno/agendar-reposicao-aluno.component';
import { SalaAulaComponent } from './sala-aula/sala-aula.component';
import { NameAbvPipe } from '../utils/name.pipe';
import { EventoItemComponent } from '../pages/calendario/full-calendar/evento-item/evento-item.component';
import { EventoItemHoverComponent } from '../pages/calendario/full-calendar/evento-item-hover/evento-item-hover.component';
import { NameFirstWordPipe } from '../utils/name-first-word.pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AlunoPopoverComponent } from './aluno/aluno-popover/aluno-popover.component';
import { AlunoChecklistDialogComponent } from './aluno/aluno-checklist-dialog/aluno-checklist-dialog.component';
import { AlunoChecklistComponent } from './aluno/aluno-checklist/aluno-checklist.component';
import { AlunoReposicaoDialogComponent } from './aluno/aluno-reposicao-dialog/aluno-reposicao-dialog.component';
import { AlunoChecklistOnConfirmDialogComponent } from './aluno/aluno-checklist-on-confirm-dialog/aluno-checklist-on-confirm-dialog.component';
import { SalaAulaPipe } from '../utils/sala-aula.pipe';

@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,

        // Alunos
        AlunoFormComponent,
        AlunoDadosCadastraisComponent,
        AlunoCalendarioComponent,
        AlunoHistoricoComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        // End Alunos
        
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,
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
        FormsModule,
        NgxMaskPipe,
        NameAbvPipe,

        ProfileComponent,
        ChangePasswordComponent,

        // Alunos
        AlunoFormComponent,
        AlunoDadosCadastraisComponent,
        AlunoCalendarioComponent,
        AlunoHistoricoComponent,
        AlunoPopoverComponent,
        AlunoChecklistComponent,
        AlunoChecklistDialogComponent,
        AlunoChecklistOnConfirmDialogComponent,
        AlunoReposicaoDialogComponent,
        // End Alunos
        
        ConfirmDialogComponent,
        SalaAulaComponent,
        EventoItemComponent,
        EventoItemHoverComponent,

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
        TranslateModule,
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
