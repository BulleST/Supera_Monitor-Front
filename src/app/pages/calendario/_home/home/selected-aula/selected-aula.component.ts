import { Component, EventEmitter, Input, OnChanges, Output, output, SimpleChanges, ViewChild } from '@angular/core';
import { CalendarioAluno, CalendarioAula } from '../../../../models/calendario.model';
import { Popover } from 'primeng/popover';
import { CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import { AlunoService } from '../../../../services/alunos.service';
import { AulaService } from '../../../../services/aulas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto, getError } from '../../../../utils';
import $ from 'jquery';
import { PseudoAula} from '../../../../models/reposicao.model';
import moment from 'moment';
import { AulaCreateRequest } from '../../../../models/aulas.model';
import { ConfirmationService } from 'primeng/api';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';

@Component({
    selector: 'app-selected-aula',
    standalone: false,
    templateUrl: './selected-aula.component.html',
    styleUrl: './selected-aula.component.css',
    providers: [ConfirmationService]
})
export class SelectedAulaComponent implements OnChanges {

    @Output() aluno = new EventEmitter<CalendarioAluno>();
    @Output() cdkDragCancelChange = new EventEmitter<boolean>();

    @Input() cdkEventItensId: string[] = [];
    @Input() selectedAula?: CalendarioAula;
    @Input() cdkDragCancel: boolean = false;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    constructor(
        private alunoService: AlunoService,
        private service: AulaService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private confirmationService: ConfirmationService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['selectedAula']) {
            this.selectedAula = changes['selectedAula'].currentValue;
            if (!this.selectedAula) {
                this.hidePopover();
            }
        }

        if (changes['cdkEventItensId']) {
            this.cdkEventItensId = changes['cdkEventItensId'].currentValue;
        }

        if (changes['cdkDragCancel']) {
            this.cdkDragCancel = changes['cdkDragCancel'].currentValue;
        }
    }

    cdkDragStarted(e: CdkDragStart) {
        console.log('cdkDropListExited')
        this.cdkDragCancel = false;
        this.cdkDragCancelChange.emit(false);
        this.popoverSelectedAula.hide();
    }

    cdkDropListExited(e: CdkDragExit) {
        console.log('cdkDropListExited')
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
    }

    cdkDragEntered(e: CdkDragEnter) {
        this.cdkDragCancelChange.emit(false);
        console.log('cdkDragEntered')
        this.cdkDragCancel = false;
        $(e.container.element.nativeElement).not('#alunos').addClass('scalein animation-duration-200 animation-iteration-1')
        $(e.container.element.nativeElement).not('#alunos').addClass('shadow-2 border-3 border-red-500')
    }

    cdkDragExited(e: CdkDragExit) {
        this.cdkDragCancelChange.emit(false);
        console.log('cdkDragExited')
        this.cdkDragCancel = false;
        $(e.container.element.nativeElement).removeClass('scalein animation-duration-200 animation-iteration-1')
        $(e.container.element.nativeElement).removeClass('shadow-2 border-3 border-red-500')
    }

    showPopover(e: any) {
        this.popoverSelectedAula.show(e);
        setTimeout(() => {
            if (this.popoverSelectedAula.container) {
                this.popoverSelectedAula.align();
            }
        }, 500);
    }

    hidePopover() {
        console.log('hidePopover', this.popoverSelectedAula)
        if (this.popoverSelectedAula)
            this.popoverSelectedAula.hide();
    }

    onHide() {
        console.log('onHide')
        this.aluno.emit(undefined);
    }

    async showAluno(e: MouseEvent, aluno: CalendarioAluno) {
        aluno.loadingFoto = true;
         if (aluno.reposicaoDe_Aula_Id && !aluno.reposicaoDe_Aula) {
            await lastValueFrom(this.service.get(aluno.reposicaoDe_Aula_Id))
            .then(res => {
                aluno.reposicaoDe_Aula = res;
                this.aluno.emit(aluno)
            })
        }
        lastValueFrom(this.alunoService.getFoto(aluno.aluno_Id))
            .then(res => {
                aluno.loadingFoto = false;
                aluno.aluno_Foto = res;
                this.aluno.emit(aluno)
            })
            .catch(res => {
                aluno.loadingFoto = false;
            })
    }

    async goToAula(e: any) {
        if (this.selectedAula) {

            if (this.selectedAula.aula_Id == PseudoAula.AulaId) {
                var aulaRequest: AulaCreateRequest = {
                    sala_Id: this.selectedAula.sala_Id,
                    turma_Id: this.selectedAula.turma_Id,
                    professor_Id: this.selectedAula.professor_Id,
                    data: moment(this.selectedAula.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                    observacao: '',
                    descricao: this.selectedAula.turma ?? '',
                    perfilCognitivo: this.selectedAula.perfilCognitivo
                }

                await lastValueFrom(this.service.create(aulaRequest))
                    .then(res => {
                        this.selectedAula = res.object;
                        console.log('selectedAula 3', this.selectedAula)
                    })
                    .catch(res => this.showError('Ocorreu um erro', `Não foi possível visualizar detalhes \n ${getError(res)}`, e));
            }


            this.service.aula.next(this.selectedAula);
            this.router.navigate(['aula', this.crypto.encrypt(this.selectedAula.aula_Id)], { relativeTo: this.activatedRoute })
        }
    }

    goToReagendamento() {
        if (this.selectedAula) {

            var queryParams = {
                id: this.selectedAula.aula_Id,
                sala_Id: this.selectedAula.sala_Id,
                professor_Id: this.selectedAula.professor_Id,
                turma_Id: this.selectedAula.turma_Id,
                turma: this.selectedAula.turma,
                data: moment(this.selectedAula.data).format('YYYY-MM-DD[T]HH:mm:ss'),
                observacao: this.selectedAula.observacao,
            }


            this.router.navigate(['aula', 'reagendar', this.crypto.encrypt(this.selectedAula.aula_Id)], { relativeTo: this.activatedRoute, queryParams: queryParams })

        }
    }


    enviarMensagem(aluno: CalendarioAluno) {
        if (aluno.celular) {
            var celular = aluno.celular.replace(/\D/g, '')
            window.open(`https://api.whatsapp.com/send?phone=+${celular}&text=Olá ${aluno.aluno}`)
        }
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target ?? e,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        return perfilCognitivo.map(x => x.nome).join(', ');
    }
}
