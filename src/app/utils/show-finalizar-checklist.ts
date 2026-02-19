import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { FinalizarChecklistComponent, FinalizarChecklistComponentView } from "../shared/checklist/finalizar-checklist/finalizar-checklist.component";
import { showAgendarAulaZero } from "./show-agendar-superacao";
import { ChecklistItemId } from "../models/checklist-item-id.enum";
import { showAgendarSuperacao } from "./show-agendar-aula-zero";
import { lastValueFrom } from "rxjs";
import { showAgendarPrimeiraAula } from "./show-agendar-primeira-aula";
import { showAgendarOficina } from "./show-agendar-oficina";
import { Aluno } from "../models/alunos.model";
import { AlunoService } from "../services/alunos.service";
import { EventoService } from "../services/evento.service";
import { JornadaSuperaStatus } from "../models/jornada-supera-status.model";


export async function finalizarChecklistCondicional(item: FinalizarChecklistCondicional) {
    let ref: DynamicDialogRef | null = null;

    if (item.checklist_Item_Id == ChecklistItemId.AgendamentoAulaZero) {
        ref = showAgendarAulaZero(item.dialogService, item.aluno_Id);
    }
    else if (item.checklist_Item_Id == ChecklistItemId.Agendamento1Superacao || item.checklist_Item_Id == ChecklistItemId.Agendamento2Superacao) {
        ref = showAgendarSuperacao(item.dialogService, item.aluno_Id);
    }
    else if (item.checklist_Item_Id == ChecklistItemId.AgendamentoPrimeiraAula) {
        const aluno = await lastValueFrom(item.alunoService.get(item.aluno_Id)) as Aluno;
        item.alunoService.setAluno(aluno);

        ref = showAgendarPrimeiraAula(item.dialogService, aluno, undefined)
    }
    else if (item.checklist_Item_Id == ChecklistItemId.Agendamento1Oficina || item.checklist_Item_Id == ChecklistItemId.Agendamento2Oficina) {
        const aluno = await lastValueFrom(item.alunoService.get(item.aluno_Id)) as Aluno;
        item.alunoService.setAluno(aluno);

        ref = showAgendarOficina(item.dialogService, aluno)
    }
    else {

        const view: FinalizarChecklistComponentView = {
            alunoId: item.aluno_Id,
            alunoChecklistItemId: item.aluno_Checklist_Item_Id,
            checklistItemId: item.checklist_Item_Id,
            checklistId: item.checklist_Id,
            prazo: item.prazo,
            status: item.status,
            finalizado: item.finalizado,

            checklistItem: item.checklist_Item,
            aluno: item.aluno,
            turma: item.turma,
            corLegenda: item.corLegenda,
            celular: item.celular,
        }

        ref = showFinalizarChecklist(item.dialogService, view);

    }
    if (ref) {
        ref.onClose.subscribe(res => {
            item.finalizado = res;
            item.alunoService.setAluno(undefined);
            item.eventoService.setEvento(undefined);
        })
    }

}
export function showFinalizarChecklist(dialogService: DialogService, view: FinalizarChecklistComponentView) {
    return dialogService.open(FinalizarChecklistComponent, {
            showHeader: false,
            closable: true,
            maximizable: false,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '95vw',
            style: {maxWidth: '500px'},
            data: { view }
    });
}


export interface FinalizarChecklistCondicional {
    dialogService: DialogService;
    alunoService: AlunoService;
    eventoService: EventoService;
    aluno_Id: number;
    checklist_Id: number;
    checklist_Item: string;
    checklist_Item_Id: ChecklistItemId;
    aluno_Checklist_Item_Id: number;
    prazo: Date;
    finalizado: boolean;
    status: JornadaSuperaStatus;
    aluno: string,
    turma?: string,
    corLegenda?: string,
    celular?: string,
}