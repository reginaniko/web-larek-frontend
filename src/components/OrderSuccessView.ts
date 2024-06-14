import { IOrderSuccess } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/events";


export class OrderSuccessView extends Component<IOrderSuccess> {
	protected _button: HTMLButtonElement;
	protected _orderTotal: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this._button = ensureElement<HTMLButtonElement>('.order-success__close', this.container)
		this._orderTotal = ensureElement<HTMLElement>('.order-success__description', this.container)

        this._button.addEventListener('click', () => {this.events.emit('success: close')})
	}

	set orderTotal(value: number) {
		this._orderTotal.textContent = 'Списано ' + value + ' синапсов';
	}
}