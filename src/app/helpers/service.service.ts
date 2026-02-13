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
    insert(object: any, sortProperty = 'id') {
        var list = this.list.value as any[];
        list.push(object) 
        list = list.sort((x, y) => x[sortProperty] < y[sortProperty] ? -1 : 1);
        this.list.next(list);
    }


}