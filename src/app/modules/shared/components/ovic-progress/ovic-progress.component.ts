import { Component , Input , OnInit } from '@angular/core';

@Component( {
	selector    : 'ovic-progress' ,
	templateUrl : './ovic-progress.component.html' ,
	styleUrls   : [ './ovic-progress.component.css' ]
} )
export class OvicProgressComponent implements OnInit {

	@Input() progress = 0;

	constructor() {
	}

	ngOnInit() : void {
	}

}
