import { IQueryViewModel } from '../types/commons.types';

export interface IGetBannersQueryViewModel extends IQueryViewModel {
    title?: string;
    description?: string;
    has_button?: boolean;
    is_active?: boolean;
}

export interface ICreateBannerViewModel {
    title: string;
    description: string;
    redirects: string;
    image_url: string;
    is_active: boolean;
    has_button: boolean;
    btn_text?: string;
    btn_icon?: string;
}
