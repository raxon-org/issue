# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`raxon/issue` is a Raxon framework package that provides an issue-tracking application. It integrates with the `raxon/framework` (>=2024.09.04) and `raxon/node` systems to deliver both a CLI interface and a web frontend.

## Installation / Setup

The package is installed via the CLI using:

```
app raxon issue setup
```

This requires `frontend.host` and `backend.host` options to be configured in `Node/System.Host.json`. Installation must run as root (POSIX ID 0).

The setup template (`src/Package/View/Setup/Setup.tpl`) orchestrates:
1. Registering the installation (`Init::register`)
2. Creating the system role (`Import::role_system`)
3. Running the main install routine (`Main::install`)

## Architecture

### Dual-Layer Structure

The package has two distinct layers:

**Package layer** (`src/Package/`) — Installed globally as a Raxon package:
- `Controller/Cli.php` — CLI entry point, routes commands by scanning view templates to discover valid module/submodule/command chains
- `Trait/Main.php` — Core install logic: copies Application files to the domain, processes `.rax` templates, imports routes, creates desktop navigation entries
- `Trait/Init.php` — Registers/updates installation records in `System.Installation` node
- `Trait/Import.php` — Creates system roles via `Node::role_system_create`

**Application layer** (`src/Application/`) — Deployed into the target domain during install:
- `Controller/Issue.php.rax` — Template that generates a domain-specific controller (namespace includes `frontend.host`)
- `Data/System.Route.json.rax` — Template that generates routes bound to `frontend.host`
- `View/Issue/` — Raxon template views (`.tpl`) and a JavaScript module

### `.rax` Template Files

Files with the `.rax` extension are Raxon parse templates. During installation, they are compiled using `Parse::compile()` with `frontend.host`/`backend.host` options injected, and the `.rax` extension is stripped from the output filename. For JSON `.rax` files, `Core::object()` serializes the result.

### Node System (Data Layer)

- `src/Node/Object/Application.Issue.json` — Schema: an Issue has `name`, `user` (uuid), `description` (array), `attachment` (array), and a nested `task` object
- `src/Node/Expose/Application.Issue.json` — Role-based output field definitions for all CRUD operations (ROLE_SYSTEM, ROLE_ADMIN)
- `src/Node/Validate/Application.Issue.json` — UUID validation rules for create/put/patch
- `Data/Role.System.json` — Grants ROLE_SYSTEM full CRUD permissions on `Application:Issue`
- `Data/System.Route.json` — Registers the CLI route `raxon/issue` → `Package:Raxon:Issue:Controller:Cli:run`

### CLI Routing

The `Cli::run` method scans `controller.dir.view` to discover available modules/submodules up to 6 depth levels. Commands are resolved by building dot-separated names (e.g., `Setup`, `Setup.Init`) and locating corresponding template files. Unknown commands fall back to the `Info` module.

### View Templates

The Raxon templating syntax uses `{{...}}` for expressions. Views use `require()` to include sub-templates and `config()` to access framework config values. The `Main.tpl` view composes `Init.tpl`, `Section.tpl`, and the `Issue.js` module script.

## Key Conventions

- Package namespace: `Package\Raxon\Issue\*`
- Application namespace (generated): `Domain\<host_namespace>\Application\Issue\*`
- Node class names follow dot notation: `Application.Issue`, `System.Route`, `Account.Role`
- Permissions follow colon notation: `Application:Issue:create`
- The `#class` property on node records identifies the node type
