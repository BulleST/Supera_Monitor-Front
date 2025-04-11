import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { Professor } from '../../../../../models/professor.model';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { lastValueFrom, Subscription } from 'rxjs';
import moment from 'moment';
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model';
import { ApostilaService } from '../../../../../services/apostila.service';
import { Apostila } from '../../../../../models/apostila.model';
import { Aluno } from '../../../../../models/alunos.model';
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model';
import { AccountService } from '../../../../../services/account.service';
import { ChecklistService } from '../../../../../services/checklist.service';

@Component({
    selector: 'app-editar-superacao',
    standalone: false,
    templateUrl: './editar-superacao.component.html',
    styleUrl: './editar-superacao.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class EditarSuperacaoComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];
    alunoSelected: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;

    @Input() evento: Evento = new Evento;
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;
    @Input() isChamadaPage = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    @Output() validaProfessor = new EventEmitter<Professor>();
    @Output() validaSala = new EventEmitter<SalaAula>();
    @Output() width = new EventEmitter<string>();
    onSave = new EventEmitter<Evento>();

    apostilaAbacoAluno: Apostila[] = [];
    apostilaAHAluno: Apostila[] = [];
    apostilas: Apostila[] = [];
    loadingApostila = false;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private apostilaService: ApostilaService,
        private accountService: AccountService,
        private checklistService: ChecklistService,
    ) {
        var apostilas = this.apostilaService.listApostila.subscribe(res => this.apostilas = res);
        this.subscription.push(apostilas);

        if (this.apostilas.length == 0 ) {
            this.loadingApostila = true;
            lastValueFrom(this.apostilaService.getApostilas())
                .then(res => this.loadingApostila = false)
                .catch(res => this.loadingApostila = false)
        }
        
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
        if (changes['isChamadaPage']) this.isChamadaPage = changes['isChamadaPage'].currentValue;
        this.width.emit('700px')
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
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

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.professores.find(x => x.id == e.value);
        this.validaProfessor.emit(item);

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.salaAulas.find(x => x.id == e.value);
        this.validaSala.emit(item);
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.mensagemWhatsapp.getEventoTipo(e)
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }

    presenteClick(e: any) {
        if (this.alunoSelected.presente == undefined || this.alunoSelected.presente == null) {
            this.alunoSelected.presente = true;
        }
        else {
            this.alunoSelected.presente = !this.alunoSelected.presente;
        }

        if (!this.alunoSelected.presente && this.alunoSelected.celular) {
            var nome = this.alunoSelected.aluno.split(' ')[0];
            this.confirmationService.confirm({
                target: e.targer,
                message: `O aluno ${nome} faltou? <br> Envie uma mensagem para saber o que aconteceu.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptButtonStyleClass: 'p-button-sm p-button-rounded p-button-success  px-3 mr-0',
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                rejectButtonStyleClass: 'p-button-text p-button-sm',
                accept: () => {
                    var url = this.mensagemWhatsapp.enviarMensagemFalta(this.alunoSelected.aluno, this.alunoSelected.celular!, this.evento);
                    window.open(url, '_blank')
                },
            });

        }
        return this.alunoSelected;
    }
    
        markChecklistAsDone() {
            // Comparecimento na superação
            // Id 35
            var aluno = this.alunoSelected as Evento_Participacao_Aluno;
            var id = 35;
            var alunoChecklist = aluno.alunoChecklist.find(x => x.checklist_Item_Id == id) as Aluno_CheckList_Item;
            var professor = this.professores.find(x => x.id == this.evento.professor_Id) as Professor;
    
            if (alunoChecklist && !alunoChecklist.finalizado && aluno.presente) {
                var mensagem = `Superação agendada para o dia ${moment(this.evento.data).format('DD/MM/YY [às] HHH[h]mm')} com o educador ${professor.nome}.\n
                                Agendamento realizado por ${this.accountService.accountValue?.name} no dia ${moment(new Date()).format('DD/MM/YY [aproximadamente às] HHH[h]mm')}}`
                if (alunoChecklist && !alunoChecklist.finalizado) {
                    lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
                }
            }
        }
        

}
