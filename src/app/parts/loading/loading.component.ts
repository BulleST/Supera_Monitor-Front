import { Component, OnChanges, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LoadingService } from './loading';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.css',
    standalone: false
})
export class LoadingComponent implements OnDestroy, OnChanges {

  loadingInitial = false;
  loading = false;
  loadingRequest: boolean[] = [];
  subscription: Subscription[] = [];
  message?: string;

  constructor(
    private loadingUtils: LoadingService,
  ) {

    var loading = this.loadingUtils.loading.subscribe(async res => {
        if (this.loadingRequest.length > 0) {
            this.loading = true
        } else {
            this.loading = res;
        }
    });
    this.subscription.push(loading);

    var loadingRequests = this.loadingUtils.loadingRequest.subscribe(res => {
        this.loadingRequest = res;
        if (this.loadingRequest.length > 0) {
            this.loading = true
        } else {
            this.loading = false;
        }
    });
    this.subscription.push(loadingRequests);

    var message = this.loadingUtils.message.subscribe(res => this.message = res);
    this.subscription.push(message);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(item => item.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loadingInitial']) {
      this.loadingInitial = changes['loadingInitial'].currentValue;
    }
  }

}
