import { Component , OnInit , Input , ViewChild , ElementRef , SimpleChanges , OnChanges } from '@angular/core';
import { FileService } from '@core/services/file.service';
import { OvicFileStore , OvicFile } from '@core/models/file';
import { NotificationService } from '@core/services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { AbstractControl } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { BUTTON_NO , BUTTON_YES } from '@core/models/buttons';

interface OvicFolderTreeObject {
	slug : string;
	label : string;
	isOpened : boolean;
	children? : OvicFolderTreeObject[];
}

@Component( {
	selector    : 'ovic-file-manager' ,
	templateUrl : './ovic-file-manager.component.html' ,
	styleUrls   : [ './ovic-file-manager.component.css' ]
} )
export class OvicFileManagerComponent implements OnInit , OnChanges {

	version = '1.0.0';

	@Input() default : OvicFileStore[] = [];

	@Input() donvi_id : number;

	@Input() user_id : number;

	@Input() isMultipleMode = true;

	@Input() buttonLabel = 'Click vào đây để thêm files';

	@Input() formField : AbstractControl;

	@ViewChild( 'fileDropRef' , { static : false } ) fileDropEl : ElementRef;

	acceptList = [
		'application/msword' ,
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ,
		'application/vnd.ms-powerpoint' ,
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' ,
		'application/vnd.ms-excel' ,
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ,
		'application/pdf' ,
		'application/zip' ,
		'application/x-rar-compressed' ,
		'application/octet-stream' ,
		'application/x-zip-compressed' ,
		'multipart/x-zip' ,
		'audio/mpeg' ,
		'image/jpeg' ,
		'image/png' ,
		'text/plain'
	];

	library : OvicFile[];
	fileStore : OvicFileStore[] = [];

	fileManagerPanel : NgbModalRef;
	chosenFiles : OvicFile[] = [];
	gridModeActive           = true;

	menus : OvicFolderTreeObject[] = [];

	searchInfo = {
		title : '' ,
		url   : ''
	};

	constructor(
		public fileService : FileService ,
		private notificationService : NotificationService ,
		private auth : AuthService ,
		private modalService : NgbModal
	) {
	}

