import { BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { UrlService } from "../utils/url.service";

@Injectable({
    providedIn: 'root',
})
export class Service {
    list = new BehaviorSubject<any[]>([])
    url: string = environment.url;

    constructor(
        public http: HttpClient,
        public toastrService: ToastrService,
        private urlService: UrlService
    ) {
        this.urlService.setUrl(environment.url);
        this.urlService.getUrl().subscribe(res => {
            this.url = res;
        })
    }

}