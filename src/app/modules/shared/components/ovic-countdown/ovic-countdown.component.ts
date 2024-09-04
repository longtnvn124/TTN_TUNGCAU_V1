import { AfterViewInit , Component , EventEmitter , Input , OnInit , Output , ViewChild } from '@angular/core';
import { CountdownComponent , CountdownConfig } from 'ngx-countdown';

@Component( {
	selector    : 'ovic-countdown' ,
	templateUrl : './ovic-countdown.component.html' ,
	styleUrls   : [ './ovic-countdown.component.css' ]
} )
export class OvicCountdownComponent implements OnInit , AfterViewInit {

	timerConfigs : CountdownConfig;

	@Input() leftTime : number;

	@Input() notify : number;

	@ViewChild( 'cd' ) private countdown : CountdownComponent;

	@Output() notifyEvent = new EventEmitter<any>();

	display : boolean;

	constructor() { }

	ngOnInit() : void {
		if ( this.leftTime ) {
			this.timerConfigs = {
				demand     : true ,
				leftTime   : this.leftTime ,
				notify     : this.notify || this.leftTime ,
				format     : 'mm:ss' ,
				prettyText : ( text ) => {
					return text.split( ':' ).map( ( v ) => `<span class="v-step-timer__number">${ v }</span>` ).join( '' );
				}
			};
			this.display      = true;
		} else {
			this.display = false;
		}
	}

	ngAfterViewInit() {
		if ( this.display ) {
			this.countdown.begin();
		}
	}

	handleEvent( event ) {
		this.notifyEvent.emit( event );
	}

}
