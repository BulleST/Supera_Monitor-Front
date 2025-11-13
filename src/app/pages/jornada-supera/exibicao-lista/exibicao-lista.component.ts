import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { Checklist } from '../../../models/checklist.model';
import { Aluno } from '../../../models/alunos.model';
import { CalendarioUtils, MensagemWhatsapp } from '../../../utils';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { JornadaSupera_List_Aluno, JornadaSupera_List_Checklist } from '../../../models/jornada-supera-list.model';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { ChecklistService } from '../../../services/checklist.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { JornadaSuperaStatus } from '../../../models/jornada-supera-status.model';
import { FilterMatchMode, SortEvent } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { showAluno } from '../../../utils/show-aluno';

@Component({
    selector: 'app-exibicao-lista',
    standalone: false,
    templateUrl: './exibicao-lista.component.html',
    styleUrl: './exibicao-lista.component.css',
    providers: [DialogService]
})
export class ExibicaoListaComponent implements OnChanges {
    checklists!: Checklist[];
    loadingChecklists = false;

    loading = false;
    list: JornadaSupera_List_Aluno[] = [];

    subscription: Subscription[] = [];
    exibicao: boolean = true;

    JornadaSuperaStatus = JornadaSuperaStatus
    FilterMatchMode = FilterMatchMode;
    status = [
        {
            label: 'Todos',
            value: null,
            styleClass: 'text-600'
        },
        {
            label: 'Finalizados Com Atraso',
            value: JornadaSuperaStatus.FinalizadoComAtraso,
            styleClass: 'text-yellow-500'
        },
        {
            label: 'Finalizados',
            value: JornadaSuperaStatus.Finalizado,
            styleClass: 'text-green-500'
        },
        {
            label: 'Atrasados',
            value: JornadaSuperaStatus.Atrasado,
            styleClass: 'text-red-500'
        },
        {
            label: 'Em Andamento',
            value: JornadaSuperaStatus.EmAndamento,
            styleClass: 'text-orange-500'
        },
        {
            label: 'À Realizar',
            value: JornadaSuperaStatus.ARealizar,
            styleClass: 'text-blue-500'
        },
    ]

    constructor(
        private service: JornadaSuperaService,
        private checklistService: ChecklistService,
        private toastr: ToastrService,
        private calendarioUtils: CalendarioUtils,
        private mensagemWhatsapp: MensagemWhatsapp,
        private dialogService: DialogService,

    ) {
        let loading = this.service.loadingList.subscribe(res => this.loading = res);
        this.subscription.push(loading);

        let list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);

        let checklists = this.checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklists);

        let exibicao = this.service.getExibicao().subscribe(res => this.exibicao = res);
        this.subscription.push(exibicao);

        if (!this.checklists.length) {
            this.getChecklists();
        }
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklists']) {
            this.checklists = changes['checklists'].currentValue;
        }
        if (changes['loadingChecklists']) {
            this.loadingChecklists = changes['loadingChecklists'].currentValue;
        }
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.toastr.error('Nenhum celular cadastrado');
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    getChecklists() {
        this.loadingChecklists = true;
        lastValueFrom(this.checklistService.getList())
            .then(res => this.loadingChecklists = false)
            .catch(res => this.loadingChecklists = false);
    }

    trackByChecklistId(index: number, item: JornadaSupera_List_Checklist) {
        return item.id;
    }


    filtrarChecklistStatus(status: JornadaSuperaStatus | null, checklist_Id: number, table: Table, filterCallback: any) {
        let alunosFiltered = this.list.filter(aluno => {
            let checklist = aluno.checklists.find(x => x.id == checklist_Id) as JornadaSupera_List_Checklist;

            if (!status) {
                return true
            }
            if (checklist.status === status) {
                return true;
            }

            return false;
        });

        table.filteredValue = alunosFiltered;
    }

    getTextColor(color: string) {
        return this.calendarioUtils.getTextColor(color)
    }

    calculaAlunosMesmaTurma(turma_Id: number) {
        let alunos = this.list.filter(x => x.turma_Id == turma_Id);
        let soma = alunos.length;

        if (soma == 0) {
            return 'Nenhum aluno'
        }
        else if (soma == 1) {
            return '1 aluno'
        } else {

            return soma + ' alunos';
        }
    }

    customSort(event: SortEvent) {
        event.data?.sort((x, y) => {
            let a = x.turma == y.turma ? 0 :
                x.turma == 'Indefinido' ? 1 :
                    y.turma == 'Indefinido' ? -1 :
                        x.turma < y.turma ? -1 :
                            x.turma > y.turma ? 1 : 0;
            return a;
        });
    }

    showAluno(aluno: JornadaSupera_List_Aluno) {
        showAluno(aluno.id, this.dialogService);
    }

}
