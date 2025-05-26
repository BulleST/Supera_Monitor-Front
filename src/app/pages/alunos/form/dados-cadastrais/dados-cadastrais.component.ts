import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno, Pessoa_Sexo } from '../../../../models/alunos.model';
import { Turma } from '../../../../models/turma.model';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { lastValueFrom, Subscription } from 'rxjs';
import { TurmaService } from '../../../../services/turma.service';
import { AlunoService } from '../../../../services/alunos.service';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { Aluno_Restricao, Aluno_Restricao_Request } from '../../../../models/aluno-restricao.model';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { Aluno_CheckList_Item, Checklist } from '../../../../models/checklist.model';
import { ChecklistService } from '../../../../services/checklist.service';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../services/user.service';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import { AlunoRestricaoService } from '../../../../services/aluno-restricao.service';
import { ApostilaService } from '../../../../services/apostila.service';
import { Apostila_Kit } from '../../../../models/apostila.model';
import { SelectChangeEvent } from 'primeng/select';
import { getError, showError } from '../../../../utils';
import { HttpErrorResponse } from '@angular/common/http';
import { playAlert, playSuccess } from '../../../../utils/audio';
import { Popover } from 'primeng/popover';

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
    @Input() isEditPage = false;
    subscription: Subscription[] = [];

    file?: File;
    totalSize: number = 0;
    totalSizePercent: number = 0;
    loadingFile = false;

    oldTurmaId?: number;
    selectedTurma?: Turma;
    turmas: Turma[] = [];
    loadingTurmas = false;

    sexos: Pessoa_Sexo[] = [];
    loadingSexos = false;

    restricoesText = '';
    loadingRestricoes = false;

    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = false;

    loadingChecklists = false;
    checklists: Checklist[] = [];

    selectedKit?: Apostila_Kit;
    loadingKits = false;
    kits: Apostila_Kit[] = [];

    minDate: Date = new Date(1900, 1, 1);
    maxDate: Date = new Date();
    checklistObservacao: string = '';
    textoChecklist = '';

    constructor(

        private service: AlunoService,
        private restricaoService: AlunoRestricaoService,
        private turmaService: TurmaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private checklistService: ChecklistService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private userService: UserService,
        private apostilaService: ApostilaService,
    ) {

        var perfisCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfisCognitivos = res);
        this.subscription.push(perfisCognitivos)

        if (this.perfisCognitivos.length == 0) {
            this.loadingPerfisCognitivos = true;
            lastValueFrom(this.perfilCognitivoService.getList())
                .then(res => this.loadingPerfisCognitivos = false)
                .catch(res => this.loadingPerfisCognitivos = false);
        }

        this.loadingSexos = true;
        lastValueFrom(this.service.getSexo())
            .then(res => {
                this.sexos = res;
                this.loadingSexos = false;
            })
            .catch(res => this.loadingSexos = false);


        this.loadingKits = true;
        lastValueFrom(this.apostilaService.getKit())
            .then(res => {
                this.kits = res;
                this.loadingKits = false;
            })
            .catch(res => this.loadingKits = false);

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        var checklists = this.checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklists);

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['isEditPage']) {
            this.isEditPage = changes['isEditPage'].currentValue;
        }
        if (changes['object']) {
            this.object = changes['object'].currentValue;

            console.log('object', this.object)
            this.loadFoto();

            if (this.turmas.length == 0)
                await this.loadTurmas();

            this.loadingTurmas = false
            this.selectedTurma = this.turmas.find(x => x.id == this.object.turma_Id);
            this.oldTurmaId = this.selectedTurma?.id;

            if (this.object.id) {
                this.loadRestricoes();
                this.selectedKit = this.kits.find(x => x.id == this.object.apostila_Kit_Id);

                if (!this.object.checklist && this.object.checklistCompleto) {
                    var atrasados = this.object.checklistCompleto.filter(x => x.atrasados.length)
                    var pendentesDaSemana = this.object.checklistCompleto.filter(x => x.pendentesDaSemana.length)
                    if (atrasados.length > 0) this.textoChecklist = '90 dias encerrados com itens em atraso';
                    if (atrasados.length == 0 && pendentesDaSemana.length == 0) this.textoChecklist = '90 dias concluídos';
                }
                if (!this.object.rm) {
                    this.object.rm = this.generateRM()
                }
            }

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

    kitChanged(model: NgModel, e: SelectChangeEvent) {
        if (this.selectedKit) {
            this.object.apostila_Kit_Id = this.selectedKit.id;

            var ah = this.selectedKit.apostilas.find(x => x.apostila_Tipo_Id == 2 && x.ordem == 1);
            this.object.apostila_AH_Id = ah?.id;
            this.object.apostila_AH = ah?.nome;
            this.object.numeroPaginaAH = 0;

            var abaco = this.selectedKit.apostilas.find(x => x.apostila_Tipo_Id == 1 && x.ordem == 1);
            this.object.apostila_Abaco_Id = abaco?.id;
            this.object.apostila_Abaco = abaco?.nome;
            this.object.numeroPaginaAbaco = 0;
        } else {
            delete this.object.apostila_Kit_Id;
            delete this.object.apostila_AH_Id;
            delete this.object.apostila_AH;
            delete this.object.numeroPaginaAH;
            delete this.object.apostila_Abaco_Id;
            delete this.object.apostila_Abaco;
            delete this.object.numeroPaginaAbaco;
        }
    }

    turmaChanged(model: NgModel, e: SelectChangeEvent) {
        if (this.selectedTurma) {
            if (this.selectedTurma.alunosAtivos >= this.selectedTurma.capacidadeMaximaAlunos) {
                this.showError('Não há vagas', `Não foi possível inserir o(a) aluno(a) na turma <b class="text-primary-500">${this.selectedTurma.nome}</b> por que o limite de alunos foi alcançado.`, e);
                this.turmaReject(model);
                return;
            }

            if (this.object.restricoes.length > 0 || this.object.restricaoMobilidade) {
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
        var message = 'O aluno apresenta as seguintes restrições: <ul>';
        if (this.object.restricoes.length > 0) {
            message += `${this.object.restricoes.map(x => `<li>${x.descricao}.</li>`)}`
        }
        if (this.object.restricaoMobilidade) {
            message += `<li class="font-bold">Restrição de mobilidade.</li>`

        }
        message += `</ul> <p>Continuar com transferência de turma?</p>`;
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Transferência de turma',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Sim',
            acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
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
            acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
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


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }



    finalizarChecklist(e: any, item: Aluno_CheckList_Item, ngModel: NgModel) {
        playAlert();

        this.confirmationService.confirm({
            key: 'checklistConfirmation',
            message: `Tem certeza que deseja finalizar item<b>"${item.nome}"</b>?`,
            header: 'Finalizar item',
            icon: 'pi pi-comment-dots text-4xl mr-2',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Finalizar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.loadingChecklists = true;
                item.observacoes = this.checklistObservacao
                lastValueFrom(this.checklistService.markAsDone(item.id, this.checklistObservacao))
                    .then(res => {
                        playSuccess();
                        this.checklistObservacao = '';

                        this.loadingChecklists = false;
                        item.finalizado = true;
                        item.dataFinalizacao = res.object.dataFinalizacao;
                        item.account_Finalizacao_Id = res.object.account_Finalizacao_Id;

                        this.userService.get(item.account_Finalizacao_Id!)
                            .then(res => item.account_Finalizacao = res.name);

                    })
                    .catch(res => {
                        this.loadingChecklists = false;
                        this.showError('Não foi possível finalizar checklist.', getError(res), e)
                    })
            },
            reject: () => {
                ngModel.control.setValue(false);
            }
        });

    }

    loadRestricoes() {
        this.loadingRestricoes = true;
        lastValueFrom(this.restricaoService.getList(this.object.id))
            .then(res => {
                this.object.restricoes = res;
                this.loadingRestricoes = false;
                this.getRestricoes();
            })
            .catch(res => this.loadingRestricoes = false);

    }

    generateRM() {
        const min = 100000;
        const max = 999999;
        var rm = Math.floor(Math.random() * (max - min + 1)) + min
        return rm.toString();
    }

    getRestricoes() {
        if (!this.object || !this.object.restricoes || this.object.restricoes.length == 0) {
            this.restricoesText = ''
        } else {
            this.restricoesText = this.object.restricoes.filter(x => x.active).map(x => x.descricao).join(', ')
        }
        return this.restricoesText;
    }

    cadastrarRestricao(e: any, model: HTMLInputElement, popover: Popover) {
        var restricao = model.value;

        if (!restricao) {
            this.showError('Erro', 'Insira uma restrição para salvar', e);
        } else if (this.object.restricoes.find(x => x.descricao == restricao)) {
            this.showError('Erro', 'Essa restrição já existe', e);
        } else {
            playAlert();

            this.confirmationService.confirm({
                target: e.target,
                message: `Você inseriu uma nova restrição, deseja salvar?`,
                header: 'Inserir restrição',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Salvar',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                rejectVisible: true,
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Cancelar',
                accept: async () => {
                    var request: Aluno_Restricao_Request = {
                        id: 0,
                        aluno_Id: this.object.id,
                        descricao: restricao,
                    }
                    this.loadingRestricoes = true;
                    lastValueFrom(this.restricaoService.create(request))
                        .then(res => {
                            model.value = '';
                            this.loadingRestricoes = false;
                            if (res.success) {
                                this.toastrService.success(`Registro cadastrado com sucesso.`);

                                playSuccess();
                                popover.show(e);

                                res.object.active = true;

                                this.object.restricoes.push(res.object);
                                this.getRestricoes();
                            }
                        })
                        .catch((res: HttpErrorResponse) => {
                            this.loadingRestricoes = false;
                            this.showError('Erro', 'Não foi possível inserir essa restrição. \n ' + getError(res), e);
                        })
                },
                reject: () => {
                    model.value = '';
                }
            });
        }

    }
    toggleRestricao(e: any, item: Aluno_Restricao, model: NgModel, popover: Popover) {
        var active = item.active;
        var text = `${active ? 'Habilitar' : 'Desabilitar'}`
        var mensagem = `Tem certeza que deseja ${text.toLocaleLowerCase()} restrição?`;
        var title = `${text} restrição`;

        playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: mensagem,
            header: title,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            acceptLabel: text,
            accept: async () => {

                this.loadingRestricoes = true;
                lastValueFrom(this.restricaoService.toggle(item.id))
                    .then(res => {
                        this.loadingRestricoes = false;
                        if (res.success) {
                            this.toastrService.success(`Concluído`);

                            res.object.active = !res.object.deactivated;
                            playSuccess();
                            popover.show(e);

                            var index = this.object.restricoes.findIndex(x => x.id == item.id);
                            if (index != -1) {
                                this.object.restricoes.splice(index, 1, res.object)
                            }
                            this.getRestricoes();
                        }
                    })
                    .catch((res: HttpErrorResponse) => {
                        this.loadingRestricoes = false;
                        this.showError('Erro', 'Não foi possível inserir essa restrição. \n ' + getError(res), e);
                        model.control.setValue(item.active);
                    })


            },
            reject: () => {
                model.control.setValue(item.active);
            }
        });
    }

}
