#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import figlet from "figlet";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { listEmailsToDatabase } from "./bin/list.js";
import { generateEmail } from "./bin/generate.js";
import { inbox } from "./bin/inbox.js";
import { message } from "./bin/message.js";
import { clearEmailsToDatabase } from "./bin/clear.js";
import { checkPuppeteerInstallation } from "./bin/install.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionFilePath = join(__dirname, "package.json");
const version = JSON.parse(fs.readFileSync(versionFilePath, "utf8")).version;

const program = new Command();

function setupProgram() {
  program
    .name("emailnator-cli")
    .version(version)
    .description("A CLI to generate email addresses and read emails");

  console.log(`Emailnator CLI Unofficial ${program.version()}\n`);

  program.on("--help", () => {
    console.log(figlet.textSync("Emailnator CLI", "Standard"));
    console.log(`Version: ${program.version()}`);
  });
}

function createSpinner(text) {
  return ora(text).start();
}

function handleSpinnerResult(spinner, successMessage) {
  return (result) => {
    spinner.succeed(successMessage(result));
    return result;
  };
}

function handleSpinnerError(spinner) {
  return (error) => {
    spinner.fail(error.message);
    throw error;
  };
}

function addInstallCommand() {
  program
    .command("install")
    .description("install requirements")
    .action(() => {
      const spinner = createSpinner(
        "Installing chrome puppeteer requirements."
      );
      checkPuppeteerInstallation()
        .then(
          handleSpinnerResult(
            spinner,
            () => "Successfully installed puppeteer requirements."
          )
        )
        .catch(handleSpinnerError(spinner));
    });
}

function addGenerateEmailCommand() {
  program
    .command("generate-email")
    .alias("ge")
    .description("Generate a new email address")
    .action(() => {
      const spinner = createSpinner("Generating email address...");
      generateEmail()
        .then(
          handleSpinnerResult(spinner, (email) => {
            spinner.warn(
              "The emails from this address are deleted every 24 hours!"
            );
            spinner.succeed(`link: https://emailnator.com/inbox/${email}`);
            return `Email address generated: ${email}`;
          })
        )
        .catch(handleSpinnerError(spinner));
    });
}

function addGenerateMultipleEmailsCommand() {
  program
    .command("generate-email-multi <number>")
    .alias("gem")
    .description("Generate multiple email addresses")
    .action((number) => {
      const num = parseInt(number, 10);
      if (isNaN(num)) {
        console.error("Invalid number");
        return;
      }
      const spinner = createSpinner(`Generating ${num} emails addresses...`);
      Promise.all(
        Array(num)
          .fill()
          .map(() => generateEmail())
      )
        .then(
          handleSpinnerResult(spinner, (emails) => {
            spinner.warn(
              "The emails from these addresses are deleted every 24 hours!\n"
            );
            spinner.succeed(
              `links:\n${emails
                .map((email) => `https://emailnator.com/inbox/${email}`)
                .join("\n")}`
            );
            console.log(
              "\nTo see the emails from an address, use the command 'emailnator inbox <email>'"
            );
            return `Email addresses generated:\n${emails.join("\n")}`;
          })
        )
        .catch(handleSpinnerError(spinner));
    });
}

function addListCommand() {
  program
    .command("list")
    .alias("l")
    .description("List all email addresses generated")
    .action(() => {
      const spinner = createSpinner("Loading email addresses...");
      listEmailsToDatabase()
        .then(
          handleSpinnerResult(spinner, (emails) => {
            if (emails.length === 0) return "No email addresses generated yet.";
            const emailListWithLinks = emails.map(
              (email) =>
                `${email.id} - ${email.email} - https://emailnator.com/inbox/${email.email}`
            );
            return `Email addresses list:\n${emailListWithLinks.join("\n")}`;
          })
        )
        .catch(handleSpinnerError(spinner));
    });
}

function addClearCommand() {
  program
    .command("clear")
    .alias("c")
    .description("Clear all email addresses generated")
    .action(() => {
      const spinner = createSpinner("Clearing email addresses...");
      clearEmailsToDatabase()
        .then(handleSpinnerResult(spinner, () => "Email addresses cleared"))
        .catch(handleSpinnerError(spinner));
    });
}

function addInboxCommand() {
  program
    .command("inbox <email>")
    .alias("i")
    .description("Show the inbox for a given email address")
    .action((email) => {
      if (!email.includes("@")) {
        console.error("Invalid email address");
        return;
      }
      const spinner = createSpinner(`Loading inbox for ${email}...`);
      inbox(email)
        .then(
          handleSpinnerResult(spinner, (value) => {
            const messages = value
              .map((message) => {
                if (!message[3].startsWith("/inbox/")) return null;
                return {
                  from: message[0],
                  object: message[1],
                  time: message[2],
                  link: `https://emailnator.com/${message[3]}`,
                  id: message[3].substring(
                    message[3].indexOf("@gmail.com/") + 11
                  ),
                };
              })
              .filter((message) => message !== null);
            return `Inbox for ${email}:\n${JSON.stringify(messages, null, 2)}`;
          })
        )
        .catch(handleSpinnerError(spinner));
    });
}

function addMessageCommand() {
  program
    .command("message <email> <id>")
    .alias("m")
    .description("show the message for a given email address and id")
    .action((email, id) => {
      const spinner = createSpinner(`Loading message ${id} for ${email}...`);
      message(id, email)
        .then(
          handleSpinnerResult(
            spinner,
            (value) => `Message ${id} for ${email}:\n${value.join("")}`
          )
        )
        .catch(handleSpinnerError(spinner));
    });
}

function main() {
  setupProgram();
  addInstallCommand();
  addGenerateEmailCommand();
  addGenerateMultipleEmailsCommand();
  addListCommand();
  addClearCommand();
  addInboxCommand();
  addMessageCommand();
  program.parse(process.argv);
}

main();
