Records = new Mongo.Collection("recordings");

// publish
if (Meteor.isServer) {
  Meteor.publish(null, function () {
    return this.autorun((computation) => {
      // check if x and y exists
      if (
        !Meteor.settings ||
        !Meteor.settings.public ||
        !Meteor.settings.public.view ||
        !Meteor.settings.public.view.cols ||
        !Meteor.settings.public.view.rows
      ) {
        this.ready();
        console.error("please provide a Meteor.settings.public.view.cols and Meteor.settings.public.view.rows");
        return [];
      }

      // calculate the limit
      // maxLimit = Meteor.settings.public.view.cols * Meteor.settings.public.view.rows
      const fullCount = Records.find().count();
      const limit = 1 + (fullCount % Meteor.settings.public.view.rows) + Meteor.settings.public.view.rows * (Meteor.settings.public.view.cols - 1);

      // return
      return Records.find({}, { sort: { from: -1 }, limit: limit });
    });
  });
}
