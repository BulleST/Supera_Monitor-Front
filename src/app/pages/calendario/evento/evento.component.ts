import { Component, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Evento, EventoQueryParams, EventoTipo } from '../../../models/evento.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { Evento_Participacao_Professor } from '../../../models/evento-participacao-professor.model';
import { Aluno } from '../../../models/alunos.model';
import { Professor } from '../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../models/sala-aula.model';
import { Turma } from '../../../models/turma.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../services/sala-aula.service';
import { Crypto, getError } from '../../../utils';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/alunos.service';
import { EventoService } from '../../../services/evento.service';
import { TurmaService } from '../../../services/turma.service';
import moment from 'moment';
import { NgForm, NgModel } from '@angular/forms';
import { EventoAulaExtraRequest, EventoAulaRequest } from '../../../models/evento-aula.model';
import { EventoOficinaRequest } from '../../../models/evento-oficina.model';
import { EventoReuniaoRequest } from '../../../models/evento-reuniao.model';
import { MyMap } from '../../../utils/map';
import { PseudoEvento } from '../../../models/reposicao.model';
import { CalendarioRequest } from '../../../models/calendario.model';
import { ChecklistService } from '../../../services/checklist.service';
import { UserService } from '../../../services/user.service';
import { Popover } from 'primeng/popover';
import { RoteiroService } from '../../../services/roteiro.service';
import { Roteiro } from '../../../models/roteiro.model';
import { EventoAula0Request } from '../../../models/evento-aula-0.model';
import { EventoSuperacaoRequest } from '../../../models/evento-superacao.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { EventoChamadaRequest } from '../../../models/evento-chamada.model';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../utils/validacao';

@Component({
    selector: 'app-evento',
    standalone: false,
    templateUrl: './evento.component.html',
    styleUrl: './evento.component.css',
    providers: [ConfirmationService]
})
export class EventoComponent implements OnDestroy {
    evento: Evento = new Evento;
    queryParams: EventoQueryParams = new EventoQueryParams;

    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    tipoString = '';
    isChamadaPage = false;
    duracaoEvento = '';
    width = '1000px';
    loadingChecklist = false;
    tipo = EventoTipo;
    encryptedId = '';

