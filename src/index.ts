import './scss/styles.scss';
import { Api, ApiListResponse } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';
import { IProductItem, IOrder, IOrderForm } from './types';
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
	pageView.gallery = appData.getProducts().map((item: IProductItem) => {
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
            isInCart: appData.isInCart(item),
		}),
	});

    cardPreview.onClick = () => {
		events.emit('item: toCart', item);
	};
});

//добавляем товар в корзину
events.on('item: toCart', (item: IProductItem) => {
	appData.addToCart(item);
	modal.close();
});


//событие клика на кнопку корзины
events.on('cart: open', () => {
    modal.render({
        content: cartView.render({})
      })
});

//событие изменения корзины
events.on('cart: changed', ()=>{

    pageView.counter = appData.getCartLength();

    const items = appData.getCart().map((item, index) => {
	    const itemCardView = new ItemView(
			cloneTemplate(cardCartTemplate),
			events,
			'compact'
		)
        itemCardView.onClick = () => events.emit('item: removeCart', item);
            return itemCardView.render({
            index: (index + 1).toString(),
            title: item.title,
            price: item.price
        })
    })

	cartView.items = items;
	cartView.totalPrice = `${appData.getTotalPrice()}`;
})

//удалить товар из корзины
events.on('item: removeCart', (item: IProductItem) => {
	appData.removeFromCart(item.id);
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
    const orderForm = appData.getOrder();
	modal.render({
		content: order.render({
			payment: orderForm.payment,
			address: orderForm.address,
			isValid: false,
			errors: [],
		}),
	});
});

// нажатие на кнопку далее (форма оплаты)
events.on('contacts: open', () => {
    const orderForm = appData.getOrder();
	modal.render({
		content: contacts.render({
			phone: orderForm.phone,
			email: orderForm.email,
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
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

//оправить Апи заказа
events.on('contacts: submit', () => {

    api
		.post('/order', appData.createOrder())
		.then((res: ApiListResponse<string>) => {
			appData.setCart([]);
			appData.setOrder({
				address: '',
				email: '',
				phone: '',
				payment: null,
			});
            order.clearForm();
            contacts.clearForm();
			events.emit('success: open', res);
		})
		.catch((err) => {
			console.error(err);
            appData.setOrder({
                address: '',
                email: '',
                phone: '',
                payment: null,
            });
            order.clearForm();
            contacts.clearForm();
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
