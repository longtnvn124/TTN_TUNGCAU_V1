import { Directive , Output , Input , EventEmitter , HostBinding , HostListener } from '@angular/core';

@Directive( {
    selector : '[ovicDropAndDrag]'
} )
export class OvicDropAndDragDirective {

    @HostBinding( 'class.fileover' ) fileOver : boolean;

    @Output() fileDropped = new EventEmitter<FileList>();

    // Dragover listener
    @HostListener( 'dragover' , [ '$event' ] ) onDragOver( event : Event ) {
        event.preventDefault();
        event.stopPropagation();
        this.fileOver = true;
    }

    // Dragleave listener
    @HostListener( 'dragleave' , [ '$event' ] ) onDragLeave( event : Event ) {
        event.preventDefault();
        event.stopPropagation();
        this.fileOver = false;
    }

    // Drop listener
    @HostListener( 'drop' , [ '$event' ] ) ondrop( event : DragEvent ) {
        event.preventDefault();
        event.stopPropagation();
        this.fileOver = false;
        const files   = event.dataTransfer.files;
        if ( files.length > 0 ) {
            this.fileDropped.emit( files );
        }
    }
}
