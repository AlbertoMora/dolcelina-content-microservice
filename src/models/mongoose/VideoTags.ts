import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoTag extends Document {
    name: string;
    key: string;
    isActive: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const VideoTagSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    isActive: { type: Boolean, required: true, default: true },
    description: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const VideoTagModel = mongoose.model<IVideoTag>('VideoTag', VideoTagSchema);

export default VideoTagModel;
