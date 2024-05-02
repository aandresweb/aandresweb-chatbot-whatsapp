import { join } from "path";
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS,
} from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";

import { ctxHas } from "./helpers/utils";
import { returnInitialOptionsFlow } from "./flows/return-initial-options.flow";

const PORT = process.env.PORT ?? 3008;

enum MainFlowOptions {
  ABOUT_US = "1",
  PORTFOLIO = "2",
  SOCIAL_MEDIAS = "3",
  PROJECT = "4",
}

const projectFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
  .addAnswer(["¡Claro! A continuación te seguiré ayudando 🤖\n"].join("\n"))
  .addAnswer(
    "¿Podrías darme tu correo electrónico porfavor? 📧",
    {
      capture: true,
    },
    async (ctx, { fallBack, gotoFlow, flowDynamic, state }) => {
      if (!ctx.body.includes("@")) {
        return fallBack(
          "El correo que me has brindado no es valido, porfavor ingresa uno nuevamente 🤖"
        );
      }
      const name = await state.get("name");
      await flowDynamic([
        `¡Muy bien! Gracias por la información *${name}*\n`,
        `En breve alguien se comunicará contigo para saber más sobre el proyecto que tienes en mente ⭐`,
      ]);
      return gotoFlow(returnInitialOptionsFlow);
    },
    [returnInitialOptionsFlow]
  );

const socialMediasFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
  .addAnswer(
    [
      "¡Listo! Te daré  la información a continuación: 🤖\n",
      `En los siguientes link podrás encontrar todas mis redes:\n`,
      `- Instagram: *https://www.instagram.com/aandresweb/*`,
      `- Youtube: *https://www.youtube.com/@aandresweb*`,
      `- Tiktok: *https://www.tiktok.com/@aandresweb*`,
      `- Github: *https://github.com/aandresweb*\n`,
      `Espero haberte podido ayudar 🤖`,
    ].join("\n")
  )
  .addAction(async (_, { gotoFlow }) => {
    return gotoFlow(returnInitialOptionsFlow);
  });

const portfolioFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
  .addAnswer(
    [
      "¡Listo! Te daré  la información a continuación: 🤖\n",
      `En los siguientes link podrás encontrar todos mis proyectos:\n`,
      `- Website: *https://dev.aandresweb.com/*`,
      `- Github: *https://github.com/aandresweb*\n`,
      `Espero haberte podido ayudar 🤖`,
    ].join("\n")
  )
  .addAction(async (_, { gotoFlow }) => {
    return gotoFlow(returnInitialOptionsFlow);
  });

const aboutUsFlow = addKeyword<Provider, Database>(EVENTS.ACTION)
  .addAnswer(
    [
      "¡Listo! Te daré un breve resumen: 🤖\n",
      `Mi nombre es *Andres Godinez* y tengo 4 años sumergido en el mundo del desarrollo web y mobile.\n`,
      `Mi especialidad es el frontend, donde diseño experiencias cautivadoras con Javascript, Typescript, React, NextJS, Vue y React Native.\n`,
      `También me ha tocado ser fullstack muchas veces y desarrollar soluciones completas en el backend donde he dominado PHP, Laravel, Node y Java.\n`,
      `Aún me queda un gran camino por delante y estoy entusiasmado por nuevos retos ⭐\n`,
      `Tengo una página web donde podrás encontrar más sobre mí:`,
      `*http://dev.aandresweb.com/*`,
    ].join("\n")
  )
  .addAction(async (_, { gotoFlow }) => {
    return gotoFlow(returnInitialOptionsFlow);
  });

export const initialOptionsFlow = addKeyword<Provider, Database>(
  EVENTS.ACTION
).addAnswer(
  [
    "Para continuar necesito que me indiques cómo te puedo ayudar 🤖\n",
    `${MainFlowOptions.ABOUT_US}. Saber más de aandresweb`,
    `${MainFlowOptions.PORTFOLIO}. Ver todos tus proyectos`,
    `${MainFlowOptions.SOCIAL_MEDIAS}. Ver todas tus redes sociales`,
    `${MainFlowOptions.PROJECT}. Necesito realizar un proyecto\n`,
    "Escribe sólo el *número* de la opción para continuar ✍️",
  ].join("\n"),
  { capture: true },
  async (ctx, { state, fallBack, gotoFlow }) => {
    const name = await state.get("name");
    if (ctxHas(ctx, MainFlowOptions.ABOUT_US)) {
      return gotoFlow(aboutUsFlow);
    }
    if (ctxHas(ctx, MainFlowOptions.PORTFOLIO)) {
      return gotoFlow(portfolioFlow);
    }
    if (ctxHas(ctx, MainFlowOptions.SOCIAL_MEDIAS)) {
      return gotoFlow(socialMediasFlow);
    }
    if (ctxHas(ctx, MainFlowOptions.PROJECT)) {
      return gotoFlow(projectFlow);
    }

    return fallBack(
      `La opción que haz marcado es incorrecta ${name} 😓\nPorfavor marca una opción válida para continuar 🤖`
    );
  },
  [aboutUsFlow, portfolioFlow, socialMediasFlow, projectFlow]
);

const mainFlow = addKeyword<Provider, Database>([
  "hola",
  "ola",
  "hello",
  "info",
  "información",
  "buenas",
  "que tal",
])
  .addAnswer(
    "¡Hola! Que bueno que estés aquí. \nSoy un bot y hoy voy a ayudarte 🤖"
  )
  .addAnswer(
    "¿Me podrías decir tu nombre?",
    { capture: true },
    async (ctx, { flowDynamic, state, gotoFlow }) => {
      await state.update({ name: ctx.body });
      await flowDynamic(`¡Perfecto! Es un gusto *${ctx.body}* ⭐`, {
        delay: 1500,
      });
      return gotoFlow(initialOptionsFlow);
    },
    [initialOptionsFlow]
  );

const main = async () => {
  const adapterFlow = createFlow([mainFlow]);

  const adapterProvider = createProvider(Provider);
  const adapterDB = new Database();

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end("sended");
    })
  );

  adapterProvider.server.post(
    "/v1/register",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("REGISTER_FLOW", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/samples",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("SAMPLES", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/blacklist",
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === "remove") bot.blacklist.remove(number);
      if (intent === "add") bot.blacklist.add(number);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", number, intent }));
    })
  );

  httpServer(+PORT);
};

main();
