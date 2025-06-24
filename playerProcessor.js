import { SuperpoweredWebAudio } from "https://cdn.jsdelivr.net/npm/@superpoweredsdk/web@2.7.2";

class PlayerProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor{
  // Runs after the constructor.
  onReady(){
    this.player = new this.Superpowered.AdvancedAudioPlayer(
      this.samplerate,
      2,    // Number of output channels
      2,    // Number of input channels
      0,    // Not streaming
      0.501,// Default gain
      2,    // Queue size
      false // Manual timing
    );
    this.player.loopOnEOF = false;
    this.playerGain = 1;

    // Notify the main scope that we're prepared.
    this.sendMessageToMainScope({ event: "ready" });
  }

  processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
    // Ensure the samplerate is in sync on every audio processing callback.
    this.player.outputSamplerate = this.samplerate;

    // Render into the output buffer.
    if (!this.player.processStereo(outputBuffer.pointer, false, buffersize, this.playerGain)) {
      // If no player output, set output to 0s.
      this.Superpowered.memorySet(outputBuffer.pointer, 0, buffersize * 8); // 8 bytes for each frame (1 channel is 4 bytes, two channels)
    }
  }

  onDestruct() {
    this.player.destruct();
  }

  onMessageFromMainScope(message) {
    if (message.type === "parameterChange") {

      if (message.payload.id === "localPlayerVolume") this.playerGain = message.payload.value;
      else if (message.payload.id === "localPlayerRate") this.player.playbackRate = message.payload.value;
      else if (message.payload.id === "localPlayerPitch") this.player.pitchShiftCents = message.payload.value;
    }
    if (message.SuperpoweredLoaded) {

      this.player.pause();
      this.sampleLoaded = true;
      this.player.openMemory(
        this.Superpowered.arrayBufferToWASM(message.SuperpoweredLoaded.buffer),
        false,
        false
      );
      this.player.seek(0);
      this.player.play();
      this.sendMessageToMainScope({ event: "assetLoaded" });
    }
  }
}

if (typeof AudioWorkletProcessor !== 'undefined') registerProcessor('PlayerProcessor', PlayerProcessor);
export default PlayerProcessor;