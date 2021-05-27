use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
pub struct User {
  pub id: u32,
  pub username: String,
  pub password: String,
  pub first_name: String,
  pub last_name: String,
  pub age: u8,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
  pub id: u32,
  pub first_name: String,
  pub last_name: String,
  pub age: u8,
}
