use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::MutexGuard;

use fake::faker::internet::en::Password;
use fake::faker::internet::en::Username;
use fake::faker::name::en::FirstName;
use fake::faker::name::en::LastName;
use fake::faker::number::en::Digit;

use fake::Fake;

use structopt::StructOpt;
use tera::Tera;
use thiserror::Error;
use tide::http::mime;
use tide::log;

use tide::Request;
use tide_compress::CompressMiddleware;
use tide_rustls::TlsListener;

use miku_devserver_config::config::Config;
use miku_devserver_config::read_toml_file;

mod model;
mod repository;
mod view;

use view::View;

use self::repository::Repository;

#[derive(Debug, StructOpt)]
#[structopt(name = "miku-devserver")]
struct CommandCLI {
  #[structopt(
    short = "c",
    long = "config",
    parse(from_os_str),
    default_value = "config/config_default.toml",
    help = "Fichier de configuration à charger"
  )]
  pub config: PathBuf,
}

type AppResult<R = (), E = AppError> = Result<R, E>;

#[derive(Debug, Error)]
enum AppError {
  #[error("io:\n    {0}")]
  Io(#[source] std::io::Error),

  #[error("sqlite:\n    {0}")]
  SqliteError(#[source] rusqlite::Error),
}

impl From<std::io::Error> for AppError {
  fn from(err: std::io::Error) -> Self {
    Self::Io(err)
  }
}

impl From<rusqlite::Error> for AppError {
  fn from(err: rusqlite::Error) -> Self {
    Self::SqliteError(err)
  }
}

#[derive(Clone)]
struct State {
  repository: Arc<Mutex<Repository>>,
  view: Arc<View>,
}

impl State {
  fn lock(&self) -> Result<MutexGuard<Repository>, tide::Error> {
    tide::log::debug!("Verrou du repository...");

    self.repository.lock().map_err(|e| {
      tide::Error::from_str(
        500,
        format!("Impossible de verrouiller la base de données: {:?}", e),
      )
    })
  }
}

#[async_std::main]
async fn main() -> AppResult {
  // Récupère les arguments passés en ligne de commandes
  let args = CommandCLI::from_args();

  // Récupère le fichier de configuration à parti des arguments en ligne de
  // commande
  let config = args
    .config
    .to_str()
    .map(read_toml_file::<Config>)
    .unwrap()?;

  // Log du serveur
  let filter = if config.mode.eq("development") {
    log::LevelFilter::Debug
  } else {
    log::LevelFilter::Info
  };

  log::with_level(filter);

  // Initialisation de la base de donnée
  let repository = Repository::new("tmp/database.sqlite")?;

  // Template
  let template_dir = format!("{}/**/*", config.template_dir.to_string_lossy());
  let mut template = Tera::new(&template_dir).unwrap_or_else(|_| {
    panic!(
      "Impossible de charger le répertoire des templates: {}",
      template_dir
    )
  });

  template.autoescape_on(vec![".html", ".sql"]);

  let mut app = tide::with_state(State {
    repository: Arc::new(Mutex::new(repository)),
    view: Arc::new(View::new(config.clone(), template)),
  });

  if config.mode == "production" {
    app.with(CompressMiddleware::new());
  }

  // Route
  app.at("/").serve_dir(config.public_dir)?;

  app.at("/").get(|req: Request<State>| async move {
    let body = req
      .state()
      .view
      .render_file("index.html")
      .map_err(|e| tide::Error::new(500, e))?;

    Ok(
      tide::Response::builder(200)
        .body(body)
        .content_type(mime::HTML)
        .build(),
    )
  });

  app
    .at("/users/create")
    .post(|mut req: Request<State>| async move {
      let data: HashMap<String, String> = req.body_form().await?;
      let validity_type = data.get("validity_type");
      if validity_type.is_none() {
        return Err(tide::Error::from_str(403, "Forbidden"));
      }

      if let Some(v) = validity_type {
        if v != "厳秘" {
          return Err(tide::Error::from_str(403, "Forbidden"));
        }
      }

      let repository = req.state().lock()?;
      repository.create_user(
        Username().fake::<String>(),
        Password(0..8).fake::<String>(),
        FirstName().fake::<String>(),
        LastName().fake::<String>(),
        Digit().fake::<String>(),
      )?;
      Ok(tide::Redirect::new("/users"))
    });

  app.at("/users/delete/:lastname").post(
    |mut req: Request<State>| async move {
      let data: HashMap<String, String> = req.body_form().await?;
      let validity_type = data.get("validity_type");
      if validity_type.is_none() {
        return Err(tide::Error::from_str(403, "Forbidden"));
      }

      if let Some(v) = validity_type {
        if v != "厳秘" {
          return Err(tide::Error::from_str(403, "Forbidden"));
        }
      }

      let user_last_name = req.param("lastname")?;
      let repository = req.state().lock()?;
      repository.delete_user(user_last_name)?;
      Ok(tide::Redirect::new("/users"))
    },
  );

  app.at("/users").get(|req: Request<State>| async move {
    let repository = req.state().lock()?;
    let users = repository.find_all_users()?;

    let body = req
      .state()
      .view
      .render_users_list("users/index.html", users)
      .map_err(|e| tide::Error::new(500, e))?;

    Ok(
      tide::Response::builder(202)
        .body(body)
        .content_type(mime::HTML)
        .build(),
    )
  });

  // Lancement du serveur
  let full_addr = format!("{}:{}", config.host, config.port);

  let serve = match config.https {
    | None => app.listen(full_addr).await,
    | Some(config_https) => {
      app
        .listen(
          TlsListener::build()
            .addrs(full_addr)
            .cert(config_https.cert)
            .key(config_https.key),
        )
        .await
    }
  };

  serve.map_err(AppError::Io)
}
