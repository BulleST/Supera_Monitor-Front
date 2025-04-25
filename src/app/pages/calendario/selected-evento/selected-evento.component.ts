import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Evento, EventoQueryParams, EventoTipo } from '../../../models/evento.model';
import { ConfirmationService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { AlunoService } from '../../../services/alunos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import { PerfilCognitivo } from '../../../models/perfil-cognitivo.model';
import { Crypto } from '../../../utils';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Professor } from '../../../models/evento-participacao-professor.model';
import $ from 'jquery';
import { PseudoEvento } from '../../../models/reposicao.model';
import { SalaAulaId } from '../../../models/sala-aula.model';
import { AlunoPopoverComponent } from '../aluno-popover/aluno-popover.component';
import moment from 'moment';

@Component({
    selector: 'app-selected-evento',
    standalone: false,
    templateUrl: './selected-evento.component.html',
    styleUrl: './selected-evento.component.css',
    providers: [ConfirmationService]
})
export class SelectedEventoComponent implements OnChanges {
    @Input() evento?: Evento;
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
    mouse: any = {x:0, y:0};


    constructor(
        private alunoService: AlunoService,
        private service: EventoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private confirmationService: ConfirmationService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastrService: ToastrService

    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;

            if (this.evento) {
                this.tipoEventoString = this.mensagemWhatsapp.getEventoTipo(this.evento);
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
        var parent = $(e.container.element.nativeElement).parent('.fc-event-main').parent('.fc-event')
        $(parent).addClass('scalein animation-duration-200 animation-iteration-1')
        $(parent).addClass('shadow-2 border-3 border-red-500')
    }

    cdkDragExited(e: CdkDragExit) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
        var parent = $(e.container.element.nativeElement).parent('.fc-event-main').parent('.fc-event')
        $(parent).removeClass('scalein animation-duration-200 animation-iteration-1')
        $(parent).removeClass('shadow-2 border-3 border-red-500')
    }

    showPopover(e: any) {
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
        this.aluno.emit(undefined);
    }

    async showAluno(e: MouseEvent, aluno: Evento_Participacao_Aluno, popoverComponent: AlunoPopoverComponent) {
        if (aluno.reposicaoDe_Evento_Id) {
            await lastValueFrom(this.service.get(aluno.reposicaoDe_Evento_Id))
                .then(res => {
                    this.aluno.emit(aluno)
                })
        }
        aluno.loadingFoto = true;
        lastValueFrom(this.alunoService.getFoto(aluno.aluno_Id))
            .then(res => {
                aluno.loadingFoto = false;
                aluno.aluno_Foto = res;
                this.aluno.emit(aluno)
            })
            .catch(res => {
                aluno.loadingFoto = false;
            })


        popoverComponent.aluno = aluno;
        popoverComponent.show(e);
        popoverComponent.showChecklist = true;
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target ?? e,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        return perfilCognitivo.map(x => x.nome).join(', ');
    }


    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular!)
    }

    goToInscricaoOficina() {
        if (this.evento) {
            this.service.setEvento(this.evento)
            this.router.navigate(['calendario', 'oficina', 'inscrever', this.crypto.encrypt(this.evento.id)])
        }
    }

    goToReagendamento() {
        if (this.evento) {
            this.service.setEvento(this.evento);

            var route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula';
            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.Aula: route = 'aula'; break;
                case EventoTipo.AulaZero: route = 'aula-zero'; break;
                case EventoTipo.AulaExtra: route = 'aula'; break;
                case EventoTipo.Superacao: route = 'superacao'; break;
                case EventoTipo.Reuniao: route = 'reuniao'; break;
                case EventoTipo.Oficina: route = 'oficina'; break;
                default: route = 'aula'; break;
            }

            this.router.navigate(['calendario', route, 'reagendar', this.crypto.encrypt(this.evento.id)]);
            this.hidePopover();
        }
    }

    goToCancelamento() {
        if (this.evento) {
            this.service.setEvento(this.evento);

            var route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula';
            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.Aula: route = 'aula'; break;
                case EventoTipo.AulaZero: route = 'aula-zero'; break;
                case EventoTipo.AulaExtra: route = 'aula'; break;
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
            this.evento.data = new Date(this.evento.data);

            var alunos = this.alunoService.list.value;
            if (!alunos.length)
                await lastValueFrom(this.alunoService.getList()).then(res => alunos = res);

            this.evento.alunos = this.evento.alunos.map(participacao => {
                var aluno = alunos.find(x => x.id == participacao.aluno_Id);
                if (aluno) {
                    participacao.alunoChecklist = aluno.alunoChecklist;
                    participacao.checklistCompleto = aluno.checklistCompleto;
                    participacao.checklist_Id = aluno.checklist_Id;
                    participacao.checklist = aluno.checklist;
                }
                return participacao;
            });


            this.service.setEvento(this.evento);
            var route: 'aula' | 'aula-zero' | 'aula' | 'superacao' | 'reuniao' | 'oficina' = 'aula';

            switch (this.evento.evento_Tipo_Id) {
                case EventoTipo.Aula: route = 'aula'; break;
                case EventoTipo.AulaZero: route = 'aula-zero'; break;
                case EventoTipo.AulaExtra: route = 'aula'; break;
                case EventoTipo.Superacao: route = 'superacao'; break;
                case EventoTipo.Reuniao: route = 'reuniao'; break;
                case EventoTipo.Oficina: route = 'oficina'; break;
                default: route = 'aula'; break;
            }

            this.router.navigate([route, this.crypto.encrypt(this.evento.id)], { relativeTo: this.activatedRoute })
            this.hidePopover();
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
    primeiraAula(aluno: Evento_Participacao_Aluno, evento: Evento) {
        return moment(aluno.primeiraAula).isSame(evento.data)
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const x = event.clientX;
        const y = event.clientY;
        this.mouse = {x,y};
        console.log(`Mouse X: ${x}, Mouse Y: ${y}`);
    }

    tooltipPosition() {
        var width = window.innerWidth;
        if (this.mouse.x >= (width / 2))
            return 'right'
        return 'left'
    }
}
