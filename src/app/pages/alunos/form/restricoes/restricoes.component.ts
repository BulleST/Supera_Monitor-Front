import { Component, OnDestroy } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Aluno_Restricao } from '../../../../models/aluno-restricao.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlunoRestricaoService } from '../../../../services/aluno-restricao.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-restricoes',
    standalone: false,
    templateUrl: './restricoes.component.html',
    styleUrl: './restricoes.component.css',
    providers: [ConfirmationService]
})
export class RestricoesComponent implements OnDestroy {
    visible: boolean = false;
    object = new Aluno_Restricao;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: AlunoRestricaoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {
        this.visible = true;
    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }
    visibleChange() {
        if (!this.visible) {
            var route = ['../../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Erro',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    async send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }
        this.loading = true;

        lastValueFrom(this.service.create(this.object))
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.toastrService.success(`Registro cadastrado com sucesso.`);
                    this.visible = false;
                    this.visibleChange();
                    this.service.restricaoCreated.emit(res.object)
                }
                else {
                    this.error = res.message;
                    this.showError(this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError(this.error, e);
            })
    }


}
