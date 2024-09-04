import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htmlDecode'
})
export class OvicHtmlDecodePipe implements PipeTransform {

  transform(value: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }

}
