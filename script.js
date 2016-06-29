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
    $progress.max = 10

    var aWorker = new Worker("worker/a.js");

    aWorker.onmessage = function (e) {
      console.log('Message received from worker', arguments);
      output(e.data);
    }

    aWorker.postMessage('/data/test.json');
  })


})();