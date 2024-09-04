import {AfterViewInit, Directive, ElementRef, Input, Renderer2} from '@angular/core';
import {OvicFile} from "@core/models/file";
import {FileService} from "@core/services/file.service";
import {imgFalback} from "@env";

@Directive({
  selector: '[ovicLoadImageById]'
})
export class OvicLoadImageByIdDirective implements AfterViewInit {

  @Input() ovicLoadImageById: OvicFile;

  @Input() plaholder: string = imgFalback;

  constructor(
    private el: ElementRef,
    private fileService: FileService,
    private renderer: Renderer2,
  ) {
  }

  ngAfterViewInit(): void {
    const image = this.renderer.createElement('img');
    this.renderer.setAttribute(image, 'src', this.plaholder);
    this.renderer.setAttribute(image, 'class', 'ovic-img-zoom');
    this.renderer.appendChild(this.el.nativeElement, image);
    if (this.ovicLoadImageById) {
      this.renderer.addClass(this.el.nativeElement, 'ovic-is-loading--circle');
      this.fileService.getFileAsBlobByName(this.ovicLoadImageById.id.toString(10)).subscribe({
        next: blob => {
          this.renderer.removeClass(this.el.nativeElement, 'ovic-is-loading--circle');
          this.renderer.addClass(this.el.nativeElement, '--image-loading-success');
          this.renderer.setAttribute(image, 'src', URL.createObjectURL(blob) );
        },
        error: () => {
          this.renderer.removeClass(this.el.nativeElement, 'ovic-is-loading--circle');
          this.renderer.addClass(this.el.nativeElement, '--image-loading-fail');
        },
      });
    }
  }
}
