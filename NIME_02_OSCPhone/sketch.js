// Run with: node sketch.js

const osc = require("osc");
const midi = require("midi");

// Create MIDI output and connect to IAC Driver (virtual port)
const midiOut = new midi.Output();
midiOut.openVirtualPort("IAC Driver Bus 1");

// Create OSC server to receive messages from phone
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",     // listen on all interfaces
  localPort: 8000              // set this to match your phone OSC output!
});
udpPort.open();

udpPort.on("message", function (oscMsg) {
  // Compass Heading
  if (oscMsg.address === "/gyrosc/fl4me/comp") {
    let heading = oscMsg.args[0];
    let mappedHeading = Math.floor(heading);
    midiOut.sendMessage([176, 3, mappedHeading]); // CC3 for heading
    console.log('COMPASS heading:', heading, 'CC3:', mappedHeading);
  }

  // Quaternion
  if (oscMsg.address === "/gyrosc/fl4me/quat") {
    let [w, x, y, z] = oscMsg.args;
    let mappedW = clamp(Math.floor(w * 127), 10, 110);
    let mappedX = clamp(Math.floor(x * 127), 10, 110);
    let mappedY = clamp(Math.floor(y * 127), 10, 110);
    // let mappedZ = clamp(Math.floor(z * 127), 10, 110);
    midiOut.sendMessage([176, 4, mappedW]);
    midiOut.sendMessage([176, 5, mappedX]);
    midiOut.sendMessage([176, 6, mappedY]);
    // midiOut.sendMessage([176, 7, mappedZ]);
    console.log('Quaternion:', w, x, y, z, '-> CC4:', mappedW, 'CC5:', mappedX, 'CC6:', mappedY, /*'CC7:', mappedZ*/);
  }
});

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
