import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { AlunoService } from '../../../services/alunos.service';
import { CalendarioRequest } from '../../../models/calendario.model';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgForm, NgModel } from '@angular/forms';
import { CalendarioUtils, Crypto, getError, MensagemWhatsapp, showError } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { SalaAulaPipe } from '../../../utils/sala-aula.pipe';
import { ConfirmationService } from 'primeng/api';
import { PseudoEvento, ReposicaoAlunoRequest } from '../../../models/reposicao.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { SelectChangeEvent } from 'primeng/select';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';

@Component({
    selector: 'app-aluno-reposicao-dialog',
    standalone: false,
    templateUrl: './aluno-reposicao-dialog.component.html',
    styleUrl: './aluno-reposicao-dialog.component.css',
    providers: [ConfirmationService]
})
export class AlunoReposicaoDialogComponent implements OnDestroy {
    blockAlunoField = false;

    eventosReposicaoDeList: Evento[] = [];
    loadingEventosReposicaoDe = false;
    eventoReposicaoDe?: Evento;
    blockReposicaoDeField = false;

    visible = false;
    loading = false;
    subscription: Subscription[] = [];

    aluno?: Aluno;
    alunos: Aluno[] = [];
    loadingAlunos = false;

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    eventoReposicaoPara?: Evento;
    eventosReposicaoParaList: Evento[] = [];
    loadingEventosReposicaoPara = false;
    blockReposicaoParaField = false;

    onHide = new EventEmitter<boolean>();

    constructor(
        private eventoService: EventoService,
        private alunoService: AlunoService,
        private toastr: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private salaAulaPipe: SalaAulaPipe,
        private confirmationService: ConfirmationService,
        private roteiroService: RoteiroService,
        private calendarioUtils: CalendarioUtils,
    ) {

        let roteiros = roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros)

