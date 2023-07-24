import Bot from '../Bot';

import dayjs from 'dayjs';
import type { APIEmbed } from 'discord-api-types/v10';
import type { Guild, GuildMember, TextChannel } from 'discord.js';
import { scheduleJob } from 'node-schedule';

import holidays from '../assets/holidays.json';
import weatherLocation from '../assets/msgtoday/location.json';
import { birthdayRole, guildId, msgTodayChannel } from '../utils/constants';

import { createCanvas, loadImage, registerFont } from 'canvas';

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

interface NewsInterface {
    articles: ArticleInterface[];
}

interface ArticleInterface {
    title: string;
    url: string;
}

interface CityData {
    cityID: number;
    x: number;
    y: number;
}

interface WeatherData {
    main: { temp: number };
    weather: [{ icon: WeatherIcon }];
}

type WeatherIcon =
    | '01d'
    | '01n'
    | '02d'
    | '02n'
    | '03d'
    | '03n'
    | '04d'
    | '04n'
    | '09d'
    | '09n'
    | '10d'
    | '10n'
    | '11d'
    | '11n'
    | '13d'
    | '13n'
    | '50d'
    | '50n';

export default class MessageTodayManager {
    public client: Bot;

    constructor(client: Bot) {
        this.client = client;
    }

    public async init() {
        registerFont('./src/assets/fonts/Roboto-Bold.ttf', { family: 'Roboto' });

        // At 7am
        scheduleJob('0 7 * * *', async () => {
            await this.run();
        });
    }

    public async run() {
        const { globalNews, techNews } = await this._getNews();
        const todayFete = this._getTodayFete();

        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return;

        const channel = (await guild.channels.fetch(msgTodayChannel)) as TextChannel;
        if (!channel) return;

        const birthdayMembers = await this._getBirthdayMembers(guild);
        const weatherImage = await this._generateImage();

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
                    color: 0x5865f2,
                    timestamp: !birthdayMembers && new Date().toISOString(),
                    footer: !birthdayMembers && { text: guild.name, icon_url: guild.iconURL() ?? undefined },
                    image: { url: 'attachment://weather.png' }
                },
                birthdayMembers && {
                    title: '🎉 Anniversaire',
                    description: `Souhaitez un joyeux anniversaire à ${birthdayMembers}.`,
                    color: 0xea45bc,
                    timestamp: new Date().toISOString(),
                    footer: { text: guild.name, icon_url: guild.iconURL() ?? undefined }
                }
            ].filter(Boolean) as APIEmbed[],
            files: [{ attachment: weatherImage, name: 'weather.png' }]
        });
    }

    private _getTodayFete() {
        const todayData = dayjs();
        const currentMonth = todayData.format('MMMM') as monthType;
        const currentDay = todayData.format('D') as dayType;
        return holidays[currentMonth][currentDay];
    }

    private async _getNews() {
        const globalNews = await this._fetchNews('world');
        const techNews = await this._fetchNews('technology');
        return { globalNews, techNews };
    }

    private async _fetchNews(topic: 'world' | 'technology') {
        try {
            const response = await fetch(
                `https://gnews.io/api/v4/top-headlines?token=${process.env.gnews_token}&topic=${topic}&lang=fr&country=fr,ch,ca&max=5`
            );
            const { articles }= await response.json() as NewsInterface;

            const filtredArticles: Array<ArticleInterface> = [];
            for (const article of articles) {
                if (!filtredArticles.find((art) => article.title === art.title)) {
                    filtredArticles.push(article);
                }
            }
            return filtredArticles.slice(0, 3);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    private async _getBirthdayMembers(guild: Guild) {
        if (!birthdayRole) return;

        const members = await guild.members.fetch();
        const birthdayMembers = members.filter((member: GuildMember) => member.roles.cache.has(birthdayRole));

        return new Intl.ListFormat('fr', { type: 'conjunction' }).format(
            birthdayMembers.map((member: GuildMember) => member.toString())
        );
    }

    private async _generateImage() {
        const canvas = createCanvas(2048, 1365);
        const context = canvas.getContext('2d');

        context.font = '60px Roboto';
        context.fillStyle = '#ffffff';

        const backgroundImage = await loadImage('./src/assets/msgtoday/carte.png');
        const weatherIcons = {
            '01d': await loadImage('./src/assets/msgtoday/icons/01d.png'),
            '01n': await loadImage('./src/assets/msgtoday/icons/01n.png'),
            '02d': await loadImage('./src/assets/msgtoday/icons/02d.png'),
            '02n': await loadImage('./src/assets/msgtoday/icons/02n.png'),
            '03d': await loadImage('./src/assets/msgtoday/icons/03d.png'),
            '03n': await loadImage('./src/assets/msgtoday/icons/03n.png'),
            '04d': await loadImage('./src/assets/msgtoday/icons/04d.png'),
            '04n': await loadImage('./src/assets/msgtoday/icons/04n.png'),
            '09d': await loadImage('./src/assets/msgtoday/icons/09d.png'),
            '09n': await loadImage('./src/assets/msgtoday/icons/09n.png'),
            '10d': await loadImage('./src/assets/msgtoday/icons/10d.png'),
            '10n': await loadImage('./src/assets/msgtoday/icons/10n.png'),
            '11d': await loadImage('./src/assets/msgtoday/icons/11d.png'),
            '11n': await loadImage('./src/assets/msgtoday/icons/11n.png'),
            '13d': await loadImage('./src/assets/msgtoday/icons/13d.png'),
            '13n': await loadImage('./src/assets/msgtoday/icons/13n.png'),
            '50d': await loadImage('./src/assets/msgtoday/icons/11d.png'),
            '50n': await loadImage('./src/assets/msgtoday/icons/50n.png')
        };

        context.drawImage(backgroundImage, 0, 0, 2048, 1365);

        const weatherLocations: Array<[string, CityData]> = Object.entries(weatherLocation);
        for (const [city, value] of weatherLocations) {
            console.log(`Carte > ${city}`);
            const weatherData = await this._getWeatherData(value.cityID);
            if (weatherData) {
                context.fillText(`${Math.round(weatherData.main.temp)}°C`, value.x, value.y);
                context.drawImage(weatherIcons[weatherData.weather[0].icon], value.x + 25, value.y);
            }
        }

        return canvas.toBuffer('image/png', { compressionLevel: 6 });
    }

    private async _getWeatherData(cityId: number) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&APPID=${process.env.weather_token}&lang=fr&units=metric`
            );
            return response.json() as Promise<WeatherData>;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
