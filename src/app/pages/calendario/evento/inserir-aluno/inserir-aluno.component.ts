import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../../models/alunos.model';
import { CalendarioUtils, Crypto, getError, MensagemWhatsapp, showError, validaAlunos, playSuccess, playAlert } from '../../../../utils';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { AlunoService } from '../../../../services/alunos.service';
import { EventoService } from '../../../../services/evento.service';
import { CalendarioRequest } from '../../../../models/calendario.model';
import moment from 'moment';
import { SelectChangeEvent } from 'primeng/select';
import { NgForm, NgModel } from '@angular/forms';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { MyMap } from '../../../../utils/map';
import { RequestResponse } from '../../../../helpers/request-response.interface';
import { EventoAula0Request } from '../../../../models/evento-aula-0.model';
import { EventoSuperacaoRequest } from '../../../../models/evento-superacao.model';
import { Aluno_CheckList_Item } from '../../../../models/checklist.model';
import { AccountService } from '../../../../services/account.service';
import { ChecklistService } from '../../../../services/checklist.service';
import { Turma } from '../../../../models/turma.model';
import { TurmaService } from '../../../../services/turma.service';
import { SalaAula, SalaAulaId } from '../../../../models/sala-aula.model';
import { AlunoRestricaoService } from '../../../../services/aluno-restricao.service';
import { SalaAulaService } from '../../../../services/sala-aula.service';

@Component({
    selector: 'app-inserir-aluno',
    standalone: false,
    templateUrl: './inserir-aluno.component.html',
    styleUrl: './inserir-aluno.component.css',
    providers: [ConfirmationService]
})
export class InserirAlunoComponent {
    evento: Evento = new Evento;

    visible: boolean = false;
    loading = false;
    subscription: Subscription[] = [];
    tipoString = '';
    PseudoEvento = PseudoEvento;
    SalaAulaId = SalaAulaId;

