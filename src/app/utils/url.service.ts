import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UrlService {

    urlSubject = new BehaviorSubject<string>(environment.url);

    constructor() {
        if (!this.getUrl().value){
            this.setUrl(environment.url)
        }
    }

    getUrl() {
        let value = localStorage.getItem('url') ?? '';
        this.urlSubject.next(value);
        return this.urlSubject
    }

    setUrl(value: string) {
        localStorage.setItem('url', value ?? '')
        this.urlSubject.next(value);
    }
}
