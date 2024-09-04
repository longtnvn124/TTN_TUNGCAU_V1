import { Component , Input , OnInit } from '@angular/core';
import { OvicPivotTableSettings } from '@shared/models/ovic-pivot-table';

@Component( {
	selector    : 'ovic-pivot-table' ,
	templateUrl : './ovic-pivot-table.component.html' ,
	styleUrls   : [ './ovic-pivot-table.component.css' ]
} )
export class OvicPivotTableComponent implements OnInit {

	@Input() settings : OvicPivotTableSettings;

	constructor() { }

	ngOnInit() : void {
	}

}
