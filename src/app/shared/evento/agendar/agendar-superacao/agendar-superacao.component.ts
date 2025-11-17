import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError, validaAlunoSalaAula } from '../../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoSuperacaoRequest } from '../../../../models/evento-superacao.model';
import { Professor } from '../../../../models/professor.model';
import { SalaAndar, SalaAula } from '../../../../models/sala-aula.model';
import { SalaAulaService } from '../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../services/professor.service';
import { AlunoService } from '../../../../services/alunos.service';
import { TurmaService } from '../../../../services/turma.service';
import { Turma } from '../../../../models/turma.model';
import { NgForm, NgModel } from '@angular/forms';
import { EventoService } from '../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../models/calendario.model';
import { Feriado } from '../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { validaAlunos, validaProfessores, validaSalaAulas, CalendarioUtils, showError } from '../../../../utils';
import 'moment/locale/pt-br';
import moment from 'moment';
import $ from 'jquery';
import { NameFirstWordPipe } from '../../../../utils/name-first-word.pipe';
import { RoteiroService } from '../../../../services/roteiro.service';
import { Roteiro } from '../../../../models/roteiro.model';
import { MensagemTipo } from '../../enviar-mensagem-alunos/enviar-mensagem-alunos.component';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { showEnviarMensagemAlunos } from '../../../../utils/show-enviar-mensagem-alunos';
import { JornadaSuperaService } from '../../../../services/jornada-supera.service';
import { MonitoramentoService } from '../../../../services/monitoramento.service';
import { showAluno } from '../../../../utils/show-aluno';
import { FeriadoService } from '../../../../services/feriado.service';

@Component({
    selector: 'app-agendar-superacao',
    standalone: false,
    templateUrl: './agendar-superacao.component.html',
    styleUrl: './agendar-superacao.component.css',
    providers: [ConfirmationService, DialogService],
})
export class AgendarSuperacaoComponent implements OnInit, OnDestroy {

    instance: DynamicDialogComponent | undefined;
    aluno_Id?: number;
    aluno?: Aluno;

    subscription: Subscription[] = [];
    loading = false;
    object: EventoSuperacaoRequest = new EventoSuperacaoRequest;

    data: Date = undefined as unknown as Date;
    horario: Date = undefined as unknown as Date;

    selectedAlunos: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano: number = new Date().getFullYear();

    invalidDates: Date[] = [];

    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;
    @ViewChild('professor_Id') professor_Id!: NgModel;
    @ViewChild('_data') _data!: NgModel;
    @ViewChild('_horario') _horario!: NgModel;


