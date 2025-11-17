import { Component, OnDestroy } from '@angular/core';
import { Roteiro } from '../../../models/roteiro.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto, insertOrReplace, showError } from '../../../utils';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { PrimeNG } from 'primeng/config';
import { FeriadoService } from '../../../services/feriado.service';
import { Feriado } from '../../../models/feriado.model';
import { PseudoEvento } from '../../../models/reposicao.model';

@Component({
    selector: 'app-feriado',
    standalone: false,
    templateUrl: './feriado.component.html',
    styleUrl: './feriado.component.css',
    providers: [ConfirmationService]
})
export class FeriadoComponent implements OnDestroy {
    visible: boolean = false;
    object = new Feriado;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];

    totalSize: number = 0;
    totalSizePercent: number = 0;

    feriados: Feriado[] = [];
    loadingFeriados: boolean = false;

    invalidDates: Date[] = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private feriadoService: FeriadoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private config: PrimeNG
    ) {

        let list = this.feriadoService.list.subscribe(res => {
			this.feriados = res
			this.getInvalidDates();
		});
        this.subscription.push(list);

		this.loadFeriados();

        this.loadPage();
    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        let params = this.activatedRoute.params.subscribe(async res => {
            let id = this.crypto.decrypt(res['id'])
			this.isEditPage = res['id'] && id != PseudoEvento.EventoId

            if (this.isEditPage) {
                this.loading = true;

                lastValueFrom(this.feriadoService.get(id))
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                    })
                    .catch(res => {
                        this.visible = false;
                        this.visibleChange();
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);
    }


	loadFeriados() {
		this.loading  = true;
		lastValueFrom(this.feriadoService.getList())
		.then(res => this.loading = false)
		.catch(res => this.loading = false);
	}

    visibleChange() {
        if (!this.visible) {
            let route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }
  

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    getInvalidDates() {
		this.feriados.forEach(jornada => {
			let data = new Date(jornada.data);
			this.invalidDates.push(data);
		})
    }

    async validateDate(ngModel: NgModel) {
        if (this.feriados.length == 0) {
            this.loadingFeriados = true;
            await lastValueFrom(this.feriadoService.getList()).then(res => this.feriados = res);
            this.loadingFeriados = false;
        }

        let list = this.feriados.sort((x, y) => x.data.getTime() - y.data.getTime())
        let data = moment(ngModel.value).toDate()
        let existe = list.find(x => moment(data).isSame(x.data) && x.id != this.object.id);

        if (existe) {
            this.toastrService.error('Outro feriado foi cadastrado para essa data.');
            ngModel.control.setErrors({'invalid': 'Essa data já está sendo utilizada no feriado ' + existe.descricao + '.'});
            // playError();

        } else {
            ngModel.control.setErrors({ 'invalid': null });
            ngModel.control.updateValueAndValidity();
        }

    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Campos Inválidos', 'Preencha os campos corretamente para salvar.', e);
        }

        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: 'Tem certeza que deseja salvar os dados do roteiro?',
            header: 'Salvar dados',
            acceptLabel: 'Salvar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-text ',
            accept: () => {
                this.send(e)
            }
        })
    }

    async send(e: any) {

        this.loading = true;

        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    // playSuccess();
                    this.toastrService.success(this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
                    insertOrReplace(this.feriadoService, res.object);
                    this.visible = false;
                    this.visibleChange();
                }
                else {
                    this.error = res.message;
                    this.showError('Erro', this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError('Erro', this.error, e);
            })
    }

    request() {
        if (this.isEditPage) {
            return lastValueFrom(this.feriadoService.edit(this.object));
        }
        return lastValueFrom(this.feriadoService.create(this.object));
    }
}
