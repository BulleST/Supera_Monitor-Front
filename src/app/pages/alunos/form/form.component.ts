import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Aluno } from '../../../models/alunos.model';
import { AlunoService } from '../../../services/alunos.service';
import { Popover } from 'primeng/popover';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    object: Aluno = new Aluno;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];
    @ViewChild('op') op!: Popover;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: AlunoService,
        private confirmationService: ConfirmationService,
    ) {

        console.log('constructor')
        this.loadPage();

    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy')
        this.subscription.forEach(item => item.unsubscribe());
    }


    loadPage() {
        console.log('loadPage')
        var params = this.activatedRoute.params.subscribe(res => {
            console.log('res', res)
            this.isEditPage = !!res['aluno_id'];
            if (res['aluno_id']) {
                this.loading = true;
                var aluno_id = this.crypto.decrypt(res['aluno_id'])

                this.service.get(aluno_id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                        console.log('aluno', this.object)
                    })
                    .catch(res => {
                        console.log('catch', res)
                        this.visible = false;
                        this.visibleChange()
                    });

            } else {
                this.visible = false;
                this.visibleChange()
                console.log(res)
            }
        })
        this.subscription.push(params);
    }

    visibleChange() {
        console.log('visibleChange', this.visible)

        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Erro',
            icon: 'pi pi-times-circle text-4xl -mr-2 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }
        this.loading = true;

        lastValueFrom(this.service.edit(this.object))
            .then(res => {
                this.loading = false;
                if (res.success) {
                    insertOrReplace(this.service, res.object);
                    this.visible = false;
                    this.visibleChange();
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
