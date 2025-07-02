    import { Component, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
    import { lastValueFrom, Subscription } from 'rxjs';
    import { Aluno } from '../../../models/alunos.model';
    import { Evento, EventoTipo } from '../../../models/evento.model';
    import { EventoService } from '../../../services/evento.service';
    import { AlunoService } from '../../../services/alunos.service';
    import { CalendarioRequest } from '../../../models/calendario.model';
    import moment from 'moment';
    import { ToastrService } from 'ngx-toastr';
    import { NgForm, NgModel } from '@angular/forms';
    import { Crypto, getError, MensagemWhatsapp, showError } from '../../../utils';
    import { ActivatedRoute, Router } from '@angular/router';
    import { SalaAulaPipe } from '../../../utils/sala-aula.pipe';
    import { ConfirmationService } from 'primeng/api';
    import { PseudoEvento, ReposicaoAlunoRequest } from '../../../models/reposicao.model';
    import { RequestResponse } from '../../../helpers/request-response.interface';
    import { EventoAulaRequest } from '../../../models/evento-aula.model';
    import { MyMap } from '../../../utils/map';
import { SelectChangeEvent } from 'primeng/select';

    @Component({
        selector: 'app-aluno-reposicao-dialog',
        standalone: false,
        templateUrl: './aluno-reposicao-dialog.component.html',
        styleUrl: './aluno-reposicao-dialog.component.css',
        providers: [ConfirmationService]
    })
    export class AlunoReposicaoDialogComponent implements  OnDestroy {

        aluno_Id?: number;
        alunoSelected?: Aluno;
        blockAlunoField = false;
        
        eventoReposicao_Id?: number;
        eventoReposicaoSelected?: Evento;
        blockEventoField = false;
        
        visible = false;
        loading = false;
        subscription: Subscription[] = [];

        alunos: Aluno[] = [];
        loadingAlunos = false;

        eventoDisponivelSelected?: Evento;
        eventosDisponiveis: Evento[] = [];
        loadingEventosDisponiveis = false;

        eventosReposicao: Evento[] = [];
        loadingEventosRepor = false;

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
        ) {
            
            
            var params = this.activatedRoute.params.subscribe(res => {
                if (res['aluno_id']) {
                    this.aluno_Id = this.crypto.decrypt(res['aluno_id']);
                    this.blockAlunoField = true;
                    this.loadAluno();
                    this.loadEventosReposicao();
                }
                else {
                    var alunos = alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active));
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
            this.subscription.push(params);

            let evento = this.eventoService.evento.subscribe(res => {
                if (res) {
                    this.eventoReposicaoSelected = res;
                    this.blockEventoField = true;
                    this.eventoReposicaoSelected = res;
                    this.loadEventosDisponiveis();
                }
            });
            this.subscription.push(evento);
        }


        ngOnDestroy(): void {
            this.subscription.forEach(item => item.unsubscribe());
        }


        visibleChange() {

        }

        show() {
            this.visible = true;
        }

        hide() {
            this.visible = false;
            this.onHide.emit(true);
        }

        enviarMensagem(aluno: Aluno) {
            return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        }

        loadAluno(aluno?: Aluno) {
            if (aluno) {
                this.alunoSelected = aluno;
                this.loadingAlunos = false;
                return;
            }
            else if (this.aluno_Id) {
                this.loadingAlunos = true;
                lastValueFrom(this.alunoService.get(this.aluno_Id))
                .then(res => {
                    this.alunoSelected = res;
                    this.loadingAlunos = false;
                })
                .catch(res => {
                    this.loadingAlunos = false;
                    this.toastr.error('Não foi possível carregar o aluno.', 'Erro')
                })
            }

        }

        loadEventosReposicao() {
            console.log('loadEventosReposicao', this.aluno_Id   );
            if (this.aluno_Id) {
                let request: CalendarioRequest = {
                    aluno_Id: this.aluno_Id,
                    intervaloDe: moment().subtract(1, 'month').toDate(),
                    intervaloAte: moment().endOf('year').toDate(),
                }

                this.loadingEventosRepor = true;
                lastValueFrom(this.eventoService.calendario(request))
                    .then(res => {
                        this.eventosReposicao = res.filter(aula => {
                            const alunoEstaNaAula = aula.alunos.find(x => x.aluno_Id == this.aluno_Id);
                            const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.AulaExtra;
                            const naoMarcouReposicaoAinda = alunoEstaNaAula && !alunoEstaNaAula.reposicaoPara_Evento_Id;
                            const naoEhReposicao = alunoEstaNaAula && !alunoEstaNaAula.reposicaoDe_Evento_Id;
                            const naoGanhouPresenca = alunoEstaNaAula && alunoEstaNaAula.presente != true;
                            

                            return alunoEstaNaAula 
                                && ehAula 
                                && naoMarcouReposicaoAinda 
                                && naoEhReposicao 
                                && naoGanhouPresenca
                        });
                        this.loadingEventosRepor = false;
                    })
                    .catch(res => {
                        this.loadingEventosRepor = true;
                        this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                    });
            }
        }

        loadEventosDisponiveis() {
            if (this.aluno_Id 
                && this.alunoSelected 
                && this.eventoReposicaoSelected ) 
            {
                let request: CalendarioRequest = {
                    perfil_Cognitivo_Id: this.alunoSelected!.perfilCognitivo_Id,
                    intervaloDe: moment(this.eventoReposicaoSelected.data).toDate(),
                    intervaloAte: moment(this.eventoReposicaoSelected.data).add(1, 'month').toDate(),
                }

                this.loadingEventosDisponiveis = true;
                lastValueFrom(this.eventoService.calendario(request))
                    .then(res => {
                        this.eventosDisponiveis = res.filter(aula => {
                            const alunoNaoEstaNaAula = !aula.alunos.find(x => x.aluno_Id == this.aluno_Id);
                            const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.AulaExtra;
                            const temVagas = aula.alunos.filter(x => x.active).length < aula.capacidadeMaximaAlunos;
                            const perfilCognitivo = aula.perfilCognitivo.map(x => x.id).includes(this.alunoSelected!.perfilCognitivo_Id);
                            const aulaNaoFinalizada = !aula.finalizado;
                            const aulaEstaAtiva = aula.active;
                            const ehPerfilCognitivoCompativel = aula.perfilCognitivo.map(x => x.id).includes(this.alunoSelected!.perfilCognitivo_Id);
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
                        this.loadingEventosDisponiveis = false;
                    })
                    .catch(res => {
                        this.loadingEventosDisponiveis = true;
                        this.toastr.error('Não foi possível carregar aulas para repor.', 'Erro')
                    });
            }
        }


        alunoChanged(e: SelectChangeEvent, model: NgModel) {
            this.aluno_Id = e.value.id;
            this.loadAluno();
            this.loadEventosReposicao();
        }

        eventoReposicaoChanged() {
            this.loadEventosDisponiveis();
        }

        eventoDisponivelChanged(e: any, model: NgModel) {
            let aluno = this.alunoSelected as Aluno;
            let target = this.eventoDisponivelSelected as Evento;

            if (aluno.restricaoMobilidade) {
                let confirmRestricaoMobilidade = this.confirmRestricaoMobilidade(e, model);
                let onAcceptRestricaoMobilidade = confirmRestricaoMobilidade.accept.subscribe(res => {
                    if (aluno.restricoes.length) {
                        let confirmRestricoes = this.confirmRestricoes(e, model);
                        let onAcceptRestricoes = confirmRestricoes.accept.subscribe(res => {
                            onAcceptRestricoes.unsubscribe();
                        });
                    }

                    onAcceptRestricaoMobilidade.unsubscribe();
                });
            }

            this.loadEventosDisponiveis();
        }

        confirmRestricaoMobilidade(e: any, model: NgModel) {
            return this.confirmationService.confirm({
                target: e.target,
                message: 'O aluno possui restrição de mobilidade. Deseja continuar?',
                header: 'Restrição de mobilidade',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Continuar',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Cancelar',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    model.control.setValue(null);
                    this.eventoDisponivelSelected = undefined;
                }
            });
        }

        confirmRestricoes(e: any, model: NgModel) {
            return this.confirmationService.confirm({
                target: e.target,
                message: 'O aluno possui restrições. Deseja continuar?',
                header: 'Restrições',
                reject: () => {
                    model.control.setValue(null);
                    this.eventoDisponivelSelected = undefined;
                }
            });
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
            var restricoes = aluno.restricoes.filter(x => x.active).map(x => x.descricao)
            return restricoes.length ? restricoes.join(', ') : 'Nenhuma restrição';
        }

        showError(header: string, message: string, e: any) {
            showError(this.confirmationService, header, message, e);
        }

        
        sendConfirmation(form: NgForm, e: any) {

            if (!form.valid) {
                this.showError('Erro', 'Por favor, preencha todos os campos obrigatórios.', e);
                this.toastr.error('Por favor, preencha todos os campos obrigatórios.', 'Erro')
                return;
            }

            // playAlert();

            let aluno = this.alunoSelected as Aluno;
            let source = this.eventoReposicaoSelected as Evento;
            let target = this.eventoDisponivelSelected as Evento;

            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar reposição do aluno <b>${aluno.nome} </b> do dia <b>${moment(source.data).format('DD/MM/YY [às] HH[h]mm')}</b> para o dia <b class="text-primary-500">${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${target.descricao}</b> com o professor <b>${target.professor}</b>?`,
                header: 'Agendar reposição',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Agendar',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Cancelar',
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

            var request = new ReposicaoAlunoRequest;
            request.aluno_Id = aluno.id;
            request.source_Aula_Id = source.id;
            request.dest_Aula_Id = target.id;
            var response: RequestResponse = { success: true, message: '', object: undefined };


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
                            this.sendMensagemAluno(e, target, aluno);
                        } else {
                            this.visible = false;
                            this.visibleChange();
                        }
                    }
                })
                .catch(res => {
                    this.loading = false;
                    this.showError('Erro', `Não foi possível agendar reposição. \n ${getError(res)}`, e)
                })
        }

        requestAulaTurma(evento: Evento) {
            var request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest);
            request.alunos = evento.alunos.map(x => x.aluno_Id);
            request.professores = evento.professor_Id ? [evento.professor_Id] : [];
            request.perfilCognitivo = evento.perfilCognitivo.map(x => x.id);
            request.data = moment(new Date(request.data)).format('YYYY-MM-DD[T]HH:mm') as any;

            return lastValueFrom(this.eventoService.createAulaTurma(request));
        }

        sendMensagemAluno(e: any, evento: Evento, aluno: Aluno) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Reposição concluída com sucesso. <br> Clique para enviar mensagem de confirmação.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                acceptButtonStyleClass: 'p-button-rounded p-button-success',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    this.visible = false
                    this.visibleChange();
                    var url = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.nome, aluno.celular, evento);
                    window.open(url, '_target');
                },
                reject: () => {
                    this.visible = false
                    this.visibleChange();
                }
            });
        }

    }
