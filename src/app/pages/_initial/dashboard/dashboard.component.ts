import { AfterViewInit, Component, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { Evento_Mes } from '../../../models/evento-aula-aluno.model';

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

    jornadas: Roteiro[] = [];

    alunos: Aluno[] = [];
    aulas: Evento_Mes[] = [];

    list: any[] = [];
    tableLoading = false;
    tableSelectedItem: any;
    tableMenu: MenuItem[] = [];
    Role: typeof Role = Role;
    screen: ScreenWidth = ScreenWidth.lg;
    subscription: Subscription[] = [];
    mesesAno: any[] = [];
    @ViewChild('dragScroll', { read: DragScrollComponent }) dragScroll!: DragScrollComponent;
    @ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;

    anos: number[] = Array.from({ length: 3 }, (a, i) => (new Date).getFullYear() - i)
    selectedAno: number = (new Date).getFullYear();

    constructor(
        private jornadaService: RoteiroService,
        private alunoService: AlunoService,
        private aulaService: AulaService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private service: EventoService
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



        var jornadas = this.jornadaService.list.subscribe(res => this.jornadas = res);
        this.subscription.push(jornadas);

        var alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true));
        this.subscription.push(alunos);
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
        var ano = this.selectedAno;


        lastValueFrom(this.alunoService.getList())
        .then(res => {
            this.alunos = res;
            this.setTableView();
        })
        lastValueFrom(this.service.getAlunoAulas(ano))
        .then(async res => {
            var meses = ['Nenhum', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            this.aulas = res.map(x => {
                x.mesString = meses[x.mes];
                return x;
            });

            this.setTableView();
        })

        
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

        // Preenche os meses com as semanas incompletas
        if (this.aulas.length > 0) {
            var roteiros = this.aulas.flatMap(x => x.roteiros).sort((x,y) => x.semana - y.semana);
            var lastRoteiro = roteiros[roteiros.length-1];
            var lastSemana = lastRoteiro.semana;
            var lastIntervalo = [lastRoteiro.dataInicio, lastRoteiro.dataFim]
            this.aulas = this.aulas.map(aula => {
                if (aula.roteiros.length < 4) {
                    var diff = 4 - aula.roteiros.length;
                    for (let index = 1; index <= diff; index++) {
                        
                        lastIntervalo[0] = moment(lastIntervalo[0]).add(7, 'days').toDate();
                        lastIntervalo[1] = moment(lastIntervalo[1]).add(7, 'days').toDate();

                        aula.roteiros.push({
                            id: -1,
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
                return aula
            })
        }
        if (this.alunos.length > 0 && this.aulas.length > 0) {

            var meses = JSON.parse(JSON.stringify(this.aulas)) as  Evento_Mes[]
            this.alunos = this.alunos.map(aluno => { 
                console.groupCollapsed(aluno.id, aluno.nome)
                aluno.mesesAula = meses.map(mes => {
                    mes.roteiros = mes.roteiros.map(roteiro => {
                        console.log(mes.mesString, roteiro.id, roteiro.tema, roteiro.aulas)
                        // console.log(aluno.id, aluno.nome, roteiro.aulas.map(x => x.aluno_Id))
                        // roteiro.aulas = roteiro.aulas.filter(x => x.aluno_Id == aluno.id);
                        return roteiro;
                    })
                    return mes
                })
                console.groupEnd()
                return aluno
            })

            
        
        }
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

    enviarMensagem(aluno: Aluno) {
        this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    enviarMensagemFalta(aluno: Aluno, evento: Evento | any) {
        this.mensagemWhatsapp.enviarMensagemFalta(aluno.nome, aluno.celular, evento);
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
