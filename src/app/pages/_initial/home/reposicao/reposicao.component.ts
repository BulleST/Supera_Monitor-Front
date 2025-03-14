import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarOptions, DatesSetArg, EventApi, EventClickArg } from '@fullcalendar/core';
import moment from 'moment';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { ReposicaoAluno, ReposicaoAlunoRequest } from '../../../../models/reposicao.model';
import { CalendarioAula, CalendarioRequest, loadingEvents } from '../../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventImpl } from '@fullcalendar/core/internal';
import { Aluno } from '../../../../models/alunos.model';
import { AulaService } from '../../../../services/aulas.service';
import { AlunoService } from '../../../../services/alunos.service';
import { TurmaService } from '../../../../services/turma.service';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { ProfessorService } from '../../../../services/professor.service';
import { ToastrService } from 'ngx-toastr';
import { AulaCreateRequest } from '../../../../models/aulas.model';
import { getError } from '../../../../utils';
import { Turma } from '../../../../models/turma.model';

@Component({
    selector: 'app-reposicao',
    standalone: false,
    templateUrl: './reposicao.component.html',
    styleUrl: './reposicao.component.css',
    providers: [ConfirmationService],
})
export class ReposicaoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = false;
    object: ReposicaoAluno = new ReposicaoAluno;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    legenda: { backgroundColor: string, label: string }[] = [];
    calendarioRequest: CalendarioRequest = new CalendarioRequest;

    turma: Turma = new Turma;
    aluno: Aluno = new Aluno;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    selectedAula?: EventImpl;
    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: CalendarioAula[] = [];


    calendarioOptions: CalendarOptions = {
        initialView: 'multiMonthYear',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
            multiMonthPlugin
        ],
        dayMaxEvents: 3,
        multiMonthMaxColumns: 1,// force a single column,
        views: {
            multiMonthFourMonth: {
                type: 'multiMonth',
                duration: { months: 4 }
            }
        },
        dayHeaders: true,
        weekends: false,
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        defaultAllDay: false,
        allDaySlot: false,
        customButtons: {
            atualizar: {
                text: 'atualizar',
                hint: 'atualizar',
                click: () => {
                    this.getCalendario(this.calendarioRequest, 'atualizar')
                }
            },

        },
        headerToolbar: {
            left: 'title',
            center: '',
            right: 'atualizar today prev next'
        },

        buttonText: {
            today: 'hoje',
            year: 'meses',
            month: 'mês',
            week: 'semana',
            day: 'dia',
            list: 'lista'
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        lazyFetching: true,
        datesSet: this.datesSet.bind(this),
        eventClick: this.eventClick.bind(this),
        eventsSet: this.events.bind(this),
    }


    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: AulaService,
        private changeDetector: ChangeDetectorRef,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private professorService: ProfessorService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {

        var list = this.service.list.subscribe(res => this.calendarioList = res);
        this.subscription.push(list);

        this.activatedRoute.queryParams.subscribe(async res => {
            this.object = {
                aluno: res['aluno'],
                aluno_Id: res['aluno_Id'],
                source_Aula_Id: res['source_Aula_Id'],
                source_Data: res['source_Data'],
                source_Turma_Id: res['source_Turma_Id'],
                source_Turma: res['source_Turma'],
                aluno_PerfilCognitivo_Id: res['aluno_PerfilCognitivo_Id'],
                aluno_PerfilCognitivo: res['aluno_PerfilCognitivo'],
                source_Professor_Id: res['source_Professor_Id'],
                source_Professor: res['source_Professor'],
            } as ReposicaoAluno
      

            this.visible = true;
            this.calendarioRequest.perfilCognitivo_Id = this.object.aluno_PerfilCognitivo_Id;

            this.alunoService.get(this.object.aluno_Id)
                .catch(res => {
                    this.visible = false;
                    this.visibleChange();
                });

            this.turmaService.get(this.object.source_Turma_Id)
                .then(res => this.turma = res)
                .catch(res => {
                    this.visible = false;
                    this.visibleChange();
                });

            this.professorService.get(this.object.source_Professor_Id)
                .catch(res => {
                    this.visible = false;
                    this.visibleChange();
                });

            lastValueFrom(this.perfilCognitivoService.getList())
                .then(res => {
                    if (!res.find(x => x.id == this.object.aluno_PerfilCognitivo_Id)) {
                        this.toastrService.error('Perfil cognitivo não encontrado.');
                        this.visible = false;
                        this.visibleChange();
                    }
                })
                .catch(res => {
                    this.visible = false;
                    this.visibleChange();
                });


        })

        this.loadAluno();

    }


    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            var route = ['../../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    async loadAluno() {
        this.loading = true;
        if (this.alunoService.list.value.length == 0) {
            await lastValueFrom(this.alunoService.getList());
        }
        this.aluno = await this.alunoService.get(this.object.aluno_Id);
        if (!this.aluno) {
            this.visible = false;
            this.visibleChange();
        }
        this.loading = false;
    }

    async getCalendario(request: CalendarioRequest, where: string) {
        this.loading = true;
        await lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {

                calendarioList
                    .filter(x => x.alunos.length < x.capacidadeMaximaAlunos && x.data >= new Date)
                    .forEach(aula => {
                        var f = moment(aula.data).format('DD/MM/YYYY HH:mm');
                        var index = this.calendarioList.findIndex(x => x.turma_Id == aula.turma_Id && moment(x.data).format('DD/MM/YYYY HH:mm') == f);
                        if (index == -1) {
                            this.calendarioList.push(aula);
                        }
                        else {
                            this.calendarioList.splice(index, 1, aula);
                        }

                    })
                this.calendarioList.sort((x, y) => (x.data > y.data ? -1 : 1));

                this.setCalendario();
                this.setLegenda(this.calendarioList);
            })
            .catch(res => {
                this.loading = false;
                this.toastrService.error(`Não foi possível carregar calendário.\n ${getError(res)}`);
            })

    }

    setCalendario() {
        this.loading = true;
        this.calendarioOptions.events = this.calendarioList.map(item => {
            var event = {
                id: this.eventRamdomId(),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                title: item.descricao,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                data: item,
            }
            return event;
        });

        this.loading = false;
    }

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
    }

    eventRamdomId() {
        let length = 5;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    setLegenda(c: CalendarioAula[]) {
        this.legenda = [];
        c.forEach(item => {
            if (!this.legenda.find(x => x.backgroundColor == item.corLegenda && x.label == item.professor)) {
                this.legenda.push(
                    {
                        label: item.professor,
                        backgroundColor: item.corLegenda,
                    }
                )
            }
        })
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
    }
    async datesSet(arg: DatesSetArg) {
        let _loadingEvents: any[] = [];
        var month = arg.view.currentStart.getMonth();
        
        loadingEvents.forEach(event => {

            var start = new Date(event.start);
            var week = Math.ceil((start.getDate() - 1 - start.getDay()) / 7)
            
            for (let i = 5; i > 1; i--) {                
                var newDate =  moment(start).add(week - i, 'weeks').set('months', month).format('YYYY-MM-DD');
                event.start = newDate + event.start.substring(10)
                event.end = newDate + event.end.substring(10)
                _loadingEvents.push(JSON.parse(JSON.stringify(event)))
            }
        })

        this.calendarioOptions.events = _loadingEvents;
        this.calendarioRequest.intervaloDe = arg.view.currentStart;
        this.calendarioRequest.intervaloAte = arg.view.currentEnd;

        this.getCalendario(this.calendarioRequest, 'datesSet');
    }


    eventClick(e: EventClickArg) {
        this.confirmationService.confirm({
            target: e.jsEvent.target ?? undefined,
            message: `Selecionar aula do dia <b class="text-primary-500">${moment(e.event.start).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${e.event.extendedProps['data'].turma}</b> com o professor <b>${e.event.extendedProps['data'].professor}</b>?`,
            header: 'Selecionar aula',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Selecionar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.selectedAula = e.event;
            },
            reject: () => {
            }
        });
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

    confirmaReposicao(e: any) {

        var target = this.selectedAula!.extendedProps['data'] as CalendarioAula;

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja marcar reposição do aluno <b>${this.object.aluno} </b> do dia <b>${moment(this.object.source_Data).format('DD/MM/YYYY [às] HH[h]mm')}</b> para o dia <b class="text-primary-500">${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${target.descricao}</b> com o professor <b>${target.professor}</b>?`,
            header: 'Agendar reposição',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: () => {
                this.send(target, e)
            },
            reject: () => {
            }
        });
    }


    async send(target: CalendarioAula, e: any) {

        this.loading = true;

        var reposicaoRequest = new ReposicaoAlunoRequest;
        reposicaoRequest.aluno_Id = this.object.aluno_Id;

        // Se a aula source não existir, cria a aula
        if (this.object.source_Aula_Id == -1) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: this.object.source_Sala_Id,
                turma_Id: this.object.source_Turma_Id ?? 0,
                data: moment(this.object.source_Data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: this.object.source_Professor_Id,
                observacao: '',
                perfilCognitivo: this.turma.perfilCognitivo, 
            }
            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => reposicaoRequest.source_Aula_Id = res.object.aula_Id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula source não foi inserida). \n ${getError(res)}`, e));
        }

        // Se a aula target não existir, cria a aula
        if (!target.aula_Id) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: target.sala_Id,
                professor_Id: target.professor_Id,
                turma_Id: target.turma_Id ?? 0,
                data: moment(target.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: '',
                perfilCognitivo: target.perfilCognitivo, 
            }
            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => reposicaoRequest.dest_Aula_Id = res.object.aula_Id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula target não foi inserida). \n ${getError(res)}`, e));

        }

        await lastValueFrom(this.alunoService.reposicao(reposicaoRequest))
            .then(res => {
                this.loading = false;
                this.selectedAula = undefined;

                this.visible = false;
                this.visibleChange();
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
                this.service.calendarioReload.next(true);
            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n ${getError(res)}`, e)
            })
    }


}

