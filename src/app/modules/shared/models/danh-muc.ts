import {OvicFile} from "@core/models/file";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";

export interface DmChung {
  is_deleted: number; //1: deleted; 0: not deleted
  deleted_by: number;
  created_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
}

export interface DmLinhVuc extends DmChung {
  id: number;
  ten: string;
  kyhieu: string;// viet tat
  mota: string;
  status: number; //1 Active; 0: inactive
}


export interface DmLoaiNguLieu extends DmChung {
  id: number;
  ten: string;
  mota: string;
  donvi_id: number;
  kyhieu: LoaiNguLieu;
  status: number; //1 Active; 0: inactive
}

export interface DmChuyenMuc extends DmChung {
  id: number;
  ten: string;
  mota: string;
  status: number; //1 Active; 0: inactive
}

export interface DmNhanVatLichSu extends DmChung {
  id: number;
  ten: string;
  bietdanh: string;
  mota: string;
  nam: string;
  gioitinh: number;
  files: OvicFile;
}

export interface DmDiemDiTich extends DmChung {
  id: number;
  ten: string;
  mota: string;
  ds_ngulieu: Ngulieu[];
  status: number; //1 Active; 0: inactive
  toado:string;
}


export interface DonVi {
  id: number;
  title: string;
  parent_id: number; //Đơn vị cấp trên ID
  description: string;
  status: number; //1 Active; 0: inactive
}


export const KieuDuLieuNguLieu: { label: string, value: LoaiNguLieu }[] = [
  {label: 'Hình ảnh', value: 'image'},
  {label: 'Video', value: 'video'},
  {label: 'Âm thanh', value: 'audio'},
  {label: 'Video 360', value: 'video360'},
  {label: 'Hình ảnh 360', value: 'image360'},
  {label: 'Text', value: 'text'},
  {label: 'Tài liệu', value: 'others'},
];

export type LoaiNguLieu = 'image' | 'video' | 'audio' | 'video360' | 'image360' | 'text' | 'others'
