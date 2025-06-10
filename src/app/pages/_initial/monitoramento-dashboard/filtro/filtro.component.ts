import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DashboardRequest } from '../../../../models/dashboard.model';
import { AccountService } from '../../../../services/account.service';
import { ProfessorService } from '../../../../services/professor.service';
import { AlunoService } from '../../../../services/alunos.service';
import { TurmaService } from '../../../../services/turma.service';
import { Professor } from '../../../../models/professor.model';
import { Turma } from '../../../../models/turma.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../../models/alunos.model';
import { MensagemWhatsapp } from '../../../../utils';

@Component({
    selector: 'app-filtro',
    standalone: false,

    templateUrl: './filtro.component.html',
    styleUrl: './filtro.component.css'
})
export class FiltroComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];

    @Input() visible = false;
    @Input() request = new DashboardRequest;
    @Output() applyFilter = new EventEmitter<DashboardRequest>();
    anos: number[] = []

    professores: Professor[] = [];
    loadingProfessores = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    @Input() alunos: Aluno[] = [];
    @Input() loadingAlunos = false;

    constructor(
        private accountService: AccountService,
        private professorService: ProfessorService,
        private turmaService: TurmaService,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
        var professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
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

        var anoMin = 2025;
        var currentAno = new Date().getFullYear();
        for (let ano = anoMin; ano <= currentAno; ano++) {
            this.anos.push(ano)
        }


    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']) this.visible = changes['visible'].currentValue;
        if (changes['request']) this.request = changes['request'].currentValue;
        if (changes['alunos']) this.alunos = changes['alunos'].currentValue;
        if (changes['loadingAlunos']) this.loadingAlunos = changes['loadingAlunos'].currentValue;
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    filter() {
        this.applyFilter.emit(this.request);
        this.visible = false;
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

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular);
    }


}
