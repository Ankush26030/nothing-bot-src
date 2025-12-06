/**
 * @param {const("discord.js").ThreadChannel} thread
 */

  module.exports = {
  name: "thread",
  run: async (_, thread) => {
  if (thread.joinable && !thread.joined) {
    await thread.join();
  }
  }
  };
