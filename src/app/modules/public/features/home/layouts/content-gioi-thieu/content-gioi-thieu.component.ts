import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-content-gioi-thieu',
  templateUrl: './content-gioi-thieu.component.html',
  styleUrls: ['./content-gioi-thieu.component.css']
})
export class ContentGioiThieuComponent implements OnInit {
 @Input() padding_top:boolean = true;

  members:{title:string,url:string,desc:string}[] =[
    {
      title:'Vũ Duy Hoàng',
      desc:'Ủy viên Ban Thường vụ, Trưởng ban Tuyên giáo Tỉnh ủy',
      url:'assets/images/thanh-vien-btg/vu-duy-hoang.jpg'
    },
    {
      title:'Nguyễn Thị Mai',
      desc:'Tỉnh uỷ viên, Phó Trưởng ban Thường trực Ban Tuyên giáo Tỉnh uỷ',
      url:'assets/images/thanh-vien-btg/dcmai.jpg'
    },
    {
      title:'Nguyễn Quốc Thái',
      desc:'Phó Trưởng ban Tuyên giáo Tỉnh ủy',
      url:'assets/images/thanh-vien-btg/nguyen-quoc-thai.jpg'
    },
    {
      title:'Nguyễn Xuân Quang',
      desc:'Phó Trưởng ban Tuyên giáo Tỉnh ủy',
      url:'assets/images/thanh-vien-btg/nguyen-xuan-quang.jpg'
    }
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
