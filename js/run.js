console.log("write");
var Worker = require('tiny-worker');
var fs = require('fs');

gcodeLines = [];

settings = {"maxSpeed":[100,100,10,100],"maxPrintAcceleration":[1000,1000,100,10000],"maxTravelAcceleration":[1000,1000,100,10000],"maxJerk":[10,10,1,10],"absoluteExtrusion":false,"feedrateMultiplyer":100,"filamentDiameter":1.75,"firmwareRetractLength":2,"firmwareUnretractLength":2,"firmwareRetractSpeed":50,"firmwareUnretractSpeed":50,"firmwareRetractZhop":0,"timeScale":1.01}

var gcodeProcessorWorker = new Worker('gcodeProcessor.js');
gcodeProcessorWorker.onmessage = function (e) {
  //console.log(e);
  if ("progress" in e.data) {
    console.log(e.data.progress);
  }
  if ("complete" in e.data) {
    gcodeProcessorWorker.terminate();
  }
  //console.log(gcodeProcessorWorker)
}
fs.readFile(process.argv[2], "utf8",
            function(err, data) {
              gcodeLines = data.split(/\s*[\r\n]+\s*/g);
              //console.log(gcodeLines);
              gcodeProcessorWorker.postMessage([gcodeLines, settings]);
            });
