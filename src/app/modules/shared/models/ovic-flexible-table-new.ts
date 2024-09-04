import { OvicMenu } from '@shared/models/ovic-flexible-table';

export interface OvicFlexibleTableNewHeadSearch {
	enable : boolean;
	placeholder? : string;
	button? : string;
}

export interface OvicFlexibleTableNewHeadButton {
	label : string;
	name : string;
	icon? : string;
	class? : string;
}

export interface OvicFlexibleTableNewColumnMenuCondition {
	field : string;
	value : any;
	equal : '>' | '>=' | '=' | '<' | '<=' | '!';
}

export interface OvicFlexibleTableNewColumnMenu {
	label : string;
	slug : string;
	icon? : string;
	class? : string;
	conditions? : {
		display? : OvicFlexibleTableNewColumnMenuCondition,
		hide? : OvicFlexibleTableNewColumnMenuCondition,
	},
	child? : OvicFlexibleTableNewColumnMenu[];
	separator? : boolean;
}

export interface OvicFlexibleTableNewColumn {
	label : string; // head text
	field : string;
	menu? : OvicFlexibleTableNewColumnMenu[];
	innerHtml? : boolean;
	width? : string;
	headClass? : string;
	columnClass? : string;
	isFixed? : boolean;
}


export interface OvicFlexibleTableState {
	isInit : boolean;
	error : boolean;
	isEmpty : boolean;
	isLoading : boolean;
}
