import { Options, Sequelize } from 'sequelize';
import { initModels } from '../models/mariadb/init-models';

import fs from 'node:fs';
import { IDbSecrets, OpenbaoVaultClient } from '@aure/commons';
import { dbKey } from '../constants/secrets-contants';

export class SequelizeService {
    private static instance: SequelizeService;
    private static openBaoClient: OpenbaoVaultClient;
    private static initializing?: Promise<void>;

    public isReady: boolean = false;
    public db!: ReturnType<typeof initModels>;
    public sequelize!: Sequelize;
    private readonly host: string;
    private readonly port: number;

    private constructor() {
        const { DB_HOST: dbHost, DB_PORT: dbPort } = process.env;
        SequelizeService.openBaoClient = OpenbaoVaultClient.getInstance();
        this.host = dbHost ?? 'localhost';
        this.port = Number(dbPort) || 3306;
    }

    public static async getInstance(): Promise<SequelizeService> {
        if (!SequelizeService.instance) {
            SequelizeService.instance = new SequelizeService();
        }

        if (!SequelizeService.instance.isReady) {
            SequelizeService.initializing ??= SequelizeService.instance.initialize().catch(err => {
                SequelizeService.initializing = undefined;
                throw err;
            });
            await SequelizeService.initializing;
        }

        return SequelizeService.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isReady) {
            return;
        }

        await this.initDb();
        await this.testConnection();
    }

    private async initDb(): Promise<void> {
        const dbSecrets = await SequelizeService.openBaoClient.getSecret<IDbSecrets>(dbKey);

        const dbOptions: Options = {
            dialect: 'mariadb',
            host: this.host,
            port: this.port,
            pool: {
                min: 0,
                max: 5,
                idle: 10000,
            },
            define: {
                charset: 'utf8mb4',
                timestamps: false,
            },
            benchmark: false,
            logging: false,
        };

        if (process.env.NODE_ENV === 'production') {
            dbOptions.dialectOptions = {
                ssl: {
                    ca: fs.readFileSync(__dirname + '/certificates/mysql-ca-main.crt'),
                },
            };
        }

        this.sequelize = new Sequelize(
            dbSecrets.dbName,
            dbSecrets.dbUser,
            dbSecrets.dbPassword,
            dbOptions,
        );

        this.db = initModels(this.sequelize);
        this.isReady = true;
    }

    private async testConnection(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            console.log(
                `Connection has been established successfully. DB running on port ${this.port}`,
            );
        } catch (err) {
            console.error('Unable to connect to the database:', err);
            throw err; // Propagar el error para manejo externo
        }
    }

    public async close(): Promise<void> {
        if (this.sequelize) {
            await this.sequelize.close();
            this.isReady = false;
            console.log('Database connection closed');
        }
    }

    public getStatus(): { isReady: boolean; host: string; port: number } {
        return {
            isReady: this.isReady,
            host: this.host,
            port: this.port,
        };
    }
}
