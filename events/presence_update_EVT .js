module.exports = {
  name: 'PresenceUpdateEDIT',
  isEvent: true,

  fields: ['User Before Update (Temp Variable Name):', 'User After Update (Temp Variable Name):'],

  mod (DBM) {
    DBM.Events = DBM.Events || {}
    const { Bot, Actions } = DBM

    DBM.Events.callPresenceUpdateEDIT = function (oldPresence, newPresence) {
      if (!Bot.$evts['PresenceUpdateEDIT']) return
      for (const event of Bot.$evts['PresenceUpdateEDIT']) {
        const temp = {}
        const server = newPresence.guild
        if (event.temp) temp[event.temp] = oldPresence.member
        if (event.temp2) temp[event.temp2] = newPresence.member
        Actions.invokeEvent(event, server, temp)
      }
    }
    const onReady = Bot.onReady
    Bot.onReady = function (...params) {
      Bot.bot.on('presenceUpdate', DBM.Events.callPresenceUpdateEDIT)
      onReady.apply(this, ...params)
    }
  }
}