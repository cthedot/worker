"use strict";

; (function () {

  var $progress = document.getElementById('progress')
  var $output = document.getElementById('output')

  function output(o) {
    if (typeof o == 'object') {
      o = JSON.stringify(o)
    }
    $output.innerHTML += o + '<br><br>'
  }

  document.addEventListener('DOMContentLoaded', function (e) {

    var files = ['/data/test.json', '/data/test.json', 'UNKNOWN.json']
    var aWorker = new Worker("worker/a.js");

    $progress.max = files.length;
    $progress.value = 0

    aWorker.onmessage = function (e) {
      $progress.value += 1
      console.log('Message received from worker', e);
      output(e.data);
    }
    aWorker.postMessage(files);

  })


})();