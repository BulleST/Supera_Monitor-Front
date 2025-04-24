import { AfterViewInit, Component, HostListener, OnDestroy, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { Aluno } from '../../../models/alunos.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Evento } from '../../../models/evento.model';
import { Popover } from 'primeng/popover';
import { EventoService } from '../../../services/evento.service';
import { Dashboard, Dashboard_Mes } from '../../../models/dashboard.model';
import { PseudoEvento } from '../../../models/reposicao.model';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ProfessorService } from '../../../services/professor.service';
import { Professor } from '../../../models/professor.model';
import { AlunoService } from '../../../services/alunos.service';
import { ToastrService } from 'ngx-toastr';
import $ from 'jquery';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';

@Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    providers: [ConfirmationService],
})
export class DashboardComponent implements OnDestroy, AfterViewInit {
    
    roteiros: Roteiro[] = [];
    loadingRoteiros = false;
    
    alunos: Aluno[] = [];
    loadingAlunos = false;
    
    dashboard: Dashboard[] = [];
    loadingDashboard = false;
    mesesAno: Dashboard_Mes[] = [];
    meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    
    @ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;
    subscription: Subscription[] = [];
    anos: number[] = Array.from({ length: 3 }, (a, i) => (new Date).getFullYear() - i)
    ano: number = (new Date).getFullYear();
    expandedRowsKeys = {};

    professores: Professor[] = [];
    loadingProfessores = false;



    constructor(
        private mensagemWhatsapp: MensagemWhatsapp,
        private service: EventoService,
        private roteiroService: RoteiroService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private toastr: ToastrService,
    ) {
        var professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
             lastValueFrom(this.professorService.getList())
             .then(res => {
                this.professores = res;
                this.loadingProfessores = false;
            });
        }

        // var dashboard = this.service.dashboard.subscribe(res => this.dashboard = res);
        // this.subscription.push(dashboard);

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {
        this.update();

        setTimeout(() => {
            $('.p-virtualscroller').height('calc(100vh - 150px)')
        }, 500);
    }

