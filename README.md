# Open Godfather CLI

CLI for kickstarting your Open Godfather project. It downloads the server files, it builds the .pwn entry point, and more.

## Usage

The command below starts a project in your current directory:

```bash
npx github:vladgitx/og-cli
```

## How does it work?

First, it clones the [starter repository](https://github.com/vladgitx/og-starter), which is built on Typescript and Rollup. It also installs all the npm dependencies.

Then, it downloads the open.mp server files and the samp-node plugin, modifying the config.json accordingly.

Last, the main.pwn file from this package is compiled to your server files.
