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


if Meteor.isServer
  Meteor.methods {

    enters: ()->
      Records.remove {from: {$exists: false}}
      Records.remove {to: {$exists: false}}
      Records.insert {from: new Date()}
      return 'ok'

    exits: ()->
      latestRecords = Records.find({from: {$exists: true}, to: {$exists: false}}, {sort: {from: -1}, limit: 1}).fetch()
      # console.log "latestRecords", latestRecords
      if !latestRecords? or _.isEmpty(latestRecords) or !latestRecords[0]? then return "error: latestRecords is empty"
      latestRecord = latestRecords[0]
      console.log "latestRecord._id", latestRecord, moment(latestRecord.from).format('HH:mm')
      Records.update latestRecord._id, {$set: {to: new Date()}}
      Records.remove {to: {$exists: false}}
      Records.remove {from: {$exists: false}}
      return 'ok'

  }

