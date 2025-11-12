import { Component, OnDestroy } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { SalaAndar, SalaAulaId } from '../../../../../models/sala-aula.model';
import { Turma } from '../../../../../models/turma.model';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getError, showError } from '../../../../../utils';
import { AlunoService } from '../../../../../services/alunos.service';
import { EventoService } from '../../../../../services/evento.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { TurmaService } from '../../../../../services/turma.service';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import moment from 'moment';
import { NgForm, NgModel } from '@angular/forms';
import { PseudoEvento } from '../../../../../models/reposicao.model';
import { RequestResponse } from '../../../../../helpers/request-response.interface';
import { ChecklistService } from '../../../../../services/checklist.service';
import { AccountService } from '../../../../../services/account.service';
import { validaAlunos } from '../../../../../utils/validacao';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { SalaAulaPipe } from '../../../../../utils/sala-aula.pipe';
import { NameFirstWordPipe } from '../../../../../utils/name-first-word.pipe';

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

    selectedAlunos: Aluno[] = [];
    mensagensEnviadasAlunos: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

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
        private alunoService: AlunoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private turmaService: TurmaService,
        private service: EventoService,
        private salaPipe: SalaAulaPipe,
        private checklistService: ChecklistService,
        private accountService: AccountService,
        private calendarioUtils: CalendarioUtils,
        private nameFirstWordPipe: NameFirstWordPipe,

    ) {

        let params = this.activatedRoute.snapshot.params;
        if (!params['evento_id']) {
            this.visible = false;
            this.visibleChange();
            return
        }

        let alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active == true);
            this.setAlunos();
        });
        this.subscription.push(alunos);

        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getList())
            .then(res => this.loadingAlunos = false)
            .catch(res => this.loadingAlunos = false);

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active == true));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
        this.subscription.push(eventos);

        let evento = this.service.getEvento().subscribe(async res => {
            if (res) {
                this.evento = res;
                this.visible = true;
                this.verificaDisponibilidade();

                let minutos = this.evento.duracaoMinutos % 60
                let horas = this.evento.duracaoMinutos / 60;
                let horaRedonda = (horas - Math.floor(horas)) == 0;

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
            let alunosOficina = this.evento.alunos.map(x => x.aluno_Id);
            this.alunos = this.alunos.filter(x => alunosOficina.includes(x.id) == false)
        }
    }

    get sala() {
        return this.salaPipe.transform({ sala_Id: this.evento.sala_Id });
    }

    async verificaDisponibilidade() {
        let valid = true;

        this.loadingEventos = true;
        let request: CalendarioRequest = new CalendarioRequest;

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
    //     let data = this.object.data;
    //     this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    // }

    // validaProfessores() {
    //     let data = this.object.data;
    //     this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);

    //     if (this.object.professor_Id) {
    //         let e: SelectChangeEvent = {
    //             value: this.object.professor_Id,
    //             originalEvent: { target: $('#professor_Id').get(0) as any } as any
    //         }
    //         this.professorChanged(e, this.professor_Id);
    //     }
    // }

    validaAlunos() {
        let data = this.evento.data;
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
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

            if (aluno.restricaoMobilidade && this.evento.andar > SalaAndar.Terreo) {
                this.showError(
                    'Restrição de Mobilidade',
                    `O aluno(a) ${nome} tem restrição de mobilidade e não pode subir escadas. <br> Selecione uma sala no térreo para ele poder participar.`,
                    e.originalEvent
                );

                this.selectAlunoReject(aluno, model);
                return;
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

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
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


    sendConfirmation(form: NgForm, e: any) {

        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        if (!this.selectedAlunos.length) {
            return this.showError('Não foi possível salvar', 'Selecione um aluno para continuar com inscrição', e)
        }

        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            header: 'Inscrever alunos',
            message: `Tem certeza que deseja inscrever os alunos selecionados? <br> Alunos selecionados: ${this.selectedAlunos.map(x => x.nome.split(' ')[0]).join(', ')}?`,
            acceptLabel: `Salvar e inscrever`,
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

    async send(e: any) {

        this.loading = true;
        let response: RequestResponse = { success: false, message: '', object: undefined };

        if (this.evento.id == PseudoEvento.EventoId) {
            response = await this.requestOficina();
            this.evento.id = response.object.id;
        }

        let count = 0
        await new Promise<boolean>((resolve, reject) => {
            this.selectedAlunos.forEach(aluno => {
                lastValueFrom(this.service.inscrever(aluno.id, this.evento.id))
                    .then(res => {
                        count++;
                        if (count == this.selectedAlunos.length) {
                            resolve(true);
                        }
                    })
                    .catch(res => {
                        count++;
                        this.showError('Agendamento falhou', `Não foi possível inscrever o aluno ${aluno.nome}. <br> ${getError(res)}`, e);
                        if (count == this.selectedAlunos.length) {
                            resolve(true);
                        }
                    })
            })
        });


        this.loading = false;
        this.toastrService.success('Inscrição realizada com sucesso', 'Inscrição realizada');
        this.service.calendarioReload.emit(0);
        this.sendMensagemAlunos();
        // playSuccess();

    }

    requestOficina() {
        return this.calendarioUtils.requestOficina(this.evento);
    }

    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.selectedAlunos.sort((x, y) => x.nome < y.nome ? -1 : 1);
        this.confirmationService.confirm({
            key: 'enviarMensagem',
            message: `Agendamento concluído com sucesso. <br> Envie uma mensagem de confirmação para os alunos que participarão da aula.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: false,
            accept: () => {
                this.visible = false
                this.visibleChange();
            },
        });
    }


    removerAlunoLista(aluno: Aluno, e: any) {
        if (e.which == 2) {
            let index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
            if (index != -1)
                this.mensagensEnviadasAlunos.splice(index, 1);
        }
    }

    enviarMensagemInscricao(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagemInscricao(aluno.nome, aluno.celular, this.evento);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

}
