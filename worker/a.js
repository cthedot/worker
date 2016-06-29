"use strict";

if (typeof importScripts === 'function') {
  importScripts('sharedutil.js');

  self.addEventListener('message', function (e) {
    e.data.forEach(function (data) {
      Sharedutil.crud(data).then(postMessage).catch(postMessage)
    })

  });
}