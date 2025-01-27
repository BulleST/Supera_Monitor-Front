import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from '../../../services/account.service';
import { getError } from '../../../utils';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./../account.component.css', './verify-email.component.css']
})
export class VerifyEmailComponent {

    loading = true;
    
    error?: string;
    success?: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
    ) {

        const token = this.activatedRoute.snapshot.queryParams['token'];
        this.router.navigate([], { relativeTo: this.activatedRoute, replaceUrl: true });
        
        lastValueFrom(this.accountService.verifyEmail(token))
        .then((res) => {
                delete this.error;
                this.success = res.message;
                this.loading = false;
            })
            .catch((res) => {
                delete this.success;
                this.error = getError(res)
                this.loading = false;
            });
    }
}
