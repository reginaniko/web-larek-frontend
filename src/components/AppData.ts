import { IProductItem, IOrder, FormErrors, IAppModelData, IOrderForm } from '../types';
import { Model } from './base/Model';


export class AppData extends Model<IAppModelData> {
	protected cart: IProductItem[] = [];
	protected gallery: IProductItem[];
	protected loading: boolean;
	protected order: IOrderForm = {
		payment: null,
		address: '',
		email: '',
		phone: ''
	};
	protected preview: string | null;
	protected formErrors: FormErrors = {};

	setGallery(items: IProductItem[]) {
		this.gallery = items;
		this.emitChanges('items: changed', { gallery: this.gallery });
	}

	setPreview(item: IProductItem) {
		this.preview = item.id;
		this.emitChanges('preview: changed', item);
	}

	getProducts(): IProductItem[] {
		return this.gallery;
	}

  getCart(): IProductItem[] {
    return this.cart
  }

  setCart(cart: IProductItem[]) {
    this.cart = cart;
    this.emitChanges('cart: changed', { cart: this.cart });
  }

  getOrder(): IOrderForm {
		return this.order;
	}

  setOrder(order: IOrderForm){
    this.order = order;
  }

	getCartLength() {
		return this.cart.length;
	}

	setOrderField<K extends keyof IOrderForm>(field: K, value: IOrderForm[K]) {
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
    const existingItem = this.cart.some(cartItem => cartItem.id === item.id);
    if (!existingItem) {
        this.cart.push(item);
    }
    this.events.emit('cart: changed');
	}

  isInCart(item: IProductItem): boolean {
    return this.cart.some(cartItem => cartItem.id === item.id);
  }

	removeFromCart(id: string) {
		this.cart = this.cart.filter((cartItem) => cartItem.id !== id);
    this.events.emit('cart: changed');
	}

	getTotalPrice(): string {
    const total = this.cart.reduce((sum, item) => sum + (item.price || 0), 0);
    return total + ' синапсов';
	}

  createOrder(): IOrder {
		const filteredPriceless = this.cart.filter(item => item.price !== null);
    const items = filteredPriceless.map(item => item.id);
		const total = this.cart.reduce((sum, item) => sum + (item.price || 0), 0);
		return {
			payment: this.order.payment,
			address: this.order.address,
			email: this.order.email,
			phone: this.order.phone,
			items: items,
			total: total
		};
  }
}
