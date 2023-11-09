#!/usr/bin/env node

import { Command } from "commander";
import ora from "ora";
import { listEmailsToDatabase } from "./bin/list.js";
import { generateEmail } from "./bin/generate.js";
import { inbox } from "./bin/inbox.js";
import { message } from "./bin/message.js";
import { clearEmailsToDatabase } from "./bin/clear.js";
import figlet from "figlet";
import fs from "fs";

const program = new Command();
program.name("emailnator");
const version = fs.readFileSync("./.version", "utf8").trim();
program.version(version);
program.description("A CLI to generate email addresses and read emails");
console.log("Emailnator Unofficial CLI " + program.version() + "\n");

program.on("--help", () => {
  console.log(figlet.textSync("Emailnator CLI", "Standard"));
  console.log(`Version: ${program.version()}`);
});
program
  .command("generate-email")
  .alias("ge")
  .description("Generate a new email address")
  .action(() => {
    const spinner = ora("Generating email address...").start();
    generateEmail()
      .then((email) => {
        spinner.succeed(`Email address generated: ${email}`);
        spinner.warn(
          "The emails from this address are deleted every 24 hours!"
        );
        spinner.succeed("link: " + "https://emailnator.com/inbox/" + email);
      })
      .catch((err) => {
        spinner.fail(err.message);
      });
  });

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
    const spinner = ora(`Generating ${num} emails addresses...`).start();
    const promises = [];
    for (let i = 0; i < num; i++) {
      promises.push(generateEmail());
    }
    Promise.all(promises)
      .then((emails) => {
        spinner.succeed(`Email addresses generated:\n${emails.join("\n")}`);
        console.log("\n");
        spinner.warn(
          "The emails from these addresses are deleted every 24 hours!\n"
        );
        spinner.succeed(
          "links:\n" +
            emails
              .map((email) => "https://emailnator.com/inbox/" + email)
              .join("\n")
        );
        // ajoute un log pour expliquer comment voir les emails d'une adresse dans le terminal
        console.log(
          "\nTo see the emails from an addresses, use the command 'emailnator inbox <email>'"
        );
      })
      .catch((err) => {
        spinner.fail(err.message);
      });
  });

program
  .command("list")
  .alias("l")
  .description("List all email addresses generated")
  .action(() => {
    const spinner = ora("Loading email addresses...").start();
    listEmailsToDatabase()
      .then((value) => {
        const emails = value;
        if (emails.length === 0) {
          spinner.fail("No email addresses generated yet.");
          return;
        }
        const emailList = emails.map((email) => email.email);
        spinner.succeed(`Email addresses list :\n${emailList.join("\n")}`);
      })
      .catch((err) => {
        spinner.fail(err.message);
      });
  });

program
  .command("clear")
  .alias("c")
  .description("Clear all email addresses generated")
  .action(() => {
    const spinner = ora("Clearing email addresses...").start();
    clearEmailsToDatabase()
      .then((value) => {
        spinner.succeed(`Email addresses cleared`);
      })
      .catch((err) => {
        spinner.fail(err.message);
      });
  });

program
  .command("inbox <email>")
  .alias("i")
  .description("Show the inbox for a given email address")
  .action((email) => {
    const spinner = ora(`Loading inbox for ${email}...`).start();
    inbox(email)
      .then((value) => {
        console.log("inbox to " + email);

        const messages = value.map((message) => {
          if (!message[3].startsWith("/inbox/")) {
            return null;
          }
          return {
            from: message[0],
            object: message[1],
            time: message[2],
            link: "https://emailnator.com/" + message[3],
            id: message[3].substring(
              message[3].indexOf("@gmail.com/") + 11,
              message[3].length
            ),
          };
        });

        // si il y a null dans le tableau, on le supprime
        for (let i = 0; i < messages.length; i++) {
          if (messages[i] === null) {
            messages.splice(i, 1);
          }
        }

        spinner.succeed(
          `Inbox for ${email}:\n${JSON.stringify(messages, null, 2)}`
        );
      })
      .catch((err) => {
        spinner.fail(err.message);
      });
  });

program
  .command("message <email> <id>")
  .alias("m")
  .description("show the message for a given email address and id")
  .action((email, id) => {
    const spinner = ora(`Loading message ${id} for ${email}...`).start();
    message(id, email)
      .then((value) => {
        const html = value.join("");
        spinner.succeed(`Message ${id} for ${email}:\n${html}`);
      })
      .catch((err) => {
        spinner.fail(err.message);
      });
  });

program.parse(process.argv);
