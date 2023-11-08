import sqlite3 from 'sqlite3';

export function clearEmailsToDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('emails.db', (err) => {
      if (err) {
        reject(err);
      }
    });

    db.run('DELETE FROM emails', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

    db.close();
  });
}