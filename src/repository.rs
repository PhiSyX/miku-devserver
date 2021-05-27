use rusqlite::params;
use rusqlite::Connection as SqliteConnection;
use rusqlite::Error as SqliteError;

use crate::model::User;
use crate::model::UserInfo;

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
        password TEXT NOT NULL,

        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INTEGER NOT NULL
      );
  ",
      [],
    )?;

    Ok(Self { connection })
  }

  pub fn create_user(
    &self,

    username: impl AsRef<str>,
    password: impl AsRef<str>,
    first_name: impl AsRef<str>,
    last_name: impl AsRef<str>,
    age: impl AsRef<str>,
  ) -> Result<Option<User>, SqliteError> {
    self.connection.execute(
      "INSERT INTO users (username,password,first_name,last_name,age) VALUES (?, ?, ?, ?, ?)",
      params![
        username.as_ref(),
        password.as_ref(),
        first_name.as_ref(),
        last_name.as_ref(),
        age.as_ref(),
      ],
    )?;

    Ok(self.find_one_user(username)?.get(0).cloned())
  }

  pub fn delete_user(
    &self,
    user_last_name: impl AsRef<str>,
  ) -> Result<usize, SqliteError> {
    let mut req = self.connection.prepare(
      "
        DELETE FROM `users`
        WHERE `last_name` = ?1
      ",
    )?;

    return req.execute(params![user_last_name.as_ref()]);
  }

  pub fn find_one_user(
    &self,
    username: impl AsRef<str>,
  ) -> Result<Vec<User>, SqliteError> {
    let mut req = self.connection.prepare(
      "
            SELECT ROWID, username, password, first_name, last_name, age
            FROM users
            WHERE username = ?
        ",
    )?;

    return req
      .query_map(params![username.as_ref()], |row| {
        Ok(User {
          id: row.get(0)?,
          username: row.get(1)?,
          password: row.get(2)?,
          first_name: row.get(3)?,
          last_name: row.get(4)?,
          age: row.get(5)?,
        })
      })?
      .collect::<Result<Vec<_>, _>>();
  }

  pub fn find_all_users(&self) -> Result<Vec<UserInfo>, SqliteError> {
    let mut req = self.connection.prepare(
      "
        SELECT ROWID,`first_name`,`last_name`,`age`
        FROM `users`
        ORDER BY `last_name`,`first_name`
        ",
    )?;

    return req
      .query_map([], |row| {
        Ok(UserInfo {
          id: row.get(0)?,
          first_name: row.get(1)?,
          last_name: row.get(2)?,
          age: row.get(3)?,
        })
      })?
      .collect::<Result<Vec<_>, _>>();
  }
}
