use rusqlite::Connection as SqliteConnection;
use rusqlite::Error as SqliteError;

pub struct Repository {
  pub connection: SqliteConnection,
}

impl Repository {
  pub fn new(filename: &str) -> Result<Self, SqliteError> {
    let connection = SqliteConnection::open(filename)?;

    connection.execute(
      "
      CREATE TABLE IF NOT EXISTS users (
        username TEXT NOT NULL,
        password TEXT NOT NULL
      );
  ",
      [],
    )?;

    connection.execute(
      "
      CREATE TABLE IF NOT EXISTS messages (
        text TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(ROWID)
      );
  ",
      [],
    )?;

    Ok(Self { connection })
  }
}
