import { Component, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Dashboard_Aluno, Dashboard_Aula_Participacao } from '../../../../models/dashboard.model';
import { Popover } from 'primeng/popover';
import { Router } from '@angular/router';
import { Crypto, MensagemWhatsapp } from '../../../../utils';
import { lastValueFrom } from 'rxjs';
import { EventoService } from '../../../../services/evento.service';
import moment from 'moment';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { ToastrService } from 'ngx-toastr';
@Component({
    selector: 'app-aula-participacao-popover',
    standalone: false,
    templateUrl: './aula-participacao-popover.component.html',
    styleUrl: './aula-participacao-popover.component.css'
})
export class AulaParticipacaoPopoverComponent implements OnChanges {
    @Input() item!: Dashboard_Aula_Participacao;
    @Input() aluno!: Dashboard_Aluno;

    @ViewChild('popover') popover!: Popover;

    constructor(
        private router: Router,
        private crypto: Crypto,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private toastr: ToastrService,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) this.item = changes['item'].currentValue;
        if (changes['aluno']) this.aluno = changes['aluno'].currentValue;
    }

    show(e: any) {
        this.popover.show(e);
        try {
            this.popover.align();
        }
        catch(e) {
            
        }
    }

    hide() {
        this.popover.hide();
    }

    onHide() {
        
    }

    goToReposicao(aluno_Id: number, evento_Id: number) {
        lastValueFrom(this.service.get(evento_Id)) 
        .then(evento => {
            this.service.setEventoReposicaoDe(evento);
            this.router.navigate(['dashboard', 'reposicao', 'agendar', this.crypto.encrypt(aluno_Id)])
        })
    }

    enviarMensagemFalta(item: Dashboard_Aula_Participacao, aluno: Dashboard_Aluno) {
        let evento = item.aula as any;

        if (!aluno.celular) {
            this.toastr.error('Celular não informado', 'O aluno não possui um número de celular cadastrado.');
            return;
        }
        if (item.participacao.presente === true) {
            this.toastr.error('Aluno presente', 'O aluno já está presente.');
            return;
        }

        lastValueFrom(this.service.calendario({
            intervaloDe: moment(evento.data, 'YYYY-MM-DD').toDate(),
            intervaloAte: moment(evento.data, 'YYYY-MM-DD').add(1, 'month').toDate(),
            perfil_Cognitivo_Id: aluno.perfilCognitivo_Id,
        }))
            .then(res => {
                let sugestoes = res.filter(aula => {
                    const alunoNaoEstaNaAula = !aula.alunos.find(x => x.aluno_Id == aluno.id);
                    const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.AulaExtra;
                    const temVagas = aula.alunos.filter(x => x.active).length < aula.capacidadeMaximaAlunos;
                    const ehPerfilCognitivoCompativel = aula.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id);
                    const aulaNaoFinalizada = !aula.finalizado;
                    const aulaEstaAtiva = aula.active;
                    const naoEhFeriado = !aula.feriado;

                    return alunoNaoEstaNaAula
                        && ehAula
                        && temVagas
                        && ehPerfilCognitivoCompativel
                        && aulaNaoFinalizada
                        && aulaEstaAtiva
                        && naoEhFeriado;
                });

                let object = this.mensagemWhatsapp.enviarMensagemFalta(aluno.nome, aluno.celular!, evento, sugestoes);
                window.open(object.link, '_blank');
                this.mensagemWhatsapp.copiarMensagem(object.mensagem);
            })
    }

    
    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent): void {

        this.hide();
    }
}
