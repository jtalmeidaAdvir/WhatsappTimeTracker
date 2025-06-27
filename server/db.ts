import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER || 'sa',
            password: process.env.DB_PASSWORD || '1234',
        }
    },
    options: {
        encrypt: true,
        trustServerCertificate: true,  // Ignora erro self-signed cert
        database: process.env.DB_NAME || 'Advir',
        port: Number(process.env.DB_PORT) || 1433,
    }
};

export const pool = new sql.ConnectionPool(config);

pool.connect().catch(err => {
    console.error('Database connection error:', err);
});

export const db = pool;
