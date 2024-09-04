import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot , CanActivate , Router , RouterStateSnapshot , UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import {KEY_NAME_CONTESTANT_EMAIL, KEY_NAME_CONTESTANT_PHONE, KEY_NAME_SHIFT_ID} from '@shared/utils/syscat';

@Injectable( {
	providedIn : 'root'
} )
export class TestGuard implements CanActivate {
	constructor(
		private auth : AuthService ,
		private router : Router
	) { }


	canActivate(
		route : ActivatedRouteSnapshot ,
		state : RouterStateSnapshot ) : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.auth.getOption( KEY_NAME_CONTESTANT_EMAIL ) && this.auth.getOption( KEY_NAME_SHIFT_ID ) ? true : this.auth.getOption( KEY_NAME_SHIFT_ID ) ? this.router.createUrlTree( [ 'test/check-mail' ] ) : this.router.createUrlTree( [ 'test/shift' ] );
		// return this.auth.getOption( KEY_NAME_CONTESTANT_PHONE ) && this.auth.getOption( KEY_NAME_SHIFT_ID ) ? true : this.auth.getOption( KEY_NAME_SHIFT_ID ) ? this.router.createUrlTree( [ 'test/contestant' ] ) : this.router.createUrlTree( [ 'test/shift' ] );
	}
}
