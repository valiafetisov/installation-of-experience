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
    @record(Meteor.settings.video.streamA, _id)

  record: (stream, _id) ->
    if stream.indexOf('rtsp://') isnt 0 and
      stream.indexOf('http://') isnt 0
        Video.instance = ffmpeg(stream)
        .inputFormat('avfoundation')
        .toFormat('mp4')
        .videoCodec('libx264')

    else
      Video.instance = ffmpeg(stream)
      .format('mp4')
      .toFormat('mp4')
      .videoCodec('copy')

    Video.instance
    .outputOptions('-movflags frag_keyframe+empty_moov')
    .outputOptions('-pix_fmt yuv420p')
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
        Video.instance.kill()
      catch e
        # Video.instance.kill('SIGINT')
        console.log 'video stoped (hopefully)', e

      delete Video.instance

      rec = Records.findOne _id
      if !rec? then return

      from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss')
      to = moment(rec.to).format('YYYY-MM-DD_HH-mm-ss')
      newPath = Video.currentDir + '/' + "from_" + from + "_to_" + to + "_id_" + _id + ".mp4"
      if fs.existsSync(Video.currentFile) then fs.renameSync(Video.currentFile, newPath)

}

