import { AfterViewInit, Component, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { ConfirmationService } from 'primeng/api'
import { lastValueFrom, Subscription } from 'rxjs'

import { Aluno } from '../../../../models/alunos.model'

import { AlunoService } from '../../../../services/alunos.service'
import { EventoService } from '../../../../services/evento.service'
import { Evento, EventoTipo } from '../../../../models/evento.model'
import { CalendarioUtils, MensagemWhatsapp, showError, validaAlunos } from '../../../../utils'
import { NgModel } from '@angular/forms'

@Component({
    selector: 'app-cadastrar-aula-1',
    standalone: false,
    templateUrl: './cadastrar-aula-1.component.html',
    styleUrl: './cadastrar-aula-1.component.css',
    providers: [ConfirmationService],
})
export class CadastrarAula1Component implements OnDestroy, AfterViewInit {
    visible: boolean = false
    subscription: Subscription[] = []

    alunos: Aluno[] = []
    loadingAlunos = false

    eventos: Evento[] = []
    loadingEventos = false

    selectedEvento?: Evento = undefined
    selectedAluno?: Aluno = undefined
    alunoSelectedId?: number = undefined;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private eventoService: EventoService,
        private alunoService: AlunoService,
        private confirmationService: ConfirmationService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
    ) {
        let alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active && !x.primeiraAula_Id);
            console.log(res);
            console.log(this.alunos);
        })
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAlunos = true
            lastValueFrom(this.alunoService.getList())
                .then(() => (this.loadingAlunos = false))
                .catch(() => (this.loadingAlunos = false))
        }

        let eventos = this.eventoService.eventos.subscribe(res => this.eventos = res)
        this.subscription.push(eventos)

        this.visible = true
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subscription.forEach((e) => e.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
        }
    }

    alunoChanged(e: any, aluno_Id: NgModel) {
        this.loadAluno(e, aluno_Id);
    }

    loadAluno(e: any, aluno_Id: NgModel) {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.get(this.alunoSelectedId!))
            .then(res => {
                this.selectedAluno = res;
                this.loadingAlunos = false;

                this.eventos = this.eventos.filter(evento =>  {
                    const eventoAtivo = evento.active;
                    const ehAula = [EventoTipo.Aula, EventoTipo.TurmaExtra].includes(evento.evento_Tipo_Id);
                    const ehPerfilCompativel = !this.selectedAluno?.perfilCognitivo_Id || evento.perfilCognitivo.map(x => x.id).includes(this.selectedAluno?.perfilCognitivo_Id)
                    const eventoTemVaga = evento.vagas > 0;
                    const alunoEstaNaAula = evento.alunos.map(x => x.aluno_Id).includes(this.selectedAluno!.id);

                    return eventoAtivo 
                        && ehAula 
                        && ehPerfilCompativel 
                        && ((eventoTemVaga && !alunoEstaNaAula) || alunoEstaNaAula);
                })
            })
            .catch(res => {
                this.loadingAlunos = false;
            })
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }
    
}
