import { Component , OnInit } from '@angular/core';
import { ICONS , ICONS_ARROW_COLLECTION_PACK , ICONS_E_LEARNING_PACK , ICONS_SCHOOL_PACK } from '../ultils/ultils';
import { debounceTime , Subscription } from 'rxjs';
import { FormBuilder , FormGroup } from '@angular/forms';
import { distinctUntilChanged , map , tap } from 'rxjs/operators';
import { UnsubscribeOnDestroy } from '@core/utils/decorator';
import { NotificationService } from '@core/services/notification.service';

interface IconElement {
	icon : string;
	name : string;
	viewBox : string;
	pack : string;
	width : string;
	height : string;
}

@Component( {
	selector    : 'app-show-svg' ,
	templateUrl : './show-svg.component.html' ,
	styleUrls   : [ './show-svg.component.css' ]
} )
@UnsubscribeOnDestroy()
export class ShowSvgComponent implements OnInit {

	data : IconElement[] = [];

	processedData : IconElement[];

	subscriptions = new Subscription();

	form : FormGroup;

	isLoading = false;

	constructor(
		private fb : FormBuilder ,
		private notificationService : NotificationService
	) {
		this.form     = this.fb.group( { s : [ '' ] } );
		const search$ = this.form.get( 's' ).valueChanges.pipe(
			tap( () => this.isLoading = true ) ,
			debounceTime( 200 ) ,
			distinctUntilChanged() ,
			map( s => s ? this.data.filter( i => i.name.search( s.toLowerCase() ) !== -1 ) : this.data )
		).subscribe(
			processedData => {
				this.isLoading     = false;
				this.processedData = processedData;
			}
		);

		this.subscriptions.add( search$ );

		const icons = ICONS.map( svg => {
			return {
				icon    : `../../../../assets/ovic_icons/${ svg }` ,
				name    : svg.replace( '.svg' , '' ) ,
				pack    : null ,
				viewBox : '0 0 512 512' ,
				width   : '512' ,
				height  : '512'
			};
		} );

		ICONS_SCHOOL_PACK.icons.forEach( icon => icons.push( {
			icon    : `../../../../assets/ovic_icons/${ ICONS_SCHOOL_PACK.slug }/${ icon }` ,
			name    : icon.replace( '.svg' , '' ) ,
			pack    : ICONS_SCHOOL_PACK.slug ,
			viewBox : ICONS_SCHOOL_PACK.viewBox ,
			width   : ICONS_SCHOOL_PACK.width ,
			height  : ICONS_SCHOOL_PACK.height
		} ) );

		ICONS_E_LEARNING_PACK.icons.forEach( icon => icons.push( {
			icon    : `../../../../assets/ovic_icons/${ ICONS_E_LEARNING_PACK.slug }/${ icon }` ,
			name    : icon.replace( '.svg' , '' ) ,
			pack    : ICONS_E_LEARNING_PACK.slug ,
			viewBox : ICONS_E_LEARNING_PACK.viewBox ,
			width   : ICONS_E_LEARNING_PACK.width ,
			height  : ICONS_E_LEARNING_PACK.height
		} ) );

		ICONS_ARROW_COLLECTION_PACK.icons.forEach( icon => icons.push( {
			icon    : `../../../../assets/ovic_icons/${ ICONS_ARROW_COLLECTION_PACK.slug }/${ icon }` ,
			name    : icon.replace( '.svg' , '' ) ,
			pack    : ICONS_ARROW_COLLECTION_PACK.slug ,
			viewBox : ICONS_ARROW_COLLECTION_PACK.viewBox ,
			width   : ICONS_ARROW_COLLECTION_PACK.width ,
			height  : ICONS_ARROW_COLLECTION_PACK.height
		} ) );

		this.data = icons;
	}

	ngOnInit() : void {
		this.form.get( 's' ).setValue( '' );
	}

	copySvgElement( icon : IconElement ) {
		const paths = [ '<svg' , 'appSvgLoader="' + icon.name + '"' ];
		[ 'pack' , 'width' , 'height' , 'viewBox' ].forEach( attr => {
			if ( icon[ attr ] ) {
				paths.push( `${ attr }="${ icon[ attr ] }"` );
			}
		} );
		paths.push( '></svg>' );

		navigator.clipboard.writeText( paths.join( ' ' ) ).then( () => this.notificationService.toastSuccess( icon.name , 'Copy successful' ) );
		//navigator.clipboard.writeText( `<svg appSvgLoader="${ icon.name }" width="512" height="512" viewBox="0 0 512 512"></svg>` ).then( () => this.notificationService.toastSuccess( icon.name , 'Copy successful' ) );
	}

}
