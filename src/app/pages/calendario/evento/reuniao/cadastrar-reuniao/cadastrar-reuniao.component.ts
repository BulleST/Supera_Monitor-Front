import { Component, OnDestroy, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoReuniaoRequest } from '../../../../../models/evento-reuniao.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError } from '../../../../../utils';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { EventoService } from '../../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { Evento } from '../../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { PickList, PickListMoveAllToTargetEvent } from 'primeng/picklist';
import { validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';

@Component({
    selector: 'app-cadastrar-reuniao',
    standalone: false,
    templateUrl: './cadastrar-reuniao.component.html',
    styleUrl: './cadastrar-reuniao.component.css',
    providers: [ConfirmationService]
})
export class CadastrarReuniaoComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoReuniaoRequest = new EventoReuniaoRequest;

    data: Date = undefined as unknown as Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();

    @ViewChild('picklist') picklist!: PickList;
    @ViewChild('_horario') _horario!: NgModel;
    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;

    professorSelected: Professor[] = [];
    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private service: EventoService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private toastrService: ToastrService,
    ) {
        this.object.descricao = 'Reunião';

        var professores = this.professorService.list.subscribe(res => this.professorSelected = res);
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


        var eventos = this.service.eventos.subscribe(res => this.eventos = res);
        this.subscription.push(eventos);

        var hoje = new Date;
        this.data = hoje;
        this.horario = hoje;
        this.horario.setHours(8, 0);
        this.verificaDisponibilidade();
        this.visible = true;

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }


    onMoveToSource(e: any) {
    }

    onMoveToTarget(e: PickListMoveAllToTargetEvent) {
        var item = e.items[0] as Professor;
        if (!item.disponivel) {
            this.showError('Educador indisponível', 'Você não pode mover um educador indisponível.', { target: this.picklist.el.nativeElement });
            var index = this.professorSelected.findIndex(x => x.id == item.id);
            if (index != -1) {
                this.professorSelected.splice(index, 1)
                this.professores.push(item);
            };
        }
    }

    onMoveAllToSource(e: any) {

    }

    onMoveAllToTarget(e: any) {
        var items = e.items as Professor[];
        if (items.find(x => !x.disponivel)) {
            this.showError('Educador indisponível', 'Você não pode mover educadores indisponíveis.', { target: this.picklist.el.nativeElement });
            this.professores = items.filter(x => !x.disponivel);
            this.professorSelected = items.filter(x => x.disponivel);
        }
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

    dataChanged() {
        if (this.data.getDay() == 1) {
            this.object.descricao = 'Reunião Geral';
            this.horario.setHours(12, 0, 0);
            this._horario.control.setValue(this.horario)
        }
        if (this.data.getDay() == 2) {
            this.object.descricao = 'Reunião Monitoramento';
            this.horario.setHours(12, 0, 0);
            this._horario.control.setValue(this.horario)
        }
        if (this.data.getDay() == 5) {
            this.object.descricao = 'Reunião Pedagógica';
            this.horario.setHours(12, 0, 0);
            this._horario.control.setValue(this.horario)
        }
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
        await lastValueFrom(this.service.calendario(request))
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
        return this.mensagemWhatsapp.getEventoTipo(e)
    }


    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (this.professorSelected.length < 2)
            return this.showError('Não foi possível salvar', 'Selecione pelo menos 2 educadores para salvar', e);

        this.object.professores = this.professorSelected.map(x => x.id);

        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar reunião',
            message: `Tem certeza que deseja agendar reunião para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`,
            acceptLabel: `Agendar reunião`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.send(e);
            }
        })

    }

    send(e: any) {
        this.loading = true;

        lastValueFrom(this.service.createReuniao(this.object))
            .then(res => {
                this.loading = false;
                this.visible = false
                this.visibleChange();
                this.toastrService.success('Reunião cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar reunião. <br> ${getError(res)}`, e);
            })

    }
}
