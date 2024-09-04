// export interface NotificationMessage {
// 	room_id : string;
// 	type : string;
// 	title : string;
// 	message : string;
// }

export interface Notification extends QuickNotification {
	id : number;
	created_at : string;
	updated_at : string;
}

export interface QuickNotification {
	code : string;
	title : string;
	message : string;
	sender : number;
	receiver : { [ t : number ] : boolean };
	params : {
		author : string;
		email : string;
		avatar : string;
		type : 'normal' | 'warning' | 'danger';
		[ t : string ] : any
	};
}

export interface NotificationMessage {
	avatar : string;
	title : string;
	message : string;
	sender : number;
	receiver : { [ t : number ] : boolean };
	params : { created_at : string; code : string; [ t : string ] : any };
	file? : Object;
	user : { display_name : string; email : string };
	user_id : number;
	type : string;
}
