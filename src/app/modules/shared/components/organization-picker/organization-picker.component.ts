import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {DonVi} from "@shared/models/danh-muc";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {HelperService} from "@core/services/helper.service";
import {DonViService} from "@shared/services/don-vi.service";
import {AuthService} from "@core/services/auth.service";
import {debounceTime,} from "rxjs";
@Component({
  selector: 'app-organization-picker',
  templateUrl: './organization-picker.component.html',
  styleUrls: ['./organization-picker.component.css']
})
export class OrganizationPickerComponent implements OnInit {
  @Input() select = 'id,donvi_id,title,lacoquan,status';
  _selected: DonVi[] = [];
  formGroup: FormGroup;
  page = 1;
  isLoading = false;
  loadFail = false;
  data: DonVi[];
  filter = {
    ten: '',
    select: this.select
  };
  recordsTotal: number;
  rows: number;
  statusList = [
    {
      value: 0,
      label: 'Dừng hoạt động',
      color: '<span class="badge badge--size-normal badge-danger w-100">Dừng hoạt động</span>'
    },
    {
      value: 1,
      label: 'Đang hoạt động',
      color: '<span class="badge badge--size-normal badge-success w-100">Đang hoạt động</span>'
    }
  ];
  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private themeSettingsService: ThemeSettingsService,
    private helperService: HelperService,
    private donViService: DonViService,
    private auth: AuthService
  ) {
    this.formGroup = this.fb.group({search: ''});
    this.rows = this.themeSettingsService.settings.rows;
    this.filter.select = this.select;
  }

  ngOnInit(): void {
    this.formGroup.get('search').valueChanges.pipe(debounceTime(200)).subscribe(value => {
      this.filter['ten'] = value;
      this.loadData();
    });
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // this.donViService.getChildren(this.auth.userDonViId,'',true).pipe(switchMap(data => {
    //   const ids = data.map(({id}) => id);
    //   return ids && ids.length ? forkJoin<[DonVi[], DonVi[]]>([of(data), this.donViService.getChildrenFromListParent(ids)]) : of([data, []]);
    // }))
    this.donViService.getChildren(this.auth.userDonViId,'',true).subscribe({
      next: (data) => {

        this.isLoading = false;
        this.loadFail = false;
        // const _childrents = childrents;
        // this.data = parents.reduce((collector, donvi) => {
        //   collector.push(donvi);
        //   const childrents = _childrents.filter(u => u.parent_id === donvi.id).map(u => {
        //     u.title = '-- ' + u.title;
        //     return u;
        //   });
        //   if (childrents.length) {
        //     collector.push(...childrents);
        //   }
        //   return collector;
        // }, new Array<DonVi>());
        this.data = data.map(m => {
          // const sIndex = this.statusList.findIndex(i => i.value === m.status);
          m['__status_transference'] = m.status ? '<span class="badge badge--size-normal badge-success w-100">Đang hoạt động</span>' : '<span class="badge badge--size-normal badge-danger w-100">Dừng hoạt động</span>';
          return m;
        })
      },
      error: () => {
        this.loadFail = true;
        this.isLoading = false;
      }
    });
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
  checkElement(row: DonVi) {
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
  save() {
    this.activeModal.close(this._selected);

  }
}
