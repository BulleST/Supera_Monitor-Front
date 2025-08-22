export class EventoAgendarFaltaRequest {
    participacao_Id: number = 0;
    status_Id: number = undefined as unknown as number;
    observacao: string = '';
    observacaoContato: string = '';
    alunoContactado: boolean = false;
}