	ngOnInit() : void {
		this.donvi_id = !this.donvi_id ? 0 : this.donvi_id;
		if ( !this.chosenFiles ) {
			this.chosenFiles = [];
		}
		this.user_id                  = this.user_id || this.auth.user.id;
		this.searchInfo[ 'donvi_id' ] = this.donvi_id;
		this.searchInfo[ 'user_id' ]  = this.user_id;
		this.loadData();
		this.fileService.loadDir().subscribe(
			{
				next  : res => {
					const keys = Object.keys( res );
					this.menus = [];
					for ( const nd of keys ) {
						if ( res.hasOwnProperty( nd ) ) {
							const _node = {
								slug     : nd ,
								label    : nd ,
								isOpened : false ,
								children : []
							};
							if ( res[ nd ].length ) {
								for ( const child of res[ nd ] ) {
									_node.children.push(
										{
											slug     : nd.concat( '/' , child ) ,
											label    : child ,
											isOpened : false
										}
									);
								}
							}
							this.menus.push( _node );
						}
					}
				} ,
				error : () => null
			}
		);
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			this.chosenFiles = this.convertToOvicFileSever( this.default );
		}
	}

	convertToOvicFileSever( files : OvicFileStore[] ) : OvicFile[] {
		const files_result : OvicFile[] = [];
		if ( files && files.length ) {
			for ( const f of files ) {
				files_result.push( {
					id         : f.id ,
					name       : f.name ,
					title      : f.title ,
					size       : f.size ,
					type       : f.type ,
					ext        : f.ext ,
					created_at : '' ,
					updated_at : '' ,
					url        : '' ,
					user_id    : null
				} );
			}
		}
		return files_result;
	}

	activeChildMenu( menu_slug : string , parentIndex : number = null ) {
		if ( parentIndex === null ) {
			const father = this.menus.find( mn => mn.slug === menu_slug );
			if ( !father.isOpened && father.children && father.children.length ) {
				father.isOpened = true;
				father.children.map( chl => chl.isOpened = false );
				this.searchInfo.url = father.slug;
			} else {
				father.isOpened     = false;
				this.searchInfo.url = '';
			}
			// this.menus.map( mn => mn.isOpened = mn.slug === menu_slug ? mn.isOpened : false );
		} else {
			this.menus[ parentIndex ].children.map( mn => mn.isOpened = mn.slug === menu_slug ? !mn.isOpened : false );
			const openedMenu    = this.menus[ parentIndex ].children.find( mn => mn.slug === menu_slug );
			this.searchInfo.url = openedMenu.slug;
		}
		this.loadData();
	}

	loadData() {
		this.fileService.getFileList( this.searchInfo ).subscribe(
			{
				next  : library => this.library = library ,
				error : () => null
			}
		);
	}

	changeView( mode : boolean ) {
		this.gridModeActive = mode;
	}

	/*tìm ảnh đại diên*/
	imgRepresent( fileType : string ) {
		return fileType ? 'assets/images/dnd/ic-file.svg' : '';
	}

	openPanel( changeFilePanel ) {
		this.fileManagerPanel = this.modalService.open( changeFilePanel , {
			scrollable  : true ,
			size        : 'xl' ,
			windowClass : 'modal-xxl ovic-modal-class ovic-modal-full' ,
			centered    : true
		} );
	}

	removeFromChosenFiles( fileId : number ) {
		const index = this.chosenFiles.findIndex( f => f.id === fileId );
		if ( index !== -1 ) {
			this.chosenFiles.splice( index , 1 );
		} else {
			this.notificationService.toastWarning( 'File bạn xóa không tồn tại trong file list' );
		}
	}

	chooseFile( fileId : number ) {
		const _file = this.library.find( f => f.id === fileId );
		if ( _file ) {
			if ( this.isMultipleMode ) {
				if ( this.chosenFiles.some( f => f.id === _file.id ) ) {
					this.notificationService.confirmRounded( '- File bạn chọn đã tồn tại trong danh sách file đã chọn<br>- Bạn có muốn thêm vào nữa không' , 'Xác nhận' , [ BUTTON_YES , BUTTON_NO ] ).then(
						button => {
							if ( button && button.name === BUTTON_YES.name ) {
								this.chosenFiles.push( _file );
							}
						} ,
						() => null
					);
				} else {
					this.chosenFiles.push( _file );
				}
			} else {
				this.chosenFiles = [];
				this.chosenFiles.push( _file );
				this.returnData( this.chosenFiles );
				this.fileManagerPanel.close( true );
			}
		}
	}

	showUploadPanel( templateRef ) {
		const uploadFilePanel = this.modalService.open( templateRef , {
			scrollable  : true ,
			size        : 'md' ,
			backdrop    : 'static' ,
			centered    : true ,
			windowClass : 'ovic-modal-class'
		} );
		uploadFilePanel.result.then(
			() => this.fileStore = [] ,
			() => this.fileStore = []
		);
	}

	changeSearchFilter( input ) {
		this.searchInfo.title = input.value.trim();
		this.loadData();
	}

	/**
	 * handle file from browsing
	 */
	fileBrowseHandler( fileStore ) {
		this.prepareFilesList( fileStore );
	}

	/**
	 * on file drop handler
	 */
	onFileDropped( $event ) {
		this.prepareFilesList( $event );
	}

	/**
	 * Convert Files list to normal array list
	 * @param files (Files List)
	 */
	prepareFilesList( files : Array<any> ) {
		if ( !this.donvi_id ) {
			this.notificationService.toastError( 'Vui lòng cung cấp mã đơn vị' );
		} else {
			for ( let i = 0 ; i < files.length ; i++ ) {
				if ( this.acceptList.includes( files[ i ].type ) ) {
					files[ i ].progress = 0;
					this.fileStore.push( files[ i ] );
					// this.uploadEffect( files[ i ] , i );
				} else {
					this.notificationService.toastWarning( `định dạng ${ files[ i ].type } chưa được hỗ trợ` );
				}
			}
			if ( this.fileStore.length ) {
				this.fileService.uploadFileOfDonviNew( this.fileStore , this.donvi_id , this.user_id ).subscribe(
					{
						next  : () => this.loadData() ,
						error : () => null
					}
				);
			}
			// this.library = [ ... this.fileStore , ... this.library ];
		}
	}

	// uploadEffect ( item , delay ) {
	// 	setTimeout( () => {
	// 		for ( let i = 0 ; i < 101 ; i++ ) {
	// 			item.progress = i;
	// 		}
	// 	} , 500 * delay );
	// }

	returnData( files : OvicFile[] ) {
		if ( this.formField ) {
			this.formField.setValue( files );
		}
		this.fileManagerPanel.close( true );
	}

	deleteChosenFiles( id : number ) {
		const index = this.chosenFiles.findIndex( f => f.id === id );
		if ( index !== -1 ) {
			this.chosenFiles.splice( index , 1 );
			if ( this.formField ) {
				this.formField.setValue( this.chosenFiles );
			}
		}
	}
}
