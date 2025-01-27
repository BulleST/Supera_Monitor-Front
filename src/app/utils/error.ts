
import { HttpErrorResponse } from "@angular/common/http";

export function getError(res: HttpErrorResponse) {
    var msg = "Ocorreu um erro, mas não foi possível localizar a causa.";
    
    res = jsonKeyToLowercase(res) as HttpErrorResponse;
    if (res.status == 404) {
        return 'Operação não encontrada';
    }
    if (res) {
        if (res.error && res.error.errors)
        {
            for (const [key, value] of Object.entries(res.error.errors)) {
                if (value instanceof Array) {
                    value.forEach(item => {
                        msg += ((item as string) + '\n');
                    });
                }
            }
        }

        else if (res.error && res.error.error && res.error.error.text)
            msg = res.error.error.text;

        else if (res.error && res.error.Message)
            msg = res.error.Message;
        
        else if (res.error && res.error.InnerException && res.error.InnerException.InnerException)
            msg = res.error.InnerException.InnerException;
        
        else if (res.error && res.error.InnerException && res.error.InnerException.Message)
            msg = res.error.InnerException.Message;
        
        else if (res.error && typeof res.error == 'string')
            msg = res.error;
        
        else if (res.error && res.error.innerException)
            msg = res.error.innerexception;
        
        else if (res.message)
            msg = res.message;
        
        else if (res.error.error)
            msg = res.error.error;
    
        else if (res.error)
            msg = res.error;
        
        else
            msg = "Ocorreu um erro no processamento da requisição.";
            
    }
    return msg
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
  