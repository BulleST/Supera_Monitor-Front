import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { Professor } from '../../../../../models/professor.model';
import { EventoOficinaRequest } from '../../../../../models/evento-oficina.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { EventoService } from '../../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { getError, showError } from '../../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '../../../../../models/evento.model';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { SelectChangeEvent } from 'primeng/select';
import { validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import $ from 'jquery';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { playAlert, playSuccess } from '../../../../../utils/audio';

@Component({
    selector: 'app-cadastrar-oficina',
    standalone: false,
    templateUrl: './cadastrar-oficina.component.html',
    styleUrl: './cadastrar-oficina.component.css',
    providers: [ConfirmationService]
})
export class CadastrarOficinaComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoOficinaRequest = new EventoOficinaRequest;

    data: Date = new Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();

    professorSelected?: Professor;
    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    eventos: Evento[] = [];
    loadingEventos = false;
        
    feriados: Feriado[] = [];
    loadingFeriados = false;
    feriadoDates: Date[] = [];
    ano: number = new Date().getFullYear();

    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;
    @ViewChild('professor_Id') professor_Id!: NgModel;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private service: EventoService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private toastrService: ToastrService,
        private calendarioUtils: CalendarioUtils,
    ) {
        this.object.descricao = 'Oficina';

        var professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        var salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res);
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true;

            lastValueFrom(this.salaAulaService.getList())
                .then(res => this.loadingSalaAulas = false)
                .catch(res => this.loadingSalaAulas = false);
        }

        this.visible = true;

        var eventos = this.service.eventos.subscribe(res => this.eventos = res);
        this.subscription.push(eventos);

        this.loadFeriados();

        this.verificaDisponibilidade();

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    
    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }
    
    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }


    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados()
        }
    }

    loadFeriados() {
        this.loadingFeriados = true;
        lastValueFrom(this.service.getFeriados(this.ano))
        .then(res => {
            this.feriados = res;
            this.loadingFeriados = false;
            this.feriadoDates = res.map(x => moment(x.date).toDate());
        })
        .catch(res => this.loadingFeriados = false);
    }
    
    async verificaDisponibilidade() {
        var valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }

        this.loadingEventos = true;
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes())

        var request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.getList(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();

        return valid

    }

    validaSalaAulas() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
        if (this.professorSelected) {
            var e: SelectChangeEvent = {
                value: this.professorSelected,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any
            } 
            this.professorChanged(e, this.professor_Id);
        }
    }


    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = e.value as Professor;
        let mensagemErro: string | null = null;

        if (item && !item.disponivel && item.disponivelEvent) {
            mensagemErro = `Existe uma outra ${this.getTipo(item.disponivelEvent)} às ${moment(item.disponivelEvent.data).format('HH[h]mm')} no mesmo dia.`
        }
        else if (item && !item.disponivel && !item.disponivelEvent && item.expedienteInicio && item.expedienteFim) {
            mensagemErro = `O expediente do educador é das ${moment(item.expedienteInicio).format('HH:mm')} às ${moment(item.expedienteFim).format('HH:mm')}`;
        } 
        else {
            mensagemErro = null;
        }
        
        if (mensagemErro) {
            this.showError('Educador indisponível', mensagemErro, e.originalEvent)
            model.control.setValue(undefined)
        }
        
        model.control.setErrors({ indisponivel: mensagemErro });
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaSalaAulas();

        var item = this.salaAulas.find(x => x.id == e.value);
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }


    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (!this.professorSelected)
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e);


        // playAlert();

        this.object.professores = [this.professorSelected.id];
        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar oficina',
            message: `Tem certeza que deseja agendar oficina para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`,
            acceptLabel: `Agendar oficina`,
            acceptIcon: 'pi pi-check',
            rejectLabel: 'Não',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-text ',
            accept: () => {
                this.send(e);
            }
        })

    }

    send(e: any) {

        this.loading = true;

        lastValueFrom(this.service.createOficina(this.object))
            .then(res => {
                this.loading = false;
                this.visible = false
                this.visibleChange();
                this.toastrService.success('Oficina cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
                // playSuccess();
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar oficina. <br> ${getError(res)}`, e);
            })

    }
}
