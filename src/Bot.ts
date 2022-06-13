import { Client, IntentsBitField } from 'discord.js';
import MessageTodayManager from './modules/MessageToday';

export default class VieillePieBot extends Client {
    public msgTodayManager: MessageTodayManager;

    constructor() {
        super({
            presence: {
                status: 'online'
            },
            intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMembers
        });

        this.msgTodayManager = new MessageTodayManager(this);

        this.once('ready', (client) => {
            console.log(`[${client.user.username}] Bot connecté !`);

            this.msgTodayManager.init();
        });
    }
}
