declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      DEV_TOKEN?: string;
      GNEWS_TOKEN: string;
      WEATHER_TOKEN: string;

      GUILD_ID?: string;
      MSG_TODAY_CHANNEL?: string;
      BIRTHDAY_ROLE?: string;
    }
  }
}

export {};
