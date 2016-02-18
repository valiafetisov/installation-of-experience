SerialPort.list (err, ports)->
  ports.forEach (port)->
    console.log(port.comName);
    console.log(port.pnpId);


if Meteor.settings.arduinoPort?

  Arduino = new SerialPort.SerialPort Meteor.settings.arduinoPort, {
    baudrate: 115200
  }

  Arduino.on 'open', ->
    console.log 'port is open now'

  onData = (data)->
    str = data.toString('utf-8')
    for i in [0..(str.length-1)]
      processSymbol(str[i]);

  processSymbol = (symbol)->
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
        console.error 'strange message recieved:', data.toString('utf-8')

  Arduino.on 'data', Meteor.bindEnvironment onData

