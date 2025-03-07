import { Component, EventEmitter, Input, OnChanges, Output, output, SimpleChanges, ViewChild } from '@angular/core';
import { CalendarioAlunoList, CalendarioList } from '../../../../models/calendario.model';
import { Popover } from 'primeng/popover';
import { CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import { AlunoService } from '../../../../services/alunos.service';
import { AulaService } from '../../../../services/aulas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../../../../utils';
import $ from 'jquery';
import { ReagendarAulaRequest, ReagendarAulaView } from '../../../../models/reposicao.model';
import moment from 'moment';

@Component({
    selector: 'app-selected-aula',
    standalone: false,
    templateUrl: './selected-aula.component.html',
    styleUrl: './selected-aula.component.css'
})
export class SelectedAulaComponent implements OnChanges {

    @Output() aluno = new EventEmitter<CalendarioAlunoList>();
    @Output() cdkDragCancelChange = new EventEmitter<boolean>();

    @Input() cdkEventItensId: string[] = [];
    @Input() selectedAula?: CalendarioList;
    @Input() cdkDragCancel: boolean = false;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;


    constructor(
        private alunoService: AlunoService,
        private service: AulaService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['selectedAula']) {
            this.selectedAula = changes['selectedAula'].currentValue;
        }

        if (changes['cdkEventItensId']) {
            this.cdkEventItensId = changes['cdkEventItensId'].currentValue;
        }

        if (changes['cdkDragCancel']) {
            this.cdkDragCancel = changes['cdkDragCancel'].currentValue;
        }
    }

    cdkDragStarted(e: CdkDragStart) {
        this.cdkDragCancel = false;
        this.cdkDragCancelChange.emit(false);
    }

    cdkDropListExited(e: CdkDragExit) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
    }

    cdkDragEntered(e: CdkDragEnter) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
        $(e.container.element.nativeElement).not('#alunos').addClass('scalein animation-duration-200 animation-iteration-1')
        $(e.container.element.nativeElement).not('#alunos').addClass('shadow-2 border-3 border-red-500')
    }

    cdkDragExited(e: CdkDragExit) {
        this.cdkDragCancelChange.emit(false);
        this.cdkDragCancel = false;
        $(e.container.element.nativeElement).removeClass('scalein animation-duration-200 animation-iteration-1')
        $(e.container.element.nativeElement).removeClass('shadow-2 border-3 border-red-500')
    }


    showPopover(e: any) {
        console.log('showPopover selectedAula', JSON.parse(JSON.stringify(this.selectedAula)))
        this.popoverSelectedAula.show(e);
        setTimeout(() => {

            if (this.popoverSelectedAula.container) {
                this.popoverSelectedAula.align();
            }
        }, 500);
    }

    hidePopover() {
        this.popoverSelectedAula.hide();
    }

    showAluno(e: MouseEvent, aluno: CalendarioAlunoList) {
        aluno.loadingFoto = true;
        this.aluno.emit(aluno)
        lastValueFrom(this.alunoService.getFoto(aluno.aluno_Id))
            .then(res => {
                aluno.loadingFoto = false;
                aluno.aluno_Foto = res;
            })
            .catch(res => {
                aluno.loadingFoto = false;
            })
    }

    goToAula() {
        if (this.selectedAula) {
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

            console.log('queryParams', queryParams)
            console.log('selectedAula', this.selectedAula)

            this.router.navigate(['aula','reagendar', this.crypto.encrypt(this.selectedAula.aula_Id)], { relativeTo: this.activatedRoute, queryParams: queryParams })

        }
    }

}
