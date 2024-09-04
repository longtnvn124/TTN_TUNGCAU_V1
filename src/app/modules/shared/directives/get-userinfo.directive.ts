import { Directive , ElementRef , HostBinding , Input , OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';

@Directive( {
	selector : '[appGetUserinfo]'
} )
export class GetUserinfoDirective implements OnInit {

	@Input() appGetUserinfo : number;

	@HostBinding( 'class.ovic-is-loading' ) loading : boolean;

	constructor(
		private element : ElementRef ,
		private userService : UserService
	) {
	}

	ngOnInit() : void {
		this.loading = true;
		if ( this.appGetUserinfo ) {
			this.element.nativeElement.innerHTML = '...loading';
			this.userService.getUser( this.appGetUserinfo , 'display_name' ).subscribe( {
				next  : ( { display_name } ) => {
					this.element.nativeElement.innerHTML = display_name;
					this.loading                         = false;
					console.log( display_name );
				} ,
				error : () => {
					this.element.nativeElement.innerHTML = '...error';
					this.loading                         = false;
				}
			} );
		} else {
			this.loading = false;
		}
	}
}
