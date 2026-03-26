import mongoose, { Document, Schema } from 'mongoose';

export interface IDangerousField extends Document {
    name: string;
    isActive: boolean;
    skippedUsers: string[];
}

export const DangerousFieldSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    skippedUsers: [{ type: String, required: true }],
});

export const DangerousFieldModel = mongoose.model<IDangerousField>(
    'DangerousField',
    DangerousFieldSchema
);
