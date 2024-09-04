import { Component , Input , OnInit } from '@angular/core';
import { SideFilterSettings } from '@shared/models/side-filters';

@Component( {
	selector    : 'app-side-filters' ,
	templateUrl : './side-filters.component.html' ,
	styleUrls   : [ './side-filters.component.css' ]
} )
export class SideFiltersComponent implements OnInit {

	@Input() settings : SideFilterSettings[];

	constructor() { }

	ngOnInit() : void {
	}
}
