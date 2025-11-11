import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnDestroy, AfterViewInit } from '@angular/core'

import { ConfirmationService } from 'primeng/api'

import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom, Subscription } from 'rxjs';
import { PseudoEvento, PrimeiraAulaRequest } from '../../../../../models/reposicao.model';
import { Aluno } from '../../../../../models/alunos.model';
import { Roteiro } from '../../../../../models/roteiro.model';
import { Feriado } from '../../../../../models/feriado.model';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { EventoAulaRequest } from '../../../../../models/evento-aula.model';
import { PerfilCognitivo } from '../../../../../models/perfil-cognitivo.model';

import { showError, validaAlunoSalaAula } from '../../../../../utils';
import { MyMap } from '../../../../../utils/map';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { RequestResponse } from '../../../../../helpers/request-response.interface';

import { AlunoService } from '../../../../../services/alunos.service';
import { EventoService } from '../../../../../services/evento.service';
import { ChecklistService } from '../../../../../services/checklist.service';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import { SalaAndar } from '../../../../../models/sala-aula.model';
import { SalaAulaService } from '../../../../../services/sala-aula.service';

@Component({
    selector: 'app-agendar-primeira-aula-aluno',
    standalone: false,
    templateUrl: './primeira-aula-aluno.component.html',
    styleUrl: './primeira-aula-aluno.component.css',
    providers: [ConfirmationService],
})
export class PrimeiraAulaAlunoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = false
    loading = false
    error: string = ''
    subscription: Subscription[] = []
    legenda: { corLegenda: string; label: string }[] = []

    selectedAula?: any
    selectedEvento?: Evento
    restricaoCheck: boolean = false

    evento: Evento = new Evento()
    eventos: Evento[] = []
    tipoString = ''
    corLegenda: string = ''

    currentTitle: string = ''
    roteiros: Roteiro[] = []
    loadingRoteiro = false

    feriados: Feriado[] = []
    loadingFeriados = false

    alunos: Aluno[] = []
    loadingAlunos = false
    selectedAluno?: Aluno = undefined
    
    SalaAndar = SalaAndar;
    EventoTipo = EventoTipo
    
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,

        private service: EventoService,
        private alunoService: AlunoService,
        private toastrService: ToastrService,
        private confirmationService: ConfirmationService,
        private calendarioUtils: CalendarioUtils,
        private checklistService: ChecklistService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private accountService: AccountService,
        private salaAulaService: SalaAulaService,
    ) {
        let alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res;
            this.setAlunos();
        })
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAlunos = true
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false)
        }

        let evento = this.service.getEvento().subscribe(res => {
            if (res) {
                this.evento = res
                this.tipoString = this.getTipo(this.evento);
                this.setAlunos();
                this.visible = true
            }
        })
        this.subscription.push(evento)

        setTimeout(() => {
            if (!this.evento) {
                this.visible = false
                this.visibleChange()
            }
        }, 1000)
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            let route = ['../../../']
            this.router.navigate(route, { relativeTo: this.activatedRoute })
        }
    }

    setAlunos() {
        if (this.alunos.length && this.evento) {
            this.alunos = this.alunos.filter(x => x.active || moment(x.deactivated).isSameOrAfter(this.evento.data, 'date'))

            if (this.evento.vagasDisponiveisEvento === 0) {
                let eventoAlunos = this.evento.alunos.map(x => x.aluno_Id);
                this.alunos = this.alunos.filter(x => !eventoAlunos.includes(x.id));
            }


            this.alunos = this.alunos.filter(aluno => {
                let salaCompativel = !aluno.restricaoMobilidade || this.evento.andar > SalaAndar.Terreo;
                let primeiraAulaJaAgendadaNoEvento = aluno.primeiraAula_Id == this.evento.id;
                let primeiraAulaAgendada = aluno.primeiraAula_Id;

                return salaCompativel
                && !primeiraAulaJaAgendadaNoEvento
                && !primeiraAulaAgendada
            });

        }
    }

    getSala() {
        var andar = this.evento.andar > SalaAndar.Terreo ? this.evento.andar + 'º andar' : 'Térreo'
        return this.evento.sala + ' - ' + andar
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e);
    }

    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        
        if (!perfilCognitivo || perfilCognitivo.length == 0)
            return '';
        return perfilCognitivo.map((x) => x.nome).join(', ');
    }

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
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

    formatDate(evento: Evento) {
        return this.calendarioUtils.formatDate(evento.data)
    }

    sendConfirmation(e: any) {
        if (!this.selectedAluno) {
            this.toastrService.error('Selecione um aluno')
        } else {
            let data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar primeira aula do aluno <b>${this.selectedAluno.nome} </b> para o dia <b>${data}</b>?`,
                header: 'Agendar primeira aula',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Agendar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    this.send(e)
                },
                reject: () => { },
            })
        }
    }

    async send(e: any) {
        this.loading = true

        let request = new PrimeiraAulaRequest()
        request.aluno_Id = this.selectedAluno!.id
        request.evento_Id = this.evento.id

        let response: RequestResponse = {
            success: true,
            message: '',
            object: undefined,
        }

        // Se a aula target não existir, cria a aula
        if (request.evento_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(this.evento)
            request.evento_Id = response.object.id
            if (!response.success) {
                return this.showError(
                    'Primeira aula não agendada',
                    `Ocorreu um erro ao agendar primeira aula. <br> ${response.message}`,
                    e,
                )
            }
        }

        lastValueFrom(this.service.primeiraAula(request))
            .then(response => {
                if (response.success) {
                    this.service.calendarioReload.emit(request.evento_Id);
                    this.toastrService.success(response.message);
                    this.markChecklistAsDone();

                    if (this.selectedAluno?.celular) {
                        this.sendMensagemAluno(e, this.evento);
                    } else {
                        this.visible = false
                        this.visibleChange()
                    }

                } else {
                    this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, response.message)
                }

            })
            .catch(res => {
                this.loading = false;
                this.showError('OPS', 'Não foi possível agendar a primeira aula.', e, res.message)
            })
    }


    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }

    sendMensagemAluno(e: any, evento: Evento) {
        let aluno = this.selectedAluno as Aluno
        this.confirmationService.confirm({
            target: e.target,
            message: `Primeira aula agendada com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptIcon: 'pi pi-whatsapp',
            rejectIcon: 'pi pi-times',
            acceptLabel: `Enviar mensagem`,
            rejectLabel: 'Não enviar',
            acceptButtonStyleClass: 'p-button-rounded p-button-success',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange()
                let object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento)
                window.open(object.link, '_target')
                this.mensagemWhatsapp.copiarMensagem(object.mensagem)
            },
            reject: () => {
                this.visible = false
                this.visibleChange()
            },
        })
    }

   async markChecklistAsDone() {
        // let aluno = this.selectedAluno as Aluno
        // aluno = await lastValueFrom(this.alunoService.get(aluno.id));   
        // // Agendamento na 1ª aula 
        // if (aluno) {
        //     const id = 38;
        //     const alunoChecklist = aluno.alunoChecklist.find((x) => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
        //     const professor = this.evento.professor;
        //     const data = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
        //     const dataAgendamento = moment().format('DD/MM/YY [aproximadamente às] HH[h]mm');
        //     const account = this.accountService.accountValue?.name;

        //     if (alunoChecklist && !alunoChecklist.finalizado) {
        //         const mensagem = `Aula 0 agendada para o dia ${data} com o educador(a) ${professor}.<br> Agendamento realizado por ${account} no dia ${dataAgendamento}`;
        //         if (alunoChecklist && !alunoChecklist.finalizado) {
        //             lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem));
        //         }
        //     }
        // }
    }
}
