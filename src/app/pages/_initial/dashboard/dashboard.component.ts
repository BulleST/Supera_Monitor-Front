import { Component } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    datas: Date[] = [];


    constructor() {

        var dataInicial = moment().startOf('week').toDate();
        var dataFinal = moment().endOf('week').toDate();


    }

}
