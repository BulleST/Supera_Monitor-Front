import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EventoAula0Request } from '../../../../../models/evento-aula-0.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../../../models/alunos.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, SelectItemGroup } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError, showError } from '../../../../../utils';
import moment from 'moment';
import { Turma } from '../../../../../models/turma.model';
import { TurmaService } from '../../../../../services/turma.service';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { AlunoService } from '../../../../../services/alunos.service';
import { EventoService } from '../../../../../services/evento.service';
import { NgForm, NgModel } from '@angular/forms';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { SelectChangeEvent } from 'primeng/select';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { ChecklistService } from '../../../../../services/checklist.service';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import {
    validaAlunos,
    validaProfessores,
    validaSalaAulas,
} from '../../../../../utils/validacao';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { MyMap } from '../../../../../utils/map';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { groupBy } from 'lodash';
import $ from 'jquery';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { playAlert, playSuccess } from '../../../../../utils/audio';
import { AlunoRestricaoService } from '../../../../../services/aluno-restricao.service';

@Component({
    selector: 'app-cadastrar-aula-0',
    standalone: false,
    templateUrl: './cadastrar-aula-0.component.html',
    styleUrl: './cadastrar-aula-0.component.css',
    providers: [ConfirmationService],
})
export class CadastrarAula0Component implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    object: EventoAula0Request = new EventoAula0Request();
    data: Date = undefined as unknown as Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();

    blockAlunoField = false;

    mensagensEnviadasAlunos: Aluno[] = [];
    selectedAlunos: Aluno[] = [];
    groupedAlunos: SelectItemGroup[] = [];
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

    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;
    @ViewChild('professor_Id') professor_Id!: NgModel;

    SalaAulaId = SalaAulaId;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto,
        private turmaService: TurmaService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private alunoRestricaoService: AlunoRestricaoService,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private checklistService: ChecklistService,
        private accountService: AccountService,
        private calendarioUtils: CalendarioUtils,
    ) {
        this.object.descricao = 'Aula 0';

        var professores = this.professorService.list.subscribe(
            (res) => (this.professores = res)
        );
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then((res) => (this.loadingProfessores = false))
                .catch((res) => (this.loadingProfessores = false));
        }

        var salaAula = this.salaAulaService.list.subscribe(
            (res) => (this.salaAulas = res)
        );
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true;
            lastValueFrom(this.salaAulaService.getList())
                .then((res) => (this.loadingSalaAulas = false))
                .catch((res) => (this.loadingSalaAulas = false));
        }

        var turmas = this.turmaService.list.subscribe((res) => (this.turmas = res));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then((res) => (this.loadingTurmas = false))
                .catch((res) => (this.loadingTurmas = false));
        }

        var alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active == true);
            var grouped = groupBy(this.alunos, 'turma_Id');

            this.groupedAlunos = [];
            for (let turma_Id in grouped) {
                var alunosTurma = grouped[turma_Id] as Aluno[];
                var turma = {
                    nome: alunosTurma[0].turma,
                    turmaDesc: alunosTurma[0].turmaDesc,
                    turma_Id: alunosTurma[0].turma_Id,
                    diaSemana: alunosTurma[0].diaSemana,
                    horario: alunosTurma[0].horario,
                    professor_Id: alunosTurma[0].professor_Id,
                    professor: alunosTurma[0].professor,
                    corLegenda: this.getCorTurma(alunosTurma[0].turma_Id)
                }
                this.groupedAlunos.push({
                    label: turma.nome ?? "Indefinido",
                    value: turma,
                    items: alunosTurma.map(aluno => ({ label: aluno.nome.split(' ')[0], value: aluno }))
                });
            }
        });
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getListWithChecklist())
                .then((res) => (this.loadingAlunos = false))
                .catch((res) => (this.loadingAlunos = false));
        }

        var eventos = this.service.eventos.subscribe((res) => (this.eventos = res));
        this.subscription.push(eventos);

        this.loadFeriados();

        this.verificaDisponibilidade();

        this.activatedRoute.params.subscribe((res) => {
            if (res['aluno_Id']) {
                this.object.alunos = this.crypto.decrypt(res['aluno_Id']);
                this.blockAlunoField = true;
            }
        });

        this.visible = true;
    }

    ngOnDestroy(): void {
        this.subscription.forEach((e) => e.unsubscribe());
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

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados();
        }
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        await lastValueFrom(this.service.getFeriados(this.ano))
            .then((res) => {
                this.feriados = res;
                this.loadingFeriados = false;
                this.feriadoDates = res.map((x) => moment(x.date).toDate());
            })
            .catch((res) => (this.loadingFeriados = false));
    }

    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    async verificaDisponibilidade() {
        var valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }

        this.loadingEventos = true;
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes());

        var request: CalendarioRequest = new CalendarioRequest();
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.calendario(request))
            .then((res) => (this.loadingEventos = false))
            .catch((res) => (this.loadingEventos = false));

        this.validaProfessores();
        this.validaSalaAulas();
        this.validaAlunos();

        return valid;
    }

    validaSalaAulas() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);

        if (this.object.professor_Id) {
            var e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any
            }
            this.professorChanged(e, this.professor_Id);
        }
    }

    validaAlunos() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        // this.validaProfessores();
        var item = this.professores.find(x => x.id == e.value) as Professor;
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
            model.control.setValue(undefined)
        }
        model.control.setErrors({ indisponivel: mensagemErro });
        model.control.updateValueAndValidity();
    }


    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var salaAula = this.salaAulas.find(x => x.id == e.value) as SalaAula;

        this.validaSalaAulas();

        let alunosComRestricaoMobilidade = this.selectedAlunos.filter(x => x.restricaoMobilidade);

        var item = this.salaAulas.find((x) => x.id == e.value);
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível',`Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`,e.originalEvent);
            return;
        } 
        else if (alunosComRestricaoMobilidade.length && salaAula && salaAula.andar > 1) {
            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' });
            this.showError('Restrição de Mobilidade', `O(s) aluno(s) ${alunosComRestricaoMobilidade.map(x => x.nome.split(' '[0])).join(', ')} tem restrição de mobilidade e não podem participar da aula zero na sala ${salaAula.numeroSala} - ${salaAula.andar}º andar.`, e.originalEvent);
            return;
        }

        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    alunoChanged(e: MultiSelectChangeEvent, model: NgModel) {
        this.validaAlunos();
        var alunos = e.value as Aluno[];
        var aluno = (e.originalEvent as any).option as Aluno;
        var salaAula = this.salaAulas.find(x => x.id == this.object.sala_Id) as SalaAula;

        if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
            var index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
            if (index) this.selectedAlunos.splice(index, 1);
            this.showError('Aluno Indisponível', `${aluno.nome.split(' ')[0]} tem ${this.getTipo(aluno.disponivelEvent)} no mesmo dia às <b>${moment(aluno.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        else if (aluno.restricaoMobilidade && salaAula && salaAula.andar > 1) {
            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' });
            this.showError('Restrição de Mobilidade', `O ${aluno.nome.split(' ')[0]} tem restrição de mobilidade e não pode participar da aula zero na sala ${salaAula.numeroSala} - ${salaAula.andar}º andar.`, e.originalEvent);
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

        this.getRestricoes(e.originalEvent, aluno);
    }

    getRestricoes(e: any, aluno: Aluno) {
        if (this.selectedAlunos) {
            this.loadingAlunos = true;
            this.loading = true;
            lastValueFrom(this.alunoRestricaoService.getList(aluno.id))
                .then(res => {
                    aluno.restricoes = res;
                    let index = this.alunos.findIndex(x => x.id == aluno.id);
                    this.alunos.splice(index, 1, aluno);

                    index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
                    this.selectedAlunos.splice(index, 1, aluno);

                    if (aluno.restricoes.filter(x => x.active == true).length > 0) {

                        var mensagem = 'Esse aluno possui algumas restrições atribuidas: ';
                        mensagem += res.map(x => '• ' + x.descricao).join('<br>');
                        mensagem += `<br> Tem certeza que deseja inserir ele nessa aula zero?`;

                        this.confirmationService.confirm({
                            target: e.target,
                            header: 'Inserir aluno',
                            message: mensagem,
                            acceptLabel: `Continuar`,
                            acceptIcon: 'pi pi-check',
                            acceptButtonStyleClass: 'p-button-rounded',
                            rejectLabel: 'Cancelar',
                            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                            accept: () => {
                            },
                            reject: () => {
                                index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
                                this.selectedAlunos.splice(index, 1, aluno);
                            }
                        })

                    }
                })

        }

    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e);
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e);
        }
        if (this.selectedAlunos.length == 0) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e);
        }

        // playAlert();

        this.object.alunos = this.selectedAlunos.map((x) => x.id);

        this.object.data = new Date(this.data);
        this.object.data.setHours(
            this.horario.getHours(),
            this.horario.getMinutes(),
            0
        );
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        var mensagem = ``;
        if (this.selectedAlunos.length == 1) {
            mensagem = `Tem certeza que deseja agendar a aula 0 do aluno ${this.selectedAlunos[0].nome} para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`;
        } else if (this.selectedAlunos.length > 1) {
            mensagem = `Tem certeza que deseja agendar a aula 0 dos alunos ${this.selectedAlunos.map((x) => x.nome).join(', ')} para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`;
        }

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula 0',
            message: mensagem,
            acceptLabel: `Agendar aula 0`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            },
        });
    }

    send(e: any) {
        this.loading = true;

        lastValueFrom(this.service.createAula0(this.object))
            .then((res) => {
                this.loading = false;
                this.object = res.object;
                this.service.calendarioReload.emit(res.object.id);
                this.markChecklistAsDone();
                this.toastrService.success('Aula 0 cadastrada com sucesso.', 'Agendamento finalizado');
                // playSuccess();

                if (this.selectedAlunos.length == 1 && this.selectedAlunos[0].celular) {
                    this.sendMensagemAluno(e, res.object);
                } else if (this.selectedAlunos.filter(x => x.celular).length > 0) {
                    this.sendMensagemAlunos();
                }
                else {
                    this.visible = false;
                    this.visibleChange();
                }

            })
            .catch((res) => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar aula 0. <br> ${getError(res)}`, e);
            });
    }

    sendMensagemAluno(e: any, evento: any) {
        var aluno = this.selectedAlunos[0] as Aluno;
        this.confirmationService.confirm({
            target: e.target,
            message: `Agendamento concluído com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptButtonStyleClass:
                ' p-button-rounded p-button-success  px-3 mr-0',
            acceptIcon: 'pi pi-whatsapp',
            rejectLabel: 'Não enviar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false;
                this.visibleChange();
                var url = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento);
                window.open(url, '_target');
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
    markChecklistAsDone() {
        // Agendamento na aula 0
        if (this.selectedAlunos) {
            var id = 31;
            this.selectedAlunos.forEach((aluno) => {
                var alunoChecklist = aluno.alunoChecklist.find((x) => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
                var professor = this.professores.find((x) => x.id == this.object.professor_Id) as Professor;

                if (!alunoChecklist.finalizado) {
                    var mensagem = `Aula 0 agendada para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')} com o educador ${professor.nome}.\n Agendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')}}`;
                    if (alunoChecklist && !alunoChecklist.finalizado) {
                        lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem));
                    }
                }
            });
        }
    }

}
