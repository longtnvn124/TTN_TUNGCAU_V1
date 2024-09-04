export type IctuQueryParamName = 'include' | 'include_by' | 'exclude' | 'exclude_by' | 'condition' | 'max' | 'min' | 'sum' | 'avg' | 'limit' | 'offset' | 'paged' | 'orderby' | 'order' | 'groupby' | 'pluck' | 'select' | 'first' | 'with';
export type IctuQueryParams = {
	[T in IctuQueryParamName]? : string | number;
}