    selectedAluno?: Aluno;
    alunos: Aluno[] = [];
    loadingAlunos = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    salas: SalaAula[] = [];
    loadingSalas = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private crypto: Crypto,
        private alunoService: AlunoService,
        private alunoRestricaoService: AlunoRestricaoService,
        private service: EventoService,
        private calendarioUtils: CalendarioUtils,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastrService: ToastrService,
        private accountService: AccountService,
        private checklistService: ChecklistService,
        private turmaService: TurmaService,
        private salaAulaService: SalaAulaService,
        

    ) {

        let params = this.activatedRoute.snapshot.params;
        if (!params['evento_id'] || !params['evento_nome']
            || !['aula-zero', 'superacao'].includes(params['evento_nome'])) {
            this.visible = false;
            this.visibleChange();
            return
        }

        let turmas = this.turmaService.list.subscribe((res) => (this.turmas = res));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then((res) => (this.loadingTurmas = false))
                .catch((res) => (this.loadingTurmas = false));
        }

        let salas = this.salaAulaService.list.subscribe((res) => (this.salas = res));
        this.subscription.push(salas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then((res) => (this.loadingTurmas = false))
                .catch((res) => (this.loadingTurmas = false));
        }

        let alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active == true);
            if (params['evento_nome'] == 'aula-zero') {
                this.alunos = this.alunos.filter(x => !x.aulaZero_Id);
            }
            this.setAlunos();
        });
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
        this.subscription.push(eventos);

        let evento = this.service.evento.subscribe(async res => {
            if (!res) {
                try {
                    let decrypted = this.crypto.decrypt(params['evento_id']);
                    if (params['evento_id'] && decrypted && decrypted != PseudoEvento.EventoId) {
                        await lastValueFrom(this.service.get(decrypted))
                            .then(res => {
                                this.service.setEvento(res);
                                this.evento = res;
                            })
                            .catch(res => {
                                this.visible = false;
                                this.visibleChange();
                            })
                    } else {
                        let evento = JSON.parse(localStorage.getItem('evento') ?? '')
                        this.service.setEvento(evento)
                    }
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

                this.setAlunos();
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
            this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    setAlunos() {
        if (this.evento && this.alunos.length) {
            let alunosInseridos = this.evento.alunos.map(x => x.aluno_Id);
            this.alunos = this.alunos.filter(x => x.active && !alunosInseridos.includes(x.id));
            if (this.evento.evento_Tipo_Id == EventoTipo.AulaZero) {
                this.alunos = this.alunos.filter(x => !x.aulaZero_Id);
            }
        }
    }

    async verificaDisponibilidade() {
        let valid = true;

        this.loadingEventos = true;
        let request: CalendarioRequest = new CalendarioRequest;

        request.intervaloDe = moment(this.evento.data, 'YYYY-MM-DD').toDate();
        request.intervaloAte = moment(this.evento.data, 'YYYY-MM-DD').add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.calendario(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaAlunos();

        return valid;
    }

    validaAlunos() {
        let data = this.evento.data;
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
    }

    alunoChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaAlunos();
        let aluno = e.value as Aluno;
        let salaAula =  this.salas.find(x => x.id == this.evento.sala_Id) as SalaAula;
        if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
    
            this.selectedAluno = undefined;
            this.showError('Aluno Indisponível', `${aluno.nome.split(' ')[0]} tem ${this.getTipo(aluno.disponivelEvent)} no mesmo dia às <b>${moment(aluno.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        else if (aluno.restricaoMobilidade && salaAula && salaAula.andar > 1) {
    
            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' });
            this.showError('Restrição de Mobilidade', `O ${aluno.nome.split(' ')[0]} tem restrição de mobilidade e não pode participar da aula zero na sala ${salaAula.numeroSala} - ${salaAula.andar}º andar.`, e.originalEvent);
            return;
        }

        model.control.updateValueAndValidity();

        this.loadAluno(e.originalEvent, aluno);
    }

    loadAluno(e: any, aluno: Aluno) {
        this.loadingAlunos = true;
        this.loading = true;

        lastValueFrom(this.alunoService.get(aluno.id))
        .then(res => {
        
                aluno = res;

                this.loadingAlunos = false;
                this.loading = false;

                let restricoes = aluno.restricoes.filter(x => x.active === true);
                let restricaoMobilidade = aluno.restricaoMobilidade;
                if (restricoes.length > 0 || restricaoMobilidade) {
                    let mensagem = 'Esse aluno possui algumas restrições: ';

                    if (restricaoMobilidade)
                        mensagem += '• Restrição de mobilidade <br>';

                    mensagem += restricoes.map(x => '• ' + x.descricao).join('<br>');
                    mensagem += `<br> Tem certeza que deseja inserir ele nessa aula zero?`;
            

                    this.confirmationService.confirm({
                        target: e.target,
                        header: 'Inserir aluno',
                        message: mensagem,
                        acceptLabel: `Continuar`,
                        acceptIcon: 'pi pi-check',
                        acceptButtonStyleClass: 'p-button-rounded',
                        rejectIcon: 'pi pi-times',
                        rejectLabel: 'Cancelar',
                        rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                        accept: () => {
                    
                        },
                        reject: () => {
                    
                            this.selectedAluno = undefined;
                        }
                    })
                }
            })
            .catch(res => {
                this.showError('Erro', `Não foi possível carregar restrições de ${aluno.nome}`, e);
                this.loadingAlunos = false;
                this.loading = false;
            })

    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find((x) => x.id == turma_Id)?.corLegenda ?? '';
    }



    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
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

    enviarMensagemInscricao(aluno: Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagemInscricao(aluno.nome, aluno.celular, this.evento);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    sendConfirmation(form: NgForm, e: any) {

        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        if (!this.selectedAluno) {
            return this.showError('Não foi possível salvar', 'Selecione um aluno para inserir na ' + this.tipoString, e)
        }

        // playAlert();
        let aluno = this.selectedAluno as Aluno;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Inserir aluno',
            message: `Tem certeza que deseja inserir o aluno selecionado? <br> ${aluno.nome}`,
            acceptLabel: `Inserir`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }
        })

    }

    async send(e: any) {

        this.loading = true;
        let aluno = this.selectedAluno as Aluno;

        lastValueFrom(this.service.inscrever(aluno.id, this.evento.id))
            .then(res => {
                this.loading = false;
                this.toastrService.success('Inscrição realizada com sucesso', 'Inscrição realizada');
                this.service.calendarioReload.emit(0);
                this.sendMensagemAlunos(e);
                // playSuccess();
            })
            .catch(res => {
                this.showError('Agendamento falhou', `Não foi possível inscrever o aluno ${aluno.nome}. <br> ${getError(res)}`, e);
            })



    }


    sendMensagemAlunos(e: any) {
        let aluno = this.selectedAluno as Aluno;
        if (aluno.celular) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Agendamento concluído com sucesso. \n Envie uma mensagem de confirmação para o aluno que irá participar da ${this.tipoString}.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptButtonStyleClass: 'p-button-rounded p-button-success',
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                rejectIcon: 'pi pi-times',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    let object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, this.evento);
                    window.open(object.link, '_blank');
                    this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    
                    this.visible = false
                    this.visibleChange();
                },
                reject: () => {
                    this.visible = false
                    this.visibleChange();
                }
            });
        }
    }

    markChecklistAsDone() {
        let aluno = this.selectedAluno as Aluno;
        if (this.evento.evento_Tipo_Id == EventoTipo.AulaZero) {
            this.checklistAula0(aluno);
        } else if (this.evento.evento_Tipo_Id == EventoTipo.Superacao) {
            this.checklistSuperacao(aluno);
        }
    }

    checklistSuperacao(aluno: Aluno) {
        let alunoChecklist = aluno.alunoChecklist.find(x => (x.checklist_Item_Id == 22 || x.checklist_Item_Id == 29) && !x.finalizado) as Aluno_CheckList_Item;

        if (alunoChecklist && !alunoChecklist.finalizado) {
            let mensagem = `Superação agendada para o dia ${moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm')} com o educador ${this.evento.professor}.\n Agendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')}}`
            lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
        }
    }

    checklistAula0(aluno: Aluno) {
        // Agendamento na aula 0
        let id = 31;
        let alunoChecklist = aluno.alunoChecklist.find((x) => x.checklist_Item_Id == id) as Aluno_CheckList_Item;

        if (alunoChecklist && !alunoChecklist.finalizado) {
            let mensagem = `Aula 0 agendada para o dia ${moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm')} com o educador ${this.evento.professor}.\n Agendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')}}`;
            lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem));
        }
    }



}
