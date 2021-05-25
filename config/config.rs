use std::path::PathBuf;

use serde::Deserialize;
use serde::Serialize;

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Config {
  pub mode: String,

  pub host: String,
  pub port: usize,

  #[cfg_attr(
    feature = "serde",
    serde(skip_serializing_if = "Option::is_none")
  )]
  #[cfg_attr(feature = "serde", serde(default))]
  pub https: Option<ConfigTls>,

  pub root_dir: PathBuf,
  pub public_dir: PathBuf,
  pub template_dir: PathBuf,

  #[cfg_attr(
    feature = "serde",
    serde(skip_serializing_if = "Option::is_none")
  )]
  #[cfg_attr(feature = "serde", serde(default))]
  pub base_url: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ConfigTls {
  pub ca: PathBuf,
  pub cert: PathBuf,
  pub key: PathBuf,
}
