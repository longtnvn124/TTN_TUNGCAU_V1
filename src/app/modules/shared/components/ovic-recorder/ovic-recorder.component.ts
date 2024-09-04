import { Component , EventEmitter , Input , OnChanges , OnInit , Output , SimpleChanges } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import * as MicRecorder from 'mic-recorder-to-mp3';

@Component( {
	selector    : 'ovic-recorder' ,
	templateUrl : './ovic-recorder.component.html' ,
	styleUrls   : [ './ovic-recorder.component.css' ]
} )
export class OvicRecorderComponent implements OnInit , OnChanges {

	recorder = new MicRecorder( {
		bitRate : 128
	} );

	isRecording : boolean;

	recordingTimer = '00:00';

	_file : File;

	/*Url of Blob*/
	_url : string;

	interval = null;

	@Input() file : File;

	@Output() outputFile = new EventEmitter<File>();

	@Output() outputUrlObject = new EventEmitter<string>();

	constructor(
		private notificationService : NotificationService
	) { }

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'file' ] && this.file ) {
			this._url = URL.createObjectURL( this.file );
		}
	}

	ngOnInit() : void {
		this.isRecording = false;
	}

	recordSound() {
		if ( this.isRecording ) {
			this.isRecording = false;
			this.stopRecording();
		} else {
			// Start recording. Browser will request permission to use your microphone.
			this.recorder.start().then( () => {
				this._url        = null;
				this.isRecording = true;
				this.startCountdown();
			} ).catch( this.errorCallback );
		}
	}

	startCountdown( clearTime = false , limit = '10:00' ) {
		this.recordingTimer = limit || '10:00';
		clearInterval( this.interval );
		if ( clearTime ) { return; }
		this.interval = setInterval( () => {
			let timer : any = this.recordingTimer;
			timer           = timer.split( ':' );
			let minutes     = +timer[ 0 ];
			let seconds     = +timer[ 1 ];

			if ( seconds === 0 && minutes === 0 ) {
				this.stopRecording();
				clearInterval( this.interval );
				return;
			}
			--seconds;
			if ( seconds < 0 ) {
				--minutes;
				seconds = 59;
			}

			if ( seconds < 10 ) {
				this.recordingTimer = `0${ minutes }:0${ seconds }`;
			} else {
				this.recordingTimer = `0${ minutes }:${ seconds }`;
			}
		} , 1000 );
	}

	/**
	 * Process Error.
	 */
	errorCallback( error ) {
		// this.notificationService.showError( 'Can not play audio in your browser' , 'error' );
		this.notificationService.alertError( 'error' , 'Can not play audio in your browser' ).then( () => null , () => null );
	}

	/**
	 * Stop recording.
	 */
	stopRecording() {
		this.startCountdown( true );
		this.isRecording = false;
		this.recorder.stop().getMp3().then( ( [ buffer , blob ] ) => {
			// do what ever you want with buffer and blob
			// Example: Create a mp3 file and play
			const _d   = Date.now();
			this._file = new File( buffer , `recorder-${ _d }.mp3` , {
				type         : blob.type ,
				lastModified : _d
			} );
			// const player = new Audio( URL.createObjectURL( file ) );
			// player.play();
			this._url = URL.createObjectURL( this._file );
			this.outputFile.emit( this._file );
			this.outputUrlObject.emit( this._url );
		} ).catch( this.errorCallback );
	}

}
