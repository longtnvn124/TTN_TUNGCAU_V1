import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {HelperService} from "@core/services/helper.service";
import {AuthService} from "@core/services/auth.service";
import {debounceTime, forkJoin} from "rxjs";
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {DmChuyenMuc, DmLinhVuc, DmLoaiNguLieu} from "@shared/models/danh-muc";
import {DanhMucLoaiNguLieuService} from "@shared/services/danh-muc-loai-ngu-lieu.service";
import {DanhMucLinhVucService} from "@shared/services/danh-muc-linh-vuc.service";
import {NotificationService} from "@core/services/notification.service";

@Component({
  selector: 'ovic-picker-ngulieu',
  templateUrl: './ovic-picker-ngulieu.component.html',
  styleUrls: ['./ovic-picker-ngulieu.component.css']
})
export class OvicPickerNgulieuComponent implements OnInit {
  @Input() select = 'id,donvi_id,title,loaingulieu,linhvuc,chuyenmuc,file_media';
  @Input() type: 'DIRECT' | 'INFO';
  // loaingulieu:number;
  // linhvuc:number;
  // chuyenmuc:string;
  // diemditich_id:number;
  // file_media?:OvicFile[];
  // donvi_id:number;
  _selected: Ngulieu[] = [];
  formGroup: FormGroup;
  page = 1;
  isLoading = false;
  loadFail = false;
  data: Ngulieu[];
  filter = {
    ten: '',
    select: this.select
  };
  recordsTotal: number;
  rows: number;
  dataLoaingulieu: DmLoaiNguLieu[];
  dataLinhvuc: DmLinhVuc[];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private themeSettingsService: ThemeSettingsService,
    private helperService: HelperService,
    private auth: AuthService,
    private nguLieuDanhSachService: NguLieuDanhSachService,
    private danhMucLoaiNguLieuService: DanhMucLoaiNguLieuService,
    private danhMucLinhVucService: DanhMucLinhVucService,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.fb.group({search: ''});
    this.rows = this.themeSettingsService.settings.rows;
    this.filter.select = this.select;


  }

  ngOnInit(): void {
    forkJoin<[DmLoaiNguLieu[], DmLinhVuc[]]>(
      this.danhMucLoaiNguLieuService.getDataUnlimit(),
      this.danhMucLinhVucService.getDataUnlimit(),
    ).subscribe({
      next: ([dataLoaingulieu, dataLinhvuc]) => {
        this.dataLoaingulieu = dataLoaingulieu;
        this.dataLinhvuc = dataLinhvuc;
        this.loadData();
      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })

    this.formGroup.get('search').valueChanges.pipe(debounceTime(200)).subscribe(value => {
      this.filter['ten'] = value;
      this.loadData();
    });

  }

  loadData() {
    this.isLoading = true;
    // this.donViService.getChildren(this.auth.userDonViId,'',true).pipe(switchMap(data => {
    //   const ids = data.map(({id}) => id);
    //   return ids && ids.length ? forkJoin<[DonVi[], DonVi[]]>([of(data), this.donViService.getChildrenFromListParent(ids)]) : of([data, []]);
    // }))
    this.nguLieuDanhSachService.getdataBydonviIdandSelect(this.auth.userDonViId, '').subscribe({
      next: (data) => {
        if (this.type === 'DIRECT') {
          // "video360" image 360
          this.data = data.filter(f => f.loaingulieu === 'video360' || f.loaingulieu === 'image360').map(m => {
            m['__loaingulieu_converted'] = this.dataLoaingulieu && m.loaingulieu ? this.dataLoaingulieu.find(f => f.kyhieu === m.loaingulieu).ten : '__';
            m['__linhvuc_object'] = this.dataLinhvuc && m.linhvuc ? this.dataLinhvuc.find(f => f.id === m.linhvuc) : null;
            m['__linhvuc_converted'] = m['__linhvuc_object'] ? m['__linhvuc_object'].ten : '';
            return m;
          })

        } else {
          this.data = data.filter(f => f.loaingulieu !== 'video360' && f.loaingulieu !== 'image360').map(m => {
            const lv = this.dataLinhvuc && m.linhvuc ? this.dataLinhvuc.find(f => f.id === m.linhvuc) : null;
            m['__loaingulieu_converted'] = this.dataLoaingulieu && m.loaingulieu ? this.dataLoaingulieu.find(f => f.kyhieu === m.loaingulieu).ten : '__';
            m['__linhvuc_converted'] = lv ? lv.ten : '';
            return m;
          })

        }
        this.isLoading = false;
        this.loadFail = false;

      },
      error: () => {
        this.isLoading = false;
        this.loadFail = false;
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['select']) {
      this.filter.select = changes['select'].currentValue;
    }
  }

  close() {
    this.activeModal.close([]);
  }

  paginate({page}: { page: number }) {
    this.page = page + 1;
    this.loadData();
  }

  selectedRow: any = null;

  checkElement(row: Ngulieu) {
    if (this.type === 'DIRECT') {
      this.selectedRow = row;
      this._selected = [row];
    } else {
      if (this._selected) {
        if (-1 !== this._selected.findIndex(u => u.id === row.id)) {
          this._selected = this._selected.filter(u => u.id !== row.id);
          row['check'] = false;
        } else {
          this._selected.push(row);
          row['check'] = true;
        }
      } else {
        this._selected = [row];
        row['check'] = true;
      }
    }
  }

  save() {
    this.activeModal.close(this._selected);
  }
}
