import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Evento } from '../../../models/evento.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-aluno-reposicao-dialog',
  standalone: false,
  
  templateUrl: './aluno-reposicao-dialog.component.html',
  styleUrl: './aluno-reposicao-dialog.component.css'
})
export class AlunoReposicaoDialogComponent implements OnChanges, OnDestroy {
    @Input() evento: Evento = new Evento;
    @Input() reagendamentoDe: Evento = new Evento;
    @Input() visible: boolean = false;

    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {

    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) this.evento = changes['evento'].currentValue;
        if (changes['reagendamentoDe']) this.reagendamentoDe = changes['reagendamentoDe'].currentValue;
        if (changes['visible']) this.visible = changes['visible'].currentValue;
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            var route = '../../../../';
            this.router.navigate([route], { relativeTo: this.activatedRoute });
            // this.service.setEvento(undefined)
        }
    }


}
