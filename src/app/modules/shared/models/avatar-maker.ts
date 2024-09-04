import { ImageCroppedEvent } from 'ngx-image-cropper';

/*error code
 * 1 : Successful
 * -1 : Cancel by user
 * -2 : User does block camera
 * -3 : Requested device not found
 * */

export interface AvatarMaker {
	error : boolean;
	errorCode : number;
	data : ImageCroppedEvent | any;
	message : string;
}
