export interface SideFilterSettings {
	field : string;
	type : 'input-text' | 'input-number' | 'select' | 'slider';
	css? : string;
	multiple? : boolean; // for select and slider type
	dropdownSearch? : boolean; // for select type
	options : { value : string, label : string }[];
	slideOptions : {
		min : number;
		max : number;
		step : number;
	};
}

interface FilterDropdownOption {
	value : string,
	label : string;
}
