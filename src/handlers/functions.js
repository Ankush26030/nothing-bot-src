const { Collection } = require("discord.js")

function cooldown(interactionOrMessage, cmd) {
  if (!interactionOrMessage || !cmd) return false
  
  let client, userId
  
  // Check if it's an interaction (slash command) or message (prefix command)
  if (interactionOrMessage.member && interactionOrMessage.client) {
    // This is an interaction (slash command)
    client = interactionOrMessage.client
    userId = interactionOrMessage.member.id
  } else if (interactionOrMessage.author && interactionOrMessage.client) {
    // This is a message (prefix command)
    client = interactionOrMessage.client
    userId = interactionOrMessage.author.id
  } else {
    return false
  }
  
  if (!client.cooldowns.has(cmd.name)) {
    client.cooldowns.set(cmd.name, new Collection())
  }
  
  const now = Date.now()
  const timestamps = client.cooldowns.get(cmd.name)
  const cooldownAmount = cmd.cooldown * 1000
  
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return timeLeft
    } else {
      timestamps.set(userId, now)
      setTimeout(() => timestamps.delete(userId), cooldownAmount)
      return false
    }
  } else {
    timestamps.set(userId, now)
    setTimeout(() => timestamps.delete(userId), cooldownAmount)
    return false
  }
}

module.exports = {
  cooldown
};