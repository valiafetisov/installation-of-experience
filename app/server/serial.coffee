SerialPort.list (err, ports)->
  ports.forEach (port)->
    console.log(port.comName);
    console.log(port.pnpId);


if Meteor.settings.arduinoPort?

  Arduino = new SerialPort.SerialPort Meteor.settings.arduinoPort, {
    baudrate: 9600,
    # parser: SerialPort.parsers.readline('\r\n')
  }

  Arduino.on 'open', ->
    console.log 'port is open now'

  onData = (data)->

    switch data.toString('utf-8')

      when 'c'
        console.log 'door is closing'
        Meteor.call 'enters'

      when 'o'
        console.log 'door is opening'

      when 'r'
        console.log 'ready for new visitor'
        Meteor.call 'exits'

      else
        console.error 'strange message recieved:', data

  Arduino.on 'data', Meteor.bindEnvironment onData

