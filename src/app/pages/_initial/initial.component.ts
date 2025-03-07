import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { Header } from '../../utils';
import { AccountResponse } from '../../models/account.model';
import { MobileService, ScreenWidth } from '../../utils/mobile';

@Component({
    selector: 'app-initial',
    templateUrl: './initial.component.html',
    styleUrls: ['./initial.component.css'],
    standalone: false
})
export class InitialComponent implements OnDestroy {

    subscription: Subscription[] = [];
    navigationOpen = false;
    account?: AccountResponse = new AccountResponse;
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth: typeof ScreenWidth = ScreenWidth

    constructor(
        private accountService: AccountService,
        private header: Header,
        private mobileService: MobileService,
    ) {
        var open = this.header.menuAsideOpen.subscribe(res => this.navigationOpen = res);
        this.subscription.push(open);
        
        var account = this.accountService.account.subscribe(res => this.account = res)
        this.subscription.push(account);
        
        var screen = this.mobileService.get().subscribe(res => this.screen = res)
        this.subscription.push(screen);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {
    }


}
