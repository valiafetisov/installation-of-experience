const fs = require('fs');

const Video = {
  instances: {},
  currentFiles: {},

  isConfigurated() {
    if (!(Meteor.settings?.video)) {
      // throw new Meteor.Error("no video configuration provided");
      console.error("no video configuration provided");
      return false;
    }
    return true;
  },

  createFilePath(name, _id) {
    const rec = Records.findOne(_id);
    if (!rec) return;
    const from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss');
    this.currentDir = Meteor.settings.video.folder + "/" + moment(rec.from).format('YYYY-MM-DD');
    if (!fs.existsSync(this.currentDir)) {
      fs.mkdirSync(this.currentDir);
    }
    return this.currentFiles[name] = this.currentDir + "/" + "from_" + from + "_id_" + _id + "_" + name + ".mp4";
  },

  createOutStream(_id) {
    if (_id == null) _id = '';
    return fs.createWriteStream(this.createFilePath(_id));
  },

  start(_id) {
    if (!this.isConfigurated()) return;
    if (!Meteor.settings.video.streams) return;
    for (const [name, stream] of Object.entries(Meteor.settings.video.streams)) {
      this.record(stream, name, _id);
    }
  },

  record(stream, name, _id) {
    if (stream.indexOf('rtsp://') !== 0 &&
        stream.indexOf('http://') !== 0) {
      this.instances[name] = ffmpeg(stream)
        .inputFormat('avfoundation')
        .toFormat('mp4')
        .videoCodec('libx264');
    } else {
      this.instances[name] = ffmpeg(stream)
        .format('mp4')
        .toFormat('mp4')
        .videoCodec('copy');
    }

    this.instances[name]
      .outputOptions('-movflags frag_keyframe+empty_moov')
      .outputOptions('-pix_fmt yuv420p')
      .on('error', (err) => {
        console.log('An error occurred:', err);
      })
      .on('end', () => {
        console.log('Processing finished!');
      })
      .save(this.createFilePath(name, _id));
  },

  stop(_id) {
    if (!this.isConfigurated()) return;
    if (!Meteor.settings.video.streams) return;

    const rec = Records.findOne(_id);
    if (!rec) return;
    const from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss');
    const to = moment(rec.to).format('YYYY-MM-DD_HH-mm-ss');

    for (const [name, stream] of Object.entries(Meteor.settings.video.streams)) {
      if (!this.instances[name] || !this.instances[name].kill) return;

      try {
        // this.instances[name].kill('SIGINT');
        this.instances[name].kill();
      } catch (e) {
        console.log('video stopped (hopefully)', e);
      }

      delete this.instances[name];

      const newPath = this.currentDir + '/' + "from_" + from + "_to_" + to + "_id_" + _id + "_" + name + ".mp4";
      if (fs.existsSync(this.currentFiles[name])) fs.renameSync(this.currentFiles[name], newPath);
    }
  }
};
