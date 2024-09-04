import { OvicFile } from "@core/models/file";

export interface PhongTrao {
  id: number;
  ten_phongtrao: number; //đơn vị tạo ra quyết định này (chỉ đơn vị tạo ra quyết định này mới nhìn thấy; nhìn thấy các quyết định của đơn vị khác nếu đơn vị mình được add vào danh mục các đơn vị có cá nhân, tập thể dc khen)		Change Change	Drop Drop
  mota: string;
  loaihinh_thidua: string;
  thoihan_dangky: string;
  donvi_id: string;
  files: OvicFile[];
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
  is_deleted: 0 | 1;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  status: number; //
  tongso_canhan: number; //
  tongso_tapthe: number; //
}

export interface PhongTraoDangKy {
  id: number;
  phongtrao_id: number; //đơn vị tạo ra quyết định này (chỉ đơn vị tạo ra quyết định này mới nhìn thấy; nhìn thấy các quyết định của đơn vị khác nếu đơn vị mình được add vào danh mục các đơn vị có cá nhân, tập thể dc khen)		Change Change	Drop Drop
  donvi_id: number;
  tendonvi: string;
  donvi_phongban_id: number;
  tendonvi_phongban: string;
  loaidoituong: string;
  ten_doituong: string;
  doituong_id: number;
  created_by: number;
  deleted_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
  is_deleted: 0 | 1;
}


export interface SangKien {
  id: number;
  ten_sangkien: string;
  mota: string;
  linhvuc: string;
  so_quyetdinh: string;
  ngayky_quyetdinh: string;
  cap_congnhan: string;
  files: OvicFile[];
  donvi_id: number;
  created_by: number;
  deleted_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
  is_deleted: 0 | 1;
}

export interface SangKienThanhVien {
  id: number;
  sangkien_id: number;
  ten_thanhvien: string;
  thanhvien_id: number;
  tendonvi: string;
  donvi_phongban_id: number;
  tendonvi_phongban: string;
  donvi_id: number;
  created_by: number;
  deleted_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
  is_deleted: 0 | 1;
}
