import { Injectable , OnDestroy } from '@angular/core';
import { io , Socket } from 'socket.io-client';
import { debounceTime , Observable , Subject , Subscription , timer } from 'rxjs';
import { Notification , NotificationMessage , QuickNotification } from '@modules/admin/features/ovic-message/models/notification';
import { APP_CONFIGS , environment , getRoute , getWsUrl , wsPath } from '@env';
import { AuthService } from '@core/services/auth.service';
import { HttpParamsHeplerService } from '@core/services/http-params-hepler.service';
import { HttpClient , HttpParams } from '@angular/common/http';
import { distinctUntilChanged , filter , map , switchMap , tap } from 'rxjs/operators';
import { Dto , OvicQueryCondition } from '@core/models/dto';

interface SocketState {
	name : string,
	reason : string | Error;
}

interface UsersOnlineState {
	[ t : number ] : string[];
}

@Injectable( {
	providedIn : 'root'
} )
export class MessageNotifyService implements OnDestroy {

	// private socket : Socket<ServerToClientEvents , ClientToServerEvents>;
	private socket : Socket;

	private subscriptions = new Subscription();

	private observerSocketStatus$ = new Subject<SocketState>();

	private observerPushNotification$ = new Subject<NotificationMessage>();

	private observerUserOnline$ = new Subject<UsersOnlineState>();

	private api = getRoute( 'notification/' );

	private loadDataEvent$ = new Subject<number>();

	private removeNotificationFromTopBar$ = new Subject<string>();

	private calculateNotifiesTime$ = new Subject<number>();

	isLoading = false;

	notifications : Notification[];

	newNotifications : NotificationMessage[];

	constructor(
		private auth : AuthService ,
		private appHttpParamsService : HttpParamsHeplerService ,
		private http : HttpClient
	) {
		const observerSignIn   = this.auth.onSignIn.pipe( debounceTime( 100 ) , filter( t => t !== null ) , distinctUntilChanged() ).subscribe( {
			next : accessToken => {
				if ( this.socket ) {
					this.socket.disconnect();
					this.socket.close();
				}
				this.socket = io( getWsUrl() , {
					path : wsPath ,
					auth : {
						token : accessToken ,
						realm : APP_CONFIGS.realm
					}
				} );
				this.socket.connect();
				this.socket.on( 'connect' , () => {

					const engine = this.socket.io.engine;

					this.observerSocketStatus$.next( { name : 'connected' , reason : '' } );
					console.log( 'socket connected' );

					engine.on( 'close' , ( reason ) => {
						this.observerSocketStatus$.next( { name : 'close' , reason } );
						console.log( 'socket close' );
					} );

					engine.on( 'error' , ( reason ) => {
						this.observerSocketStatus$.next( { name : 'error' , reason } );
						console.log( 'socket error' );
					} );
				} );

				this.socket.on( 'notification' , notify => console.log( notify ) );

				this.socket.on( 'online' , online => this.userOnline( online ) );

				this.socket.on( 'message' , notify => this.pushNotification( notify ) );
			}
		} );
		const observerSignOut  = this.auth.onSignOut.pipe( debounceTime( 100 ) , filter( t => t !== null ) ).subscribe( {
			next : reason => {
				if ( this.socket ) {
					this.socket.disconnect();
					this.socket.close();
				}
			}
		} );
		const observerLoadData = this.loadDataEvent$.asObservable().pipe( debounceTime( 100 ) , filter( () => !this.isLoading ) , switchMap( user_id => this.getAllNotifications( user_id ) ) ).subscribe();
		const timer$           = timer( 300000 ).pipe( tap( number => this.calculateNotifiesTime$.next( number ) ) ).subscribe();
		this.subscriptions.add( observerLoadData );
		this.subscriptions.add( observerSignIn );
		this.subscriptions.add( observerSignOut );
		this.subscriptions.add( timer$ );
	}

	get onCalculateNotifiesTime() : Observable<number> {
		return this.calculateNotifiesTime$;
	}

	get socketStatus() : Observable<SocketState> {
		return this.observerSocketStatus$;
	}

	get onPushNotification() : Observable<NotificationMessage> {
		return this.observerPushNotification$;
	}

	get onUserOnline() : Observable<UsersOnlineState> {
		return this.observerUserOnline$;
	}

	get onRemoveNotificationFromTopBar() : Subject<string> {
		return this.removeNotificationFromTopBar$;
	}

	private pushNotification( notify : NotificationMessage ) {
		this.observerPushNotification$.next( notify );
	}

	private userOnline( online : UsersOnlineState ) {
		this.observerUserOnline$.next( online );
	}

