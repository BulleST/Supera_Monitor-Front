import { Component, OnDestroy } from '@angular/core';
import { Jornada } from '../../../models/jornada.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto, insertOrReplace } from '../../../utils';
import { JornadaService } from '../../../services/jornada.service';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { FileSelectEvent } from 'primeng/fileupload';
import { PrimeNG } from 'primeng/config';

@Component({
    selector: 'app-form',
    standalone: false,
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService]
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    object = new Jornada;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];

    totalSize : number = 0;
    totalSizePercent : number = 0;

    jornadas: Jornada[] = [];
    loadingJornada: boolean = false;

    invalidDates: Date[] = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: JornadaService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private config: PrimeNG
    ) {

        var list = this.service.list.subscribe(res => this.jornadas = res);
        this.subscription.push(list);

        this.loadPage();

        this.getInvalidDates();

    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        var params = this.activatedRoute.params.subscribe(async res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.service.get(id)
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

    visibleChange() {
        if (!this.visible) {
            var route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    onSelectedFiles(event: FileSelectEvent) {
        var files = event.currentFiles;
        files.forEach((file) => {
            this.totalSize += parseInt(this.formatSize(file.size));
        });
        this.totalSizePercent = this.totalSize / 10;
    }
    onRemoveTemplatingFile(event: MouseEvent, file: any, removeFileCallback: any, index: any) {
        removeFileCallback(event, index);
        this.totalSize -= parseInt(this.formatSize(file.size));
        this.totalSizePercent = this.totalSize / 10;
    }

    formatSize(bytes: number) {
        const k = 1024;
        const dm = 3;
        const sizes = this.config.translation.fileSizeTypes as string[];
        if (bytes === 0) {
            return `0 ${sizes[0]}`;
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${formattedSize} ${sizes[i]}`;
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


    async getInvalidDates() {
        console.log('getInvalidDates', this.isEditPage)
        if(this.isEditPage == false) {
            if (this.jornadas.length == 0) {
                this.loadingJornada = true;
                await lastValueFrom(this.service.getList()).then(res => this.jornadas = res);
                this.loadingJornada = false;
            }
    
            this.jornadas.forEach(jornada => {
                var data = new Date(jornada.dataInicio);
                console.log('jornada', jornada)
                console.log(data, '<= ', jornada.dataFim, data <= jornada.dataFim)
    
                while(moment(data).isSameOrBefore(jornada.dataFim, 'date') ) {
                    console.log('data', data)
                    this.invalidDates.push(data);
                    data = moment(data).add(1, 'day').toDate();
                }
            })
        }

    }

    async validateDate(ngModel: NgModel) {
        if (this.jornadas.length == 0) {
            this.loadingJornada = true;
            await lastValueFrom(this.service.getList()).then(res => this.jornadas = res);
            this.loadingJornada = false;
        }

        var list = this.jornadas.sort((x, y) => x.dataInicio < y.dataInicio ? -1 : x.dataInicio < y.dataInicio ? 1 : 0)
        var data = moment(ngModel.value).toDate()
        var existe = list.find(x => data >= x.dataInicio && data <= x.dataFim);
        
        if (existe) {
            this.toastrService.error('Essa data já está em um tema existente');
            ngModel.control.setErrors({
                'invalid': 'Essa data já está sendo utilizada no período da semana ' + existe.semana + '.'
            })
        } else {
            ngModel.control.setErrors({ 'invalid': null });
            ngModel.control.updateValueAndValidity();


            var newList: Jornada[] = JSON.parse(JSON.stringify(list));
            newList.push(this.object)
            newList.sort((x, y) => x.dataInicio < y.dataInicio ? -1 : x.dataInicio < y.dataInicio ? 1 : 0)
            var semana = 0;
            newList.map(x => {
                x.semana = semana++;
                if (this.object.dataInicio == x.dataInicio || this.object.dataFim == x.dataFim) {
                    this.object.semana = x.semana
                }
            })


            
        }
        
        


    }


    async send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }
        this.loading = true;

        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.toastrService.success(this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
                    res.object.dataFim = moment(res.object.dataFim).add(23, 'h').toDate();
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

    request() {
        if (this.isEditPage) {
            return lastValueFrom(this.service.edit(this.object));
        }
        return lastValueFrom(this.service.create(this.object));
    }
}
