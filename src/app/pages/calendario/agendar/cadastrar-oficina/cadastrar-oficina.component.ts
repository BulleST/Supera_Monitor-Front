import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SalaAula } from '../../../../models/sala-aula.model';
import { Professor } from '../../../../models/professor.model';
import { EventoOficinaRequest } from '../../../../models/evento-oficina.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SalaAulaService } from '../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../services/professor.service';
import { EventoService } from '../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { getError, showError } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '../../../../models/evento.model';
import { CalendarioRequest } from '../../../../models/calendario.model';
import { SelectChangeEvent } from 'primeng/select';
import { validaProfessores, validaSalaAulas } from '../../../../utils/validacao';
import { Feriado } from '../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import $ from 'jquery';
import { CalendarioUtils } from '../../../../utils/calendario-utils';
import { Roteiro } from '../../../../models/roteiro.model';
import { RoteiroService } from '../../../../services/roteiro.service';
import { JornadaSuperaService } from '../../../../services/jornada-supera.service';
import { MonitoramentoService } from '../../../../services/monitoramento.service';
import { FeriadoService } from '../../../../services/feriado.service';

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

    professorSelected?: Professor;
    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano: number = new Date().getFullYear();

    invalidDates: Date[] = [];

    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;
    @ViewChild('professor_Id') professor_Id!: NgModel;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private roteiroService: RoteiroService,
        private eventoService: EventoService,
        private jornadaService: JornadaSuperaService,
        private monitoramentoService: MonitoramentoService,
        private feriadoService: FeriadoService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private toastrService: ToastrService,
        private calendarioUtils: CalendarioUtils,
    ) {
        this.object.descricao = 'Oficina';

        let feriados = this.feriadoService.list.subscribe(res => {
            this.feriados = res;
            this.setInvalidDates();
        });
        this.subscription.push(feriados);

        if (this.feriados.length == 0) {
            this.loadFeriados();
        }

        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res.filter(x => x.active);
            this.setInvalidDates();
        });
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadRoteiros();
        }

        let professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active));
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadProfessores();
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res);
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadSalas();
        }

        let eventos = this.eventoService.eventos.subscribe(res => this.eventos = res.filter(x => x.active));
        this.subscription.push(eventos);

        this.visible = true;

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

    loadProfessores() {
        this.loadingProfessores = true;
        lastValueFrom(this.professorService.getList())
            .then(res => this.loadingProfessores = false)
            .catch(res => this.loadingProfessores = false);
    }

    loadRoteiros() {
        this.loadingRoteiros = true;
        lastValueFrom(this.roteiroService.getList(moment().year()))
            .then(res => this.loadingRoteiros = false)
            .catch(res => this.loadingRoteiros = false);
    }

    loadSalas() {
        this.loadingSalaAulas = true;
        lastValueFrom(this.salaAulaService.getList())
            .then(res => this.loadingSalaAulas = false)
            .catch(res => this.loadingSalaAulas = false);
    }

    loadFeriados() {
        this.loadingFeriados = true;
        lastValueFrom(this.feriadoService.getList())
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false);
    }

    setInvalidDates() {
        if (this.roteiros.length && this.feriados.length) {
            let recessos = this.roteiros.filter(x => x.recesso === true);
            let recessosDate = recessos.flatMap(x => {
                let length = moment(x.dataFim).diff(x.dataInicio, 'day')
                let range = Array.from({ length }, (item, index) => {
                    return moment(x.dataInicio, 'YYYY-MM-DD').add(index, 'day').toDate()
                });
                range.push(moment(x.dataFim, 'YYYY-MM-DD').toDate())
                return range;
            });

            let feriadosDate = this.feriados.map(x => moment(x.data).toDate());

            this.invalidDates = [... new Set(recessosDate.concat(feriadosDate))];
        }
    }
    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados()
        }
    }

    async verificaDisponibilidade() {
        let valid = true;

        if (this.data.getDay() === 1 && !this.horario) {
            this.horario = moment(this.data).set({ hour: 10, minute: 0, second: 0 }).toDate();
        }

        if (!this.data || !this.horario) {
            return valid;
        }


        this.loadingEventos = true;
        let data = moment(this.data).set({ hour: this.horario.getHours(), minute: this.horario.getMinutes(), second: 0 }).toDate();


        let request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.eventoService.getList(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();

        return valid

    }

    validaSalaAulas() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
        if (this.professorSelected) {
            let e: SelectChangeEvent = {
                value: this.professorSelected,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any
            }
            this.professorChanged(e, this.professor_Id);
        }
    }


    professorChanged(e: SelectChangeEvent, model: NgModel) {
        let item = e.value as Professor;
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

        let item = this.salaAulas.find(x => x.id == e.value);
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
            message: `Tem certeza que deseja agendar oficina para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?`,
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

        lastValueFrom(this.eventoService.createOficina(this.object))
            .then(res => {
                this.loading = false;

                if (res.success) {
                    this.visible = false;
                    this.visibleChange()
                    this.toastrService.success('Oficina cadastrada com sucesso.', 'Agendamento finalizado');
                    this.jornadaService.onReload.emit(res.object.id);
                    this.monitoramentoService.onReload.emit(res.object.id);
                    this.eventoService.onReload.emit(res.object.id);
                }
                else {
                    this.showError('Agendamento falhou', `Não foi possível agendar oficina. <br> ${res.message}`, e);
                }
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar oficina. <br> ${getError(res)}`, e);
            })

    }
}
