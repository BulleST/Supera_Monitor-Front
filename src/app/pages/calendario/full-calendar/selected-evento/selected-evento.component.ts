import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ConfirmationService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { AlunoService } from '../../../../services/alunos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import { Crypto, playAlert } from '../../../../utils';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Professor } from '../../../../models/evento-participacao-professor.model';
import $ from 'jquery';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { SalaAulaId } from '../../../../models/sala-aula.model';
import moment from 'moment';
import { CalendarioUtils } from '../../../../utils/calendario-utils';
import { SalaAulaPipe } from '../../../../utils/sala-aula.pipe';

@Component({
    selector: 'app-selected-evento',
    standalone: false,
    templateUrl: './selected-evento.component.html',
    styleUrl: './selected-evento.component.css',
    providers: [ConfirmationService],
})
export class SelectedEventoComponent implements OnChanges {
    @Input() evento!: Evento;
    @Input() cdkEventItensId: string[] = [];
    @Input() cdkDragCancel: boolean = false;

    @Output() aluno = new EventEmitter<Evento_Participacao_Aluno>();
    @Output() cdkDragCancelChange = new EventEmitter<boolean>();


    @ViewChild('popover') popover!: Popover;
    EventoTipo = EventoTipo;
    PseudoEvento = PseudoEvento;
    SalaAulaId = SalaAulaId;

    mensagensEnviadasAlunos: Evento_Participacao_Aluno[] = [];
    mensagensEnviadasProfessor: Evento_Participacao_Professor[] = [];

    tipoEventoString = '';
    mouse: any = { x: 0, y: 0 };


    constructor(
        private alunoService: AlunoService,
        private service: EventoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private confirmationService: ConfirmationService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
        private calendarioUtils: CalendarioUtils,
        private salaAulaPipe: SalaAulaPipe,
        private changeDetector: ChangeDetectorRef,

    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            if (this.evento) {
                this.tipoEventoString = this.calendarioUtils.getEventoTipo(this.evento);
                this.loadReposicoes();
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
        this.loadReposicoes();
        this.popover.show(e);
        this.changeDetector.markForCheck();
        this.changeDetector.detectChanges();
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
        this.aluno.emit(undefined);
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
        if (this.evento) {
            this.service.setEvento(this.evento);
            this.router.navigate(['calendario', 'oficina', 'inscrever', this.crypto.encrypt(this.evento.id)])
        }
    }

    goToInserirAlunoConfirm(e: any) {
        if (this.evento) {
            if (this.evento.alunos.length >= this.evento.capacidadeMaximaAlunos) {

                // playAlert();

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
                    },
                });
            } else {
                this.goToInserirAluno();
            }
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


            if (evento.id != PseudoEvento.EventoId) {
                evento = await lastValueFrom(this.service.get(evento.id))
            }
            else {
                if (evento.evento_Tipo_Id == EventoTipo.Aula) {
                    await lastValueFrom(this.service.getPseudoAula(evento.turma_Id!, evento.data))
                    .then(res => evento = res)
                    .catch(res => this.toastr.error(res.message, 'Erro'))
                }
            }

            evento.alunos = evento.alunos.map(x => {
                if (!evento.finalizado) {
                    if (x.presente !== true && x.presente !== false) {
                        x.presente = true;
                    }
                }
                return x
            })
            
            evento.professores = evento.professores.map(x => {
                x.presente = evento.finalizado ? x.presente : true;
                return x
            })

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
            this.router.navigate([ 'reposicao', 'agendar'], { relativeTo: this.activatedRoute });
        }
    }


    loadReposicoes() {
        if (this.evento) {
            this.evento.alunos.forEach(async item => {
                if (item.reposicaoDe_Evento_Id && !item.reposicaoDe_Evento) {
                    item.loadingReposicaoDe_Evento = true;
                    lastValueFrom(this.service.get(item.reposicaoDe_Evento_Id))
                        .then(res => {
                            item.reposicaoDe_Evento = res;
                            item.loadingReposicaoDe_Evento = false;
                        }).catch(res => item.loadingReposicaoDe_Evento = false);
                }
            })

        }
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

    getSalaAula(evento: Evento) {
        return this.salaAulaPipe.transform({
            sala_Id: evento.sala_Id,
            numeroSala: evento.numeroSala,
            andar: evento.andar,
        })
    }

    getPerfilCognitivo(evento: Evento) {
        return evento.perfilCognitivo.map(x => x.nome).join(', ');
    }
}
