import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Item, DashboardItemStatus } from '../../../../models/dashboard.model';
import { Popover } from 'primeng/popover';
import { Router } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../utils';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../../services/evento.service';
import { Evento } from '../../../../models/evento.model';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { AlunoService } from '../../../../services/alunos.service';
import { MenuItem } from 'primeng/api';
import { SelectChangeEvent } from 'primeng/select';
import { NgModel } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-aula-participacao-popover',
    standalone: false,
    templateUrl: './aula-participacao-popover.component.html',
    styleUrl: './aula-participacao-popover.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AulaParticipacaoPopoverComponent implements OnChanges {
    @Input() item!: Dashboard_Item;
    @Input() aluno!: Dashboard_Aluno;

    @ViewChild('popover') popover!: Popover;
    menuItems: MenuItem[] = [];
    menuOptionsValue: any;

    eventoEncryptedId: string = '';
    alunoEncryptedId: string = '';

    DashboardItemStatus = DashboardItemStatus;

    evento?: Evento
    participacao?: Evento_Participacao_Aluno

    constructor(
        private router: Router,
        private crypto: Crypto,
        private service: EventoService,
        private alunoService: AlunoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private cdr: ChangeDetectorRef,
        private toastr: ToastrService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) {
            this.item = changes['item'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
    }

    async show(e: any) {
        this.cdr.detectChanges();
        this.eventoEncryptedId = this.crypto.encrypt(this.item.aula.id) as string;
        this.alunoEncryptedId = this.crypto.encrypt(this.item.participacao.aluno_Id) as string;
        this.popover.show(e);
        this.loadMenuItems();
    }

    hide() {
        this.popover.hide();
    }

    loadMenuItems() {
        if (!this.item || !this.aluno) {
            return
        }
        this.menuItems = [];

        // Ver aula
        this.menuItems.push({
            label: 'Ver aula',
            icon: 'pi pi-search order-1 text-primary-500 ',
            styleClass: 'text-primary-500 bg-primary-50 hover:bg-primary-100 -mx-2',
            command: () => this.goToAula(),
        })

        // Agendar Falta
        if (this.item.aula.active === true
            && this.item.aula.finalizado === false
            && this.item.participacao.presente !== true
            && this.item.participacao.active === true) {
            this.menuItems.push({
                label: 'Agendar falta',
                icon: 'pi pi-thumbs-down text-red-500 ',
                styleClass: 'text-red-500 bg-red-50 hover:bg-red-100 -mx-2',
                command: () => this.goToAgendarFalta(),
            })
        }
        // Agendar reposição
        if (this.item.participacao.presente !== true) {
            this.menuItems.push({
                label: 'Agendar reposição',
                icon: 'pi pi-calendar ',
                command: () => this.goToReposicao(),
            })
        }
        // Enviar Mensagem de Falta
        if (this.item.participacao.presente === false) {
            this.menuItems.push({
                label: 'Enviar Mensagem de Falta',
                icon: 'pi pi-whatsapp text-green-500 ',
                styleClass: 'text-green-500 bg-green-50 hover:bg-green-100 -mx-2',
                command: e => this.enviarMensagemFalta(e),
            })
        }
    }

    menuItemChanged(e: SelectChangeEvent, select: NgModel) {
        if (e.value && e.value.command) {
            e.value.command(e);
            select.control.setValue(undefined)
            select.control.updateValueAndValidity();
        }
    }


    request() {
        if (this.item.aula.id == PseudoEvento.EventoId) {
            return lastValueFrom(this.service.getPseudoAula(this.item.aula.turma_Id!, this.item.aula.data))
        }
        return lastValueFrom(this.service.get(this.item.aula.id));
    }

    async goToAula() {
        if (!this.evento) {

            this.evento = await this.request()
                .catch(res => {
                    this.toastr.error(res.message, 'Erro');
                    return undefined
                })
        }
        if (this.evento) {
            if (this.evento.alunos && this.evento.alunos.length) {
                this.evento.alunos = this.evento.alunos.map(x => {
                    if (!this.evento!.finalizado) {
                        if (x.presente !== true && x.presente !== false) {
                            x.presente = true;
                        }
                    }
                    return x
                });
            }

            if (this.evento.professores && this.evento.professores.length) {
                this.evento.professores = this.evento.professores.map(x => {
                    x.presente = this.evento!.finalizado ? x.presente : true;
                    return x
                })
            }
            this.service.setEvento(this.evento);

            this.router.navigate(['dashboard', 'aula', this.crypto.encrypt(this.evento.id)]);
            this.hide();
        }
    }

    async goToAgendarFalta() {
        if (!this.evento) {

            this.evento = await this.request()
                .catch(res => {
                    this.toastr.error(res.message, 'Erro');
                    return undefined
                })
        }

        if (this.evento) {
            let aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
            this.service.setEvento(this.evento);
            this.alunoService.setAluno(aluno);
            this.router.navigate(['dashboard', 'agendar-falta', this.eventoEncryptedId])
        }
    }

    async goToReposicao() {
        if (!this.evento) {

            this.evento = await this.request()
                .catch(res => {
                    this.toastr.error(res.message, 'Erro');
                    return undefined
                })
        }
        if (this.evento) {
            let aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
            this.service.setEventoReposicaoDe(this.evento);
            this.alunoService.setAluno(aluno)
            this.router.navigate(['dashboard', 'reposicao', 'agendar', this.alunoEncryptedId])
        }
    }

    async enviarMensagemFalta(e: any) {
        if (!this.evento) {
            this.evento = await this.request()
                .catch(res => {
                    this.toastr.error(res.message, 'Erro');
                    return undefined
                })
        }
        if (!this.participacao) {
            this.participacao = this.evento!.alunos.find(x => x.aluno_Id == this.item.participacao.aluno_Id);
        }

        if (this.evento && this.participacao) {
            this.mensagemWhatsapp.enviarMensagemFalta(this.evento, this.participacao, e);
        }
    }

    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent): void {
        this.hide();
    }
}
