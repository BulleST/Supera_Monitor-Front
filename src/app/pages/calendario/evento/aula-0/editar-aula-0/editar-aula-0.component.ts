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
import { playAlert } from '../../../../../utils/audio';
import { showError } from '../../../../../utils';

@Component({
    selector: 'app-editar-aula-0',
    standalone: false,
    templateUrl: './editar-aula-0.component.html',
    styleUrl: './editar-aula-0.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class EditarAula0Component implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];
    alunoSelected: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;

    @Input() evento: Evento = new Evento;
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

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
    ) {
        this.onSave.subscribe(res => {
            this.markChecklistAsDone();
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            this.alunoSelected = this.evento.alunos[0];
            this.evento.professor_Id = this.evento.professores[0].professor_Id;
        }
        if (changes['professores']) this.professores = changes['professores'].currentValue;
        if (changes['loadingProfessores']) this.loadingProfessores = changes['loadingProfessores'].currentValue;
        if (changes['salaAulas']) this.salaAulas = changes['salaAulas'].currentValue;
        if (changes['loadingSalaAulas']) this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;
        if (changes['duracaoEvento']) this.duracaoEvento = changes['duracaoEvento'].currentValue;
        if (changes['isChamadaPage']) {
            this.isChamadaPage = changes['isChamadaPage'].currentValue
            this.alunoSelected.presente = true;
        };
        this.width.emit('700px')
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }
    
    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }


    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var professor = this.professores.find(x => x.id == e.value) as Professor;
        this.validaProfessor.emit(professor);

        if (professor && professor.disponivel == false && professor.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${professor.disponivelEvent.turma ?? professor.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(professor.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        } else {
            model.control.setErrors({ indisponivel: null });
        }
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var salaAula = this.salaAulas.find(x => x.id == e.value) as SalaAula;
        this.validaSala.emit(salaAula);

        let alunosComRestricaoMobilidade = this.evento.alunos.filter(x => x.restricaoMobilidade);

        if (salaAula && salaAula.disponivel == false && salaAula.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída para outra aula com a turma <b>${salaAula.disponivelEvent.turma ?? salaAula.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(salaAula.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        } 
        else if (alunosComRestricaoMobilidade.length && salaAula && salaAula.andar > 1) {
            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' });
            this.showError('Restrição de Mobilidade', `O(s) aluno(s) ${alunosComRestricaoMobilidade.map(x => x.aluno.split(' '[0])).join(', ')} tem restrição de mobilidade e não podem participar da aula zero na sala ${salaAula.numeroSala} - ${salaAula.andar}º andar.`, e.originalEvent);
            return;
        }

        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }

    presente(item: Evento_Participacao_Aluno, e: any) {
        item.presente = !item.presente;
    }
    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        if (!aluno.celular) {
            this.showError('Celular não informado', 'O aluno não possui um número de celular cadastrado.', e.target);
            return;
        }
        if (aluno.presente) {
            this.showError('Aluno presente', 'O aluno já está presente.', e.target);
            return;
        }

        let object = this.mensagemWhatsapp.enviarMensagemFalta(aluno.aluno, aluno.celular!, this.evento, []);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
        
    }

    markChecklistAsDone() {
        // Comparecimento na aula 0
        if (this.alunoSelected) {
            var id = 33;
            var alunoChecklist = this.alunoSelected.alunoChecklist.find(x => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
            var mensagem = '';
            
            if (this.alunoSelected.presente && alunoChecklist && !alunoChecklist.finalizado) {

                var professor = this.professores.find(x => x.id == this.evento.professor_Id) as Professor;
                
                mensagem = `Aluno compareceu na aula do dia ${moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm')} com o educador ${professor.nome}.\n Aula 0 finalizada por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')}`
                lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
            }
        }
    }


}
