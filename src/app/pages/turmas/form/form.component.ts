import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, insertOrReplace, showError } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm, NgModel } from '@angular/forms';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { SelectChangeEvent } from 'primeng/select';
import { PerfilCognitivoService } from '../../../services/perfil-cognitivo.services';
import { PerfilCognitivo } from '../../../models/perfil-cognitivo.model';
import { SalaAulaService } from '../../../services/sala-aula.service';
import { SalaAula, SalaAulaId } from '../../../models/sala-aula.model';
import { CalendarioRequest } from '../../../models/calendario.model';
import { Evento } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { validaProfessores, validaSalaAulas } from '../../../utils/validacao';
import { CalendarioUtils } from '../../../utils/calendario-utils';
import $ from 'jquery';
import { playAlert, playSuccess } from '../../../utils/audio';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy, AfterViewInit {
    visible: boolean = false;
    object: Turma = new Turma;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];
    SalaAulaId = SalaAulaId;

    diasSemana = [
        // { id: 0, label: 'Domingo' },
        { id: 1, label: 'Segunda-feira' },
        { id: 2, label: 'Terça-feira' },
        { id: 3, label: 'Quarta-feira' },
        { id: 4, label: 'Quinta-feira' },
        { id: 5, label: 'Sexta-feira' },
        { id: 6, label: 'Sábado' },
    ];

    selectedPerfil: PerfilCognitivo[] = [];
    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    @ViewChild('professor_Id') professor_Id!: NgModel;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: TurmaService,
        private professorService: ProfessorService,
        private perfilCognitivoService: PerfilCognitivoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private salaAulaService: SalaAulaService,
        private eventoService: EventoService,
        private calendarioUtils: CalendarioUtils,

    ) {

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

        var perfisCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfisCognitivos = res);
        this.subscription.push(perfisCognitivos);

        if (this.perfisCognitivos.length == 0) {
            this.loadingPerfisCognitivos = true;
            lastValueFrom(this.perfilCognitivoService.getList('turma form'))
                .then(res => this.loadingPerfisCognitivos = false)
                .catch(res => this.loadingPerfisCognitivos = false);
        }

        this.loadingEventos = true;
        var request: CalendarioRequest = {
            intervaloDe: moment(new Date).startOf('week').toDate(),
            intervaloAte: moment(new Date).endOf('week').toDate()
        };
        lastValueFrom(this.eventoService.calendario(request))
            .then(res => {
                this.loadingEventos = false;
                this.eventos = res;
            })
            .catch(res => this.loadingEventos = false);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {
        this.loadPage();
    }

    loadPage() {
        var params = this.activatedRoute.params.subscribe(res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.service.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;

                        if (this.object.perfilCognitivo.length > 0) {
                            var perfilId = this.object.perfilCognitivo[0].id;
                            this.selectedPerfil = this.perfisCognitivos.filter(x => x.id == perfilId) ?? []
                        }

                        this.verificaDisponibilidade();
                    })
                    .catch(res => {
                        this.visible = false;
                        this.visibleChange();
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);
    }

    visibleChange() {
        if (!this.visible) {
            var route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    async verificaDisponibilidade() {
        var valid = true;

        if (!this.object.diaSemana || !this.object.horario) {
            return valid;
        }

        this.validaProfessores();
        this.validaSalaAulas();

        return valid
    }

    validaSalaAulas() {
        var data = moment(new Date).set({
            day: this.object.diaSemana,
            hours: this.object.horario.getHours(),
            minutes: this.object.horario.getMinutes(),
            seconds: 0
        }).toDate();
        this.salaAulas = validaSalaAulas(data, 120, this.salaAulas, this.eventos, this.object.id);
    }

    validaProfessores() {

        var data = moment().set({
            day: this.object.diaSemana,
            hours: this.object.horario.getHours(),
            minutes: this.object.horario.getMinutes(),
            seconds: 0
        }).toDate();
        this.professores = validaProfessores(data, 120, this.professores, this.eventos, this.object.id);

        if (this.object.professor_Id) {
            var e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any
            }
            this.professorChanged(e, this.professor_Id);
        }
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.professores.find(x => x.id == e.value);
        let mensagemErro: string | null = null;

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
        var salaAula = this.salaAulas.find(x => x.id == e.value);
        if (salaAula && salaAula.disponivel == false && salaAula.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuído para outra aula com a turma <b>${salaAula.disponivelEvent.turma ?? salaAula.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(salaAula.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        } else {
            model.control.setErrors({ indisponivel: null });
        }
        model.control.updateValueAndValidity();
    }

    perfilChange(model: NgModel) {
    // PRIMENG Multiselect já lida com quase todo o onChange
    this.object.perfilCognitivo = model.value
  }

    goToCalendario() {
        this.router.navigate(['turmas', 'calendario', this.crypto.encrypt(this.object.id)]);
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

   async sendConfirmation(form: NgForm, e: any) {
        var professorValido = await this.verificaDisponibilidade();
        if (form.invalid || professorValido == false) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e);
        }
        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: 'Tem certeza que deseja salvar os dados da turma?',
            header: 'Salvar dados',
            acceptLabel: 'Salvar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e)
            }
        })
    }

    async send(e: any) {


        this.loading = true;
        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    var semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",]
                    res.object.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + res.object.horario);
                    res.object.perfilCognitivoString = this.object.perfilCognitivo.map((x: PerfilCognitivo) => x.nome).join(', ')
                    res.object.diasDeAulaString = semana[this.object.diaSemana] + ' às ' + moment(res.object.horario).format('HH[h]mm')

                    if (res.object.numeroSala != 0 && res.object.andar != 0)
                        res.object.salaDeAulaString = `${res.object.numeroSala} ${res.object.andar} º andar`
                    else
                        res.object.salaDeAulaString = 'ONLINE'

                    this.toastrService.success(this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
                    insertOrReplace(this.service, res.object);
                    this.visible = false;
                    this.visibleChange();
                    // playSuccess();
                }
                else {
                    this.error = res.message;
                    this.showError('Erro', this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError('Erro', this.error, e);
            })
    }

    request() {
        if (this.isEditPage)
            return lastValueFrom(this.service.edit(this.object));
        return lastValueFrom(this.service.create(this.object));
    }
}
