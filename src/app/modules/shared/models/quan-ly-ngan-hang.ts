import {OvicFile} from "@core/models/file";

export interface ThongTinChung {
  is_deleted: number; //1: deleted; 0: not deleted
  deleted_by: number;
  created_by: number;
  updated_by: number;
  created_at: string; // sql timestamp
  updated_at: string; // sql timestamp
}

export interface NganHangDe extends ThongTinChung {
  id: number;
  title: string;
  desc: string;
  total: number;//tổng số câu hỏi trong ngân hàng đề
  number_questions_per_test: number;// số câu hỏi trong 1 đề
  time_per_test: number;
  count: number;
}



export interface NganHangCauHoi extends ThongTinChung {
  id: number;
  title: string;
  bank_id: number;
  answer_options: AnswerOption[];
  correct_answer: number[];
  total_used: number;
  multiple: number;
  options_sty:number; //1: 1 cột, 2: 2 cột, 3:3 cột
  random_question:number; //0
}


export type AnswerOption = { id: number, value: string, type_input?:1|0,file?:OvicFile  };
