
export function remove(service: any, objeto: any, property = 'list') {
    var list = JSON.parse(JSON.stringify(service[property].value)) as any[];
    var index = list.findIndex(x => x.id == objeto.id);
    list.splice(index, 1);
    service[property].next(list);
}

export function insertOrReplace(service: any, object: any, property = 'list') {
    var list = JSON.parse(JSON.stringify(service[property].value)) as any[];
    if (object.id) {
        var index = list.findIndex(x => x.id == object.id);
        if (index == -1) {
            list.push(object);
        }
        list.splice(index, 1, object);
    } else {
        list.push(object);
    }
    service[property].next(list);
}
