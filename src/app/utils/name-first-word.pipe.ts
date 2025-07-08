import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'firstWord'
})
export class NameFirstWordPipe implements PipeTransform {
    transform(value: string): string | boolean {
        if (!value) { return ''; }
        var nameArray = value.split(' ').filter(x => !!x);
        return nameArray[0];
    }
}