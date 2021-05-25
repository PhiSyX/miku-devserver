use std::path::PathBuf;
use std::sync::Arc;
use structopt::StructOpt;
use tera::Tera;
use tide::http::mime;
use tide::log;
use tide::Request;
use tide_compress::CompressMiddleware;
use tide_rustls::TlsListener;

use miku_devserver_config::read_toml_file;
use miku_devserver_config::config::Config;

mod view;

use view::View;

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

#[derive(Clone)]
struct State {
  view: Arc<View>,
}

#[async_std::main]
async fn main() -> Result<(), std::io::Error> {
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
  if config.mode == "development" {
    log::with_level(log::LevelFilter::Debug);
  } else {
    log::with_level(log::LevelFilter::Info);
  }

  // Template
  let template_dir = format!("{}/**/*", config.template_dir.to_string_lossy());
  let mut template = Tera::new(&template_dir).expect(&format!(
    "Impossible de charger le répertoire des templates: {}",
    template_dir
  ));
  template.autoescape_on(vec![".html", ".sql"]);

  let mut app = tide::with_state(State {
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

  // Lancement du serveur
  let full_addr = format!("{}:{}", config.host, config.port);
  match config.https {
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
  }
}
