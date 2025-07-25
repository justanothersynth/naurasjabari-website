## Getting Started

### Prerequisites

Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

Make sure Husky is installed globally
```bash
npm i --g husky
```

### Building
```bash
bun install --frozen-lockfile
```

In order to run apps in local development mode, two keys must be added to the `node` dir directory. The following set of commands apply to a macOS system. However, if mkcert is installed by another package manager, this can be run on any flavor of *nix.

```bash
cd ~/.ssh
brew install mkcert # replace with another package manager for linux distro
brew install nss # need to install certutil before running `mkcert -install` so the CA can be automatically installed in Firefox

# at this point, open any https website in Firefox before running the below commands

mkcert -install
mkcert -key-file localhost_key.pem -cert-file localhost_cert.pem localhost 127.0.0.1
cat localhost_cert.pem > localhost_fullchain.pem
cat "$(mkcert -CAROOT)/rootCA.pem" >> localhost_fullchain.pem
```

Now, copy the `.pem` files into the `node` dir. These keys are .gitignored by default.

Or run the below command to copy the files to your currently `cd`’d dir automatically

```bash
cp -v ~/.ssh/localhost_cert.pem ~/.ssh/localhost_key.pem .
```

## Supabase

### Migrations

The `client` uses Supabase as a backend. It is currently set up to connect directly to Supabase's cloud solution for _all_ environments (dev, staging and production). Currently, Supabase is used locally only for managing database migrations.

❗️❗️❗️ Do **NOT** use the local Supabase dashboard. Only use the cloud-hosted solution. In fact, don't run `npx supabase start` at all.
❗️ Make sure you have Docker installed and running locally before proceeding

If you haven't done so already, link the `web-core-dev` project to your local supabase working directory (❗️ you MUST link the **dev** project, not staging).

```bash
cd node/packages/supabase
npx supabase link --project-ref <project_id> # if not already linked
```

Then just pull the newest database changes and commit them:

```bash
npx supabase db pull --linked
# Update remote migration history table? --> yes
git add -A
git commit -a -m 'feat: synced supabase migration file'
```

❗️ Always open a new PR when you do this. There is a github action that runs that checks for database drifts between the git-committed migrations and the staging site.

### Client setup

Grab the `Studio URL` and `anon key` from the Supabase staging cloud instance (`naurasjabari-dev`) and add them as the following environment variables to a `.env` file in the `client` package root:

```bash
SUPABASE_URL=<Studio URL>
SUPABASE_KEY=<anon key>
```

## Web application (client package)

The following environment variables should to be added to a `.env` file in the `client` package root:

```bash
NODE_ENV=development
SERVER_ENV=development
PORT=20010
SITE_URL=https://localhost:20010
```

- `NODE_ENV`: sets the local Node environment
- `SERVER_ENV`: used throughtout the app to define different app environments (development, staging, production, etc.)
- `PORT`: the port on which the Nuxt app runs
- `SITE_URL`: the client domain of the Nuxt app

Now we can run the frontend/client:

```bash
npm run client:dev
```
