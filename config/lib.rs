use std::fs;

use serde::de::DeserializeOwned;

pub mod config;

pub fn read_toml_file<T: DeserializeOwned>(
  filename: &str,
) -> Result<T, std::io::Error> {
  let content = fs::read_to_string(filename)?;
  let data = toml::from_str(&content)?;
  Ok(data)
}
