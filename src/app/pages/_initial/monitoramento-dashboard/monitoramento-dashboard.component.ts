import { Component, ElementRef, EventEmitter, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ConfirmationService, FilterMatchMode, SortEvent } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Popover } from 'primeng/popover';
import { EventoService } from '../../../services/evento.service';
import { Dashboard_Mes, DashboardRequest, Dashboard_Aluno, Dashboard_Item, Dashboard_Response, DashboardItemStatus, Dashboard_Roteiro } from '../../../models/dashboard.model';
import { PseudoEvento } from '../../../models/reposicao.model';
import { CalendarioUtils, Crypto } from '../../../utils';
import { AlunoPopoverComponent } from '../../../shared/aluno/aluno-popover/aluno-popover.component';
import { AulaParticipacaoPopoverComponent } from './aula-participacao-popover/aula-participacao-popover.component';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Table } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlunoAulaParticipacaoComponent } from './aluno-aula-participacao/aluno-aula-participacao.component';

@Component({
    selector: 'app-monitoramento-dashboard',
    standalone: false,
    templateUrl: './monitoramento-dashboard.component.html',
    styleUrl: './monitoramento-dashboard.component.css',
    providers: [ConfirmationService, DialogService],
})
export class MonitoramentoDashboardComponent implements OnDestroy {
    alunos: Dashboard_Aluno[] = [];
    loading = false;
    mesesAno: Dashboard_Mes[] = [];
    meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    
    @ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;
    @ViewChildren('popoverRoteiro') popoverRoteiro!: QueryList<Popover>;

    @ViewChild('alunoPopover') alunoPopover!: AlunoPopoverComponent ;
    @ViewChild('aulaParticipacaoPopoverComponent') aulaParticipacaoPopoverComponent!: AulaParticipacaoPopoverComponent;
    @ViewChild('toolbar') toolbar!: ElementRef;
    @ViewChild('dt') dt!: Table;
    
    request: DashboardRequest = new DashboardRequest;
    PseudoEvento = PseudoEvento;

    loadingRequests = new EventEmitter<number>();
    hoje = new Date;
    height = 'flex';
    subscription: Subscription[] = [];
    DashboardItemStatus = DashboardItemStatus;

    ref: DynamicDialogRef | undefined;

    filterStatus = [ 
        { label: 'Todos', value: null, styleClass: 'pi pi-bars' },
        { label: DashboardItemStatus.Cancelada, value: DashboardItemStatus.Cancelada, styleClass: 'surface-800' },
        { label: DashboardItemStatus.Feriado, value: DashboardItemStatus.Feriado, styleClass: 'bg-red-600' },
        { label: DashboardItemStatus.ReposicaoAgendada, value: DashboardItemStatus.ReposicaoAgendada, styleClass: 'bg-purple-500' },
        { label: DashboardItemStatus.FaltaNaReposicao, value: DashboardItemStatus.FaltaNaReposicao, styleClass: 'bg-blue-600' },
        { label: DashboardItemStatus.FaltaNaAula, value: DashboardItemStatus.FaltaNaAula, styleClass: 'bg-red-500' },
        { label: DashboardItemStatus.FaltaAgendada, value: DashboardItemStatus.FaltaAgendada, styleClass: 'bg-red-500' },
        { label: DashboardItemStatus.PresenteNaReposicao, value: DashboardItemStatus.PresenteNaReposicao, styleClass: 'bg-green-300' },
        { label: DashboardItemStatus.PresenteNaAula, value: DashboardItemStatus.PresenteNaAula, styleClass: 'bg-green-500' },
        { label: DashboardItemStatus.Aula, value: DashboardItemStatus.Aula, styleClass: 'surface-200' },
    ]

