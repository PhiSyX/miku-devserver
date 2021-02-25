# Générer le {company}.cer
**{company}** doit être remplacé par des caractères alphanumériques.

```bash
$ openssl req -x509 -newkey rsa:2048 -out {company}.cer -outform PEM -keyout {company}.pvk -days 10000 -verbose -config {company}.cnf -nodes -sha256 -subj "/CN={company} CA"
```

## Installer uniquement le fichier {company}.cer sur le PC (en utilisateur courant).

# Créer un fichier {domain}.ext, ajouter tous les domaines concernant le certificat
```dotenv
subjectAltName = @alt_names
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = localhost
DNS.2 = domain.org
DNS.3 = sub.domain.org
DNS.4 = etc...
```

# Générer le {domain}.cer
**{domain}** doit être remplacé par des caractères alphanumériques.
```bash
$ openssl req -newkey rsa:2048 -keyout {domain}.pvk -out {domain}.req -subj /CN={domain} -sha256 -nodes
$ openssl x509 -req -CA {company}.cer -CAkey {company}.pvk -in {domain}.req -out {domain}.cer -days 10000 -extfile {domain}.ext -sha256 -set_serial 0x1111
```
