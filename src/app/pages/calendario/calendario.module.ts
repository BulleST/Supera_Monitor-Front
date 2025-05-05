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
import { CadastrarAulaExtraComponent } from './evento/aula/cadastrar-aula-extra/cadastrar-aula-extra.component';
import { EditarAulaComponent } from './evento/aula/editar-aula/editar-aula.component';
import { CadastrarReuniaoComponent } from './evento/reuniao/cadastrar-reuniao/cadastrar-reuniao.component';
import { CadastrarInscricaoComponent } from './evento/oficina/cadastrar-inscricao/cadastrar-inscricao.component';
import { EditarReuniaoComponent } from './evento/reuniao/editar-reuniao/editar-reuniao.component';
// import { SelectedAlunoComponent } from './_selected-aluno/selected-aluno.component';
import { SelectedEventoComponent } from './selected-evento/selected-evento.component';
import { ReagendarEventoComponent } from './reagendar-evento/reagendar-evento.component';
import { CancelarEventoComponent } from './cancelar-evento/cancelar-evento.component';
import { AlunoChecklistPopoverComponent } from './aluno-checklist-popover/aluno-checklist-popover.component';
import { AlunoPopoverComponent } from './aluno-popover/aluno-popover.component';
import { AlunoChecklistStatusComponent } from './aluno-checklist-status/aluno-checklist-status.component';
import { EventContentComponent } from './event-content/event-content.component';



@NgModule({
    declarations: [
        AlunoChecklistPopoverComponent,
        AlunoChecklistStatusComponent,
        AlunoPopoverComponent,
        CalendarioComponent,
        CadastrarSuperacaoComponent,
        CadastrarOficinaComponent,
        CadastrarReuniaoComponent,
        CadastrarAula0Component,
        CadastrarAulaExtraComponent,
        CadastrarInscricaoComponent,
        CancelarEventoComponent,
        EventoComponent,
        EditarAula0Component,
        EditarAulaComponent,
        EditarOficinaComponent,
        EditarSuperacaoComponent,
        EditarReuniaoComponent,
        ReagendarEventoComponent,
        // SelectedAlunoComponent,
        SelectedEventoComponent,
        EventContentComponent,
    ],
    imports: [
        CommonModule,
        CalendarioRoutingModule,
        SharedModule,
    ],
    bootstrap: [CalendarioComponent]
})
export class CalendarioModule { }
