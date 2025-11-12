import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../../../utils';
import { Subscription } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlunoDetalhesComponent } from '../../../shared/aluno/aluno-detalhes/aluno-detalhes.component';
import { showAluno } from '../../../utils/show-aluno-dialog-service';


@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    standalone: false,
    providers: [DialogService]

})
export class FormComponent implements OnInit, OnDestroy {

    subscription: Subscription[] = [];
    aluno_Id: number = 0;
    ref: DynamicDialogRef<AlunoDetalhesComponent> | undefined;

    
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private dialogService: DialogService,

    ) {
    }

    ngOnInit(): void {
        this.loadPage();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    loadPage() {
        let params = this.activatedRoute.params.subscribe(async res => {
            if (res['aluno_id']) {
                this.aluno_Id = this.crypto.decrypt(res['aluno_id']);
                this.showAluno();
            }
            else {
                this.visibleChange();
            }
        })
        this.subscription.push(params);
    }

    showAluno() {

        this.ref = showAluno(this.aluno_Id, this.dialogService);

        var onClose = this.ref.onClose.subscribe(res => this.visibleChange());
        this.subscription.push(onClose)
    }

    visibleChange() {
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    }

}
