import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.css'],
    standalone: false,
        providers: [ConfirmationService]
})
export class AccountComponent {

    route = ''
    constructor(
        private router: Router
    ) {

      
    }

}
