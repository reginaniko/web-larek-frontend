import { IProductItem } from '../types';
import { Model } from './base/Model';

export class ItemData extends Model<IProductItem> {
	description?: string;
	id: string;
	image: string;
	title: string;
	price: number | null;
	category: string;
}
