import { Component, HostListener, OnDestroy } from '@angular/core';
import moment from 'moment';
import { CalendarioRequest } from '../../../models/calendario.model';
import { ColumnTable, DisplayType, FilterType } from '../../../utils';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Role } from '../../../models/account-perfil.model';
import { ScreenWidth } from '../../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { Table } from 'primeng/table';
import { Jornada } from '../../../models/jornada.model';
import { JornadaService } from '../../../services/jornada.service';

@Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    providers: [ConfirmationService],
})
export class DashboardComponent implements OnDestroy {
    dates: { jornada: Jornada, datas: Date[]  }[] = [];
    request: CalendarioRequest = new CalendarioRequest;

    jornadas: Jornada[] = [];
    

    list: any[] = [];
    tableLoading = false;
    tableSearch: string = '';
    tableColumns: ColumnTable[] = [];
    tableGlobalFilterFields: string[] = [];
    tableSelectedItem: any;
    tableMenu: MenuItem[] = [];
    DisplayType: typeof DisplayType = DisplayType;
    FilterType: typeof FilterType = FilterType;
    Role: typeof Role = Role;
    screen: ScreenWidth = ScreenWidth.lg;
    subscription: Subscription[] = [];

    constructor(

        private jornadaService: JornadaService


    ) {

        this.request.intervaloDe = moment().startOf('week').toDate();
        this.request.intervaloAte = moment().endOf('week').toDate();

        var jornadas = this.jornadaService.list.subscribe(res => this.jornadas = res);
        this.subscription.push(jornadas);

        this.load();


    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }



    next() {
        this.request.intervaloDe = moment(this.request.intervaloDe).add(1, 'week').toDate();
        this.request.intervaloAte = moment(this.request.intervaloAte).add(1, 'week').toDate();
        this.load();
    }

    prev() {
        this.request.intervaloDe = moment(this.request.intervaloDe).add(-1, 'week').toDate();
        this.request.intervaloAte = moment(this.request.intervaloAte).add(-1, 'week').toDate();
        this.load();
    }

    async load() {
        this.dates = [];

        if(!this.jornadas.length) {
            this.tableLoading = true;
            await lastValueFrom(this.jornadaService.getList())
            .then(res => {})
            this.tableLoading = false;
        }

        console.log('jornadas', this.jornadas)

        var data = this.request.intervaloDe as Date;
        while (data <= (this.request.intervaloAte as Date)) {
            var jornada = this.jornadas.find(x => data >= x.dataInicio && data <= x.dataFim /* moment(data).isBetween(x.dataInicio, x.dataFim)*/) ?? new Jornada;
            if(jornada.id > 0) {
                console.log('jornada', jornada)
            }
            if (this.dates.length == 0) {
                if (jornada.id == 0) {
                    jornada.dataInicio = data;
                    jornada.dataFim = moment(data).add(1, 'week').toDate();
                }
                this.dates.push({
                    jornada: jornada,
                    datas: [data]
                })
            } 
            else {
                var last = this.dates[this.dates.length - 1];

                if (last.jornada.id == jornada.id) {
                    last.datas.push(data);
                } else {
                    if (jornada.id == 0) {
                        jornada.dataInicio = data;
                        jornada.dataFim = moment(data).add(1, 'week').toDate();
                    }
                    this.dates.push({
                        jornada: jornada,
                        datas: [data]
                    })
                }
            }

            // this.dates.push(data);
            data = moment(data).add(1, 'day').toDate();
        }

    }

    clear(dt: Table) {
        this.tableSearch = '';
        dt.clear();
    }

    @HostListener('keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        this.unselectItems();
    }
    unselectItems() {
        this.tableSelectedItem = undefined;
    }
    update() {
    }

    contextMenuSelectionChange(item: any) {
        this.tableMenu = [
        ];
    }

    getOption(col: ColumnTable, row: any) {
        var item = col.options.items.find((x: any) => x.value == row[col.field]);
        return item;
    }

}
