import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno, Pessoa_Sexo } from '../../../../models/alunos.model';
import { Turma } from '../../../../models/turma.model';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { lastValueFrom, Subscription } from 'rxjs';
import { TurmaService } from '../../../../services/turma.service';
import { AlunoService } from '../../../../services/alunos.service';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { Aluno_Restricao } from '../../../../models/aluno-restricao.model';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { Aluno_CheckList_Item, Checklist } from '../../../../models/checklist.model';
import { ChecklistService } from '../../../../services/checklist.service';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { UserService } from '../../../../services/user.service';
import { CalendarioAlunoChecklistView } from '../../../../models/calendario.model';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import { AlunoRestricaoService } from '../../../../services/aluno-restricao.service';
import { MultiSelect, MultiSelectChangeEvent } from 'primeng/multiselect';

@Component({
    selector: 'app-dados-cadastrais',
    standalone: false,
    templateUrl: './dados-cadastrais.component.html',
    styleUrl: './dados-cadastrais.component.css',
    providers: [ConfirmationService],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }] // Permite validação de form pai em input de componente filho
})
export class DadosCadastraisComponent implements OnChanges, OnDestroy {
    @Input() object = new Aluno;
    subscription: Subscription[] = [];

    file?: File;
    totalSize: number = 0;
    totalSizePercent: number = 0;
    loadingFile = false;

    oldTurmaId?: number;
    selectedTurma?: Turma;
    turmas: Turma[] = [];
    loadingTurmas = true;

    sexos: Pessoa_Sexo[] = [];
    loadingSexos = true;

    @ViewChild('_restricoes') _restricoes!: NgModel;
    @ViewChild('restricoesMultiselect') restricoesMultiselect!: MultiSelect;
    restricoes: Aluno_Restricao[] = [];
    loadingRestricoes = true;

    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = true;

    loadingChecklists = false;
    checklists: Checklist[] = [];

    minDate: Date = new Date(1900, 1, 1);
    maxDate: Date = new Date();

    constructor(

        private service: AlunoService,
        private restricaoService: AlunoRestricaoService,
        private turmaService: TurmaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private checklistService: ChecklistService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private userService: UserService,
    ) {

        var restricaoCreated = this.service.restricaoCreated.subscribe(res => this.restricoes.push(res));
        this.subscription.push(restricaoCreated)

        var perfisCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfisCognitivos = res);
        this.subscription.push(perfisCognitivos)

        if (this.perfisCognitivos.length == 0)
            lastValueFrom(this.perfilCognitivoService.getList())
                .then(res => this.loadingPerfisCognitivos = false)
                .catch(res => this.loadingPerfisCognitivos = false);

