import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'object', pure: false})
export class ObjectPipe implements PipeTransform {
    transform(obj, args: string[]): any {
        const keys = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push({key: key, value: obj[key]});
            }
        }
        return keys;
    }
}

