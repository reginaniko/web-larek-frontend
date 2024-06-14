import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export interface IForm {
	isValid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IForm> {
	protected _submitButton: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submitButton = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value as T[keyof T];
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit(`${this.container.name}: submit`);
		});
	}

	protected onInputChange<K extends keyof T>(field: K, value: T[K]) {
		this.events.emit(`orderInput: change`, {
			field,
			value,
		});
	}

	set isValid(value: boolean) {
		this._submitButton.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	render(state: Partial<T> & IForm) {
		const { isValid, errors, ...inputs } = state;
		super.render({ isValid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}