    constructor(
        private dialogService: DialogService,
        private ref: DynamicDialogRef,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
        private roteiroService: RoteiroService,
        private eventoService: EventoService,
        private feriadoService: FeriadoService,
        private jornadaService: JornadaSuperaService,
        private monitoramentoService: MonitoramentoService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private nameFirstWordPipe: NameFirstWordPipe,
    ) {

        this.instance = this.dialogService.getInstance(this.ref);
        this.object.descricao = 'Superação';

        let feriados = this.feriadoService.list.subscribe(res => {
            this.feriados = res;
            this.setInvalidDates();
        });
        this.subscription.push(feriados);

        if (this.feriados.length == 0) {
            this.loadFeriados();
        }

        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res.filter(x => x.active);
            this.setInvalidDates();
        });
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadRoteiros();
        }

        let professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active));
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadProfessores();
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res);
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadSalas();
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadTurmas();
        }

        let alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active);
            this.setAluno();
        })
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadAlunos();
        }

        let eventos = this.eventoService.eventos.subscribe(res => this.eventos = res.filter(x => x.active));
        this.subscription.push(eventos);

        this.loadFeriados();
        this.verificaDisponibilidade();


    }

    ngOnInit(): void {
        if (this.instance && this.instance.data) {
            this.aluno_Id = this.instance.data['aluno_Id'];
            this.setAluno();
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    close(agendamentoConcluido: boolean) {
        this.ref.close(agendamentoConcluido);
    }

    setAluno() {
        if (this.alunos.length && this.aluno_Id) {
            this.aluno = this.alunos.find(x => x.id == this.aluno_Id)
            this.selectedAlunos = this.aluno ? [this.aluno] : [];
        }

        if (this.aluno && !this.aluno.disponivel && this.aluno.disponivelEvent) {

            let tipo = this.getTipo(this.aluno.disponivelEvent);
            let data = moment(this.aluno.disponivelEvent.data).format('HH[h]mm');

            this.showError(
                'Aluno Indisponível',
                `${this.aluno.nome} tem ${tipo} no mesmo dia às <b>${data}</b>.`,
                { target: this.form }
            );
            if (this._data)
                this._data.control.setErrors({ required: true })
            if (this._horario)
                this._horario.control.setErrors({ required: true })

        }
        else {
            if (this._data)
                this._data.control.setErrors(null)
            if (this._horario)
                this._horario.control.setErrors(null)
        }
    }
    loadProfessores() {
        this.loadingProfessores = true;
        lastValueFrom(this.professorService.getList())
            .then(res => this.loadingProfessores = false)
            .catch(res => this.loadingProfessores = false);
    }

    loadRoteiros() {
        this.loadingRoteiros = true;
        lastValueFrom(this.roteiroService.getList(moment().year()))
            .then(res => this.loadingRoteiros = false)
            .catch(res => this.loadingRoteiros = false);
    }

    loadSalas() {
        this.loadingSalaAulas = true;
        lastValueFrom(this.salaAulaService.getList())
            .then(res => this.loadingSalaAulas = false)
            .catch(res => this.loadingSalaAulas = false);
    }

    loadTurmas() {
        this.loadingTurmas = true;
        lastValueFrom(this.turmaService.getList())
            .then(res => this.loadingTurmas = false)
            .catch(res => this.loadingTurmas = false);
    }

    loadAlunos() {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getList())
            .then(res => this.loadingAlunos = false)
            .catch(res => this.loadingAlunos = false);
    }

    loadFeriados() {
        this.loadingFeriados = true;
        lastValueFrom(this.feriadoService.getList())
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false);
    }

    removeAluno(aluno: Aluno) {
        let index = this.selectedAlunos.findIndex(x => x.id == aluno.id)
        if (index != -1) {
            this.selectedAlunos.splice(index, 1)
        }
    }

    setInvalidDates() {
        if (this.roteiros.length && this.feriados.length) {
            let recessos = this.roteiros.filter(x => x.recesso === true);
            let recessosDate = recessos.flatMap(x => {
                let length = moment(x.dataFim).diff(x.dataInicio, 'day')
                let range = Array.from({ length }, (item, index) => {
                    return moment(x.dataInicio, 'YYYY-MM-DD').add(index, 'day').toDate()
                });
                range.push(moment(x.dataFim, 'YYYY-MM-DD').toDate())
                return range;
            });

            let feriadosDate = this.feriados.map(x => moment(x.data).toDate());

            this.invalidDates = [... new Set(recessosDate.concat(feriadosDate))];
        }
    }

    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados()
        }
    }


    async verificaDisponibilidade() {
        let valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }
        if (this.loadingEventos) {
            return valid;
        }

        this.loadingEventos = true;

        let hora = moment(this.horario);
        let data = moment(this.data).set({ hour: hora.hour(), minute: hora.minute(), second: 0 });

        moment.locale('pt-br')

        let request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data.toDate();
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.eventoService.getList(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();
        this.validaAlunos();

        return valid

    }

    validaSalaAulas() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);

        if (this.object.professor_Id) {
            let e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any,
            }
            this.professorChanged(e, this.professor_Id)
        }
    }

    validaAlunos() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
        this.setAluno();
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.professores.find(x => x.id == e.value) as Professor
        let mensagemErro: string | null = null

        if (item) {

            if (!item.disponivel && item.disponivelEvent) {
                let data = moment(item.disponivelEvent.data).format('HH[h]mm');
                let tipo = this.getTipo(item.disponivelEvent)
                mensagemErro = `Existe uma outra ${tipo} às ${data} no mesmo dia.`
            }
            else if (!item.disponivel && !item.disponivelEvent && item.expedienteInicio && item.expedienteFim) {
                let inicio = moment(item.expedienteInicio).format('HH[h]mm');
                let fim = moment(item.expedienteFim).format('HH[h]mm');
                mensagemErro = `O expediente do educador é das ${inicio} às ${fim}`
            }
        }

        if (mensagemErro) {
            this.showError(
                'Educador indisponível',
                mensagemErro,
                e.originalEvent
            )
            model.control.setValue(undefined)
        }
        model.control.setErrors({ indisponivel: mensagemErro })
        model.control.updateValueAndValidity()
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.salaAulas.find(x => x.id == e.value) as SalaAula;
        let alunosRestricao = this.selectedAlunos.filter(x => x.restricaoMobilidade);

        this.validaSalaAulas()


        if (item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            let data = moment(item.disponivelEvent.data).format('HH[h]mm');
            let tipo = this.getTipo(item.disponivelEvent);
            this.showError(
                'Sala Indisponível',
                `Essa sala está atribuída a outra ${tipo} no mesmo dia às <b>${data}</b>.`,
                e.originalEvent,
            );
            return;
        }

        if (alunosRestricao.length && item.andar > SalaAndar.Terreo) {
            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' })
            let alunos = alunosRestricao.map(x => this.nameFirstWordPipe.transform(x.nome)).join(', ')
            let sala = item.descricao;
            let mensagem = alunosRestricao.length > 1 ?
                `Os(as) alunos(as) ${alunos} têm restrição de mobilidade e não podem participar da aula zero na sala ${sala}.`
                : `O(a) aluno(a) ${alunos} tem restrição de mobilidade e não pode participar da aula zero na sala ${sala}.`;

            this.showError(
                'Restrição de Mobilidade',
                mensagem,
                e.originalEvent
            );
            return;
        }

        model.control.setErrors({ indisponivel: null })
        model.control.updateValueAndValidity()
    }

    async alunoChanged(e: MultiSelectChangeEvent, model: NgModel) {

        this.validaAlunos()

        let selected = (e.originalEvent as any).selected

        // se o aluno foi selecionado, selected = false
        // se o aluno foi deselecionado, selected = true
        if (selected == false) {
            let aluno = (e.originalEvent as any).option as Aluno;
            let nome = this.nameFirstWordPipe.transform(aluno.nome);

            if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
                let tipo = this.getTipo(aluno.disponivelEvent);
                let data = moment(aluno.disponivelEvent.data).format('HH[h]mm');

                this.showError(
                    'Aluno Indisponível',
                    `${nome} tem ${tipo} no mesmo dia às <b>${data}</b>.`,
                    e.originalEvent
                );

                this.selectAlunoReject(aluno, model);
                return
            }

            const salaValid = validaAlunoSalaAula(this.object.sala_Id, aluno.id, this.salaAulas, this.alunos);
            if (!salaValid) {
                this.showError(
                    'Restrição de Mobilidade',
                    `O aluno(a) ${nome} tem restrição de mobilidade e não pode subir escadas. <br> Selecione uma sala no térreo para ele poder participar.`,
                    e.originalEvent
                );

                this.selectAlunoReject(aluno, model);
                return;
            }

            let mensagem = '';

            aluno = await this.loadAluno(e.originalEvent, aluno, model) as Aluno;

            mensagem += await this.restricoesMensagem(aluno);
            mensagem += await this.maisDeUmAlunoMensagem(aluno);

            if (mensagem) {
                this.confirmationService.confirm({
                    target: e.originalEvent.target as any,
                    header: 'Selecionar aluno',
                    message: `<p>Algumas observações são relevantes antes de continuar:</p>
                                ${mensagem}
                            `,
                    acceptLabel: `Continuar`,
                    rejectLabel: 'Não',
                    acceptIcon: 'pi pi-check',
                    rejectIcon: 'pi pi-times',
                    acceptButtonStyleClass: 'p-button-rounded',
                    rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                    accept: () => {
                    },
                    reject: () => {
                        this.selectAlunoReject(aluno, model);
                    }
                })
            }

            model.control.setErrors({ indisponivel: null });
            model.control.updateValueAndValidity()

        }
    }

    selectAlunoReject(aluno: Aluno, model: NgModel) {
        let index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
        if (index != -1)
            this.selectedAlunos.splice(index, 1);

        model.control.setValue(this.selectedAlunos);
        model.control.updateValueAndValidity();
    }
    async restricoesMensagem(aluno: Aluno) {
        let mensagem = '';
        let restricoes = aluno.restricoes.filter(x => x.active === true);

        if (restricoes.length > 0 || aluno.restricaoMobilidade) {
            mensagem += `<br>
                        <p class="font-bold">Restrições:</p> 
                        <ul class="my-2 pl-2">`;


            if (restricoes.length > 0)
                mensagem += restricoes.map(x => `<li>${x.descricao}</li>`);

            if (aluno.restricaoMobilidade)
                mensagem += '<li><b>Restrição de mobilidade</b></li>';

            mensagem += `</ul>`;
            mensagem += `<p class="text-sm text-red-500">
                            Tem certeza que deseja ignorar as restrições e continuar?
                        </p>`;
        }
        return mensagem;
    }

    async maisDeUmAlunoMensagem(aluno: Aluno) {

        let mensagem = '';

        if (this.selectedAlunos.length == 0) {
            mensagem += '<br>'
            mensagem += `<p>Nenhum aluno selecionado.</p>`;
        }
        else if (this.selectedAlunos.length > 1) {
            mensagem += '<br>'
            mensagem += `<p>${this.selectedAlunos.length} alunos selecionados</p>`;
            mensagem += `<p class="text-sm text-red-500">Tem certeza que deseja selecionar mais de um aluno?</p>`;
        }

        return mensagem;
    }

    loadAluno(e: any, selectedAluno: Aluno, model: NgModel) {
        this.loadingAlunos = true
        this.loading = true
        return lastValueFrom(this.alunoService.get(selectedAluno.id))
            .then(res => {
                this.loadingAlunos = false
                this.loading = false
                return res;
            })
            .catch(res => {
                this.showError('Erro', `Não foi possível carregar dados do aluno ${selectedAluno.nome}`, e)
                this.loadingAlunos = false
                this.loading = false
                return undefined
            })
    }



    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    showAluno(aluno_Id: number) {
        showAluno(this.dialogService, aluno_Id)
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (!this.selectedAlunos || !this.selectedAlunos.length)
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e);


        this.object.data = moment().set({
            date: moment(this.data).date(),
            month: moment(this.data).month(),
            year: moment(this.data).year(),
            hour: moment(this.horario).hour(),
            minutes: moment(this.horario).minutes(),
            second: 0,
        }).toDate();

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar superação',
            message: `Tem certeza que deseja agendar superação para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?`,
            acceptLabel: `Agendar superação`,
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }

        })

    }

    send(e: any) {
        this.loading = true;
        this.object.alunos = this.selectedAlunos.map(x => x.id);
        this.object.professores = [this.object.professor_Id];

        lastValueFrom(this.eventoService.createSuperacao(this.object))
            .then(res => {

                if (res.success) {
                    if (this.object.alunos.length > 0) {
                        this.sendMensagemAlunos(res.object);
                    } else {
                        this.close(true)
                    }
                    this.toastrService.success('Superação cadastrada com sucesso.', 'Agendamento finalizado');
                    this.jornadaService.onReload.emit(res.object.id);
                    this.monitoramentoService.onReload.emit(res.object.id);
                    this.eventoService.onReload.emit(res.object.id);
                }
                else {
                    this.showError('Agendamento falhou', `Não foi possível agendar superação. <br> ${res.message}`, e);
                }

            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar superação. <br> ${getError(res)}`, e);
            })

    }

    sendMensagemAlunos(evento: Evento) {
        var alunos = this.selectedAlunos
            .sort((x, y) => x.nome < y.nome ? -1 : 1);

        var ref = showEnviarMensagemAlunos(
            this.dialogService,
            alunos, evento,
            MensagemTipo.Agendamento
        );

        var onClose = ref.onClose.subscribe(res => {
            this.close(true);
        });
        this.subscription.push(onClose);
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
}
