import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {DATA_UNIT_START_TEST} from "@shared/utils/syscat";
import {NotificationService} from "@core/services/notification.service";
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {OvicTableStructure} from "@shared/models/ovic-models";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {forkJoin} from "rxjs";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {ThiSinhService} from "@shared/services/thi-sinh.service";


export  interface TypeChart{
  canbo:[{school:string,total:number}],
  sinhvien:[{school:string,total:number}]
}

@Component({
  selector: 'dot-thi-thong-ke',
  templateUrl: './dot-thi-thong-ke.component.html',
  styleUrls: ['./dot-thi-thong-ke.component.css']
})
export class DotThiThongKeComponent implements OnInit, OnChanges {
  index = 1;
  tblStructureShiftTest: OvicTableStructure[] = [
    {
      fieldType: 'normal',
      field: ['_name'],
      innerData: true,
      header: 'Tên thí sinh',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['_school'],
      innerData: true,
      header: 'Tên Trường',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['_units'],
      innerData: true,
      header: 'Đơn vị',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['_time_start_shifttest'],
      innerData: true,
      header: 'Ngày làm bài',
      sortable: false,
      headClass: 'ovic-w-130px text-center',
      rowClass: 'ovic-w-130px text-center'
    },
    {
      fieldType: 'normal',
      field: ['_time_doit'],
      innerData: true,
      header: 'Thời gian làm bài',
      sortable: false,
      headClass: 'ovic-w-130px text-center',
      rowClass: 'ovic-w-130px text-center'
    },
    {
      fieldType: 'normal',
      field: ['_number_correct_converted'],
      innerData: true,
      header: 'Kết quả làm bài',
      sortable: false,
      headClass: 'ovic-w-100px text-center',
      rowClass: 'ovic-w-100px text-center'
    },
    {
      fieldType: 'normal',
      field: ['_score'],
      innerData: true,
      header: 'Điểm',
      sortable: true,
      headClass: 'ovic-w-100px text-center',
      rowClass: 'ovic-w-100px text-center'
    },
  ]
  @Input() shiftId: number;
  viewLazy: boolean = true;// view lazy;
  dataUnits= DATA_UNIT_START_TEST;
  dataShiftTest: ShiftTests[];
  dataShift: Shift[];
  dataCharts: any;
  optionsCharts: any;
  nganHangDe: NganHangDe[];

  constructor(
    private shiftTestService: DotThiKetQuaService,
    private notifi: NotificationService,
    private nganHangDeService: NganHangDeService,
    private dotthiService: DotThiDanhSachService,
    private thisinhService: ThiSinhService
  ) {
    // this.dataUnits = [].concat(DATA_UNIT_START_TEST);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.viewLazy=true;
    this.loadInit();
    }

  ngOnInit(): void {
    this.viewLazy=true;
    this.loadInit();
  }

  loadInit(){
    forkJoin<[NganHangDe[],Shift[]]>([
      this.nganHangDeService.getDataUnlimit(),
      this.dotthiService.getdataUnlimit()
    ]).subscribe({
      next:([nghanhde, shift])=>{
        this.nganHangDe = nghanhde;
        this.dataShift = shift;
        this.getDataShiftTest();
      },
      error:()=>{
        this.notifi.toastError('Mất kết nối với máy chủ');
      }});
  }

  getDataShiftTest(){
    this.notifi.isProcessing(true);
    forkJoin<[TypeChart,{ recordsTotal: number, data: ShiftTests[] }]>([
      this.thisinhService.getPeopleClasify(),
      this.shiftTestService.getDataByShiftIdAndWidthAndPage(this.shiftId, 1)
    ]).subscribe({
      next:([type, {recordsTotal,data}])=>{
        const type_sinhvien = type.sinhvien;
        const type_canbo = type.canbo;
        this.dataUnits = this.dataUnits.map(m=> {
          m['study'] = type_sinhvien.find(f=>f.school === m.name) ? type_sinhvien.find(f=>f.school === m.name).total:0;
          m['saft'] = type_canbo.find(f=>f.school === m.name) ? type_canbo.find(f=>f.school === m.name).total:0;
          const totalContainent = m['study'] +m['saft'];
          m['_cover_name'] = m.name + ' ' + '(' + totalContainent +')';
          return m;
        })
        this.getDataToChart()
        const datashifttest = data.map(m=>{
          const thisinh= m['thisinh'];
          const _shift = this.dataShift.find(m=>m.id === this.shiftId);
          const back = this.nganHangDe && this.nganHangDe.find(f=>f.id === _shift.bank_id) ? this.nganHangDe.find(f=>f.id === _shift.bank_id): null;
          m['_name']= thisinh ? thisinh['full_name'] : '';
          m['_school'] = thisinh ? thisinh['school'] : '';
          m['_units'] = thisinh && thisinh['people_classify'] === 0 ? thisinh['class'] : thisinh && thisinh['people_classify'] === 1 ? thisinh['units'] : '' ;
          m['_time_start_shifttest'] = m.time_start ? this.getdate(m.time_start) : '';
          m['_score'] = m && m.score ? this.take_decimal_number(m.score, 2) : 0;
          const time_doit = back && back.time_per_test ?  Math.floor(back.time_per_test *60 - m.time) : 0;
          m['_time_doit'] = Math.floor(time_doit / 60) + ' phút ' + Math.floor((time_doit % 60) / 10) + ' giây';
          m['_number_correct_converted'] = m.number_correct + '/' + m.question_ids.length;
          return m;
        });
        this.dataShiftTest = this.sortCandidates(datashifttest).slice(0,50);
        this.viewLazy=false;
        this.notifi.isProcessing(false);
      },error:(e)=>{
        this.viewLazy=false;
        this.notifi.isProcessing(false);
        this.notifi.toastError("Truy vấn dữ liệu không thành công");
      }
    });
  }

  getDataToChart(){
    this.dataCharts = {
      labels:this.dataUnits.map(m=>m['_cover_name']),
      datasets:[
        {
          label:"Sinh viên dự thi",
          data: this.dataUnits.map(m=>m['study']),
        },
        {
          label:"Cán bộ dự thi",
          data: this.dataUnits.map(m=>m['saft']),
        },
      ]
    }

    this.optionsCharts = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        legend: {
          labels: {
            // color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: {
              weight: 500
            }
          },
          grid: {
            drawBorder: false
          }
        },
        y: {
          ticks: {
          },
          grid: {
            drawBorder: false
          }
        }
      }
    };
  }

  take_decimal_number(num, n) {
    let base = 10 ** n;
    return Math.round(num * base) / base;
  }
  getdate(time: string, getime?: boolean) {
    const date = new Date(time);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Lưu ý rằng tháng bắt đầu từ 0, nên cần cộng thêm 1.
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (!getime) {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } else {
      return `${day}/${month}/${year}`;
    }
  }
  sortCandidates(candidates: ShiftTests[]): ShiftTests[] {
    return candidates.sort((a, b) => {
      // Sắp xếp theo điểm giảm dần
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.time - a.time ;// Nếu điểm bằng nhau, sắp xếp theo thời gian tăng dần
    });
  }


}
