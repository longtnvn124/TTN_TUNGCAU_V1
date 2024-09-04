import {OvicFile} from "@core/models/file";
import {LoaiNguLieu} from "@shared/models/danh-muc";

export interface NguLieuChung {
  id: number;
  title: string;
  mota: string;
  is_deleted: number; //1: deleted; 0: not deleted
  deleted_by: number;
  created_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
}

export interface Ngulieu extends NguLieuChung {
  loaingulieu: LoaiNguLieu;
  linhvuc: number;
  chuyenmuc: number;
  diemditich_ids: number[];
  donvi_id: number;
  file_media?: OvicFile[];
  file_audio?: OvicFile[];
  file_thumbnail?:OvicFile;
  file_product?:OvicFile[];
  root:number;
  file_type:0|1; // 0:bientap,1:file đóng gói
}

export interface SuKien extends NguLieuChung {
  diemditich_ids: number[];
  thoigian_batdau: string;
  thoigian_ketthuc: string;
  files: OvicFile;
  nhanvat_ids: number[];
  donvi_id: number;
  ngulieu_ids: NguLieuSuKien[];
  file_audio:OvicFile[];
  linhvuc:number;
  root:1|0;
}

export interface NguLieuSuKien {
  id: number;
  title: string;
  file_media: OvicFile;
}
