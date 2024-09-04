import { Component , OnInit , ViewChild } from '@angular/core';
import { debounceTime , Subject , Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { UnsubscribeOnDestroy } from '@core/utils/decorator';
import { MessageNotifyService } from '../../services/message-notify.service';
import { Router , ActivatedRoute } from '@angular/router';
import { Notification , QuickNotification } from '../../models/notification';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu/menu';
import { filter } from 'rxjs/operators';

@Component( {
	selector    : 'ovic-notifications' ,
	templateUrl : './notifications.component.html' ,
	styleUrls   : [ './notifications.component.css' ]
} )
@UnsubscribeOnDestroy()
export class NotificationsComponent implements OnInit {

	subscriptions = new Subscription();

	data : Notification[] = [];

	private getDetailNotify$ = new Subject<number>();

	isCheckAll = false;

	items : MenuItem[] = [
		{
			label   : 'Tôi đã đọc' ,
			icon    : 'pi pi-check-circle' ,
			command : () => {}
		} ,
		{
			label   : 'Làm mới' ,
			icon    : 'pi pi-refresh' ,
			command : () => {}
		}
		// {
		// 	label   : 'Xóa' ,
		// 	icon    : 'pi pi-times' ,
		// 	command : () => {}
		// }
	];

	countSelected = 0;

	@ViewChild( 'menu' ) menu : Menu;

	errorLoading = false;

	loadData$ = new Subject<any>();

	isLoading = false;

	totalRecords = 0;

	itemPerPage = 10;

	paged = 1;

	constructor(
		private auth : AuthService ,
		private notificationService : NotificationService ,
		private messageNotifyService : MessageNotifyService ,
		private router : Router ,
		private route : ActivatedRoute
	) {
		// console.log( this.route.snapshot.paramMap.get( 'm' ) );
		// const observerGetDetailNotify = this.route.paramMap.subscribe( r => console.log( r ) );
		// this.subscriptions.add( observerGetDetailNotify );
		// this.getDetailNotify$.asObservable().pipe( debounceTime( 10 ) , distinctUntilChanged() );

		const observerCalculateTime$ = this.messageNotifyService.onCalculateNotifiesTime.subscribe( () => {
			if ( this.data && this.data.length ) {
				this.data.map( r => {
					r[ '__time' ] = this.messageNotifyService.getNotifyTime( r.created_at );
					return r;
				} );
			}
		} );

		const observerLoadData$ = this.loadData$.asObservable().pipe( debounceTime( 100 ) , filter( () => !this.isLoading ) ).subscribe( () => this.__loadingProcess() );
		this.subscriptions.add( observerLoadData$ );
		this.subscriptions.add( observerCalculateTime$ );
	}

	ngOnInit() : void {
		this.loadData();
	}

	loadData() {
		this.loadData$.next( '' );
	}

	private __loadingProcess() {
		this.notificationService.startLoading();
		this.isLoading = true;
		this.messageNotifyService.queryNotifications( this.auth.user.id , this.paged , this.itemPerPage ).subscribe( {
			next  : res => {
				this.errorLoading = false;
				this.notificationService.stopLoading();
				this.isLoading = false;
				if ( res.data ) {
					this.data = res.data.map( r => {
						r[ '__already_read' ] = r.receiver[ this.auth.user.id ];
						r[ '__check' ]        = false;
						r[ '__time' ]         = 'processing';
						return r;
					} );
					this.updateCounter();
					this.messageNotifyService.requireCalculateNotifiesTime();
				}
				this.totalRecords = res.recordsFiltered;
			} ,
			error : () => {
				this.isLoading    = false;
				this.errorLoading = true;
				this.data         = [];
				this.notificationService.stopLoading();
			}
		} );
	}

	toggleCheckElement( event : Event , notify : Notification ) {
		event.preventDefault();
		event.stopPropagation();
		notify[ '__check' ] = !notify[ '__check' ];
		if ( !notify[ '__check' ] && this.isCheckAll ) {
			this.isCheckAll = false;
		}
		this.updateCounter();
	}

	toggleCheckAll() {
		this.isCheckAll = !this.isCheckAll;
		this.data       = this.data.map( r => {
			r[ '__check' ] = this.isCheckAll;
			return r;
		} );
		this.updateCounter();
	}

	markAsRead() {
		const arrChecked = this.data.filter( t => t[ '__check' ] );
		if ( arrChecked.length ) {
			this.notificationService.startLoading();
			const maxLoop = arrChecked.length;
			let counter   = 0;
			arrChecked.forEach( ( e , i ) => {
				setTimeout( () => this.messageNotifyService.notificationAreRead( { id : e.id , code : e.code } , this.auth.user.id ).subscribe( {
					next  : () => {
						if ( ++counter === maxLoop ) {
							this.loadData();
						}
					} ,
					error : () => {
						if ( ++counter === maxLoop ) {
							this.loadData();
						}
					}
				} ) , i * 100 );
			} );
		}
	}

	updateCounter() {
		this.countSelected    = this.data.filter( t => t[ '__check' ] ).length;
		this.items[ 0 ].label = 'Tôi đã đọc (' + this.countSelected.toString() + ')';
		// this.items[ 1 ].label = 'Xóa (' + this.countSelected.toString() + ')';
		if ( this.menu ) {
			this.menu.hide();
		}
	}

	async openDetail( notify : Notification ) {
		const notifyCode = this.auth.encryptData( notify.code );
		this.notificationService.isProcessing( true );
		await this.router.navigate( [ 'admin/message/notification-details' ] , { queryParams : { notifyCode } } );
		// if ( !notify[ '__already_read' ] ) {
		// 	const id   = notify.id;
		// 	const code = notify.code;
		// 	this.notificationService.notificationAreRead( { id , code } , this.auth.user.id ).subscribe();
		// }
		this.notificationService.isProcessing( false );
	}

	pushNewNotification() {
		const __arr                      = [ 5424 , 5433 , 5408 ].filter( r => r !== this.auth.user.id );
		const receiver                   = __arr.reduce( ( a , b ) => {
			a[ b ] = false;
			return a;
		} , {} );
		const d                          = new Date();
		const newNot : QuickNotification = {
			code     : `${ this.auth.user.username }_${ d.getTime() }` ,
			title    : 'Some notice roles will be applied from September ICTU students need to know' + d.getTime() ,
			message  : '<p class="text-muted">Dear User,</p><p class="text-muted">An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you: An unrecognized device or browser recently signed into your Storage account. Help us keep your account secure by letting us know if this was you:</p><p class="text-muted">Pichforest</p>' ,
			sender   : this.auth.user.id ,
			receiver : receiver ,
			params   : {
				author : this.auth.user.display_name ,
				email  : this.auth.user.email ,
				avatar : this.auth.user.avatar ,
				type   : 'normal'
			}
		};
		this.notificationService.startLoading();
		this.messageNotifyService.pushANewNotification( newNot ).subscribe( {
			next  : value => {
				this.notificationService.stopLoading();
				// this.loadData();
			} ,
			error : e => this.notificationService.stopLoading()
		} );
	}

	checkNotifyRead( notifies : Notification[] ) {
		if ( notifies.length ) {

		}
	}

	changePage( event : { page : number } ) {
		if ( event.page + 1 === this.paged ) {
			return;
		}
		this.paged = event.page + 1;
		this.loadData();
	}
}
