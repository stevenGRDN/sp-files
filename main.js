import { SuperpoweredGlue, SuperpoweredWebAudio } from '@superpoweredsdk/web';

import { SuperpoweredTrackLoader } from './static/superpowered/SuperpoweredWebAudio.js';

const minimumSampleRate = 44100;

let processorNode;


document.querySelector('#loadAssetButton').addEventListener('click', async () =>{
  const superpowered = await SuperpoweredGlue.Instantiate('ExampleLicenseKey-WillExpire-OnNextUpdate');
  const webaudioManager = new SuperpoweredWebAudio(minimumSampleRate, superpowered);

  const playerProcessorURL = 'playerProcessor.js';
  processorNode = await webaudioManager.createAudioNodeAsync(playerProcessorURL, 'PlayerProcessor', onMessageProcessorAudioScope);
  processorNode.onprocessorerror = (e) => {
    console.error(e);
  };

  // webaudioManager.audioContext.resume();
  webaudioManager.audioContext.suspend();
  processorNode.connect(webaudioManager.audioContext.destination);

  webaudioManager.audioContext.resume();
  const loadedCallback = processorNode.sendMessageToAudioScope.bind(
    processorNode
  );

  console.log(superpowered.downloadAndDecode);
  console.log(SuperpoweredTrackLoader.downloadAndDecode);
  superpowered.downloadAndDecode(
    "song.mp3",
    loadedCallback
  );

})

function onMessageProcessorAudioScope(message) {
  if (message.event === "ready") {
    // The processor node is now loaded
    console.log("✅ Processor ready.");
  }
  if (message.event === "assetLoaded") {
    console.log("✅ Track loaded and playing!");
    document.querySelector("#loadAssetButton").style.display = "none";
    document.querySelector("#playerVolumeSlider").disabled = false;
    document.querySelector("#playerSpeedSlider").disabled = false;
    document.querySelector("#playerPitchSlider").disabled = false;
    document.querySelector("#trackLoadStatus").style.display = "none";
  }
}

function onParamChange(id, value) {
    processorNode.sendMessageToAudioScope({
      type: "parameterChange",
      payload: {
        id,
        value
      }
    });
}

window.onParamChange = onParamChange;