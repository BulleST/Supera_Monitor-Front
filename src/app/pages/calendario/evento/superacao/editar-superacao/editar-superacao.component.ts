import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { Professor } from '../../../../../models/professor.model';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { lastValueFrom, Subscription } from 'rxjs';
import moment from 'moment';
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model';
import { ApostilaService } from '../../../../../services/apostila.service';
import { Apostila } from '../../../../../models/apostila.model';
import { AccountService } from '../../../../../services/account.service';
import { ChecklistService } from '../../../../../services/checklist.service';
import { showError, CalendarioUtils } from '../../../../../utils';
import { EventoService } from '../../../../../services/evento.service';
import { AlunoService } from '../../../../../services/alunos.service';
import { DialogService } from 'primeng/dynamicdialog';
import { showAluno } from '../../../../../utils/showAluno';

@Component({
    selector: 'app-editar-superacao',
    standalone: false,
    templateUrl: './editar-superacao.component.html',
    styleUrl: './editar-superacao.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    providers: [DialogService],
})
export class EditarSuperacaoComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];

    @Input() evento: Evento = new Evento;
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    @Output() validaProfessor = new EventEmitter<Professor>();
    @Output() validaSala = new EventEmitter<SalaAula>();
    @Output() width = new EventEmitter<string>();
    onSave = new EventEmitter<Evento>();

    apostilaAbacoAluno: Apostila[] = [];
    apostilaAHAluno: Apostila[] = [];
    apostilas: Apostila[] = [];
    loadingApostila = false;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private apostilaService: ApostilaService,
        private accountService: AccountService,
        private checklistService: ChecklistService,
        private calendarioUtils: CalendarioUtils,
        private service: EventoService,
        private alunoService: AlunoService,
        private dialogService: DialogService,
    ) {
        var apostilas = this.apostilaService.listApostila.subscribe(res => this.apostilas = res);
        this.subscription.push(apostilas);

        if (this.apostilas.length == 0) {
            this.loadingApostila = true;
            lastValueFrom(this.apostilaService.getApostilas())
                .then(res => this.loadingApostila = false)
                .catch(res => this.loadingApostila = false)
        }

        this.onSave.subscribe(res => {
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) this.evento = changes['evento'].currentValue;
        if (changes['professores']) this.professores = changes['professores'].currentValue;
        if (changes['loadingProfessores']) this.loadingProfessores = changes['loadingProfessores'].currentValue;
        if (changes['salaAulas']) this.salaAulas = changes['salaAulas'].currentValue;
        if (changes['loadingSalaAulas']) this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;
        if (changes['duracaoEvento']) this.duracaoEvento = changes['duracaoEvento'].currentValue;
        this.width.emit('700px')
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.professores.find(x => x.id == e.value);
        let mensagemErro: string | null = null;
        this.validaProfessor.emit(item);

        if (item && !item.disponivel && item.disponivelEvent) {
            mensagemErro = `Existe uma outra ${this.getTipo(item.disponivelEvent)} às ${moment(item.disponivelEvent.data).format('HH[h]mm')} no mesmo dia.`
        }
        else if (item && !item.disponivel && !item.disponivelEvent && item.expedienteInicio && item.expedienteFim) {
            mensagemErro = `O expediente do educador é das ${moment(item.expedienteInicio).format('HH:mm')} às ${moment(item.expedienteFim).format('HH:mm')}`;
        } else {
            mensagemErro = null;
        }

        if (mensagemErro) {
            this.showError('Educador indisponível', mensagemErro, e.originalEvent)
        }
        model.control.setErrors({ indisponivel: mensagemErro });
        model.control.updateValueAndValidity();
    }


    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.salaAulas.find(x => x.id == e.value);
        this.validaSala.emit(item);
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e);
    }

    inputFocus(e: any) {
        e.target.select()
    }

    presenteClick(aluno: Evento_Participacao_Aluno) {
        aluno.presente = !aluno.presente;
    }

    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, aluno, e);
    }

    showAluno(participacao: Evento_Participacao_Aluno) {
        showAluno(participacao.aluno_Id, this.dialogService);
    }
}
