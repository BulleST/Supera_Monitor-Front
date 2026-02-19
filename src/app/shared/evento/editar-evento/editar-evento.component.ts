import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Professor } from '../../../models/professor.model';
import { SalaAula } from '../../../models/sala-aula.model';
import { Turma } from '../../../models/turma.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../services/sala-aula.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/alunos.service';
import { EventoService } from '../../../services/evento.service';
import { TurmaService } from '../../../services/turma.service';
import { CalendarioUtils, getError, showError, validaAlunos, validaProfessores, validaSalaAulas } from '../../../utils';
import { CalendarioRequest } from '../../../models/calendario.model';
import moment from 'moment';
import { NgForm } from '@angular/forms';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { FinalizarAulaZeroRequest, ParticipacaoAulaZeroModel } from '../../../models/evento-aula-0.model';
import { EventoChamadaRequest } from '../../../models/evento-chamada.model';
import { Roteiro } from '../../../models/roteiro.model';
import { EditarAulaView } from '../editar-aula/editar-aula.component';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { MonitoramentoService } from '../../../services/monitoramento.service';

@Component({
  selector: 'app-editar-evento',
  standalone: false,
  templateUrl: './editar-evento.component.html',
  styleUrl: './editar-evento.component.css',
    providers: [ConfirmationService],
})
export class EditarEventoComponent implements OnInit, OnDestroy {
    subscription: Subscription[] = [];
    instance: DynamicDialogComponent | undefined;
    loading = false;
    maximized = false;
    activeIndexAluno = 0;
    
    view = new EditarAulaView;
    evento: Evento = new Evento;
    duracaoEvento = '';
    tipoString = '';

    EventoTipo = EventoTipo;
    selectedAluno?: Evento_Participacao_Aluno;
    mensagensEnviadasAlunos: Evento_Participacao_Aluno[] = [];
    
    alunos: Aluno[] = [];
    loadingAlunos = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    @ViewChildren('componentForm') componentForm!: QueryList<any>;

    readonly = false;

