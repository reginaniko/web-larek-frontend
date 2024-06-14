import { IContactsForm } from '../types';
import { IEvents } from './base/events';
import { Form } from './base/Form';

export class ContactsView extends Form<IContactsForm> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._email = container.elements.namedItem('email') as HTMLInputElement;
		this._phone = container.elements.namedItem('phone') as HTMLInputElement;

		this._submitButton.addEventListener('click', () => {
			events.emit('order: post');
			(container.elements.namedItem('email') as HTMLInputElement).value = '';
			(container.elements.namedItem('phone') as HTMLInputElement).value = '';
		});
	}
}
