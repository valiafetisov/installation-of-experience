import { SerialPort } from 'serialport'
import { enter, exit, EXIT_REASON_CORRECT, EXIT_REASON_EMERGENCY } from '../visits'

const PATH_TO_ARDUINO_PORT = process.env.PATH_TO_ARDUINO_PORT
const BAUD_RATE = 115200
const RETRY_TIMEOUT_MS = 5000

let timeout: NodeJS.Timeout | undefined;
let path: string | undefined
let port: SerialPort | undefined

const onOpen = () => {
    console.info('serialport: opened', path)
}

const onClose = (data: string) => {
    console.info('serialport: closed', path, data)
    search()
}

const onError = (data: string) => {
    console.info('serialport: error', path, data)
}

const onData = (data: string) => {
    const str = (data as any).toString('utf-8')
    for (let i = 0; i < str.length; i++) {
        switch (str[i]) {
            case 'c':
                console.info('serialport: door is closing')
                enter()
                break
            case 'o':
                console.info('serialport: door is opening')
                exit(EXIT_REASON_CORRECT)
                break
            case 'e':
                console.info('serialport: door is opening via emergency button')
                exit(EXIT_REASON_EMERGENCY)
                break
            case 'r':
                console.info('serialport: door is ready for the new visitor')
                break
            default:
                console.error(`serialport: unexpected message recieved: ${str[i]}`)
        }
    }
}

const openPort = (pathToOpen: string) => {
    path = pathToOpen
    port = new SerialPort({ path, baudRate: BAUD_RATE }, function (err) {
        if (err) {
            console.error(`serialport: opening serial port ${path}:`, err.message)
            retrySearch()
            return
        }
    })
    port.on('open', onOpen)
    port.on('close', onClose)
    port.on('error', onError)
    port.on('data', onData)
}

const search = async () => {
    if (timeout) clearTimeout(timeout)
    const ports = await SerialPort.list()
    if (PATH_TO_ARDUINO_PORT) {
        const specifiedPort = ports.find(port => port.path === PATH_TO_ARDUINO_PORT)
        if (!specifiedPort) {
            console.error(`serialport: specified PATH_TO_ARDUINO_PORT "${PATH_TO_ARDUINO_PORT}" was not found, retrying in ${RETRY_TIMEOUT_MS / 1000} seconds`)
            retrySearch()
            return
        } else {
            console.info(`serialport: using port specified in PATH_TO_ARDUINO_PORT "${PATH_TO_ARDUINO_PORT}"`)
            openPort(specifiedPort.path)
            return
        }
    }
    const firstArduinoLikePort = ports.find(port => port.path?.startsWith('/dev/tty.usb'))
    if (firstArduinoLikePort) {
        console.info(`serialport: using first found arduino-like port: "${firstArduinoLikePort}"`)
        openPort(firstArduinoLikePort.path)
        return
    }
    console.error(`serialport: no arduino-like ports found, retrying in ${RETRY_TIMEOUT_MS / 1000} seconds`)
    retrySearch()
}

const retrySearch = () => {
    timeout = setTimeout(() => { search() }, RETRY_TIMEOUT_MS)
}

// Run on startup
export default defineNitroPlugin(() => {
    search()
})
