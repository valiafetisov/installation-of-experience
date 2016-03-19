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

