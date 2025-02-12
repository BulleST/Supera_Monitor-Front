
import { HttpErrorResponse } from "@angular/common/http";

export function getError(res: HttpErrorResponse) {
    var msg = "Ocorreu um erro, mas não foi possível localizar a causa.";
    
    if (res.error.message) {
        msg = res.error.message
    }

    return msg;



}

function jsonKeyToLowercase(oldObj: any) {
    var keysUpper = Object.keys(oldObj)
    var newObj: any = {}
    for(var i in keysUpper){
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
          } else if(Object.prototype.toString.apply(obj[i]) === '[object Array]'){
              output[i.toLowerCase()]=[];
              for (let j = 0; j < obj[i].length; j++) {
                  output[i.toLowerCase()].push(ConvertKeysToLowerCase(obj[i][j]));
              }
          } else {
              output[i.toLowerCase()] = obj[i];
          }
      }
      return output;
  };
  