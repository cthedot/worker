(function () {
  "use strict";

  var Notifications = Windows.UI.Notifications;
  var NetworkInformation = Windows.Networking.Connectivity.NetworkInformation;
  var INTERNET_ACCESS = Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess
  var LOCAL_ACCESS = Windows.Networking.Connectivity.NetworkConnectivityLevel.localAccess

  var getString = WinJS.Resources.getString

  var ViewManagement = Windows.UI.ViewManagement;
  var ApplicationView = ViewManagement.ApplicationView;
  var ApplicationViewWindowingMode = ViewManagement.ApplicationViewWindowingMode;
  var applicationView = ApplicationView.getForCurrentView();
  // fullscreen

  // appbar
  var GRAY = { a: 255, r: 38, g: 37, b: 38 }
  var BLACK = { a: 255, r: 0, g: 0, b: 0 }
  var BLACK_INACTIVE = { a: 255, r: 60, g: 60, b: 60 }
  var WHITE = { a: 255, r: 255, g: 255, b: 255 }
  var WHITE_INACTIVE = { a: 255, r: 200, g: 200, b: 200 }
  var BUTTON_COLORS = {
    buttonForegroundColor: WHITE,
    buttonBackgroundColor: GRAY,
    buttonHoverForegroundColor: WHITE,
    buttonHoverBackgroundColor: BLACK_INACTIVE,
    buttonPressedForegroundColor: WHITE,
    buttonPressedBackgroundColor: BLACK,
    buttonInactiveForegroundColor: WHITE_INACTIVE,
    buttonInactiveBackgroundColor: GRAY
  }
  var COLORS = {
    'default': {
      foregroundColor: WHITE,
      backgroundColor: GRAY,
      inactiveForegroundColor: WHITE_INACTIVE,
      inactiveBackgroundColor: GRAY
      /*buttonForegroundColor: { a: 255, r: 38, g: 37, b: 38 },
      buttonBackgroundColor: { a: 255, r: 255, g: 255, b: 255 },
      buttonHoverForegroundColor: WHITE,
      buttonHoverBackgroundColor: { a: 255, r: 38, g: 37, b: 38 },
      buttonPressedForegroundColor: WHITE,
      buttonPressedBackgroundColor: { a: 255, r: 0, g: 0, b: 0 },
      inactiveForegroundColor: { a: 255, r: 98, g: 97, b: 98 },
      inactiveBackgroundColor: { a: 255, r: 240, g: 239, b: 240 },
      buttonInactiveForegroundColor: { a: 255, r: 98, g: 97, b: 98 },
      buttonInactiveBackgroundColor: { a: 255, r: 240, g: 239, b: 240 }*/
    }
    /*,
    'color-0': {
      buttonForegroundColor: BLACK,
      buttonBackgroundColor: WHITE,
      foregroundColor: BLACK,
      inactiveForegroundColor: BLACK_INACTIVE,
      backgroundColor: WHITE,
      inactiveBackgroundColor: WHITE
    },
    'color-1': {
      buttonForegroundColor: WHITE,
      buttonBackgroundColor: { a: 255, r: 238, g: 64, b: 86 },
      foregroundColor: WHITE,
      inactiveForegroundColor: WHITE_INACTIVE,
      backgroundColor: { a: 255, r: 238, g: 64, b: 86 },
      inactiveBackgroundColor: { a: 255, r: 238, g: 64, b: 86 }
    },
    'color-2': {
      buttonForegroundColor: BLACK,
      buttonBackgroundColor: { a: 255, r: 245, g: 190, b: 0 },
      foregroundColor: BLACK,
      inactiveForegroundColor: BLACK_INACTIVE,
      backgroundColor: { a: 255, r: 245, g: 190, b: 0 },
      inactiveBackgroundColor: { a: 255, r: 245, g: 190, b: 0 }
    },
    'color-3': {
      buttonForegroundColor: BLACK,
      buttonBackgroundColor: { a: 255, r: 125, g: 227, b: 176 },
      foregroundColor: BLACK,
      inactiveForegroundColor: BLACK_INACTIVE,
      backgroundColor: { a: 255, r: 125, g: 227, b: 176 },
      inactiveBackgroundColor: { a: 255, r: 125, g: 227, b: 176 }
    },
    'color-4': {
      buttonForegroundColor: WHITE,
      buttonBackgroundColor: { a: 255, r: 77, g: 162, b: 176 },
      foregroundColor: WHITE,
      inactiveForegroundColor: WHITE_INACTIVE,
      backgroundColor: { a: 255, r: 77, g: 162, b: 176 },
      inactiveBackgroundColor: { a: 255, r: 77, g: 162, b: 176 }
    },
    'color-5': {
      buttonForegroundColor: WHITE,
      buttonBackgroundColor: { a: 255, r: 119, g: 119, b: 120 },
      foregroundColor: WHITE,
      inactiveForegroundColor: WHITE_INACTIVE,
      backgroundColor: { a: 255, r: 119, g: 119, b: 120 },
      inactiveBackgroundColor: { a: 255, r: 119, g: 119, b: 120 }
    }*/
  };

  var HTTPERRORS = {}

  function setHTTPMessages() {
    var errors = {
      0: string('errors.0'), // 'Unknown error',
      204: string('errors.204'), //'No content',
      400: string('errors.400'), //'400 Bad request',
      401: string('errors.401'), //'401 Not allowed',
      402: string('errors.402'), //'402 Payment required',
      403: string('errors.403'), //'403 Forbidden',
      404: string('errors.404'), //'404 Not found',
      408: string('errors.408'), //'408 Timeout',
      500: string('errors.500'), //'500 Server error',
      // custom
      900: string('errors.900'), // 'No Network connection',
      901: string('errors.901'), //'Unsupported content',
      902: string('errors.902'), //'Browser only content',
      903: string('errors.903'), //'Content not available offline',
      910: string('errors.910'), //'Invalid URL',
      920: string('errors.920') //'Download failed'
    }
    for (var e in errors) {
      HTTPERRORS[e] = errors[e]
    }
  }


  function getHTTPError(e, message) {
    e = e || {}
    message = message || e.message

    // e.message e.status e.X-Error-Code
    var reason = e.reason in HTTPERRORS ? HTTPERRORS[e.reason] : ''
    var s = reason ? ' ' : ''
    var error = e.status in HTTPERRORS ? HTTPERRORS[e.status] : e.status

    return `${reason}${s}${error} (${message})`
  }


  function online() {
    try {
      var internetProfile = NetworkInformation.getInternetConnectionProfile();
      var level = internetProfile && internetProfile.getNetworkConnectivityLevel()

      if (internetProfile && (level == INTERNET_ACCESS || level == LOCAL_ACCESS)) {
        return true
      }
    }
    catch (e) {
      utils.log(e, 'networkStatus')
    }
    return false
  }


  function getStack(e) {
    var stack = []

    try {
      if (e && e.detail && e.detail.error) {
        var err = e.detail.error
        stack = [
          'error',
          err.message,
          err.filename,
          'line ' + err.lineno + '/' + err.colno
        ]
      }
      else if (e && e.detail && e.detail.exception) {
        var err = e.detail.exception
        stack = [
          'exception',
          err.number,
          err.name,
          err.message,
          err.stack
        ]
      }
      else if (e && e.detail && e.detail.errorMessage) {
        var detail = e.detail
        stack = [
          'errorMessage',
          detail.errorMessage,
          detail.errorUrl,
          'line ' + detail.errorLine + '/' + detail.errorCharacter
        ]
      }
      else if (e && e.name) {
        var err = e.error
        stack = [
          e.number,
          e.name,
          e.message,
          e.stack
        ]
      }
      else {
        if (e) {
          try {
            for (var p in e) {
              if (typeof e[p] != 'function') {
                stack.push(p + ': ' + e[p])
              }
            }
          }
          catch (e2) {
            stack.push(e)
          }
        }
      }
      if (e && e.detail && e.detail.stack) {
        stack.push(e.detail.stack)
      }
    }
    catch (e) {
      stack.push('Stack failed')
      stack.push(e)
    }

    return stack.join('\r\n')
  }

  function log(e, message) {
    e = e || {}

    try {
      var entry = [
        '\r\n----',
        'Latermark ' + Store.APP_VERSION +
        ' ' + new Date().toLocaleString(),
        navigator.appVersion,
        message ? message : '',
        getStack(e)
      ].join('\r\n')

      // CHECK: remove on release
      //console.log(entry)

      Store.appendItem('log', entry)
    }
    catch (e) {
      console && console.log('log', e)
      WinJS.log && WinJS.log('log', 'error', e);
    }
  }

  function each(items, f) {
    for (var i = 0, end = items.length; i < end; i++) {
      f(items[i], i)
    }
  }

  function extend(target, source, omit) {
    omit = omit || []
    // helper: object extend like jQuery.extend
    for (var p in source) {
      if (omit.indexOf(p) == -1) {
        if (source.hasOwnProperty(p) && source[p] !== undefined) {
          target[p] = source[p]
        }
      }
    }
    return target
  }

  function encodeFormData(data) {
    // helper: like jQuery.encodeFormData
    if (!data) {
      return ''
    }
    var pairs = []
    for (var name in data) {
      if (!data.hasOwnProperty(name) || typeof data[name] === 'function') {
        continue
      }
      var value = (data[name] !== undefined && data[name] !== null)
        ? data[name].toString() : ''
      name = encodeURIComponent(name).replace('%20', '+')
      value = encodeURIComponent(value).replace('%20', '+')
      pairs.push(name + '=' + value)
    }
    return pairs.join('&')
  }

  function parseUrl(url) {
    var a = document.createElement('a')
    a.href = url
    return a
  }

  function faviconUrl(url) {
    var a = parseUrl(url)

    if (a.protocol && a.hostname) {
      return a.protocol + '//' + a.hostname + (a.port ? ':' + a.port : '') + '/favicon.ico'
    }
    else { // e.g. about:blank
      return ''
    }

  }

  var Crud = WinJS.Class.define(
    // main AJAX wrapper
    function (url, options) {
      options = options || {}

      this.URL = url
      this.lastRequest = null
      this.request = null

      // fallback if method does not define any
      this.e401 = options.e401 || defaultError
      this.e403 = options.e403 || defaultError
    }, {
      crud: function (TYPE, data, options) {
        // options.success(res)
        // options.offline()
        // options.error(e)
        // options.always: will be called in any error/offline case after default handler

        // TODO: optional abort?!
        this.lastRequest && this.lastRequest.abort()

        var self = this

        var settings = extend({
          e401: this.e401,
          e403: this.e403,
          error: defaultError,
          offline: defaultOffline,
          success: function () { },
          abort: function () { },
          path: '',
          json: false // return format
        }, options || {})

        if (online()) {
          var request = new XMLHttpRequest()
          var params = encodeFormData(data)

          this.lastRequest = request // to be able to abort

          request.onreadystatechange = function () {
            if (request.readyState != 4) {
              return;
            }

            if (request.status == 200) {
              var res = ''

              if (settings.json && request.responseText) {
                try {
                  res = JSON.parse(request.responseText)
                }
                catch (e) { }
              }
              settings.success(res)
            }
            else if (request.status == 401) {
              // authenticating
              settings.e401({
                status: request.status,
                message: request.statusText || string('errors.error'),
                // Pocket extra error code
                'X-Error-Code': request.getResponseHeader('X-Error-Code') || '',
                always: options.always
              })
            }
            else if (request.status == 403) {
              // permissions (pocket: limit?)
              settings.e403({
                status: request.status,
                message: request.statusText || string('errors.error'),
                // Pocket extra error code
                'X-Error-Code': request.getResponseHeader('X-Error-Code') || '',
                always: options.always
              })
            }
            else {
              // return status, text, done func, extra info like Pockets error header
              settings.error({
                status: request.status,
                message: request.statusText || string('errors.error'),
                // Pocket extra error code
                'X-Error-Code': request.getResponseHeader('X-Error-Code') || '',
                always: options.always
              })
            }
          }

          request.onabort = function (e) {
            settings.abort({
              status: request.status,
              message: string('errors.aborted')
            })
          }

          request.open(TYPE, this.URL + settings.path + '?' + params)

          if (TYPE == 'POST' && params) {
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.setRequestHeader('X-Accept', 'application/json')
            request.send(params)
          }
          else {
            request.send()
          }
          //request.timeout = 5
        }
        else {
          settings.offline(options.always)
        }

      },
      get: function (data, options) {
        this.crud('GET', data, options)
      },
      post: function (data, options) {
        this.crud('POST', data, options)
      },
      abort: function () {
        var request = this.lastRequest

        if (request) {
          request.onreadystatechange = function () { };
          request.abort()
        }
      }
    }
  )


  function toggleOverlay(id, state) {
    var overlay = document.getElementById(id)

    state && overlay.classList.add('pageoverlay-visible')
    WinJS.UI.Animation[state ? 'enterPage' : 'exitPage'](overlay).done(
      function () {
        !state && overlay.classList.remove('pageoverlay-visible')
      },
      function (e) {
        log(e, 'toggleOverlay')
        // should not happen
      }
    )
  }

  function message(options) {
    var msg = new Windows.UI.Popups.MessageDialog(options.message || ' ', options.title);

    msg.commands.append(new Windows.UI.Popups.UICommand(options.okText || string("actions.OK"), options.ok || function () { }, 1));
    if (options.cancel) {
      msg.commands.append(new Windows.UI.Popups.UICommand(string("actions.Cancel"), options.cancel, 0));
    }
    if (options.actions) {
      options.actions.forEach(function (cfg, i) {
        msg.commands.append(new Windows.UI.Popups.UICommand(
          cfg.label, cfg.action, 2 + i));
      })
    }

    //Set the command to be invoked when a user presses ESC
    msg.cancelCommandIndex = 0; //Set the command that will be invoked by default
    msg.defaultCommandIndex = 1;
    try { // error reported: Access is denied. ?!
      msg.showAsync().done(
        function () { },
        function (e) {
          log(e, 'message')
        }
      );
    }
    catch (e) {
      log(e, 'msg.show failed')
    }
  }


  var notifications = {}
  var $notifications

  function removeNotification(id, explicit) {
    var $notification = $notifications.querySelector('#' + id)

    if ($notification) {
      clearTimeout(notifications[id])
      delete notifications[id]

      $notification.addEventListener('transitionend', function () {
        try {
          $notifications && $notifications.removeChild(this)
        }
        catch (e) {
          // why?
        }

      }.bind($notification))

      if (explicit) {
        $notification.style.transform = 'translateX(100%)'
      }

      $notification.classList.add(
        explicit ? 'notification-explicit-remove' : 'notification-remove'
      )
    }
  }


  var grs = {}

  function initSwipe(element, options) {
    var grHandler = function (e) {
      if (e.type == 'manipulationupdated') {
        options.update(e, e.cumulative.translation.x)
      }
      else if (e.type == 'manipulationcompleted') {
        options.complete(e, e.cumulative.translation.x)
      }
    }
    var setGestureRecognizer = function (id) {
      var gr = new Windows.UI.Input.GestureRecognizer()

      //gr.showGestureFeedback = true
      gr.gestureSettings = Windows.UI.Input.GestureSettings.manipulationTranslateX
      gr.addEventListener('manipulationstarted', grHandler);
      gr.addEventListener('manipulationupdated', grHandler);
      gr.addEventListener('manipulationcompleted', grHandler);

      grs[id] = gr
    }
    function pointerDown(e) {
      var pps = e.intermediatePoints;

      setGestureRecognizer(e.target)
      grs[e.target].processDownEvent(pps[0])
    };
    function pointerMove(e) {
      var gr = grs[e.target]

      e.stopImmediatePropagation()

      if (gr) {
        var pps = e.intermediatePoints;
        gr.processMoveEvents(pps);
      }
    };
    function pointerUp(e) {
      var gr = grs[e.target]

      e.stopImmediatePropagation()

      if (gr) {
        delete grs[e.target]
        var pps = e.intermediatePoints;
        gr.processUpEvent(pps[0])
      }
    };
    element.addEventListener('pointerdown', pointerDown, false);
    element.addEventListener('pointermove', pointerMove, false);
    element.addEventListener('pointerup', pointerUp, false);
  }


  function notification(texts, keep) {
    if (!$notifications) {
      $notifications = document.getElementById('notifications')
    }

    var id = 'notification-' + Date.now()
    var $notification = document.createElement('div');

    texts.forEach(function (text, i) {
      if (text.trim()) {
        var $text = document.createElement(['h4', 'p'][i])

        $text.innerText = text || string('errors.0')
        $notification.appendChild($text)
      }
    })
    var $closer = document.createElement('span')

    $closer.innerText = '\ue10a';
    $closer.addEventListener('click', function () {
      removeNotification(id, true)
    }, false)
    $notification.appendChild($closer)

    $notification.setAttribute('id', id)
    $notification.setAttribute('draggable', false)
    $notification.classList.add('themebutton')

    // for now?
    $notification.addEventListener('click', function (e) {
      if (window.getComputedStyle(e.target).transform == "matrix(1, 0, 0, 1, 0, 0)") {
        // close only if not transitioning back
        removeNotification(id, true)
      }
    }, false)

    initSwipe($notification, {
      update: function (e, pos) {
        if (pos > 0) {
          $notification.style.transition = '0s';
          $notification.style.transform = 'translateX(' + pos + 'px)'
        }
      },
      complete: function (e, pos) {
        var relative = pos / $notification.clientWidth

        $notification.style.transition = '0.15s';
        if (relative > 0.3) {
          removeNotification(id, true)
        }
        else {
          $notification.style.transition = '0.15s';
          $notification.style.transform = 'translateX(0px)'
        }

      }
    })

    $notifications.appendChild($notification)

    if (!keep) {
      notifications[id] = setTimeout(function () {
        removeNotification(id)
      }, 4500)

      $notification.addEventListener('mouseenter', function () {
        clearTimeout(notifications[id])
      })
      $notification.addEventListener('mouseleave', function () {
        notifications[id] = setTimeout(function () {
          removeNotification(id)
        }, 2500)
      })
    }
  }


  var systemNotificationDisabledMessage = false

  function systemNotification(texts, keep) {
    var toastNotifier = Notifications.ToastNotificationManager.createToastNotifier();

    if (toastNotifier.setting == Notifications.NotificationSetting.enabled) {
      var xml = Notifications.ToastNotificationManager.getTemplateContent(
        Notifications.ToastTemplateType.toastText02
      );
      //var toastNode = xml.selectSingleNode("/toast");
      //toastNode.setAttribute("duration", "long");
      var audio = xml.createElement("audio");
      audio.setAttribute("silent", "true");
      var toastNode = xml.selectSingleNode("/toast");
      toastNode.appendChild(audio);

      var elements = xml.getElementsByTagName('text');

      texts.forEach(function (text, i) {
        if (i == 0 && !text) {
          text = string("errors.0")
        }

        if (elements[i]) {
          elements[i].appendChild(
            xml.createTextNode(text ? text : '')
          )
        }
      })


      var notification = new Notifications.ToastNotification(xml)

      if (!keep) {
        // remove from notification center after x seconds
        notification.expirationTime = new Date(Date.now() + 20 * 1000)
        notification.group = 'Latermark'
      }
      toastNotifier.show(notification);
    }
    else {
      if (!systemNotificationDisabledMessage) {
        message({
          title: string('notification.diabledTitle'),
          message: string('notification.diabledMessage'),
          ok: function () {
            systemNotificationDisabledMessage = true
            setTimeout(function () {
              utils.notification(texts)
            }, 200)
          }
        })
      }
      else {
        message({
          title: texts[0],
          message: texts[1] || ''
        })
      }
    }
  }

  /*
  function default401(e) {
    var code = e['X-Error-Code'] ? ' ' + e['X-Error-Code'] : ''

    clearBadge()
    message({
      title: string('errors.401.title'),
      message: string('errors.401.message', { '{info}': e.status + code }),
      ok: function (command) {
        e.always && e.always(e)
      }
    })
  }

  function default403(e) {
    var code = e['X-Error-Code'] ? ' ' + e['X-Error-Code'] : ''

    clearBadge()
    message({
      title: string('errors.403.title'),
      message: string('errors.403.message', { '{info}': e.status + code }),
      ok: function (command) {
        e.always && e.always(e)
      }
    })
  }*/

  function defaultError(e) {
    var code = e['X-Error-Code'] ? ' ' + e['X-Error-Code'] : ''

    notification([
      string('errors.default.title'),
      e.message + ' (' + e.status + code + ')'
    ])
    e.always && e.always(e)
  }

  function defaultOffline(done) {
    notification([
      string('errors.offline.title'),
      string('errors.offline.message')
    ])
    done && done()
  }

  function updateBadge(number) {
    // sending a badge notification with a number
    var badgeXmlString = "<badge value='" + number + "'/>";
    var badgeDOM = new Windows.Data.Xml.Dom.XmlDocument();

    try {
      // load the xml string into the DOM, catching any invalid xml characters 
      badgeDOM.loadXml(badgeXmlString);
      var badge = new Windows.UI.Notifications.BadgeNotification(badgeDOM);
      Windows.UI.Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badge);
    }
    catch (e) {
      log(e, 'updateBadge')
    }
  }

  function clearBadge() {
    try {
      Windows.UI.Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().clear();
    }
    catch (e) {
      log(e, 'clearBadge')
    }
  }


  function _getHost(url) {
    var uri
    try {
      uri = parseUrl(url).hostname
      return uri
    }
    catch (e) {
      // e.g. about:blank
      return ''
    }
  }

  
  function pin2ByElementAsync(element, tileID, data) {
    var tile = new Windows.UI.StartScreen.SecondaryTile(tileID, data.title, tileID,
      new Windows.Foundation.Uri("ms-appx:///images/TileSquare150x150.png"),
      Windows.UI.StartScreen.TileSize.Square150x150);

    tile.visualElements.square310x310Logo = new Windows.Foundation.Uri("ms-appx:///images/TileSquare310x310.png");
    tile.visualElements.wide310x150Logo = new Windows.Foundation.Uri("ms-appx:///images/TileWide310x150.png");
    tile.visualElements.showNameOnSquare150x150Logo = true;
    tile.visualElements.showNameOnWide310x150Logo = true;
    tile.visualElements.showNameOnSquare310x310Logo = true;
    tile.visualElements.square70x70Logo = new Windows.Foundation.Uri("ms-appx:///images/logo.png");
    // default: tile.roamingEnabled = true;

    return new WinJS.Promise(function (complete, error, progress) {
      //tile.requestCreateForSelectionAsync(buttonCoordinates, placement)
      return tile.requestCreateAsync()
      .done(
        function (isCreated) {
          tiles.itemTile(data, false, tileID)
          complete(isCreated)
        },
        function (e) { }
      );
    });
  }

  var SORTKEYS = {
    title: ['resolved_title', 'given_title'],
    site: ['resolved_domain', 'given_url']
  }
  function _sortDown(a, b) {
    a = a.index
    b = b.index
    if (a == b) {
      return 0
    }
    return a > b ? 1 : -1
  }
  // index is time_added in s
  function _sortUp(a, b) {
    a = a.index
    b = b.index
    if (a == b) {
      return 0
    }
    return a < b ? 1 : -1
  }

  function sortList(list, by) {
    // static sort (used by resultList too)
    var keys = SORTKEYS[by]

    if (keys) {
      list.sort(function (a, b) {
        a = (a[keys[0]] || a[keys[1]] || "").toLocaleLowerCase()
        b = (b[keys[0]] || b[keys[1]] || "").toLocaleLowerCase()
        if (a == b) {
          return 0
        }
        else {
          return a > b ? 1 : -1
        }
      })
    }
    else {
      list.sort(by == 'oldest' ? _sortDown : _sortUp)
    }
  }

  function sortKoList(list, by) {
    // static sort (used by resultList too)
    var keys = SORTKEYS[by]

    if (keys) {
      list.sort(function (a, b) {
        // 0: ko object, 1: simple!
        a = (a[keys[0]]() || a[keys[1]] || '').toLocaleLowerCase()
        b = (b[keys[0]]() || b[keys[1]] || '').toLocaleLowerCase()
        if (a == b) {
          return 0
        }
        else {
          return a > b ? 1 : -1
        }
      })
    }
    else {
      list.sort(by == 'oldest' ? _sortDown : _sortUp)
    }
  }


  function setTheme(id) {
    var colors = COLORS['default']

    for (var p in BUTTON_COLORS) {
      applicationView.titleBar[p] = BUTTON_COLORS[p]
    }

    for (var p in colors) {
      applicationView.titleBar[p] = colors[p]
    }

    //applicationView.title = '1'
    applicationView.setPreferredMinSize({
      width: 320,
      height: 500
    })

    // needs viewhelper
    //applicationView.titleBar.extendViewIntoTitleBar = true
    //applicationView.fullScreenSystemOverlayMode = 0
  }

  function setTitle(title) {
    applicationView.title = title
  }

  function getLang() {
    return Latermark.settings.language || Windows.Globalization.Language.currentInputMethodLanguageTag
  }
  function setLang(lang) {
    Latermark.settings.language = lang
    Latermark.settings.save()
    useLang()
  }
  function useLang() {
    var lang = getLang()

    document.documentElement.lang = lang
    moment.locale(lang);
    Windows.ApplicationModel.Resources.Core.ResourceContext.setGlobalQualifierValue('language', lang);
    setHTTPMessages()
    // still needs restart if changed!
    WinJS.Resources.processAll()

    var body = document.getElementById('body')

    body && body.classList[Latermark.settings.fontDylexie ? 'add' : 'remove']('font-dylexie')
  }

  function string(key, replacements) {
    var val = getString(key).value

    if (!replacements) {
      return val
    }
    else {
      return val.replace(/\{[a-z]+\}/g, function (res) {
        return replacements[res]
      })

    }
  }

  function replaceRes(element) {
    ;[].forEach.call(element.querySelectorAll('[data-reskey]'), function (item, i) {
      var key = item.getAttribute('data-reskey')
      var tpl = string(key)

      item.innerHTML = tpl.replace(/\{[a-z]+\}/g, function (res, x) {
        return item.querySelector('[data-res="' + res + '"]').outerHTML
      })
    })
  }


  var Fullscreen = {
    preferredLaunch: function (fullscreen) {
      if (fullscreen === undefined) { // get
        return ApplicationView.preferredLaunchWindowingMode == ApplicationViewWindowingMode.fullScreen;
      }
      else { // set
        ApplicationView.preferredLaunchWindowingMode = fullscreen ?
          ApplicationViewWindowingMode.fullScreen :
          ApplicationViewWindowingMode.auto;
      }
    },
    is: function () {
      return applicationView.isFullScreenMode
    },
    toggle: function (fullscreen) {
      if (Fullscreen.is() || fullscreen === false) {
        applicationView.exitFullScreenMode();
      }
      else {
        return applicationView.tryEnterFullScreenMode()
      }
    }
  }



  function debug(content) {
    document.getElementById('debug').innerHTML = content.join('\n')
  }


  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }


  function showUpdateInfo() {
    var message = []

    for (var i = 1; i <= 9; i++) {
      var key = 'update' + i
      var update = string(key)

      if (update != key) {
        message.push('- ' + update)
      }
    }
    message.push('')
    for (var i = 1; i <= 3; i++) {
      var key = 'updatenotes' + i
      var note = string(key)

      if (note != key) {
        message.push('- ' + note)
      }
    }

    utils.message({
      title: string('updates.title', { '{version}': Store.APP_VERSION }),
      message: message.join('\n')
    })
  }

  function showKeyboardInfo() {
    utils.message({
      title: string('keyboard.title'),
      message: [
        string('keyboard.F5'),
        string('keyboard.CTRL.q'),
        string('keyboard.CTRL.TAB'),
        string('keyboard.ENTER'),
        string('keyboard.UPDOWN'),
        string('keyboard.CTRL.jk'),
        string('keyboard.F11'),
        string('keyboard.ESC'),
        '',
        string('keyboard.itemtitle'),
        string('keyboard.ALT.r'),
        string('keyboard.ALT.f'),
        string('keyboard.ALT.b'),
        string('keyboard.ALT.ENTER'),
        string('keyboard.CTRL.wheel'),
        string('keyboard.CTRL.p'),
        string('keyboard.CTRL.f'),
        string('keyboard.F3'),
        '',
        string('keyboard.help')
      ].join('\n')
    })
  }


  function inputPaneSetup(vm, property) {
    var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView()

    inputPane.addEventListener('showing', function (e) {
      vm[property](e.occludedRect.height)
    }, false)
    inputPane.addEventListener('hiding', function (e) {
      vm[property](0)
    }, false)
  }

  function isARM() {
    return navigator.platform == 'ARM'
  }

  // utils API
  WinJS.Namespace.define("utils", {
    HTTPERRORS: HTTPERRORS,
    Crud: Crud,
    online: online,
    getHTTPError: getHTTPError,
    each: each,
    extend: extend,

    encodeFormData: encodeFormData,
    parseUrl: parseUrl,
    faviconUrl: faviconUrl,
    toggleOverlay: toggleOverlay,

    sortList: sortList,
    sortKoList: sortKoList,

    setTheme: setTheme,
    setTitle: setTitle,

    getLang: getLang,
    setLang: setLang,
    useLang: useLang,
    string: string,
    replaceRes: replaceRes,

    Fullscreen: Fullscreen,

    getStack: getStack,
    log: log,
    message: message,
    notification: notification,
    systemNotification: systemNotification,
    updateBadge: updateBadge,
    clearBadge: clearBadge,
    pin2ByElementAsync: pin2ByElementAsync,
    debug: debug,
    debounce: debounce,
    showUpdateInfo: showUpdateInfo,
    showKeyboardInfo: showKeyboardInfo,
    inputPaneSetup: inputPaneSetup,
    isARM: isARM
  })

})();