    @HostListener('keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
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
                roteiros: Array.from({ length: 4 }, (vv,ii) => {
                    return {
                        id: -1,
                        semana: ii+1,
                        tema: 'Carregando...',
                        dataInicio: moment().set({
                            month: i,
                            year: this.ano,
                            day: 1,
                            week: index
                        }).toDate(),
                        dataFim: moment().set({
                            month: i,
                            year: this.ano,
                            day: 6,
                            week: index
                        }).toDate(),
                    } as Roteiro;
                })
            } as Dashboard_Mes;
        })
        this.alunos = [];
    }

    async update() {
        this.onLoading();

        this.setRoteiros();
        await this.setAlunos();
        this.setDashboard();
    }

    
    setRoteiros() {
        this.loadingRoteiros = true;
        lastValueFrom(this.roteiroService.getList('dashboard setRoteiros'))
        .then(res => {
            this.roteiros = res;

                                
            var lastRoteiro: Roteiro;
            var lastSemana: number = 0;
            var intervaloDe: Date;
            var intervaloAte: Date;

            this.mesesAno = this.meses.map((mesString, index) => {
                var mes = new Dashboard_Mes;
                mes.mes = index;
                mes.mesString = mesString;

                mes.roteiros = this.roteiros.filter(x => x.dataInicio.getMonth() == index && x.dataInicio.getFullYear() == this.ano)
                mes.roteiros.forEach(roteiro => { lastSemana = roteiro.semana });

                if (mes.roteiros.length > 0) {
                    lastRoteiro =  mes.roteiros[ mes.roteiros.length - 1];
                    lastSemana = lastRoteiro.semana;
                    intervaloDe = lastRoteiro.dataInicio;
                    intervaloAte = lastRoteiro.dataFim;
    
                } else {
                    intervaloDe = moment(new Date(this.ano, index, 1)).subtract(7, 'days').toDate();
                    intervaloAte = moment(intervaloDe).add(6, 'days').toDate();
                }

                if(mes.roteiros.length < 4 ) {
                    var diff = 4 - mes.roteiros.length;
                    for (let i = 1; i <= diff; i++) {
    
                        intervaloDe = moment(intervaloDe).add(1, 'week').toDate();
                        intervaloAte = moment(intervaloDe).add(6, 'days').toDate();

                        if (intervaloAte.getMonth() != mes.mes) {
                            intervaloAte = moment(intervaloDe).endOf('month').toDate();
                        }

                        var pseudoRoteiro: Roteiro = {
                            id: PseudoEvento.EventoId,
                            semana: ++lastSemana,
                            tema: 'Tema indefinido',
                            dataInicio: intervaloDe,
                            dataFim: intervaloAte,
                        }
                        mes.roteiros.push(pseudoRoteiro)
                    }
    
                }
    
                return mes
            });
            
            this.loadingRoteiros = false;

            
            setTimeout(() => {
                var container = document.querySelectorAll('.p-virtualscroller')[0] as HTMLElement;
                var tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
                container.scrollLeft = tr.offsetLeft - tr.offsetWidth;
            }, 2000);


        })
        .catch(res => this.loadingRoteiros = false);

    }


    async setAlunos() {
        this.loadingAlunos = true;
        await lastValueFrom(this.alunoService.getList())
        .then(res => {
            this.alunos = res.filter(x => x.active).sort((x,y) => x.nome < y.nome ? -1 : x.nome > y.nome ? 1 : 0);
            this.loadingAlunos = false;
        })
        .catch(res => this.loadingAlunos = false);
    }


    async setDashboard() {
        this.loadingDashboard = true;
        this.dashboard = [];
        var done: number[] = [];
        // await lastValueFrom(this.service.getDashboard(this.ano, 1)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 2)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 3)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 4)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 5)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 6)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 7)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 8)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 9)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 10)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 11)).then(res => this.dashboard.push(...res))
        // await lastValueFrom(this.service.getDashboard(this.ano, 12)).then(res => this.dashboard.push(...res))
        await new Promise<boolean>((resolve, reject) => {
            this.meses.forEach((mes: string, i: number) => {
                lastValueFrom(this.service.getDashboard(this.ano, i+1))
                .then(async res => {
                    done.push(i);
                    this.dashboard.push(...res);
                    if (done.length == 12) {
                            resolve(true);
                    }
                })
                .catch(res => {
                    this.toastr.error('Não foi possível carregar ' + mes);
                });
                
            });
        })

        this.alunos = this.alunos.map(aluno => {
            var aulas: Dashboard[] = this.dashboard.filter(x => x.aluno_Id == aluno.id).sort((x,y) => x.aula.data.getTime() - y.aula.data.getTime());
            aulas = aulas.map(aula => {
                aula.primeiraAula = this.primeiraAula(aula.participacao, aula.aula)
                return aula;
            })
            aluno.aulas = aulas;
            return aluno;
        })

        this.expandedRowsKeys = this.alunos.reduce((acc: any, p :any) => (acc[p.turma_Id] = true) && acc, {});
        this.loadingDashboard = false;
    }
    
    enviarMensagem(nome:string, celular:string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular);
    }

    enviarMensagemFalta(nome:string, celular:string, evento: Evento | any) {
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


    getCorLegenda(professor_Id: number) {
        var professor = this.professores.find(x => x.id == professor_Id);
        if (professor)
            return professor.corLegenda;
        return ''
    }

    calculateCustomerTotal(turma: string) {
        let total = 0;

        if (this.alunos) {
            for (let customer of this.alunos) {
                if (customer.turma === turma) {
                    total++;
                }
            }
        }

        return total;
    }

    primeiraAula(aluno: Evento_Participacao_Aluno, evento: Evento) {
        return moment(aluno.primeiraAula).isSame(evento.data)
    }
}
