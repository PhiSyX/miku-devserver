use tera::Context;
use tera::Tera;

use miku_devserver_config::config::Config;

#[derive(Clone)]
pub struct View {
  pub config: Config,
  pub template: Tera,
}

impl View {
  pub fn new(config: Config, template: Tera) -> Self {
    Self { config, template }
  }

  // Render

  pub fn render_file(&self, name: &str) -> tera::Result<String> {
    let mut context = Context::new();

    context.insert(
      "base_url",
      self
        .config
        .base_url
        .as_ref()
        .unwrap_or(&format!("/")),
    );

    self.template.render(name, &context)
  }
}
