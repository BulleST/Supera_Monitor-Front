import { AfterViewInit, Component, HostListener, OnDestroy, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import moment from 'moment';
import { CalendarioRequest } from '../../../models/calendario.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Role } from '../../../models/account-perfil.model';
import { ScreenWidth } from '../../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { Roteiro } from '../../../models/roteiro.model';
import { RoteiroService } from '../../../services/roteiro.service';
import { AlunoService } from '../../../services/alunos.service';
import { AulaService } from '../../../services/aulas.service';
import { Aluno } from '../../../models/alunos.model';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Evento } from '../../../models/evento.model';
import { Popover } from 'primeng/popover';
import { EventoService } from '../../../services/evento.service';
import { CalendarioParticipacaoAluno, Evento_Mes, Evento_Roteiro } from '../../../models/evento-aula-aluno.model';
import { MyMap } from '../../../utils/map';
import { PseudoEvento } from '../../../models/reposicao.model';
import $ from 'jquery';


@Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    providers: [ConfirmationService],
})
export class DashboardComponent implements OnDestroy, AfterViewInit {
    jornadasDatas: { jornada: Roteiro, datas: Date[] }[] = [];
    request: CalendarioRequest = new CalendarioRequest;
    
    roteiros: Roteiro[] = [];
    // alunos: Aluno[] = [];
    alunos: any[] = [];
    aulas: CalendarioParticipacaoAluno[] = [];
    mesesAno: Evento_Mes[] = [];

    tableLoading = false;
    tableSelectedItem: any;
    tableMenu: MenuItem[] = [];
    Role: typeof Role = Role;
    screen: ScreenWidth = ScreenWidth.lg;
    subscription: Subscription[] = [];
    @ViewChild('dragScroll', { read: DragScrollComponent }) dragScroll!: DragScrollComponent;
    @ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;
    visible = signal(false);
    anos: number[] = Array.from({ length: 3 }, (a, i) => (new Date).getFullYear() - i)
    selectedAno: number = (new Date).getFullYear();

    constructor(
        private alunoService: AlunoService,
        private aulaService: AulaService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private service: EventoService,
        private roteiroService: RoteiroService,
    ) {
        
        /* 
        var mes = 0;
        var semana = 0;
        var aulasIndex = 0;
        this.mesesAno = [
            {
                mesId: mes++,
                mes: 'Janeiro',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Fevereiro',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Março',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Abril',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Maio',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Junho',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Julho',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Agosto',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Setembro',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Outubro',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Novembro',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
            {
                mesId: mes++,
                mes: 'Dezembro',
                roteiros: [
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                    { tema: 'Tema', semana: ++semana },
                ]
            },
        ]
        this.request.intervaloDe = moment().startOf('year').toDate();
        this.request.intervaloAte = moment().endOf('week').toDate();

        */

        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros);

