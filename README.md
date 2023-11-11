# Emailnator Unofficial CLI

Emailnator Unofficial CLI is a command-line interface for generating email addresses and reading emails.

>**Please note that I am not responsible for the usage of this program. Use it responsibly and ethically.**

## Installation

To install Emailnator Unofficial CLI, you need to have Node.js and npm installed on your machine. Then, you can install Emailnator Unofficial CLI using npm:

with npm
```bash
sudo npm install -g emailnator
```
with git clone
```bash
git clone https://github.com/ethicalhcb/emailnator-cli.git
cd emailnator-cli
sudo npm install -g .
```

> 📢 After installation, you can run `emailnator install` for installing required dependencies.
```bash
emailnator install
```

## Usage
Here's how to use Emailnator Unofficial CLI:

> To use the CLI, run one of the following commands:

- `emailnator install`: Installs required dependencies.
- `emailnator generate-email`: Generates a new email address.
- `emailnator generate-email-multi <number>`: Generates multiple email addresses.
- `emailnator list`: Lists all email addresses generated.
- `emailnator clear`: Clears all email addresses generated.
- `emailnator inbox <email>`: Shows the inbox for a given email address.
- `emailnator message <email> <id>`: Shows the message for a given email address and ID.

You can also use the following aliases for the commands:

- `emailnator i`: Alias for `install`.
- `emailnator ge`: Alias for `generate-email`.
- `emailnator gem <number>`: Alias for `generate-email-multi`.
- `emailnator l`: Alias for `list`.
- `emailnator c`: Alias for `clear`.
- `emailnator i <email>`: Alias for `inbox`.
- `emailnator m <email> <id>`: Alias for `message`.

## Known errors
> ❌ Error: Could not find Chrome (ver. xxx.x.xxxx.xxx). This can occur if either

use this command to fix :
```bash
emailnator install
```

## Links:
- NPM : [https://www.npmjs.com/package/emailnator](https://www.npmjs.com/package/emailnator)
- Github : [https://github.com/ethicalhcb/emailnator-cli/](https://github.com/ethicalhcb/emailnator-cli/)

## License
Emailnator Unofficial CLI is licensed under the MIT license.
