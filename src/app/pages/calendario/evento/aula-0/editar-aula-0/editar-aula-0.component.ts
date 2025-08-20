import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import { ChecklistService } from '../../../../../services/checklist.service';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { showError } from '../../../../../utils';
import { Turma } from '../../../../../models/turma.model';
import { PerfilCognitivo } from '../../../../../models/perfil-cognitivo.model';
import { Apostila_Kit } from '../../../../../models/apostila.model';
import { ApostilaService } from '../../../../../services/apostila.service';
import { PerfilCognitivoService } from '../../../../../services/perfil-cognitivo.services';
import { EventoService } from '../../../../../services/evento.service';
import { FinalizarAulaZeroRequest, ParticipacaoAulaZeroModel } from '../../../../../models/evento-aula-0.model';
import { SalaAulaPipe } from '../../../../../utils/sala-aula.pipe';

@Component({
    selector: 'app-editar-aula-0',
    standalone: false,
    templateUrl: './editar-aula-0.component.html',
    styleUrl: './editar-aula-0.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
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
    @Output() width = new EventEmitter<string>();
    onSave = new EventEmitter<Evento>();

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private accountService: AccountService,
        private checklistService: ChecklistService,
        private calendarioUtils: CalendarioUtils,
        private apostilaService: ApostilaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private eventoService: EventoService,
        private salaAulaPipe: SalaAulaPipe,
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

        let onSave = this.onSave.subscribe((res) => this.markChecklistAsDone());
        this.subscription.push(onSave)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            this.evento.professor_Id = this.evento.professores[0].professor_Id;

            if (!this.evento.finalizado) {
                this.evento.alunos = this.evento.alunos.map(aluno => {
                    aluno.presente = true;
                    aluno.numeroPaginaAH = null as any;
                    aluno.apostila_AH_Id = null as any;
                    aluno.numeroPaginaAbaco = null as any;
                    aluno.apostila_Abaco_Id = null as any;
                    // Initialize new fields as undefined
                    aluno.turma_Id = null as any;
                    aluno.perfilCognitivo_Id = null as any;
                    aluno.apostila_Kit_Id = null as any;
                    return aluno;
                });
            } else {

            }
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

        this.width.emit('700px');
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
        let salaAula = this.salaAulas.find((x) => x.id == e.value) as SalaAula;
        this.validaSala.emit(salaAula);

        let alunosComRestricaoMobilidade = this.evento.alunos.filter(x => x.restricaoMobilidade);
        if (salaAula && salaAula.disponivel == false && salaAula.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            let data = moment(salaAula.disponivelEvent.data).format('HH[h]mm');
            let turma = salaAula.disponivelEvent.turma ?? salaAula.disponivelEvent.descricao;
            let mensagem = `Essa sala está atribuída para outra aula com a turma <b>${turma}</b> no mesmo dia às <b>${data}</b>.`;
            this.showError('Sala Indisponível', mensagem, e.originalEvent);
            return;
        } 
        else if (alunosComRestricaoMobilidade.length && salaAula && salaAula.andar > 1) {

            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' });

            let alunos = alunosComRestricaoMobilidade.map((x) => x.aluno.split(' '[0])).join(', ');
            let sala = this.salaAulaPipe.transform({ salaAula });
            let mensagem = `O(s) aluno(s) ${alunos} tem restrição de mobilidade e não podem participar da aula zero na sala ${sala}`;
            this.showError('Restrição de Mobilidade', mensagem, e.originalEvent);
            return;
        }

        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
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
            && ((aluno.turma_Id && aluno.turma_Id == turma.id) || (aluno.turma_Id != turma.id && turma.vagas > 0))
            // Turma compatível com o perfil do aluno
            && ((aluno.perfilCognitivo_Id && turma.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)) || (!aluno.perfilCognitivo_Id))
        );

    }

    turmaChanged(aluno: Evento_Participacao_Aluno, model: NgModel, e: SelectChangeEvent) {
        let turma = this.turmasFiltered.find(x => x.id == aluno.turma_Id);

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

        if (turma.vagas == 0) {
            model.control.setValue(null)
            return this.showError('Não autorizado', 'A turma ' + turma.nome + ' atingiu a capacidade máxima permitida', e.originalEvent);
        }

        if (aluno.perfilCognitivo_Id && !turma.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)){
            model.control.setValue(null)
            return this.showError('Não autorizado', 'A turma ' + turma.nome + ' não abrange o perfil cognitivo selecionado', e.originalEvent);
        }

        this.calculaVagas(aluno)

    }

    calculaVagas(aluno: Evento_Participacao_Aluno) {
        this.turmas.map(x => {
            x.vagas = x.capacidadeMaximaAlunos - x.alunosAtivos;
            if (x.id == aluno.turma_Id) {
                x.vagas = x.vagas - 1;
            }
        })
        this.turmasFiltered.map(x => {
            x.vagas = x.capacidadeMaximaAlunos - x.alunosAtivos;
            if (x.id == aluno.turma_Id) {
                x.vagas = x.vagas - 1;
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

    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, aluno, e);
    }

    markChecklistAsDone() {
        // Comparecimento na aula 0
        this.evento.alunos
            .filter((aluno) => aluno.presente === true && aluno.active === true)
            .forEach(async (aluno) => {
                const checklistItemId = 33; // ID for "Comparecimento na aula 0"
                try {
                    const checklist = await lastValueFrom(this.checklistService.getChecklistAluno(aluno.aluno_Id));
                    const alunoChecklistItem = checklist.find(item => item.checklist_Item_Id === checklistItemId) as Aluno_CheckList_Item;
                    aluno.alunoChecklist = checklist;

                    if (alunoChecklistItem && !alunoChecklistItem.finalizado) {
                        const professor = this.professores.find(prof => prof.id === this.evento.professor_Id)?.nome;
                        const accountName = this.accountService.accountValue?.name;
                        const eventDate = moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm');
                        const completionDate = moment().format('DD/MM/YY [aproximadamente às] HH[h]mm');

                        const mensagem = `Aluno compareceu na aula 0 do dia ${eventDate} com o educador ${professor}.<br> Aula 0 finalizada por ${accountName} no dia ${completionDate}.`;

                        await lastValueFrom(this.checklistService.markAsDone(alunoChecklistItem.id, mensagem));
                    }
                } catch (error) {
                    this.showError(
                        'Erro ao buscar ou atualizar checklist do aluno',
                        'Não foi possível buscar ou atualizar o checklist do aluno.',
                        error
                    );
                }
            });
    }

}
