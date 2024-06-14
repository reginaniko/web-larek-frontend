import { Component } from './base/Component';
import { createElement, ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

interface ICartView {
	itemsList: HTMLElement[];
	totalPrice: string;
}

export class CartView extends Component<ICartView> {
	protected _list: HTMLElement;
	protected _totalPrice: HTMLElement;
	protected _orderButton: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._totalPrice = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this._orderButton = ensureElement<HTMLElement>(
			'.basket__button',
			this.container
		);
		this.setDisabled(this._orderButton, true);
		if (this._orderButton) {
			this._orderButton.addEventListener('click', () => {
				events.emit('order: open');
			});
		}
		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			items.forEach((item, index) => {
				const indexValue = item.querySelector('.basket__item-index');
				if (indexValue) {
					indexValue.textContent = `${index + 1}`;
				}
			});
			this._list.replaceChildren(...items);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'В корзине ничего нет',
				})
			);
		}
	}

	set total(total: string) {
		this.setText(this._totalPrice, total);
	}

	set isButtonEnabled(value: number) {
		this.setDisabled(this._orderButton, value <= 0);
	}

	getContainer(): HTMLElement {
		return this.container;
	}
}
