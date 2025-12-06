class Track {
  constructor(data = {}) {
    this._id = data.id || data._id;
    this.title = data.title || '';
    this.url = data.url || '';
    this.author = data.author || '';
    this.duration = data.duration || 0;
    this.thumbnail = data.thumbnail || '';
    this.platform = data.platform || '';
    this.playable = data.playable === 1 || data.playable === true;
  }
}

module.exports = Track;