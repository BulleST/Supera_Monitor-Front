import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
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
import {
  FinalizarAulaZeroRequest,
  ParticipacaoAulaZeroModel,
} from '../../../../../models/evento-aula-0.model';

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

  perfis: PerfilCognitivo[] = [];
  loadingPerfis = false;

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
    private eventoService: EventoService
  ) {
    // Fetch kits data
    this.apostilaService.getKit().subscribe();
    let kits = this.apostilaService.listKits.subscribe(
      (res) => (this.kits = res)
    );
    this.subscription.push(kits);

    // Fetch perfis data
    this.perfilCognitivoService.getList().subscribe();
    let perfis = this.perfilCognitivoService.list.subscribe(
      (res) => (this.perfis = res)
    );
    this.subscription.push(perfis);

    this.onSave.subscribe((res) => {
      this.markChecklistAsDone();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evento']) {
      this.evento = changes['evento'].currentValue;
      this.evento.professor_Id = this.evento.professores[0].professor_Id;

      if (!this.evento.finalizado) {
        this.evento.alunos = this.evento.alunos.map((x) => {
          x.presente = true;
          x.numeroPaginaAH = null as any;
          x.apostila_AH_Id = null as any;
          x.numeroPaginaAbaco = null as any;
          x.apostila_Abaco_Id = null as any;
          // Initialize new fields as undefined
          x.turma_Id = null as any;
          x.perfilCognitivo_Id = null as any;
          x.apostila_Kit_Id = null as any;
          return x;
        });
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

    if (changes['turmas']) this.turmas = changes['turmas'].currentValue;
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
    var professor = this.professores.find((x) => x.id == e.value) as Professor;
    this.validaProfessor.emit(professor);

    if (
      professor &&
      professor.disponivel == false &&
      professor.disponivelEvent
    ) {
      model.control.setErrors({ indisponivel: 'Professor indisponível' });
      this.showError(
        'Professor Indisponível',
        `Esse professor está atribuído para outra aula com a turma <b>${
          professor.disponivelEvent.turma ?? professor.disponivelEvent.descricao
        }</b> no mesmo dia às <b>${moment(
          professor.disponivelEvent.data
        ).format('HH[h]mm')}</b>.`,
        e.originalEvent
      );
      return;
    } else {
      model.control.setErrors({ indisponivel: null });
    }
    model.control.updateValueAndValidity();
  }

  salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
    var salaAula = this.salaAulas.find((x) => x.id == e.value) as SalaAula;
    this.validaSala.emit(salaAula);

    let alunosComRestricaoMobilidade = this.evento.alunos.filter(
      (x) => x.restricaoMobilidade
    );

    if (salaAula && salaAula.disponivel == false && salaAula.disponivelEvent) {
      model.control.setErrors({ indisponivel: 'Sala indisponível' });
      this.showError(
        'Sala Indisponível',
        `Essa sala está atribuída para outra aula com a turma <b>${
          salaAula.disponivelEvent.turma ?? salaAula.disponivelEvent.descricao
        }</b> no mesmo dia às <b>${moment(salaAula.disponivelEvent.data).format(
          'HH[h]mm'
        )}</b>.`,
        e.originalEvent
      );
      return;
    } else if (
      alunosComRestricaoMobilidade.length &&
      salaAula &&
      salaAula.andar > 1
    ) {
      model.control.setErrors({
        restricaoMobilidade: 'Restrição de Mobilidade',
      });
      this.showError(
        'Restrição de Mobilidade',
        `O(s) aluno(s) ${alunosComRestricaoMobilidade
          .map((x) => x.aluno.split(' '[0]))
          .join(
            ', '
          )} tem restrição de mobilidade e não podem participar da aula zero na sala ${
          salaAula.numeroSala
        } - ${salaAula.andar}º andar.`,
        e.originalEvent
      );
      return;
    }

    model.control.setErrors({ indisponivel: null });
    model.control.updateValueAndValidity();
  }

  getTipo(e: Evento) {
    return this.calendarioUtils.getEventoTipo(e);
  }

  enviarMensagem(aluno: Evento_Participacao_Aluno) {
    if (!aluno.celular) {
      this.showError('Erro', 'Nenhum celular cadastrado', aluno);
      return;
    }
    let object = this.mensagemWhatsapp.enviarMensagem(
      aluno.aluno,
      aluno.celular
    );
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
      .filter((x) => x.presente === true && x.active === true)
      .forEach((aluno) => {
        let id = 33;
        let alunoChecklist = aluno.alunoChecklist.find(
          (x) => x.checklist_Item_Id == id
        ) as Aluno_CheckList_Item;
        let mensagem = '';

        if (alunoChecklist && !alunoChecklist.finalizado) {
          let professor = this.professores.find(
            (x) => x.id == this.evento.professor_Id
          ) as Professor;
          mensagem = `Aluno compareceu na aula 0 do dia ${moment(
            this.evento.data
          ).format('DD/MM/YY [às] HH[h]mm')} com o educador ${
            professor.nome
          }.\n Aula 0 finalizada por ${
            this.accountService.accountValue?.name
          } no dia ${moment(new Date()).format(
            'DD/MM/YY [aproximadamente às] HH[h]mm'
          )}`;
          lastValueFrom(
            this.checklistService.markAsDone(alunoChecklist.id, mensagem)
          );
        }
      });
  }

  /**
   * Builds the FinalizarAulaZeroRequest object for API submission
   */
  buildFinalizarAulaZeroRequest(): FinalizarAulaZeroRequest {
    const alunos: ParticipacaoAulaZeroModel[] = this.evento.alunos.map(
      (aluno) => {
        const participacao: ParticipacaoAulaZeroModel = {
          participacao_Id: aluno.id,
          presente: aluno.presente || false,
          aluno_Id: aluno.aluno_Id,
          turma_Id: aluno.presente ? aluno.turma_Id || -1 : -1,
          perfilCognitivo_Id: aluno.presente
            ? aluno.perfilCognitivo_Id || -1
            : -1,
          apostila_Kit_Id: aluno.presente ? aluno.apostila_Kit_Id || -1 : -1,
        };
        return participacao;
      }
    );

    const request: FinalizarAulaZeroRequest = {
      evento_Id: this.evento.id,
      observacao: this.evento.observacao,
      alunos: alunos,
    };

    return request;
  }

  /**
   * Submits the finalizar aula zero request to the API
   */
  finalizarAulaZero() {
    const request = this.buildFinalizarAulaZeroRequest();
    return this.eventoService.finalizarAulaZero(request);
  }
}
