const Arduino = {
  search() {
    SerialPort.list(Meteor.bindEnvironment((err, ports) => {
      if (err) {
        console.error('no com ports found', err);
      }
      // console.info('list of com ports found:', ports.map(e => '\n' + e.comName).join());

      const arduinoPorts = [];
      ports.forEach(port => {
        if (port.comName.indexOf('/dev/cu.usb') === 0) {
          arduinoPorts.push(port.comName);
        }
      });

      if (arduinoPorts.length === 0) {
        console.error("no arduino ports found");
        Meteor.setTimeout(() => {
          Arduino.search();
        }, 5000);
      } else if (arduinoPorts.length === 1) {
        Arduino.openArduino(arduinoPorts[0]);
      } else {
        if (Meteor.settings.arduinoPort && arduinoPorts.includes(Meteor.settings.arduinoPort)) {
          Arduino.openArduino(Meteor.settings.arduinoPort);
        } else {
          Arduino.openArduino(arduinoPorts[0]);
        }
      }
    }));
  },

  openArduino: Meteor.bindEnvironment(function (arduinoPort) {
    Arduino.port = arduinoPort;
    Arduino.instance = new SerialPort.SerialPort(arduinoPort, {
      baudrate: Meteor.settings.arduinoSpeed || 115200
    });
    Arduino.instance.on('open', Meteor.bindEnvironment(Arduino.onOpen));
    Arduino.instance.on('close', Meteor.bindEnvironment(Arduino.onClose));
    Arduino.instance.on('error', Meteor.bindEnvironment(Arduino.onError));
    Arduino.instance.on('data', Meteor.bindEnvironment(Arduino.onData));
  }),

  onOpen() {
    console.log("port opened", Arduino.port);
  },

  onClose(data) {
    console.log("port closed", Arduino.port, data);
    Arduino.close();
    Arduino.search();
  },

  close() {
    delete Arduino.instance;
    delete Arduino.port;
  },

  onError(data) {
    console.log("port error", Arduino.port, data);
  },

  onData(data) {
    const str = data.toString('utf-8');
    for (let i = 0; i < str.length; i++) {
      Arduino.processSymbol(str[i]);
    }
  },

  processSymbol(symbol) {
    switch (symbol) {
      case 'c':
        console.log('door is closing');
        Meteor.call('enters');
        break;
      case 'o':
        console.log('door is opening');
        Meteor.call('exits');
        break;
      case 'e':
        console.log('door is opening by button');
        Meteor.call('exits', 'emergency');
        break;
      case 'r':
        Meteor.call('ready');
        console.log('ready for new visitor');
        break;
      default:
        console.error('strange message recieved:', symbol);
    }
  }
};

Arduino.search();
