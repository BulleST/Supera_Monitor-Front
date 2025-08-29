export class EventoAgendarFaltaRequest {
    participacao_Id: number = 0;
    statusContato_Id?: number;
    observacao: string = '';
    contatoObservacao?: string;
    alunoContactado?: Date;
    reposicaoDe_Evento_Id?: number;
}