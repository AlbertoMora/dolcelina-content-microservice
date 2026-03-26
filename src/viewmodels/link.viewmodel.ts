export interface IGetLinkViewModel {
    id: string;
    contentType: string;
    contentName: string;
    filename: string;
    type?: 'video' | 'image' | 'audio';
}

export interface IGetBatchLinkFileViewModel {
    id?: string;
    contentType: string;
    contentName: string;
    filename: string;
}

export interface IGetBatchLinkViewModel {
    type?: 'video' | 'image' | 'audio';
    files: IGetBatchLinkFileViewModel[];
}
