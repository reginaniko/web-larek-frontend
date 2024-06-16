export interface IProductItem {
	id: string;
	description?: string;
	image?: string;
	title: string;
	category?: string;
	price: number;
}

export interface IAppModelData {
	gallery: IProductItem[];
}

export interface IPaymentForm {
	payment: 'online' | 'upon receipt';
	address: string;
}

export interface IContactsForm {
	email: string;
	phone: string;
}

export interface IOrderForm extends IPaymentForm, IContactsForm{}


export interface IOrder extends IPaymentForm, IContactsForm {
	items: string[];
	total: number;
}

export interface IOrderResult {
	id: string;
	total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderSuccess {
	orderTotal: number;
}