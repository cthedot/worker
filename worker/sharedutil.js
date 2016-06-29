"use strict";
var Sharedutil;

; (function () {

  function crud(url, options) {
    // url, { method=GET, data={} }
    options = options || {}

    return new Promise(function (resolve, reject) {
      var method = options.method || 'GET'
      var _dataPairs = [];
      var data = "";

      for (var name in options.data || {}) {
        _dataPairs.push(
          encodeURIComponent(name) + '=' +
          encodeURIComponent(options.data[name])
        );
      }
      data = _dataPairs.join('&').replace(/%20/g, '+');

      var request = new XMLHttpRequest();

      request.addEventListener('loadend', function (e) {
        if ([200, 201].indexOf(request.status) > -1) {
          resolve(request.response)
        }
        else {
          reject({
            url: url,
            status: request.status,
            statusText: request.statusText
          })
        }
      });

      request.addEventListener('error', function (e) {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      });

      request.responseType = 'json'
      request.open(method, url + (
        (data && method == 'GET') ? '?' + data : ''
      ));
      if (method == 'POST') {
        request.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );
        request.setRequestHeader('Content-Length', data.length);
      }
      request.send(data);
    })
  }

  Sharedutil = {
    crud: crud
  }
})();