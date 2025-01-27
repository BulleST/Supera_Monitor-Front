import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { Header } from '../../utils';

@Component({
    selector: 'app-initial',
    templateUrl: './initial.component.html',
    styleUrls: ['./initial.component.css']
})
export class InitialComponent implements OnDestroy {

    subscription: Subscription[] = [];
    private swipeCoord?: [number, number];
    private swipeTime?: number;
    navigationOpen = false;
    account?: Account = new Account;

    constructor(
        private accountService: AccountService,
        private header: Header,
    ) {
        var open = this.header.menuAsideOpen.subscribe(res => this.navigationOpen = res);
        this.subscription.push(open);
        this.accountService.account.subscribe(res => {
            this.account = res;
        })

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {
    }


}
