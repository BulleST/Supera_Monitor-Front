import { DialogService } from "primeng/dynamicdialog";
import { AlunoDetalhesComponent } from "../shared/aluno/aluno-detalhes/aluno-detalhes.component";

export function showAluno(dialogService: DialogService, aluno_Id: number) {
    return dialogService.open(AlunoDetalhesComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '1100px',
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: {
            aluno_Id: aluno_Id
        }
    });
}