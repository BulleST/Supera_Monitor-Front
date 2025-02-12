import { Component, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AulaService } from '../../../services/aulas.service';
import { Crypto } from '../../../utils';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { CalendarioAlunoList, CalendarioList } from '../../../models/calendario.model';

@Component({
    selector: 'app-chamada',
    standalone: false,

    templateUrl: './chamada.component.html',
    styleUrl: './chamada.component.css',
    providers: [ConfirmationService, MessageService],
})
export class ChamadaComponent implements OnDestroy {
    visible: boolean = false;
    object: CalendarioList = new CalendarioList;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];


    professores: Professor[] = [];
    loadingProfessores = true;

    constructor(
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: AulaService,
        private professorService: ProfessorService,
    ) {


        lastValueFrom(this.professorService.getList())
            .then(res => {
                this.loadingProfessores = false;
                this.professores = res.sort((x, y) => Number(x.deactivated) - Number(y.deactivated))
            })
            .catch(res => this.loadingProfessores = false);

        this.loadPage();

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        var params = this.activatedRoute.params.subscribe(res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])
                lastValueFrom(this.service.get(id))
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                    })
                    .catch(res => {
                        this.visible = false;
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);
    }

    toDate(horario: string) {
        var stringDate = new Date(2025, 1, 1).toISOString().substring(0, 10) + 'T' + horario;
        return new Date(stringDate);

    }

    visibleChange() {
        if (!this.visible) {
            var route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Error',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    // send(form: NgForm, e: any) {
    //     if (form.invalid) {
    //         return;
    //     }
    //     this.loading = true;

    //     this.request()
    //         .then(res => {
    //             this.loading = false;
    //             if (res.success) {
    //                 insertOrReplace(this.service, res.object);
    //                 this.visible = false;
    //                 this.visibleChange();
    //             }
    //             else {
    //                 this.error = res.message;
    //                 this.showError(this.error, e);
    //             }
    //         })
    //         .catch(res => {
    //             this.error = getError(res);
    //             this.loading = false;
    //             this.showError(this.error, e);
    //         })
    // }

    // request() {
    //     if (this.isEditPage) {
    //         return lastValueFrom(this.service.edit(this.object));
    //     }
    //     return lastValueFrom(this.service.create(this.object));
    // }

}
