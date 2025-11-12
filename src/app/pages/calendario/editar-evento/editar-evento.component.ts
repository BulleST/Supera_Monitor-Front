import { Component } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { EventoService } from '../../../services/evento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Evento } from '../../../models/evento.model';
import { showEvento } from '../../../utils/show-editar-evento';

@Component({
    selector: 'app-editar-evento',
    standalone: false,
    templateUrl: './editar-evento.component.html',
    styleUrl: './editar-evento.component.css',
    providers: [DialogService]
})
export class EditarEventoComponent  {
    subscription: Subscription[] = [];
    evento!: Evento;

    constructor(
        private dialogService: DialogService,
        private service: EventoService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        let params = this.activatedRoute.snapshot.params
        
        if (!params['evento_id'] 
            || !params['evento_nome'] 
            || !['aula-zero', 'superacao', 'reuniao', 'oficina'].includes(params['evento_nome'])
        ) {
            this.close()
            return
        }
        else {
            let evento = this.service.getEvento().subscribe(res => {
                if (res) {
                    this.evento = res;
                    this.showEvento();
                }
            })
            this.subscription.push(evento);
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe())
    }


    close () {
        this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
    }

    showEvento() {
        let ref = showEvento(this.evento, this.dialogService);
        let onClose = ref.onClose.subscribe(res => {
            this.close();
        });
        this.subscription.push(onClose)
    }
}
