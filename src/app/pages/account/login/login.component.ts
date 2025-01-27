import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { LoadingService } from '../../../parts/loading/loading';
import { getError } from '../../../utils';
import { Login } from '../../../models/account.model';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./../account.component.css']
})
export class LoginComponent {
    object = new Login;
    loading: boolean = false;
    error = '';

    constructor(
        private accountService: AccountService,
        private loadingHelper: LoadingService,
    ) {
        this.loadingHelper.loading.subscribe(res => this.loading = res);
    }

    send() {
      this.loadingHelper.loading.next(true);
      lastValueFrom(this.accountService.weatherforecast())

        lastValueFrom(this.accountService.login(this.object))
            .then(res => {
                this.loadingHelper.loading.next(false);
                // this.appinitService.initialized.next(true);
            })
            .catch(res => {
                this.error = getError(res);
                this.loadingHelper.loading.next(false);
            });
    }

}
