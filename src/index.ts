import dotenv from 'dotenv';

dotenv.config({
    path: '@/../.env',
    encoding: 'utf8',
    debug: false
});

import './extensions/DayJs';

import Bot from './Bot';

const bot = new Bot();
bot.login(process.env.token);
