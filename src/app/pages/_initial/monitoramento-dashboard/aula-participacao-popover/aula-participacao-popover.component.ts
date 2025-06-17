import { Component, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Aula_Participacao } from '../../../../models/dashboard.model';
import { Popover } from 'primeng/popover';
import { Router } from '@angular/router';
import { Crypto } from '../../../../utils';

@Component({
    selector: 'app-aula-participacao-popover',
    standalone: false,
    templateUrl: './aula-participacao-popover.component.html',
    styleUrl: './aula-participacao-popover.component.css'
})
export class AulaParticipacaoPopoverComponent implements OnChanges {
    @Input() item!: Dashboard_Aula_Participacao;
    @Input() aluno!: Dashboard_Aluno;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private router: Router,
        private crypto: Crypto,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) this.item = changes['item'].currentValue;
        if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
    }

    show(e: any) {
        this.popover.show(e);
        try {
            this.popover.align();
        }
        catch(e) {
            
        }
    }

    hide() {
        this.popover.hide();
    }

    onHide() {
        
    }

    goToReposicao(aluno_Id: number, evento_Id: number) {
        this.router.navigate(['./', 'agendar-reposicao', this.crypto.encrypt(aluno_Id), this.crypto.encrypt(evento_Id)])
    }

    
    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent): void {
        console.log('onWheel', event)
        this.hide();
    }
}
