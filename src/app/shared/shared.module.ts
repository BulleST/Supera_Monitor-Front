import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch,  withInterceptorsFromDi } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {  FormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { ToastrModule } from 'ngx-toastr';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll';
import { FullCalendarModule } from '@fullcalendar/angular';

// Alunos
import { FormComponent as AlunoFormComponent } from '../pages/alunos/form/form.component';
import { DadosCadastraisComponent as AlunoDadosCadastraisComponent } from '../pages/alunos/form/dados-cadastrais/dados-cadastrais.component';
import { ChecklistComponent as AlunoChecklistComponent } from '../pages/alunos/form/checklist/checklist.component';
import { CalendarioComponent as AlunoCalendarioComponent } from '../pages/alunos/form/calendario/calendario.component';
import { RestricoesComponent as AlunoRestricoesComponent } from '../pages/alunos/form/restricoes/restricoes.component';
import { HistoricoComponent as AlunoHistoricoComponent } from '../pages/alunos/form/historico/historico.component';
import { FaltasComponent as AlunoFaltasComponent } from '../pages/alunos/form/faltas/faltas.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
// End Alunos
import { RouterModule } from '@angular/router';
import { AgendarReposicaoAlunoComponent } from '../pages/calendario/agendar-reposicao-aluno/agendar-reposicao-aluno.component';
import { SalaAulaComponent } from './sala-aula/sala-aula.component';


@NgModule({
    declarations: [
        ProfileComponent,
        ChangePasswordComponent,

        // Alunos
        AlunoFormComponent,
        AlunoDadosCadastraisComponent,
        AlunoChecklistComponent,
        AlunoCalendarioComponent,
        AlunoRestricoesComponent,
        AlunoHistoricoComponent,
        AlunoFaltasComponent,
        // End Alunos

        // ReposicaoComponent,
        // AulaComponent,

        AgendarReposicaoAlunoComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,
    ],
    exports: [
        FormsModule,
        PrimengModule,
        ToastrModule,
        FontAwesomeModule,
        NgxMaskDirective,
        FormsModule,
        NgxMaskPipe,
        ProfileComponent,
        ChangePasswordComponent,
        DragDropModule,
        FullCalendarModule,
        DragScrollComponent, 
        DragScrollItemDirective,
        
        // Alunos
        AlunoFormComponent,
        AlunoDadosCadastraisComponent,
        AlunoChecklistComponent,
        AlunoCalendarioComponent,
        AlunoRestricoesComponent,
        // End Alunos
        
        AgendarReposicaoAlunoComponent,
        ConfirmDialogComponent,
        SalaAulaComponent,

    ],
    imports: [
        CommonModule,
        RouterModule,
        PrimengModule,
        FormsModule,
        ToastrModule.forRoot({ enableHtml: true }),
        FontAwesomeModule,
        NgxMaskDirective,
        FormsModule,
        NgxMaskPipe,
        TranslateModule,
        DragDropModule,
        DragScrollComponent, 
        DragScrollItemDirective,
        FullCalendarModule,
    ],
    providers: [
        provideHttpClient(withFetch()),
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class SharedModule { }
