import { Component, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Aula, Dashboard_Aula_Participacao } from '../../../../models/dashboard.model';
import { Popover } from 'primeng/popover';
import { Router } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../utils';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../../services/evento.service';
import moment from 'moment';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { Aluno } from '../../../../models/alunos.model';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { AlunoService } from '../../../../services/alunos.service';
import { MenuItem } from 'primeng/api';
import { SelectChangeEvent } from 'primeng/select';
import { NgModel } from '@angular/forms';
@Component({
    selector: 'app-aula-participacao-popover',
    standalone: false,
    templateUrl: './aula-participacao-popover.component.html',
    styleUrl: './aula-participacao-popover.component.css'
})
export class AulaParticipacaoPopoverComponent implements OnChanges {
    @Input() participacao!: Dashboard_Aula_Participacao;
    @Input() aluno!: Dashboard_Aluno;

    @ViewChild('popover') popover!: Popover;
    menuItems: MenuItem[] = [];
    menuOptionsValue: any;

    constructor(
        private router: Router,
        private crypto: Crypto,
        private service: EventoService,
        private alunoService: AlunoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) this.participacao = changes['item'].currentValue;
        if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
        this.loadMenuItems();
    }

    show(e: any) {
        this.popover.show(e);
        try {
            this.popover.align();
        }
        catch (e) {

        }
    }

    hide() {
        this.popover.hide();
    }

    loadMenuItems() {
        this.menuItems = [];

        // Ver aula
        this.menuItems.push({
            label: 'Ver aula',
            icon: 'pi pi-calendar text-primary-500 ',
            styleClass: 'text-primary-500 bg-primary-50 hover:bg-primary-100',
            command: () => this.goToAula(),
        })

        // Agendar Falta
        if (this.participacao.aula.active === true
            && this.participacao.aula.finalizado === false
            && this.participacao.participacao.presente !== true
            && this.participacao.participacao.active === true) {
            this.menuItems.push({
                label: 'Agendar falta',
                icon: 'pi pi-thumbs-down text-red-500 ',
                styleClass: 'text-red-500 bg-red-50 hover:bg-red-100',
                command: () => this.goToAgendarFalta(),
            })
        }
        // Agendar reposição
        if (this.participacao.participacao.presente !== true) {
            this.menuItems.push({
                label: 'Agendar reposição',
                icon: 'pi pi-thumbs-down text-red-500 ',
                styleClass: 'text-red-500 bg-red-50 hover:bg-red-100',
                command: () => this.goToReposicao(),
            })
        }
        // Enviar Mensagem de Falta
        if (this.participacao.participacao.presente === false) {
            this.menuItems.push({
                label: 'Enviar Mensagem de Falta',
                icon: 'pi pi-whatsapp text-green-500 ',
                styleClass: 'text-green-500 bg-green-50 hover:bg-green-100',
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


    goToAula() {

    }

    async goToAgendarFalta() {

        let participacao = this.participacao;

        let aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
        let evento: Evento;
        if (participacao.aula.id == PseudoEvento.EventoId) {
            let turma_Id = participacao.aula.turma_Id!;
            let data = moment(participacao.aula.data).format('YYYY-MM-DDTHH:mm:ss')
            evento = await lastValueFrom(this.service.getPseudoAula(turma_Id, data as any))
        }
        else {
            evento = await lastValueFrom(this.service.get(participacao.aula.id))
        }

        this.service.setEvento(evento);
        this.alunoService.setAluno(aluno);
        this.router.navigate(['dashboard', 'agendar-falta', this.crypto.encrypt(this.aluno.id)]);
    }

    async goToReposicao() {
        let participacao = this.participacao;
        let aluno = await lastValueFrom(this.alunoService.get(this.aluno.id))
        let evento: Evento;
        if (participacao.aula.id == PseudoEvento.EventoId) {
            let turma_Id = participacao.aula.turma_Id!;
            let data = moment(participacao.aula.data).format('YYYY-MM-DDTHH:mm:ss')
            evento = await lastValueFrom(this.service.getPseudoAula(turma_Id, data as any))
        }
        else {
            evento = await lastValueFrom(this.service.get(participacao.aula.id))
        }

        this.service.setEventoReposicaoDe(evento);
        this.alunoService.setAluno(aluno)
        this.router.navigate(['dashboard', 'reposicao', 'agendar', this.crypto.encrypt(this.aluno.id)])
    }


    async enviarMensagemFalta(e: any) {
        let evento: Evento = await lastValueFrom(this.service.get(this.participacao.aula.id));
        let participacao = evento.alunos.find(x => x.id == this.participacao.participacao.id) as Evento_Participacao_Aluno;
        this.mensagemWhatsapp.enviarMensagemFalta(evento, participacao, e);
    }





    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent): void {

        this.hide();
    }
}
