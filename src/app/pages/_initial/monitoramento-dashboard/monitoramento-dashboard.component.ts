import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { Aluno } from '../../../models/alunos.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Evento } from '../../../models/evento.model';
import { Popover } from 'primeng/popover';
import { EventoService } from '../../../services/evento.service';
import { Dashboard_Response, Dashboard_Mes, DashboardRequest, Dashboard_Aluno } from '../../../models/dashboard.model';
import { PseudoEvento } from '../../../models/reposicao.model';
import moment from 'moment';
import 'moment/locale/pt-br';
import { AlunoService } from '../../../services/alunos.service';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { CalendarioUtils, Crypto } from '../../../utils';

@Component({
    selector: 'app-monitoramento-dashboard',
    standalone: false,
    templateUrl: './monitoramento-dashboard.component.html',
    styleUrl: './monitoramento-dashboard.component.css',
    providers: [ConfirmationService],
})
export class MonitoramentoDashboardComponent implements AfterViewInit {
    alunos: Dashboard_Aluno[] = [];
    loading = false;
    mesesAno: Dashboard_Mes[] = [];
    meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    @ViewChild('toolbar') toolbar!: ElementRef;

    @ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;
    @ViewChildren('popoverRoteiro') popoverRoteiro!: QueryList<Popover>;

    request: DashboardRequest = new DashboardRequest;
    PseudoEvento = PseudoEvento;

    loadingRequests = new EventEmitter<number>();
    hoje = new Date;

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private service: EventoService,
        private crypto: Crypto,
    ) {


    }

    ngAfterViewInit(): void {
    }

    randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    onLoading() {
        this.loading = true;
        var index = -1;
        this.mesesAno = Array.from({ length: 12 }, (v, i) => {
            index++;
            return {
                mes: i,
                mesString: moment().month(i).format('MMMM'),
                roteiros: Array.from({ length: 4 }, (vv, ii) => {
                    return {
                        id: -1,
                        semana: ii + 1,
                        tema: 'Carregando...',
                        dataInicio: moment().set({
                            month: i,
                            year: this.request.ano,
                            day: 1,
                            week: index
                        }).toDate(),
                        dataFim: moment().set({
                            month: i,
                            year: this.request.ano,
                            day: 6,
                            week: index
                        }).toDate(),
                    } as Roteiro;
                })
            } as Dashboard_Mes;
        })
        this.alunos = [];
    }

    update() {
        this.onLoading();

        setTimeout(() => {
            var container = document.querySelectorAll('.p-datatable-table-container')[0] as HTMLElement;
            var tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
            container.scrollLeft = tr.offsetLeft - tr.offsetWidth;
        }, 2000);

        this.setDashboard();
    }

    setDashboard() {
        this.loading = true;
        lastValueFrom(this.service.getDashboard(this.request))
            .then(res => {

                // Seta meses do ano
                this.mesesAno = this.meses.map((mesString, index) => {
                    var mes = new Dashboard_Mes;
                    mes.mes = index;
                    mes.mesString = mesString;
                    mes.roteiros = res.roteiros.filter(x => moment(x.dataInicio).month() == index);
                    return mes;
                });

                // Seta aulas dos alunos
                this.alunos = res.alunos;

                this.loading = false;
            })
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular);
    }

    enviarMensagemFalta(nome: string, celular: string, evento: Evento | any) {
        return this.mensagemWhatsapp.enviarMensagemFalta(nome, celular, evento);
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

    primeiraAula(aluno: Evento_Participacao_Aluno, evento: Evento) {
        return moment(aluno.primeiraAula).isSame(evento.data)
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
}
