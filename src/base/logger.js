
const moment = require("moment");
module.exports = class Logger {
  static log (content, type = "log") {
    switch (type) {

    case "log": {
      return console.log(`• [ Log ] ` + "      => " + content);
    }
    case "warn": {
      return console.log(`• [ Warn ] ` + "      => " + content);
    }
    case "error": {
      return console.log(`• [ Error ] ` + "      => " + content);
    }
    case "debug": {
      return console.log(`• [ Debug ] ` + "      => " + content);
    }
    case "cmd": {
      return console.log(`• [ Commands ] ` + "      => " + content);
    }
    case "event": {
      return console.log(`• [ Event ] ` + "      => " + content);
    }
    case "ready": {
      return console.log(`• [ Ready ] ` + "      => " + content);
    } 
    default: throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
    }
  }
};