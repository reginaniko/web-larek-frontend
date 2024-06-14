import './scss/styles.scss';
import { Api, ApiListResponse } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';
import { IProductItem, IOrder } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/base/Modal';
import { EventEmitter } from './components/base/events';
import { ItemView } from './components/ItemView';
import { AppData } from './components/AppData';
import { PageView } from './components/PageView';
import { CartView } from './components/CartView';
import { OrderView } from './components/OrderView';
import { ContactsView } from './components/ContactsView';
import { OrderSuccessView } from './components/OrderSuccessView';

//Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardCartTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalElement = ensureElement<HTMLElement>('#modal-container');

//Данные
type ItemListResponse = ApiListResponse<IProductItem>;
const api = new Api(API_URL);
const events = new EventEmitter();
const modal = new Modal(modalElement, events);
const appData = new AppData({}, events);
const pageView = new PageView(document.body, events);
const cartView = new CartView(cloneTemplate(cartTemplate), events);
const order = new OrderView(cloneTemplate(orderTemplate), events);
const contacts = new ContactsView(cloneTemplate(contactsTemplate), events);
const successView = new OrderSuccessView(
	cloneTemplate(successTemplate),
	events
);

// Получаем список товаров
api.get('/product/').then((response: ItemListResponse) => {
	const items = response.items;
	appData.setGallery(items);
});

events.on('items: changed', () => {
	pageView.gallery = appData.gallery.map((item: IProductItem) => {
		const card = new ItemView(
			cloneTemplate(cardCatalogTemplate),
			events,
			'gallery'
		);
		card.onClick = () => events.emit('item: click', item);

		return card.render({
			id: item.id,
			title: item.title,
			image: `${CDN_URL}/${item.image}`,
			category: item.category,
			price: item.price,
		});
	});
});

//получили ID элемнта в модель
events.on('item: click', (item: IProductItem) => {
	appData.setPreview(item);
});

//обработали view открытия карточки
events.on('preview: changed', (item: IProductItem) => {
	const cardPreview = new ItemView(
		cloneTemplate(cardPreviewTemplate),
		events,
		'detail'
	);

	modal.render({
		content: cardPreview.render({
			title: item.title,
			image: `${CDN_URL}/${item.image}`,
			category: item.category,
			price: item.price,
			description: item.description,
		}),
	});
	cardPreview.onClick = () => events.emit('item: toCart', item);
});

//добавляем товар в корзину
events.on('item: toCart', (item: IProductItem) => {
	//добавили в модель
	appData.addToCart(item);
	// установили счетчик корзины
	pageView.counter = appData.cart.length;
	//закрыли модальное окно
	modal.close();
});

//событие клика на кнопку корзины
events.on('cart: open', (item: IProductItem) => {
	console.log(appData.cart);
	const cartView = new CartView(cloneTemplate(cartTemplate), events);

	const items = appData.cart.map((item, index) => {
		const itemCardView = new ItemView(
			cloneTemplate(cardCartTemplate),
			events,
			'compact'
		);
		itemCardView.onClick = () => events.emit('item: removeCart', item);

		itemCardView.index = (index + 1).toString();
		itemCardView.title = item.title;
		itemCardView.price = item.price;
		return itemCardView.getContainer();
	});

	cartView.items = items;
	cartView.total = `${appData.getTotalPrice()}`;
	cartView.isButtonEnabled = items.length;

	modal.render({
		content: cartView.getContainer(),
	});
});

//удалить товар из корзины
events.on('item: removeCart', (item: IProductItem) => {
	appData.removeFromCart(item.id);

	const items = appData.cart.map((item, index) => {
		const itemCardView = new ItemView(
			cloneTemplate(cardCartTemplate),
			events,
			'compact'
		);
		itemCardView.onClick = () => events.emit('item: removeCart', item);

		itemCardView.index = (index + 1).toString();
		itemCardView.title = item.title;
		itemCardView.price = item.price;
		return itemCardView.getContainer();
	});

	cartView.items = items;
	cartView.total = `${appData.getTotalPrice()}`;
	cartView.isButtonEnabled = items.length;

	modal.render({
		content: cartView.getContainer(),
	});
});

// Блокировка прокрутки страницы при открытом модальном окне
events.on('modal:open', () => {
	pageView.locked = true;
});

// Разблокировка прокрутки страницы при закрытии модального окна
events.on('modal:close', () => {
	pageView.locked = false;
});

//нажатие на кнопку оформить из корзины
events.on('order: open', () => {
	modal.render({
		content: order.render({
			payment: null,
			address: '',
			isValid: false,
			errors: [],
		}),
	});
});

// нажатие на кнопку далее (форма оплаты)
events.on('contacts: open', () => {
	modal.render({
		content: contacts.render({
			phone: '',
			email: '',
			isValid: false,
			errors: [],
		}),
	});
});

//валидация формы оплаты заказа
events.on('orderErrors: change', (errors: Partial<IOrder>) => {
	const { address, payment } = errors;
	order.isValid = !address && !payment;
	order.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

//валидация формы контактов заказа
events.on('contactsErrors: change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.isValid = !email && !phone;
	contacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

//ввод данных в одно из полей форм заказа
events.on(
	'orderInput: change',
	(data: { field: keyof IOrder; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

//оправить Апи заказа
events.on('order: post', () => {
	appData.order.total = +appData.getTotalPrice().split(' ')[0];
	appData.order.items = appData.cart.map((item) => item.id);

	api
		.post('/order', appData.order)
		.then((res: ApiListResponse<string>) => {
			appData.cart = [];
			cartView.items = [];
			cartView.total = '0 синапсов';
			appData.order = {
				items: [],
				total: null,
				address: '',
				email: '',
				phone: '',
				payment: null,
			};
			pageView.counter = 0;
			events.emit('success: open', res);
		})
		.catch((err) => {
			console.error(err);
		});
});

//открыть окно успешной оплаты заказа
events.on('success: open', (res: ApiListResponse<string>) => {
	modal.render({
		content: successView.render({
			orderTotal: res.total,
		}),
	});
});

//закрыть окно успешной оплаты заказа
events.on('success: close', () => {
	modal.close();
});
