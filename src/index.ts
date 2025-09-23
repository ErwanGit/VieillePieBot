import './extensions/DayJs';

import Bot from './Bot';

const bot = new Bot();
bot.login(process.env.TOKEN);
