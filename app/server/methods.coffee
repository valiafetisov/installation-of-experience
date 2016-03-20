Meteor.methods {

  enters: ()->
    Records.remove {from: {$exists: false}}
    Records.remove {to: {$exists: false}}
    id = Records.insert {from: new Date()}
    Video.start(id)
    return 'ok'

  exits: (reason)->
    latestRecords = Records.find({from: {$exists: true}, to: {$exists: false}}, {sort: {from: -1}, limit: 1}).fetch()
    # console.log "latestRecords", latestRecords
    if !latestRecords? or _.isEmpty(latestRecords) or !latestRecords[0]? then return "error: latestRecords is empty"
    latestRecord = latestRecords[0]
    console.log "latestRecord", moment(latestRecord.from).format('HH:mm') + ' - ' + moment().format('HH:mm')
    Records.update latestRecord._id, {$set: {to: new Date(), reason: reason}}
    Records.remove {to: {$exists: false}}
    Records.remove {from: {$exists: false}}
    return 'ok'

  ready: ->
    latestRecords = Records.find({from: {$exists: true}, to: {$exists: true}}, {sort: {from: -1}, limit: 1}).fetch()
    if !latestRecords? or _.isEmpty(latestRecords) or !latestRecords[0]? then return "error: latestRecords is empty"
    Video.stop(latestRecords[0]._id)
    return 'ok'


}

