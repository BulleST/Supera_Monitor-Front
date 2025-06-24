import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, insertOrReplace, showError } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Aluno } from '../../../models/alunos.model';
import { AlunoService } from '../../../services/alunos.service';
import { Popover } from 'primeng/popover';
import { HttpErrorResponse } from '@angular/common/http';
import { playAlert, playSuccess } from '../../../utils/audio';
import { ChecklistService } from '../../../services/checklist.service';


@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    aluno_Id: number = 0;
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
        private checklistService: ChecklistService,
        private confirmationService: ConfirmationService,
    ) {
        this.loadPage();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    loadPage() {
        let params = this.activatedRoute.params.subscribe(async res => {
            this.isEditPage = !!res['aluno_id'];
            if (res['aluno_id']) {
                this.visible = true;
                this.loading = true;
                this.aluno_Id = this.crypto.decrypt(res['aluno_id'])

                if (!this.checklistService.list.value.length) {
                    await lastValueFrom(this.checklistService.getList())
                }


                lastValueFrom(this.service.get(this.aluno_Id))
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                    })
                    .catch(res => {
                        this.visible = false;
                        this.visibleChange();
                    });

            } else {
                this.visible = false;
                this.visibleChange();
            }
        })
        this.subscription.push(params);
    }

    visibleChange() {
        if (!this.visible) {
            let route = this.isEditPage ? ['../../'] : ['../']
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }
    async sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e);
        }
        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: 'Tem certeza que deseja salvar os dados da turma?',
            header: 'Salvar dados',
            acceptLabel: 'Salvar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e)
            }
        })
    }


    send(e: any) {
        this.loading = true;

        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.visible = false;
                    this.visibleChange();
                    // playSuccess();

                    let list = this.service.list.value;
                    let index = list.findIndex(x => x.id == this.object.id);

                    let object = list[index];

                    // Inserir aqui os itens que aparecem nas colunas da tabela
                    object.nome = res.object.nome;
                    object.restricaoMobilidade = res.object.restricaoMobilidade;
                    object.turma = res.object.turma;
                    object.turma_Id = res.object.turma_Id;
                    object.perfilCognitivo_Id = res.object.perfilCognitivo_Id;
                    object.perfilCognitivo = res.object.perfilCognitivo;

                    list.splice(index, 1, object);
                    this.service.list.next(list);

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
        return lastValueFrom(this.service.edit(this.object))
    }

}
