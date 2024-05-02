import { BotContext } from "@builderbot/bot/dist/types";

export const ctxHas = (ctx: BotContext, searchText: string) => {
  return ctx.body.includes(searchText);
};
