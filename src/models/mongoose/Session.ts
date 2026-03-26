import mongoose, { Date, Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
    _id: string;
    userId: string;
    deviceId: string;
    location: string;
    deviceOS: string;
    isActive: boolean;
    sessionIP: string;
    rsaPubKey: string;
    signedInSince: Date;
}

export const SessionSchema: Schema = new mongoose.Schema({
    _id: { type: Types.ObjectId, required: true },
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
    location: { type: String, required: true },
    deviceOS: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    sessionIP: { type: String, required: true },
    signedInSince: { type: Date, required: true },
});

const Session = mongoose.model<ISession>('Session', SessionSchema);

export default Session;
