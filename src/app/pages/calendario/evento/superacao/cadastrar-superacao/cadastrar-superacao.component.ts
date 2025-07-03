import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, SelectItemGroup } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError } from '../../../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoSuperacaoRequest } from '../../../../../models/evento-superacao.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { AlunoService } from '../../../../../services/alunos.service';
import { TurmaService } from '../../../../../services/turma.service';
import { Turma } from '../../../../../models/turma.model';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { EventoService } from '../../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import { ChecklistService } from '../../../../../services/checklist.service';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { MyMap } from '../../../../../utils/map';
import { groupBy } from 'lodash'
import $ from 'jquery';
import { validaAlunos, validaProfessores, validaSalaAulas, CalendarioUtils, playAlert, playSuccess, showError } from '../../../../../utils';
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model';

@Component({
    selector: 'app-cadastrar-superacao',
    standalone: false,
    templateUrl: './cadastrar-superacao.component.html',
    styleUrl: './cadastrar-superacao.component.css',
    providers: [ConfirmationService]
})
export class CadastrarSuperacaoComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoSuperacaoRequest = new EventoSuperacaoRequest;

    data: Date = new Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();

    blockAlunoField = false;
    selectedAlunos: Aluno[] = [];
    mensagensEnviadasAlunos: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

    professorSelected?: Professor;
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

    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;
    @ViewChild('professor_Id') professor_Id!: NgModel;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
        private service: EventoService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private accountService: AccountService,
        private checklistService: ChecklistService,
        private calendarioUtils: CalendarioUtils,
    ) {

        this.object.descricao = 'Superação';

        var professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList('cadastrar-superacao.component'))
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

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }

        var alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true));
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        var eventos = this.service.eventos.subscribe(res => this.eventos = res);
        this.subscription.push(eventos);

        this.loadFeriados();
        this.verificaDisponibilidade();

        this.activatedRoute.params.subscribe(res => {
            if (res['aluno_Id']) {
                var aluno_Id = this.crypto.decrypt(res['aluno_Id']);
                this.selectedAlunos = this.alunos.filter(x => x.id = aluno_Id)
                if (this.selectedAlunos.length > 0) this.blockAlunoField = true;
            }
        })

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

    getCorTurma(turma_Id?: number) {
        if (turma_Id)
            return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? '';
        else return null
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

    validaAlunos() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = e.value as Professor;
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

    alunoChanged(e: MultiSelectChangeEvent, model: NgModel) {
        var alunos = e.value as Aluno[];
        var aluno = (e.originalEvent as any).option as Aluno;
        if (alunos.length)

            if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
                var index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
                if (index) this.selectedAlunos.splice(index, 1);

                this.showError('Aluno Indisponível', `${aluno.nome.split(' ')[0]} tem ${this.getTipo(aluno.disponivelEvent)} no mesmo dia às <b>${moment(aluno.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
                return;
            }
            else if (alunos.length > 1) {
                this.confirmationService.confirm({
                    target: e.originalEvent.target as EventTarget,
                    header: `Selecionar ${alunos.length} alunos?`,
                    message: 'Tem certeza que deseja selecionar mais de um aluno para a aula? Confirme a disponibilidade.',
                    acceptLabel: `Sim`,
                    acceptButtonStyleClass: 'p-button-rounded',
                    rejectLabel: 'Não',
                    rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                    reject: () => {
                        this.selectedAlunos = [this.selectedAlunos[0]]
                    },
                });
            }

        model.control.updateValueAndValidity();
    }


    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    
    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }


    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (!this.selectedAlunos || !this.selectedAlunos.length)
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e);

        if (!this.professorSelected)
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e);


        // playAlert();

        this.object.alunos = this.selectedAlunos.map(x => x.id);
        this.object.professores = [this.professorSelected.id];

        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar superação',
            message: `Tem certeza que deseja agendar superação para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`,
            acceptLabel: `Agendar superação`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }

        })

    }

    send(e: any) {
        this.loading = true;
        lastValueFrom(this.service.createSuperacao(this.object))
            .then(res => {
                this.loading = false;
                this.object = res.object;
                this.toastrService.success('Superação cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
                this.markChecklistAsDone();
                // playSuccess();

                if (this.selectedAlunos.length == 1 && this.selectedAlunos[0].celular) {
                    this.sendMensagemAluno(e, res.object);
                } else {
                    this.sendMensagemAlunos();
                }
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar superação. <br> ${getError(res)}`, e);
            })

    }

    sendMensagemAluno(e: any, evento: any) {
        var aluno = this.selectedAlunos[0] as Aluno;
        this.confirmationService.confirm({
            target: e.target,
            message: `Agendamento concluído com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptButtonStyleClass: ' p-button-rounded p-button-success',
            acceptIcon: 'pi pi-whatsapp',
            rejectLabel: 'Não enviar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false;
                this.visibleChange();
                var object = this.mensagemWhatsapp.enviarMensagemAgendamento(
                    aluno.nome,
                    aluno.celular,
                    evento
                );
                window.open(object.link, '_target');
                this.mensagemWhatsapp.copiarMensagem(object.mensagem);
            },
            reject: () => {
                this.visible = false;
                this.visibleChange();
            },
        });
    }
    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.selectedAlunos.sort((x, y) => x.nome < y.nome ? -1 : 1);
        this.confirmationService.confirm({
            key: 'enviarMensagem',
            message: `Agendamento concluído com sucesso. \n Envie uma mensagem de confirmação para os alunos que participarão da aula.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false;
                this.visibleChange();
            },
        });
    }

    removerAlunoLista(aluno: Aluno, e: any) {
        if (e.which == 2) {
            var index = this.mensagensEnviadasAlunos.findIndex(
                (x) => x.id == aluno.id
            );
            if (index != -1) this.mensagensEnviadasAlunos.splice(index, 1);
        }
    }
    enviarMensagemAgendamento(aluno: Aluno) {
        var evento = MyMap(this.object, new Evento());
        evento.evento_Tipo_Id = EventoTipo.AulaExtra;
        return this.mensagemWhatsapp.enviarMensagemAgendamento(
            aluno.nome,
            aluno.celular,
            evento
        );
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    markChecklistAsDone() {
        // Agendar superação
        // Id 22 ou 29
        this.selectedAlunos.forEach(aluno => {
            var alunoChecklist = aluno.alunoChecklist.find(x => (x.checklist_Item_Id == 22 || x.checklist_Item_Id == 29) && !x.finalizado) as Aluno_CheckList_Item;
            var professor = this.professorSelected as Professor;

            if (alunoChecklist) {
                var mensagem = `Superação agendada para o dia ${moment(this.object.data).format('DD/MM/YY [às] HHH[h]mm')} com o educador ${professor.nome}.\n
                                Agendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HHH[h]mm')}}`
                if (alunoChecklist && !alunoChecklist.finalizado) {
                    lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
                }
            }
        })
    }


}
