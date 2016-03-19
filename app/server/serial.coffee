@Arduino = {

  openArduino: Meteor.bindEnvironment (arduinoPort)->
    Arduino.port = arduinoPort
    Arduino.instance = new SerialPort.SerialPort arduinoPort, {
      baudrate: 115200
    }
    Arduino.instance.on 'open', Meteor.bindEnvironment Arduino.onOpen
    Arduino.instance.on 'data', Meteor.bindEnvironment Arduino.onData

  onOpen: ()->
    console.log "port opened", Arduino.port

  onData: (data)->
    str = data.toString 'utf-8'
    for i in [0..(str.length-1)]
      Arduino.processSymbol str[i]

  processSymbol: (symbol)->
    switch symbol
      when 'c'
        console.log 'door is closing'
        Meteor.call 'enters'
      when 'o'
        console.log 'door is opening'
        Meteor.call 'exits'
      when 'r'
        console.log 'ready for new visitor'
      else
        console.error 'strange message recieved:', symbol

}


SerialPort.list (err, ports)->
  if err
    throw new Meteor.Error 'no com ports found', err
  console.info 'list of com ports', ports.map((e)-> '\n' + e.comName).join()

  arduinoPorts = []
  ports.forEach (port)->
    if port.comName.indexOf('/dev/cu.usb') is 0
      arduinoPorts.push port.comName

  if arduinoPorts.length is 0
    console.error "no arduino ports found"
  else if arduinoPorts.length is 1
    Arduino.openArduino arduinoPorts[0]
  else
    if Meteor.settings.arduinoPort in arduinoPorts
      Arduino.openArduino Meteor.settings.arduinoPort
    else
      Arduino.openArduino arduinoPorts[0]

