import { IQueryViewModel } from '../types/commons.types';

export interface IGetProductsQueryViewModel extends IQueryViewModel {
    name?: string;
    calories?: number;
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
    category_id?: string;
}

export interface ICreateProductViewModel {
    title: string;
    description?: string;
    primary_image_id: string;
    price: number;
    category_id: string;
    stock?: number;
    servings_per_unit?: number;
    serving_size?: number;
    serving_unit?: string;
    energy?: number;
    carbs?: number;
    sugars?: number;
    diet_fiber?: number;
    added_sugars?: number;
    fat?: number;
    saturated_fat?: number;
    trans_fat?: number;
    cholesterol?: number;
    sodium?: number;
    protein?: number;
    is_active: boolean;
    images: string[];
}

export interface IUpdateProductViewModel {
    title?: string;
    description?: string;
    primary_image_id?: string;
    price?: number;
    category_id?: string;
    stock?: number;
    servings_per_unit?: number;
    serving_size?: number;
    serving_unit?: string;
    energy?: number;
    carbs?: number;
    sugars?: number;
    diet_fiber?: number;
    added_sugars?: number;
    fat?: number;
    saturated_fat?: number;
    trans_fat?: number;
    cholesterol?: number;
    sodium?: number;
    protein?: number;
    is_active?: boolean;
    images?: string[];
}

export interface ICreateCategoryViewModel {
    name: string;
    description?: string;
}

export interface IGetCategoryViewModel extends IQueryViewModel {
    id: string;
    name?: string;
    description?: string;
    creation_date?: Date;
}
