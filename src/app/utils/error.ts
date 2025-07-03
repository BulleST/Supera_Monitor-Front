import { HttpErrorResponse } from "@angular/common/http";
import { playError } from "./audio";
import { ConfirmationService } from "primeng/api";

export function showError(confirmationService: ConfirmationService, header: string, message: string, e: any, innerMessage?: string) {
    // playError();


    if (innerMessage) {
        message += `<br> Clique em "Ver detalhes" para exibir o log do erro.`
    }

    confirmationService.confirm({
        target: e.target ?? e,
        message: message,
        header: 'OPS!',
        icon: 'pi pi-times-circle text-4xl -mr-2 text-red-500',
        acceptLabel: 'Fechar',
        acceptButtonStyleClass: 'p-button-rounded',
        acceptIcon: 'pi pi-times',
        rejectVisible: !!innerMessage,
        rejectLabel: 'Ver detalhes',
        rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
        reject: () => {
            if (innerMessage) {
                showInnerMessage(confirmationService, e, innerMessage);
            }
        }
    })
}

function showInnerMessage(confirmationService: ConfirmationService, e: any, message: string) {
    confirmationService.confirm({
        target: e.target ?? e,
        message: message,
        header: 'Erro interno',
        icon: 'pi pi-times-circle text-4xl -mr-2 text-red-500',
        acceptLabel: 'OK',
        acceptButtonStyleClass: 'p-button-rounded',
        acceptIcon: '',
        rejectVisible: false,
    })
}

export function getError(res: HttpErrorResponse) {
    var msg = "Ocorreu um erro, mas não foi possível localizar a causa.";
    
    if (res.error && res.error.message) 
        msg = res.error.message
    else if (res.error && res.error.Message) 
        msg = res.error.Message
    else if (typeof res.error == 'string') 
        msg = res.error
    else if (res.message) 
        msg = res.message
    else 
        msg = 'Ocorreu um erro. <br>' + res.toString();

    return msg;
}

function jsonKeyToLowercase(oldObj: any) {
    var keysUpper = Object.keys(oldObj)
    var newObj: any = {}
    for (var i in keysUpper) {
        newObj[keysUpper[i].toLowerCase()] = oldObj[keysUpper[i]]
    }
    return newObj;
}


function ConvertKeysToLowerCase(obj: any) {
    if (Object.prototype.toString.apply(obj) !== '[object Array]' && Object.prototype.toString.apply(obj) !== '[object Object]') {
        return obj;
    }
    let output: any = {};
    for (let i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.toLowerCase()] = ConvertKeysToLowerCase(obj[i]);
        } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
            output[i.toLowerCase()] = [];
            for (let j = 0; j < obj[i].length; j++) {
                output[i.toLowerCase()].push(ConvertKeysToLowerCase(obj[i][j]));
            }
        } else {
            output[i.toLowerCase()] = obj[i];
        }
    }
    return output;
};
