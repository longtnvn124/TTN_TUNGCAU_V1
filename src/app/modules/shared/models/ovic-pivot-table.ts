export interface OvicPivotTableSettings {
	heading : string; // the table's title
	button : HeadButton[];
	configs : OvicPivotColumn[];
}

interface HeadButton {
	label : string;
	name : string;
	icon : string;
	class : string;
	isRightPosition? : boolean;
}

export interface OvicPivotColumn {
	label : string; // head text
	field : string;
	menu? : OvicPivotColumnMenu[];
	innerHtml? : boolean;
	width? : string;
	headClass? : string;
	columnClass? : string;
	isPivot? : boolean;
	isRightPosition? : boolean;
}

export interface OvicPivotColumnMenu {
	label : string;
	slug : string;
	icon? : string;
	class? : string;
	checker? : ( data : any ) => {};
	child? : OvicPivotColumnMenu[];
}
