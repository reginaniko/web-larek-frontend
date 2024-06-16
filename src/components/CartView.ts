// import { Component } from './base/Component';
// import { createElement, ensureElement } from '../utils/utils';
// import { EventEmitter } from './base/events';
// import { IProductItem } from '../types';

// interface ICartView {
// 	items: HTMLElement[];
// 	totalPrice: string;
// 	isButtonEnabled: number;
// }

// export class CartView extends Component<ICartView>{
// 	protected itemslist: HTMLElement;
// 	protected totalPrice: HTMLElement;
// 	protected orderButton: HTMLElement;

// 	constructor(container: HTMLElement, protected events: EventEmitter) {
// 		super(container);

// 		this.itemslist = ensureElement<HTMLElement>('.basket__list', this.container);
// 		this.totalPrice = ensureElement<HTMLElement>(
// 			'.basket__price',
// 			this.container
// 		);
// 		this.orderButton = ensureElement<HTMLElement>(
// 			'.basket__button',
// 			this.container
// 		);
// 		this.setDisabled(this.orderButton, true);
// 		if (this.orderButton) {
// 			this.orderButton.addEventListener('click', () => {
// 				events.emit('order: open');
// 			});
// 		}
// 		this.items = [];
// 	}

// 	set items(items: HTMLElement[]) {
// 		if (items.length) {
// 			this.itemslist.replaceChildren();
// 		} else {
// 			this.itemslist.replaceChildren(
// 				createElement<HTMLParagraphElement>('p', {
// 					textContent: 'В корзине ничего нет',
// 				})
// 			);
// 		}
// 	}

// 	set total(total: string) {
// 		this.setText(this.totalPrice, total);
// 	}

// 	set isButtonEnabled(value: number) {
// 		this.setDisabled(this.orderButton, value <= 0);
// 	}
// }
import { Component } from './base/Component';
import { EventEmitter } from './base/events';
import { createElement, ensureElement } from '../utils/utils';
import { IAppModelData } from '../types';


interface ICartView {
    items: HTMLElement[];
    totalPrice: string;
}

export class CartView extends Component<ICartView> {
    protected _itemsList: HTMLElement;
    protected _totalPrice: HTMLElement;
    protected _orderButton: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._itemsList = ensureElement<HTMLElement>('.basket__list', this.container);
        this._totalPrice = ensureElement<HTMLElement>('.basket__price', this.container);
        this._orderButton = ensureElement<HTMLElement>('.basket__button', this.container);
		this.setDisabled(this._orderButton, true); 

        this._orderButton.addEventListener('click', () => {
            this.events.emit('order: open');
        });
		this.items = [];
    }

    set items(items: HTMLElement[]) {
        if(items.length) {
			this._itemsList.replaceChildren(...items);
			this.setDisabled(this._orderButton, false);
		  } else {
			this._itemsList.replaceChildren(
			  createElement<HTMLParagraphElement>('p', {
				textContent: 'В корзине ничего нет'
			  }));
			  this.setDisabled(this._orderButton, true);
		  }
    }

    set totalPrice(total: string) {
        this.setText(this._totalPrice, total);
    }
}