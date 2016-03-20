@fs = Npm.require('fs')

@Video = {

  isConfigurated: ->
    if !Meteor.settings?.video?
      # throw new Meteor.Error "no video configuration provided"
      console.error "no video configuration provided"
      return false
    return true

  createFilePath: (_id)->
    rec = Records.findOne _id
    if !rec? then return
    from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss')
    @currentDir = Meteor.settings.video.folder + "/" + moment(rec.from).format('YYYY-MM-DD')
    if !fs.existsSync(@currentDir)
      fs.mkdirSync(@currentDir)
    return @currentFile = @currentDir + "/" + "from_" + from + "_id_" + _id + ".mp4"


  createOutStream: (_id)->
    if !_id? then _id = ''
    return fs.createWriteStream createFilePath(_id)

  start: (_id)->
    if !@isConfigurated() then return

    if Meteor.settings.video.streamA.indexOf('rtsp://') isnt 0
      Video.instance = ffmpeg(Meteor.settings.video.streamA)
      .inputFormat('avfoundation')
      .toFormat('mp4')
      .videoCodec('libx264')

    else
      Video.instance = ffmpeg(Meteor.settings.video.streamA)
      .inputFormat('mp4')
      .toFormat('mp4')
      .videoCodec('copy')

    Video.instance
    .outputOptions('-movflags frag_keyframe+empty_moov')
    .on('error', (err)->
      console.log 'An error occurred:', err
    )
    .on('end', ->
      console.log 'Processing finished!'
    )
    .save Video.createFilePath(_id)

  stop: (_id)->
    if !@isConfigurated() then return
    # console.log "Video.instance", Video.instance
    if Video.instance? and Video.instance.kill?

      try
        Video.instance.kill('SIGINT')
      catch e
        Video.instance.kill()

      delete Video.instance

      rec = Records.findOne _id
      if !rec? then return

      from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss')
      to = moment(rec.to).format('YYYY-MM-DD_HH-mm-ss')
      newPath = Video.currentDir + '/' + "from_" + from + "_to_" + to + "_id_" + _id + ".mp4"
      fs.renameSync(Video.currentFile, newPath)

}

