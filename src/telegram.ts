import { Difference } from "./modules";
import { logger } from "./logger";
import { Telegraf } from "telegraf";

/**
 * Sends messages to a Telegram chat with the differences found.
 * One message is sent for each difference.
 * @param token The Telegram bot token.
 * @param chatId The chat ID to send the message to.
 * @param differences The differences to report.
 */
export const telegramSendUpdates = (
  token: string,
  chatId: string,
  differences: Difference[],
) => {
  const bot = new Telegraf(token);

  logger.info(`Telegram service : sending ${differences.length} updates.`);

  differences.forEach((difference, index) => {
    const isNewNote = difference.oldNote === undefined;

    let message = `${isNewNote ? "🎉 Nouvelle note" : "✏️ Note modifiée"} dans le module ${escapeMarkdown(difference.module.title)}\n\n`;

    message += `Cours: *${escapeMarkdown(difference.course.title)}* (${escapeMarkdown(difference.course.id)})\n\n`;
    message += `Note        : *${escapeMarkdown(difference.oldNote ? difference.oldNote.title : difference.newNote!.title)}*\n`;
    message += `Ancienne: *${difference.oldNote?.note.toString() || "Non définie"}*\n`;
    message += `Nouvelle : *${difference.newNote?.note.toString() || "Non définie"}*`;

    bot.telegram
      .sendMessage(chatId, message, { parse_mode: "Markdown" })
      .then(() => {
        logger.info(
          `Telegram service : successfully sent update ${index + 1} of ${differences.length}.`,
        );
      })
      .catch((error) => {
        logger.error(
          `Telegram service : failed to send update ${index + 1} of ${differences.length}. Error: ${error}`,
        );
      });
  });
};

/**
 * Escapes Markdown characters in a text.
 * @param text
 * @returns The text with escaped Markdown characters.
 */
function escapeMarkdown(text: string): string {
  const specialChars = ["*", "_", "#", "[", "]", "`", ">", "+", ".", "!"];
  specialChars.forEach((char) => {
    text = text.replace(new RegExp(`\\${char}`, "g"), `\\${char}`);
  });
  return text;
}
