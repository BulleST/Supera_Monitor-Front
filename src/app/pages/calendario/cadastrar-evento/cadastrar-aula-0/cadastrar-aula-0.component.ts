import { Component, OnDestroy, ViewChild } from '@angular/core'
import { EventoAula0Request } from '../../../../models/evento-aula-0.model'
import { lastValueFrom, Subscription } from 'rxjs'
import { Aluno } from '../../../../models/alunos.model'
import { Professor } from '../../../../models/professor.model'
import { SalaAndar, SalaAula, SalaAulaId } from '../../../../models/sala-aula.model'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationService } from 'primeng/api'
import { ToastrService } from 'ngx-toastr'
import { Crypto, getError, showError } from '../../../../utils'
import moment from 'moment'
import { Turma } from '../../../../models/turma.model'
import { TurmaService } from '../../../../services/turma.service'
import { SalaAulaService } from '../../../../services/sala-aula.service'
import { ProfessorService } from '../../../../services/professor.service'
import { AlunoService } from '../../../../services/alunos.service'
import { EventoService } from '../../../../services/evento.service'
import { NgForm, NgModel } from '@angular/forms'
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp'
import { SelectChangeEvent } from 'primeng/select'
import { Evento } from '../../../../models/evento.model'
import { CalendarioRequest } from '../../../../models/calendario.model'
import { validaAlunos, validaProfessores, validaSalaAulas, validaAlunoSalaAula } from '../../../../utils/validacao'
import { Feriado } from '../../../../models/feriado.model'
import { DatePickerYearChangeEvent } from 'primeng/datepicker'
import { MultiSelectChangeEvent } from 'primeng/multiselect'
import $ from 'jquery'
import { CalendarioUtils } from '../../../../utils/calendario-utils'
import { NameFirstWordPipe } from '../../../../utils/name-first-word.pipe'
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model'
import { RoteiroService } from '../../../../services/roteiro.service'
import { Roteiro } from '../../../../models/roteiro.model'
import { MensagemTipo } from '../../../../shared/evento/enviar-mensagem-alunos/enviar-mensagem-alunos.component'
import { DialogService } from 'primeng/dynamicdialog'
import { showEnviarMensagemAlunos } from '../../../../utils/show-enviar-mensagem-alunos'

@Component({
    selector: 'app-cadastrar-aula-0',
    standalone: false,
    templateUrl: './cadastrar-aula-0.component.html',
    styleUrl: './cadastrar-aula-0.component.css',
    providers: [ConfirmationService, DialogService],
})
export class CadastrarAula0Component implements OnDestroy {
    visible: boolean = false
    loading = false
    error: string = ''
    subscription: Subscription[] = []
    object: EventoAula0Request = new EventoAula0Request()

    data: Date = undefined as unknown as Date
    horario: Date = undefined as unknown as Date

    blockAlunoField = false

    selectedAlunos: Aluno[] = []
    alunos: Aluno[] = []
    loadingAlunos = false

    professores: Professor[] = []
    loadingProfessores = false

    salaAulas: SalaAula[] = []
    loadingSalaAulas = false

    turmas: Turma[] = []
    loadingTurmas = false

    eventos: Evento[] = []
    loadingEventos = false

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    feriados: Feriado[] = []
    loadingFeriados = false
    ano: number = new Date().getFullYear()

    invalidDates: Date[] = []

    @ViewChild('form') form!: NgForm
    @ViewChild('formDiv') formDiv!: HTMLFormElement
    @ViewChild('professor_Id') professor_Id!: NgModel

