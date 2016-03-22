@fs = Npm.require('fs')

@Video = {

  instances: {}
  currentFiles: {}

  isConfigurated: ->
    if !Meteor.settings?.video?
      # throw new Meteor.Error "no video configuration provided"
      console.error "no video configuration provided"
      return false
    return true

  createFilePath: (name, _id)->
    rec = Records.findOne _id
    if !rec? then return
    from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss')
    @currentDir = Meteor.settings.video.folder + "/" + moment(rec.from).format('YYYY-MM-DD')
    if !fs.existsSync(@currentDir)
      fs.mkdirSync(@currentDir)
    return @currentFiles[name] = @currentDir + "/" + "from_" + from + "_id_" + _id + "_" + name + ".mp4"

  createOutStream: (_id)->
    if !_id? then _id = ''
    return fs.createWriteStream createFilePath(_id)

  start: (_id)->
    if !@isConfigurated() then return
    if !Meteor.settings.video.streams? then return
    for name, stream of Meteor.settings.video.streams
      Video.record(stream, name, _id)

  record: (stream, name, _id) ->
    if stream.indexOf('rtsp://') isnt 0 and
      stream.indexOf('http://') isnt 0
        Video.instances[name] = ffmpeg(stream)
        .inputFormat('avfoundation')
        .toFormat('mp4')
        .videoCodec('libx264')

    else
      Video.instances[name] = ffmpeg(stream)
      .format('mp4')
      .toFormat('mp4')
      .videoCodec('copy')

    Video.instances[name]
    .outputOptions('-movflags frag_keyframe+empty_moov')
    .outputOptions('-pix_fmt yuv420p')
    .on('error', (err)->
      console.log 'An error occurred:', err
    )
    .on('end', ->
      console.log 'Processing finished!'
    )
    .save Video.createFilePath(name, _id)

  stop: (_id)->
    if !@isConfigurated() then return
    if !Meteor.settings.video.streams? then return

    rec = Records.findOne _id
    if !rec? then return
    from = moment(rec.from).format('YYYY-MM-DD_HH-mm-ss')
    to = moment(rec.to).format('YYYY-MM-DD_HH-mm-ss')

    for name, stream of Meteor.settings.video.streams
      if !Video.instances[name]? or !Video.instances[name].kill? then return

      try
        # Video.instance.kill('SIGINT')
        Video.instances[name].kill()
      catch e
        console.log 'video stoped (hopefully)', e

      delete Video.instances[name]

      newPath = Video.currentDir + '/' + "from_" + from + "_to_" + to + "_id_" + _id + "_" + name + ".mp4"
      if fs.existsSync(Video.currentFiles[name]) then fs.renameSync(Video.currentFiles[name], newPath)

}

