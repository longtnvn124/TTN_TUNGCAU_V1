import { Component , OnInit } from '@angular/core';
import { DropdownOptions } from '@shared/models/dropdown-options';
import { UnsubscribeOnDestroy } from '@core/utils/decorator';
import { debounceTime , distinctUntilChanged , Subject , Subscription } from 'rxjs';

@UnsubscribeOnDestroy()
@Component( {
	selector    : 'app-new-home' ,
	templateUrl : './new-home.component.html' ,
	styleUrls   : [ './new-home.component.css' ]
} )
export class NewHomeComponent implements OnInit {

	departments : DropdownOptions[] = [
		{ name : 'Khoa Công nghệ thông tin' , value : '100' , key : 'donvi_id' } ,
		{ name : 'Khoa Điện tử viễn thông' , value : '101' , key : 'donvi_id' } ,
		{ name : 'Khoa Công nghệ Tự động hóa' , value : '102' , key : 'donvi_id' } ,
		{ name : 'Khoa Tin học kinh tế' , value : '103' , key : 'donvi_id' }
	];
	selectedDepartment : DropdownOptions;

	years : DropdownOptions[] = [
		{ name : '2018' , value : '2018' , key : 'namhoc' } ,
		{ name : '2019' , value : '2019' , key : 'namhoc' } ,
		{ name : '2020' , value : '2020' , key : 'namhoc' } ,
		{ name : '2021' , value : '2021' , key : 'namhoc' } ,
		{ name : '2022' , value : '2022' , key : 'namhoc' } ,
		{ name : '2023' , value : '2023' , key : 'namhoc' }
	];
	selectedYear : DropdownOptions;

	semesters : DropdownOptions[] = [
		{ name : 'Học kỳ 1' , value : '1' , key : 'hocky' } ,
		{ name : 'Học kỳ 2' , value : '2' , key : 'hocky' } ,
		{ name : 'Học kỳ 3' , value : '3' , key : 'hocky' } ,
		{ name : 'Cả năm' , value : '4' , key : 'hocky' }
	];
	selectedSemester : DropdownOptions;

	subscription = new Subscription();

	searchText = '';

	private readonly OBSERVER_SEARCH_DATA = new Subject();

	private readonly OBSERVER_ON_TYPE_SEARCH_TEXT = new Subject<string>();

	constructor() {
	}

	ngOnInit() : void {
		const observeSearchData = this.OBSERVER_SEARCH_DATA.asObservable().pipe( debounceTime( 200 ) ).subscribe( () => this.search() );
		this.subscription.add( observeSearchData );

		const observeTypeSearchText = this.OBSERVER_ON_TYPE_SEARCH_TEXT.asObservable().pipe( debounceTime( 500 ) , distinctUntilChanged() ).subscribe( () => this.search() );
		this.subscription.add( observeTypeSearchText );
	}

	searching() {
		this.OBSERVER_SEARCH_DATA.next( '' );
	}

	search() {
		const query = [ { key : 'search_text' , value : this.searchText } , this.selectedDepartment , this.selectedYear , this.selectedSemester ].map( ( { key , value } ) => key + '=' + value ).join( '&' );
		console.log( query );
	}

	onTypeSearchText() {
		this.OBSERVER_ON_TYPE_SEARCH_TEXT.next( this.searchText );
	}
}
