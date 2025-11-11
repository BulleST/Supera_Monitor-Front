import { Input, signal, Component, OnChanges, OnDestroy, ViewChild, SimpleChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core'

import moment from 'moment'
import { lastValueFrom, Subscription } from 'rxjs'
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../../utils'

import dayGridPlugin from '@fullcalendar/daygrid'
import { EventImpl } from '@fullcalendar/core/internal'
import { FullCalendarComponent } from '@fullcalendar/angular'
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core'

import { Popover } from 'primeng/popover'
import { ConfirmationService } from 'primeng/api'
import { Aluno } from '../../../../models/alunos.model'
import { Feriado } from '../../../../models/feriado.model'
import { Professor } from '../../../../models/professor.model'
import { PrimeiraAulaRequest, PseudoEvento } from '../../../../models/reposicao.model'
import { EventoService } from '../../../../services/evento.service'
import { EventoTipo, Evento } from '../../../../models/evento.model'
import { CalendarioRequest } from '../../../../models/calendario.model'
import { ProfessorService } from '../../../../services/professor.service'
import { RequestResponse } from '../../../../helpers/request-response.interface'
import { ToastrService } from 'ngx-toastr'
import { AlunoService } from '../../../../services/alunos.service'
import { Aluno_CheckList_Item } from '../../../../models/checklist.model'
import { ChecklistService } from '../../../../services/checklist.service'
import { AccountService } from '../../../../services/account.service'
import { SalaAndar } from '../../../../models/sala-aula.model'
import { faThinkPeaks } from '@fortawesome/free-brands-svg-icons'

@Component({
    selector: 'app-calendario-aluno-options',
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    standalone: false,
    providers: [ConfirmationService],
})
export class CalendarioAlunoOptionsComponent implements OnChanges, OnDestroy {
    @Input() aluno!: Aluno;
    @Output() onClose = new EventEmitter<boolean>();

    subscription: Subscription[] = [];
    loading = false;

    legenda: { corLegenda: string; label: string }[] = [];
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedEvento?: Evento = undefined;
    selectedAula?: EventImpl;
    professores: Professor[] = [];
    loadingProfessores = false;
    restricaoCheck = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano = new Date().getFullYear();
    currentTitle = '';
    EventoTipo = EventoTipo;
    data: Date = moment().toDate();

    calendarVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    eventos: Evento[] = [];
    calendarioRequest: CalendarioRequest = new CalendarioRequest();
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [dayGridPlugin],
        dayMaxEvents: 3,
        dayHeaders: true,
        weekends: true,
        hiddenDays: [0],
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        headerToolbar: {
            left: '',
            center: '',
            right: '',
        },
        visibleRange: {
            start: new Date,
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        eventsSet: this.events.bind(this),
        datesSet: (arg: DatesSetArg) => {
            this.datesSet(arg);
        },
    };

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private service: EventoService,
        private alunoService: AlunoService,
        private calendarioUtils: CalendarioUtils,
        private professorService: ProfessorService,
        private toastrService: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private checklistService: ChecklistService,
        private accountService: AccountService,
    ) {
        let professores = this.professorService.list.subscribe((res) => {
            this.professores = res
            this.setLegenda()
        })
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadingProfessores = true
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false)
        }

        let feriados = this.service.feriados.subscribe(res => this.feriados = res);
        this.subscription.push(feriados)
    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    async ngOnChanges(changes: SimpleChanges) {

        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;

            if (!this.fullCalendar) {
                // Fazer o compilador do JS calar a boca no primeiro render... poha
                return
            }

            if (!this.aluno) {
                this.fullCalendar.getApi().removeAllEvents()
                return
            }

            this.fullCalendar.getApi().today()

            if (this.aluno.id) {
                this.calendarioRequest.intervaloDe = moment().startOf('month').toDate();
                this.calendarioRequest.intervaloAte = moment().endOf('month').toDate();
                this.calendarioRequest.perfil_Cognitivo_Id = this.aluno!.perfilCognitivo_Id;

                this.update('')
            }
        }
    }

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage);
    }


    async update(where: string) {
        this.loading = true;
        await this.loadFeriados()
        await this.getCalendario()
        this.setCalendario()
        this.loading = false;
    }

    prev() {
        this.fullCalendar.getApi().prev()
    }

    next() {
        this.fullCalendar.getApi().next()
    }

    async today() {
        this.fullCalendar.getApi().today()

        this.calendarioRequest.intervaloDe = moment().startOf('week').toDate()
        this.calendarioRequest.intervaloAte = moment().endOf('week').toDate()

        await this.getCalendario()
        this.setCalendario()
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events)
        this.changeDetector.detectChanges()
    }

    getCalendario() {
        return lastValueFrom(this.service.getList(this.calendarioRequest))
            .then(list => {
                this.eventos = list.filter(evento => {
                    const eventoAtivo = evento.active;
                    const ehAula = [EventoTipo.Aula, EventoTipo.TurmaExtra].includes(evento.evento_Tipo_Id);
                    const ehPerfilCompativel = !this.aluno.perfilCognitivo_Id || evento.perfilCognitivo.map(x => x.id).includes(this.aluno.perfilCognitivo_Id)
                    const eventoTemVaga = evento.vagasDisponiveisEvento > 0;
                    const participacao = evento.alunos.find(x => x.aluno_Id == this.aluno.id);
                    const participacaoAtiva = participacao?.active;
                    const salaValida = !this.aluno.restricaoMobilidade || (this.aluno.restricaoMobilidade && evento.andar == SalaAndar.Terreo);

                    let final = eventoAtivo
                        && ehAula
                        && ehPerfilCompativel
                        && ((eventoTemVaga && !participacaoAtiva) || participacaoAtiva)
                        && salaValida;

                    return final;
                })
            })
    }

    setCalendario() {
        let calendar = this.fullCalendar.getApi();
        if (calendar) {
            calendar.removeAllEvents()
        }

        let feriadosDates = this.feriados.map((x) => moment(x.date).format('YYYY-MM-DD'))
        let eventos = this.eventos.filter((x) => [EventoTipo.Aula, EventoTipo.TurmaExtra].includes(x.evento_Tipo_Id)
            && x.active == true
            && feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false)

        let events = eventos.map((item) => {
            let style = this.calendarioUtils.getEventStyles(item);
            let id = 'event-' + this.calendarioUtils.eventRandomId()

            let event: any = {
                id: id,
                backgroundColor: style.backgroundColor,
                borderColor: style.borderColor,
                textColor: style.textColor,
                title: item.turma ?? item.descricao,
                start: moment(item.data).toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }
            return event
        })

        this.feriados.forEach((item) => {
            let event = {
                id: this.calendarioUtils.eventRandomId(),
                textColor: 'white',
                backgroundColor: 'red',
                borderColor: 'red',
                title: item.name,
                start: moment(item.date).toDate(),
                end: moment(item.date).toDate(),
                allDay: true,
                extendedProps: {
                    id: PseudoEvento.EventoId,
                    data: moment(item.date).toDate(),
                    descricao: item.name,
                    evento_Tipo_Id: EventoTipo.Feriado,
                    ...item,
                },
            }
            events.push(event)
        })
        this.calendarioOptions.events = events
        this.fullCalendar.getApi().updateSize()
    }

    setLegenda() {
        this.legenda = this.professores.map((professor) => ({ label: professor.nome, corLegenda: professor.corLegenda }))
    }

    async loadFeriados() {
        this.loadingFeriados = true
        await lastValueFrom(this.service.getFeriados(this.ano))
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false)
    }

    async datesSet(arg: DatesSetArg) {
        this.currentTitle = moment(arg.view.currentStart)
            .locale('pt')
            .format('MMMM [de] YYYY')
        this.currentTitle =
            this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)

        this.calendarioRequest.intervaloDe = arg.view.currentStart
        this.calendarioRequest.intervaloAte = arg.view.currentEnd

        let ano = moment(this.data).year();
        let temFeriado = this.feriados.filter(x => moment(x.date).year() == ano);

        if (!temFeriado.length || !this.feriados.length) {
            this.ano = ano;
            await this.loadFeriados()
        }

        await this.getCalendario()
        this.setCalendario()
    }

    sendConfirmation(evento: Evento, e: any): void {
        this.selectedEvento = evento
        this.restricaoCheck = false
        this.confirmationService.confirm({
            key: 'confirmarPrimeiraAula',
            header: 'Confirmar agendamento',
            icon: 'pi pi-calendar text-green-500',
            acceptLabel: `Concluir`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: false,
            accept: () => {
                this.send(e)
            },
        })
    }

    async send(e: any) {
        this.loading = true


        if (!this.aluno) {
            return this.showError('Erro', `Selecione um aluno.`, e)
        }

        if (!this.selectedEvento) {
            return this.showError('Erro', `Selecione uma aula`, e)
        }

        let request: PrimeiraAulaRequest = {
            aluno_Id: this.aluno.id,
            evento_Id: this.selectedEvento.id
        }

        let response: RequestResponse = { success: true, message: '', object: undefined };

        // Se a aula target não existir, cria a aula
        if (request.evento_Id == PseudoEvento.EventoId) {
            response = await this.calendarioUtils.requestAulaTurma(this.selectedEvento)
                            .catch(res => {
                                this.loading = false;
                                this.showError('Erro', `Primeira aula não foi agendada. Ocorreu um erro ao agendar primeira aula.`, e, res.message)
                                return  res
                            })
                            
            this.loading = false;
            if (response.success) {
                request.evento_Id = response.object.id;
            }
            else {
                return;
            }

        }

        lastValueFrom(this.service.primeiraAula(request))
            .then(response => {
                if (response.success) {
                    this.service.calendarioReload.emit(request.evento_Id);
                    this.toastrService.success(response.message);
                    this.markChecklistAsDone();

                    if (this.aluno?.celular) {
                        this.sendMensagemAluno(e, this.selectedEvento as Evento);
                    } else {
                        this.onClose.emit(true);
                    }

                } else {
                    this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, response.message)
                }

            })
            .catch(res => {
                this.loading = false;
                this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, res.message)
            })
    }

    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }


    sendMensagemAluno(e: any, evento: Evento) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Primeira aula agendada com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptIcon: 'pi pi-whatsapp',
            rejectLabel: 'Não enviar',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded p-button-success',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.onClose.emit(true);
                let object = this.mensagemWhatsapp.enviarMensagemAgendamento(this.aluno.nome, this.aluno.celular, evento)
                window.open(object.link, '_target')
                this.mensagemWhatsapp.copiarMensagem(object.mensagem)
            },
            reject: () => {
                this.onClose.emit(true);
            },
        })
    }

    async markChecklistAsDone() {
        // const aluno = await lastValueFrom(this.alunoService.get(this.aluno.id));


        // // Agendamento na 1ª aula 
        // if (aluno) {
        //     const id = 38;
        //     const alunoChecklist = aluno.alunoChecklist.find((x) => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
        //     const data = moment(this.selectedEvento!.data).format('DD/MM/YY [às] HH[h]mm');
        //     const professor = this.selectedEvento!.professor;
        //     const account = this.accountService.accountValue?.name;
        //     const dataFinalizado = moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm');

        //     if (alunoChecklist && !alunoChecklist.finalizado) {
        //         let mensagem = `Aula 0 agendada para o dia ${data} com o educador(a) ${professor}.<br> Agendamento realizado por ${account} no dia ${dataFinalizado}`;
        //         if (alunoChecklist && !alunoChecklist.finalizado) {
        //             lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem));
        //         }
        //     }
        // }
    }

}
