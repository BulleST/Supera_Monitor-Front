import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ConfirmationService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import { Crypto } from '../../../../utils';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Professor } from '../../../../models/evento-participacao-professor.model';
import $ from 'jquery';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { SalaAndar, SalaAulaId } from '../../../../models/sala-aula.model';
import moment from 'moment';
import { CalendarioUtils } from '../../../../utils/calendario-utils';
import { SalaAulaPipe } from '../../../../utils/sala-aula.pipe';
import { AlunoContatoFaltaComponent } from '../../../../shared/aluno/aluno-contato-falta/aluno-contato-falta.component';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-selected-evento',
    standalone: false,
    templateUrl: './selected-evento.component.html',
    styleUrl: './selected-evento.component.css',
    providers: [ConfirmationService, DialogService],
})
export class SelectedEventoComponent implements OnChanges {
    @Input() evento!: Evento;
    @Input() cdkEventItensId: string[] = [];
    @Input() cdkDragCancel: boolean = false;

    @Output() alunoOnChanged = new EventEmitter<Evento_Participacao_Aluno>();
    @Output() cdkDragCancelChange = new EventEmitter<boolean>();


    @ViewChild('popover') popover!: Popover;
    EventoTipo = EventoTipo;
    PseudoEvento = PseudoEvento;
    SalaAulaId = SalaAulaId;
    SalaAndar = SalaAndar;

    mensagensEnviadasAlunos: Evento_Participacao_Aluno[] = [];
    mensagensEnviadasProfessor: Evento_Participacao_Professor[] = [];

    tipoEventoString = '';
    mouse: any = { x: 0, y: 0 };

        instance: DynamicDialogComponent | undefined;
        refChild: DynamicDialogRef | undefined;
    

    constructor(
        private service: EventoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private confirmationService: ConfirmationService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
        private calendarioUtils: CalendarioUtils,
        private salaAulaPipe: SalaAulaPipe,
        private dialogService: DialogService,

    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            if (this.evento) {
                this.tipoEventoString = this.calendarioUtils.getEventoTipo(this.evento);
            } else {
                this.hidePopover();
            }
        }

        if (changes['cdkEventItensId']) {
            this.cdkEventItensId = changes['cdkEventItensId'].currentValue;
        }

