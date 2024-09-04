import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {NotificationService} from "@core/services/notification.service";
import {FileService} from "@core/services/file.service";
import {AuthService} from "@core/services/auth.service";
import {Router} from "@angular/router";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";

@Component({
  selector: 'app-content-ngu-lieu-so',
  templateUrl: './content-ngu-lieu-so.component.html',
  styleUrls: ['./content-ngu-lieu-so.component.css']
})
export class ContentNguLieuSoComponent implements OnInit,AfterViewInit, OnChanges {
  @Input() selectItem: boolean = true;
  @Input() search:string;

  constructor(
    private nguLieuDanhSachService: NguLieuDanhSachService,
    private notificationService:NotificationService,
    private fileService:FileService,
    private authService:AuthService,
    private router:Router
  ) { }

  ngOnInit(){
    this.loadInit('');

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.search){
      this.loadInit(this.search);
    }
  }
  ngAfterViewInit(){
  }

  ngulieuImage360:Ngulieu[]= [];
  ngulieuVideo360:Ngulieu[]= [];
  loadInit(search?:string){
    this.notificationService.isProcessing(true);
    this.nguLieuDanhSachService.getDataUnlimit(search).subscribe({
      next:(data)=>{
        const dataNguLieu = data.map(m=>{
          m['__file_thumbnail'] = m.file_thumbnail ? this.fileService.getPreviewLinkLocalFile(m.file_thumbnail): '';
          return m;
        })
        this.ngulieuImage360=dataNguLieu.filter(f=>f.loaingulieu === "image360")? dataNguLieu.filter(f=>f.loaingulieu === "image360"):[];
        this.ngulieuVideo360=dataNguLieu.filter(f=>f.loaingulieu === "video360")? dataNguLieu.filter(f=>f.loaingulieu === "video360"):[];
        this.notificationService.isProcessing(false);
        this.notificationService.isProcessing(false);
      },
      error:()=>{
        this.notificationService.isProcessing(false);
      }

    })
  }
  btnSelectNgulieu(item:Ngulieu){
    if (this.selectItem){
      const code = this.authService.encryptData(JSON.stringify({ngulieu_id :item.id}));
      void this.router.navigate(['virtual-tour'], {queryParams: {code}});

    }
  }
  btnLoadByTextseach(text:string){
    this.loadInit(text);
  }

}
