import mongoose, { Document, Types } from 'mongoose';

export interface IUserSettings extends Document {
    _id: string;
    userId: string;
    language: string;
    theme: string;
    active: boolean;
}

export const UserSettingSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: true },
    userId: { type: String, required: true },
    active: { type: Boolean, required: true },
    language: { type: String },
    theme: { type: String },
});

const UserSettings = mongoose.model<IUserSettings>('UserSettings', UserSettingSchema);

export default UserSettings;