    SalaAulaId = SalaAulaId

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
        private roteiroService: RoteiroService,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private dialogService: DialogService,
        private calendarioUtils: CalendarioUtils,
        private nameFirstWordPipe: NameFirstWordPipe,
    ) {
        this.object.descricao = 'Aula 0';

        let feriados = this.service.feriados.subscribe(res => {
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

        let professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active))
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadProfessores();
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res);
        this.subscription.push(salaAula)

        if (this.salaAulas.length == 0) {
            this.loadSalas();
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active))
        this.subscription.push(turmas)

        if (this.turmas.length == 0) {
            this.loadTurmas();
        }

        let alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active))
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadAlunos();
        }

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active))
        this.subscription.push(eventos)

        this.loadFeriados()
        this.verificaDisponibilidade()

        this.activatedRoute.params.subscribe(res => {
            if (res['aluno_Id']) {
                this.object.alunos = this.crypto.decrypt(res['aluno_Id'])
                this.blockAlunoField = true
            }
        })

        this.visible = true;
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
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
        lastValueFrom(this.service.getFeriados(this.ano))
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false);
    }

    removeAluno(aluno: Aluno) {
        var index = this.selectedAlunos.findIndex(x => x.id == aluno.id)
        if (index != -1) {
            this.selectedAlunos.splice(index,1)
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
                return range
            });

            let feriadosDate = this.feriados.map(x => moment(x.date).toDate());

            this.invalidDates = [... new Set(recessosDate.concat(feriadosDate))];
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e)
    }

    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear()
            this.loadFeriados()
        }
    }


    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno)
            return
        }

        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular)
        window.open(object.link, '_target')
        this.mensagemWhatsapp.copiarMensagem(object.mensagem)
    }

    async verificaDisponibilidade() {
        let valid = true

        if (!this.data || !this.horario) {
            return valid
        }

        this.loadingEventos = true
        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes())

        let request: CalendarioRequest = new CalendarioRequest()
        request.intervaloDe = data
        request.intervaloAte = moment(data).add(1, 'day').toDate()

        this.loadingEventos = true
        await lastValueFrom(this.service.getList(request))
            .then(res => (this.loadingEventos = false))
            .catch(res => (this.loadingEventos = false))

        this.validaProfessores()
        this.validaSalaAulas()
        this.validaAlunos()

        return valid
    }

    validaSalaAulas() {
        if (!this.data || !this.horario) {
            return
        }

        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(
            data,
            this.object.duracaoMinutos,
            this.salaAulas,
            this.eventos,
            undefined,
            undefined,
        )
    }

    validaProfessores() {
        if (!this.data || !this.horario) {
            return
        }

        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined)

        if (this.object.professor_Id) {
            let e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any,
            }
            this.professorChanged(e, this.professor_Id)
        }
    }

    validaAlunos() {
        if (!this.data || !this.horario) {
            return
        }
        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined)
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

        let alunosRestricao = this.selectedAlunos.filter(x => x.restricaoMobilidade);
        console.log('alunosRestricao', alunosRestricao)
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

            let aulaZero: Evento;
            let participacaoAulaZero: Evento_Participacao_Aluno;
            let mensagem = '';

            if (aluno.aulaZero_Id) {
                aulaZero = await lastValueFrom(this.service.get(aluno.aulaZero_Id));
                participacaoAulaZero = aulaZero.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

                if (participacaoAulaZero.presente && aulaZero.finalizado) {
                    let data = moment(aulaZero.data).format('DD/MM/YY [às] HH[h]mm');
                    let educador = aulaZero.professor;
                    this.showError(
                        'Não autorizado',
                        `O aluno ${nome} já participou de de uma aula zero no dia <b>${data}</b> com o educador(a) ${educador}.`,
                        e.originalEvent
                    );

                    this.selectAlunoReject(aluno, model);
                    return
                }

                mensagem += await this.aulaZeroMensagem(aluno, aulaZero, participacaoAulaZero);
            }


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

    aulaZeroMensagem(aluno: Aluno, aulaZero: Evento, participacaoAulaZero: Evento_Participacao_Aluno) {
        let mensagem = `<br>
                    <p>Outra aula zero já foi cadastrada: </p>`;

        if (!aulaZero.active) {
            mensagem += `<p>${moment(aulaZero.data).format('DD/MM HH:mm')} - Cancelada (${aulaZero.observacao})</p>`;
        }
        else if (aulaZero.active && participacaoAulaZero.presente === false && participacaoAulaZero.active === true) {
            mensagem += `<p>${moment(aulaZero.data).format('DD/MM HH:mm')} - Faltou (${participacaoAulaZero.observacao})</p>`;
        }
        else {
            mensagem += `<p>${moment(aulaZero.data).format('DD/MM HH:mm')} - Ativa</p>`;
            mensagem += `<p class="text-sm text-red-500">(Ao continuar, essa aula zero que está ativa será cancelada automaticamente)</p>`;
        }
        return mensagem;
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

    selectAlunoReject(aluno: Aluno, model: NgModel) {
        let index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
        if (index != -1)
            this.selectedAlunos.splice(index, 1);

        model.control.setValue(this.selectedAlunos);
        model.control.updateValueAndValidity();
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

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (this.selectedAlunos.length == 0) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        // playAlert();

        this.object.alunos = this.selectedAlunos.map(x => x.id)

        this.object.data = new Date(this.data)
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any

        let mensagem = ``
        let nome = this.selectedAlunos[0].nome
        let data = moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')

        if (this.selectedAlunos.length == 1) {
            mensagem = `Tem certeza que deseja agendar a aula 0 do aluno ${nome} para o dia <span class="text-primary-500">${data}</span>?`
        } else if (this.selectedAlunos.length > 1) {
            mensagem = `Tem certeza que deseja agendar a aula 0 dos alunos ${this.selectedAlunos
                .map(x => x.nome)
                .join(', ')} para o dia <span class="text-primary-500">${data}</span>?`
        }

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula 0',
            message: mensagem,
            acceptLabel: `Agendar aula 0`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Não',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e)
            },
        })
    }

    async send(e: any) {
        this.loading = true

        this.object.data = this.data;

        await lastValueFrom(this.service.createAula0(this.object))
            .then(async res => {
                this.loading = false;
                if (res.success) {
                    if (this.object.alunos.length > 0) {
                        this.sendMensagemAlunos(res.object);
                    } else {
                        this.visible = false;
                        this.visibleChange()
                    }
                    this.toastrService.success('Aula zero cadastrada com sucesso.', 'Agendamento finalizado');
                    this.service.onReload.emit(res.object.id);
                }
                else {
                    this.showError('Agendamento falhou', `Não foi possível agendar aula zero. <br> ${res.message}`, e);
                }
            })
            .catch(res => {
                this.loading = false
                this.showError('Agendamento falhou', `Não foi possível agendar aula zero. <br> ${getError(res)}`, e)
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
            this.visible = false;
            this.visibleChange();
        });
        this.subscription.push(onClose);
    }

}
