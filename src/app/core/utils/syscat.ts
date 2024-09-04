import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';

export const NORMAL_MODAL_OPTIONS : NgbModalOptions = {
	size        : 'md' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : 'ovic-modal-class'
};

export const NORMAL_MODAL_OPTIONS_ROUND : NgbModalOptions = {
	size        : 'md' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : 'ovic-modal-class ovic-modal--rounded'
};

export const ALERT_MODAL_OPTIONS : NgbModalOptions = {
	size        : 'md' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : 'ovic-modal-class ovic-alert-modal-class'
};
export const MODAL_SIZE_AUTO : NgbModalOptions = {
  size        : 'lg' ,
  backdrop    : 'static' ,
  centered    : true ,
  windowClass : 'ovic-modal-class ovic-modal-class--size-auto'
};
