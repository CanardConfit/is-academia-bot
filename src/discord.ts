import { EmbedBuilder, WebhookClient } from "discord.js";
import { Difference } from "./modules";
import { logger } from "./logger";

export const discord = (
  id: string,
  token: string,
  differences: Difference[],
) => {
  if (differences.length === 0) {
    logger.info("No differences to report to Discord.");
    return;
  }

  const client = new WebhookClient({ id: id, token: token });

  logger.info(`Sending ${differences.length} updates to Discord.`);

  differences.forEach((difference, index) => {
    const embed = new EmbedBuilder()
      .setTitle(
        `Nouvelle note détectée dans le module ${difference.module.title}`,
      )
      .addFields({
        name: "Cours",
        value: `${difference.course.title} (${difference.course.id})`,
        inline: true,
      })
      .addFields({
        name: "Note",
        value: difference.oldNote
          ? difference.oldNote.title
          : difference.newNote!.title,
        inline: true,
      })
      .addFields({
        name: "Ancienne valeur",
        value: difference.oldNote?.note.toString() || "Non définie",
        inline: true,
      })
      .addFields({
        name: "Nouvelle valeur",
        value: difference.newNote?.note.toString() || "Non définie",
        inline: true,
      })
      .setColor(0x00ffff)
      .setTimestamp();

    void client
      .send({
        embeds: [embed],
      })
      .then(() => {
        logger.info(
          `Successfully sent update ${index + 1} of ${differences.length} to Discord.`,
        );
      })
      .catch((error) => {
        logger.error(
          `Failed to send update ${index + 1} of ${differences.length} to Discord. Error: ${error}`,
        );
      });
  });
};
