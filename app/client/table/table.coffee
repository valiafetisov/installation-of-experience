Template.table.onRendered ->
  width = (100 - 1) / Meteor.settings.public.x
  Meteor.setTimeout ->
    # $('.row').width('24%')
    $('.row').css 'width', (index)->
      return (100 - 1) / Meteor.settings.public.x + '%'
  , 1000


Template.table.helpers {

  recordingsChunks: ->
    array = Records.find({}, {sort: {from: 1}}).fetch()
    if !array? then return
    if !Meteor.settings.public.y? then return
    ret = []
    chunk = Meteor.settings.public.y
    i = 0
    j = array.length
    while i < j
      ret.push array.slice(i, i + chunk)
      i += chunk
    # console.log 'recordingsChunks', ret, array, i, j
    return ret

  getPeriod: (date)->
    # return date.from
    space = "<span style='visibility:hidden;'>:00</span>"
    if !date? or !date.from? then return "&nbsp;"
    from = space + moment(date.from).format('HH:mm')
    if !date.to then return from + ' – ' + moment(Session.get "reactiveTime").format('HH:mm:ss')
    to = moment(date.to).format('HH:mm') + space
    return from + ' – ' + to

}


Session.setDefault "reactiveTime", new Date()
Meteor.setInterval ->
  Session.set "reactiveTime", new Date()
, 500

