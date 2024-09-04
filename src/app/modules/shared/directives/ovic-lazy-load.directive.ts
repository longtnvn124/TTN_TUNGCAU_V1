import { AfterViewInit , Directive , ElementRef , HostBinding , Input , OnChanges , OnDestroy , SimpleChanges } from '@angular/core';
import { FileService } from '@core/services/file.service';
import { debounceTime , Subject , Subscription } from 'rxjs';
import { DomSanitizer , SafeUrl } from '@angular/platform-browser';

@Directive( {
	selector : '[ovicLazyLoad]'
} )
export class OvicLazyLoadDirective implements AfterViewInit , OnChanges , OnDestroy {

	@Input( 'ovicLazyLoad' ) fileId : number;

	@HostBinding( 'src' ) src : SafeUrl;

	subscription = new Subscription();

	LOAD_MEDIA = new Subject<number>();

	constructor(
		private tagElement : ElementRef ,
		private fileService : FileService ,
		private sanitized : DomSanitizer
	) {
		const observerLoadMedia = this.LOAD_MEDIA.asObservable().pipe( debounceTime( 300 ) ).subscribe( fileId => this.loadMedia( fileId ) );
		this.subscription.add( observerLoadMedia );
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'fileId' ] ) {
			this.LOAD_MEDIA.next( this.fileId );
		}
	}

	ngAfterViewInit() : void {
		this.LOAD_MEDIA.next( this.fileId );
	}

	loadMedia( id : number ) {
		if ( id ) {
			const figure = this.tagElement.nativeElement.closest( 'figure' );
			if ( figure ) {
				figure.classList.add( 'figure-lazing' );
			}
			this.fileService.getFileAsObjectUrl( id.toString( 10 ) ).subscribe( {
				next  : src => {
					this.src = this.sanitized.bypassSecurityTrustUrl( src );
					if ( figure ) {
						figure.classList.remove( 'figure-lazing' );
						figure.classList.add( 'figure-lazied' );
					}
				} ,
				error : () => {
					if ( figure ) {
						figure.classList.remove( 'figure-lazing' );
						figure.classList.add( 'figure-lazied--fail' );
					}
				}
			} );
		} else {
			//assets/images/avatar-size-4x6.png
			this.src = this.sanitized.bypassSecurityTrustUrl( 'assets/images/avatar-size-4x6.png' );
		}
	}

	ngOnDestroy() : void {
		if ( this.subscription ) {
			this.subscription.unsubscribe();
		}
	}
}
