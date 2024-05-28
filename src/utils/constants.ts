import { Snowflake } from 'discord-api-types/v10';

export const guildId: Snowflake = process.env.GUILD_ID || '519928336483614723';
export const msgTodayChannel: Snowflake = process.env.MSG_TODAY_CHANNEL || '519928337171349514';
export const birthdayRole: Snowflake = process.env.BIRTHDAY_ROLE || '861669110143909920';
export const devId: Snowflake = process.env.DEV_ID || '150249602635792385';
