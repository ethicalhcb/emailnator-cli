import sqlite3 from 'sqlite3';

export const listEmailsToDatabase = () => new Promise((resolve, reject) => {
    const db = new sqlite3.Database('emails.db');
    db.all('SELECT * FROM emails', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
    db.close();
});
