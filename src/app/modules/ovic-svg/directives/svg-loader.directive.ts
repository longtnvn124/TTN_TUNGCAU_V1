import { Directive , Input , ElementRef , SimpleChanges , AfterViewInit , OnChanges , OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime , mergeMap , Observable , Subject , Subscription } from 'rxjs';
import { distinctUntilChanged , tap } from 'rxjs/operators';

@Directive( {
	selector : '[appSvgLoader]'
} )

export class SvgLoaderDirective implements AfterViewInit , OnChanges , OnDestroy {

	@Input( 'appSvgLoader' ) name : string;

	@Input() pack : string;

	private readonly SVG_LOADER = new Subject<string>();

	private subscription = new Subscription();

	private contentNone    = '<g><path d="m472 297.789c4.418 0 8-3.582 8-8v-251.29c0-17.645-14.355-32-32-32h-416c-17.645 0-32 14.355-32 32v321c0 17.645 14.355 32 32 32h416c17.986 0 32-14.789 32-31.765v-26.235c0-4.418-3.582-8-8-8h-404.161c-4.418 0-8 3.582-8 8s3.582 8 8 8h396.161v18c0 8.822-7.178 16-16 16h-416c-8.822 0-16-7.178-16-16v-321c0-8.822 7.178-16 16-16h416c8.822 0 16 7.178 16 16v251.291c0 4.418 3.582 7.999 8 7.999z"/><path d="m354.377 457.86c-15.824-4.923-32.754-8.763-50.356-11.491l-9.319-33.081c-1.198-4.252-5.62-6.729-9.869-5.531-4.253 1.198-6.729 5.617-5.531 9.869l7.451 26.451c-29.921-3.312-61.613-3.532-93.505-.002l7.519-26.691c1.198-4.252-1.278-8.671-5.531-9.869-4.249-1.2-8.672 1.278-9.869 5.531l-9.387 33.322c-17.597 2.727-34.527 6.568-50.356 11.493-4.219 1.313-6.574 5.796-5.262 10.015s5.797 6.576 10.016 5.262c66.595-20.718 152.655-20.717 219.246 0 4.201 1.308 8.698-1.027 10.016-5.262 1.311-4.219-1.044-8.703-5.263-10.016z"/><path d="m157.985 164.482c3.126 3.125 8.189 3.124 11.314 0l10.006-10.006 10.006 10.006c3.126 3.125 8.189 3.124 11.314 0 3.124-3.124 3.124-8.189 0-11.313l-10.006-10.006 10.006-10.006c3.124-3.124 3.124-8.189 0-11.313-3.125-3.124-8.189-3.124-11.314 0l-10.006 10.006-10.005-10.008c-3.125-3.124-8.189-3.124-11.314 0-3.124 3.124-3.124 8.189 0 11.313l10.006 10.006-10.006 10.006c-3.125 3.125-3.125 8.191-.001 11.315z"/><path d="m322.015 121.842c-3.125-3.124-8.189-3.124-11.314 0l-10.006 10.006-10.006-10.006c-3.125-3.124-8.189-3.124-11.314 0-3.124 3.124-3.124 8.189 0 11.313l10.006 10.006-10.006 10.006c-3.124 3.124-3.124 8.189 0 11.313 3.126 3.125 8.189 3.124 11.314 0l10.006-10.006 10.006 10.006c3.126 3.125 8.189 3.124 11.314 0 3.124-3.124 3.124-8.189 0-11.313l-10.006-10.006 10.006-10.006c3.124-3.123 3.124-8.189 0-11.313z"/><path d="m184.908 257.209c5.383-5.281 25.262-22.51 55.092-22.51 7.541 0 33.801 1.624 55.092 22.511 3.145 3.085 8.211 3.054 11.313-.108 3.094-3.154 3.046-8.219-.108-11.313-35.954-35.271-95.043-36.841-132.594 0-3.154 3.094-3.202 8.159-.108 11.313 3.096 3.155 8.161 3.2 11.313.107z"/></g>';
	private contentLoading = '<circle cx="15" cy="15" r="15"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1"></animate></circle><circle cx="60" cy="15" r="15"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2"></animate></circle><circle cx="105" cy="15" r="15"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3"></animate></circle>';

	constructor(
		private httpClient : HttpClient ,
		private tagElement : ElementRef
	) {
		const observerLoader = this.SVG_LOADER.asObservable().pipe( debounceTime( 100 ) , distinctUntilChanged() , tap( () => this.tagElement.nativeElement.innerHTML = this.contentLoading ) , mergeMap( name => this.__getSvgFromLocal( name ) ) ).subscribe( {
			next  : content => this.__updateChangeView( content ) ,
			error : () => this.__updateChangeView( this.contentNone )
		} );
		this.subscription.add( observerLoader );
	}

	ngOnDestroy() : void {
		if ( this.subscription ) {
			this.subscription.unsubscribe();
		}
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'name' ] ) {
			this.__loadSvg( this.name );
		}
	}

	ngAfterViewInit() : void {
		this.__loadSvg( this.name );
	}

	private __loadSvg( name : string ) {
		if ( name ) {
			this.SVG_LOADER.next( name );
		}
	}

	private __updateChangeView( content : string ) {
		if ( content ) {
			const regex                             = new RegExp( '<\s*svg[^>]*>(.*?)<\s*/\s*svg>' , 'gim' );
			const match                             = content.replace( /(?:\r\n|\r|\n)/g , '' ).match( regex );
			const pureContent                       = match && match[ 0 ] ? match[ 0 ].slice( ( match[ 0 ].indexOf( '>' ) + 1 ) , -6 ) : null;
			this.tagElement.nativeElement.innerHTML = pureContent || this.contentNone;
		} else {
			this.tagElement.nativeElement.innerHTML = this.contentNone;
		}
	}

	private __getSvgFromLocal( name : string ) : Observable<string> {
		const path = this.pack ? 'assets/ovic_icons/' + this.pack : 'assets/ovic_icons';
		const url  = path + '/' + name + '.svg';
		return this.httpClient.get( url , {
			reportProgress : false ,
			responseType   : 'text' ,
			observe        : 'body'
		} );
	}
}
