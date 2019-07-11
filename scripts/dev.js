const Configstore = require('configstore');
const execa = require('execa');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const chalk = require('chalk');

const pkg = require('../package.json');

const cwd = process.cwd();
const conf = new Configstore(pkg.name, {});

const server = require.resolve('./server.js');
const wepbackCli = require.resolve('webpack-cli/bin/cli');

let dirs = fs.readdirSync(path.join(cwd, 'src'));

dirs = dirs.filter((file) => !file.startsWith('.'));
dirs = dirs.filter((file) => file.charCodeAt(0) < 90);

(async () => {
  const { componentName } = await inquirer.prompt([
    {
      type: 'list',
      message: '请选择需要预览的组件',
      name: 'componentName',
      choices: dirs,
      default: conf.get('component-name') || '',
    },
  ]);

  conf.set('component-name', componentName);
  const componentCwd = path.join(cwd, 'src', componentName);

  console.log(chalk.green('👏启动预览服务'), chalk.yellow(componentName));

  await execa(wepbackCli, ['--config', './config/webpack.dll.js', '--colors'], {
    cwd: __dirname,
    stdio: 'inherit',
  });

  await execa(server, {
    cwd: componentCwd,
    stdio: 'inherit',
  });
})();
