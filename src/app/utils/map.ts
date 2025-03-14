import moment from "moment";

export function Map(oldObj: any, newObj: any) {
    // for (const [key, value] of Object.entries(newObj)) {
    //     newObj[key] = oldObj[key];

    //     if (newObj[key] instanceof Date) {
    //         newObj[key] = moment(newObj[key]).format('YYYY-MM-DD[T]HH:mm:ss') 
    //     }
    // }

    console.log('values', Object.values(newObj))
    console.log('entries', Object.entries(newObj))
    console.log('keys', Object.keys(newObj))
    Object.keys(newObj).forEach(key => {
        newObj[key] = oldObj[key];
        if (newObj[key] instanceof Date) {
            newObj[key] = moment(newObj[key]).format('YYYY-MM-DD[T]HH:mm:ss') 
        }
    }) 
    return newObj;
}
