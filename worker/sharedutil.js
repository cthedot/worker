"use strict";
var Sharedutil;

; (function () {

  function crud(url, options) {
    // url, { ok, error, [progress, method=GET, data={}, id] }
    // callback ok called with { ok: response }
    // callback error called with { error: response }
    // callback progress called with { progress: response } [optional]
    options = options || {}

    var request = new XMLHttpRequest();
    var method = options.method || 'GET'
    var timeout = options.timeout || 5000
    var progress = options.progress

    var data = ''
    var _dataPairs = [];

    for (var name in options.data || {}) {
      _dataPairs.push(
        encodeURIComponent(name) + '=' +
        encodeURIComponent(options.data[name])
      );
    }
    data = _dataPairs.join('&').replace(/%20/g, '+');

    if (options.progress) {
      request.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
          progress({
            url: url,
            id: options.id,
            progress: e.loaded / e.total
          })
        }
      });
    }
    var errorHandler = function (e) {
      options.error({
        url: url,
        id: options.id,
        error: request.status,
        statusText: request.statusText
      })
    }
    request.addEventListener('load', function (e) {
      if ([200, 201].indexOf(request.status) > -1) {
        options.ok({
          url: url,
          id: options.id,
          ok: request.response
        })
      }
      else {
        errorHandler(e)
      }
    });
    request.addEventListener('error', errorHandler);
    request.open(method, url + (
      (data && method == 'GET') ? '?' + data : ''
    ));
    request.responseType = 'json'
    request.timeout = timeout
    if (method == 'POST') {
      request.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded'
      );
      request.setRequestHeader('Content-Length', data.length);
    }
    request.send(data);
  }

  Sharedutil = {
    crud: crud
  }
})();