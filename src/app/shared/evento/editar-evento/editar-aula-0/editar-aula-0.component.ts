import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../models/evento.model';
import { Subscription } from 'rxjs';
import { Professor } from '../../../../models/professor.model';
import { SalaAndar, SalaAula } from '../../../../models/sala-aula.model';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { Evento_Participacao_Aluno } from '../../../../models/evento-participacao-aluno.model';
import { CalendarioUtils } from '../../../../utils/calendario-utils';
import { showError } from '../../../../utils';
import { Turma } from '../../../../models/turma.model';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import { Apostila_Kit } from '../../../../models/apostila.model';
import { ApostilaService } from '../../../../services/apostila.service';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { NameFirstWordPipe } from '../../../../utils/name-first-word.pipe';
import { DialogService } from 'primeng/dynamicdialog';
import { showAluno } from '../../../../utils/show-aluno';

@Component({
    selector: 'app-editar-aula-0',
    standalone: false,
    templateUrl: './editar-aula-0.component.html',
    styleUrl: './editar-aula-0.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
        providers: [DialogService],
})
export class EditarAula0Component implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];

    @Input() evento: Evento = new Evento();
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    @Input() turmas: Turma[] = [];
    @Input() loadingTurmas = false;
    turmasFiltered: Turma[] = [];
    
    perfis: PerfilCognitivo[] = [];
    loadingPerfis = false;
    perfisFiltered: PerfilCognitivo[] = [];

    kits: Apostila_Kit[] = [];
    loadingKits = false;

    @Output() validaProfessor = new EventEmitter<Professor>();
    @Output() validaSala = new EventEmitter<SalaAula>();
    onSave = new EventEmitter<Evento>();

    turmaSelected?: Turma;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private apostilaService: ApostilaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private nameFirstWordPipe: NameFirstWordPipe,
        private dialogService: DialogService,
        
    ) {
        // Fetch kits data
        this.apostilaService.getKit().subscribe();
        let kits = this.apostilaService.listKits.subscribe(res => this.kits = res);
        this.subscription.push(kits);

        // Fetch perfis data
        this.perfilCognitivoService.getList().subscribe();
        let perfis = this.perfilCognitivoService.list.subscribe(res => {
            this.perfis = res
            this.perfisFiltered = res
        });
        this.subscription.push(perfis);

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            this.evento.professor_Id = this.evento.professores[0].professor_Id;
        }
        if (changes['professores'])
            this.professores = changes['professores'].currentValue;

        if (changes['loadingProfessores'])
            this.loadingProfessores = changes['loadingProfessores'].currentValue;

        if (changes['salaAulas'])
            this.salaAulas = changes['salaAulas'].currentValue;

        if (changes['loadingSalaAulas'])
            this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;

        if (changes['turmas']) {    
            this.turmas = changes['turmas'].currentValue;
            this.turmasFiltered = this.turmas;
        }

        if (changes['loadingTurmas'])
            this.loadingTurmas = changes['loadingTurmas'].currentValue;

        if (changes['duracaoEvento'])
            this.duracaoEvento = changes['duracaoEvento'].currentValue;

    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe());
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        let professor = this.professores.find((x) => x.id == e.value) as Professor;
        this.validaProfessor.emit(professor);

        if ( professor && professor.disponivel == false && professor.disponivelEvent ) {
            model.control.setErrors({ indisponivel: 'Professor indisponível' });
            let turma = professor.disponivelEvent.turma ?? professor.disponivelEvent.descricao;
            let data = moment(professor.disponivelEvent.data).format('HH[h]mm');
            let mensagem = `Esse professor está atribuído para outra aula com a turma <b>${turma}</b> no mesmo dia às <b>${data}</b>.`;
           
            this.showError('Professor Indisponível', mensagem, e.originalEvent);
            return;
        } 
        else {
            model.control.setErrors({ indisponivel: null });
        }
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.salaAulas.find((x) => x.id == e.value) as SalaAula;
        let alunosRestricao = this.evento.alunos.filter(x => x.restricaoMobilidade);

        this.validaSala.emit(item); 

        if (item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            let data = moment(item.disponivelEvent.data).format('HH[h]mm');
            let tipo = this.getTipo(item.disponivelEvent);
            this.showError(
                'Sala Indisponível',
                `Essa sala está atribuída a outra ${tipo} no mesmo dia às <b>${data}</b>.`,
                e.originalEvent,
            );
            return;
        } 
        
        if (alunosRestricao.length && item.andar > SalaAndar.Terreo) {
            model.control.setErrors({ restricaoMobilidade: 'Mobilidade Reduzida' })
            let alunos = alunosRestricao.map(x => this.nameFirstWordPipe.transform(x.aluno)).join(', ')
            let sala = item.descricao;
            let mensagem = alunosRestricao.length > 1 ?
                        `Os(as) alunos(as) ${alunos} têm mobilidade reduzida e não podem participar da aula zero na sala ${sala}.`
                        : `O(a) aluno(a) ${alunos} tem mobilidade reduzida e não pode participar da aula zero na sala ${sala}.`;
            
            this.showError(
                'Mobilidade Reduzida',
                mensagem,
                e.originalEvent
            );
            return;
        }

        model.control.setErrors({ indisponivel: null })
        model.control.updateValueAndValidity()
    }

    perfilFocus(aluno: Evento_Participacao_Aluno) {
        this.perfisFiltered = this.perfis;

        if (aluno.turma_Id) {
            let turma = this.turmas.find(x => x.id == aluno.turma_Id) as Turma;
            let perfilTurma = turma.perfilCognitivo.map(x => x.id);

            this.perfisFiltered = this.perfisFiltered.filter(x => perfilTurma.includes(x.id));
        }
    }

    turmaFocus(aluno: Evento_Participacao_Aluno) {
        this.turmasFiltered = [];

        this.calculaVagas(aluno);

        this.turmasFiltered = this.turmas;
        this.turmasFiltered = this.turmasFiltered.filter(turma => 
            // Turma ativa
            turma.active 
            // Turma com vagas ou turma do aluno
            && ((aluno.turma_Id && aluno.turma_Id == turma.id) || (aluno.turma_Id != turma.id && turma.vagasDisponiveis > 0))
            // Turma compatível com o perfil do aluno
            && ((aluno.perfilCognitivo_Id && turma.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)) || (!aluno.perfilCognitivo_Id))
            // Turma que seja no térreo se o aluno tiver mobilidade reduzida
            && ((aluno.restricaoMobilidade && turma.andar == SalaAndar.Terreo) || !aluno.restricaoMobilidade)
        );

    }

    turmaChanged(aluno: Evento_Participacao_Aluno, model: NgModel, e: SelectChangeEvent) {
        let turma = this.turmasFiltered.find(x => x.id == aluno.turma_Id);
        this.turmaSelected = turma;

        if (aluno.turma_Id && !turma) {
            model.control.setValue(null)
            return this.showError('Turma inválida', 'Essa turma não existe', e.originalEvent);
        }
        if (!turma) {
            model.control.setValue(null)
            return this.showError('Turma inválida', 'Essa turma não existe', e.originalEvent);
        }
        if (!turma.active) {
            model.control.setValue(null)
            return this.showError('Não autorizado', 'A turma ' + turma.nome + ' foi desabilitada', e.originalEvent);
        }

        if (turma.vagasDisponiveis == 0) {
            model.control.setValue(null)
            return this.showError('Não autorizado', 'A turma ' + turma.nome + ' atingiu a capacidade máxima permitida', e.originalEvent);
        }

        if (aluno.perfilCognitivo_Id && !turma.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)){
            model.control.setValue(null)
            return this.showError('Não autorizado', 'A turma ' + turma.nome + ' não abrange o perfil cognitivo selecionado', e.originalEvent);
        }
        
        if (turma.andar > SalaAndar.Terreo && aluno.restricaoMobilidade) {
            model.control.setValue(null)
            return this.showError(
                'Restricao de Mobilidade', 
                `O aluno(a) ${aluno.aluno} possui mobilidade reduzida e não pode participar dessa turma que ocorre na sala ${turma.sala} - ${turma.andar}º andar.`,
                e.originalEvent
            );
        }

        this.calculaVagas(aluno)

    }

    calculaVagas(aluno: Evento_Participacao_Aluno) {
        this.turmas.map(x => {
            if (x.id == aluno.turma_Id) {
                x.vagasDisponiveis = x.vagasDisponiveis - 1;
            }
        })
        this.turmasFiltered.map(x => {
            if (x.id == aluno.turma_Id) {
                x.vagasDisponiveis = x.vagasDisponiveis - 1;
            }
        })

    }

    presenteClick(aluno: Evento_Participacao_Aluno) {
        aluno.presente = !aluno.presente;
        
        if (aluno.presente === false) {
            aluno.turma_Id = undefined;
            aluno.apostila_Kit_Id = undefined;
            aluno.perfilCognitivo_Id = undefined;
        }
        this.calculaVagas(aluno)

    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e);
    }

    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.aluno,aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    inputFocus(e: any) {
        e.target.select();
    }

    presente(item: Evento_Participacao_Aluno) {
        item.presente = !item.presente;
    }

    enviarMensagemFalta(participacao: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, participacao, e)
        .then(res => {
            if (res) {
                participacao = res.participacao
            }
        })
    }

    showAluno(participacao: Evento_Participacao_Aluno) {
			showAluno(this.dialogService, participacao.aluno_Id);
    }
}
