import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { Turma } from '../../../../../models/turma.model';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Crypto, getError, showError } from '../../../../../utils';
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
import $ from 'jquery';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { playAlert, playSuccess } from '../../../../../utils/audio';
import { MultiSelectChangeEvent } from 'primeng/multiselect';

@Component({
    selector: 'app-cadastrar-inscricao',
    standalone: false,
    templateUrl: './cadastrar-inscricao.component.html',
    styleUrl: './cadastrar-inscricao.component.css',
    providers: [ConfirmationService]

})
export class CadastrarInscricaoComponent implements OnDestroy {
    evento: Evento = new Evento;

    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    duracaoEvento = '';
    EventoTipo = EventoTipo;

    alunosSelected: Aluno[] = [];
    mensagensEnviadasAlunos: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

    // professores: Professor[] = [];
    // loadingProfessores = false;

    // salaAulas: SalaAula[] = [];
    // loadingSalaAulas = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    PseudoEvento = PseudoEvento;
    SalaAulaId = SalaAulaId;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private alunoService: AlunoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private turmaService: TurmaService,
        private service: EventoService,
        private checklistService: ChecklistService,
        private accountService: AccountService,
        private calendarioUtils: CalendarioUtils,
        private crypto: Crypto,
    ) {

        var params = this.activatedRoute.snapshot.params;
        if (!params['evento_id']) {
            this.visible = false;
            this.visibleChange();
            return
        }

        // var professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active == true));
        // this.subscription.push(professores);

        // if (this.professores.length == 0) {
        //     this.loadingProfessores = true;
        //     lastValueFrom(this.professorService.getList())
        //         .then(res => this.loadingProfessores = false)
        //         .catch(res => this.loadingProfessores = false);
        // }

        // var salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res.filter(x => x.active == true));
        // this.subscription.push(salaAula);

        // if (this.salaAulas.length == 0) {
        //     this.loadingSalaAulas = true;
        //     lastValueFrom(this.salaAulaService.getList())
        //         .then(res => this.loadingSalaAulas = false)
        //         .catch(res => this.loadingSalaAulas = false);
        // }

        var alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active == true);
            this.setAlunos();
        });
        this.subscription.push(alunos);

        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getListWithChecklist())
            .then(res => this.loadingAlunos = false)
            .catch(res => this.loadingAlunos = false);

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
                   var decrypted = this.crypto.decrypt(params['evento_id']);
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
                        var evento = JSON.parse(localStorage.getItem('evento') ?? '')
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


                var minutos = this.evento.duracaoMinutos % 60
                var horas = this.evento.duracaoMinutos / 60;
                var horaRedonda = (horas - Math.floor(horas)) == 0;

                this.duracaoEvento = horaRedonda ?
                    horas.toString().padStart(2, '0') + 'h' :
                    horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';

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
            this.router.navigate(['../../../../'], { relativeTo: this.activatedRoute });
            this.service.setEvento(undefined)
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    setAlunos() {
        if (this.evento && this.alunos.length) {
            

                var alunosOficina = this.evento.alunos.map(x => x.aluno_Id);
                this.alunos = this.alunos.filter(x => alunosOficina.includes(x.id) == false)
        }
    }


    async verificaDisponibilidade() {
        var valid = true;

        this.loadingEventos = true;
        var request: CalendarioRequest = new CalendarioRequest;

        request.intervaloDe = moment(this.evento.data, 'YYYY-MM-DD').toDate();
        request.intervaloAte = moment(this.evento.data, 'YYYY-MM-DD').add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.getList(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        // this.validaProfessores();
        // this.validaSalaAulas();
        this.validaAlunos();

        return valid

    }

    // validaSalaAulas() {
    //     var data = this.object.data;
    //     this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    // }

    // validaProfessores() {
    //     var data = this.object.data;
    //     this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);

    //     if (this.object.professor_Id) {
    //         var e: SelectChangeEvent = {
    //             value: this.object.professor_Id,
    //             originalEvent: { target: $('#professor_Id').get(0) as any } as any
    //         }
    //         this.professorChanged(e, this.professor_Id);
    //     }
    // }

    validaAlunos() {
        var data = this.evento.data;
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
    }


    // alunoChanged(e: SelectChangeEvent, model: NgModel) {
    alunoChanged(e: MultiSelectChangeEvent, model: NgModel) {
        var aluno = e.itemValue as Aluno;
        var alunos = e.value as Aluno[];
        var index = alunos.findIndex(x => x.id == aluno.id);
        if (index == -1) {
            // está removendo alunos
        } else {
            if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
                model.control.setErrors({ indisponivel: 'Aluno indisponível' });
                this.showError('Aluno Indisponível', `Esse aluno tem outra ${this.getTipo(aluno.disponivelEvent)} no mesmo dia às <b>${moment(aluno.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
                return;
            }
        }

        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular)
    }

    enviarMensagemInscricao(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagemInscricao(nome, celular, this.evento);
    }

    sendConfirmation(form: NgForm, e: any) {

        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        if (!this.alunosSelected.length) {
            return this.showError('Não foi possível salvar', 'Selecione um aluno para continuar com inscrição', e)
        }

        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            header: 'Inscrever alunos',
            message: `Tem certeza que deseja inscrever os alunos selecionados? <br> Alunos selecionados: ${this.alunosSelected.map(x => x.nome.split(' ')[0]).join(', ')}?`,
            acceptLabel: `Salvar e inscrever`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }
        })

    }

    async send(e: any) {

        this.loading = true;
        var response: RequestResponse = { success: false, message: '', object: undefined };

        if (this.evento.id == PseudoEvento.EventoId) {
            response = await lastValueFrom(this.requestOficina());
            this.evento.id = response.object.id;
        }

        var count = 0
        await new Promise<boolean>((resolve, reject) => {
            this.alunosSelected.forEach(aluno => {
                lastValueFrom(this.service.inscrever(aluno.id, this.evento.id))
                    .then(res => {
                        count++;
                        if (count == this.alunosSelected.length) {
                            resolve(true);
                        }
                    })
                    .catch(res => {
                        count++;
                        this.showError('Agendamento falhou', `Não foi possível inscrever o aluno ${aluno.nome}. <br> ${getError(res)}`, e);
                        if (count == this.alunosSelected.length) {
                            resolve(true);
                        }
                    })
            })
        });


        this.loading = false;
        this.toastrService.success('Inscrição realizada com sucesso', 'Inscrição realizada');
        this.service.calendarioReload.emit(0);
        this.markChecklistAsDone();
        this.sendMensagemAlunos();
        // playSuccess();

    }

    requestOficina() {
        var request = MyMap(this.evento, new EventoOficinaRequest);
        request.alunos = [];
        request.professores = [this.evento.professor_Id];
        request.data = new Date(this.evento.data);
        request.data = moment(this.evento.data).format('YYYY-MM-DD[T]HH:mm') as any;

        return this.service.createOficina(request);
    }
    
    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);
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
                this.visible = false
                this.visibleChange();
            },
        });
    }


    removerAlunoLista(aluno: Aluno, e: any) {
        if (e.which == 2) {
            var index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
            if (index != -1)
                this.mensagensEnviadasAlunos.splice(index, 1);
        }
    }

    enviarMensagemAgendamento(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagemInscricao(aluno.nome, aluno.celular, this.evento);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    markChecklistAsDone() {
        // Agendar 1ª Oficina ou 2ª 
        // checklist_Item_Id 12 ou 23
        this.alunosSelected.forEach(aluno => {
            var alunoChecklist = aluno.alunoChecklist.find(x => (x.checklist_Item_Id == 12 || x.checklist_Item_Id == 23) && !x.finalizado) as Aluno_CheckList_Item;
            if (alunoChecklist) {
                var mensagem = `Inscrição na oficina do dia ${moment(this.evento.data).format('DD/MM/YY [às] HHH[h]mm')}. \n
                                Inscrição realizada por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HHH[h]mm')}}`
                if (alunoChecklist && !alunoChecklist.finalizado) {
                    lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
                }
            }
        })
    }


}
