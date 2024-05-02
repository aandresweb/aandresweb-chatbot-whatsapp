import { EVENTS, addKeyword } from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { initialOptionsFlow } from "~/app";

export const returnInitialOptionsFlow = addKeyword<Provider, Database>(
  EVENTS.ACTION
).addAnswer(
  [
    "Porfavor marca una opción para continuar ayudándote 🤖\n",
    "1. Volver a las opciones iniciales",
    "2. Terminar con la conversación\n",
    "Escribe sólo el *número* de la opción para continuar ✍️",
  ].join("\n"),
  { capture: true },
  async (ctx, { gotoFlow, state, fallBack, flowDynamic, endFlow }) => {
    const name = await state.get("name");
    if (ctx.body.includes("1")) {
      return gotoFlow(initialOptionsFlow);
    }

    if (ctx.body.includes("2")) {
      await flowDynamic(
        "Ha sido un gusto ayudarte hasta este punto, estaré atento a cualquier consulta o duda 🤖"
      );
      return endFlow();
    }
    return fallBack(
      `La opción que haz marcado es incorrecta ${name} 😓\nPorfavor marca una opción válida para continuar 🤖`
    );
  }
);
