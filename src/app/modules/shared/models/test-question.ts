export interface Question {
  question_direction: string; // nội dung câu hỏi
  question_type: string; // Loại câu hỏi
  answer_option: Answers[]; //
  answer_correct?: string[];
  group_id: number; // là parent_id
  media?: MEDIA;
  part?: number;
  cdr?: number; //Chuẩn đầu ra
  question_number?: number;//
  code?: string; // mã đề;
  config?: Config;
  children:Question[];
}
export interface Answers {
  id: number;
  value: string; // <img src="96541" source >
}

export interface MEDIA {
  type: string; // image | audio | video
  source: string;
  path: string;
  replay: number;
}

export interface Config {
  cols: 1 | 2 | 3 | 4;
  invertedAnswer: boolean;
}
