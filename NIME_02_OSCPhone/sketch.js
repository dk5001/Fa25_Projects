// Save this file as sketch.js in your project folder.
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
  if (oscMsg.address && oscMsg.address.includes("gyro")) {
    // Get x, y, z from OSC message
    let [x, y, z] = oscMsg.args;

    // Convert z angle to MIDI CC value (0-127)
    let trackSwitchValue = Math.floor(z * 127);

    // Send MIDI Control Change message
    midiOut.sendMessage([176, 1, trackSwitchValue]); // CC1, channel 1

    console.log(`Received OSC: ${oscMsg.address} ${x}, ${y}, ${z}`);
  }
});
