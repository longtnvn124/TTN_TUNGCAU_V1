import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as mapboxgl from "mapbox-gl";
import {Point} from "@shared/models/point";
import {DmDiemDiTich} from "@shared/models/danh-muc";
import {convertPoint} from "@shared/components/ovic-media-vr/ovic-media-vr.component";
import {NotificationService} from "@core/services/notification.service";
import {observable, Observable, timer} from "rxjs";
import {Map} from "mapbox-gl";

export interface coordinatesPoint {
  id: number,
  latitude: number,//Vĩ độ (latitude): 21.5928 độ Bắc.
  longitude: number,//Kinh độ (longitude): 105.8544 độ Đông.
  title: string,
  urlImage: string,
}

export interface features {
  type: string,//default: "Feature"
  geometry: {
    type: string,//default: 'Point'
    coordinates: [number, number]
  },
  properties: {
    title: string,
    description: string
  }
}

export interface GeoJson {
  kinds: string,//default: "FeatureCollection"
  features: features[]
}

@Component({

  selector: 'ovic-map',
  templateUrl: './ovic-map.component.html',
  styleUrls: ['./ovic-map.component.css']
})
export class OvicMapComponent implements OnInit, AfterViewInit {
  @Input() reSizeMap: Observable<string>;
  @Input() coordinatesPoint: coordinatesPoint;
  @Input() point: Point;
  private _site: DmDiemDiTich;
  @Input() set site(site: DmDiemDiTich) {
    this._site = site;
  }

  get site(): DmDiemDiTich {
    return this._site;
  }

  @ViewChild('container', {static: true}) container: ElementRef<HTMLDivElement>;
  @Input() points: convertPoint[];

  token = 'pk.eyJ1IjoidHJhbm1pbmhsb25nIiwiYSI6ImNsazB5eXhodDAxaGszY3BvM2M4cHlkNjEifQ.IPMCYyuOBrIr-CKBFe5R6Q';
  geojson: GeoJson = {
    kinds: "FeatureCollection",
    features: []
  };

  map: Map;
  isLoading:boolean= false;
  ngAfterViewInit(): void {
    this.btnReload();
  }

  constructor(private notifi: NotificationService) {
  }

  ngOnInit(): void {
    if (this.reSizeMap) {
      this.reSizeMap.subscribe(() => {
        this.map.resize();
        window.dispatchEvent(new Event('resize'));
      })


    }

    this.geojson.kinds = 'FeatureCollection';
    if (this.point) {
      this.loadPointMap();
      if (this.dataPointInMap) {
        this.dataPointInMap.forEach(f =>
          this.geojson.features.push(
            {
              type: "Feature",//default: "Feature"
              geometry: {
                type: 'Point',//default: 'Point'
                coordinates: [f['longitude'], f['latitude']]
              },
              properties: {
                title: f.title,
                description: ''
              }
            })
        )
      }

    }
    if (this.points) {
      this.loadDataPointsinMap();
      if (this.dataPointInMap) {
        this.dataPointInMap.forEach(f =>
          this.geojson.features.push(
            {
              type: "Feature",//default: "Feature"
              geometry: {
                type: 'Point',//default: 'Point'
                coordinates: [f['longitude'], f['latitude']]
              },
              properties: {
                title: f.title,
                description: ''
              }
            })
        )
      }
    }

  }

  dataPointInMap: Point[] = [];
  dataPointsInMap: convertPoint[] = [];

  // vido kinhdo => kinhdo(longitude), vido(latitude)
  loadPointMap() {
    this.dataPointInMap.push(this.point);
    const pointChild = this.point['__child'];
    pointChild.forEach(f => this.dataPointInMap.push(f));
    this.dataPointInMap = this.dataPointInMap.filter(f => f.toado_map !== null).map(f => {
      f['longitude'] = parseFloat(f.toado_map.split(',')[1]);
      f['latitude'] = parseFloat(f.toado_map.split(',')[0]);
      return f;
    });
  }

  loadDataPointsinMap() {

    this.dataPointsInMap = this.points.filter(f => f.toado_map !== null).map(f => {
      f['longitude'] = parseFloat(f.toado_map.split(',')[1]);
      f['latitude'] = parseFloat(f.toado_map.split(',')[0]);
      return f;
    });

  }

  btnReload() {
    this.isLoading=true;
    // this.notifi.isProcessing(true);
    timer(1500).subscribe(() => {
      if (this._site) {
        this.notifi.isProcessing(true);
        if (this.container) {
          this.container.nativeElement.innerHTML = '';
        }

        if (this.map) {
          this.map.remove();
        }

        this.geojson.kinds = 'FeatureCollection';
        const longitude1 = parseFloat(this._site.toado.split(',')[1]);
        const latitude1 = parseFloat(this._site.toado.split(',')[0]);
        this.geojson.features = [(
          {
            type: "Feature",//default: "Feature"
            geometry: {
              type: 'Point',//default: 'Point'
              coordinates: [longitude1, latitude1]
            },
            properties: {
              title: this._site.ten,
              description: ''
            }
          })];

        this.map = new mapboxgl.Map({
          accessToken: this.token,
          container: this.container.nativeElement, // ID của thẻ HTML để chứa bản đồ
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [longitude1, latitude1],
          zoom: 9,
          trackResize: true
        });
        this.map.addControl(new mapboxgl.GeolocateControl());

        for (const feature of this.geojson.features) {
          // create a HTML element for each feature;

          const el = document.createElement('div');
          el.className = 'marker';
          new mapboxgl.Marker(el)
            .setLngLat([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
            .setPopup(
              new mapboxgl.Popup({offset: 25}) // add popups
                .setHTML(
                  `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
                )
            )
            .addTo(this.map);
        }

        this.notifi.isProcessing(false);

      }
      // this.notifi.isProcessing(false);
      this.isLoading=false;
    })
  }


}
