export interface ThongTinChung {
  id: number;
  is_deleted: number; //1: deleted; 0: not deleted
  deleted_by: number;
  created_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
}

export interface Shift extends ThongTinChung {
  title: string;
  bank_id: number;
  name: string;
  desc: string;
  time_start: string;
  time_end: string;
  status: number;
}

export interface ShiftTests extends ThongTinChung {
  thisinh_id: number;
  shift_id: number;
  details: detail;
  time_start: string;
  time_end: string;
  time: number;
  question_ids: [];//array danh sách quesion sau khi random
  number_correct: number;//số câu trả lời đúng
  score: number;//điểm hệ số 10
  state: 0 | 1 | 2 | -1;//0: chưa thi 1:đang thi 2:đã thi xong -1:bỏ thi
}

export const statusOptions = [
  {
    value: 0,
    label: 'Kết thúc',
    color: '<span class="badge badge--size-normal badge-danger w-100">Kết thúc</span>'
  },
  {
    value: 1,
    label: 'Đang diễn ra',
    color: '<span class="badge badge--size-normal badge-success w-100">Đang diễn ra</span>'
  }
];
export type detail={[T: number]: number[] };

