import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { Professor } from '../../../../../models/professor.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { Evento, EventoQueryParams } from '../../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { PseudoEvento } from '../../../../../models/reposicao.model';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import { ChecklistService } from '../../../../../services/checklist.service';

@Component({
    selector: 'app-editar-oficina',
    standalone: false,
    templateUrl: './editar-oficina.component.html',
    styleUrl: './editar-oficina.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class EditarOficinaComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];
    PseudoEvento = PseudoEvento;
    @Input() evento: Evento = new Evento;
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;
    @Input() isChamadaPage = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    @Output() validaProfessor = new EventEmitter<Professor>();
    @Output() validaSala = new EventEmitter<SalaAula>();
    @Output() width = new EventEmitter<string>();
    onSave = new EventEmitter<Evento>();

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private accountService: AccountService,
        private checklistService: ChecklistService,
    ) {
        this.onSave.subscribe(res => {
            this.markChecklistAsDone();
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) this.evento = changes['evento'].currentValue;
        if (changes['professores']) this.professores = changes['professores'].currentValue;
        if (changes['loadingProfessores']) this.loadingProfessores = changes['loadingProfessores'].currentValue;
        if (changes['salaAulas']) this.salaAulas = changes['salaAulas'].currentValue;
        if (changes['loadingSalaAulas']) this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;
        if (changes['duracaoEvento']) this.duracaoEvento = changes['duracaoEvento'].currentValue;
        if (changes['isChamadaPage']) this.isChamadaPage = changes['isChamadaPage'].currentValue;
        this.width.emit('650px')
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var professor = this.professores.find(x => x.id == e.value) as Professor;
        this.validaProfessor.emit(professor);

        if (professor && professor.disponivel == false && professor.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Educador indisponível' });
            this.showError('Educador Indisponível', `Esse educador está atribuído para outra aula com a turma <b>${professor.disponivelEvent.turma ?? professor.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(professor.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var salaAula = this.salaAulas.find(x => x.id == e.value) as SalaAula;
        this.validaSala.emit(salaAula);

        if (salaAula && salaAula.disponivel == false && salaAula.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuído para outra aula com a turma <b>${salaAula.disponivelEvent.turma ?? salaAula.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(salaAula.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.mensagemWhatsapp.getEventoTipo(e)
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }

    inputFocus(e: any) {
        e.target.select()
    }
    markChecklistAsDone() {
        // Comparecimento na 1ª ou 2ª Oficina
        // Id 34 ou 36
        this.evento.alunos.filter(x => x.presente).forEach(aluno => {
            var alunoChecklist = aluno.alunoChecklist.find(x => (x.checklist_Item_Id == 34 || x.checklist_Item_Id == 36) && !x.finalizado) as Aluno_CheckList_Item;
             if (alunoChecklist) {
                var mensagem = `Aluno compareceu na oficina do dia ${moment(this.evento.data).format('DD/MM/YY [às] HHH[h]mm')}. \n
                                Oficina finalizada por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HHH[h]mm')}}`
                if (alunoChecklist && !alunoChecklist.finalizado) {
                    lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
                }
            }
        });
    }

}
