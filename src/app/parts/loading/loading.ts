import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    loading = new BehaviorSubject<boolean>(false);
    loadingRequest = new BehaviorSubject<boolean[]>([]);

    message = new BehaviorSubject<string | undefined>(undefined);

    constructor() { 
    }

    addLoadingRequest() {
        var values = this.loadingRequest.value;
        values.push(true);
        this.loadingRequest.next(values);
    }
    
    removeLoadingRequest() {
        var values = this.loadingRequest.value;
        values.pop();
        this.loadingRequest.next(values);
    }
}