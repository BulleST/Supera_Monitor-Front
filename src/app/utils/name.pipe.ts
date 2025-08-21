import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameAbv'
})
export class NameAbvPipe implements PipeTransform
{
    transform(value?: string): string
    {
        if (!value) { return ''; }
        var nameArray = value.split(' ').filter(x => !!x )
        var firstName = nameArray[0];

        var a = ['de', 'da', 'do', 'das', 'dos']
        var middleNames: string[] = [];
        nameArray.forEach((name, index) => {
             
            if(index == 0 || index == nameArray.length-1)
                return
            else if (a.includes(name.toLowerCase()) == false) {
                middleNames.push(name[0] + '.')
            }
        })

        var lastName = '';
        if (nameArray.length > 1){
            lastName = nameArray[nameArray.length-1];
        }

        return `${firstName.toLowerCase()} ${middleNames.join(' ').toLowerCase()} ${lastName.toLowerCase()}`
    }
}