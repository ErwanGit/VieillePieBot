import { Client, IntentsBitField } from 'discord.js';
import MessageTodayManager from './modules/MessageToday';
import { devId } from './utils/constants';

export default class VieillePieBot extends Client {
  public msgTodayManager: MessageTodayManager;

  constructor() {
    super({
      presence: { status: 'online' },
      intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMembers
    });

    this.msgTodayManager = new MessageTodayManager(this);

    this.once('ready', (client) => {
      console.log(`[${client.user.username}] Bot connecté !`);

      this.msgTodayManager.init();
    });

    this.on('messageCreate', async (message) => {
      if (message.author.id !== devId) return;

      console.log(message.content, `<@${message.client.user.id}> msgtoday`);
      if (message.content === `<@${message.client.user.id}> msgtoday`) {
        await message.react('✅');
        return this.msgTodayManager.run();
      }
    });
  }
}
