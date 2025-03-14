import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Aluno, Pessoa_Sexo } from '../../../../models/alunos.model';
import { Turma } from '../../../../models/turma.model';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { lastValueFrom, Subscription } from 'rxjs';
import { TurmaService } from '../../../../services/turma.service';
import { AlunoService } from '../../../../services/alunos.service';
import { ControlContainer, NgForm } from '@angular/forms';
import { Aluno_Restricao } from '../../../../models/aluno-restricao.model';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { Checklist, checklists } from '../../../../models/checklist.model';

@Component({
    selector: 'app-dados-cadastrais',
    standalone: false,
    templateUrl: './dados-cadastrais.component.html',
    styleUrl: './dados-cadastrais.component.css',
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
    // checklists: any[] = checklists.map(x => ({
    //     label: x.nome,
    //     value: x.id,
    //     items: x.items.map(y => ({
    //         label: y.nome,
    //         value: y.id,
    //     }))
    // }));
    checklists: Checklist[] = checklists;

    minDate: Date = new Date(1900, 1, 1);
    maxDate: Date = new Date();

    constructor(

        private service: AlunoService,
        private turmaService: TurmaService,
        private perfilCognitivoService: PerfilCognitivoService
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

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            this.loadFoto();
            if (this.turmas.length == 0)
                await this.loadTurmas();

            this.loadingTurmas = false

            this.selectedTurma = this.turmas.find(x => x.id == this.object.turma_Id);
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

}