	getAllNotifications( user_id : number ) : Observable<Notification[]> {
		const params = new HttpParams( { fromObject : { user_id } } );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( r => r.data ) );
	}

	getNotificationById( id : number ) : Observable<Notification> {
		const url = ''.concat( this.api , id.toString() );
		return this.http.get<Dto>( url ).pipe( map( r => r.data[ 0 ] || null ) );
	}

	getNotificationByCode( code : string ) : Observable<Notification> {
		console.log( code );
		const params = this.appHttpParamsService.paramsConditionBuilder( [ {
			conditionName : 'code' ,
			condition     : OvicQueryCondition.equal ,
			value         : code
		} ] );
		console.log( params.toString() );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( r => r.data[ 0 ] || null ) );
	}

	queryNotifications( user_id : number , paged = 1 , limit = -1 ) : Observable<Dto> {
		const params = new HttpParams( { fromObject : { user_id , paged , limit } } );
		return this.http.get<Dto>( this.api , { params } );
	}

	pushANewNotification( notification : QuickNotification ) : Observable<any> {
		return this.http.post<Dto>( this.api , notification ).pipe( tap( () => {
			const date = new Date();
			if ( notification.receiver ) {
				Object.keys( notification.receiver ).forEach( ( userId ) => {
					const message = this.senderToMessage( notification , date );
					this.socket.emit( 'send' , { room_id : `user:${ userId }` , ... message } );
				} );
			}
		} ) );
	}

	private senderToMessage( notification : QuickNotification , date : Date ) : NotificationMessage {
		return {
			avatar   : notification.params.avatar ,
			user     : { display_name : notification.params.author , email : notification.params.email } ,
			user_id  : notification.sender ,
			title    : notification.title ,
			message  : notification.message ,
			sender   : notification.sender ,
			receiver : notification.receiver ,
			params   : { created_at : date.toUTCString() , code : notification.code } ,
			type     : notification.params.type
		};
	}

	private _postNewNotification( notification : QuickNotification ) : Observable<any> {
		return this.http.post<Dto>( this.api , notification );
	}

	notificationAreRead( { id , code } : { id : number, code : string } , user_id : number ) : Observable<any> {
		const url  = ''.concat( this.api , 'seen/' , id.toString( 10 ) );
		const seen = true;
		return this.http.put( url , { user_id , seen } ).pipe( tap( () => this.removeNotificationFromTopBar$.next( code ) ) );
	}

	getUnSeenNotifications( user_id : number ) : Observable<Notification[]> {
		const params = new HttpParams( { fromObject : { seen : false , user_id } } );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( r => r.data ) );
	}

	getNotifyTime( time : string ) : string {
		let result = '';
		if ( time ) {
			const des       = new Date( time );
			const timeStamp = des.valueOf();
			if ( Number.isInteger( timeStamp ) ) {
				const now    = new Date().valueOf();
				const offset = now - timeStamp;
				/* offset < 1 day */
				if ( 86400000 > offset ) {
					/* offset < 1 hours */
					if ( 3600000 > offset ) {
						if ( 120000 > offset ) {
							result = '1 phút trước';
						} else if ( 300000 > offset ) {
							result = '2 phút trước';
						} else if ( 600000 > offset ) {
							result = '5 phút trước';
						} else if ( 900000 > offset ) {
							result = '10 phút trước';
						} else if ( 1200000 > offset ) {
							result = '20 phút trước';
						} else if ( 1800000 > offset ) {
							result = '30 phút trước';
						} else if ( 2400000 > offset ) {
							result = '40 phút trước';
						} else if ( 3000000 > offset ) {
							result = '50 phút trước';
						} else {
							result = '1 giờ trước';
						}
					} else if ( 7200000 > offset ) {
						result = '2 giờ trước';
					} else if ( 14400000 > offset ) {
						result = '4 giờ trước';
					} else if ( 21600000 > offset ) {
						result = '6 giờ trước';
					} else if ( 28800000 > offset ) {
						result = '8 giờ trước';
					} else if ( 36000000 > offset ) {
						result = '10 giờ trước';
					} else if ( 43200000 > offset ) {
						result = '12 giờ trước';
					} else if ( 50400000 > offset ) {
						result = '14 giờ trước';
					} else if ( 57600000 > offset ) {
						result = '16 giờ trước';
					} else if ( 64800000 > offset ) {
						result = '18 giờ trước';
					} else if ( 72000000 > offset ) {
						result = '20 giờ trước';
					} else if ( 79200000 > offset ) {
						result = '22 giờ trước';
					} else {
						result = '24 giờ trước';
					}
				} else {
					if ( 172800000 > offset ) {
						result = '1 ngày trước';
					} else if ( 129600000 > offset ) {
						result = '2 ngày trước';
					} else if ( 172800000 > offset ) {
						result = '3 ngày trước';
					} else if ( 432000000 > offset ) {
						result = '4 ngày trước';
					} else if ( 518400000 > offset ) {
						result = '5 ngày trước';
					} else if ( 604800000 > offset ) {
						result = '6 ngày trước';
					} else if ( 691200000 > offset ) {
						result = '7 ngày trước';
					} else {
						const d = des.getDate().toString( 10 );
						const m = ( des.getMonth() + 1 ).toString( 10 );
						result  = [ d.padStart( 2 , '0' ) , m.padStart( 2 , '0' ) , des.getFullYear().toString( 10 ) ].join( '/' );
					}
				}
			}
		}
		return result;
	}

	requireCalculateNotifiesTime() {
		this.calculateNotifiesTime$.next( -1 );
	}

	notificationToMessage( notify : Notification ) : NotificationMessage {
		return {
			avatar   : notify.params.avatar ,
			title    : notify.title ,
			message  : notify.message ,
			sender   : notify.sender ,
			receiver : notify.receiver ,
			params   : { created_at : notify.created_at , code : notify.code } ,
			user     : { display_name : notify.params.author , email : notify.params.email } ,
			user_id  : notify.sender ,
			type     : notify.params.type
		};
	}

	ngOnDestroy() : void {
		if ( this.subscriptions ) {
			this.subscriptions.unsubscribe();
		}
	}
}
