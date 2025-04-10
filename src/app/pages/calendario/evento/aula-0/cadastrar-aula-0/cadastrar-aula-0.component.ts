import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EventoAula0Request } from '../../../../../models/evento-aula-0.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../../../models/alunos.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError } from '../../../../../utils';
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
import { Evento } from '../../../../../models/evento.model';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { ChecklistService } from '../../../../../services/checklist.service';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';

@Component({
    selector: 'app-cadastrar-aula-0',
    standalone: false,
    templateUrl: './cadastrar-aula-0.component.html',
    styleUrl: './cadastrar-aula-0.component.css',
    providers: [ConfirmationService]
})
export class CadastrarAula0Component implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    object: EventoAula0Request = new EventoAula0Request;
    data: Date = undefined as unknown as Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();

    blockAlunoField = false;

    alunoSelected?: Aluno;
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

    @ViewChild('form') form!: NgForm;
    @ViewChild('formDiv') formDiv!: HTMLFormElement;
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
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private checklistService: ChecklistService,
        private accountService: AccountService,
    ) {

        this.object.descricao = 'Aula 0';

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

        var hoje = new Date;
        this.data = hoje;
        this.horario = hoje;
        this.horario.setHours(8, 0);

        this.verificaDisponibilidade();


        this.activatedRoute.params.subscribe(res => {
            if (res['aluno_Id']) {
                this.object.aluno_Id = this.crypto.decrypt(res['aluno_Id']);
                this.blockAlunoField = true;
            }
        });


        this.visible = true;
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
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

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (!this.alunoSelected) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        this.object.aluno_Id = this.alunoSelected.id;

        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula 0',
            message: `Tem certeza que deseja agendar a aula 0 do aluno ${this.alunoSelected.nome} para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`,
            acceptLabel: `Agendar aula 0`,
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

        lastValueFrom(this.service.createAula0(this.object))
            .then(res => {
                this.loading = false;
                this.object = res.object;
                this.service.calendarioReload.emit(res.object.id);
                if (this.alunoSelected?.celular) {
                    this.sendMensagemAlunos(e, res.object);
                }
                this.markChecklistAsDone();
                this.toastrService.success('Aula 0 cadastrada com sucesso.', 'Agendamento finalizado');
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar aula 0. <br> ${getError(res)}`, e);
            })

    }


    sendMensagemAlunos(e: any, evento: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Agendamento concluído com sucesso. <br> Clique para enviar mensagem de confirmação.`,
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
                var url = this.mensagemWhatsapp.enviarMensagemConfirmacao(this.alunoSelected!.nome, this.alunoSelected!.celular, evento);
                window.open(url, '_target');
            },
            reject: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }

    markChecklistAsDone() {
        // Agendamento na aula 0
        if (this.alunoSelected) {
            var id = 31;
            var alunoChecklist = this.alunoSelected.alunoChecklist.find(x => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
            var professor = this.professores.find(x => x.id == this.object.professor_Id) as Professor;

            if (!alunoChecklist.finalizado) {
                var mensagem = `Aula 0 agendada para o dia ${moment(this.object.data).format('DD/MM/YY [às] HHH[h]mm')} com o educador ${professor.nome}.\n
                                Agendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HHH[h]mm')}}`
                if (alunoChecklist && !alunoChecklist.finalizado) {
                    lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
                }
            }
        }
    }

}
