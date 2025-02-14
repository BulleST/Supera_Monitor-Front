export function Map(oldObj: any, newObj: any) {
    for (const [key, value] of Object.entries(newObj)) {
        newObj[key] = oldObj[key];
        console.log(key, oldObj[key])
    }
    return newObj;
}
