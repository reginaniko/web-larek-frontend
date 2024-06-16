import { IPaymentForm } from '../types';
import { Form } from './base/Form';
import { IEvents } from './base/events';

export class OrderView extends Form<IPaymentForm> {
	private _cash?: HTMLButtonElement;
	private _card?: HTMLButtonElement;
	private _button: HTMLButtonElement;
	private _address: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._cash = container.elements.namedItem('cash') as HTMLButtonElement;
		this._card = container.elements.namedItem('card') as HTMLButtonElement;
		this._address = container.elements.namedItem('address') as HTMLInputElement;
		this._button = container.querySelector(
			'.order__button'
		) as HTMLButtonElement;

		this.attachEventListeners(events);
	}

	private attachEventListeners(events: IEvents): void {
		this._button.addEventListener('click', () => events.emit('contacts: open'));

		this._cash?.addEventListener('click', () =>
			this.handlePaymentSelection('upon receipt')
		);
		this._card?.addEventListener('click', () =>
			this.handlePaymentSelection('online')
		);
	}

	private handlePaymentSelection(paymentType: 'upon receipt' | 'online'): void {
		if (paymentType === 'upon receipt') {
			this.toggleClass(this._cash!, 'button_alt-active', true);
			this.toggleClass(this._card!, 'button_alt-active', false);
		} else {
			this.toggleClass(this._card!, 'button_alt-active', true);
			this.toggleClass(this._cash!, 'button_alt-active', false);
		}
		this.onInputChange('payment', paymentType);
	}

	clearForm() {
		if (this._cash && this._card) {
			this.toggleClass(this._cash, 'button_alt-active', false);
			this.toggleClass(this._card, 'button_alt-active', false);
		}
		this._address.value = '';
		this.isValid = false;
		this.errors = '';
	}
}
