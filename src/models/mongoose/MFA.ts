import mongoose, { Date, Document, Schema, Types } from 'mongoose';

export interface IMfa extends Document {
    _id: string;
    code: string;
    dueDate: Date;
    sessionId: string;
    userId: string;
    deviceId: string;
    used: boolean;
}

export const MfaSchema: Schema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: true },
    code: { type: String, required: true },
    dueDate: { type: Date, required: true },
    sessionId: { type: Types.ObjectId, required: true },
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
    used: { type: Boolean, required: true },
});

const MfaModel = mongoose.model<IMfa>('MFA', MfaSchema);

export default MfaModel;
