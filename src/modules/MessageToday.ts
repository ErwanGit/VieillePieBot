import Bot from '../Bot';

import got from 'got';
import dayjs from 'dayjs';
import { TextChannel, Guild, GuildMember } from 'discord.js';

import fetes from '../assets/fetes.json';
import { guildId, msgTodayChannel, birthdayRole } from '../utils/constants';

type monthType =
    | 'janvier'
    | 'février'
    | 'mars'
    | 'avril'
    | 'mai'
    | 'juin'
    | 'juillet'
    | 'aout'
    | 'septembre'
    | 'octobre'
    | 'novembre'
    | 'décembre';
type dayType =
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'
    | '22'
    | '23'
    | '24'
    | '25'
    | '26'
    | '27'
    | '28'
    | '29'
    | '30'
    | '31';

interface ArticleInterface {
    title: string;
    url: string;
}

interface NewsInterface {
    articles: ArticleInterface[];
}

export default class MessageTodayManager {
    public client: Bot;

    constructor(client: Bot) {
        this.client = client;
    }

    public async init() {
        this.run();
        // scheduleJob('0 * * * *', async () => {
        //     await this.run();
        // });
    }

    public async run() {
        const { globalNews, techNews } = await this._getNews();
        const todayFete = this._getTodayFete();

        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return;

        const channel = (await guild.channels.fetch(msgTodayChannel)) as TextChannel;
        if (!channel) return;

        const birthdayMembers = await this._getBirthdayMembers(guild);

        return channel.send({
            embeds: [
                {
                    title: '<:YB_Coucou:701523534094139433> Bonjour à tous !',
                    description: `Nous sommes aujourd'hui le **${dayjs().format(
                        'dddd D MMMM YYYY'
                    )}** et nous fêtons les **${todayFete}** !`,
                    fields: [
                        {
                            name: '📰 Actualités dans le monde',
                            value: globalNews
                                ? globalNews.map((news) => `● [${news.title}](${news.url})`).join('\n')
                                : "<:SodSs_Peur:673486362191724544> Les articles dans le monde n'ont pas été recupérés suite à une erreur.",
                            inline: true
                        },
                        {
                            name: '💻 Actualités Tech',
                            value: techNews
                                ? techNews.map((news) => `● [${news.title}](${news.url})`).join('\n')
                                : "<:SodSs_Peur:673486362191724544> Les articles technologiques n'ont pas été recupérés suite à une erreur.",
                            inline: true
                        }
                    ],
                    color: 0x5865f2
                },
                birthdayMembers && {
                    title: '🎉 Anniversaire',
                    description: `Souhaitez un joyeux anniversaire à ${birthdayMembers}.`,
                    color: 0xea45bc,
                    timestamp: Date.now(),
                    footer: { text: guild.name, icon_url: guild.iconURL() }
                }
            ].filter(Boolean)
        });
    }

    private _getTodayFete() {
        const todayData = dayjs();
        const currentMonth = todayData.format('MMMM') as monthType;
        const currentDay = todayData.format('D') as dayType;
        return fetes[currentMonth][currentDay];
    }

    private async _getNews() {
        const globalNews = await this._fetchNews('world');
        const techNews = await this._fetchNews('technology');
        return { globalNews, techNews };
    }

    private async _fetchNews(topic: 'world' | 'technology') {
        try {
            const { articles } = await got(
                `https://gnews.io/api/v4/top-headlines?token=${process.env.gnewsToken}&topic=${topic}&lang=fr&country=fr,ch,ca&max=3`
            ).json<NewsInterface>();
            return articles;
        } catch {
            return null;
        }
    }

    private async _getBirthdayMembers(guild: Guild) {
        if (!birthdayRole) return;

        const members = await guild.members.fetch();
        const birthdayMembers = members.filter((member: GuildMember) => member.roles.cache.has(birthdayRole));

        // @ts-expect-error La propriété 'ListFormat' n'existe pas sur le type 'typeof Intl'
        return new Intl.ListFormat('fr', { type: 'conjunction' }).format(
            birthdayMembers.map((member) => member.toString())
        ) as string;
    }
}
