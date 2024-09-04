import { AbstractControl , ValidationErrors } from '@angular/forms';
import * as moment from 'moment/moment';

// export const PHONE_REGEX : RegExp        = /^(([+]{0,1}\d{2})|\d{2}?)[\-\s\d]{2,15}$/gmi;
export const PHONE_REGEX : RegExp        = /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

// export const EMAIL_REGEX : RegExp        = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const EMAIL_REGEX : RegExp        = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const DDMMYYYYDateFormatValidator = ( control : AbstractControl ) : ValidationErrors | null => ( !control.value || moment( control.value , 'DD/MM/YYYY' , true ).isValid() ) ? null : { theDateDoesNotExist : true };
export const PhoneNumberValidator        = ( control : AbstractControl ) : ValidationErrors | null => control.value ? PHONE_REGEX.test( control.value ) ? null : { invalidPhoneNumberStructure : true } : null;

export const EmailCheckValidator         = (control : AbstractControl)   : ValidationErrors | null => control.value ?EMAIL_REGEX.test(control.value) ? null : { invalidEmailCheckStructure : true } : null;