    FilterMatchMode = FilterMatchMode;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private service: EventoService,
        private crypto: Crypto,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private calendarioUtils: CalendarioUtils,
    ) {
        let calendarioReload = this.service.calendarioReload.subscribe(res => {
            this.update();
        });
        this.subscription.push(calendarioReload);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    getTextColor(color: string) {
        return this.calendarioUtils.getTextColor(color)
    }

    calculaAlunosMesmaTurma(turma_Id: number) {
        let alunos = this.alunos.filter(x => x.turma_Id == turma_Id);
        let soma = alunos.length;

        if (soma == 0 ) {
            return 'Nenhum aluno'
        } 
        else if (soma == 1) {
            return '1 aluno'
        } else {

            return soma + ' alunos';
        }
    }

 onLoading() {
        this.loading = true;
        this.mesesAno = Array.from({ length: 12 }, (v, i) => {
            return {
                mes: i,
                mesString: moment().month(i).format('MMMM'),
                roteiros: Array.from({ length: 4 }, (vv, ii) => {
                    let dia = new Date(this.request.ano, i, 1);
                    let inicio = moment(dia).add(ii, 'week').startOf('week')
                    let fim = moment(dia).add(ii, 'week').endOf('week')
                    return {
                        id: -1,
                        semana: moment(inicio).week(),
                        tema: 'Carregando...',
                        dataInicio: inicio.toDate(),
                        dataFim: fim.toDate(),
                    } as Dashboard_Roteiro;
                })
            } as Dashboard_Mes;
        })
        this.alunos = [];
    }

    update() {
        this.onLoading();
        setTimeout(() => {
            let container = document.querySelectorAll('.p-datatable-table-container')[0] as HTMLElement;
            let tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
            container.scrollLeft = tr.offsetLeft - tr.offsetWidth;
        }, 2000);

        this.setDashboard();
    }

    setDashboard() {
        this.loading = true;
        lastValueFrom(this.service.getDashboard(this.request))
            .then((res: Dashboard_Response) => {
                // Seta meses do ano
                this.mesesAno = this.meses.map((mesString, index) => {
                    let mes = new Dashboard_Mes;
                    mes.mes = index;
                    mes.mesString = mesString;

                    mes.roteiros = res.roteiros.filter(roteiro => {
                        let ehDoMes = moment(roteiro.dataInicio).month() == index;
                        let inicioEhDezembro = moment(roteiro.dataInicio).month() == 11;
                        let fimEhJaneiro = moment(roteiro.dataFim).month() == 0;
                        let ehAnoAnterior = moment(roteiro.dataInicio).year() == this.request.ano - 1
                        let ehAnoPosterior = moment(roteiro.dataFim).year() == this.request.ano + 1

                        let ehInicioDoAno = inicioEhDezembro && fimEhJaneiro && ehAnoAnterior;
                        let ehFimDoAno = inicioEhDezembro && fimEhJaneiro && ehAnoPosterior;

                        return (ehDoMes && !ehInicioDoAno && !ehFimDoAno)
                            || (!ehDoMes && ehInicioDoAno && !ehFimDoAno && index == 0)
                            || (ehDoMes && !ehInicioDoAno && ehFimDoAno && index == 11)
                    });

                    mes.roteiros.sort((x,y) => x.dataInicio.getTime() - y.dataInicio.getTime())
                    return mes;
                });

                this.alunos = res.alunos.sort((x,y) => {
                    let a = x.turma == y.turma ? 0 :
                            x.turma == 'Indefinido' ? 1 :
                            y.turma == 'Indefinido' ? -1 :
                            x.turma < y.turma ? -1 :
                            x.turma > y.turma ? 1 : 0;
                    return a;
                });

                this.loading = false;
            })
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

    enviarMensagem(aluno: Dashboard_Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    selectAlunoAula(e: any, popoverSelectedAlunoAula: Popover) {
        this.popoverSelectedAlunoAula
            .filter(x => x.el.nativeElement.id != popoverSelectedAlunoAula.el.nativeElement.id)
            .forEach(item => item.hide());

        popoverSelectedAlunoAula.show(e);
    }

    unselectAlunoAula(popoverSelectedAlunoAula: Popover) {
        popoverSelectedAlunoAula.hide();
    }

    goToAluno(aluno: Aluno) {
        return ['alunos', this.crypto.encrypt(aluno.id)]
    }

    closePopoverRoteiro() {
        this.popoverRoteiro.forEach((item: Popover) => {
            item.hide();
        })
    }

    ehAniversario(data: Date, dataNascimento?: Date) {
        if (!dataNascimento) {
            return false;
        } else {
            return moment(data).week() == moment(dataNascimento).week();
        }
    }

    getIdade(data: Date, dataNascimento: Date) {
        return moment(data).diff(dataNascimento, 'years');
    }

    applyFilter(request: DashboardRequest) {
        this.request = request;
        this.update();
    }

    showAluno(aluno_Id: number, event: any) {
        this.alunoPopover.aluno_Id = aluno_Id;
        this.alunoPopover.show(event)
    }
    
    // showAula(aluno: Dashboard_Aluno, item: Dashboard_Item, event: any) {
    //     this.aulaParticipacaoPopoverComponent.aluno = aluno;
    //     this.aulaParticipacaoPopoverComponent.item = item;
    //     this.aulaParticipacaoPopoverComponent.show(event);
    // }

    showAula(aluno: Dashboard_Aluno, item: Dashboard_Item, event: any) {
        this.aulaParticipacaoPopoverComponent.aluno = aluno;
        this.aulaParticipacaoPopoverComponent.item = item;
        this.aulaParticipacaoPopoverComponent.show(event);
        this.ref = this.dialogService.open(AlunoAulaParticipacaoComponent, { 
            header: 'Aula',
            showHeader: false,
            closable: true,
            maximizable: false,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '95vw',
            height: '95vh',
            style: {
                maxWidth: '600px',
                maxHeigth: '600px'
            },
            data: {
                aluno,
                item,
            }
        });
    }

    filtrarStatus(value: DashboardItemStatus | null, roteiro: Dashboard_Roteiro, table: Table) {
        let alunosFiltered = this.alunos.filter(aluno => {
            let item = aluno.aulas.find(x => x.roteiro.id == roteiro.id 
                                        && moment(x.roteiro.dataInicio).isSame(roteiro.dataInicio, 'date')
                                        && moment(x.roteiro.dataFim).isSame(roteiro.dataFim, 'date')
                                        && x.roteiro.semana == roteiro.semana)  

            if (!value) {
                return true;
            }

            if (!item) {
                return false;
            }

            if (item.status === value && item.show) {
                return true;
            }

            return false;
        });

        table.filteredValue = alunosFiltered;
    }

    
	getStatus(item: Dashboard_Item) {
        let participacao = item.participacao;
		let statusList = this.service.statusContato.value;
        let statusContato_Id = participacao.statusContato_Id
		return statusList.find(x => x.value == statusContato_Id)?.label ?? 'Aluno não contatado';
	}
        async goToContatoFalta(item: Dashboard_Item) {
            let evento = await lastValueFrom(this.service.get(item.aula.id))
            
            this.service.setEvento(evento);
            let eventoIdEncrypted = this.crypto.encrypt(item.aula.id);
            let alunoIdEncrypted = this.crypto.encrypt(item.participacao.aluno_Id);
            this.router.navigate(['contato', eventoIdEncrypted, alunoIdEncrypted], { relativeTo: this.activatedRoute });
        }
}
