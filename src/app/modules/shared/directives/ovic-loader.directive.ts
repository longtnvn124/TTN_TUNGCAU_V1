import { AfterViewInit , Directive , ElementRef , Input , OnChanges , SimpleChanges } from '@angular/core';

interface LoaderSettings {
	size? : string;
	color_1? : string;
	color_2? : string;
	overlay_color? : string;
	border_size? : string;
}

@Directive( {
	selector : '[ovicLoader]'
} )
export class OvicLoaderDirective implements AfterViewInit , OnChanges {

	@Input( 'ovicLoader' ) type : string;

	@Input() loaderSettings : LoaderSettings;

	private readonly layouts = {
		loader_01 : {
			render : () : HTMLElement => {

				const sectionTag     = document.createElement( 'section' );
				const div_spinner    = document.createElement( 'div' );
				const span_one       = document.createElement( 'span' );
				const span_two       = document.createElement( 'span' );
				const span_three     = document.createElement( 'span' );
				sectionTag.className = 'ovic-loader-wrapper ovic-loader__spinner-bounce-circle-dots';
				span_one.classList.add( 'bounce-one' );
				span_two.classList.add( 'bounce-two' );
				span_three.classList.add( 'bounce-three' );
				div_spinner.classList.add( 'spinner' );
				div_spinner.append( span_one );
				div_spinner.append( span_two );
				div_spinner.append( span_three );
				sectionTag.append( div_spinner );
				const value = this.loaderSettings && this.loaderSettings[ 'overlay_color' ] ? this.loaderSettings[ 'overlay_color' ] : '';
				if ( value ) {
					sectionTag.style.setProperty( '--ovic-loader-overlay_color' , value );
				}
				return sectionTag;
			}
		} ,
		loader_02 : {
			render : () : HTMLElement => this.__circleLoading( 2 , { size : '' , border_size : '5px' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_03 : {
			render : () : HTMLElement => this.__circleLoading( 3 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_04 : {
			render : () : HTMLElement => this.__circleLoading( 4 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_05 : {
			render : () : HTMLElement => this.__circleLoading( 5 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' } )
		} ,
		loader_06 : {
			render : () : HTMLElement => this.__circleLoading( 6 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_07 : {
			render : () : HTMLElement => this.__circleLoading( 7 , { size : '' , border_size : '2px' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_08 : {
			render : () : HTMLElement => this.__circleLoading( 8 , { size : '' , border_size : '2px' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_09 : {
			render : () : HTMLElement => this.__circleLoading( 9 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_10 : {
			render : () : HTMLElement => this.__circleLoading( 10 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_11 : {
			render : () : HTMLElement => this.__circleLoading( 11 , { size : '' , border_size : '' , overlay_color : '' , color_2 : '' , color_1 : '' } )
		} ,
		loader_12 : {
			render : () : HTMLElement => this.__circleLoading( 12 , { size : '' , border_size : '5px' , overlay_color : '' , color_1 : '' } )
		} ,
		loader_13 : {
			render : () : HTMLElement => this.__circleLoading( 13 , { size : '' , border_size : '5px' , overlay_color : '' , color_1 : '' } )
		} ,
		loader_14 : {
			render : () : HTMLElement => this.__circleLoading( 14 , { overlay_color : '' , color_1 : '' } )
		} ,
		loader_15 : {
			render : () : HTMLElement => this.__circleLoading( 15 , { size : '' , overlay_color : '' , color_1 : '' } )
		} ,
		loader_16 : {
			render : () : HTMLElement => this.__circleLoading( 16 , { size : '' , overlay_color : '' , color_1 : '' } )
		} ,
		loader_17 : {
			render : () : HTMLElement => this.__circleLoading( 17 , { overlay_color : '' , color_1 : '' } )
		}
	};

	constructor( private tagElement : ElementRef ) {}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'type' ] ) {
			this.updateChangeView( this.type );
		}
	}

	ngAfterViewInit() : void {
		this.updateChangeView( this.type );
	}

	updateChangeView( type : string ) {
		const loader = this.tagElement.nativeElement.querySelectorAll( '.ovic-loader-wrapper' );
		if ( loader && loader.length ) {
			loader.forEach( elm => elm.remove() );
		}
		if ( !!( type ) ) {
			if ( this.layouts.hasOwnProperty( type ) ) {
				this.tagElement.nativeElement.append( this.layouts[ type ].render() );
			} else {
				this.tagElement.nativeElement.append( this.layouts.loader_01.render() );
			}
		}
	}

	private __circleLoading( type : number , options : LoaderSettings = null ) : HTMLElement {
		const sectionTag     = document.createElement( 'section' );
		const span           = document.createElement( 'span' );
		sectionTag.className = 'ovic-loader-wrapper';
		span.classList.add( 'ovic-loader--layout-' + type.toString( 10 ).padStart( 2 , '0' ) );
		sectionTag.append( span );
		if ( options ) {
			Object.keys( options ).forEach( k => {
				const value = this.loaderSettings && this.loaderSettings[ k ] ? this.loaderSettings[ k ] : options[ k ];
				if ( value ) {
					sectionTag.style.setProperty( '--ovic-loader-' + k , value );
				}
			} );
		}
		return sectionTag;
	}
}
