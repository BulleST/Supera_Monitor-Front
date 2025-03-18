import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
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

    selectedTurma?: Turma;
    turmas: Turma[] = [];
    loadingTurmas = true;

    sexos: Pessoa_Sexo[] = [];
    loadingSexos = true;

    restricoes: Aluno_Restricao[] = [];
    loadingRestricoes = true;

    perfisCognitivos: Aluno_Restricao[] = [];
    loadingPerfisCognitivos = true;


    loadingChecklists = false;
    checklists: Checklist[] = [];

    minDate: Date = new Date(1900, 1, 1);
    maxDate: Date = new Date();

    constructor(

        private service: AlunoService,
        private turmaService: TurmaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private checklistService: ChecklistService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private userService: UserService,
    ) {

        lastValueFrom(this.perfilCognitivoService.getList())
            .then(res => {
                this.perfisCognitivos = res;
                this.loadingPerfisCognitivos = false;
            })
            .catch(res => this.loadingPerfisCognitivos = false);

        lastValueFrom(this.service.getSexo())
            .then(res => {
                this.sexos = res;
                this.loadingSexos = false;
            })
            .catch(res => this.loadingSexos = false);

        lastValueFrom(this.service.getRestricoes())
            .then(res => {
                this.restricoes = res;
                this.loadingRestricoes = false;
            })
            .catch(res => this.loadingRestricoes = false);

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        var checklists = this.checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklists);

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            this.loadFoto();
            this.loadChecklist();
            if (this.turmas.length == 0)
                await this.loadTurmas();

            this.loadingTurmas = false
            this.selectedTurma = this.turmas.find(x => x.id == this.object.turma_Id);
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async loadChecklist() {

        console.log('loadChecklist', this.object.id)
        if (!this.object.id) {
            return;
        }

        if (this.checklists.length == 0) {
            await lastValueFrom(this.checklistService.getList());
        }

         this.object.checklistCompleto = this.checklists.map(checklist => {
            var checklistAluno = new CalendarioAlunoChecklistView;
            checklistAluno.id = checklist.id;
            checklistAluno.nome = checklist.nome;
            checklistAluno.items = this.object.alunoChecklist.filter(x => x.checklist_Id == checklist.id);
            checklistAluno.prazo = checklistAluno.items[0].prazo;
            checklistAluno.finalizados = checklistAluno.items.filter((x: any) => x.finalizado)
            checklistAluno.atrasados = checklistAluno.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
            checklistAluno.pendentesDaSemana = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
            return checklistAluno;
        });

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

    turmaChanged() {
        if (this.selectedTurma) {
            this.object.turma = this.selectedTurma.nome;
            this.object.turma_Id = this.selectedTurma.id;
            this.object.professor_Id = this.selectedTurma.professor_Id;
            this.object.professor = this.selectedTurma.professor;
        } else {
            this.object.turma = '';
            this.object.turma_Id = 1;
            this.object.professor_Id = 0;
            this.object.professor = '';
        }
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

}
