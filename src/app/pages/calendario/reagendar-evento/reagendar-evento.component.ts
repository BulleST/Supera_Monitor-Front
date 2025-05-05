import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Evento, EventoQueryParams, EventoReagendamentoRequest, EventoTipo } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Aluno } from '../../../models/alunos.model';
import { SalaAula, SalaAulaId } from '../../../models/sala-aula.model';
import { Professor } from '../../../models/professor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError } from '../../../utils';
import { SalaAulaService } from '../../../services/sala-aula.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/alunos.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { CalendarioRequest } from '../../../models/calendario.model';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { MyMap } from '../../../utils/map';
import { TurmaService } from '../../../services/turma.service';
import { Turma } from '../../../models/turma.model';
import { EventoAulaRequest } from '../../../models/evento-aula.model';
import { EventoOficinaRequest } from '../../../models/evento-oficina.model';
import { EventoReuniaoRequest } from '../../../models/evento-reuniao.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { PseudoEvento } from '../../../models/reposicao.model';
import { AccountService } from '../../../services/account.service';
import { ChecklistService } from '../../../services/checklist.service';
import { Aluno_CheckList_Item } from '../../../models/checklist.model';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../utils/validacao';
import { Feriado } from '../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';

@Component({
    selector: 'app-reagendar-evento',
    standalone: false,
    templateUrl: './reagendar-evento.component.html',
    styleUrl: './reagendar-evento.component.css',
    providers: [ConfirmationService]
})
export class ReagendarEventoComponent implements OnDestroy {
    observacao = '';
    evento: Evento = new Evento;
    SalaAulaId = SalaAulaId;

    data: Date = undefined as unknown as Date;
    horario: Date = undefined as unknown as Date;
    minDate = new Date();
    maxDate = new Date();
    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;

    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    tipoString = '';
    EventoTipo = EventoTipo;
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