    constructor(
            private dialogService: DialogService,
            private ref: DynamicDialogRef,
        private router: Router,
        private toastr: ToastrService,
        private calendarioUtils: CalendarioUtils,
        private confirmationService: ConfirmationService,
        private eventoService: EventoService,
                private jornadaService: JornadaSuperaService,
                private monitoramentoService: MonitoramentoService,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
    ) {
		this.instance = this.dialogService.getInstance(this.ref);
      
        let professores = this.professorService.list.subscribe(res => this.professores = res)
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res)
        this.subscription.push(salaAula)

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true;
            lastValueFrom(this.salaAulaService.getList())
                .then(res => this.loadingSalaAulas = false)
                .catch(res => this.loadingSalaAulas = false);
        }

        let alunos = this.alunoService.list.subscribe(res => this.alunos = res)
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res)
        this.subscription.push(turmas)

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }

        let eventos = this.eventoService.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
        this.subscription.push(eventos)

    }


	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
            this.evento = this.view.evento;
            this.getDuracaoEvento();
            this.tipoString = this.getTipo(this.evento);
            this.readonly = this.evento.finalizado || !this.evento.active
		}
	}

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    close() {
        this.ref.close();
    }

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}

    getDuracaoEvento() {
                let minutos = this.evento.duracaoMinutos % 60
                let horas = this.evento.duracaoMinutos / 60
                let horaRedonda = horas - Math.floor(horas) == 0

                this.duracaoEvento = horaRedonda
                    ? horas.toString().padStart(2, '0') + 'h'
                    : horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';}


    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
    }

    async verificaDisponibilidade() {

        let valid = true

        this.loadingEventos = true
        let request: CalendarioRequest = new CalendarioRequest

        let data = moment(this.evento.data).format('YYYY-MM-DD')

        request.intervaloDe = moment(data).toDate()
        request.intervaloAte = moment(data).add(1, 'day').toDate()

        this.loadingEventos = true
        await lastValueFrom(this.eventoService.getList(request))
            .then(res => (this.loadingEventos = false))
            .catch(res => (this.loadingEventos = false))

        this.validaProfessores()
        this.validaSalaAulas()
        this.validaAlunos()

        return valid
    }

    validaSalaAulas() {
        this.salaAulas = validaSalaAulas(
            this.evento.data,
            this.evento.duracaoMinutos,
            this.salaAulas,
            this.eventos,
            undefined,
            this.evento.id)
    }

    validaProfessores() {
        this.professores = validaProfessores(
            this.evento.data,
            this.evento.duracaoMinutos,
            this.professores,
            this.eventos,
            undefined,
            this.evento.id)
    }

    validaAlunos() {
        this.alunos = validaAlunos(
            this.evento.data,
            this.evento.duracaoMinutos,
            this.alunos,
            this.eventos,
            undefined,
            this.evento.id)
    }

    professorChanged(professor: Professor) {
        this.validaProfessores()
    }

    salaAulaChanged(salaAula: SalaAula) {
        this.validaSalaAulas()
    }

    alunoChanged(aluno: Aluno) {
        this.validaAlunos()
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    sendConfirmation(e: any, form: NgForm) {
        if (form.invalid) {
            return this.showError('OPA!', `Não foi possível salvar! <br> Preencha os dados corretamente para continuar`, e);
        }

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja salvar?`,
            header: `Salvar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Salvar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.send(e)
            },
            reject: () => { },
        })
    }

    send(e: any) {
        this.loading = true;
        this.requestCreateEdit()
            .then(res => {
                this.loading = false
                if (res.success) {
					this.jornadaService.onReload.emit();
                    this.monitoramentoService.onReload.emit();
                    this.eventoService.onReload.emit()
                    this.evento.id = res.object.id
                    this.eventoService.setEvento(this.evento)
                    this.toastr.success('Dados atualizados com sucesso.')
                }
            })
            .catch(res => {
                this.loading = false
                this.showError('OPA!', `Não foi possível salvar dados.`, e, getError(res))
            })
    }

    requestCreateEdit() {
        return this.calendarioUtils.request(this.evento);
    }

    finalizarConfirmation(e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja finalizar ${this.tipoString}? <br>Ao finalizar, não será possível alterar nenhuma informação.`,
            header: `Finalizar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptLabel: `Finalizar`,
            acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Ainda não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.finalizar(e)
            },
        })
    }

    async finalizar(e: any) {
        this.loading = true

        let response: RequestResponse = await this.requestCreateEdit()
            .catch(res => {
                this.loading = false;
                this.showError('Erro', 'Não foi possível salvar alterações', e);
                return res
            })

        if (response.success) {
            this.evento.id = response.object.id;
            let eventoResponse = response.object as Evento;

            this.requestFinalizar(eventoResponse)
                .then(res => {
                    this.loading = false;
                    if (res.success) {
                        this.evento = res.object;
                        this.jornadaService.onReload.emit();
                        this.monitoramentoService.onReload.emit();
                        this.eventoService.onReload.emit()
                        this.toastr.success(`${this.tipoString} finalizada com sucesso.`, 'Sucesso');

                        this.confirmationService.confirm({
                            target: e.target,
                            header: 'Sair?',
                            message: 'Deseja voltar à página anterior ou manter a visualização da aula?',
                            closeOnEscape: true,
                            acceptIcon: 'pi pi-arrow-right p-button-icon-right',
                            acceptLabel: `Sair`,
                            acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
                            accept: () => {
                                this.close();
                            },
                            rejectLabel: 'Não sair',
                            rejectIcon: '',
                            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                            reject: () => {

                            }
                        })


                    }
                    else {
                        this.toastr.error(`Não foi possível finalizar ${this.tipoString}.`, 'Erro');
                        this.showError('Erro', `Não foi possível finalizar ${this.tipoString}.`, e, res.message)
                    }
                })
                .catch(res => {
                    this.showError('Erro', `Não foi possível finalizar ${this.tipoString}.`, e, getError(res))
                    this.loading = false
                    console.error(res);
                })


        }
    }

    buildFinalizarAulaZeroRequest(): FinalizarAulaZeroRequest {
        const alunos: ParticipacaoAulaZeroModel[] = this.evento.alunos.map(aluno => {
            const participacao: ParticipacaoAulaZeroModel = {
                participacao_Id: aluno.id,
                presente: aluno.presente || false,
                aluno_Id: aluno.aluno_Id,
                turma_Id: aluno.presente ? aluno.turma_Id || -1 : -1,
                perfilCognitivo_Id: aluno.presente ? aluno.perfilCognitivo_Id || -1 : -1,
                apostila_Kit_Id: aluno.presente ? aluno.apostila_Kit_Id || -1 : -1,
            };
            return participacao;
        });

        return {
            evento_Id: this.evento.id,
            descricao: this.evento.descricao,
            observacao: this.evento.observacao,
            duracaoMinutos: this.evento.duracaoMinutos,
            sala_Id: this.evento.sala_Id,
            turma_Id: this.evento.turma_Id,
            roteiro_Id: this.evento.roteiro_Id,
            capacidadeMaximaAlunos: this.evento.capacidadeMaximaEvento,
            alunos: alunos,
            perfilCognitivo: this.evento.perfilCognitivo.map(x => x.id),
            professores: this.evento.professores.map(x => x.professor_Id),
        };
    }

    buildFinalizar(eventoResponse: Evento): EventoChamadaRequest {

        let request: EventoChamadaRequest = {
            evento_Id: this.evento.id,
            observacao: this.evento.observacao,
            alunos: this.evento.alunos.map(item => {
                let participacao = eventoResponse.alunos.find(x => x.aluno_Id == item.aluno_Id) as Evento_Participacao_Aluno;
                return {
                    participacao_Id: participacao.id,
                    observacao: item.observacao,
                    presente: item.presente,
                    apostila_Abaco_Id: item.apostilaAbacoObject?.id,
                    apostila_AH_Id: item.apostilaAHObject?.id,
                    numeroPaginaAbaco: item.numeroPaginaAbaco,
                    numeroPaginaAH: item.numeroPaginaAH,
                    reposicaoDe_Evento_Id: item.reposicaoDe_Evento_Id,
                }
            }),
            professores: eventoResponse.professores.map(item => {
                return {
                    participacao_Id: item.id,
                    observacao: item.observacao,
                    presente: item.presente ?? false
                }
            }),
        }

        if (this.evento.evento_Tipo_Id == EventoTipo.Reuniao) {
            request.professores = this.evento.professores.map(item => {
                return {
                    participacao_Id: item.id,
                    observacao: item.observacao,
                    presente: item.presente,
                }
            })
        }

        return request;
    }

    requestFinalizar(eventoResponse: Evento) {
        if (this.evento.evento_Tipo_Id == EventoTipo.AulaZero) {
            const request = this.buildFinalizarAulaZeroRequest();
            return lastValueFrom(this.eventoService.finalizarAulaZero(request));
        }
        else {
            const request = this.buildFinalizar(eventoResponse);
            return lastValueFrom(this.eventoService.finalizar(request))
        }
    }

}
