import { Component , OnInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { MessageNotifyService } from '../../services/message-notify.service';
import { Notification } from '../../models/notification';
import { debounceTime , Subject , Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component( {
	selector    : 'app-single-notification' ,
	templateUrl : './single-notification.component.html' ,
	styleUrls   : [ './single-notification.component.css' ]
} )
export class SingleNotificationComponent implements OnInit {

	author = {
		avatar : 'https://via.placeholder.com/150' ,
		name   : 'no name' ,
		email  : 'no email'
	};

	data : Notification;

	isError = false;

	isEmptyData = false;

	subscriptions = new Subscription();

	private readonly reloadDataEvent = new Subject<number>();

	notifyCode : string;

	loadTime = 1;

	constructor(
		private auth : AuthService ,
		private notificationService : NotificationService ,
		private messageNotifyService : MessageNotifyService ,
		private router : Router ,
		private route : ActivatedRoute
	) {
		const observerReloadData  = this.reloadDataEvent.asObservable().pipe( debounceTime( 200 ) ).subscribe( () => this.loadData() );
		const observerQueryParams = this.route.queryParams.pipe( filter( params => params.hasOwnProperty( 'notifyCode' ) ) ).subscribe( params => this.presetData( params[ 'notifyCode' ] ) );
		this.subscriptions.add( observerQueryParams );
		this.subscriptions.add( observerReloadData );
	}

	ngOnInit() : void {
		if ( !this.route.snapshot.queryParamMap.has( 'notifyCode' ) ) {
			this.backToList();
		}
	}

	presetData( code : string ) {
		const notifyCode = code ? this.auth.decryptData( code ) : null;
		if ( notifyCode ) {
			console.log( notifyCode );
			this.notifyCode = notifyCode;
			this.reloadData();
		} else {
			this.backToList();
		}
	}

	backToList() {
		void this.router.navigate( [ 'admin/message/notifications' ] );
	}

	reloadData() {
		this.reloadDataEvent.next( this.loadTime );
	}

	loadData() {
		if ( this.notifyCode ) {
			this.notificationService.startLoading();
			this.messageNotifyService.getNotificationByCode( this.notifyCode ).subscribe( {
				next  : res => {
					this.notificationService.stopLoading();
					this.isError = false;
					this.loadTime++;
					if ( res && res.receiver.hasOwnProperty( this.auth.user.id ) ) {
						this.isEmptyData = false;
						this.data        = res;
						if ( res.params.avatar ) {
							this.author.avatar = res.params.avatar;
						}
						if ( res.params.author ) {
							this.author.name = res.params.author;
						}
						if ( res.params.email ) {
							this.author.email = res.params.email;
						}
						if ( !res.receiver[ this.auth.user.id ] ) {
							this.messageNotifyService.notificationAreRead( { id : res.id , code : res.code } , this.auth.user.id ).subscribe();
						}
					} else {
						this.isEmptyData = true;
					}
				} ,
				error : () => {
					this.isError = true;
					this.notificationService.stopLoading();
					this.loadTime++;
				}
			} );
		}
	}
}
