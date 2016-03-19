@Records = new Mongo.Collection "recordings"


# publish
if Meteor.isServer
  Meteor.publish null, ->
    @autorun (computation)->

      # check if x and y exists
      if !Meteor.settings? or
        !Meteor.settings.public? or
        !Meteor.settings.public.view? or
        !Meteor.settings.public.view.cols? or
        !Meteor.settings.public.view.rows?
          @ready()
          console.error "please provide a Meteor.settings.public.view.cols and Meteor.settings.public.view.rows"
          return []

      # calculate the limit
      # maxLimit = Meteor.settings.public.view.cols * Meteor.settings.public.view.rows
      fullCount = Records.find().count()
      limit = fullCount % Meteor.settings.public.view.rows + Meteor.settings.public.view.rows * (Meteor.settings.public.view.cols - 1)

      # return
      return Records.find {}, {sort: {from: -1}, limit: limit}

