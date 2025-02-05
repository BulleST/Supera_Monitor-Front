import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Aluno_Aula, Aulas_List } from '../../../models/aulas.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AulaService } from '../../../services/aulas.service';
import { Crypto } from '../../../utils';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { Popover } from 'primeng/popover';

@Component({
    selector: 'app-aula',
    standalone: false,
    templateUrl: './aula.component.html',
    styleUrl: './aula.component.css',
    providers: [ConfirmationService, MessageService],
})
export class AulaComponent implements OnDestroy {
    visible: boolean = false;
    object = new Aulas_List;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];

    professores: Professor[] = [];
    loadingProfessores = true;

    @ViewChild('op') op!: Popover;
    selectedAluno?: Aluno_Aula;

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
                console.log(id)

                lastValueFrom(this.service.get(id))
                    .then(res => {
                        console.log(res);
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

            acceptLabel: 'Ok',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    displayPopover(event: any, aluno: Aluno_Aula) {
        if (this.selectedAluno && this.selectedAluno.id === aluno.id) {
            this.op.hide();
            delete this.selectedAluno;
        } else {
            this.selectedAluno = aluno;
            this.op.show(event);

            if (this.op.container) {
                this.op.align();
            }
        }
    }

    hidePopover() {
        this.op.hide();
    }

}
