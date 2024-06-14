import { ensureElement } from '../utils/utils';
import { IProductItem } from "../types";
import { IEvents } from './base/events';
import { Component } from './base/Component';

export class ItemView extends Component<IProductItem> {
    protected _id: string;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _index: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _description: HTMLElement;
    protected viewType: 'compact' | 'detail' | 'gallery';
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents, viewType: 'compact' | 'detail' | 'gallery') {
        super(container);
        this.events = events;
        this.viewType = viewType;

        this.initializeView();
    }

    private initializeView() {
        switch (this.viewType) {
            case 'compact':
                this._title = ensureElement<HTMLElement>(`.card__title`, this.container);
                this._price = ensureElement<HTMLElement>(`.card__price`, this.container);
                this._index = ensureElement<HTMLElement>('.basket__item-index', this.container);
                this._button = ensureElement<HTMLButtonElement>(`.basket__item-delete`, this.container);
                this._button.addEventListener('click', () => this.onClick('item: removeCart'));
                break;
            case 'detail':
                this._title = ensureElement<HTMLElement>(`.card__title`, this.container);
                this._price = ensureElement<HTMLElement>(`.card__price`, this.container);        
                this._category = ensureElement<HTMLElement>(`.card__category`, this.container);
                this._image = ensureElement<HTMLImageElement>(`.card__image`, this.container);
                this._description = ensureElement<HTMLElement>(`.card__text`, this.container);
                this._button = ensureElement<HTMLButtonElement>(`.card__button`, this.container);
                this._button.addEventListener('click',  () => this.onClick('item: addToCart'));
                
                break;
            case 'gallery':
                this._title = ensureElement<HTMLElement>(`.card__title`, this.container);
                this._price = ensureElement<HTMLElement>(`.card__price`, this.container);        
                this._category = ensureElement<HTMLElement>(`.card__category`, this.container);
                this._image = ensureElement<HTMLImageElement>(`.card__image`, this.container);
                this.container.addEventListener('click', () => this.onClick('item: click'));
                break;
        }
    }

    onClick(eventName: string) {
        this.events.emit(eventName, { id: this._id });
    }

    set id(value: string) {
        this._id = value;
    }

    get id() {
        return this._id;
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set category(value: string) {
        const categoryMap = new Map([
            ['другое', 'other'],
            ['софт-скил', 'soft'],
            ['дополнительное', 'additional'],
            ['кнопка', 'button'],
            ['хард-скил', 'hard']
        ]);
        const categoryClass = categoryMap.get(value);
        if (categoryClass) {
            this.toggleClass(this._category, `card__category_${categoryClass}`, true);
            this.setText(this._category, value);
        }
    }

    set price(value: string | number) {
        const priceText = (value !== null && value !== undefined) ? `${value} синапсов` : 'Бесценно';
        this.setText(this._price, priceText);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set button(value: string) {
        this.setText(this._button, value);
    }

    set index(value: string) {
        this.setText(this._index, value);
    }

    getContainer(): HTMLElement {
        return this.container;
    }
}
