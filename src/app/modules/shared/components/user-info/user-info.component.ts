import { Component , Input , OnChanges , OnInit , SimpleChanges } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user';

@Component( {
	selector    : 'app-user-info' ,
	templateUrl : './user-info.component.html' ,
	styleUrls   : [ './user-info.component.css' ]
} )
export class UserInfoComponent implements OnInit , OnChanges {

	@Input() userId : number;

	@Input() placeholder = 'Vui lòng chọn user';

	@Input() changeUser = false;

	object : User;

	loading : boolean;

	constructor(
		private userService : UserService
	) {

	}

	ngOnInit() : void {
		if ( this.userId ) {
			this.loadUser( this.userId );
		}
	}

	loadUser( id : number ) {
		if ( id ) {
			this.loading = true;
			this.userService.getUser( id , 'id,display_name,avatar,phone' ).subscribe( {
				next  : user => {
					this.object = user;
				} ,
				error : () => {}
			} );
		} else {

		}
	}

	ngOnChanges( changes : SimpleChanges ) : void {
		if ( changes[ 'userId' ] ) {
			this.loadUser( changes[ 'userId' ].currentValue );
		}
	}

}
