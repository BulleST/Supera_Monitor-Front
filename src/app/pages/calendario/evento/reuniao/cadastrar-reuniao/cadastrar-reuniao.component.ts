import { Component, OnDestroy} from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoReuniaoRequest } from '../../../../../models/evento-reuniao.model';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { EventoService } from '../../../../../services/evento.service';
import { NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { Evento } from '../../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { MensagemWhatsapp, validaProfessores, validaSalaAulas, CalendarioUtils, getError, showError } from '../../../../../utils';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Roteiro } from '../../../../../models/roteiro.model';
import { RoteiroService } from '../../../../../services/roteiro.service';

@Component({
    selector: 'app-cadastrar-reuniao',
    standalone: false,
    templateUrl: './cadastrar-reuniao.component.html',
    styleUrl: './cadastrar-reuniao.component.css',
    providers: [ConfirmationService]
})
export class CadastrarReuniaoComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoReuniaoRequest = new EventoReuniaoRequest;

    data: Date = new Date;
    horario: Date = undefined as unknown as Date;
    minData = new Date();
    
    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    eventos: Evento[] = [];
    loadingEventos = false;
    
        roteiros: Roteiro[] = [];
        loadingRoteiros = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano: number = new Date().getFullYear();

    invalidDates: Date[] = [];

    selectedSource?: Professor;
    selectedTarget?: Professor;

    target: Professor[] = [];
    source: Professor[] = [];
    loadingProfessores = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
                private roteiroService: RoteiroService,
        private service: EventoService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private toastrService: ToastrService,
        private calendarioUtils: CalendarioUtils,
    ) {
        this.object.descricao = 'Reunião';
let feriados = this.service.feriados.subscribe(res => {
            this.feriados = res;
            this.setInvalidDates();
        });
        this.subscription.push(feriados);

        if (this.feriados.length == 0) {
            this.loadFeriados();
        }
        
        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res.filter(x => x.active);
            this.setInvalidDates();
        });
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadRoteiros();
        }


        let professores = this.professorService.list.subscribe(res => this.target = res.filter(x => x.active));
        this.subscription.push(professores);

        if (this.target.length == 0) {
            this.loadProfessores();
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res.filter(x => x.active));
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadSalas();
        }

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active));
        this.subscription.push(eventos);
        
        this.loadFeriados();
        this.verificaDisponibilidade();
        this.visible = true;

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
    }
    loadProfessores() {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
    }

    loadRoteiros() {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList())
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
    }

    loadSalas() {
            this.loadingSalaAulas = true;
            lastValueFrom(this.salaAulaService.getList())
                .then(res => this.loadingSalaAulas = false)
                .catch(res => this.loadingSalaAulas = false);
    }

    loadFeriados() {
        this.loadingFeriados = true;
        lastValueFrom(this.service.getFeriados(this.ano))
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false);
    }


    setInvalidDates() {
        if (this.roteiros.length && this.feriados.length) {
            let recessos = this.roteiros.filter(x => x.recesso === true);
            let recessosDate = recessos.flatMap(x => {
                let length = moment(x.dataFim).diff(x.dataInicio, 'day')
                let range = Array.from({ length }, (item, index) => {
                    return moment(x.dataInicio, 'YYYY-MM-DD').add(index, 'day').toDate()
                });
                range.push(moment(x.dataFim, 'YYYY-MM-DD').toDate())
                return range;
            });
            
              let feriadosDate = this.feriados.map(x => moment(x.date).toDate());

            this.invalidDates = [... new Set(recessosDate.concat(feriadosDate))];
        }
    }
    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    dataChanged() {
        if (this.data.getDay() == 1) {
            this.object.descricao = 'Reunião Geral';
            this.horario.setHours(12, 0, 0);
        }
        if (this.data.getDay() == 2) {
            this.object.descricao = 'Reunião Monitoramento';
            this.horario.setHours(12, 0, 0);
        }
        if (this.data.getDay() == 5) {
            this.object.descricao = 'Reunião Pedagógica';
            this.horario.setHours(12, 0, 0);
        }

         this.verificaDisponibilidade();
    }

    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados()
        }
    }

    async verificaDisponibilidade() {
        let valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }


        this.loadingEventos = true;
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes())

        let request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.getList(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();

        return valid

    }

    validaSalaAulas() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        this.loadingProfessores = true;
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.source = validaProfessores(data, this.object.duracaoMinutos, this.source, this.eventos, undefined, undefined);
        this.target = validaProfessores(data, this.object.duracaoMinutos, this.target, this.eventos, undefined, undefined);
        this.loadingProfessores = false;
    }


    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaSalaAulas();

        let item = this.salaAulas.find(x => x.id == e.value);
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });

            let tipo = this.getTipo(item.disponivelEvent);
            let data = moment(item.disponivelEvent.data).format('HH[h]mm');

            this.showError('Sala Indisponível', 
                `Essa sala está atribuída a outra ${tipo} no mesmo dia às <b>${data}</b>.`, 
                e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    moveToSource(e: any) {
        if (this.selectedTarget) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza?`,
                header: 'Remover educador',
                acceptLabel: `Sim`,
                rejectLabel: 'Não',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {

                    let index = this.object.professores.findIndex(x => x == this.selectedTarget!.id);
                    this.object.professores.splice(index, 1);

                    index = this.target.findIndex(x => x.id == this.selectedTarget!.id);
                    this.target.splice(index, 1);

                    this.source.push(this.selectedTarget as Professor);

                    this.sortList();
                    this.removeSelection();
                },
                reject: () => this.removeSelection(),
            });

        }
    }

    moveToTarget(e: any) {
        if (!this.selectedSource) {
            this.showError('Selecionar educador', 'Selecione um educador para mover.', e.event);
        }
        else if (this.selectedSource.disponivel === false) {
            this.showError('Educador indisponível', 'Você não pode mover um educador indisponível.', e.event);
        }
        else if (!this.data) {
            this.showError('Selecione uma data', 'Selecione uma data para carregar sugestões de reposição do educador.', e.event);
        }
        else if (!this.horario) {
            this.showError('Selecione um horário', 'Selecione um horário para carregar sugestões de reposição do educador.', e.event);
        }
        else {
            let event: any = {
                event: e,
                item: { data: this.selectedSource },
                previousContainer: { data: this.source },
                container: { data: this.target },
                previousIndex: 0,
                currentIndex: 0,
            }

            this.object.professores.push(this.selectedSource.id);
            this.transferToTarget(event);
        }


    }

    sourceDropped(e: CdkDragDrop<Professor[]>) {

        if (e.previousContainer != e.container) {
            let item = e.item.data;
            this.selectedTarget = item;

            this.confirmationService.confirm({
                target: e.event.target as any,
                message: `Tem certeza?`,
                header: 'Remover professor',
                acceptLabel: `Sim`,
                rejectLabel: 'Não',
                acceptIcon: `pi pi-check`,
                rejectIcon: 'pi pi-times',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {

                    let index = this.object.professores.findIndex(x => x == item.id);
                    this.object.professores.splice(index, 1);

                    index = this.target.findIndex(x => x.id == item.id);
                    this.target.splice(index, 1);

                    this.source.push(item);

                    this.sortList();
                    this.removeSelection();

                },
                reject: () => this.removeSelection(),
            });

        }
    }

     targetDropped(e: CdkDragDrop<Professor[]>) {
        if (e.previousContainer != e.container) {

            let professor = e.item.data as Professor;
            this.selectedSource = professor;

            if (professor.disponivel === false) {
                this.showError('Educador indisponível', 'Você não pode mover um educador indisponível.', e.event);
                this.removeSelection();
            }
            else if (!this.data) {
                this.showError('Selecione uma data', 'Selecione uma data para carregar sugestões de reposição do educador.', e.event);
                this.removeSelection();
            }
            else if (!this.horario) {
                this.showError('Selecione um horário', 'Selecione um horário para carregar sugestões de reposição do educador.', e.event);
                this.removeSelection();
            }
            else {
                this.object.professores.push(this.selectedSource.id);
                this.transferToTarget(e);
            }

        }
    }
    
    transferToTarget(e: CdkDragDrop<Professor[]>) {
        let item = this.selectedSource as Professor;
        let index = this.source.findIndex(x => x.id == item.id);

        this.target.push(item);
        this.source.splice(index, 1);

        this.sortList();
        this.removeSelection();
    }

    sortList() {
        this.source = this.source.sort((x, y) => x.nome < y.nome ? -1 : 1)
        this.target = this.target.sort((x, y) => x.nome < y.nome ? -1 : 1);
    }

    removeSelection() {
        delete this.selectedSource;
    }

    temIndisponivelSelecionado() {
        return this.target.filter(x => x.disponivel === false).length > 0;
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid)
            return this.showError('Erro', 'Preencha todos os dados corretamente para salvar', e)

        if (this.target.length < 2)
            return this.showError('Não autorizado', 'Selecione pelo menos 2 educadores para salvar', e);

        if (this.target.filter(x => !x.disponivel).length > 0)
            return this.showError('Não autorizado', 'Selecione apenas educadores disponíveis', e);


        this.object.professores = this.target.map(x => x.id);

        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar reunião',
            message: `Tem certeza que deseja agendar reunião para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?`,
            acceptLabel: `Agendar reunião`,
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }
        })

    }

    send(e: any) {
        this.loading = true;

        lastValueFrom(this.service.createReuniao(this.object))
            .then(res => {
                this.loading = false;
                this.visible = false
                this.visibleChange();
                this.toastrService.success('Reunião cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar reunião. <br> ${getError(res)}`, e);
            })

    }
}
