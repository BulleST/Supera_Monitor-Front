import { BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({
    providedIn: 'root',
})
export class Service {
    list = new BehaviorSubject<any[]>([])
    url = environment.url;


    constructor(
        public http: HttpClient,
        public toastrService: ToastrService,
    ) {
        this.url = environment.url; //+ 'back';
    }
}