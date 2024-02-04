import { EmbedBuilder, WebhookClient } from "discord.js";
import { Difference } from "@/modules.ts";

export const discord = (
  id: string,
  token: string,
  differences: Difference[],
) => {
  const client = new WebhookClient({ id: id, token: token });

  differences.forEach((difference) => {
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

    void client.send({
      embeds: [embed.toJSON()],
    });
  });
};
