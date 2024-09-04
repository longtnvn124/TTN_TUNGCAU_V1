import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {HelperService} from '@core/services/helper.service';
import {NotificationService} from '@core/services/notification.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {ChuyenDe, ChuyenDeDB} from "@shared/models/quan-ly-chuyen-de";
import {ChuyenDeService} from "@shared/services/chuyen-de.service";
import {OvicFile} from "@core/models/file";
import {forkJoin, Observable} from "rxjs";
import {BUTTON_NO, BUTTON_YES} from "@core/models/buttons";
import {MODULES_QUILL, WAITING_POPUP} from '@shared/utils/syscat';

export interface ConvertChuyenDe extends ChuyenDe {
  id: number;
  title: string;
  parent_id: number;
  type: 'LESSON' | 'TEST';
  desc: string;
  video: OvicFile[];
  audio: OvicFile[];
  documents: OvicFile[];// text COLLATE utf8_unicode_ci DEFAULT NULL //COMMENT 'json: link file tai lieu, bai tap',
  file_scorm:OvicFile;
  ordering: number;// int(11) DEFAULT 1000,
  status: number;
  children: ChuyenDe[];
  yt_link:string;
  video_type:number;
}

@Component({
  selector: 'app-chuyen-de',
  templateUrl: './chuyen-de.component.html',
  styleUrls: ['./chuyen-de.component.css']
})
export class ChuyenDeComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() courseId: number;
  @Input() courseName: string;
  @Output() layoutSettingLesson = new EventEmitter<boolean>();
  @Output() importLesson = new EventEmitter<any>();
  @ViewChild('templateTest') templateTest: ElementRef;
  @ViewChild('questContent') questContent: ElementRef;
  @ViewChild('templateWaiting') templateWaiting: ElementRef;
  @ViewChild('inputImport') inputImport: ElementRef;

  formChuyenDe: FormGroup;

  donviId: number;
  userId: number;
  canDelete: boolean = false;
  isUpdated: boolean = false;
  checkOrderingFocus: number;
  checkParentFocus: number;

  module_quill:any = MODULES_QUILL;
  public data: any = {};
  startProgress: boolean;
  settingTotalParam = {};
  private object: ChuyenDe;
  private objectId: number;
  progressValue = 0;
  isChangeOrdering = false;


  isManager: boolean;
  isLanhDaoKhoa: boolean;
  isSettings:boolean = false;

  constructor(
    private helperService: HelperService,
    private modalService: NgbModal,
    public formBuilder: FormBuilder,
    private auth: AuthService,
    private notificationService: NotificationService,
    private chuyenDeService: ChuyenDeService
  ) {

    this.settingTotalParam = {
      numberTest: 0,
    }
    this.formChuyenDe = this.formBuilder.group(
      {
        title: [''],
        type: 'LESSON',
        desc: [''],
        ordering: 1,
        video: [[]],
        documents: [[]],
        status: 1,
        audio: [[]],
        parent_id:0,
        file_scorm:[null],
        video_type:[1],
        yt_link:['']
      }
    );

    this.donviId = this.auth.user.donvi_id;
    this.userId = this.auth.user.id;
    this.isManager = this.auth.userHasRole('uni_leader');
    this.isLanhDaoKhoa = this.auth.userHasRole('fact_leader');

  }

  get f() {
    return this.formChuyenDe.controls;
  }


  ngOnInit(): void {
    // this.dmBaihoc = this.setNewData([]);
    this.loadData();
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  listData: ChuyenDe[];

  loadData() {
    this.chuyenDeService.loadDataUnlimit().subscribe({
      next: (data) => {
        this.listData = this.setNewData(data);
      }, error: () => {
      }
    })
  }

  //========================================================//
  setNewData(data: ChuyenDeDB[]) {
    if (data) {
      if (data.length > 0) {
        this.helperService.sort(data, 'ordering');
      }
      const parent: ChuyenDe[] = [...data].filter(m => m.parent_id === 0);
      const lastOrderingParent = data.length > 0 ? parent[parent.length - 1].ordering + 1 : 1;
      let parent_: ConvertChuyenDe = {
        id: null,
        title: '',
        desc: '',
        ordering: lastOrderingParent,
        parent_id: 0,
        video: [],
        audio: [],
        documents: [],
        file_scorm:null,
        type: 'LESSON',
        status: 1,
        children: [],
        video_type:1,
        yt_link:''

      }
      parent_['newInput'] = true;
      parent.push(parent_);
      parent.forEach((f, index) => {
        if (!isNaN(f.id)) {
          const nodes: any = [...data].filter(m => m.parent_id === f.id);
          const index_status = [...data].findIndex(m => m.parent_id === f.id && m.status);
          f['status_check'] = index_status !== -1 ? 1 : 0;
          const lastOrderingChildren = nodes.length > 0 ? nodes[nodes.length - 1].ordering + 1 : 1;
          const nodes_ = {
            title: '',
            id: null,
            ordering: lastOrderingChildren,
            parent_id: f.id,
            desc: '',
            type: 'LESSON',
            status: 1,
            video: [],
            audio: [],
            documents: [],
            children: [],
            file_scorm:null,
            newInput: true,
            video_type:1,
            yt_link:''

          }
          nodes.push(nodes_);
          if (!f['children']) {
            f['children'] = [];
          }
          f['children'] = nodes;
        }
      });
      return parent;
    } else {
      return null;
    }
  }

  onCreateMenuItem(value, item) {
    item.title = value;
    if (value && item && value.trim().length > 0) {
      if (!item.id) {
        this.isUpdated = false;
        delete item.id;
      } else {
        this.isUpdated = true;
      }
      if (item.newInput) {
        delete item.newInput;
      }
      if (item.parent_id === 0) {
        item.title = value.toUpperCase();
        delete item.video;
      }
      if (item.children) {
        delete item.children;
      }
      this.checkAutoFocus(item.ordering, item.parent_id);
      this.processAddForm(this.isUpdated, item, true);
    }
  }

  processAddForm(isUpdated, data, isTitle: boolean) {

    if (this.formChuyenDe.valid || data) {
      if (isTitle) {
        if (isUpdated) {
          this.objectId = data.id;
          delete data.id;
          delete data.status_check;
          delete data.created_at;
          delete data.updated_by;
          delete data.updated_at;
        }
        delete data.status_check;
        this.object = {...data};
      }
      if (this.formChuyenDe.valid && !isTitle) {
        if (isUpdated) {
          this.objectId = this.selectedChuyenMuc.id;
        }

        this.object = {...this.formChuyenDe.value};
      }
      this.object.status = this.object.status === 1 ? 1 : 0;

      if (isUpdated) {
        this.chuyenDeService.update(this.objectId,this.object).subscribe({
          next: () => {
            this.notificationService.toastSuccess('Sửa nội dung thành công')
            this.loadData();
          },
          error: () => {
            this.notificationService.toastError('Sửa nội dung Không thành công');
          }
        });
      } else {
        this.chuyenDeService.create(this.object).subscribe({
          next: () => {
            this.notificationService.toastSuccess('Thêm chuyên đề thành công');
            this.loadData();
          },
          error: () => {
            this.notificationService.toastError('Thêm chuyên đề thất bại, lỗi kết nối, vui lòng thử lại')
          }

        });

      }
    } else {
      this.formChuyenDe.markAllAsTouched();
      this.notificationService.toastWarning('Lỗi nhập liệu');
    }

  }


  onDragStartParent(event: CdkDragDrop<ChuyenDe[]>, children) {
    if (event.previousContainer === event.container) {
      let currentIndex = event.currentIndex === event.container.data.length - 1 ? event.currentIndex - 1 : event.currentIndex;
      moveItemInArray(event.container.data, event.previousIndex, currentIndex);
      this.isChangeOrdering = true;
    } else {
      let currentIndex = event.currentIndex === event.previousContainer.data.length ? event.currentIndex - 1 : event.currentIndex;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        currentIndex,
      );
    }
  }

  selectedChuyenMuc: ChuyenDe;

  checkAutoFocus(ordering, parent_id) {
    this.checkOrderingFocus = ordering + 1;
    this.checkParentFocus = parent_id;

  }

  deleteLesson(item: any) {
    this.notificationService.confirmDelete().then(
      (a) => {
        if (a) {
          this.chuyenDeService.delete(item.id).subscribe({
            next: () => {
              this.notificationService.toastSuccess('Xoá nội dung thành công');
              this.loadData();
            },
            error: () => {
              this.notificationService.toastError("Xóa thất bại, lỗi kết nối");
            }
          });
        }
      },
      () => null
    );
  }

  setActiceParent(parent: ChuyenDe) {
    const string = parent['status_check'] ? 'Bạn có chắc chắn muốn tắt kích hoạt toàn bộ nội dung của <span class="title-parent-report">' + parent['title'] + '</span>?' : 'Bạn có chắc chắn muốn kích hoạt toàn bộ nội dung của <span class="title-parent-report">' + parent['title'] + '</span>?';

    const status = parent['status_check'] ? 0 : 1;

    this.notificationService.confirm(string, 'Xác nhận hành động', [BUTTON_YES, BUTTON_NO]).then((a) => {
      if (a.name === 'yes') {
        const request: Observable<any>[] = [];
        if (parent['children'] && parent['children'].length) {
          parent['children'].forEach(f => {
            if (f.id) {
              request.push(this.chuyenDeService.update(f.id, {status: status}));
            }
          })
          forkJoin(request).subscribe({
            next: _res => {
              this.loadData();
              this.notificationService.toastSuccess("Kích hoạt thành công");
            }, error: () => this.notificationService.toastError("Cập nhật thất bại")
          });
        }
      }
    })
  }

  onDragStartChild(event: CdkDragDrop<string[]>, children) {
    if (event.previousContainer === event.container) {
      let currentIndex = event.currentIndex === event.container.data.length - 1 ? event.currentIndex - 1 : event.currentIndex;
      moveItemInArray(event.container.data, event.previousIndex, currentIndex);
      this.isChangeOrdering = true;
    } else {
      let currentIndex = event.currentIndex === event.previousContainer.data.length ? event.currentIndex - 1 : event.currentIndex;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        currentIndex,
      );
    }
  }

  onChangeTypeLesson(item) {
  }


  setActiceLesson(children: ChuyenDe) {
    const status = children.status ? 0 : 1;
    this.chuyenDeService.update(children.id, { status: status }).subscribe({
      next: () => {
        this.loadData();
        this.notificationService.toastSuccess('Cập nhật thành công');
      }, error: () => this.notificationService.toastError('Cập nhật thất bại')
    });
  }

  saveOrdering() {
    let i = 0;

    this.startProgress = true;
    this.progressValue = 0;
    this.modalService.open(this.templateWaiting, WAITING_POPUP);
    this.listData.forEach((f, key) => {
      if (f.id) {
        f.ordering = key + 1;
        setTimeout(() => {
          this.chuyenDeService.update(f.id, {ordering: key + 1}).subscribe({
            next: () => {
              if (f['children'] && f['children'].length) {
                let j = 0;
                let children = f['children'];

                children.forEach((c, ckey) => {
                  if (c.id) {
                    c.ordering = ckey + 1;
                    setTimeout(() => {
                      this.chuyenDeService.update(c.id, {ordering: ckey + 1}).subscribe({
                        next: () => {
                          j = j + 1;
                          if (j === f['children'].length - 1) {
                            i = i + 1;
                            this.progressValue = i / (this.listData.length - 1) * 100;
                          }
                          if (i === this.listData.length - 1 && j === f['children'].length - 1) {
                            this.notificationService.toastSuccess("Cập nhật thành công");
                            this.startProgress = false;
                            this.progressValue = 0;
                            this.modalService.dismissAll();
                          }
                        },
                        error: () => {
                          i = i + 1;
                          this.progressValue = i / (this.listData.length - 1) * 100;
                          if (i === this.listData.length - 1) {
                            this.notificationService.toastSuccess("Cập nhật thành công");
                            this.startProgress = false;
                            this.progressValue = 0;
                            this.modalService.dismissAll();
                          }
                        }
                      })
                    }, ckey * 150);
                  } else {
                    i = i + 1;
                    this.progressValue = i / (this.listData.length - 1) * 100;
                    if (i === this.listData.length - 1) {
                      this.notificationService.toastSuccess("Cập nhật thành công");
                      this.startProgress = false;
                      this.progressValue = 0;
                      this.modalService.dismissAll();
                    }
                  }
                })
              }
            },
            error: () => {
              i = i + 1;
              this.progressValue = i / (this.listData.length - 1) * 100;
              if (i === this.listData.length - 1) {
                this.notificationService.toastSuccess("Cập nhật thành công");
                this.startProgress = false;
                this.progressValue = 0;
                this.modalService.dismissAll();
              }
            }
          })
        }, key * 150);
      }
    })
  }

  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };

  activeIndex:number=0;

  mode:'TEXT'| 'VIDEO'|'PDF'|'FILE';
  settingLesson(item: ChuyenDe) {
    this.isSettings = true;
    this.selectedChuyenMuc = item;
    if(this.selectedChuyenMuc){
      this.formChuyenDe.setValue({
        title: this.selectedChuyenMuc.title,
        ordering: this.selectedChuyenMuc.ordering,
        parent_id: this.selectedChuyenMuc.parent_id,
        desc: this.selectedChuyenMuc.desc,
        type: this.selectedChuyenMuc.type,
        status:this.selectedChuyenMuc.status,
        video: this.selectedChuyenMuc.video,
        audio: this.selectedChuyenMuc.audio,
        documents: this.selectedChuyenMuc.documents,
        file_scorm:this.selectedChuyenMuc.file_scorm,
        video_type:this.selectedChuyenMuc.video_type ? this.selectedChuyenMuc.video_type : 1,
        yt_link:this.selectedChuyenMuc.yt_link
      });
    }
    this.videoTypeCr= this.selectedChuyenMuc.video_type;
    this.videoLinkOnChange(this.selectedChuyenMuc.yt_link);
  }

  closeForm(){
    this.isSettings = false;
    this.clearFormData();
  }
  clearFormData() {
    this.formChuyenDe.reset();
    this.f['ordering'].setValue(1);
    this.f['status'].setValue(1);
  }

  yt_link_cr :string ='';
  videoTypeCr:number =0;
  changeVideoType(num: 1|0){
    if(this.videoTypeCr != num){
      this.videoTypeCr =num;
    }

    if(num === 1){
      this.f['video_type'].setValue(1);
    }else{
      this.f['video_type'].setValue(0);
    }
  }

  videoLinkOnChange(event) {
    const id = event.split('watch?v=')[1];
    if (event === '') {
      this.yt_link_cr = '';
    } else {
      this.yt_link_cr = `https://www.youtube.com/embed/${id}`;
      // this.yt_link_cr = event;
      console.log(this.yt_link_cr);

    }
  }
}
