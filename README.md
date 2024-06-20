# ipgeo-cli

A CLI tool for fetching IP information using the IPinfo API.

## Installation

You can install `ipgeo-cli` globally using npm:

```sh
npm i -g ipgeo-cli
```

## Usage

```sh
ipinfo <ipaddress|ips.txt> [--out=filename.txt --format=json,csv --no-color]
```

### Arguments

- `<ipaddress|ips.txt>`: A single IP address or a file containing a list of IP addresses.
- `--out=filename.txt`: (Optional) Specify an output file to save the results.
- `--format=json,csv`: (Optional) Specify the output format, either `json` or `csv`. Default is `json`.
- `--no-color`: (Optional) Disable colored output in the console.

### Examples

Fetch information for a single IP address:

```sh
ipinfo 8.8.8.8
```

Fetch information for a list of IP addresses in a file and save the results to an output file:

```sh
ipinfo ips.txt --out=output.json --format=json
```

Disable colored output in the console:

```sh
ipinfo 8.8.8.8 --no-color
```

## API Key

You should set an IPinfo API key to use this tool. If you don't have an API key, you can create one [here](https://ipinfo.io/signup).

The first time you run the tool, you will be prompted to enter your API key. The key will be stored locally in your configuration.

## Development

### Prerequisites

- Node.js >= 16.0.0

### Install Dependencies

```sh
npm install
```

### Running the Tool

```sh
node index.mjs <ipaddress|ips.txt> [--out=filename.txt --format=json,csv --no-color]
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Your Name

## Bugs

If you find a bug, please file an issue [here](https://github.com/wiggercomputer/ipgeo-cli/issues).

## Repository

The repository of this project is hosted at [GitHub](https://github.com/wiggercomputer/ipgeo-cli).