        // var alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true));
        // this.subscription.push(alunos);
        this.update();


    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }
    ngAfterViewInit(): void {
    }

    @HostListener('keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
    }

    randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    async update() {
        this.tableLoading = true;
        this.visible.update(() => false)
        var ano = this.selectedAno;


        // if (this.alunos.length == 0) {
        //     lastValueFrom(this.alunoService.getList())
        //     .then(res => {
        //         this.alunos = res;
        //         this.setTableView();
        //     })
        // }
        
        await lastValueFrom(this.roteiroService.getList())
        .then(res => {
            this.roteiros = res;
        })
        
        await lastValueFrom(this.service.getAlunoAulas(ano))
        .then(async res => {
            this.aulas = res;
        })
        
        this.setTableView();
        
        /*
        // if (!this.jornadas.length) {
        //     try { await lastValueFrom(this.jornadaService.getList()) }
        //     catch (e) { }
        // }

        // var hoje = new Date;
        // var roteiroIndex = this.jornadas.findIndex(x => moment(hoje).isBetween(x.dataInicio, x.dataFim))
        // console.log(roteiroIndex)

        // var aulasIndex = 0;
        // lastValueFrom(this.alunoService.getList())
        //     .then(res => {
        //         this.alunos = res.map(aluno => {
        //             aluno.mesesAula = this.mesesAno.map(mes => {
        //                 mes.roteiros = mes.roteiros.map((roteiro: any) => {
        //                     roteiro.aula = {
        //                         aula_Id: aulasIndex++,
        //                         data: this.randomDate(new Date(2025, 0, 1), new Date(2025, 11, 30)),
        //                         descricao: 'Turma XPTO',
        //                         presente: Math.random() < 0.5,
        //                         turma: 'Turma X',
        //                         professor: 'Professor X',
        //                         apostila_Abaco: 'Abaco II',
        //                         numeroPaginaAbaco: 1,
        //                         apostila_AH: 'AH III',
        //                         numeroPaginaAH: 1,
        //                         reposicaoDe_Evento_Id: undefined,
        //                         reposicaoDe_Evento: undefined,

        //                     }
        //                     roteiro.aula.observacao = roteiro.aula.presente ? '' : 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus tenetur in minus accusantium sunt aut neque a reiciendis atque ipsa, aperiam repellat, saepe culpa. Porro animi non distinctio aperiam aliquam.'
        //                     return roteiro;
        //                 })
        //                 return mes
        //             })
        //             return aluno;
        //         })
        //         this.tableLoading = false;
        //     })
        //     .catch(res => {
        //         this.tableLoading = false;
        //     })

        */
    }

    setTableView(){

        if(this.roteiros.length > 0 && this.aulas.length > 0) {
            var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            var semanaCount = 0;
            this.mesesAno = meses.map((mesString, index) => {
                var mes = new Evento_Mes;
                mes.mes = index;
                mes.mesString = mesString;
                mes.roteiros = this.roteiros.filter(x => x.dataInicio.getMonth() == index && x.dataInicio.getFullYear() == this.selectedAno)
                                .map(roteiro => {
                                    var eventoRoteiro = MyMap(roteiro, new Evento_Roteiro);
                                    eventoRoteiro.aulas = [];
                                    semanaCount = roteiro.semana;
                                    return eventoRoteiro;
                                })
                                .sort((x,y) => x.dataInicio - y.dataInicio);
    
                                
                var lastRoteiro: Evento_Roteiro;
                var lastSemana: number;
                var lastIntervalo: Date[] = [];
    
                if (mes.roteiros.length > 0) {
                    lastRoteiro =  mes.roteiros[ mes.roteiros.length-1];
                    lastSemana = lastRoteiro.semana;
                    lastIntervalo = [lastRoteiro.dataInicio, lastRoteiro.dataFim];
    
                } else {
                    var inicio = moment(new Date).month(index).startOf('month')
                    var fim = inicio.add(7, 'days');
                    lastIntervalo = [inicio.toDate(), fim.toDate()];
                    lastSemana = semanaCount;
                }
                if(mes.roteiros.length < 4 ) {
                    var diff = 4 - mes.roteiros.length;
                    for (let i = 1; i <= diff; i++) {
    
                        lastIntervalo[0] = moment(lastIntervalo[0]).add(7, 'days').toDate();
                        lastIntervalo[1] = moment(lastIntervalo[1]).add(7, 'days').toDate();
                        mes.roteiros.push({
                            id: PseudoEvento.EventoId,
                            account_Created_Id: -1,
                            account_Created: '',
                            corLegenda: 'black',
                            semana: ++lastSemana,
                            tema: 'Tema indefinido',
                            created: undefined as unknown as Date,
                            lastUpdated: undefined,
                            deactivated: undefined,
                            dataInicio: lastIntervalo[0],
                            dataFim: lastIntervalo[1],
                            aulas: []
                        })
                    }
    
                }
    
                return mes
            });


            var alunosIds = [...new Set(this.aulas.map(x => x.aluno_Id))];
        //     alunosIds.forEach(aluno_Id => {

        //         var mesesAno = JSON.parse(JSON.stringify(this.mesesAno)) as Evento_Mes[];
        //         var aulaAlunos = this.aulas.filter(x => x.aluno_Id == aluno_Id);
        //         var aluno = aulaAlunos[0];
        //         var obj = {
        //             aluno_Id: aluno.aluno_Id,
        //             aluno: aluno.aluno,
        //             checklist: aluno.checklist,
        //             checklist_Id: aluno.checklist_Id,
        //             mesesAula: mesesAno.map(mes => {
        //                 mes.roteiros.map(roteiro => {
        //                     roteiro.aulas = aulaAlunos.filter(x => x.roteiro_Id == roteiro.id)
        //                     return roteiro;
        //                 })
        //                 return mes
        //             })
        //         }

        //         if (this.visible() == false) {
        //             this.visible.update(() => true)
        //         }
        //         this.alunos.push(obj)


        //         console.groupEnd();
        // })


            // this.alunos = alunosIds.map(aluno_Id => {
            //     var aulaAlunos = this.aulas.filter(x => x.aluno_Id == aluno_Id);
            //     var aluno = aulaAlunos[0];
            //     var mesesAno = JSON.parse(JSON.stringify(this.mesesAno)) as Evento_Mes[];
            //     var obj = {
            //         ...aluno,
            //         mesesAula: mesesAno.map(mes => {
            //             mes.roteiros.map(roteiro => {
            //                 roteiro.aulas = aulaAlunos.filter(x => x.roteiro_Id == roteiro.id)
            //                 return roteiro;
            //             })
            //             return mes
            //         })
            //     }
            //     return obj;
            // })

            // console.log(this.alunos);
            this.visible.update(() => true)


         
    
            this.alunos = alunosIds.map(id => {
                var a = this.aulas.find(x => x.aluno_Id == id) as CalendarioParticipacaoAluno;
                var aluno = MyMap(a, new Aluno) as Aluno;
                aluno.id = a.aluno_Id;
                aluno.nome = a.aluno,
                aluno.checklist = a.checklist;
                aluno.checklist_Id = a.checklist_Id;
                aluno.celular = a.celular ?? '';
                aluno.mesesAula = JSON.parse(JSON.stringify(this.mesesAno)) as Evento_Mes[];
                aluno.mesesAula = aluno.mesesAula.map(mes => {
                    mes.roteiros = mes.roteiros.map(roteiro => {
                        roteiro.aulas = this.aulas.filter(x => x.roteiro_Id == roteiro.id && x.aluno_Id == aluno.id) ;
                        return roteiro;
                    })
                    return mes;
                })
    
                return aluno
            })

            setTimeout(() => {
                var container = $('.drag-scroll-content');
                var tr = $(`th[data-mes="${(new Date().getMonth())}"]`)
                console.log('left', (tr.offset()?.left ?? 0) - (tr.width() ?? 0))
                $(container).animate({
                    scrollLeft: (tr.offset()?.left ?? 0) - (tr.width() ?? 0)
                }, 300)
            }, 500);
        }


        // this.dragScroll.moveTo((new Date).getMonth())

    }

    contextMenuSelectionChange(item: any) {
        this.tableMenu = [
        ];
    }

    scrollDragStart(e: DragScrollComponent) {
        this.dragScroll._contentRef.nativeElement.style.cursor = 'grab'
        this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'auto';
        this.popoverSelectedAlunoAula.forEach(item => item.hide())

    }

    scrollDragEnd(e: DragScrollComponent) {
        this.dragScroll._contentRef.nativeElement.style.cursor = 'pointer'
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

}
