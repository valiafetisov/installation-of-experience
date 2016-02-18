Template.table.onRendered ->
  Meteor.setTimeout ->
    $('.table').css {
      'padding': Meteor.settings.public.view.padding
      'font-size': Meteor.settings.public.view.size
    }
    $('.row').css 'width', (index)->
      return (100 - 1) / Meteor.settings.public.view.cols + '%'
  , 1000


Template.table.helpers {

  recordingsChunks: ->
    array = Records.find({}, {sort: {from: 1}}).fetch()
    if !array? then return
    if !Meteor.settings.public.view.rows? then return
    ret = []
    chunk = Meteor.settings.public.view.rows
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

