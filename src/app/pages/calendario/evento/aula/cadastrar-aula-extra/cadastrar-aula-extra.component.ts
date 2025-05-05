import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { PerfilCognitivo } from '../../../../../models/perfil-cognitivo.model';
import { Professor } from '../../../../../models/professor.model';
import { Aluno } from '../../../../../models/alunos.model';
import { Turma } from '../../../../../models/turma.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../../../../services/turma.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { PerfilCognitivoService } from '../../../../../services/perfil-cognitivo.services';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { AlunoService } from '../../../../../services/alunos.service';
import { NgForm, NgModel } from '@angular/forms';
import { Roteiro } from '../../../../../models/roteiro.model';
import { EventoAulaExtraRequest } from '../../../../../models/evento-aula.model';
import moment from 'moment';
import { RoteiroService } from '../../../../../services/roteiro.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../../../services/evento.service';
import { getError } from '../../../../../utils';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { MyMap as MyMap } from '../../../../../utils/map';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { PickList, PickListMoveAllToTargetEvent } from 'primeng/picklist';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';

@Component({
    selector: 'app-cadastrar-aula-extra',
    standalone: false,
    templateUrl: './cadastrar-aula-extra.component.html',
    styleUrl: './cadastrar-aula-extra.component.css',
    providers: [ConfirmationService],
})
export class CadastrarAulaExtraComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoAulaExtraRequest = new EventoAulaExtraRequest;

    data: Date = undefined as unknown as Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();

    @ViewChild('perfilCognitivo') perfilCognitivo!: NgModel
    perfilCognitivoSelected?: PerfilCognitivo;
    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = false;

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    mensagensEnviadasAlunos: Aluno[] = [];
    alunosSelected: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    @ViewChild('picklist') picklist!: PickList;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    feriadoDates: Date[] = [];
    ano: number = new Date().getFullYear();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private turmaService: TurmaService,
        private service: EventoService,
        private professorService: ProfessorService,
        private perfilCognitivoService: PerfilCognitivoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private salaAulaService: SalaAulaService,
        private alunoService: AlunoService,
        private roteiroService: RoteiroService,
        public mensagemWhatsapp: MensagemWhatsapp,
    ) {
        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList('cadastrar aula extra'))
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }

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
            lastValueFrom(this.perfilCognitivoService.getList())
                .then(res => this.loadingPerfisCognitivos = false)
                .catch(res => this.loadingPerfisCognitivos = false);
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

        this.loadFeriados();

        var eventos = this.service.eventos.subscribe(res => this.eventos = res);
        this.subscription.push(eventos);

        this.verificaDisponibilidade();
        this.visible = true;

    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
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
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    setDiaSemana(i: number) {
        return moment().day(i).format('dddd')
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
                this.feriadoDates = res.map(x => moment(x.date).toDate());
            })
            .catch(res => this.loadingFeriados = false);
    }


    turmaChanged() {
        if (this.object.turma_Id) {
            var turma = this.turmas.find(x => x.id == this.object.turma_Id) as Turma;
            this.alunosSelected = this.alunos.filter(x => x.turma_Id == this.object.turma_Id);
            this.object.capacidadeMaximaAlunos = turma.capacidadeMaximaAlunos ?? 12
            this.object.professor_Id = turma.professor_Id;
            this.object.sala_Id = turma.sala_Id;
            this.object.descricao = turma.nome;
            this.perfilCognitivoSelected = this.perfisCognitivos.find(x => x.id == turma.perfilCognitivo[0].id)

            var roteiro = this.roteiros.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim));
            if (roteiro) {
                this.object.roteiro_Id = roteiro.id;
            }

            this.verificaDisponibilidade();
        }
    }

    @HostListener('mouseup', ['$event'])
    middleclickEvent(event: any) {
        if (event.which === 2) {
        }
    }

    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }


    removerAlunoLista(aluno: Aluno, e: any) {
        if (e.which == 2) {
            var index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
            if (index != -1)
                this.mensagensEnviadasAlunos.splice(index, 1);
        }
    }

    enviarMensagemAgendamento(aluno: Aluno) {
        var evento = MyMap(this.object, new Evento)
        evento.evento_Tipo_Id = EventoTipo.AulaExtra;
        return this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento);
    }

    onMoveToSource(e: any) {
        this.validaAlunos();
    }

    onMoveToTarget(e: PickListMoveAllToTargetEvent) {
        this.validaAlunos();
        var item = e.items[0] as Aluno;
        if (!item.disponivel) {
            this.showError('Aluno indisponível', 'Você não pode mover um aluno indisponível.', { target: this.picklist.el.nativeElement });
            var index = this.alunosSelected.findIndex(x => x.id == item.id);
            if (index != -1) {
                this.alunosSelected.splice(index, 1)
                this.alunos.push(item);
            };
        }
    }

    onMoveAllToSource(e: any) {
        this.validaAlunos();

    }

    onMoveAllToTarget(e: any) {
        this.validaAlunos();
        var items = e.items as Aluno[];
        if (items.find(x => !x.disponivel)) {
            this.showError('Aluno indisponível', 'Você não pode mover alunos indisponíveis.', { target: this.picklist.el.nativeElement });
            this.alunos = items.filter(x => !x.disponivel);
            this.alunosSelected = items.filter(x => x.disponivel);
        }
    }

    async verificaDisponibilidade() {
        var roteiro = this.roteiros.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim));
        if (roteiro) {
            this.object.roteiro_Id = roteiro.id;
        }

        var valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }

        this.loadingEventos = true;
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);


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
    }

    validaAlunos() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaProfessores();

        var item = this.professores.find(x => x.id == e.value);

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
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

    getTipo(e: Evento) {
        return this.mensagemWhatsapp.getEventoTipo(e)
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        var professor = this.professores.find(x => x.id == this.object.professor_Id)
        if (professor && !professor.disponivel && professor.disponivelEvent) {
            return this.showError('Educador indisponível', `O educador ${professor.nome} está atribuído a uma ${this.getTipo(professor.disponivelEvent)} no dia ${moment(professor.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }
        var sala = this.salaAulas.find(x => x.id == this.object.sala_Id)
        if (sala && !sala.disponivel && sala.disponivelEvent) {
            return this.showError('Sala indisponível', `A sala ${sala.numeroSala} está atribuída a uma ${this.getTipo(sala.disponivelEvent)} no dia ${moment(sala.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }

        var aluno = this.alunosSelected.find(x => !x.disponivel && x.disponivelEvent)
        if (aluno && aluno.disponivelEvent) {
            return this.showError('Aluno indisponível', `O alunos ${aluno.nome} está atribuído a uma ${this.getTipo(aluno.disponivelEvent)} no dia ${moment(aluno.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }

        this.object.alunos = this.alunosSelected.map(x => x.id);
        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula',
            message: `Tem certeza que deseja agendar essa aula para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`,
            acceptLabel: `Agendar aula`,
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

        lastValueFrom(this.service.createAulaExtra(this.object))
            .then(res => {
                this.loading = false;
                this.sendMensagemAlunos();
                this.toastrService.success('Aula cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar aula. \n ${getError(res)}`, e);
            })

    }

    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);// .filter(x => !!x.celular);
        this.confirmationService.confirm({
            key: 'enviarMensagem',
            message: `Agendamento concluído com sucesso. \n Envie uma mensagem de confirmação para os alunos que participarão da aula.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.visible = false
                this.visibleChange();
            },
        });
    }


}
