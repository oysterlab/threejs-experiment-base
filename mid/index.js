const socket = require('socket.io-client')('http://localhost:5000/visual')

var synth = new Tone.Synth().toMaster();

const ai_signals = [];
const user_signals = [];

if(socket) {
  socket.on('toss-signal', (signal) => {
    (signal.from == 'user') ?
      user_signals.push(signal) : ai_signals.push(signal)
    console.log(user_signals, ai_signals)
  })
}
