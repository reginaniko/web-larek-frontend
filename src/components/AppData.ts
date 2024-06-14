import { IProductItem, IAppData, IOrder, FormErrors } from '../types';
import { Model } from './base/Model';
import { ItemData } from './ItemData';

export class AppData extends Model<IAppData> {
	cart: IProductItem[] = [];
	gallery: IProductItem[];
	loading: boolean;
	order: IOrder = {
		payment: null,
		address: '',
		email: '',
		phone: '',
		items: [],
		total: 0,
	};
	preview: string | null;
	formErrors: FormErrors = {};

	setGallery(items: IProductItem[]) {
		this.gallery = items.map((item) => new ItemData(item, this.events));
		this.emitChanges('items: changed', { gallery: this.gallery });
	}

	setPreview(item: IProductItem) {
		this.preview = item.id;
		this.emitChanges('preview: changed', item);
	}

	getProducts(): IProductItem[] {
		return this.gallery;
	}

	getCartLength() {
		return this.cart.length;
	}

	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]) {
		if (
			field === 'payment' &&
			(value === 'online' || value === 'upon receipt')
		) {
			this.order[field] = value;
		} else if (field !== 'payment') {
			this.order[field] = value;
		}

		if (this.validateOrder()) {
			this.events.emit('order: ready', this.order);
		}
		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};

		if (this.order.payment === null) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('orderErrors: change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};

		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactsErrors: change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	addToCart(item: IProductItem) {
		this.cart.push(item);
		const totalPrice = this.getTotalPrice();
		const eventData = { totalPrice: totalPrice, unit: 'синапсов' };
		this.events.emit('cart: totalChanged', eventData);
	}

	removeFromCart(id: string) {
		this.cart = this.cart.filter((cartItem) => cartItem.id !== id);
	}

	getTotalPrice(): string {
		let total = 0;
		for (const item of this.cart) {
			total += item.price || 0;
		}
		return total + ' синапсов';
	}
}
