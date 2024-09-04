export interface MediaFolder {
    id?: number;
    name: string;
    slug: string;
    parent_id: number;
    created_by?: number;
    updated_by?: number;
    created_at?: Date;
    updated_at?: Date;
    is_deleted?: number;
}