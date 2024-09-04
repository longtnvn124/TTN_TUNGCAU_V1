export interface DataPermission {
	id : number;
	user_donvi_id : number // id đơn vị của user
	user_id : number,
	donvi_id : number, // id đơn vị mà user được phân quyền
	created_by : number,
	created_at : string,
	updated_at : string,
}

export interface DataPermissionAdvance extends DataPermission {
	employee? : ExpertStaff;
}

export interface ExpertStaff {
	id : number;
	avatar : string;
	display_name : string;
	phone : string;
}
