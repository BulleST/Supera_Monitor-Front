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
import { Dashboard, Dashboard_Mes, DashboardRequest } from '../../../models/dashboard.model';
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

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    alunos: Aluno[] = [];
    alunosList: Aluno[] = [];
    loadingAlunos = false;

    dashboard: Dashboard[] = [];
    loadingDashboard = false;
    mesesAno: Dashboard_Mes[] = [];
    meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    tableHeight = 0;
    @ViewChild('toolbar') toolbar!: ElementRef;

    @ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;

    request: DashboardRequest = new DashboardRequest;
    PseudoEvento = PseudoEvento;

    loadingRequests = new EventEmitter<number>();

    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private service: EventoService,
        private roteiroService: RoteiroService,
        private alunoService: AlunoService,
        private toastr: ToastrService,
        private calendarioUtils: CalendarioUtils,
        private crypto: Crypto,
    ) {


    }

    ngAfterViewInit(): void {
        this.update();
        this.tableHeight = window.innerHeight - (document.querySelector('.p-toolbar')?.clientHeight ?? 0) - 50 - 18 - 18
    }

    randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    onLoading() {
        this.loadingRoteiros = true;
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
        this.alunosList = [];
    }

    async update() {
        this.onLoading();

        setTimeout(() => {
            var container = document.querySelectorAll('.p-datatable-table-container')[0] as HTMLElement;
            var tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
            container.scrollLeft = tr.offsetLeft - tr.offsetWidth;
        }, 2000);

        await new Promise(resolve => {
            var req = 0;
            this.setRoteiros().then(res => {
                req++;
                if (req == 3) resolve(true);
            });
            this.setAlunos().then(res => {
                req++;
                if (req == 3) resolve(true);
            });
            this.setDashboard().then(res => {
                req++;
                if (req == 3) resolve(true);
            });
        })

        this.setView()
    }


    setRoteiros() {
        this.loadingRoteiros = true;
        return lastValueFrom(this.roteiroService.getList('dashboard setRoteiros'))
            .then(res => {
                this.roteiros = res.sort((x, y) => x.dataInicio.getTime() - y.dataInicio.getTime());
                const weeksInYear = moment().year(this.request.ano).weeksInYear();

                var array: any[] = Array.from({ length: weeksInYear }, () => -1);
                this.roteiros.forEach(roteiro => {
                    var week = this.calendarioUtils.weekOfYear(roteiro.dataInicio);
                    array[week] = roteiro
                })

                for (let index = 1; index < array.length; index++) {
                    const item = array[index];
                    if (item == -1) {
                        var lastRoteiro = array[index - 1];
                        var lastSemana = lastRoteiro!.semana;
                        var intervaloDe = moment(lastRoteiro?.dataInicio).add(1, 'week');
                        var intervaloAte = moment(intervaloDe).endOf('week');

                        let pseudo: Roteiro = {
                            id: -1,
                            tema: 'Tema Indefinido',
                            dataInicio: intervaloDe.toDate(),
                            dataFim: intervaloAte.toDate(),
                            semana: lastSemana + 1,
                        }
                        var week = this.calendarioUtils.weekOfYear(pseudo.dataInicio);// moment(pseudo.dataInicio).week();
                        array[week] = pseudo;
                    }
                }
                this.roteiros = array.filter(x => x != -1)
                    .sort((x, y) => x.dataInicio.getTime() - y.dataInicio.getTime());


                this.mesesAno = this.meses.map((mesString, index) => {
                    var mes = new Dashboard_Mes;
                    mes.mes = index;
                    mes.mesString = mesString;

                    mes.roteiros = this.roteiros.filter(x => x.dataInicio.getMonth() == index && x.dataInicio.getFullYear() == this.request.ano)
                    mes.roteiros.forEach(roteiro => { lastSemana = roteiro.semana });

                    return mes
                });
                this.loadingRoteiros = false;

            })
            .catch(res => this.loadingRoteiros = false);

    }


    setAlunos() {
        this.loadingAlunos = true;
        return lastValueFrom(this.alunoService.getList())
            .then(res => {
                res = res.sort((a, b) => {
                    // if (a.turma < b.turma) return -1;
                    // if (a.turma > b.turma) return 1;
                    if (a.nome < b.nome) return -1;
                    if (a.nome > b.nome) return 1;
                    return 0;
                });

                this.alunos = res;
                this.alunosList = res;

                if (this.request.turma_Id)
                    this.alunosList = this.alunosList.filter(x => x.turma_Id == this.request.turma_Id);

                if (this.request.professor_Id)
                    this.alunosList = this.alunosList.filter(x => x.professor_Id == this.request.professor_Id);

                if (this.request.aluno_Id)
                    this.alunosList = this.alunosList.filter(x => x.id == this.request.aluno_Id);

                this.loadingAlunos = false;
            })
            .catch(res => {
                this.loadingAlunos = false;
                return res;
            });

    }

    setDashboard() {
        this.loadingDashboard = true;
        let dashboard: Dashboard[] = [];

        // this.request.mes = 2;
        // await lastValueFrom(this.service.getDashboard(this.request)).then(res => dashboard.push(...res))

        var done: number[] = [];
        return new Promise<boolean>((resolve, reject) => {
            this.meses.forEach((mes: string, i: number) => {
                var request: DashboardRequest = {
                    aluno_Id: this.request.aluno_Id,
                    professor_Id: this.request.professor_Id,
                    turma_Id: this.request.turma_Id,
                    ano: this.request.ano,
                    mes: i + 1,
                }
                lastValueFrom(this.service.getDashboard(request))
                    .then(async res => {
                        done.push(i);
                        dashboard.push(...res);
                        if (done.length == 12) {
                            resolve(true);
                            this.dashboard = dashboard;
                            this.loadingDashboard = false;
                        }
                    })
                    .catch(res => {
                        this.toastr.error('Não foi possível carregar ' + mes);
                    });
            });
        })

    }


    setView() {
        console.log(this.loadingAlunos, this.loadingDashboard, this.loadingRoteiros)
        if (!this.loadingAlunos && !this.loadingDashboard && !this.loadingRoteiros) {
            this.alunosList = this.alunosList.map(aluno => {
                var aulas: Dashboard[] = this.dashboard.filter(x => x.aluno_Id == aluno.id)
                    .sort((x, y) => x.aula.data.getTime() - y.aula.data.getTime());
                aulas = aulas.map(aula => {
                    // aula.primeiraAula = this.primeiraAula(aula.participacao, aula.aula)
                    return aula;
                })
                aluno.aulas = aulas;
                return aluno;
            })
        }
    }
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.tableHeight = window.innerHeight - (document.querySelector('.p-toolbar')?.clientHeight ?? 0) - 50 - 18 - 18

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

}
