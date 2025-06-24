import { Service } from "../helpers/service.service";

export function remove(service: any, objeto: any, property = 'list') {
    var list = JSON.parse(JSON.stringify(service[property].value)) as any[];
    var index = list.findIndex(x => x.id == objeto.id);
    list.splice(index, 1);
    service[property].next(list);
}

export function insert(service: Service, object: any, property = 'list') {
    try {
        var list = service.list.value as any[];
        list.push(object);
        service.list.next(list);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function replace(service: Service, object: any, property = 'list') {
    try {
        var list = service.list.value as any[];
        var index = list.findIndex(x => x.id == object.id);
        list.splice(index, 1, object);
        service.list.next(list);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function insertOrReplace(service: Service, object: any, property: string = 'list') {
    try {
        var list = service.list.value as any[];
        if (object.id) {
            var index = list.findIndex(x => x.id == object.id);
            if (index == -1) {
                list.push(object);
            }
            list.splice(index, 1, object);
        } else {
            list.push(object);
        }
        service.list.next(list);
    }
    catch (e) {
        console.error('insertOrReplace error', e)
    }
}
