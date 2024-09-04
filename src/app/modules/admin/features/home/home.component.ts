import {ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ChartOptions} from '@shared/models/chart-options';
import {ChartComponent, ApexAxisChartSeries} from 'ng-apexcharts';
import {DhtdHtkt} from '@shared/models/dhtd-htkt';

import {forkJoin, Observable, of, timer} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from '@core/services/auth.service';
import {CardWidgetService} from '@modules/admin/features/home/widgets/card-widget/card-widget.component';
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {NguLieuSuKienService} from "@shared/services/ngu-lieu-su-kien.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {HttpParams} from "@angular/common/http";
import {Dto} from "@core/models/dto";
import {PointsService} from "@shared/services/points.service";

interface DhtdHtktReportTable {
  loading: boolean;
  error: boolean;
  data: {
    object: DhtdHtkt,
    person: {
      total: number,
      percent: number,
    },
    group: {
      total: number,
      percent: number,
    }
    summary: number,
  }[];
  mode: 'total' | 'percent';
  selected: {
    year: string,
    title: string,
    sum: number
  };
}


interface HomeWidget {
  service: CardWidgetService
  title: string,
  icon: TemplateRef<any>,
  styleClass: string,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']

})
export class HomeComponent implements OnInit {

  @ViewChild('c1', {static: true}) private c1Component: ChartComponent;


  protected bankWidget: HomeWidget = {
    service: this.nganHangDeService,
    title: 'Số ngân hàng',
    styleClass: '',
    icon: null
  }

  tblReport: DhtdHtktReportTable = {
    loading: false,
    error: false,
    data: [],
    mode: 'total',
    selected: null
  };

  lastFourYearsAgo: number[];

  c1Options: Partial<ChartOptions>;

  // resistanceAchievementWidgetService : CardWidgetService = { countAllItems : () => of( 0 ) };
  // achievementWidgetService : CardWidgetService           = { countAllItems : () => forkJoin<[ number , number ]>( [ this.quyetDinhKhenCaNhanService.countAllItems() , this.quyetDinhKhenTapTheService.countAllItems() ] ).pipe( map( ( [ n1 , n2 ] ) => ( n1 + n2 ) ) ) };
  nguLieuWidgetService : CardWidgetService               = { countAllItems : () => this.nguLieuDanhSachService.countAllItems() };
  suKienWidgetService : CardWidgetService                = { countAllItems : () => this.nguLieuSuKienService.countAllItems() };
  pointWidgetService : CardWidgetService                      = { countAllItems : () => this.pointsService.countAllItems() };
  nganHangDeWidgetService : CardWidgetService                      = { countAllItems : () => this.nganHangDeService.countAllItems() };
  dottiWidgetService : CardWidgetService              = { countAllItems : () => this.dotThiDanhSachService.countAllItems()};
  index = 13;

  constructor(
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private nguLieuDanhSachService: NguLieuDanhSachService,
    private nguLieuSuKienService: NguLieuSuKienService,
    private pointsService:PointsService,
    protected nganHangDeService: NganHangDeService,
    private dotThiDanhSachService: DotThiDanhSachService,

  ) {
    const lastYear = new Date().getFullYear();
    this.lastFourYearsAgo = [lastYear , lastYear + 1 , lastYear + 2, lastYear + 3];
    this.c1Options = {
      series: [
        {
          name: 'Điểm truy cập',
          type: 'column',
          data: [10, 20, 30, 40]
        },
        {
          name: 'Ngân hàng đề',
          type: 'column',
          data: [22, 7, 18, 35]
        },
        {
          name: 'Đợt thi',
          type: 'column',
          data: [3, 8, 12, 7]
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
        events: {
          dataPointSelection: (e, c, {
            dataPointIndex,
            seriesIndex,
            w
          }: { dataPointIndex: number, seriesIndex: number, w: { config: { series: ApexAxisChartSeries, xaxis: { categories: string[] } } } }) => {
            const year = w.config.xaxis.categories[dataPointIndex].toString();
            const title = w.config.series[seriesIndex].name;
            const sum = w.config.series[seriesIndex].data[dataPointIndex] as number;
            this.loadTable(year, title, sum);
            this.cd.detectChanges();
          }
        }
      },
      title: {
        text: 'My First Angular Chart'
      },
      xaxis: {
        categories: this.lastFourYearsAgo
      },
      tooltip: {
        enabled: true
      }
    };
  }

  ngOnInit(): void {
    const y = new Date().getFullYear();
    this.lastFourYearsAgo = [y - 4, y - 3, y - 2, y - 1];

  }

  loadTable(year: string, title: string, sum: number) {
    this.tblReport.loading = true;
    this.tblReport.selected = {year, title, sum};
    timer(1000).subscribe(() => {
      this.tblReport.loading = false;
      this.cd.detectChanges();
    });
  }

  changeTableReportMode() {
    this.tblReport.mode = this.tblReport.mode === 'total' ? 'percent' : 'total';
  }


}
