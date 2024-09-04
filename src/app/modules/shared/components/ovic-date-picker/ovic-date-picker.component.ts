import { Component , OnInit , Input , Output , EventEmitter } from '@angular/core';

@Component( {
	selector    : 'ovic-date-picker' ,
	templateUrl : './ovic-date-picker.component.html' ,
	styleUrls   : [ './ovic-date-picker.component.css' ]
} )
export class OvicDatePickerComponent implements OnInit {

	constructor() {
	}

	@Input()
	dateFormat : string;

	@Input()
	inputName : string;

	@Input()
	label : string;

	@Input()
	showTime : boolean;

	@Input()
	hourFormat : string;

	@Input()
	locale : any;

	@Input()
	placeholder : string;

	@Output()
	onChange = new EventEmitter<any>();

	value : Date;

	ngOnInit() : void {
		if ( !this.dateFormat ) {
			this.dateFormat = 'dd/mm/yy';
		}
		if ( !this.hourFormat ) {
			this.hourFormat = '12';
		}
		if ( !this.locale ) {
			this.locale = {
				firstDayOfWeek  : 1 ,
				dayNames        : [ 'Chủ nhật' , 'Thứ hai' , 'Thứ ba' , 'Thứ tư' , 'Thứ năm' , 'Thứ sáu' , 'Thứ bảy' ] ,
				dayNamesShort   : [ 'cn' , '2' , '3' , '4' , '5' , '6' , '7' ] ,
				dayNamesMin     : [ 'cn' , 'T2' , 'T3' , 'T4' , 'T4' , 'T6' , 'T7' ] ,
				monthNames      : [ 'Tháng 1' , 'Tháng 2' , 'Tháng 3' , 'Tháng 4' , 'Tháng 5' , 'Tháng 6' , 'Tháng 7' ,
									'Tháng 8' , 'Tháng 9' , 'Tháng 10' , 'Tháng 11' , 'Tháng 12' ] ,
				monthNamesShort : [ '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , '11' , '12' ] ,
				today           : 'Hôm nay' ,
				clear           : 'Xóa' ,
				dateFormat      : this.dateFormat ,
				weekHeader      : 'Wk'
			};
		}
	}

	input( event ) {
		if ( this.value && Date.parse( this.value.toString() ) ) {
			this.formatDate( this.value );
		} else {
			this.onChange.emit( '' );
		}
	}

	change( event ) {
		this.formatDate( event );
	}

	formatDate( strDate ) {
		const dateSelected = new Date( strDate );
		const dd           = dateSelected.getDate();
		const mm           = dateSelected.getMonth() + 1;
		const yyyy         = dateSelected.getFullYear();
		let formated       = '';
		if ( dd < 10 ) {
			formated = '0' + dd.toString();
		} else {
			formated = dd.toString();
		}
		if ( mm < 10 ) {
			formated += '/0' + mm.toString();
		} else {
			formated += '/' + mm.toString();
		}
		formated += '/' + yyyy.toString();
		this.onChange.emit( formated );
	}

}
