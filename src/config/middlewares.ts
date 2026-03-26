import morgan from 'morgan';
import cors from 'cors';
import { Express } from 'express';

export const setMiddlewares = (app: Express, express: any) => {
    //middlewares
    const morganFormat =
        '[:date[iso]] :method :url :status :res[content-length] - :response-time ms';
    app.use(morgan(morganFormat));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors());
};
