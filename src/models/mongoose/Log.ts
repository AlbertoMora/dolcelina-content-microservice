import mongoose, { Date, Document, Schema } from 'mongoose';

export interface ILog extends Document {
    transactionId: string;
    level: string;
    message: string;
    type: string;
    module: string;
    error?: string;
    timestamp: Date;
}

export const LogSchema: Schema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    level: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    module: { type: String, required: true },
    error: { type: String, required: false },
    timestamp: { type: Date, required: true },
});

const LogModel = mongoose.model<ILog>('Log', LogSchema);

export default LogModel;
