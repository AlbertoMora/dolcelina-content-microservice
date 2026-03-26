import { Express } from 'express';

export const appStart = (server: any, app: Express) => {
    //starting server
    server.listen(app.get('port'), () => {
        console.log(
            `Server running on port: ${app.get('port')}, environment: ${
                process.env.NODE_ENV ?? 'development'
            }`
        );
    });
};
