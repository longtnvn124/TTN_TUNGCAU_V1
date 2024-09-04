import { Component , OnInit , Input , OnChanges , SimpleChanges , Output , EventEmitter } from '@angular/core';

interface OvicNavElement {
	page : number;
	isActive : boolean;
	class : string;
	type : 'button' | 'span';
	title : string;
}

export interface OvicNavigator {
	navs : OvicNavElement[];
	lastsPage : number;
}

@Component( {
	selector    : 'ovic-navigation' ,
	templateUrl : './ovic-navigation.component.html' ,
	styleUrls   : [ './ovic-navigation.component.css' ]
} )
export class OvicNavigationComponent implements OnInit , OnChanges {

	constructor() {}

	@Input() total : number;

	@Input() limit : number;

	@Input() currentPageIndex : number;

	@Output() onChangePageIndex = new EventEmitter<number>();

	pageIndex = 1;

	navigator : OvicNavigator = {
		navs      : [] ,
		lastsPage : 0
	};

	private static buildNavigations( total : number , limit : number , currentPageIndex : number ) : OvicNavigator {
		const navigations : OvicNavigator = {
			navs      : [] ,
			lastsPage : 0
		};
		if ( total <= limit ) {
			return navigations;
		}
		const max_index       = Math.ceil( total / limit );
		navigations.lastsPage = max_index;
		navigations.navs.push( {
			page     : currentPageIndex > 1 ? currentPageIndex - 1 : 1 ,
			isActive : currentPageIndex <= 1 ,
			class    : 'prev-elm' ,
			type     : 'button' ,
			title    : '«'
		} );
		if ( max_index < 5 ) {
			for ( let pageNum = 1 ; pageNum <= max_index ; pageNum++ ) {
				const elmClass = pageNum === currentPageIndex ? 'elm active show' : 'elm show';
				navigations.navs.push( {
					page     : pageNum ,
					isActive : pageNum === currentPageIndex ,
					class    : elmClass ,
					type     : 'button' ,
					title    : pageNum.toString()
				} );
			}
		} else if ( currentPageIndex <= 3 ) {
			/*Case max page > 5 & currentPageIndex <= 3 ---> show : 1 | 2 | 3 | 4 | 5 | last*/
			for ( let pageNum = 1 ; pageNum < 5 ; pageNum++ ) {
				navigations.navs.push( {
					page     : pageNum ,
					isActive : pageNum === currentPageIndex ,
					class    : pageNum === currentPageIndex ? 'elm active' : 'elm' ,
					type     : 'button' ,
					title    : pageNum.toString()
				} );
			}
			navigations.navs.push( {
				page     : max_index ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'span' ,
				title    : '...'
			} );

			navigations.navs.push( {
				page     : max_index ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : ( max_index ).toString()
			} );
		} else if ( currentPageIndex > 3 && currentPageIndex < max_index - 2 ) {
			/* Case max page > 5 & currentPageIndex > 3 && currentPageIndex <= lastItem - 2
			 * first | active - 2 | active - 1 | active | active + 1 | active + 2 | last
			 * */

			navigations.navs.push( {
				page     : 1 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : '1'
			} );
			navigations.navs.push( {
				page     : 1 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'span' ,
				title    : '...'
			} );
			navigations.navs.push( {
				page     : currentPageIndex - 2 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : ( currentPageIndex - 2 ).toString()
			} );
			navigations.navs.push( {
				page     : currentPageIndex - 1 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : ( currentPageIndex - 1 ).toString()
			} );
			navigations.navs.push( {
				page     : currentPageIndex ,
				isActive : true ,
				class    : 'elm active' ,
				type     : 'button' ,
				title    : currentPageIndex.toString()
			} );
			navigations.navs.push( {
				page     : currentPageIndex + 1 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : ( currentPageIndex + 1 ).toString()
			} );
			navigations.navs.push( {
				page     : currentPageIndex + 2 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : ( currentPageIndex + 2 ).toString()
			} );
			navigations.navs.push( {
				page     : max_index ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'span' ,
				title    : '...'
			} );
			navigations.navs.push( {
				page     : max_index ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : ( max_index ).toString()
			} );
		} else {
			/* Case max page > 5 currentPageIndex >= lastItem - 2 */
			/*  first | last - 4 | last - 3 | last - 2 | last - 1 | last*/
			navigations.navs.push( {
				page     : 1 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'button' ,
				title    : '1'
			} );
			navigations.navs.push( {
				page     : 1 ,
				isActive : false ,
				class    : 'elm' ,
				type     : 'span' ,
				title    : '...'
			} );
			navigations.navs.push( {
				page     : max_index - 3 ,
				isActive : max_index - 3 === currentPageIndex ,
				class    : max_index - 3 === currentPageIndex ? 'elm active' : 'elm' ,
				type     : 'button' ,
				title    : ( max_index - 3 ).toString()
			} );
			navigations.navs.push( {
				page     : max_index - 2 ,
				isActive : max_index - 2 === currentPageIndex ,
				class    : max_index - 2 === currentPageIndex ? 'elm active' : 'elm' ,
				type     : 'button' ,
				title    : ( max_index - 2 ).toString()
			} );
			navigations.navs.push( {
				page     : max_index - 1 ,
				isActive : max_index - 1 === currentPageIndex ,
				class    : max_index - 1 === currentPageIndex ? 'elm active' : 'elm' ,
				type     : 'button' ,
				title    : ( max_index - 1 ).toString()
			} );
			navigations.navs.push( {
				page     : max_index ,
				isActive : max_index === currentPageIndex ,
				class    : max_index === currentPageIndex ? 'elm active' : 'elm' ,
				type     : 'button' ,
				title    : max_index.toString()
			} );
		}

		if ( currentPageIndex === max_index ) {
			navigations.navs.push( {
				page     : max_index ,
				isActive : true ,
				class    : 'next-elm' ,
				type     : 'span' ,
				title    : '»'
			} );
		} else {
			navigations.navs.push( {
				page     : 1 + currentPageIndex ,
				isActive : false ,
				class    : 'next-elm' ,
				type     : 'button' ,
				title    : '»'
			} );
		}
		return navigations;
	}

	ngOnInit() : void {
		this.pageIndex = this.currentPageIndex;
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'total' ] || changes[ 'limit' ] || changes[ 'currentPageIndex' ] ) {
			if ( this.total < 1 || this.limit < 1 || this.currentPageIndex < 1 ) {
				return;
			}
			this.pageIndex = this.currentPageIndex;
			this.navigator = OvicNavigationComponent.buildNavigations( this.total , this.limit , this.pageIndex );
		}
	}

	navClick( pageNumber : number ) {
		this.pageIndex = pageNumber;
		this.navigator = OvicNavigationComponent.buildNavigations( this.total , this.limit , this.pageIndex );
		this.onChangePageIndex.emit( pageNumber );
	}

}
