import { User } from '@core/models/user';
import { Ucase } from '@core/models/ucase';

export interface SimpleRole {
  id : number;
	description : string,
	name : string,
	ordering : string,
	title : string
}

export interface Auth {
	expires : string;
	session_id : string;
	data : User;
}

export interface Token {
	access_token : string;
	refresh_token : string;
}

export interface Permission {
	data : {
		menus : Ucase[];
		roles : SimpleRole[]; // list role name
	};
}

export interface UserSignIn {
	username : string,
	password : string,
}

export interface GoogleSignIn {
	clientId : string;
	client_id : string;
	credential : string;
	select_by : string;
}
