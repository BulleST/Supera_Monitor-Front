import moment from "moment";
import "moment/locale/pt-br";

export function MyMap(oldObj: any, newObj: any) {
    Object.keys(newObj).forEach(key => {
        newObj[key] = oldObj[key];
        if (newObj[key] instanceof Date) {
            newObj[key] = moment(newObj[key]).format('YYYY-MM-DD[T]HH:mm:ss') 
        }
    }) 
    return newObj;
}


export function duracao(duracao: number) {
    var minutos = duracao % 60
    var horas = duracao / 60;
    var horaRedonda = (horas - Math.floor(horas)) == 0;

    if (horaRedonda) 
       return horas.toString().padStart(2,'0') + 'h'
    else 
        return horas.toString().padStart(2,'0') + 'h' + minutos.toString().padStart(2,'0') + 'm';

}