import {
  Scene, PerspectiveCamera,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
  SpriteMaterial,
  Sprite, RepeatWrapping, DoubleSide, BackSide, FrontSide, VideoTexture,
  Vector3, LinearFilter, RGFormat, RGBFormat,
} from "three";
import TweenLite from "gsap";
import {Pinable} from "@shared/models/point";
import {OvicFile} from "@core/models/file";



export type OvicVrPointType = 'DIRECT' | 'INFO';

export interface FilePointView {
  file_type: string;// video/ image
  file: OvicFile;
  url: string;
}

export interface OvicVrPointUserData {
  ovicPointId: number,
  iconPoint: string,
  dataPoint: Pinable,
  parentPointId: number,
  type: OvicVrPointType,
  ngulieu_id?: number
  file_media?: FilePointView,
}

export interface OvicVrPoint {
  userData: OvicVrPointUserData;
  name: string;
  position: Vector3,
  scene: PointView,
}

export class PointView {
  image: string;
  scene = new Scene();
  sprites: any = [];
  sphere = new Mesh();
  spheres: any = [];
  camera: PerspectiveCamera;
  points: OvicVrPoint[] = [];
  point: any = {};
  state: any;
  videoDom: HTMLVideoElement;

  constructor(image, camera) {
    this.image = image;
    this.points = [];
    this.sprites = [];
    this.scene = null;
    this.camera = camera;
  }

  createScrene(scene, file: FilePointView, ovicPointId?: number, userData?: OvicVrPointUserData, state?: boolean,) {
    if (this.scene){
      this.scene.remove();
    }
    this.scene = scene;
    if (state) {
      this.state = scene;
    }
    const geometry = new SphereGeometry(50, 32, 32);
    if (file.file_type === 'image') {
      const texture = new TextureLoader().load(file.url);// load hinh anh bat dau
      texture.wrapS = RepeatWrapping;
      texture.repeat.x = -1;
      texture.generateMipmaps = true;
      const material = new MeshBasicMaterial({map: texture, side: DoubleSide});
      this.sphere = new Mesh(geometry, material);
      this.scene.add(this.sphere);
      if (ovicPointId) {
        this.sphere.userData = {ovicPointId: ovicPointId};
        this.spheres.push(this.sphere);
      }
      if (userData) {
        this.sphere.userData = userData;
        this.spheres.push(this.sphere);
      }
      // if (userData) {this.scene.userData = userData;}
    }
    if (file.file_type === 'video') {
      const media = file.url;
      this.videoDom = document.createElement("video");

      const video:HTMLVideoElement = document.createElement('video');
      video.setAttribute('control', 'true');
      video.setAttribute('loop', 'true');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('crossorigin', 'anonymous');
      const source = document.createElement('source')
      source.setAttribute('src', media);
      source.setAttribute('type', file.file.type);
      video.appendChild(source);
      void video.play();
      if (this.videoDom) {
        this.videoDom.remove();
      }
      this.videoDom = video;

      const videoTexture = new VideoTexture(this.videoDom);
      videoTexture.minFilter = LinearFilter;
      videoTexture.magFilter = LinearFilter;
      const videoMaterial = new MeshBasicMaterial({map: videoTexture, side: DoubleSide});
      videoMaterial.needsUpdate = true;
      this.sphere = new Mesh(geometry, videoMaterial);
      this.sphere.scale.x = -1; // Đảo hình ảnh để phù hợp với video 360
      if (ovicPointId) {
        this.sphere.userData = {ovicPointId: ovicPointId};
        this.spheres.push(this.sphere);
      }
      if (userData) {
        this.sphere.userData = userData;
        this.spheres.push(this.sphere);
      }
      this.scene.add(this.sphere);
      videoTexture.needsUpdate = true;
      videoTexture.generateMipmaps = true;
    }
    this.points.forEach((f) => {
      this.addTooltip(f);
    });
  }

  btnOnorPauseVideo() {
    if (this.videoDom && this.videoDom.paused) {
      this.videoDom.play();
    } else {
      this.videoDom.pause();
    }
  }


  btnRemoveVideo() {
    if(this.videoDom){
      this.videoDom.pause();
      this.videoDom.remove();
    }
  }

  //
  addPoint(point: OvicVrPoint) {
    this.points.push(point);
  }

  deletePoint(ovicPointId: number) {
    let spritesRemove = this.sprites.filter(f => f.userData['ovicPointId'] === ovicPointId)
    spritesRemove.forEach(f => {
      f.material.dispose();
      f.material.map.dispose();
      this.scene.remove(f);
    })
  }

  // add point in scene
  async addTooltip(point: OvicVrPoint) {
    let spriteMap = new TextureLoader().load(point.userData.iconPoint);
    let spriteMaterial = new SpriteMaterial({map: spriteMap});
    let sprite = new Sprite(spriteMaterial)
    sprite.name = point.name;
    sprite.userData = point.userData;
    sprite.position.copy(point.position.clone().normalize().multiplyScalar(15));
    // material.transparent = true;//
    // sprite.scale.multiplyScalar(10);
    this.scene.add(sprite);
    this.sprites.push(sprite);
    sprite["onClick"] = () => {
      this.destroy();
      this.sphere.remove();
      this.scene.remove();
      if (this.videoDom) {
        this.videoDom.pause();
        this.videoDom.remove();
      }
      // point.scene.appear();
      this.appear();
    };
  }


  destroy() {
    TweenLite.to(this.sphere.material, 1, {
      opacity: 0,
      onComplete: () => {
        this.scene.remove(this.sphere)
      }
    })
    this.sprites.forEach((sprite) => {
      TweenLite.to(sprite.scale, 1, {
        x: 0, y: 0, z: 0,
        onComplete: () => {
          this.scene.remove(sprite)
        }
      })
    })
  }

  appear() {
    // this.sphere.material.opacity = 0;
    TweenLite.to(this.sphere.material, 1, {
      opacity: 1,
    })
    this.sprites.forEach((sprite) => {
      sprite.scale.set(0, 0, 0)
      TweenLite.to(sprite.scale, 1, {x: 1, y: 1, z: 1})
    })
  }


}
