import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {OvicVrPointType} from "@shared/models/sceneVr";
import {OvicFile} from "@core/models/file";

export interface Pinable {
  id: number;
  icon: string;
  title: string;
  mota: string;
  location: number[]; // vi tri vector3
  type: OvicVrPointType,
  parent_id: number; //ngulieu_id
  donvi_id: number;
  ds_ngulieu: Ngulieu[]; //danh sách audio | hảnh 360 | video360 ;
  ngulieu_id?:number;
  file_media?:OvicFile[];
  file_audio?:OvicFile[];
}

export interface Point extends Pinable {
  // ds_file:OvicFile[];
  root: number;
  toado_map: string;
  ditich_id: number;// thay thế parent_id
  is_deleted: number; //1: deleted; 0: not deleted
  deleted_by: number;
  created_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
}




