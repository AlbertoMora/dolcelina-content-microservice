import slugify from 'slugify';

export const stringToSlug = (str: string, shouldRemove?: boolean) => {
    return slugify(str, {
        strict: true,
        trim: true,
        lower: true,
        remove: shouldRemove ? /[^a-zA-Z0-9.\s]/g : undefined,
    });
};
