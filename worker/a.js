"use strict";
if (typeof importScripts === 'function') {
  importScripts('workerutil.js');
  addEventListener('message', function (e) {

    Workerutil.crud(e.data)
      .then(function (e) {
        postMessage(e)
      })
      .catch(function (e) {
        postMessage(e)
      })
  });

}


