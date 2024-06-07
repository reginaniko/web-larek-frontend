export interface IProductItem {
	_id: string;
	description?: string;
	image?: string;
	title: string;
	category?: string;
	price: number;
}

export interface IAppData {
	gallery: IProductItem[];
	cart: string[];
	preview: string | null;
	order: IOrder | null;
}

export interface IPaymentForm {
	payment: 'online' | 'upon receipt';
	address: string;
}

export interface IContactsForm {
	email: string;
	phone: string;
}

export interface IOrder extends IPaymentForm, IContactsForm {
	items: string[];
	total: number;
}

export interface IOrderResult {
	id: string;
	total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;
