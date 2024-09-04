import {
  Scene, PerspectiveCamera,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
  SpriteMaterial,
  Sprite, RepeatWrapping, DoubleSide,BackSide,FrontSide, VideoTexture,
  Vector3,
} from "three";
import TweenLite from "gsap";
import {Pinable} from "@shared/models/point";


export type OvicVrPointType = 'DIRECT' | 'INFO';

export interface OvicVrPointUserData {
  ovicPointId: number,
  iconPoint: string,
  dataPoint: Pinable,
  parentPointId: number,
  type: OvicVrPointType,
  ngulieu_id?:number

}

export interface OvicVrPoint {
  userData: OvicVrPointUserData;
  name: string;
  position: Vector3,
  scene: sceneControl,
}

export class sceneControl {
  image: string;
  scene : any;
  sprites: any = [];
  sphere= new Mesh();
  spheres: any = [];
  camera: PerspectiveCamera;
  points: OvicVrPoint[] = [];
  point: any = {};
  state: any;

  constructor(image, camera) {
    this.image = image;
    this.points = [];
    this.sprites = [];
    this.scene = null;//{}
    this.camera = camera;

  }
  createScrene(scene, ovicPointId?: number, state?: boolean, userData?: OvicVrPointUserData, isToolTip?:boolean) {
    this.scene= null;
    this.scene = scene;
    if (state) {
      this.state = scene;
    }
    const geometry = new SphereGeometry(50, 32, 32);
    const texture = new TextureLoader().load(this.image);// load hinh anh bat dau
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;
    texture.generateMipmaps= true;
    isToolTip = true;
      // material.transparent = true;
      const material = new MeshBasicMaterial({map: texture, side: DoubleSide});
      this.sphere = new Mesh(geometry, material);
    // material.transparent = true;


    this.scene.add(this.sphere);
    if (userData) {this.scene.userData = userData;}
    if (ovicPointId) {
      this.sphere.userData = {ovicPointId: ovicPointId};
      this.spheres.push(this.sphere);
    }
    this.points.forEach((f) => {
      this.addTooltip(f);
    });
  }
  createMovie(scene, videoDom: HTMLVideoElement, ovicPointId?: number, userData?: OvicVrPointUserData) {
    this.scene = scene;
    //=========================create videoTexture======================
    const videoTexture = new VideoTexture(videoDom);

    const geometry = new SphereGeometry(50, 32, 32);
    const sphereMaterial = new MeshBasicMaterial({map: videoTexture, side: DoubleSide });
    sphereMaterial.needsUpdate = true;
    this.sphere = new Mesh(geometry, sphereMaterial);
    this.sphere.scale.x = -1;
    if (userData) {
      this.scene.userData = userData;
    }
    this.scene.add(this.sphere);
    videoTexture.needsUpdate = true;
    videoTexture.generateMipmaps= true;
    if (userData) {
      this.scene.userData = userData;
    }
    this.points.forEach((f) => {
      this.addTooltip(f);
    });

  }
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

  async addTooltip(point) {
    let spriteMap = new TextureLoader().load(point.userData.iconPoint);
    let spriteMaterial = new SpriteMaterial({map: spriteMap});
    let sprite = new Sprite(spriteMaterial)
    sprite.name = point.name;
    sprite.userData = point.userData;
    if (point !== undefined && point.position !== undefined) {
      sprite.position.copy(point.position.clone().normalize().multiplyScalar(13));
    } else {
      // Xử lý trường hợp point không hợp lệ
    }
    // material.transparent = true;//
    sprite.scale.multiplyScalar(10);
    this.scene.add(sprite);
    this.sprites.push(sprite);
    sprite["onClick"] = () => {
      this.destroy();
      this.scene.remove();
      this.sphere.remove();

      const mediaFile= point.userData.dataPoint.file_media;
      const typeMediaInFile = mediaFile ? mediaFile[0].type.split('/')[0]: null;
      if(typeMediaInFile =='image'){
        point.scene.createScrene(this.scene,point.id, false, point.userData);
        point.scene.appear();
      }
      if(typeMediaInFile == 'video'){
        point.scene.createMovie(this.scene,"" ,point.id, point.userData);
        point.scene.appear();
      }
    };
    sprite["mousemove"] = () => {
      point.scene.appear();
    }
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
      sprite.scale.set(1, 1, 1)
      TweenLite.to(sprite.scale, 1, {x: 2, y: 2, z: 2})
    })
  }
}
