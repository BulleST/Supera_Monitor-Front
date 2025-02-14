import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AulaService } from '../../../services/aulas.service';
import { Crypto } from '../../../utils';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { Popover } from 'primeng/popover';
import { CalendarioAlunoList, CalendarioList } from '../../../models/calendario.model';
import moment from 'moment';
import { AlunoService } from '../../../services/alunos.service';
import { AulaCreateRequest } from '../../../models/aulas.model';

@Component({
    selector: 'app-aula',
    standalone: false,
    templateUrl: './aula.component.html',
    styleUrl: './aula.component.css',
    providers: [ConfirmationService, MessageService],
})
export class AulaComponent implements OnDestroy {
    visible: boolean = false;
    object = new CalendarioList;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    professores: Professor[] = [];
    loadingProfessores = true;
    professorSelected?: Professor;

    @ViewChild('op') op!: Popover;
    selectedAluno?: CalendarioAlunoList;

    horario: string = '';
    isChamadaPage: boolean = false

    constructor(
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: AulaService,
        private alunoService: AlunoService,
        private professorService: ProfessorService,
    ) {

        var encrypted = localStorage.getItem('aula');
        if (!encrypted) {
            this.visible = false;
            this.visibleChange();
            return;
        }
        this.object = this.crypto.decrypt(encrypted) as CalendarioList;

        if (!this.object) {
            this.visible = false;
            this.visibleChange();
            return;
        }

        this.activatedRoute.url.subscribe(res => {
            var url = res[0];
            console.log(url)
        })

        var params = this.activatedRoute.params.subscribe(res => {
            if (!res['aula_id']) {

                this.visible = false;
                this.visibleChange();
                return;
            }
        })
        this.subscription.push(params);

        this.horario = `${moment(this.object.data).format('HH[h]mm')} às ${moment(this.object.data).add(2, 'hours').format('HH[h]mm')}`;

        this.object.alunos.map(async aluno => {
            aluno.loadingFoto = true;
            aluno.aluno_Foto = await lastValueFrom(this.alunoService.getFoto(aluno.aluno_Id));
            aluno.loadingFoto = false;
            return aluno;
        })

        lastValueFrom(this.professorService.getList())
            .then(res => {
                this.loadingProfessores = false;
                this.professores = res.sort((x, y) => Number(x.deactivated) - Number(y.deactivated))
                this.professorSelected = res.find(x => x.id == this.object.professor_Id);
            })
            .catch(res => this.loadingProfessores = false);

        this.loadPage();

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        // var local = localStorage.getItem('current-event')?.toString();
        // console.log(local)
        // this.object = this.crypto.decrypt(localStorage);
        // console.log(this.object)
        // if (!local || !this.object) {
        //     this.visible = false;
        //     this.visibleChange()
        // }
        this.loading = false;
        this.visible = true;

    }

    toDate(horario: string) {
        var stringDate = new Date(2025, 1, 1).toISOString().substring(0, 10) + 'T' + horario;
        return new Date(stringDate);
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        }
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Error',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    displayPopover(event: any, aluno: CalendarioAlunoList) {
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

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
    }

    verAluno(aluno: CalendarioAlunoList) {
        this.router.navigate(['aluno', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute });
    }

    professorChange(e: any) {
        if (!this.professorSelected) {
            this.professorSelected = this.professores.find(x => x.id == this.object.professor_Id)
            return;
        }
        this.confirmationService.confirm({
            target: e,
            message: `Tem certeza que deseja alterar o professor para essa aula? Sujeito a disponibilidade.`,
            header: 'Troca de professor',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.object.professor_Id = this.professorSelected!.id;
            },
            reject: () => {
                this.professorSelected = this.professores.find(x => x.id == this.object.professor_Id);
            }
        });
    }

    salvarDados() {

    }

    finalizarAula() {

    }

    async fazerChamada() {
        if (!this.object.aula_Id) {
            this.loading = true;
            var aulaRequest: AulaCreateRequest = {
                turma_Id: this.object.turma_Id,
                data: moment(this.object.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: this.object.professor_Id
            };
            
            var aulaResponse = await lastValueFrom(this.service.create(aulaRequest));
            this.object.aula_Id = aulaResponse.object.id;
            this.isChamadaPage = true;
            this.router.navigate(['chamada', this.crypto.encrypt(this.object.aula_Id)], { relativeTo: this.activatedRoute, replaceUrl: true });
        }
    }


}
