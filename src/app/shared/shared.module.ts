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
import { ReposicaoComponent } from '../pages/_initial/home/reposicao/reposicao.component';
import { AulaComponent } from '../pages/_initial/home/aula/aula.component';
import { RestricoesComponent as AlunoRestricoesComponent } from '../pages/alunos/form/restricoes/restricoes.component';
// End Alunos



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
        // End Alunos

        ReposicaoComponent,
        AulaComponent,
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

        ReposicaoComponent,
        AulaComponent,
    ],
    imports: [
        CommonModule,
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
        FullCalendarModule
    ],
    providers: [
        provideHttpClient(withFetch()),
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class SharedModule { }