    @ViewChild('popoverSelectedAluno') popoverSelectedAluno!: Popover;
    @ViewChild('popoverChecklist') popoverChecklist!: Popover;
    @ViewChildren('componentForm') componentForm!: QueryList<any>;


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

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private turmaService: TurmaService,
        private checklistService: ChecklistService,
        private userService: UserService,
        private roteiroService: RoteiroService,
    ) {

        var params = this.activatedRoute.snapshot.params;
        if (!params['evento_id'] || !params['evento_nome']
            || !['aula', 'aula-zero', 'aula', 'superacao', 'reuniao', 'oficina'].includes(params['evento_nome'])) {
            this.visible = false;
            this.visibleChange();
            return
        }

        this.encryptedId=params['evento_id'];
        var url = this.activatedRoute.url.subscribe(res => {
            this.isChamadaPage = res.find(x => x.path == 'chamada') ? true : false
        })
        this.subscription.push(url);

        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList())
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }

        var professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active == true));
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        var salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res.filter(x => x.active == true));
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true;
            lastValueFrom(this.salaAulaService.getList())
                .then(res => this.loadingSalaAulas = false)
                .catch(res => this.loadingSalaAulas = false);
        }

        var alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true));
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getListWithChecklist())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active == true));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }


        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res.filter(x => x.active == true));
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList())
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }

        var eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
        this.subscription.push(eventos);

        var evento = this.service.evento.subscribe(async res => {
            if (!res) {
                try {
                    var evento = JSON.parse(localStorage.getItem('evento') ?? '')
                    this.service.setEvento(evento)
                }
                catch (e) {
                    this.visible = false;
                    this.visibleChange();
                }
                return;
            }

            if (res) {
                this.evento = res;
                this.visible = true;
                this.verificaDisponibilidade();
                this.tipoString = this.getTipo(this.evento);
                var alunosEvento = this.evento.alunos.map(x => x.aluno_Id)
                this.alunos = this.alunos.filter(x => alunosEvento.includes(x.id));

                if (this.evento.roteiro_Id == PseudoEvento.EventoId) {
                    var roteiro = this.roteiros.find(x => moment(this.evento.data).isBetween(x.dataInicio, x.dataFim))
                    this.evento.roteiro_Id = roteiro?.id ?? PseudoEvento.EventoId;
                }

                var minutos = this.evento.duracaoMinutos % 60
                var horas = this.evento.duracaoMinutos / 60;
                var horaRedonda = (horas - Math.floor(horas)) == 0;

                this.duracaoEvento = horaRedonda ?
                    horas.toString().padStart(2, '0') + 'h' :
                    horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';
            }
        });
        this.subscription.push(evento);


        setTimeout(() => {
            if (!this.evento) {
                this.visible = false;
                this.visibleChange();
            }
        }, 1000);

    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            var route = this.isChamadaPage ? '../../../' : '../../'
            this.router.navigate([route], { relativeTo: this.activatedRoute });
            // this.service.setEvento(undefined)
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
    async verificaDisponibilidade() {
        var valid = true;

        this.loadingEventos = true;
        var request: CalendarioRequest = new CalendarioRequest;

        request.intervaloDe = moment(this.evento.data, 'YYYY-MM-DD').toDate();
        request.intervaloAte = moment(this.evento.data, 'YYYY-MM-DD').add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.calendario(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();
        this.validaAlunos();

        return valid

    }

  validaSalaAulas() {
        var data = this.evento.data;
        this.salaAulas = validaSalaAulas(data, this.evento.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        var data = this.evento.data;
        this.professores = validaProfessores(data, this.evento.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
    }

    validaAlunos() {
        var data = this.evento.data;
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
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
        return this.mensagemWhatsapp.getEventoTipo(e)
    }

    goToAluno(aluno: Evento_Participacao_Aluno) {
        this.router.navigate(['calendario', 'aluno', this.crypto.encrypt(aluno.aluno_Id)]);
    }


    async goToIniciarChamada(e: any) {
        this.isChamadaPage = true;
        this.evento.alunos
        .filter(x => x.active)
        .map(item => {
            item.presente = true;
            return item;
        });

        this.evento.professores
        .map(item => {
            item.presente = true;
            return item;
        });


        this.service.setEvento(this.evento)

        var route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula';
        switch (this.evento.evento_Tipo_Id) {
            case EventoTipo.Aula: route = 'aula'; break;
            case EventoTipo.AulaZero: route = 'aula-zero'; break;
            case EventoTipo.AulaExtra: route = 'aula'; break;
            case EventoTipo.Superacao: route = 'superacao'; break;
            case EventoTipo.Reuniao: route = 'reuniao'; break;
            case EventoTipo.Oficina: route = 'oficina'; break;
            default: route = 'aula'; break;
        }

        this.router.navigate(['calendario', route, 'chamada', this.encryptedId]);
    }

    finalizarConfirmation(e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja finalizar ${this.tipoString}? <br>Ao finalizar, não será possível alterar nenhuma informação.`,
            header: `Finalizar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptLabel: `Finalizar`,
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Ainda não',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.finalizar(e);
            },
        });
    }

    async finalizar(e: any) {
        this.loading = true;

        var response: RequestResponse = await lastValueFrom(this.request())
        if (response.success) {

            this.evento.id = response.object.id;
            this.evento.alunos = this.evento.alunos.map(item => {
                var participacao = response.object.alunos.find((x: Evento_Participacao_Aluno) => x.aluno_Id == item.aluno_Id) as Evento_Participacao_Aluno;
                item.id = participacao.id;
                item.evento_Id = participacao.evento_Id;
                item.presente = item.presente ?? false;
                return item;
            });
            this.evento.professores = this.evento.professores.map(item => {
                var participacao = response.object.professores.find((x: Evento_Participacao_Professor) => x.professor_Id == item.professor_Id) as Evento_Participacao_Professor;
                item.id = participacao.id;
                item.evento_Id = participacao.evento_Id;
                return item;
            })

            var request: EventoChamadaRequest = {
                evento_Id: this.evento.id,
                observacao: this.evento.observacao,
                alunos: this.evento.alunos.map(x => {
                    return {
                        participacao_Id: x.id,
                        observacao: x.observacao,
                        presente: x.presente,
                        apostila_Abaco_Id: x.apostila_Abaco_Id,
                        apostila_AH_Id: x.apostila_AH_Id,
                        numeroPaginaAbaco: x.numeroPaginaAbaco,
                        numeroPaginaAH: x.numeroPaginaAH,
                    }
                }),
                professores: []
            };

            if (this.evento.evento_Tipo_Id == EventoTipo.Reuniao) {
                request.professores = this.evento.professores.map(x => {
                    return {
                        participacao_Id: x.id,
                        observacao: x.observacao,
                        presente: x.presente,
                    }
                })
            }

            lastValueFrom(this.service.finalizar(request))
                .then(res => {
                    this.evento.finalizado = true;
                    this.loading = false;
                    this.visible = false;
                    this.visibleChange();
                    this.service.calendarioReload.emit(this.evento.id);
                    this.markChecklistAsDone();

                    this.toastrService.success(`${this.tipoString} finalizada com sucesso.`, 'Sucesso');
                })
                .catch(res => {
                    this.error = res.message;
                    this.showError('Erro', `Não foi possível finalizar ${this.tipoString}. \n ${getError(res)}`, e);
                    this.loading = false;
                })
        }
    }


    sendConfirmation(e: any, form: NgForm) {
        if (form.invalid) {
            return this.showError('OPA!', `Não foi possível salvar! \n Preencha os dados corretamente para continuar`, e);
        }
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja salvar?`,
            header: `Salvar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Salvar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.send(e);
            },
            reject: () => {
            }
        });

    }

    async send(e: any) {
        this.loading = true;
        lastValueFrom(this.request())
            .then(res => {
                this.service.calendarioReload.emit(res.object.id);
                this.evento.id = res.object.id;
                this.service.setEvento(this.evento);
                this.toastrService.success('Dados atualizados com sucesso.')
                this.router.navigate(['', this.crypto.encrypt(this.evento.id)], { relativeTo: this.activatedRoute, replaceUrl: true });
                this.loading = false;

            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível salvar dados. \n ${getError(res)}`, e)
            })
    }

    markChecklistAsDone() {
        this.componentForm.forEach(item => {
            item.onSave.emit(this.evento)
        })
    }

    request() {
        this.evento.data = new Date(this.evento.data)
        switch (this.evento.evento_Tipo_Id) {
            case EventoTipo.Aula: return this.requestAulaTurma();
            case EventoTipo.AulaZero: return this.requestAula0();
            case EventoTipo.AulaExtra: return this.requestAulaExtra();
            case EventoTipo.Superacao: return this.requestSuperacao();
            case EventoTipo.Reuniao: return this.requestReuniao();
            case EventoTipo.Oficina: return this.requestOficina();
            default: return this.requestAulaTurma();
        }
    }

    requestAulaTurma() {
        var request: EventoAulaRequest = MyMap(this.evento, new EventoAulaRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = this.evento.professor_Id ? [this.evento.professor_Id] : [];
        request.perfilCognitivo = this.evento.perfilCognitivo.map(x => x.id);

        if (this.evento.id == PseudoEvento.EventoId)
            return this.service.createAulaTurma(request);
        return this.service.editAulaTurma(request);
    }

    requestAula0() {
        var request = MyMap(this.evento, new EventoAula0Request);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = [this.evento.professor_Id];
        if (this.evento.id == PseudoEvento.EventoId)
            return this.service.createAula0(request);
        return this.service.editAula0(request);
    }

    requestAulaExtra() {
        var request = MyMap(this.evento, new EventoAulaExtraRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = [this.evento.professor_Id];
        if (this.evento.id == PseudoEvento.EventoId)
            return this.service.createAulaExtra(request);
        return this.service.editAulaExtra(request);
    }

    requestSuperacao() {
        var request = MyMap(this.evento, new EventoSuperacaoRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = [this.evento.professor_Id];
        if (this.evento.id == PseudoEvento.EventoId)
            return this.service.createSuperacao(request);
        return this.service.editSuperacao(request);
    }

    requestReuniao() {
        var request = MyMap(this.evento, new EventoReuniaoRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = this.evento.professores.map(x => x.professor_Id)
        if (this.evento.id == PseudoEvento.EventoId)
            return this.service.createReuniao(request);
        return this.service.editReuniao(request);
    }

    requestOficina() {
        var request = MyMap(this.evento, new EventoOficinaRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = [this.evento.professor_Id];
        if (this.evento.id == PseudoEvento.EventoId)
            return this.service.createOficina(request);
        return this.service.editOficina(request);
    }


}