        if (changes['cdkDragCancel']) {
            this.cdkDragCancel = changes['cdkDragCancel'].currentValue;
        }
    }

    cdkDragStarted(e: CdkDragStart) {
        this.cdkDragCancel = false;
        this.cdkDragCancelChange.emit(false);
        this.popover.hide();
    }

    cdkDropListExited(e: CdkDragExit) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
    }

    cdkDragEntered(e: CdkDragEnter) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
        let parent = $(e.container.element.nativeElement).parent('.fc-event-main').parent('.fc-event')
        $(parent).addClass('scalein animation-duration-200 animation-iteration-1')
        $(parent).addClass('shadow-2 border-3 border-red-500')
    }

    cdkDragExited(e: CdkDragExit) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
        let parent = $(e.container.element.nativeElement).parent('.fc-event-main').parent('.fc-event')
        $(parent).removeClass('scalein animation-duration-200 animation-iteration-1')
        $(parent).removeClass('shadow-2 border-3 border-red-500')
    }

    showPopover(e: any, evento: Evento) {
        this.evento = evento;
        this.tipoEventoString = this.calendarioUtils.getEventoTipo(this.evento);
        this.popover.show(e);
        setTimeout(() => {
            if (this.popover.container) {
                this.popover.align();
            }
        }, 150);
    }

    hidePopover() {
        if (this.popover)
            this.popover.hide();
    }

    onHide() {
        this.alunoOnChanged.emit(undefined);
    }


    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        if (!aluno.celular) {
            this.toastr.error('Erro', 'Nenhum celular cadastrado');
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular!);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }


    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, aluno, e);
    }

    goToInscricaoOficina() {
        if (this.evento && this.evento.vagasDisponiveisEvento > 0) {
            this.service.setEvento(this.evento);
            this.router.navigate(['calendario', 'oficina', 'inscrever', this.crypto.encrypt(this.evento.id)])
        }
    }

    goToInserirAlunoConfirm(e: any) {
        if (this.evento) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja inserir mais um aluno nessa ${this.tipoEventoString}?`,
                header: `Inserir aluno`,
                acceptIcon: 'pi pi-check',
                acceptLabel: `Sim`,
                acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    this.goToInserirAluno();
                }
            });
        }
    }


    goToInserirAluno() {
        if (this.evento) {
            this.service.setEvento(this.evento);

            let route: 'aula-zero' | 'superacao' = 'aula-zero'
            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.AulaZero: route = 'aula-zero'; break;
                case EventoTipo.Superacao: route = 'superacao'; break;
                default: route = 'aula-zero'; break;
            }
            this.router.navigate(['calendario', route, 'inserir-aluno', this.crypto.encrypt(this.evento.id)])
        }
    }

    goToPrimeiraAula() {
        if (this.evento) {
            this.service.setEvento(this.evento);
            this.router.navigate(['calendario', 'aula', 'primeira-aula', this.crypto.encrypt(this.evento.id)]);
            this.hidePopover();
        }
    }

    goToCancelamento() {
        if (this.evento) {
            this.service.setEvento(this.evento);

            let route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula';
            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.Aula: route = 'aula'; break;
                case EventoTipo.AulaZero: route = 'aula-zero'; break;
                case EventoTipo.TurmaExtra: route = 'aula'; break;
                case EventoTipo.Superacao: route = 'superacao'; break;
                case EventoTipo.Reuniao: route = 'reuniao'; break;
                case EventoTipo.Oficina: route = 'oficina'; break;
                default: route = 'aula'; break;
            }
            this.router.navigate([route, 'cancelar', this.crypto.encrypt(this.evento.id)], { relativeTo: this.activatedRoute });
            this.hidePopover();

        }
    }

    async goToEvento() {
        if (this.evento) {
            let evento: Evento = this.evento;

            // if (evento.id != PseudoEvento.EventoId) {
            //     await lastValueFrom(this.service.get(evento.id))
            //             .then(res => evento = res)
            //             .catch(res => this.toastr.error(res.message, 'Erro'))
            // }
            // else if (evento.evento_Tipo_Id == EventoTipo.Aula) {
            //     await lastValueFrom(this.service.getPseudoAula(evento.turma_Id!, evento.data))
            //         .then(res => evento = res)
            //         .catch(res => this.toastr.error(res.message, 'Erro'))
            // }

            if (evento.alunos && evento.alunos.length) {
                evento.alunos = evento.alunos.map(x => {
                    if (!evento.finalizado) {
                        if (x.presente !== true && x.presente !== false) {
                            x.presente = true;
                        }
                    }
                    return x
                });
            }

            if (evento.professores && evento.professores.length) {
                evento.professores = evento.professores.map(x => {
                    x.presente = evento.finalizado ? x.presente : true;
                    return x
                })
            }
            this.service.setEvento(evento);
            let route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula';

            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.Aula: route = 'aula'; break;
                case EventoTipo.AulaZero: route = 'aula-zero'; break;
                case EventoTipo.TurmaExtra: route = 'aula'; break;
                case EventoTipo.Superacao: route = 'superacao'; break;
                case EventoTipo.Reuniao: route = 'reuniao'; break;
                case EventoTipo.Oficina: route = 'oficina'; break;
                default: route = 'aula'; break;
            }

            this.router.navigate(['calendario', route, this.crypto.encrypt(this.evento.id)]);
            this.hidePopover();
        }
    }

    goToReposicao() {
        if (this.evento) {
            this.service.setEventoReposicaoDe(undefined)
            this.service.setEventoReposicaoPara(this.evento);
            this.router.navigate(['reposicao', 'agendar', '', this.crypto.encrypt(this.evento.id)], { relativeTo: this.activatedRoute });
        }
    }

    // goToContatoFalta(participacao: Evento_Participacao_Aluno) {
    //     if (this.evento) {
    //         this.service.setEvento(this.evento);
    //         let eventoIdEncrypted = this.crypto.encrypt(this.evento.id);
    //         let alunoIdEncrypted = this.crypto.encrypt(participacao.aluno_Id);
    //         this.router.navigate(['contato', eventoIdEncrypted, alunoIdEncrypted], { relativeTo: this.activatedRoute });
    //     }
    // }
        showContatoFalta(participacao: Evento_Participacao_Aluno) {
            this.refChild = this.dialogService.open(AlunoContatoFaltaComponent, {
                header: 'Aula',
                showHeader: false,
                closable: true,
                maximizable: false,
                closeOnEscape: true,
                draggable: true,
                dismissableMask: true,
                duplicate: true,
                modal: true,
                width: '95vw',
                style: { maxWidth: '550px' },
                data: {
                    celular: participacao.celular,
                    aluno: participacao.aluno,
    
                    evento_Id: this.evento.id,
                    evento: this.evento.descricao,
                    data: this.evento.data,
                    roteiroCorLegenda: this.evento.roteiroCorLegenda,
                    semana: this.evento.semana,
                    tema: this.evento.tema,
    
                    observacao: participacao.observacao,
                    contatado: participacao.alunoContactado,
                    alunoContactado: participacao.alunoContactado ? moment(participacao.alunoContactado).toDate() : undefined,
                    statusContato_Id: participacao.statusContato_Id,
                    contatoObservacao: participacao.contatoObservacao,
                    participacao_Id: participacao.id,
                }
            });
        }
    


    
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const x = event.clientX;
        const y = event.clientY;
        this.mouse = { x, y };
    }

    tooltipPosition() {
        let width = window.innerWidth;
        if (this.mouse.x >= (width / 2))
            return 'right'
        return 'left'
    }

    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }

    podeAgendarReposicao(evento: Evento, participacao: Evento_Participacao_Aluno) {
        return participacao.presente === true
            || participacao.reposicaoDe_Evento_Id
            || participacao.reposicaoPara_Evento_Id
    }

    showAlunoParticipacao() {

    }
}
