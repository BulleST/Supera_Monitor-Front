import { Service } from "../helpers/service.service";

export function remove(service: any, objeto: any, property = 'list') {
    var list = JSON.parse(JSON.stringify(service[property].value)) as any[];
    var index = list.findIndex(x => x.id == objeto.id);
    list.splice(index, 1);
    service[property].next(list);
}

export function insertOrReplace(service: Service, object: any, property: string = 'list') {
    try {
        var list = service.list.value as any[];
        console.log('list before', list)
        console.log('object', object)
        if (object.id) {
            var index = list.findIndex(x => x.id == object.id);
            console.log('index', index)
            if (index == -1) {
                list.push(object);
            }
            list.splice(index, 1, object);
        } else {
            list.push(object);
        }
        console.log('list after', list)
        service.list.next(list);
        console.log('list value', service.list.value)
    }
    catch (e) {
        console.error(e)
    }
}
