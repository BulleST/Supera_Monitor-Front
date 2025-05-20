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
import { playAlert, playSuccess } from '../../../utils/audio';


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
        this.loadPage();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    loadPage() {
        var params = this.activatedRoute.params.subscribe(res => {
            this.isEditPage = !!res['aluno_id'];
            if (res['aluno_id']) {
                this.loading = true;
                var aluno_id = this.crypto.decrypt(res['aluno_id'])

                this.service.get(aluno_id)
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
                // this.visible = false;
                this.visible = true;
                this.visibleChange();
            }
        })
        this.subscription.push(params);
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            // icon: 'pi pi-times-circle text-4xl -mr-2 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: ' p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }
    async sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e);
        }
        playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: 'Tem certeza que deseja salvar os dados da turma?',
            header: 'Salvar dados',
            acceptLabel: 'Salvar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: ' p-button-rounded  px-3 mr-0',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-text ',
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
                    playSuccess();

                    var list = this.service.list.value;
                    var index = list.findIndex(x => x.id == this.object.id);

                    var object = list[index];

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
        if (this.isEditPage)
            return lastValueFrom(this.service.edit(this.object))
        return lastValueFrom(this.service.create(this.object))
    }

}
