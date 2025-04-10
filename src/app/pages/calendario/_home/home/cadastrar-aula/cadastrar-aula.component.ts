import { Component, OnDestroy } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { AulaCreateRequest } from '../../../../models/aulas.model';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import { Professor } from '../../../../models/professor.model';
import { SalaAula } from '../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../../../services/turma.service';
import { AulaService } from '../../../../services/aulas.service';
import { ProfessorService } from '../../../../services/professor.service';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../../services/sala-aula.service';
import { Turma } from '../../../../models/turma.model';
import { Aluno } from '../../../../models/alunos.model';
import { AlunoService } from '../../../../services/alunos.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-cadastrar-aula',
  standalone: false,
  templateUrl: './cadastrar-aula.component.html',
  styleUrl: './cadastrar-aula.component.css',
  providers: [ConfirmationService],
})
export class CadastrarAulaComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: AulaCreateRequest = new AulaCreateRequest;
    data = new Date();
    horario = new Date();
    
    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = true;

    professores: Professor[] = [];
    loadingProfessores = true;

    salaAula: SalaAula[] = [];
    loadingSalaAula = true;

    turmas: Turma[] = [];
    loadingTurmas = true;

    alunosSelected: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = true;

    constructor(
            private router: Router,
            private activatedRoute: ActivatedRoute,
            private turmaService: TurmaService ,
            private aulaService: AulaService,
            private professorService: ProfessorService,
            private perfilCognitivoService: PerfilCognitivoService,
            private confirmationService: ConfirmationService,
            private toastrService: ToastrService,
            private salaAulaService: SalaAulaService,
            private alunoService: AlunoService,
    ) {
            var professores = this.professorService.list.subscribe(res => this.professores = res);
            this.subscription.push(professores);
    
            lastValueFrom(this.professorService.getList())
            .then(res => this.loadingProfessores = false)
            .catch(res => this.loadingProfessores = false);
    
            var salaAula = this.salaAulaService.list.subscribe(res => this.salaAula = res);
            this.subscription.push(salaAula);
    
            lastValueFrom(this.salaAulaService.getList())
            .then(res => this.loadingSalaAula = false)
            .catch(res => this.loadingSalaAula = false);
    
            var perfisCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfisCognitivos = res);
            this.subscription.push(perfisCognitivos);
    
            lastValueFrom(this.perfilCognitivoService.getList())
            .then(res => this.loadingPerfisCognitivos = false)
            .catch(res => this.loadingPerfisCognitivos = false);
    
            var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
            this.subscription.push(turmas);
    
            lastValueFrom(this.turmaService.getList())
            .then(res => this.loadingTurmas = false)
            .catch(res => this.loadingTurmas = false);
    
            var alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true));
            this.subscription.push(alunos);
    
            lastValueFrom(this.alunoService.getList())
            .then(res => this.loadingAlunos = false)
            .catch(res => this.loadingAlunos = false);

            this.visible = true;

    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate( ['../../'], { relativeTo: this.activatedRoute });
        }
    }
    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    getCorTurma(turma_Id:number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    send(form: NgForm) {
        
    }

}
