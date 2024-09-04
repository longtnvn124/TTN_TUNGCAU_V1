import { Component , Input , OnChanges , OnDestroy , OnInit , SimpleChanges } from '@angular/core';
import { FileService } from '@core/services/file.service';
import { OvicMedia , OvicMediaSources } from '@core/models/file';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';

@Component( {
	selector    : 'ovic-audio-player' ,
	templateUrl : './ovic-audio-player.component.html' ,
	styleUrls   : [ './ovic-audio-player.component.css' ]
} )
export class OvicAudioPlayerComponent implements OnInit , OnChanges , OnDestroy {

	constructor(
		private fileService : FileService ,
		private notificationService : NotificationService ,
		private auth : AuthService
	) {
	}

	@Input() data : OvicMedia; /* local | serverFile | googleDrive */

	@Input() private = true;

	@Input() cacheId : string;

	@Input() urlObject : string;

	audioEnded  = false;
	_original : string;
	_audioId : string;
	_urlSrc : string;
	_audioCache = {};
	_cacheName : string;

	isLoading : boolean;
	error : boolean;
	isPlaying : boolean;

	audioElement : HTMLMediaElement;
	_maxLength : number;
	_progress : number;
	_currentTime : string;
	_endTime : string;
	_replay : number;

	ngOnInit() : void {
		this.initSettings();
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'data' ] || changes[ 'urlObject' ] ) {
			this.initSettings();
		}
	}

	ngOnDestroy() {
		if ( this.audioElement ) {
			this.audioElement.pause();
			this.audioElement.remove();
		}
	}

	async initSettings() {
		this._cacheName = null;
		if ( this.cacheId ) {
			this._cacheName  = ''.concat( 'audio' , this.cacheId.toString() );
			this._audioCache = this.auth.getOption( this._cacheName );
		}
		this.isPlaying    = false;
		this.audioEnded   = false;
		this._urlSrc      = '';
		this._original    = this.data && this.data.source ? this.data.source : null;
		this._audioId     = this.data && this.data.path ? this.data.path as string : null;
		this._replay      = this.data && this.data.replay ? this.getDefaultReplay( this.data.replay ) : this.getDefaultReplay( -1 );
		this._currentTime = '00:00';
		this._endTime     = '00:00';
		this._maxLength   = 0;
		this._progress    = 0;
		this.audioEnded   = false;
		if ( this._original && this._audioId ) {
			switch ( this._original ) {
				case OvicMediaSources.local :
					this._urlSrc = await this.loadFileFromLocal( this._audioId );
					break;
				case OvicMediaSources.serverFile :
					this._urlSrc = await this.loadFileFromServerFile( this._audioId );
					break;
				case OvicMediaSources.googleDrive :
					this._urlSrc = 'https://docs.google.com/uc?export=download&id='.concat( this._audioId );
					break;
				default :
					this.audioEnded = false;
			}
		} else {
			this._urlSrc = this.urlObject || null;
		}

		if ( !this._urlSrc ) {
			this.error = true;
			return;
		}
		this.audioEnded = true;
		if ( this.private ) {
			if ( !this.audioElement ) {
				this.isLoading                 = true;
				this.error                     = false;
				this.audioElement              = document.createElement( 'audio' );
				this.audioElement.src          = this._urlSrc;
				this.audioElement.volume       = 1;
				this.audioElement.ontimeupdate = evt => {
					this._currentTime = this.convertSecondToMinute( this.audioElement.currentTime );
					this._progress    = this.calculatePercent( this.audioElement.duration , this.audioElement.currentTime );
				};
				this.audioElement.addEventListener( 'ended' , ( evt ) => {
					this._replay   = this._replay > 0 ? this.setReplay( this._replay - 1 ) : this._replay;
					this.isPlaying = false;
					setTimeout( () => {
						this._currentTime = '00:00';
						this._progress    = 0;
					} , 1000 );
				} , false );

				this.audioElement.addEventListener( 'canplay' , ( evt ) => {
					this._maxLength = this.audioElement.duration;
					this._endTime   = this.convertSecondToMinute( this.audioElement.duration );
					this.isLoading  = false;
				} , false );

				this.audioElement.onerror = event => {
					this.isLoading = false;
					this.error     = true;
				};
			}
			if ( this.audioElement ) {
				this.audioElement.src = this._urlSrc;
			}
		}
	}

	getDefaultReplay( initData : number ) {
		if ( initData === -1 ) {
			return initData;
		}
		if ( this._audioCache && this._audioCache.hasOwnProperty( '_replay' ) ) {
			return this._audioCache[ '_replay' ];
		} else {
			return this.setReplay( initData );
		}
	}

	setReplay( newValue : number ) : number {
		if ( this._cacheName ) {
			if ( !this._audioCache ) {
				this._audioCache = {};
			}
			this._audioCache[ '_replay' ] = newValue;
			this.auth.setOption( this._cacheName , this._audioCache );
		}
		return newValue;
	}

	loadFileFromLocal( fileName : string ) : Promise<string> {
		return new Promise<string>( resolve => {
			this.fileService.getImageContentFromLocalAssesFile( fileName ).subscribe( {
				next  : urlSrc => resolve( urlSrc ) ,
				error : () => {
					resolve( null );
					this.notificationService.toastError( 'Lỗi không load được file content' );
				}
			} );
		} );
	}

	loadFileFromServerFile( name_or_id : string ) : Promise<string> {
		return new Promise<string>( resolve => {
			this.fileService.getImageContent( name_or_id ).subscribe(
				{
					next  : urlSrc => resolve( urlSrc ) ,
					error : () => {
						resolve( null );
						this.notificationService.toastError( 'Lỗi không load được file content' );
					}
				}
			);
		} );
	}

	loadFileFromGoogleServerFile( url : string ) : Promise<string> {
		return new Promise<string>( resolve => {
			this.fileService.getImageContentByUrl( url ).subscribe(
				{
					next  : urlSrc => resolve( urlSrc ) ,
					error : () => {
						resolve( null );
						this.notificationService.toastError( 'Lỗi không load được file content' );
					}
				}
			);
		} );
	}

	/**
	 *  URL for the audio file (anyone can view) https://drive.google.com/file/d/1nQklEicsMeGBnuk0vv6zkHtXtyGy10S-/view?usp=sharing
	 *  URL for playing the audio file https://docs.google.com/uc?export=download&id=1nQklEicsMeGBnuk0vv6zkHtXtyGy10S-
	 *  URL for downloading the audio file https://drive.google.com/uc?authuser=0&id=1nQklEicsMeGBnuk0vv6zkHtXtyGy10S-&export=download
	 *  <audio controls="controls"><source src="https://docs.google.com/uc?export=download&id=1nQklEicsMeGBnuk0vv6zkHtXtyGy10S-"></audio>
	 *  <a href="https://drive.google.com/uc?authuser=0&id=1nQklEicsMeGBnuk0vv6zkHtXtyGyO9S-&export=download"/>Download
	 *  */

	async playAudio() {
		if ( this.error || this._replay === 0 ) {
			return;
		}
		if ( this.audioElement.paused ) {
			await this.audioElement.play();
			this.isPlaying = true;
		} else {
			this.audioElement.pause();
			this.isPlaying = false;
		}
	}

	convertSecondToMinute( secondNumber : number ) : string {
		let s = Math.floor( secondNumber );
		if ( s <= 60 ) {
			return s < 10 ? `00:0${ s }` : `00:${ s }`;
		}
		const secs   = s % 60;
		s            = ( s - secs ) / 60;
		const mins   = s % 60;
		const result = [];
		result.push( mins < 10 ? '0' + mins.toString() : mins.toString() );
		result.push( secs < 10 ? '0' + secs.toString() : secs.toString() );
		return result.join( ':' );
	}

	calculatePercent( duration : number , currentTime : number ) : number {
		return ( currentTime / duration ) * 100;
	}

}
