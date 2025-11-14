import { AfterViewInit, Component, EventEmitter,OnDestroy, Output, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Popover } from 'primeng/popover';
import { Monitoramento_Request } from '../../../models/monitoramento.model';
import { Professor } from '../../../models/professor.model';
import { Turma } from '../../../models/turma.model';
import { Aluno } from '../../../models/alunos.model';
import { AccountService } from '../../../services/account.service';
import { ProfessorService } from '../../../services/professor.service';
import { TurmaService } from '../../../services/turma.service';
import { AlunoService } from '../../../services/alunos.service';
import { MensagemWhatsapp } from '../../../utils';
import moment from 'moment';

@Component({
  selector: 'app-filtro-popover',
  standalone: false,
  templateUrl: './filtro-popover.component.html',
  styleUrl: './filtro-popover.component.css'
})
export class FiltroPopoverComponent  implements OnDestroy, AfterViewInit {
    
    @Output() applyFilter = new EventEmitter<Monitoramento_Request>();
    
    subscription: Subscription[] = [];
    request = new Monitoramento_Request;
    anos: number[] = []

    professores: Professor[] = [];
    loadingProfessores = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    alunos: Aluno[] = [];
    loadingAlunos = false;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private accountService: AccountService,
        private professorService: ProfessorService,
        private turmaService: TurmaService,
        private alunoService: AlunoService,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
        this.applyFilter = new EventEmitter<Monitoramento_Request>();

        let professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
                lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }

        let alunos = this.alunoService.list.subscribe(res => this.alunos = res);
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        this.accountService.account.subscribe(res => {
            if (!localStorage.getItem('professor_Id')) {
                this.request.professor_Id = res?.professor_Id;
            }
        });

        if (!!localStorage.getItem('professor_Id')) {
            this.request.professor_Id = parseInt(localStorage.getItem('professor_Id')!)
        }

        if (!!localStorage.getItem('turma_Id')) {
            this.request.turma_Id = parseInt(localStorage.getItem('turma_Id')!)
        }

        if (!!localStorage.getItem('aluno_Id')) {
            this.request.aluno_Id = parseInt(localStorage.getItem('aluno_Id')!)
        }

        let anoMin = 2025;
        let currentAno = moment().add(1, 'year').year();
        // let currentAno = 2030;
        for (let ano = anoMin; ano <= currentAno; ano++) {
            this.anos.push(ano)
        }
        
    }
    ngAfterViewInit(): void {
        this.filter()
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    show(e: any) {
        this.popover.show(e);
    }
    
    toggle(e: any) {
        if (this.popover)
        this.popover.toggle(e);
    }

    hide() {
        if (this.popover)
        this.popover.hide();
    }

    filter() {
        this.applyFilter.emit(this.request);
        this.hide();
    }

    turmaChanged() {
        if (this.request.turma_Id) {
            let turma = this.turmas.find(x => x.id == this.request.turma_Id) as Turma;
            this.request.professor_Id = turma.professor_Id;
        }

        this.setAlunosDisabled();


        let aluno = this.alunos.find(x => x.id == this.request.aluno_Id);
        if (this.request.turma_Id && aluno && aluno.turma_Id != this.request.turma_Id) {
            this.request.aluno_Id = undefined;
        }

        this.setLocalStorage();
    }

    professorChanged() {

        this.setTurmaDisabled();
        this.setAlunosDisabled();

        let aluno = this.alunos.find(x => x.id == this.request.aluno_Id);
        if (this.request.professor_Id && aluno && aluno.professor_Id != this.request.professor_Id) {
            this.request.aluno_Id = undefined;
        }

        let turma = this.turmas.find(x => x.id == this.request.turma_Id);
        if (this.request.turma_Id && turma && turma.id != this.request.turma_Id) {
            this.request.turma_Id = undefined;
        }

        this.setLocalStorage();

    }

    alunoChanged() {
        if (this.request.aluno_Id) {
            let aluno = this.alunos.find(x => x.id == this.request.aluno_Id) as Aluno;
            this.request.turma_Id = aluno.turma_Id;
            this.request.professor_Id = aluno.professor_Id;
        }

        this.setLocalStorage();
    }

    setTurmaDisabled() {
        this.turmas = this.turmas.map((x: any) => {
            x.disabled = this.request.professor_Id ? x.professor_Id == this.request.professor_Id ? false : true : false;
            return x;
        })

    }

    setAlunosDisabled() {
        this.alunos = this.alunos.map((x: any) => {
            if (this.request.turma_Id && this.request.professor_Id) {
                x.disabled = x.turma_Id == this.request.turma_Id && x.professor_Id == this.request.professor_Id ? false : true;
            } else if (this.request.turma_Id) {
                x.disabled = x.turma_Id == this.request.turma_Id ? false : true;
            } else if (this.request.professor_Id) {
                x.disabled = x.professor_Id == this.request.professor_Id ? false : true;
            }
            return x;
        });
    }

    setLocalStorage() {
        if (this.request.turma_Id) {
            localStorage.setItem('turma_Id', (this.request.turma_Id ?? null).toString());
        } else {
            localStorage.removeItem('turma_Id');
        }
        if (this.request.professor_Id) {
            localStorage.setItem('professor_Id', (this.request.professor_Id ?? null).toString());
        } else {
            localStorage.removeItem('professor_Id');
        }
        if (this.request.aluno_Id) {
            localStorage.setItem('aluno_Id', (this.request.aluno_Id ?? null).toString());
        } else {
            localStorage.removeItem('aluno_Id');
        }

    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    enviarMensagem(aluno: Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }


}