        if (!this.roteiros.length) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList())
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }


        let aluno = this.alunoService.getAluno().subscribe(async res => {
            if (!res) {
                let params = this.activatedRoute.snapshot.paramMap;
                 if (params.get('aluno_id')) {
                    const aluno_Id = this.crypto.decrypt(params.get('aluno_id'));
                    this.blockAlunoField = true;
                    let aluno = await this.loadAluno(aluno_Id);
                    this.alunoService.setAluno(aluno)
                }
            }
            if (res) {
                this.aluno = res;
                this.blockAlunoField = true;
            }
            else {
                
                let alunos = alunoService.list.subscribe(res => {
                    this.alunos = res;
                    this.setAlunos();
                });
                this.subscription.push(alunos)

                if (!this.alunos.length) {
                    this.loadingAlunos = true;
                    lastValueFrom(this.alunoService.getList())
                        .then(res => this.loadingAlunos = false)
                        .catch(res => this.loadingAlunos = false);
                }
            }
            this.show();
        });
        this.subscription.push(aluno);


        let eventoReposicaoDe = this.eventoService.getEventoReposicaoDe().subscribe(res => {
            if (res) {
                this.eventoReposicaoDe = res;
                this.blockReposicaoDeField = true;
                this.loadEventosReposicaoPara();
            }
        });
        this.subscription.push(eventoReposicaoDe);

        let eventoReposicaoPara = this.eventoService.getEventoReposicaoPara().subscribe(res => {
            if (res) {
                this.eventoReposicaoPara = res;
                this.blockReposicaoParaField = true;
                this.setAlunos();
            }
        });
        this.subscription.push(eventoReposicaoPara);
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    visibleChange() {
        if (!this.visible) {
            let params = this.activatedRoute.snapshot.params;
            let routeBack = params['aluno_id'] ? ['../../../'] : ['../../'];
            this.router.navigate(routeBack, { relativeTo: this.activatedRoute });

            this.eventoService.setEvento(undefined)
            this.eventoService.setEventoReposicaoDe(undefined)
            this.eventoService.setEventoReposicaoPara(undefined)
            this.alunoService.setAluno(undefined)
        }
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
        this.onHide.emit(true);
    }

    enviarMensagem(aluno: Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    setAlunos() {
        if (this.alunos.length) {
            this.alunos = this.alunos.filter(x => {
                x.active == true && !!x.turma_Id
            })
            if (this.eventoReposicaoPara) {

                // Em caso de rota por selected-evento.component > opções > agendar reposicao
                // Vai marcar o para
                // Filtra somente os alunos que não estão nessa aula

                let alunos = this.eventoReposicaoPara.alunos.filter(x => x.active).map(X => X.aluno_Id);
                this.alunos = this.alunos.filter(x => !alunos.includes(x.id) && x.active == true)

                // OBS: 
                // Se em caso de rota por selected-evento.component > aluno-popover.component > opções > agendar reposicao
                // OU _initial/monitoramento-dashboard.component > agendar reposicao
                // o eventoReposicaoDe é marcado e a rota é inserida com o aluno_id, impossibilitando seleção de outro aluno
                // Sendo assim não precisa filtrar os alunos nesse caso
            }

        }
    }

    loadAluno(aluno_Id: number) {
        this.loadingAlunos = true;
        return lastValueFrom(this.alunoService.get(aluno_Id))
            .then(res => {
                this.aluno = res;
                this.loadingAlunos = false;
                return this.aluno;
            })
            .catch(res => {
                this.loadingAlunos = false;
                this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
                return undefined;
            })
    }

    loadEventosReposicaoDe() {
        if (this.aluno) {
            let request: CalendarioRequest = {
                aluno_Id: this.aluno.id,
                intervaloDe: moment().subtract(1, 'month').toDate(),
                intervaloAte: moment().endOf('year').toDate(),
            }

            this.loadingEventosReposicaoDe = true;
            lastValueFrom(this.eventoService.getList(request))
                .then(res => {
                    this.eventosReposicaoDeList = res.filter(aula => {
                        const alunoEstaNaAula = aula.alunos.find(x => x.aluno_Id == this.aluno!.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const naoMarcouReposicaoAinda = alunoEstaNaAula && !alunoEstaNaAula.reposicaoPara_Evento_Id;
                        const naoEhReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoDe_Evento_Id;
                        const naoGanhouPresenca = alunoEstaNaAula && alunoEstaNaAula.presente != true;


                        return alunoEstaNaAula
                            && ehAula
                            && naoMarcouReposicaoAinda
                            && naoEhReposicao
                            && naoGanhouPresenca
                    });
                    this.loadingEventosReposicaoDe = false;

                    if (this.blockReposicaoDeField && this.eventoReposicaoDe) {
                        this.eventoReposicaoDe = this.eventosReposicaoDeList.find(x => x.id == this.eventoReposicaoDe!.id
                            && moment(x.data).isSame(this.eventoReposicaoDe!.data)
                            && x.turma_Id == this.eventoReposicaoDe!.turma_Id);
                    }
                })
                .catch(res => {
                    this.loadingEventosReposicaoDe = true;
                    this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                });
        }
    }

    async loadEventosReposicaoPara() {

        if (!this.aluno) {
            return
        }
        if (this.aluno && this.eventoReposicaoDe) {
            let request: CalendarioRequest = {
                perfil_Cognitivo_Id: this.aluno!.perfilCognitivo_Id,
                intervaloDe: moment(this.eventoReposicaoDe.data).toDate(),
                intervaloAte: moment(this.eventoReposicaoDe.data).add(1, 'month').toDate(),
            }


            this.loadingEventosReposicaoPara = true;
            lastValueFrom(this.eventoService.getList(request))
                .then(res => {

                    this.eventosReposicaoParaList = res.filter(aula => {
                        const alunoNaoEstaNaAula = !aula.alunos.find(x => x.aluno_Id == this.aluno!.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const temVagas = aula.alunos.filter(x => x.active).length < aula.capacidadeMaximaEvento;
                        const perfilCognitivo = aula.perfilCognitivo.map(x => x.id).includes(this.aluno!.perfilCognitivo_Id);
                        const aulaNaoFinalizada = !aula.finalizado;
                        const aulaEstaAtiva = aula.active;
                        const ehPerfilCognitivoCompativel = aula.perfilCognitivo.map(x => x.id).includes(this.aluno!.perfilCognitivo_Id);
                        const naoEhFeriado = !aula.feriado;

                        return alunoNaoEstaNaAula
                            && ehAula
                            && temVagas
                            && perfilCognitivo
                            && aulaNaoFinalizada
                            && aulaEstaAtiva
                            && ehPerfilCognitivoCompativel
                            && naoEhFeriado;

                    });


                    this.loadingEventosReposicaoPara = false;
                })
                .catch(res => {
                    this.loadingEventosReposicaoPara = true;
                    this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                });
        }
    }


    alunoChanged(e: SelectChangeEvent) {
        if (!this.eventoService.eventoReposicaoDe.value) {
            this.eventoReposicaoDe = undefined;
        }
        if (!this.eventoService.eventoReposicaoPara.value) {
            this.eventoReposicaoPara = undefined;
        }

        this.loadEventosReposicaoDe();
    }

    eventoReposicaoChanged() {
        if (!this.eventoService.eventoReposicaoPara.value) {
            this.eventoReposicaoPara = undefined;
        }
        this.loadEventosReposicaoPara();
    }

    eventoDisponivelChanged(e: any, model: NgModel) {
        let aluno = this.aluno as Aluno;
        let target = this.eventoReposicaoPara as Evento;

        if (aluno.restricaoMobilidade) {
            let confirmRestricaoMobilidade = this.confirmRestricaoMobilidade(e, model);
            let onAcceptRestricaoMobilidade = confirmRestricaoMobilidade.accept.subscribe(res => {
                if (aluno.restricoes.length) {
                    let confirmRestricoes = this.confirmRestricoes(e, model);
                    let onAcceptRestricoes = confirmRestricoes.accept.subscribe(res => {
                        onAcceptRestricoes.unsubscribe();
                        this.selectEventoReposicaoPara(target)
                    });
                } else {
                    this.selectEventoReposicaoPara(target)
                }

                onAcceptRestricaoMobilidade.unsubscribe();
            });
        } else {
            this.selectEventoReposicaoPara(target)
        }

    }

    confirmRestricaoMobilidade(e: any, model: NgModel) {
        return this.confirmationService.confirm({
            target: e.target,
            message: 'O aluno possui restrição de mobilidade. Deseja continuar?',
            header: 'Restrição de mobilidade',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            reject: () => {
                model.control.setValue(null);
                this.eventoReposicaoPara = undefined;
                this.eventoService.setEventoReposicaoPara(undefined)
            }
        });
    }

    confirmRestricoes(e: any, model: NgModel) {
        return this.confirmationService.confirm({
            target: e.target,
            message: 'O aluno possui outras restrições. Deseja continuar?',
            header: 'Restrições',
            reject: () => {
                model.control.setValue(null);
                this.eventoReposicaoPara = undefined;
                this.eventoService.setEventoReposicaoPara(undefined)
            }
        });
    }

    selectEventoReposicaoPara(target: Evento) {

        if (!target.roteiro_Id) {
            let roteiro = this.roteiros.find(x => moment(target.data).isBetween(x.dataInicio, x.dataFim, null, '[]'));
            target.roteiro_Id = roteiro?.id;
            target.semana = roteiro?.semana;
            target.tema = roteiro?.tema;
        }

        let index = this.eventosReposicaoParaList.findIndex(x => moment(x.data).isSame(target.data, 'minutes') 
                                                    && x.id == target.id 
                                                    && target.turma_Id == x.turma_Id)

        if (index == -1) {
            
        } 
        else {
            this.eventosReposicaoParaList.splice(index, 1, target)
        }
        this.eventoReposicaoPara = target;
        this.eventoService.setEventoReposicaoPara(target)
    }

    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    getSalaAula(evento: Evento) {
        return this.salaAulaPipe.transform({
            sala_Id: evento.sala_Id,
            numeroSala: evento.numeroSala,
            andar: evento.andar
        })
    }

    getRestricoes(aluno: Aluno) {
        let restricoes = aluno.restricoes.filter(x => x.active).map(x => x.descricao)
        return restricoes.length ? restricoes.join(', ') : 'Nenhuma restrição';
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    getCorRoteiro(roteiro_Id?: number) {
        let roteiro = this.roteiros.find(x => x.id == roteiro_Id)
        return roteiro?.corLegenda;

    }


    sendConfirmation(form: NgForm, e: any) {

        if (!form.valid) {
            this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e);
            this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
            return;
        }

        // playAlert();

        let aluno = this.aluno as Aluno;
        let source = this.eventoReposicaoDe as Evento;
        let target = this.eventoReposicaoPara as Evento;

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja marcar reposição do aluno <b>${aluno.nome} </b> do dia <b>${moment(source.data).format('DD/MM/YY [às] HH[h]mm')}</b> para o dia <b class="text-primary-500">${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${target.descricao}</b> com o professor <b>${target.professor}</b>?`,
            header: 'Agendar reposição',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Agendar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e, aluno, source, target);
            },
            reject: () => {
            }
        });
    }


    async send(e: any, aluno: Aluno, source: Evento, target: Evento) {

        this.loading = true;

        let request = new ReposicaoAlunoRequest;
        request.aluno_Id = aluno.id;
        request.source_Aula_Id = source.id;
        request.dest_Aula_Id = target.id;
        let response: RequestResponse = { success: true, message: '', object: undefined };


        // Se a aula source não existir, cria a aula
        if (request.source_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(source)
            request.source_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        // Se a aula target não existir, cria a aula
        if (request.dest_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(target)
            request.dest_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        await lastValueFrom(this.alunoService.reposicao(request))
            .then(res => {
                // playSuccess();
                this.loading = false;
                if (res.success) {
                    this.eventoService.calendarioReload.emit(res.object.id);
                    this.toastr.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
                    if (aluno.celular) {
                        this.sendMensagemAluno(e, aluno, source, target);
                    } else {
                        this.visible = false;
                        this.visibleChange();
                    }
                }
            })
            .catch(res => {
                this.loading = false;
                this.showError('Erro', `Não foi possível agendar reposição. <br> ${getError(res)}`, e)
            })
    }

    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }

    sendMensagemAluno(e: any, aluno: Aluno, source: Evento, target: Evento) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Reposição concluída com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            rejectLabel: 'Não enviar',
            acceptIcon: 'pi pi-whatsapp',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded p-button-success',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange();
                let url = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.nome, aluno.celular, source, target);
                window.open(url.link, '_blank');
                this.mensagemWhatsapp.copiarMensagem(url.mensagem);
            },
            reject: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }
}
