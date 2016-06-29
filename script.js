"use strict";
; (function () {

  var $progress
  var $output
  var $test

  var i = 0
  function output(o) {
    if (typeof o == 'object') {
      o = JSON.stringify(o)
    }
    $output.innerHTML += o + '<br><br>'
  }

  document.addEventListener('DOMContentLoaded', function (e) {

    $test = document.getElementById('test')
    var anim = setInterval(function () {
      $test.innerText = 1000 + Math.ceil(8999 * Math.random())
      $test.style.backgroundColor = 'rgb(' +
          Math.floor(255 * Math.random()) + ',' +
          Math.floor(255 * Math.random()) + ',' +
          Math.floor(255 * Math.random()) + ')'
    }, 20)

    var aWorker = new Worker("worker/a.js");
    var files = ['/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json', '/data/test.json']

    $output = document.getElementById('output')
    $progress = document.getElementById('progress')
    $progress.value = 0
    $progress.max = files.length;

    function messageHandler(e) {
      $progress.value += 1
      output($progress.value);

      if ($progress.value == $progress.max) {
        $test.classList.add('stop')
        clearInterval(anim)
      }
    }

    aWorker.onmessage = messageHandler
    aWorker.postMessage(files);
  })
})();