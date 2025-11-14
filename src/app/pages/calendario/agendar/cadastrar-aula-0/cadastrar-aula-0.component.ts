import { Component, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationService } from 'primeng/api'
import { DialogService } from 'primeng/dynamicdialog'
import { showAgendarAulaZero } from '../../../../utils/show-agendar-superacao'

@Component({
    selector: 'app-cadastrar-aula-0',
    standalone: false,
    templateUrl: './cadastrar-aula-0.component.html',
    styleUrl: './cadastrar-aula-0.component.css',
    providers: [ConfirmationService, DialogService],
})
export class CadastrarAula0Component implements OnDestroy {
    subscription: Subscription[] = []

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
    ) {
        this.show();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe())
    }

    close() {
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
    }

    show() {
        let ref = showAgendarAulaZero(this.dialogService);
        let onClose = ref.onClose.subscribe(res => {
            this.close();
        }) 
        this.subscription.push(onClose);
    }


}
