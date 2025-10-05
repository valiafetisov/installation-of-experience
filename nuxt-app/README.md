# Installation of Experience Application

The code which primary functions are:
- Receive serial commands from Arduino controller regarding the state of the room
- Keep clean sqlite database with every visit to the room
- Display latest database records in a table
- Record videos from two IP cameras
- Upload videos to the specified remote server

Written using [nuxt framework](https://nuxt.com/docs/getting-started/introduction).

## Environment variables

- `PATH_TO_ARDUINO_PORT` (optional, default: first port starting with `/dev/cu.usb`) – path to a specific COM port on which Arduino is connected. Note that the Arduino should be pre-programmed with `../sketch` source code before being specified here

## Quick start

0. Specify env variables required above
1. Install dependencies via `npm install`
2. Run dev server via `npm run dev`
3. For production, build the system via `npm run build`, preview via `npm run preview`
