import { Component, OnDestroy } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { Turma } from '../../../../../models/turma.model';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getError } from '../../../../../utils';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { AlunoService } from '../../../../../services/alunos.service';
import { EventoService } from '../../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { TurmaService } from '../../../../../services/turma.service';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import moment from 'moment';
import { SelectChangeEvent } from 'primeng/select';
import { NgForm, NgModel } from '@angular/forms';
import { PseudoEvento } from '../../../../../models/reposicao.model';
import { MyMap } from '../../../../../utils/map';
import { EventoOficinaRequest } from '../../../../../models/evento-oficina.model';
import { RequestResponse } from '../../../../../helpers/request-response.interface';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { ChecklistService } from '../../../../../services/checklist.service';
import { AccountService } from '../../../../../services/account.service';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';

@Component({
    selector: 'app-cadastrar-inscricao',
    standalone: false,
    templateUrl: './cadastrar-inscricao.component.html',
    styleUrl: './cadastrar-inscricao.component.css',
    providers: [ConfirmationService]

})
export class CadastrarInscricaoComponent implements OnDestroy {
    object: Evento = new Evento;

    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    duracaoEvento = '';
    EventoTipo = EventoTipo;

    selectedAluno?: Aluno;
    mensagensEnviadasAlunos: Aluno[] = [];
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

    PseudoEvento = PseudoEvento;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private turmaService: TurmaService,
        private service: EventoService,
        private checklistService: ChecklistService,
        private accountService: AccountService,
    ) {

        var params = this.activatedRoute.snapshot.params;
        if (!params['evento_id']) {
            this.visible = false;
            this.visibleChange();
            return
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

        // if (this.alunos.length == 0) {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getList())
            .then(res => this.loadingAlunos = false)
            .catch(res => this.loadingAlunos = false);
        // }

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active == true));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
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
                this.object = res;
                this.visible = true;
                this.verificaDisponibilidade();


                var minutos = this.object.duracaoMinutos % 60
                var horas = this.object.duracaoMinutos / 60;
                var horaRedonda = (horas - Math.floor(horas)) == 0;

                this.duracaoEvento = horaRedonda ?
                    horas.toString().padStart(2, '0') + 'h' :
                    horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';


                var alunosOficina = this.object.alunos.map(x => x.aluno_Id);
                this.alunos = this.alunos.filter(x => alunosOficina.includes(x.id) == false)
            }
        });
        this.subscription.push(evento);


        setTimeout(() => {
            if (!this.object) {
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
            this.router.navigate(['../../../../'], { relativeTo: this.activatedRoute });
            this.service.setEvento(undefined)
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

        request.intervaloDe = moment(this.object.data, 'YYYY-MM-DD').toDate();
        request.intervaloAte = moment(this.object.data, 'YYYY-MM-DD').add(1, 'day').toDate();

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
        var data = this.object.data;
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        var data = this.object.data;
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
    }

    validaAlunos() {
        var data = this.object.data;
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

    alunoChanged(e: SelectChangeEvent, model: NgModel) {
        var aluno = e.value as Aluno;
        if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Aluno indisponível' });
            this.showError('Aluno Indisponível', `Esse aluno tem outra ${this.getTipo(aluno.disponivelEvent)} no mesmo dia às <b>${moment(aluno.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
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
    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular)
    }

    enviarMensagemInscricao(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagemInscricao(nome, celular, this.object);
    }

    sendConfirmation(form: NgForm, e: any) {
        console.log('aluno', this.selectedAluno)

        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        if (!this.selectedAluno) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        this.confirmationService.confirm({
            target: e.target,
            header: 'Salvar oficina',
            message: `Salvar dados e inscrever aluno(a) ${this.selectedAluno.nome.split(' ')[0]}?`,
            acceptLabel: `Salvar`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.send(e);
            }
        })

    }

    async send(e: any) {

        this.loading = true;
        var response: RequestResponse = { success: false, message: '', object: undefined };

        if (this.object.id == PseudoEvento.EventoId) {
            response = await lastValueFrom(this.requestOficina());
            this.object.id = response.object.id;
        }

        lastValueFrom(this.service.inscrever(this.selectedAluno!.id, this.object.id))
            .then(res => {
                this.loading = false;
                this.toastrService.success('Oficina cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
                this.markChecklistAsDone();
                if (this.selectedAluno!.celular) {
                    this.sendMensagemAlunos(e, this.object)
                } else {
                    this.visible = false
                    this.visibleChange();
                }
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível finalizar inscrição. <br> ${getError(res)}`, e);
            })

    }

    requestOficina() {
        var request = MyMap(this.object, new EventoOficinaRequest);
        request.alunos = [];
        request.professores = [this.object.professor_Id];
        request.data = new Date(this.object.data);
        request.data = moment(this.object.data).format('YYYY-MM-DD[T]HH:mm') as any;

        return this.service.createOficina(request);
    }

    sendMensagemAlunos(e: any, evento: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Inscrição concluída com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptButtonStyleClass: 'p-button-sm p-button-rounded p-button-success  px-3 mr-0',
            acceptIcon: 'pi pi-whatsapp',
            rejectLabel: 'Não enviar',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.visible = false
                this.visibleChange();
                var url = this.mensagemWhatsapp.enviarMensagemConfirmacao(this.selectedAluno!.nome, this.selectedAluno!.celular, evento);
                window.open(url, '_target');
            },
            reject: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }

    markChecklistAsDone() {
        // Agendar 1ª Oficina ou 2ª 
        // checklist_Item_Id 12 ou 23
        var aluno = this.selectedAluno as Aluno;
        var alunoChecklist = aluno.alunoChecklist.find(x => (x.checklist_Item_Id == 12 || x.checklist_Item_Id == 23) && !x.finalizado) as Aluno_CheckList_Item;
        console.log('aluno', this.selectedAluno)
        if (alunoChecklist) {
            var mensagem = `Inscrição na oficina do dia ${moment(this.object.data).format('DD/MM/YY [às] HHH[h]mm')}. \n
                            Inscrição realizada por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HHH[h]mm')}}`
            if (alunoChecklist && !alunoChecklist.finalizado) {
                lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
            }
        }
    }


}
