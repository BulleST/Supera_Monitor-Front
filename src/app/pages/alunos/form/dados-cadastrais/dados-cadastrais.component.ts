import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Aluno, Pessoa_FaixaEtaria, Pessoa_Geracao, Pessoa_Sexo } from '../../../../models/alunos.model';
import { Turma } from '../../../../models/turma.model';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { lastValueFrom, Subscription } from 'rxjs';
import { TurmaService } from '../../../../services/turma.service';
import { AlunoService } from '../../../../services/alunos.service';
import imageCompression from 'browser-image-compression';

@Component({
    selector: 'app-dados-cadastrais',
    standalone: false,

    templateUrl: './dados-cadastrais.component.html',
    styleUrl: './dados-cadastrais.component.css'
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

    faixaEtarias: Pessoa_FaixaEtaria[] = [];
    loadingFaixaEtarias = true;

    geracoes: Pessoa_Geracao[] = [];
    loadingGeracoes = true;

    sexos: Pessoa_Sexo[] = [];
    loadingSexos = true;

    minDate: Date = new Date(1900, 1, 1);
    maxDate: Date = new Date();

    // fileBase64: string = ''
    constructor(

        private service: AlunoService,
        private turmaService: TurmaService,
    ) {
        lastValueFrom(this.service.getFaixaEtaria())
            .then(res => {
                this.faixaEtarias = res;
                this.loadingFaixaEtarias = false;
            })
            .catch(res => this.loadingFaixaEtarias = false);

        lastValueFrom(this.service.getGeracao())
            .then(res => {
                this.geracoes = res;
                this.loadingGeracoes = false;
            })
            .catch(res => this.loadingGeracoes = false);

        lastValueFrom(this.service.getSexo())
            .then(res => {
                this.sexos = res;
                this.loadingSexos = false;
            })
            .catch(res => this.loadingSexos = false);

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
        if (this.object.id)  {
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

    /**async onSelectedFiles(event: FileSelectEvent) {
        this.loadingFile = true;
        var file = event.files[0];
        
        var options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
            useWebWorker: true,
        }
        const compressedFile = await imageCompression(file, options);
        const arrayBuffer = await compressedFile.arrayBuffer();
        const bytes1 = new Uint8Array(arrayBuffer);
        this.arrayBufferToBase64(new Uint8Array(bytes1));
        console.log('bytes1', bytes1)
        var base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(event.currentFiles[0]);
            reader.onloadend = () => {
                const base64data = reader.result as string;

                let img = document.createElement("img");
                img.src = base64data;
                img.onload = (e: any) => {

                    const WIDTH = 500;
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

        const bytes = this.base64ToArrayBuffer(base64)
        this.object.aluno_Foto = bytes;
        console.log(bytes)
        this.fileBase64 = base64
        this.loadingFile = false;
    }

    arrayBufferToBase64( buffer: Uint8Array ) {
        this.loadingFile = true;
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        var base64 = window.btoa( binary )
        this.fileBase64 = 'data:image/jpeg;base64,'+ base64;
        this.loadingFile = false;
        return base64;
    }
    
    base64ToArrayBuffer(base64: string) {
        var binaryString = atob(base64.split(',')[1]);
        var bytes = new Uint8Array(binaryString.length);
        for (var i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Uint8Array(bytes.buffer);
    }
 */
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
