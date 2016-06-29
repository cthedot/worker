"use strict";
var Sharedutil;

; (function () {

  function crud(url, options) {
    // url, { method=GET, data={} }
    options = options || {}

    return new Promise(function (resolve, reject) {
      var request = new XMLHttpRequest();
      var method = options.method || 'GET'
      var _dataPairs = [];

      for (var name in options.data || {}) {
        _dataPairs.push(
          encodeURIComponent(name) + '=' +
          encodeURIComponent(options.data[name])
        );
      }
      var data = _dataPairs.join('&').replace(/%20/g, '+');

      request.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
          var percentComplete = e.loaded / e.total;
          console.log(percentComplete)
        } else {
        }
      });
      request.addEventListener('load', function (e) {
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

      request.open(method, url + (
        (data && method == 'GET') ? '?' + data : ''
      ));
      request.responseType = 'json'
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