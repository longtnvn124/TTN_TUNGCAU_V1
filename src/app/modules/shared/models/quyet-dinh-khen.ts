import { SimpleFileLocal } from '@core/models/file';

export interface QuyetDinhKhen {
	id : number;
	donvi_id : number; //đơn vị tạo ra quyết định này (chỉ đơn vị tạo ra quyết định này mới nhìn thấy; nhìn thấy các quyết định của đơn vị khác nếu đơn vị mình được add vào danh mục các đơn vị có cá nhân, tập thể dc khen)		Change Change	Drop Drop
	ten : string;
	mota : string;
	soquyetdinh : string;
	soquyetdinh_slug : string;
	ngayky : string;
	ngayhieuluc : string;
	nguoiky : string;
	chucvu_nguoiky : string;
	cap_khen : string; // lấy từ trong danh mục (COSO | TINH | BO | NC)
	loaihinh_khen : string; // lấy từ trong danh mục (THUONGXUYEN; CHUYENDE; DOTXUAT; THANHTICH_DOINGOAI; HOGIADINH;)
	files : SimpleFileLocal[];
	status : number;
	blocked_update : number; // 1 : không được update | 0 : được update
	is_approved : number;
	approved_by : number;
	approved_person : string;
	is_deleted : number;
	deleted_by : number;
	created_by : number;
	updated_by : number;
	created_at : string; // sql timestamp
	updated_at : string; // sql timestamp
}

export const TRANG_THAI_QUYET_DINH_KHEN = [
	{ value : 0 , label : 'Hết hiệu lực' , color : '<span class="badge badge--size-normal badge-danger w-100">Hết hiệu lực</span>' } ,
	{ value : 1 , label : 'Đang hiệu lực' , color : '<span class="badge badge--size-normal badge-success w-100">Đang hiệu lực</span>' }
];

// export const REGEX_MATCH_SO_QUYET_DINH : RegExp = /^[\d+\/]*\d+[ĂăÂâĐđÊêÔôƠơƯưA-Za-z&]*\/[ĂăÂâĐđÊêÔôƠơƯưA-Za-z]+-[ĂăÂâĐđÊêÔôƠơƯưA-Za-z&]+$/;
export const REGEX_MATCH_SO_QUYET_DINH : RegExp = /^[\d+\/]*\d+[ĂăÂâĐđÊêÔôƠơƯưA-Za-z&\-]*\/[ĂăÂâĐđÊêÔôƠơƯưA-Za-z]+-[ĂăÂâĐđÊêÔôƠơƯưA-Za-z&]+$/;

export interface QuyetDinhKhenCaNhan {
	id : number;
	quyetdinh_id : number;
	canhan_id : number;
	hoten : string;
	ten : string;
	namsinh : number;
	donvi_id : number; //lưu id của đơn vị tại thời điểm được khen ==> phục vụ thống kê khi cá nhân chuyển công tác
	ten_donvi : string;
	chucvu_duongnhiem : string;
	dhtd_htkt_id : number;
	dhtd_htkt_ten : string;
	cap_khen : string;
	namkhen : number;
	tienthuong : number;
	hienvat : string;
	files : SimpleFileLocal[];
	status : number;
	is_approved : number;
	approved_by : number;
	is_deleted : number; //1: deleted; 0: not deleted
	deleted_by? : number;
	created_by : number;
	updated_by? : number;
	created_at? : string; // sql timestamp
	updated_at? : string; // sql timestamp
}

export interface QuyetDinhKhenTapThe {
	id : number;
	quyetdinh_id : number;
	tapthe_id : number;
	ten_tapthe : string;
	donvi_id : number;
	dhtd_htkt_id : number;
	dhtd_htkt_ten : string;
	cap_khen : string;
	tienthuong : number;
	hienvat : string;
	namkhen : number;
	files : SimpleFileLocal[];
	status : number;
	is_approved : number;
	approved_by : number;
	is_deleted : number; //1: deleted; 0: not deleted
	deleted_by : number;
	created_by : number;
	updated_by : number;
	created_at : string; // sql timestamp
	updated_at : string; // sql timestamp
}

export interface QuyetDinhKhenDonVi {
	id : number;
	quyetdinh_id : number;
	donvi_id : number;
	sotheodoi_id : number;
	is_approved : number;
	approved_by : number;
	is_deleted : number; //1: deleted; 0: not deleted
	deleted_by : number;
	created_by : number;
	updated_by : number;
	created_at : string; // sql timestamp
	updated_at : string; // sql timestamp
}
