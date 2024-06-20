#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import arg from 'arg';
import inquirer from 'inquirer';
import updateNotifier from 'update-notifier';
import Configstore from 'configstore';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { colorize, color } from 'json-colorizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = join(__dirname, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

const notifier = updateNotifier({ pkg });
notifier.notify();

const config = new Configstore(pkg.name);

async function getApiKey() {
  let apiKey = config.get('ipinfoApiKey');

  if (!apiKey) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: `${chalk.yellow('Please set an IPinfo API key')}.\nCreate a new one here: https://ipinfo.io/signup\nPaste your key here: (${chalk.blue(`or hit 'enter' to continue without one`)}):`,
      },
    ]);

    apiKey = answers.apiKey;

    if (apiKey) {
      config.set('ipinfoApiKey', apiKey);
    }
  }
  return apiKey;
}

function parseArgumentsIntoOptions(rawArgs) {
  try {
    const args = arg(
      {
        '--out': String,
        '--format': String,
        '--no-color': Boolean,
        '-o': '--out',
        '-f': '--format',
        '-n': '--no-color',
      },
      { argv: rawArgs.slice(2) }
    );

    return {
      input: args._[0],
      outFile: args['--out'] || null,
      format: args['--format'] ? args['--format'].split(',') : ['json'],
      noColor: args['--no-color'] || false,
    };

  } catch (err) {
    console.log('Usage: ipinfo <ipaddress|ips.txt> [--out=filename.txt --format=json,csv --no-color]');
    process.exit(1);
  }
}

async function fetchIpInfo(ip, apiKey) {
  const url = `https://ipinfo.io/${ip}${apiKey ? `?token=${apiKey}` : ''}`;
  const response = await axios.get(url);
  return response.data;
}

function formatOutput(data, format) {
  if (format.includes('json')) {
    return JSON.stringify(data, null, 2);
  }

  if (format.includes('csv')) {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let value = row[header];
        if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes in strings
        }
        return value;
      }).join(','))
    ];
    return csvRows.join('\n');
  }

  return '';
}

async function processIps(ips, apiKey, options) {
  const progressBar = new cliProgress.SingleBar({
    format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% || IP: {ip} || Duration: {duration_formatted}',
  }, cliProgress.Presets.shades_classic);

  progressBar.start(ips.length, 0);

  const promises = ips.map(async (ip, index) => {
    const output = await fetchIpInfo(ip, apiKey);
    progressBar.update(index + 1, { ip });
    return output;
  });

  const results = await Promise.all(promises);

  progressBar.stop();

  return results.filter(result => result !== null);
}

async function main() {
  const options = parseArgumentsIntoOptions(process.argv);

  if (!options.input) {
    console.error(chalk.red('No input provided.'));
    process.exit(1);
  }

  const apiKey = await getApiKey();

  let ips = [];
  if (options.input.match(/\.(txt)$/i)) {
    const fileContent = readFileSync(options.input, 'utf-8');
    ips = fileContent.split(/\r?\n/).filter(line => line.trim());
  } else {
    ips.push(options.input);
  }

  if (ips.length === 0) {
    console.error(chalk.red('No IP addresses found in the input file'));
    process.exit(1);
  }

  const results = await processIps(ips, apiKey, options);

  if (results.length > 0) {
    const formattedOutput = formatOutput(results, options.format);

    if (options.outFile) {
      writeFileSync(options.outFile, formattedOutput, { flag: 'w' });
      console.log(chalk.green(`IP information saved to ${options.outFile}`));
    } else {
      if (options.noColor) {
        console.log(formattedOutput);
      } else {
        const jsonArray = JSON.parse(formattedOutput);
        jsonArray.forEach(obj => {
          console.log(colorize(JSON.stringify(obj, null, 2), {
            colors: {
              StringKey: color.magenta,
              StringLiteral: color.green,
              NumberLiteral: color.red,
              BooleanLiteral: color.cyan,
              NullLiteral: color.gray,
              Bracket: color.white,
              Colon: color.white,
              Common: color.white,
              Brace: color.white,
            }
          }));
        });
      }
    }
  }
}

main();

