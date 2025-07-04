import { AfterViewInit, Component } from '@angular/core';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { LoadingService } from '../loading/loading';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-loading-brain',
    standalone: false,

    templateUrl: './loading-brain.component.html',
    styleUrl: './loading-brain.component.css'
})
export class LoadingBrainComponent implements AfterViewInit {
    dotLottie!: DotLottie;
    loading = false;
    subscription: Subscription[] = [];

    constructor(
        private loadingUtils: LoadingService,
    ) {


    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    ngAfterViewInit(): void {
        // this.dotLottie = new DotLottie({
        //     autoplay: true,
        //     loop: true,
        //     canvas: document.querySelector('#dotlottie-canvas') as HTMLCanvasElement,
        //     // src:"https://lottie.host/d4cbe4fb-c898-4978-bfc5-a0c079f6ffb4/TQpOpNU4Fr.lottie"
        //     src:"/assets/images/dot-lottie.lottie"

        // });

        // var loading = this.loadingUtils.loading.subscribe(async res => {
        //     this.loading = res;
        //     if (res) {
        //         this.dotLottie.play();
        //     } else {
                
        //         setTimeout(() => {
        //             this.dotLottie.stop();
        //         }, 1000);
        //     }
        // });
        // this.subscription.push(loading);
    }


}
