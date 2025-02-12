import { BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class Service {
    list = new BehaviorSubject<any[]>([])
    url = environment.url;


    constructor(
        public http: HttpClient,
        public messageService: MessageService,
    ) {
        this.url = environment.url + 'back';
    }
}