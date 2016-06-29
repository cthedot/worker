"use strict";
; (function () {

  var $progress
  var $progresses
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
    $output = document.getElementById('output')
    $progress = document.getElementById('progress')
    $progresses = document.getElementById('progresses')

    var anim = setInterval(function () {
      $test.innerText = 1000 + Math.ceil(8999 * Math.random())
      $test.style.backgroundColor = 'rgb(' +
          Math.floor(255 * Math.random()) + ',' +
          Math.floor(255 * Math.random()) + ',' +
          Math.floor(255 * Math.random()) + ')'
    }, 10)

    var aWorker = new Worker("worker/a.js");
    var files = ['/data/test.json?1', '/data/test.json?2', '/data/UNKNOWN.json']

    files.forEach(function (file, i) {
      $progresses.innerHTML += file + '<progress value=0 max=1 id=i'+i+'></progress>'
    })

    $progress.value = 0
    $progress.max = files.length;

    function messageHandler(e) {
      var data = e.data

      if (data.progress) {
        document.getElementById('i' + data.id).value = data.progress
      }
      else {
        output(data);
        $progress.value += 1
        if ($progress.value == $progress.max) {
          ///$test.classList.add('stop')
          clearInterval(anim)
        }
      }
    }

    aWorker.onmessage = messageHandler
    aWorker.postMessage(files);
  })
})();