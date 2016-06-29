"use strict";
if (typeof importScripts === 'function') {
  importScripts('sharedutil.js');

  self.addEventListener('message', function (e) {
    // expected a list of URLs to download

    function post(e) {
      postMessage(e)
    }

    e.data.forEach(function (url, i) {
      Sharedutil.crud(url, {
        id: i,
        progress: post,
        error: post,
        ok: post
      })
    })
  });
}