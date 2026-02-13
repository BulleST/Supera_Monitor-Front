import { sortBy } from "sort-by-typescript";
import { Service } from "../helpers/service.service";

export function remove(service: any, objeto: any, property = 'list', sortProperty: string[] = []) {
    let list = JSON.parse(JSON.stringify(service[property].value)) as any[];
    let index = list.findIndex(x => x.id == objeto.id);
    list.splice(index, 1);
    if (sortProperty && sortProperty.length) {
        list = list.sort(sortBy(...sortProperty))
    }
    service[property].next(list);
}

export function insert(service: Service, object: any, property = 'list', sortProperty: string[] = []) {
    try {
        let list = JSON.parse(JSON.stringify(service.list.value)) as any[];
        list.push(object);
        if (sortProperty && sortProperty.length) {
            list = list.sort(sortBy(...sortProperty))
        }
        service.list.next(list);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function replace(service: Service, object: any, property = 'list', sortProperty: string[] = []) {
    try {
        let list = JSON.parse(JSON.stringify(service.list.value)) as any[];
        let index = list.findIndex(x => x.id == object.id);
        list.splice(index, 1, object);
        if (sortProperty && sortProperty.length) {
            list = list.sort(sortBy(...sortProperty))
        }
        service.list.next(list);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function insertOrReplace(service: Service, object: any, property: string = 'list', sortProperty: string[] = []) {
    try {
        let list = JSON.parse(JSON.stringify(service.list.value)) as any[];
        if (object.id) {
            let index = list.findIndex(x => x.id == object.id);
            if (index == -1) {
                list.push(object);
            }
            list.splice(index, 1, object);
        } else {
            list.push(object);
        }
        if (sortProperty && sortProperty.length) {
            list = list.sort(sortBy(...sortProperty))
        }
        service.list.next(list);
    }
    catch (e) {
        console.error('insertOrReplace error', e)
    }
}
