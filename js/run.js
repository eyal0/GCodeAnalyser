var Worker = require('tiny-worker');
var fs = require('fs');

gcodeLines = [];

settings = {"maxSpeed":[100,100,10,100],"maxPrintAcceleration":[1000,1000,100,10000],"maxTravelAcceleration":[1000,1000,100,10000],"maxJerk":[10,10,1,10],"absoluteExtrusion":false,"feedrateMultiplyer":100,"filamentDiameter":1.75,"firmwareRetractLength":2,"firmwareUnretractLength":2,"firmwareRetractSpeed":50,"firmwareUnretractSpeed":50,"firmwareRetractZhop":0,"timeScale":1.01}

var gcodeProcessorWorker = new Worker(__dirname + '/gcodeProcessor.js');
var progress = [];
gcodeProcessorWorker.onmessage = function (e) {
  if ("filepos" in e.data) {
    progress.push([e.data.filepos, e.data.printTime])
  }
  if ("result" in e.data) {
    //console.log(e.data)
    // All the data is in progress now.
    var total_filesize = progress[progress.length-1][0]
    var total_printtime = progress[progress.length-1][1]
    console.log("{\"progress\": [")
    console.log("[0,0],")
    var last_printed_progress = 0;
    for (progress_entry of progress) {
      var new_printed_progress = progress_entry[1];
      if (last_printed_progress+60 < new_printed_progress) {
        console.log("[" + progress_entry[0]/total_filesize +
                    "," + progress_entry[1]/total_printtime +
                    "],");
        last_printed_progress = new_printed_progress;
      }
    }
    console.log("[" + progress[progress.length-1][0] +
                "," + progress[progress.length-1][1] +
                "]");
    console.log("]}");
    gcodeProcessorWorker.terminate();
  }
}
fs.readFile(process.argv[2], "utf8",
            function(err, data) {
              gcodeLines = data.split(/(?=[\r\n]+)/g);
              //console.log(gcodeLines);
              /*console.log(gcodeLines
                          .map(x => x.length)
                          .reduce((x,y) => x + y));*/

              gcodeProcessorWorker.postMessage([gcodeLines, settings]);
            });
