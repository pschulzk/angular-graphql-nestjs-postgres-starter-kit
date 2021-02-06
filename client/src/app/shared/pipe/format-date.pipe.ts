import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  transform(value: string | number, formatInput?: string) {
    if (!!value && (typeof value === 'string' || typeof value === 'number')) {
      formatInput = formatInput ? formatInput : 'MM/dd/yyyy HH:mm:ss';
      value = typeof value === 'string' ? parseInt(value, 10) : value;
      return format(value, formatInput);
    }
    return value;
  }
}
