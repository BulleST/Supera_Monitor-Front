var alert = new Audio('./assets/mixkit-bell-notification-933.mp3');
var success = new Audio('./assets/mixkit-positive-notification-951.mp3');
var error = new Audio('./assets/error-notification.mp3');

export function playAlert(rate = 1) {
    alert.playbackRate = rate;
    alert.play();
}

export function playSuccess(rate = 1) {
    success.playbackRate = rate;
    success.play();
}


export function playError(rate = 1) {
    error.playbackRate = rate;
    error.play();
}