    feriados: Feriado[] = [];
    loadingFeriados = false;
    feriadoDates: Date[] = [];
    ano: number = new Date().getFullYear();


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
        private accountService: AccountService,
        private checklistService: ChecklistService,
    ) {

        var salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res.filter(x => x.active == true));
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true;
            lastValueFrom(this.salaAulaService.getList())
                .then(res => this.loadingSalaAulas = false)
                .catch(res => this.loadingSalaAulas = false);
        }

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active == true));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }

        this.loadFeriados();

        var eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
        this.subscription.push(eventos);

        var evento = this.service.evento.subscribe(res => {
            console.log('evento', res)
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
                this.tipoString = this.getTipo(this.evento);

                this.maxDate = moment(this.evento.data).add(1, 'month').toDate();
                this.verificaDisponibilidade();
                this.visible = true;
                this.setAlunosProfessores();
            }
        });
        this.subscription.push(evento);

        this.activatedRoute.params.subscribe(res => {
            if (!res['evento_id'] || !res['evento_nome']
                || !['aula', 'aula-zero', 'aula', 'superacao', 'reuniao', 'oficina'].includes(res['evento_nome'])) {
                this.visible = false;
                this.visibleChange();
            }
        });

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
            this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
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

    async setAlunosProfessores() {
        this.professores = this.professorService.list.value;
        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            this.professores = await lastValueFrom(this.professorService.getList())
            this.loadingProfessores = false
        }

        this.alunos = this.alunoService.list.value;
        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            this.alunos = await lastValueFrom(this.alunoService.getList())
            this.loadingAlunos = false;
        }

        if (this.alunos.length > 0) {
            var alunosIds = this.evento.alunos.map(x => x.aluno_Id);
            this.alunos = this.alunos.filter(x => alunosIds.includes(x.id) && x.active == true);
        }

        if (this.professores.length > 0) {
            var professoresIds = this.evento.professores.map(x => x.professor_Id)
            this.professores = this.professores.filter(x => professoresIds.includes(x.id) && x.active == true);
        }
    }

    async verificaDisponibilidade() {
        var valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }

        this.loadingEventos = true;
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes());

        var request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

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
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.evento.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.evento.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
    }

    validaAlunos() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
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

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }


    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados()
        }
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        await lastValueFrom(this.service.getFeriados(this.ano))
        .then(res => {
            this.feriados = res;
            this.loadingFeriados = false;
            var feriadoDates = res.map(x => moment(x.date, 'YYYY-MM-DD').toDate());
            this.feriadoDates.push(...feriadoDates);
        })
        .catch(res => this.loadingFeriados = false);
    }

    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.evento.alunos.sort((x, y) => x.aluno < y.aluno ? -1 : 1);
        this.confirmationService.confirm({
            key: 'enviarMensagemReagendamento',
            message: `Reagendamento concluído com sucesso. <br> Clique nos alunos que participarão da aula para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Concluir`,
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
            accept: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }

    removerAlunoLista(aluno: Evento_Participacao_Aluno, e: any) {
        if (e.which == 2) {
            var index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
            if (index != -1)
                this.mensagensEnviadasAlunos.splice(index, 1);
        }
    }

    enviarMensagemReagendamento(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagemReagendamento(nome, celular, this.evento);
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!);
    }


    async sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        var professoresIndisponiveis = this.professores.filter(x => x.disponivel == false);
        var alunosIndisponiveis = this.alunos.filter(x => x.disponivel == false);

        if (professoresIndisponiveis.length > 0) {
            var result = await new Promise<boolean>((resolve, reject) => {
                this.confirmationService.confirm({
                    target: e.target,
                    header: `Professores indisponíveis`,
                    message: `Os seguintes professores estão indisponíveis nessa data.
                                 ${professoresIndisponiveis.map(x => {
                        return `<div class="font-bold mb-1 flex align-items-center ">
                                                 <span class="w-1rem h-1rem border-circle flex mr-2" style="background-color: ${x.corLegenda}; border-color: ${x.corLegenda};"></span>
                                                 <span class="mr-2">${x.nome}</span>
                                             </div>`;
                    })}
                                 Deseja continuar mesmo assim? `,
                    acceptLabel: `Continuar`,
                    acceptIcon: 'pi pi-check',
                    acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
                    rejectLabel: 'Escolher outra data',
                    rejectButtonStyleClass: 'p-button-text p-button-sm',
                    accept: () => resolve(true),
                    reject: () => reject(false),
                })
            })

            if (!result) {
                return;
            }
        }

        if (alunosIndisponiveis.length > 0) {
            var result = await new Promise<boolean>((resolve, reject) => {
                this.confirmationService.confirm({
                    target: e.target,
                    header: `Alunos indisponíveis`,
                    message: `Os seguintes alunos estão indisponíveis nessa data.
                                 ${alunosIndisponiveis.map(x => {
                        return `<p class="font-bold mb-1">${x.nome}</p>`;
                    })}
                                 Deseja continuar mesmo assim? 
                                 `,
                    acceptLabel: `Continuar`,
                    acceptIcon: 'pi pi-check',
                    acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
                    rejectLabel: 'Escolher outra data',
                    rejectButtonStyleClass: 'p-button-text p-button-sm',
                    accept: () => resolve(true),
                    reject: () => reject(false),
                })
            })

            if (!result) {
                return;
            }
        }

        this.confirmationService.confirm({
            target: e.target,
            header: `Reagendar ${this.tipoString}`,
            message: `Tem certeza que deseja reagendar a ${this.tipoString} para o dia ${moment(this.data).format('DD/MM')} às ${moment(this.horario).format('HH[h]mm')}?.`,
            acceptLabel: `Reagendar ${this.tipoString}`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.send(e);
            }
        })

    }

    async send(e: any) {
        this.loading = true;

        var response: RequestResponse = { success: true, message: '', object: null };

        if (this.evento.id == PseudoEvento.EventoId) {
            await this.request()
                .then(res => {
                    this.evento.id = res.object.id;
                    response = res;
                })
                .catch(res => this.showError('Erro', getError(res), e))
        }
        if (response.success) {
            
            this.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);

            var request: EventoReagendamentoRequest = {
                evento_Id: this.evento.id,
                sala_Id: this.evento.sala_Id,
                data: new Date(this.data),
                observacao: this.observacao
            }

            lastValueFrom(this.service.reagendar(request))
                .then(res => {
                    this.loading = false;
                    this.service.calendarioReload.emit(res.object.id);
                    this.updateCheklistAlunos();

                    if (this.evento.alunos.length > 0)
                        this.sendMensagemAlunos();
                    else {
                        this.visible = false;
                        this.visibleChange();
                    }
                    this.toastrService.success('Reagendamento realizado com sucesso.', 'Reagendamento finalizado');
                })
                .catch(res => {
                    this.loading = false;
                    this.showError('Reagendamento falhou', `Não foi possível reagendar ${this.tipoString}. <br> ${getError(res)}`, e);
                })
        }

    }


    updateCheklistAlunos() {
        var tipo = this.tipoString[0].toUpperCase() + this.tipoString.substring(1);


        this.alunos.forEach(item => {
            var checklist_Item_Id = 0;
            var mensagem = '';
            var alunoChecklist!: Aluno_CheckList_Item;

            // Agendar Aula 0
            if (this.evento.evento_Tipo_Id == EventoTipo.AulaZero) {
                alunoChecklist = item.alunoChecklist.find(x => x.checklist_Item_Id == 31) as Aluno_CheckList_Item;
            } 
            // Agendar Superacao
            else if (this.evento.evento_Tipo_Id == EventoTipo.Superacao) {
                alunoChecklist = item.alunoChecklist.find(x => x.checklist_Item_Id == 22) as Aluno_CheckList_Item;
            } 
            // Agendar 1/2ª Oficina
            else if (this.evento.evento_Tipo_Id == EventoTipo.Oficina) {
                alunoChecklist = item.alunoChecklist.find(x => x.checklist_Item_Id == 12 || x.checklist_Item_Id == 23) as Aluno_CheckList_Item;
            }

            console.log('alunoChecklist', alunoChecklist)

            if (alunoChecklist) {
                mensagem = alunoChecklist.observacoes + `\n\n`;
                mensagem += `${tipo} reagendada para o dia ${moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm')}.
                            \n Reagendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')}`
                
                            alunoChecklist.observacoes = mensagem;
                if (checklist_Item_Id && mensagem) {
                    lastValueFrom(this.checklistService.markAsDone(checklist_Item_Id, mensagem))
                }
            }
        })

    }

    request() {
        this.evento.data = new Date(this.evento.data)
        switch (this.evento.evento_Tipo_Id) {
            // case EventoTipo.AulaZero: return this.requestAula0();
            // case EventoTipo.AulaExtra: return this.requestAulaExtra();
            // case EventoTipo.Superacao: return this.requestSuperacao();
            case EventoTipo.Aula: return this.requestAulaTurma();
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
            return lastValueFrom(this.service.createAulaTurma(request));
        return lastValueFrom(this.service.editAulaTurma(request));
    }

    requestReuniao() {
        var request = MyMap(this.evento, new EventoReuniaoRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = this.evento.professores.map(x => x.professor_Id)
        request.sala_Id = 14;
        if (this.evento.id == PseudoEvento.EventoId)
            return lastValueFrom(this.service.createReuniao(request));
        return lastValueFrom(this.service.editReuniao(request));
    }

    requestOficina() {
        var request = MyMap(this.evento, new EventoOficinaRequest);
        request.alunos = this.evento.alunos.map(x => x.aluno_Id);
        request.professores = [this.evento.professor_Id];
        if (this.evento.id == PseudoEvento.EventoId)
            return lastValueFrom(this.service.createOficina(request));
        return lastValueFrom(this.service.editOficina(request));
    }

    // requestAula0() {
    //     var request = MyMap(this.evento, new EventoAula0Request);
    //     request.alunos = this.evento.alunos.map(x => x.aluno_Id);
    //     request.professores = [this.evento.professor_Id];
    //     if (this.evento.id == PseudoEvento.EventoId)
    //         return lastValueFrom(this.service.createAula0(request));
    //     return lastValueFrom(this.service.editAula0(request));
    // }

    // requestAulaExtra() {
    //     var request = MyMap(this.evento, new EventoAulaExtraRequest);
    //     request.alunos = this.evento.alunos.map(x => x.aluno_Id);
    //     request.professores = [this.evento.professor_Id];
    //     if (this.evento.id == PseudoEvento.EventoId)
    //         return lastValueFrom(this.service.createAulaExtra(request));
    //     return lastValueFrom(this.service.editAulaExtra(request));
    // }

    // requestSuperacao() {
    //     var request = MyMap(this.evento, new EventoSuperacaoRequest);
    //     request.alunos = this.evento.alunos.map(x => x.aluno_Id);
    //     request.professores = [this.evento.professor_Id];
    //     if (this.evento.id == PseudoEvento.EventoId)
    //         return lastValueFrom(this.service.createSuperacao(request));
    //     return lastValueFrom(this.service.editSuperacao(request));
    // }

}
