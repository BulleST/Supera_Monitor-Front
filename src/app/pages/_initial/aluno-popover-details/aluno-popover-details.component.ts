import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Router } from '@angular/router';
import { EventoTipo } from '../../../models/evento.model';
import { Crypto } from '../../../utils';
import { Aluno } from '../../../models/alunos.model';
import { AlunoService } from '../../../services/alunos.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-aluno-popover-details',
    templateUrl: './aluno-popover-details.component.html',
    styleUrl: './aluno-popover-details.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlunoPopoverDetailsComponent implements OnChanges {
    @Input() aluno: Aluno = new Aluno;
    showChecklist = false
    loading = false;
    EventoTipo = EventoTipo;

    @ViewChild('popover') popover!: Popover

    constructor(
        public mensagemWhatsapp: MensagemWhatsapp,
        private router: Router,
        private crypto: Crypto,
        private alunoService: AlunoService,
    ) {

    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
    }

    toggle(e: any) {
        this.popover.toggle(e)
    }

    show(e: any) {
        this.popover.show(e);
        this.getFoto();
        this.showChecklist = true
    }

    hide() {
        this.popover.hide();
    }
    
    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }
    
    goToAluno(aluno: Aluno) {
        this.router.navigate(['alunos', this.crypto.encrypt(aluno.id)])
    }

    getFoto() {
        lastValueFrom(this.alunoService.getFoto(this.aluno.id))
            .then(res => this.aluno.aluno_Foto = res)
    }

}