        lastValueFrom(this.service.getSexo())
            .then(res => {
                this.sexos = res;
                this.loadingSexos = false;
            })
            .catch(res => this.loadingSexos = false);

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        var checklists = this.checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklists);

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            this.loadFoto();

            if (this.turmas.length == 0)
                await this.loadTurmas();


            if (this.object.id) {
                this.loadingRestricoes = true;
                lastValueFrom(this.restricaoService.getList(this.object.id))
                    .then(res => {
                        this.restricoes = res;
                        this.loadingRestricoes = false;
                        this.object.restricoes = res;
                    })
                    .catch(res => this.loadingRestricoes = false);
            }

            this.loadingTurmas = false
            this.selectedTurma = this.turmas.find(x => x.id == this.object.turma_Id);
            this.oldTurmaId = this.selectedTurma?.id;
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async loadTurmas() {
        await lastValueFrom(this.turmaService.getList())
            .then(res => {
                this.turmas = res;
                this.loadingTurmas = false;
            })
            .catch(res => this.loadingTurmas = false);
    }

    choose(fileUpload: FileUpload) {
        fileUpload.choose()
    }

    async onSelectedFiles(event: FileSelectEvent) {
        this.loadingFile = true;
        this.file = event.currentFiles[0];
        var base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(event.currentFiles[0]);
            reader.onloadend = () => {
                const base64data = reader.result as string;

                let img = document.createElement("img");
                img.src = base64data;
                img.onload = (e: any) => {

                    const WIDTH = 400;
                    let canvas = document.createElement("canvas");
                    let ratio = WIDTH / e.target.width;

                    canvas.width = WIDTH;
                    canvas.height = e.target.height * ratio;
                    // context is where the canvas references to know what data to render
                    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // here we specify the quality, which is the second argument in .toDataUrl(...) | here the output should be 50% the quality of the original, lowering the detail and file size
                    let newImageUrl = context.canvas.toDataURL("image/jpg", 50); // quality ranges 1-100

                    resolve(newImageUrl);
                };
            };
        })
        this.object.aluno_Foto = base64;
        this.loadingFile = false;
    }

    loadFoto() {
        if (this.object.id) {
            this.loadingFile = true;

            lastValueFrom(this.service.getFoto(this.object.id))
                .then(res => {
                    this.object.aluno_Foto = res;
                    this.loadingFile = false;
                })
                .catch(res => {
                    this.loadingFile = false;
                })
        }
    }

    turmaChanged(model: NgModel, e: any) {
        if (this.selectedTurma) {
            if (this.selectedTurma.alunosAtivos >= this.selectedTurma.capacidadeMaximaAlunos) {
                this.showError('Não há vagas', `Não foi possível inserir o(a) aluno(a) na turma <b class="text-primary-500">${this.selectedTurma.nome}</b> por que o limite de alunos foi alcançado.`, e);
                this.turmaReject(model);
                return;
            }
            
            if (this.object.restricoes.length > 0) {
                this.turmaChangedRestricaoConffirm(e, model);
            }
            else {
                this.turmaChangedConffirm(e, model);
            }

        } else {
            this.object.turma = '';
            this.object.turma_Id = undefined as any;
            this.object.professor_Id = undefined as any;
            this.object.professor = '';
        }
    }

    turmaChangedRestricaoConffirm(e: any, model: NgModel) {
        this.confirmationService.confirm({
            target: e.target,
            message: `
                <p>O aluno apresenta uma ou mais restrições:</p>
                <ul>${this.object.restricoes.map(x => `<li>${x.descricao}</li>`)}</ul>
                <p>Continuar com transferência de turma?</p>
            `,
            header: 'Transferência de turma',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Sim',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: () => {
                this.turmaChangedConffirm(e, model);
            },
            reject: () => {
                this.turmaReject(model);
            },
        })
    }

    turmaChangedConffirm(e: any, model: NgModel) {
        var mensagem = 'Continuar com transferência de turma?';
        var perfilCognitivo = this.selectedTurma!.perfilCognitivo.map(x => x.id);
        if (perfilCognitivo.includes(this.object.perfilCognitivo_Id) == false) {
            mensagem = 'O perfil dessa turma é diferente desse aluno. <br>' + mensagem
        }
        this.confirmationService.confirm({
            target: e.target,
            message: mensagem,
            header: 'Transferência de turma',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Sim',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: () => {
                this.turmaAccept();
            },
            reject: () => {
                this.turmaReject(model);
            },
        })
    }

    turmaReject(model: NgModel) {
        var turma = this.turmas.find(x => x.id == this.oldTurmaId);
        this.object.turma = turma?.nome as any;
        this.object.turma_Id = turma?.id as any;
        this.object.professor_Id = turma?.professor_Id as any;
        this.object.professor = turma?.professor as any;
        this.selectedTurma = turma;
        model.control.setValue(turma);
    }

    turmaAccept() {
        var turma = this.selectedTurma as Turma;
        this.object.turma = turma.nome;
        this.object.turma_Id = turma.id;
        this.object.professor_Id = turma.professor_Id;
        this.object.professor = turma.professor;
    }

    showError(title: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: title,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    checkboxChange(item: Aluno_CheckList_Item, checklist: CalendarioAlunoChecklistView, model: NgModel, e: any) {

        if (model.control.value) {

            if (moment(item.prazo).week() > moment(new Date).week()) {
                this.showError('Checklist indisponível', 'Você não pode finalizar esse checklist ainda.', e);
                model.control.setValue(false);
                return;
            }


            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza que deseja marcar etapa como realizada?.`,
                header: 'Finalizar etapa',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Finalizar',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Ainda não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    this.loadingChecklists = true;
                    lastValueFrom(this.checklistService.markAsDone(item.id))
                        .then(res => {
                            this.loadingChecklists = false;
                            this.toastrService.success(`Checklist ${item.nome} finalizado com sucesso!`);
                            item.finalizado = true;
                            item.dataFinalizacao = res.object.dataFinalizacao;
                            item.account_Finalizacao_Id = res.object.account_Finalizacao_Id;

                            // checklist.prazo = checklist.items[0].prazo;
                            // checklist.finalizados = checklist.items.filter((x: any) => x.finalizado)
                            // checklist.atrasados = checklist.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                            // checklist.pendentesDaSemana = checklist.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);

                            this.userService.get(item.account_Finalizacao_Id!)
                                .then(res => item.account_Finalizacao = res.name);

                        })
                },
                reject: () => {
                    model.control.setValue(false);
                }
            });
        }
    }

    restricaoChanged(e: MultiSelectChangeEvent) {
        var inserted = e.value.find((x: Aluno_Restricao) => x.id == e.itemValue.id);
        if (!inserted) {
            this.confirmationService.confirm({
                target: e.originalEvent.target as any,
                message: `Tem certeza que deseja remover essa restrição?. \n Não haverá mais notificações referente a essa restrição em futuras atualizações do aluno. \n Restrição: ${e.itemValue.descricao}`,
                header: 'Remover restrição',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Contrinuar',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Cancelar',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {

                },
                reject: () => {
                    this.object.restricoes.push(e.itemValue);
                    // this._restricoes.control.setValue(this.object.restricoes);
                    // this._restricoes.update.emit(this.object.restricoes);
                    // this.restricoesMultiselect.updateModel(this.object.restricoes)
                    // this.restricoesMultiselect.selectedOptions = this.object.restricoes
                    // this.restricoesMultiselect.writeValue(this.object.restricoes);
                }
            });
        }
        console.log(e)
    }
}
