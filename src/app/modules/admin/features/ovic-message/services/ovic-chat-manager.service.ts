import { Injectable } from '@angular/core';

@Injectable( {
	providedIn : 'root'
} )
export class OvicChatManagerService {
	regexTagA  = new RegExp( `<\s*a[^>]*>(.*?)<\s*/\s*a>` );
	regexTagAs = /<\s*a[^>]*>(.*?)<\s*\/\s*a>/g;

	constructor() { }
}
