import moment from 'moment';
import lodash from 'lodash';

Meteor.methods({
  enters() {
    Records.remove({ from: { $exists: false } });
    Records.remove({ to: { $exists: false } });
    const id = Records.insert({ from: new Date(), slug: Meteor.settings.slug });
    Video.start(id);
    return 'ok';
  },

  exits(reason) {
    const latestRecords = Records.find(
      { from: { $exists: true }, to: { $exists: false } },
      { sort: { from: -1 }, limit: 1 }
    ).fetch();

    if (!latestRecords || lodash.isEmpty(latestRecords) || !latestRecords[0]) {
      return "error: latestRecords is empty";
    }

    const latestRecord = latestRecords[0];
    console.log(
      "latestRecord",
      moment(latestRecord.from).format('HH:mm:ss') + ' - ' + moment().format('HH:mm:ss')
    );

    Records.update(latestRecord._id, { $set: { to: new Date(), reason } });
    Records.remove({ to: { $exists: false } });
    Records.remove({ from: { $exists: false } });
    return 'ok';
  },

  ready() {
    const latestRecords = Records.find(
      { from: { $exists: true }, to: { $exists: true } },
      { sort: { from: -1 }, limit: 1 }
    ).fetch();

    if (
      !latestRecords ||
      lodash.isEmpty(latestRecords) ||
      !latestRecords[0] ||
      latestRecords[0].ready
    ) {
      return "error: latestRecords is empty";
    }

    Records.update(latestRecords[0]._id, { $set: { ready: new Date() } });
    Video.stop(latestRecords[0]._id);
    return 'ok';
  }
});
