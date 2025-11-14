import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, viewChildren } from '@angular/core';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { Professor } from '../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../models/sala-aula.model';
import { Apostila, ApostilaTipo } from '../../../models/apostila.model';
import { Roteiro } from '../../../models/roteiro.model';
import { MobileService, ScreenWidth } from '../../../utils/mobile';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';
import { CalendarioUtils, getError, MensagemWhatsapp, showError, validaAlunos, validaAlunoSalaAula, validaProfessores, validaSalaAulas } from '../../../utils';
import { ApostilaService } from '../../../services/apostila.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { showAluno } from '../../../utils/show-aluno';
import { Evento_Participacao_Aluno, statusContato } from '../../../models/evento-participacao-aluno.model';
import { NgForm, NgModel } from '@angular/forms';
import { SelectChangeEvent } from 'primeng/select';
import moment from 'moment';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import { TurmaService } from '../../../services/turma.service';
import { SalaAulaService } from '../../../services/sala-aula.service';
import { ProfessorService } from '../../../services/professor.service';
import { Turma } from '../../../models/turma.model';
import { Aluno } from '../../../models/alunos.model';
import { CalendarioRequest } from '../../../models/calendario.model';
import { ToastrService } from 'ngx-toastr';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { EventoChamadaRequest } from '../../../models/evento-chamada.model';

@Component({
  selector: 'app-editar-aula',
  standalone: false,
  templateUrl: './editar-aula.component.html',
  styleUrl: './editar-aula.component.css',
  providers: [ConfirmationService]
})
export class EditarAulaComponent implements OnInit, OnDestroy  {
	subscription: Subscription[] = [];
	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;
    activeIndexAluno = 0;
    
	view = new EditarAulaView;
    evento: Evento = new Evento;
    duracaoEvento = '';
    roteiro?: Roteiro;
    tipoString = '';

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

    apostilas: Apostila[] = [];
    loadingApostila = false;

    ScreenWidth = ScreenWidth;
    screen = ScreenWidth.lg;
    EventoTipo = EventoTipo;
    SalaAulaId = SalaAulaId;

    @ViewChild('sala_Id') sala_Id!: NgModel;
    @ViewChildren('presencaButton') presencaButton!: QueryList<Button>;
    @ViewChildren('apostilaAbacoInput') apostilaAbacoInput!: QueryList<InputNumber>;
    @ViewChildren('apostilaAHInput') apostilaAHInput!: QueryList<InputNumber>;


