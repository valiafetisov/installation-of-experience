const int sensor = 8;
const int relay = 7;
const int debug = 13;
const int emergencyButton = 6;

int last = HIGH;
boolean inside = false;
unsigned long inside_time = 0;
unsigned long max_inside_time = 60*100000;
boolean wait = false;
unsigned long wait_time = 0;
unsigned long max_wait_time = 100000;
boolean inactive = false;
unsigned long inactive_time = 0;
unsigned long max_inactive_time = 10*100000;

int incomingByte;

void setup() {
  Serial.begin(115200);

  pinMode(sensor, INPUT_PULLUP);
  pinMode(emergencyButton, INPUT_PULLUP);
  pinMode(relay, OUTPUT);
  digitalWrite(relay, HIGH);
  pinMode(debug, OUTPUT);

  while (!Serial) {
    ;
  }
  Serial.write("r");
}

void loop() {
  int sensorVal = !digitalRead(sensor);
  digitalWrite(debug, !sensorVal);

  // catch
  if (inside == false && wait == false && sensorVal == LOW) {
    close();
  }

  // moved!
  if (inside == true && wait == false && sensorVal == LOW) {
    inside_time = 0;
  }

  // check the time
  if(inside == true && wait == false && sensorVal == HIGH) {
    inside_time++;
    //Serial.println(inside_time);
    if (inside_time > max_inside_time) {
      open();
    }
  }

  // wait for the first activity when door is open
  if(wait == true && inactive == true) {
    if(sensorVal == HIGH) {
      inactive_time++;
      if (inactive_time > max_inactive_time) {
        inactive = false;
        wait = true;
        inactive_time = 0;
      }
    } else {
      inactive = false;
    }
  }

  // wait untill person is moving out
  if(wait == true && inactive == false) {
    if(sensorVal == HIGH) {
      wait_time++;
      if (wait_time > max_wait_time) {
        wait = false;
        wait_time = 0;
        Serial.write("r");
      }
    } else {
      wait_time = 0;
    }
  }

  if (digitalRead(emergencyButton) == 0) {
    emergencyOpen();
    while(digitalRead(emergencyButton) == 0){
      //do nothing
    }
  }


  if (Serial.available() > 0) {
    incomingByte = Serial.read();
    if (incomingByte == 'o') {
      open();
    }
    if (incomingByte == 'w') {
      openWOwait();
    }
    if (incomingByte == 'c') {
      close();
    }
  }
}


void open() {
  Serial.write("o");
  digitalWrite(relay, HIGH);
  wait = true;
  inactive = true;
  inside = false;
  inside_time = 0;
}
void emergencyOpen() {
  Serial.write("e");
  digitalWrite(relay, HIGH);
  wait = true;
  inactive = true;
  inside = false;
  inside_time = 0;
}
void openWOwait() {
  Serial.write("o");
  digitalWrite(relay, HIGH);
  wait = false;
  inactive = true;
  inside = false;
  inside_time = 0;
}
void close() {
  Serial.write("c");
  digitalWrite(relay, LOW);
  delay(30);
  inside = true;
}
