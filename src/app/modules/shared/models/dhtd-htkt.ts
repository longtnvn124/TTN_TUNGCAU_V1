export type DhtdHtktEventsName = 'update' | 'delete' | 'create' | 'deleteAll';

export type DhtdHtktHandleEvents = { [T in DhtdHtktEventsName as string] : ( info : DhtdHtktEvent ) => void }

export interface DhtdHtkt {
	id : number,
	dhtd_htkt_id : number;
	dhtd_htkt_ten : string;
}

export interface DhtdHtktEvent {
	id : number, // id của đối tượng đang tương tác( thêm, sửa, xóa)
	action : DhtdHtktEventsName; // tên hành động
	data : DhtdHtkt // danh hiệu thi đua
}