    statusContato = statusContato;

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private confirmationService: ConfirmationService,
		public mensagemWhatsapp: MensagemWhatsapp,
		private mobileService: MobileService,
		private calendarioUtils: CalendarioUtils,
        private toastr: ToastrService,
        private service: EventoService,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
		private apostilaService: ApostilaService,
	) {

		this.instance = this.dialogService.getInstance(this.ref);

        let screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        let apostilas = this.apostilaService.listApostila.subscribe(res => this.apostilas = res);
        this.subscription.push(apostilas);

        if (this.apostilas.length == 0) {
            this.loadingApostila = true;
            lastValueFrom(this.apostilaService.getApostilas())
                .then(res => this.loadingApostila = false)
                .catch(res => this.loadingApostila = false);

        }
    
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

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
        this.subscription.push(eventos)
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
            this.evento = this.view.evento;
            this.getDuracaoEvento();
            this.tipoString = this.getTipo(this.evento);
            this.setApostilasAlunos();
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

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
    }

    getDuracaoEvento() {
                let minutos = this.evento.duracaoMinutos % 60
                let horas = this.evento.duracaoMinutos / 60
                let horaRedonda = horas - Math.floor(horas) == 0

                this.duracaoEvento = horaRedonda
                    ? horas.toString().padStart(2, '0') + 'h'
                    : horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';}

    async verificaDisponibilidade() {

        let valid = true

        this.loadingEventos = true
        let request: CalendarioRequest = new CalendarioRequest

        let data = moment(this.evento.data).format('YYYY-MM-DD')

        request.intervaloDe = moment(data).toDate()
        request.intervaloAte = moment(data).add(1, 'day').toDate()

        this.loadingEventos = true
        await lastValueFrom(this.service.getList(request))
            .then(res => (this.loadingEventos = false))
            .catch(res => (this.loadingEventos = false))

        this.validaProfessores();
        this.validaSalaAulas();
        this.validaAlunos();
        this.validaAlunoSalaAula();

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

    validaAlunoSalaAula() {
        let valid = true;
        let alunos: Aluno[] = [];

        this.evento.alunos.map(participacao => {
            valid = validaAlunoSalaAula(
                this.evento.sala_Id,
                participacao.aluno_Id,
                this.salaAulas,
                this.alunos
            );
            if (!valid) {
                let aluno = this.alunos.find(x => x.id == participacao.aluno_Id) as Aluno;
                alunos.push(aluno)
            }
            
        })
        if (valid) {
            this.sala_Id.control.setErrors(null);
        }
        else {
            this.sala_Id.control.setErrors({ invalid: valid })
            this.showError(
                'Sala Incompativel', 
                '',
                { target: null });
        }
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaProfessores();

        let item = this.professores.find((x) => x.id == e.value)

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Educador indisponível' })
            let horario = moment(item.disponivelEvent.data).format('HH[h]mm');
            this.showError('Educador Indisponível', `Esse educador está atribuído a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${horario}</b>.`, e.originalEvent);
            return;
        } else {
            model.control.setErrors({ indisponivel: null })
        }
        model.control.updateValueAndValidity()
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaSalaAulas();
        
        let item = this.salaAulas.find((x) => x.id == e.value)

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            model.control.updateValueAndValidity();
            return
        } else {
            model.control.setErrors({ indisponivel: null });
            model.control.updateValueAndValidity();
        }

        let restricoesMessage = '';
        this.evento.alunos.forEach(aluno => {

        })

        if (restricoesMessage) {
            this.showError('Atenção', `Alguns alunos possuem restrições. <br>${restricoesMessage} <br> Tem certeza que deseja continuar?`, e);
        }

    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, aluno, e);
    }

    presente(item: Evento_Participacao_Aluno, status: any ) {
        item.presente = !item.presente;
    }

    async setApostilasAlunos() {
        if (this.apostilas.length == 0) {
            this.loadingApostila = true
            await lastValueFrom(this.apostilaService.getApostilas())
                .then(res => {
                    this.loadingApostila = false
                    this.apostilas = res;
                })
                .catch(res => this.loadingApostila = false)
        }

        this.evento.alunos.forEach(aluno => {
            aluno.apostilasAbacoList = this.apostilas.filter(apostila => {
                const ehAbaco = apostila.apostila_Tipo_Id == ApostilaTipo.Abaco;
                const temKit = aluno.apostila_Kit_Id;
                const temApostilaNoDia = aluno.apostila_Abaco_Id;
                const ehKitCompativel = !temKit || aluno.apostila_Kit_Id == apostila.apostila_Kit_Id;
                const ehApostilaDoDia = !temApostilaNoDia || aluno.apostila_Abaco_Id == apostila.id;
                const condicao = ehAbaco && (ehKitCompativel || ehApostilaDoDia);
                return condicao
            });

            aluno.apostilasAHList = this.apostilas.filter(apostila => {
                const ehAH = apostila.apostila_Tipo_Id == ApostilaTipo.AH;
                const temKit = aluno.apostila_Kit_Id;
                const temApostilaNoDia = aluno.apostila_AH_Id;
                const ehKitCompativel = !temKit || aluno.apostila_Kit_Id == apostila.apostila_Kit_Id;
                const ehApostilaDoDia = !temApostilaNoDia || aluno.apostila_Abaco_Id == apostila.id;
                const condicao = ehAH && (ehKitCompativel || ehApostilaDoDia)
                return condicao;
            });

            aluno.numeroPaginaAbaco = aluno.numeroPaginaAbaco ?? 0;
            aluno.numeroPaginaAH = aluno.numeroPaginaAH ?? 0;

            if (aluno.apostila_Abaco_Id) {
                aluno.apostilaAbacoObject = this.apostilas.find(x => x.id == aluno.apostila_Abaco_Id) as Apostila;
            } else {
                aluno.apostilaAbacoObject = aluno.apostilasAbacoList[0];
                aluno.apostila_Abaco_Id = aluno.apostilaAbacoObject.id;
                aluno.apostila_Abaco = aluno.apostilaAbacoObject.nome;
            }

            if (aluno.apostila_AH_Id) {
                aluno.apostilaAHObject = this.apostilas.find(x => x.id == aluno.apostila_AH_Id) as Apostila;
            }
            else {
                aluno.apostilaAHObject = aluno.apostilasAHList[0];
                aluno.apostila_AH_Id = aluno.apostilaAHObject.id;
                aluno.apostila_AH = aluno.apostilaAHObject.nome;
            }
        })
    }

    clonedRow: { [aluno_Id: number]: Evento_Participacao_Aluno } = {}

    inputFocus(e: any, item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item }
    }

    //
    // Abaco
    //

    apostilaAbacoClick(item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item }
    }

    apostilaAbacoChange(item: Evento_Participacao_Aluno, e: SelectChangeEvent) {
        let newApostila = item.apostilaAbacoObject as Apostila
        let oldApostila = this.clonedRow[item.aluno_Id].apostilaAbacoObject as Apostila

        if (
            newApostila.id != oldApostila.id &&
            newApostila.ordem < oldApostila.ordem
        ) {
            this.confirmationService.confirm({
                target: e.originalEvent.target as EventTarget,
                message: `Tem certeza que deseja regredir a apostila desse aluno?`,
                header: 'Regredir apostila?',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Sim',
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    // Seta nova apostila e página e máximo permitido
                    item.numeroPaginaAbaco = 1
                    item.apostila_Abaco_Id = newApostila.id;
                    item.apostila_Abaco = newApostila.nome;
                },
                reject: () => {
                    // Seta antiga apostila e página e máximo permitido
                    item.apostila_Abaco_Id = oldApostila.id;
                    item.apostila_Abaco = oldApostila.nome;
                },
            })
        } else {
            // Seta nova apostila e página e máximo permitido
            item.apostila_Abaco = newApostila.nome;
            item.apostila_Abaco_Id = newApostila.id;
            item.numeroPaginaAbaco = 1;
        }
    }

    numeroPaginaAbacoChange(item: Evento_Participacao_Aluno, e: any, model: NgModel) {
        let prev = this.clonedRow[item.aluno_Id];
        let current = item;


        if (current.numeroPaginaAbaco == null) {
            model.control.setErrors({ required: true });
            return this.showError('Inserir página', "Insira um valor para a página!", e);
        }
        else if (current.numeroPaginaAbaco < prev.numeroPaginaAbaco && prev.apostila_Abaco_Id == current.apostila_Abaco_Id) {
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno está regredindo a página da apostila "${current.apostila_Abaco}"?`,
                header: 'Regredir página?',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: `Sim, regredir página`,
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    item.numeroPaginaAbaco = prev.numeroPaginaAbaco;
                },
            })
        }
    }

    //
    // AH
    //

    apostilaAHClick(item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item };
    }

    apostilaAHChange(item: Evento_Participacao_Aluno, e: SelectChangeEvent) {

        let newApostila = this.apostilas.find(x => x.id == item.apostila_AH_Id) as Apostila;
        let oldApostila = this.apostilas.find(x => x.id == this.clonedRow[item.aluno_Id].apostila_AH_Id) as Apostila;

        if (newApostila.id != oldApostila.id && newApostila.ordem < oldApostila.ordem) {
            this.confirmationService.confirm({
                target: e.originalEvent.target as EventTarget,
                message: `Tem certeza que deseja regredir a apostila desse aluno?`,
                header: 'Regredir apostila?',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Sim',
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    // Seta nova apostila e página e máximo permitido
                    item.numeroPaginaAH = 1;
                    item.apostila_AH_Id = newApostila.id;
                    item.apostila_AH = newApostila.nome;
                },
                reject: () => {
                    // Seta antiga apostila e página e máximo permitido
                    item.apostila_AH_Id = oldApostila.id;
                    item.apostila_AH = oldApostila.nome;
                },
            })
        } else {
            // Seta nova apostila e página e máximo permitido
            item.apostila_AH = newApostila.nome;
            item.apostila_AH_Id = newApostila.id;
            item.numeroPaginaAH = 1;
        }
    }

    numeroPaginaAHChange(item: Evento_Participacao_Aluno, e: any, model: NgModel) {
        let prev = this.clonedRow[item.aluno_Id];
        let current = item;

        if (current.numeroPaginaAH == null) {
            model.control.setErrors({ required: true });
            return this.showError('Inserir página', "Insira um valor para a página!", e);
        }
        if (current.numeroPaginaAH < prev.numeroPaginaAH && prev.apostila_AH_Id == current.apostila_AH_Id) {
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno está regredindo a página da apostila "${current.apostila_AH}"?`,
                header: 'Regredir página?',
                acceptLabel: `Sim, regredir página`,
                rejectLabel: 'Não',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    item.numeroPaginaAH = prev.numeroPaginaAH;
                },
            })
        }
    }

    presencaPrev(index: number, e: any) {
        let newIndex = index - 1;

        if (index <= 0) {
            newIndex = this.presencaButton.length - 1;
        }
    
        let element = this.presencaButton.get(newIndex);
        let button = $(`p-button[${element?.attrSelector}]`).find('button')

        button.trigger('focus');
    }

    presencaNext(index: number, e: any) {
        let newIndex = index + 1;

        if (index >= this.presencaButton.length - 1) {
            newIndex = 0;
        }

        let element = this.presencaButton.get(newIndex);
        let button = $(`p-button[${element?.attrSelector}]`).find('button')

        button.trigger('focus');
    }

    apostilaAbacoInputNumberNext(index: number, inputNumber: InputNumber) {
        let newIndex = index + 1;

        
        if (index >= this.presencaButton.length - 1) {
            newIndex = 0;
        }

        var row = this.evento.alunos[newIndex];
        if (row.presente === false) {
            this.apostilaAbacoInputNumberNext(newIndex, inputNumber)
            return 
        }

        let element = this.apostilaAbacoInput.get(newIndex)
        element?.input.nativeElement.focus();
    }

    apostilaAHInputNumberNext(index: number, inputNumber: InputNumber) {
        let newIndex = index + 1;
        
        if (index >= this.presencaButton.length - 1) {
            newIndex = 0;
        }

        var row = this.evento.alunos[newIndex];
        if (row.presente === false) {
            this.apostilaAHInputNumberNext(newIndex, inputNumber)
            return 
        }

        let element = this.apostilaAHInput.get(newIndex)
        element?.input.nativeElement.focus();
    }

    apostilaAbacoInputNumberPrev(index: number, inputNumber: InputNumber) {
        let newIndex = index - 1;

        if (index <= 0) {
            newIndex = this.presencaButton.length - 1;
        }

        var row = this.evento.alunos[newIndex];
        if (row.presente === false) {
            this.apostilaAbacoInputNumberPrev(newIndex, inputNumber)
            return 
        }

        let element = this.apostilaAbacoInput.get(newIndex)
        element?.input.nativeElement.focus();
    }

    apostilaAHInputNumberPrev(index: number, inputNumber: InputNumber) {
        let newIndex = index - 1;

        if (index <= 0) {
            newIndex = this.presencaButton.length - 1;
        }

        var row = this.evento.alunos[newIndex];
        if (row.presente === false) {
            this.apostilaAHInputNumberPrev(newIndex, inputNumber)
            return 
        }

        let element = this.apostilaAbacoInput.get(newIndex)
        element?.input.nativeElement.focus();
    }

    showAluno(participacao: Evento_Participacao_Aluno) {
        showAluno(participacao.aluno_Id, this.dialogService);
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
                if (res.success) {
                    this.service.calendarioReload.emit(res.object.id)
                    this.evento.id = res.object.id
                    this.service.setEvento(this.evento)
                    this.toastr.success('Dados atualizados com sucesso.')
                }
                this.loading = false
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
                        this.service.calendarioReload.emit(this.evento.id)
                        this.toastr.success(`${this.tipoString} finalizada com sucesso.`, 'Sucesso');
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
        const request = this.buildFinalizar(eventoResponse);
        return lastValueFrom(this.service.finalizar(request))
    }


    contatoToggle(item: Evento_Participacao_Aluno) {
        if (item.alunoContactado) {
            item.alunoContactado = undefined
        }
        else {
            item.alunoContactado = new Date;
        } 
    }

    getTurma(turma_Id?: number) {
        var turma = this.turmas.find(x => x.id == turma_Id)
        return turma;
    }

}


export class EditarAulaView {
	evento: Evento = new Evento;
}
