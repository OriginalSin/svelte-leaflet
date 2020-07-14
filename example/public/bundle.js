
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var focusVisible = createCommonjsModule(function (module, exports) {
	(function (global, factory) {
	   factory() ;
	}(commonjsGlobal, (function () {
	  /**
	   * Applies the :focus-visible polyfill at the given scope.
	   * A scope in this case is either the top-level Document or a Shadow Root.
	   *
	   * @param {(Document|ShadowRoot)} scope
	   * @see https://github.com/WICG/focus-visible
	   */
	  function applyFocusVisiblePolyfill(scope) {
	    var hadKeyboardEvent = true;
	    var hadFocusVisibleRecently = false;
	    var hadFocusVisibleRecentlyTimeout = null;

	    var inputTypesWhitelist = {
	      text: true,
	      search: true,
	      url: true,
	      tel: true,
	      email: true,
	      password: true,
	      number: true,
	      date: true,
	      month: true,
	      week: true,
	      time: true,
	      datetime: true,
	      'datetime-local': true
	    };

	    /**
	     * Helper function for legacy browsers and iframes which sometimes focus
	     * elements like document, body, and non-interactive SVG.
	     * @param {Element} el
	     */
	    function isValidFocusTarget(el) {
	      if (
	        el &&
	        el !== document &&
	        el.nodeName !== 'HTML' &&
	        el.nodeName !== 'BODY' &&
	        'classList' in el &&
	        'contains' in el.classList
	      ) {
	        return true;
	      }
	      return false;
	    }

	    /**
	     * Computes whether the given element should automatically trigger the
	     * `focus-visible` class being added, i.e. whether it should always match
	     * `:focus-visible` when focused.
	     * @param {Element} el
	     * @return {boolean}
	     */
	    function focusTriggersKeyboardModality(el) {
	      var type = el.type;
	      var tagName = el.tagName;

	      if (tagName === 'INPUT' && inputTypesWhitelist[type] && !el.readOnly) {
	        return true;
	      }

	      if (tagName === 'TEXTAREA' && !el.readOnly) {
	        return true;
	      }

	      if (el.isContentEditable) {
	        return true;
	      }

	      return false;
	    }

	    /**
	     * Add the `focus-visible` class to the given element if it was not added by
	     * the author.
	     * @param {Element} el
	     */
	    function addFocusVisibleClass(el) {
	      if (el.classList.contains('focus-visible')) {
	        return;
	      }
	      el.classList.add('focus-visible');
	      el.setAttribute('data-focus-visible-added', '');
	    }

	    /**
	     * Remove the `focus-visible` class from the given element if it was not
	     * originally added by the author.
	     * @param {Element} el
	     */
	    function removeFocusVisibleClass(el) {
	      if (!el.hasAttribute('data-focus-visible-added')) {
	        return;
	      }
	      el.classList.remove('focus-visible');
	      el.removeAttribute('data-focus-visible-added');
	    }

	    /**
	     * If the most recent user interaction was via the keyboard;
	     * and the key press did not include a meta, alt/option, or control key;
	     * then the modality is keyboard. Otherwise, the modality is not keyboard.
	     * Apply `focus-visible` to any current active element and keep track
	     * of our keyboard modality state with `hadKeyboardEvent`.
	     * @param {KeyboardEvent} e
	     */
	    function onKeyDown(e) {
	      if (e.metaKey || e.altKey || e.ctrlKey) {
	        return;
	      }

	      if (isValidFocusTarget(scope.activeElement)) {
	        addFocusVisibleClass(scope.activeElement);
	      }

	      hadKeyboardEvent = true;
	    }

	    /**
	     * If at any point a user clicks with a pointing device, ensure that we change
	     * the modality away from keyboard.
	     * This avoids the situation where a user presses a key on an already focused
	     * element, and then clicks on a different element, focusing it with a
	     * pointing device, while we still think we're in keyboard modality.
	     * @param {Event} e
	     */
	    function onPointerDown(e) {
	      hadKeyboardEvent = false;
	    }

	    /**
	     * On `focus`, add the `focus-visible` class to the target if:
	     * - the target received focus as a result of keyboard navigation, or
	     * - the event target is an element that will likely require interaction
	     *   via the keyboard (e.g. a text box)
	     * @param {Event} e
	     */
	    function onFocus(e) {
	      // Prevent IE from focusing the document or HTML element.
	      if (!isValidFocusTarget(e.target)) {
	        return;
	      }

	      if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target)) {
	        addFocusVisibleClass(e.target);
	      }
	    }

	    /**
	     * On `blur`, remove the `focus-visible` class from the target.
	     * @param {Event} e
	     */
	    function onBlur(e) {
	      if (!isValidFocusTarget(e.target)) {
	        return;
	      }

	      if (
	        e.target.classList.contains('focus-visible') ||
	        e.target.hasAttribute('data-focus-visible-added')
	      ) {
	        // To detect a tab/window switch, we look for a blur event followed
	        // rapidly by a visibility change.
	        // If we don't see a visibility change within 100ms, it's probably a
	        // regular focus change.
	        hadFocusVisibleRecently = true;
	        window.clearTimeout(hadFocusVisibleRecentlyTimeout);
	        hadFocusVisibleRecentlyTimeout = window.setTimeout(function() {
	          hadFocusVisibleRecently = false;
	        }, 100);
	        removeFocusVisibleClass(e.target);
	      }
	    }

	    /**
	     * If the user changes tabs, keep track of whether or not the previously
	     * focused element had .focus-visible.
	     * @param {Event} e
	     */
	    function onVisibilityChange(e) {
	      if (document.visibilityState === 'hidden') {
	        // If the tab becomes active again, the browser will handle calling focus
	        // on the element (Safari actually calls it twice).
	        // If this tab change caused a blur on an element with focus-visible,
	        // re-apply the class when the user switches back to the tab.
	        if (hadFocusVisibleRecently) {
	          hadKeyboardEvent = true;
	        }
	        addInitialPointerMoveListeners();
	      }
	    }

	    /**
	     * Add a group of listeners to detect usage of any pointing devices.
	     * These listeners will be added when the polyfill first loads, and anytime
	     * the window is blurred, so that they are active when the window regains
	     * focus.
	     */
	    function addInitialPointerMoveListeners() {
	      document.addEventListener('mousemove', onInitialPointerMove);
	      document.addEventListener('mousedown', onInitialPointerMove);
	      document.addEventListener('mouseup', onInitialPointerMove);
	      document.addEventListener('pointermove', onInitialPointerMove);
	      document.addEventListener('pointerdown', onInitialPointerMove);
	      document.addEventListener('pointerup', onInitialPointerMove);
	      document.addEventListener('touchmove', onInitialPointerMove);
	      document.addEventListener('touchstart', onInitialPointerMove);
	      document.addEventListener('touchend', onInitialPointerMove);
	    }

	    function removeInitialPointerMoveListeners() {
	      document.removeEventListener('mousemove', onInitialPointerMove);
	      document.removeEventListener('mousedown', onInitialPointerMove);
	      document.removeEventListener('mouseup', onInitialPointerMove);
	      document.removeEventListener('pointermove', onInitialPointerMove);
	      document.removeEventListener('pointerdown', onInitialPointerMove);
	      document.removeEventListener('pointerup', onInitialPointerMove);
	      document.removeEventListener('touchmove', onInitialPointerMove);
	      document.removeEventListener('touchstart', onInitialPointerMove);
	      document.removeEventListener('touchend', onInitialPointerMove);
	    }

	    /**
	     * When the polfyill first loads, assume the user is in keyboard modality.
	     * If any event is received from a pointing device (e.g. mouse, pointer,
	     * touch), turn off keyboard modality.
	     * This accounts for situations where focus enters the page from the URL bar.
	     * @param {Event} e
	     */
	    function onInitialPointerMove(e) {
	      // Work around a Safari quirk that fires a mousemove on <html> whenever the
	      // window blurs, even if you're tabbing out of the page. ¯\_(ツ)_/¯
	      if (e.target.nodeName && e.target.nodeName.toLowerCase() === 'html') {
	        return;
	      }

	      hadKeyboardEvent = false;
	      removeInitialPointerMoveListeners();
	    }

	    // For some kinds of state, we are interested in changes at the global scope
	    // only. For example, global pointer input, global key presses and global
	    // visibility change should affect the state at every scope:
	    document.addEventListener('keydown', onKeyDown, true);
	    document.addEventListener('mousedown', onPointerDown, true);
	    document.addEventListener('pointerdown', onPointerDown, true);
	    document.addEventListener('touchstart', onPointerDown, true);
	    document.addEventListener('visibilitychange', onVisibilityChange, true);

	    addInitialPointerMoveListeners();

	    // For focus and blur, we specifically care about state changes in the local
	    // scope. This is because focus / blur events that originate from within a
	    // shadow root are not re-dispatched from the host element if it was already
	    // the active element in its own scope:
	    scope.addEventListener('focus', onFocus, true);
	    scope.addEventListener('blur', onBlur, true);

	    // We detect that a node is a ShadowRoot by ensuring that it is a
	    // DocumentFragment and also has a host property. This check covers native
	    // implementation and polyfill implementation transparently. If we only cared
	    // about the native implementation, we could just check if the scope was
	    // an instance of a ShadowRoot.
	    if (scope.nodeType === Node.DOCUMENT_FRAGMENT_NODE && scope.host) {
	      // Since a ShadowRoot is a special kind of DocumentFragment, it does not
	      // have a root element to add a class to. So, we add this attribute to the
	      // host element instead:
	      scope.host.setAttribute('data-js-focus-visible', '');
	    } else if (scope.nodeType === Node.DOCUMENT_NODE) {
	      document.documentElement.classList.add('js-focus-visible');
	      document.documentElement.setAttribute('data-js-focus-visible', '');
	    }
	  }

	  // It is important to wrap all references to global window and document in
	  // these checks to support server-side rendering use cases
	  // @see https://github.com/WICG/focus-visible/issues/199
	  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	    // Make the polyfill helper globally available. This can be used as a signal
	    // to interested libraries that wish to coordinate with the polyfill for e.g.,
	    // applying the polyfill to a shadow root:
	    window.applyFocusVisiblePolyfill = applyFocusVisiblePolyfill;

	    // Notify interested libraries of the polyfill's presence, in case the
	    // polyfill was loaded lazily:
	    var event;

	    try {
	      event = new CustomEvent('focus-visible-polyfill-ready');
	    } catch (error) {
	      // IE11 does not support using CustomEvent as a constructor directly:
	      event = document.createEvent('CustomEvent');
	      event.initCustomEvent('focus-visible-polyfill-ready', false, false, {});
	    }

	    window.dispatchEvent(event);
	  }

	  if (typeof document !== 'undefined') {
	    // Apply the polyfill to the global document, so that no JavaScript
	    // coordination is required to use the polyfill in the top-level document:
	    applyFocusVisiblePolyfill(document);
	  }

	})));
	});

	var page = createCommonjsModule(function (module, exports) {
	(function (global, factory) {
		 module.exports = factory() ;
	}(commonjsGlobal, (function () {
	var isarray = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};

	/**
	 * Expose `pathToRegexp`.
	 */
	var pathToRegexp_1 = pathToRegexp;
	var parse_1 = parse;
	var compile_1 = compile;
	var tokensToFunction_1 = tokensToFunction;
	var tokensToRegExp_1 = tokensToRegExp;

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g');

	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {String} str
	 * @return {Array}
	 */
	function parse (str) {
	  var tokens = [];
	  var key = 0;
	  var index = 0;
	  var path = '';
	  var res;

	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0];
	    var escaped = res[1];
	    var offset = res.index;
	    path += str.slice(index, offset);
	    index = offset + m.length;

	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1];
	      continue
	    }

	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path);
	      path = '';
	    }

	    var prefix = res[2];
	    var name = res[3];
	    var capture = res[4];
	    var group = res[5];
	    var suffix = res[6];
	    var asterisk = res[7];

	    var repeat = suffix === '+' || suffix === '*';
	    var optional = suffix === '?' || suffix === '*';
	    var delimiter = prefix || '/';
	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      pattern: escapeGroup(pattern)
	    });
	  }

	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index);
	  }

	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path);
	  }

	  return tokens
	}

	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {String}   str
	 * @return {Function}
	 */
	function compile (str) {
	  return tokensToFunction(parse(str))
	}

	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length);

	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^' + tokens[i].pattern + '$');
	    }
	  }

	  return function (obj) {
	    var path = '';
	    var data = obj || {};

	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i];

	      if (typeof token === 'string') {
	        path += token;

	        continue
	      }

	      var value = data[token.name];
	      var segment;

	      if (value == null) {
	        if (token.optional) {
	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }

	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
	        }

	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }

	        for (var j = 0; j < value.length; j++) {
	          segment = encodeURIComponent(value[j]);

	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	          }

	          path += (j === 0 ? token.prefix : token.delimiter) + segment;
	        }

	        continue
	      }

	      segment = encodeURIComponent(value);

	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }

	      path += token.prefix + segment;
	    }

	    return path
	  }
	}

	/**
	 * Escape a regular expression string.
	 *
	 * @param  {String} str
	 * @return {String}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
	}

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {String} group
	 * @return {String}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {RegExp} re
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys;
	  return re
	}

	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {String}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}

	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {RegExp} path
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g);

	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        pattern: null
	      });
	    }
	  }

	  return attachKeys(path, keys)
	}

	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {Array}  path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = [];

	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source);
	  }

	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

	  return attachKeys(regexp, keys)
	}

	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {String} path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  var tokens = parse(path);
	  var re = tokensToRegExp(tokens, options);

	  // Attach keys back to the regexp.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] !== 'string') {
	      keys.push(tokens[i]);
	    }
	  }

	  return attachKeys(re, keys)
	}

	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {Array}  tokens
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function tokensToRegExp (tokens, options) {
	  options = options || {};

	  var strict = options.strict;
	  var end = options.end !== false;
	  var route = '';
	  var lastToken = tokens[tokens.length - 1];
	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i];

	    if (typeof token === 'string') {
	      route += escapeString(token);
	    } else {
	      var prefix = escapeString(token.prefix);
	      var capture = token.pattern;

	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*';
	      }

	      if (token.optional) {
	        if (prefix) {
	          capture = '(?:' + prefix + '(' + capture + '))?';
	        } else {
	          capture = '(' + capture + ')?';
	        }
	      } else {
	        capture = prefix + '(' + capture + ')';
	      }

	      route += capture;
	    }
	  }

	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
	  }

	  if (end) {
	    route += '$';
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
	  }

	  return new RegExp('^' + route, flags(options))
	}

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(String|RegExp|Array)} path
	 * @param  {Array}                 [keys]
	 * @param  {Object}                [options]
	 * @return {RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  keys = keys || [];

	  if (!isarray(keys)) {
	    options = keys;
	    keys = [];
	  } else if (!options) {
	    options = {};
	  }

	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, keys)
	  }

	  if (isarray(path)) {
	    return arrayToRegexp(path, keys, options)
	  }

	  return stringToRegexp(path, keys, options)
	}

	pathToRegexp_1.parse = parse_1;
	pathToRegexp_1.compile = compile_1;
	pathToRegexp_1.tokensToFunction = tokensToFunction_1;
	pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

	/**
	   * Module dependencies.
	   */

	  

	  /**
	   * Short-cuts for global-object checks
	   */

	  var hasDocument = ('undefined' !== typeof document);
	  var hasWindow = ('undefined' !== typeof window);
	  var hasHistory = ('undefined' !== typeof history);
	  var hasProcess = typeof process !== 'undefined';

	  /**
	   * Detect click event
	   */
	  var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

	  /**
	   * To work properly with the URL
	   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
	   */

	  var isLocation = hasWindow && !!(window.history.location || window.location);

	  /**
	   * The page instance
	   * @api private
	   */
	  function Page() {
	    // public things
	    this.callbacks = [];
	    this.exits = [];
	    this.current = '';
	    this.len = 0;

	    // private things
	    this._decodeURLComponents = true;
	    this._base = '';
	    this._strict = false;
	    this._running = false;
	    this._hashbang = false;

	    // bound functions
	    this.clickHandler = this.clickHandler.bind(this);
	    this._onpopstate = this._onpopstate.bind(this);
	  }

	  /**
	   * Configure the instance of page. This can be called multiple times.
	   *
	   * @param {Object} options
	   * @api public
	   */

	  Page.prototype.configure = function(options) {
	    var opts = options || {};

	    this._window = opts.window || (hasWindow && window);
	    this._decodeURLComponents = opts.decodeURLComponents !== false;
	    this._popstate = opts.popstate !== false && hasWindow;
	    this._click = opts.click !== false && hasDocument;
	    this._hashbang = !!opts.hashbang;

	    var _window = this._window;
	    if(this._popstate) {
	      _window.addEventListener('popstate', this._onpopstate, false);
	    } else if(hasWindow) {
	      _window.removeEventListener('popstate', this._onpopstate, false);
	    }

	    if (this._click) {
	      _window.document.addEventListener(clickEvent, this.clickHandler, false);
	    } else if(hasDocument) {
	      _window.document.removeEventListener(clickEvent, this.clickHandler, false);
	    }

	    if(this._hashbang && hasWindow && !hasHistory) {
	      _window.addEventListener('hashchange', this._onpopstate, false);
	    } else if(hasWindow) {
	      _window.removeEventListener('hashchange', this._onpopstate, false);
	    }
	  };

	  /**
	   * Get or set basepath to `path`.
	   *
	   * @param {string} path
	   * @api public
	   */

	  Page.prototype.base = function(path) {
	    if (0 === arguments.length) return this._base;
	    this._base = path;
	  };

	  /**
	   * Gets the `base`, which depends on whether we are using History or
	   * hashbang routing.

	   * @api private
	   */
	  Page.prototype._getBase = function() {
	    var base = this._base;
	    if(!!base) return base;
	    var loc = hasWindow && this._window && this._window.location;

	    if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
	      base = loc.pathname;
	    }

	    return base;
	  };

	  /**
	   * Get or set strict path matching to `enable`
	   *
	   * @param {boolean} enable
	   * @api public
	   */

	  Page.prototype.strict = function(enable) {
	    if (0 === arguments.length) return this._strict;
	    this._strict = enable;
	  };


	  /**
	   * Bind with the given `options`.
	   *
	   * Options:
	   *
	   *    - `click` bind to click events [true]
	   *    - `popstate` bind to popstate [true]
	   *    - `dispatch` perform initial dispatch [true]
	   *
	   * @param {Object} options
	   * @api public
	   */

	  Page.prototype.start = function(options) {
	    var opts = options || {};
	    this.configure(opts);

	    if (false === opts.dispatch) return;
	    this._running = true;

	    var url;
	    if(isLocation) {
	      var window = this._window;
	      var loc = window.location;

	      if(this._hashbang && ~loc.hash.indexOf('#!')) {
	        url = loc.hash.substr(2) + loc.search;
	      } else if (this._hashbang) {
	        url = loc.search + loc.hash;
	      } else {
	        url = loc.pathname + loc.search + loc.hash;
	      }
	    }

	    this.replace(url, null, true, opts.dispatch);
	  };

	  /**
	   * Unbind click and popstate event handlers.
	   *
	   * @api public
	   */

	  Page.prototype.stop = function() {
	    if (!this._running) return;
	    this.current = '';
	    this.len = 0;
	    this._running = false;

	    var window = this._window;
	    this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
	    hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
	    hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
	  };

	  /**
	   * Show `path` with optional `state` object.
	   *
	   * @param {string} path
	   * @param {Object=} state
	   * @param {boolean=} dispatch
	   * @param {boolean=} push
	   * @return {!Context}
	   * @api public
	   */

	  Page.prototype.show = function(path, state, dispatch, push) {
	    var ctx = new Context(path, state, this),
	      prev = this.prevContext;
	    this.prevContext = ctx;
	    this.current = ctx.path;
	    if (false !== dispatch) this.dispatch(ctx, prev);
	    if (false !== ctx.handled && false !== push) ctx.pushState();
	    return ctx;
	  };

	  /**
	   * Goes back in the history
	   * Back should always let the current route push state and then go back.
	   *
	   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
	   * @param {Object=} state
	   * @api public
	   */

	  Page.prototype.back = function(path, state) {
	    var page = this;
	    if (this.len > 0) {
	      var window = this._window;
	      // this may need more testing to see if all browsers
	      // wait for the next tick to go back in history
	      hasHistory && window.history.back();
	      this.len--;
	    } else if (path) {
	      setTimeout(function() {
	        page.show(path, state);
	      });
	    } else {
	      setTimeout(function() {
	        page.show(page._getBase(), state);
	      });
	    }
	  };

	  /**
	   * Register route to redirect from one path to other
	   * or just redirect to another route
	   *
	   * @param {string} from - if param 'to' is undefined redirects to 'from'
	   * @param {string=} to
	   * @api public
	   */
	  Page.prototype.redirect = function(from, to) {
	    var inst = this;

	    // Define route from a path to another
	    if ('string' === typeof from && 'string' === typeof to) {
	      page.call(this, from, function(e) {
	        setTimeout(function() {
	          inst.replace(/** @type {!string} */ (to));
	        }, 0);
	      });
	    }

	    // Wait for the push state and replace it with another
	    if ('string' === typeof from && 'undefined' === typeof to) {
	      setTimeout(function() {
	        inst.replace(from);
	      }, 0);
	    }
	  };

	  /**
	   * Replace `path` with optional `state` object.
	   *
	   * @param {string} path
	   * @param {Object=} state
	   * @param {boolean=} init
	   * @param {boolean=} dispatch
	   * @return {!Context}
	   * @api public
	   */


	  Page.prototype.replace = function(path, state, init, dispatch) {
	    var ctx = new Context(path, state, this),
	      prev = this.prevContext;
	    this.prevContext = ctx;
	    this.current = ctx.path;
	    ctx.init = init;
	    ctx.save(); // save before dispatching, which may redirect
	    if (false !== dispatch) this.dispatch(ctx, prev);
	    return ctx;
	  };

	  /**
	   * Dispatch the given `ctx`.
	   *
	   * @param {Context} ctx
	   * @api private
	   */

	  Page.prototype.dispatch = function(ctx, prev) {
	    var i = 0, j = 0, page = this;

	    function nextExit() {
	      var fn = page.exits[j++];
	      if (!fn) return nextEnter();
	      fn(prev, nextExit);
	    }

	    function nextEnter() {
	      var fn = page.callbacks[i++];

	      if (ctx.path !== page.current) {
	        ctx.handled = false;
	        return;
	      }
	      if (!fn) return unhandled.call(page, ctx);
	      fn(ctx, nextEnter);
	    }

	    if (prev) {
	      nextExit();
	    } else {
	      nextEnter();
	    }
	  };

	  /**
	   * Register an exit route on `path` with
	   * callback `fn()`, which will be called
	   * on the previous context when a new
	   * page is visited.
	   */
	  Page.prototype.exit = function(path, fn) {
	    if (typeof path === 'function') {
	      return this.exit('*', path);
	    }

	    var route = new Route(path, null, this);
	    for (var i = 1; i < arguments.length; ++i) {
	      this.exits.push(route.middleware(arguments[i]));
	    }
	  };

	  /**
	   * Handle "click" events.
	   */

	  /* jshint +W054 */
	  Page.prototype.clickHandler = function(e) {
	    if (1 !== this._which(e)) return;

	    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
	    if (e.defaultPrevented) return;

	    // ensure link
	    // use shadow dom when available if not, fall back to composedPath()
	    // for browsers that only have shady
	    var el = e.target;
	    var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

	    if(eventPath) {
	      for (var i = 0; i < eventPath.length; i++) {
	        if (!eventPath[i].nodeName) continue;
	        if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
	        if (!eventPath[i].href) continue;

	        el = eventPath[i];
	        break;
	      }
	    }

	    // continue ensure link
	    // el.nodeName for svg links are 'a' instead of 'A'
	    while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
	    if (!el || 'A' !== el.nodeName.toUpperCase()) return;

	    // check if link is inside an svg
	    // in this case, both href and target are always inside an object
	    var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

	    // Ignore if tag has
	    // 1. "download" attribute
	    // 2. rel="external" attribute
	    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

	    // ensure non-hash for the same path
	    var link = el.getAttribute('href');
	    if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

	    // Check for mailto: in the href
	    if (link && link.indexOf('mailto:') > -1) return;

	    // check target
	    // svg target is an object and its desired value is in .baseVal property
	    if (svg ? el.target.baseVal : el.target) return;

	    // x-origin
	    // note: svg links that are not relative don't call click events (and skip page.js)
	    // consequently, all svg links tested inside page.js are relative and in the same origin
	    if (!svg && !this.sameOrigin(el.href)) return;

	    // rebuild path
	    // There aren't .pathname and .search properties in svg links, so we use href
	    // Also, svg href is an object and its desired value is in .baseVal property
	    var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

	    path = path[0] !== '/' ? '/' + path : path;

	    // strip leading "/[drive letter]:" on NW.js on Windows
	    if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
	      path = path.replace(/^\/[a-zA-Z]:\//, '/');
	    }

	    // same page
	    var orig = path;
	    var pageBase = this._getBase();

	    if (path.indexOf(pageBase) === 0) {
	      path = path.substr(pageBase.length);
	    }

	    if (this._hashbang) path = path.replace('#!', '');

	    if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
	      return;
	    }

	    e.preventDefault();
	    this.show(orig);
	  };

	  /**
	   * Handle "populate" events.
	   * @api private
	   */

	  Page.prototype._onpopstate = (function () {
	    var loaded = false;
	    if ( ! hasWindow ) {
	      return function () {};
	    }
	    if (hasDocument && document.readyState === 'complete') {
	      loaded = true;
	    } else {
	      window.addEventListener('load', function() {
	        setTimeout(function() {
	          loaded = true;
	        }, 0);
	      });
	    }
	    return function onpopstate(e) {
	      if (!loaded) return;
	      var page = this;
	      if (e.state) {
	        var path = e.state.path;
	        page.replace(path, e.state);
	      } else if (isLocation) {
	        var loc = page._window.location;
	        page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
	      }
	    };
	  })();

	  /**
	   * Event button.
	   */
	  Page.prototype._which = function(e) {
	    e = e || (hasWindow && this._window.event);
	    return null == e.which ? e.button : e.which;
	  };

	  /**
	   * Convert to a URL object
	   * @api private
	   */
	  Page.prototype._toURL = function(href) {
	    var window = this._window;
	    if(typeof URL === 'function' && isLocation) {
	      return new URL(href, window.location.toString());
	    } else if (hasDocument) {
	      var anc = window.document.createElement('a');
	      anc.href = href;
	      return anc;
	    }
	  };

	  /**
	   * Check if `href` is the same origin.
	   * @param {string} href
	   * @api public
	   */
	  Page.prototype.sameOrigin = function(href) {
	    if(!href || !isLocation) return false;

	    var url = this._toURL(href);
	    var window = this._window;

	    var loc = window.location;

	    /*
	       When the port is the default http port 80 for http, or 443 for
	       https, internet explorer 11 returns an empty string for loc.port,
	       so we need to compare loc.port with an empty string if url.port
	       is the default port 80 or 443.
	       Also the comparition with `port` is changed from `===` to `==` because
	       `port` can be a string sometimes. This only applies to ie11.
	    */
	    return loc.protocol === url.protocol &&
	      loc.hostname === url.hostname &&
	      (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
	  };

	  /**
	   * @api private
	   */
	  Page.prototype._samePath = function(url) {
	    if(!isLocation) return false;
	    var window = this._window;
	    var loc = window.location;
	    return url.pathname === loc.pathname &&
	      url.search === loc.search;
	  };

	  /**
	   * Remove URL encoding from the given `str`.
	   * Accommodates whitespace in both x-www-form-urlencoded
	   * and regular percent-encoded form.
	   *
	   * @param {string} val - URL component to decode
	   * @api private
	   */
	  Page.prototype._decodeURLEncodedURIComponent = function(val) {
	    if (typeof val !== 'string') { return val; }
	    return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
	  };

	  /**
	   * Create a new `page` instance and function
	   */
	  function createPage() {
	    var pageInstance = new Page();

	    function pageFn(/* args */) {
	      return page.apply(pageInstance, arguments);
	    }

	    // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
	    pageFn.callbacks = pageInstance.callbacks;
	    pageFn.exits = pageInstance.exits;
	    pageFn.base = pageInstance.base.bind(pageInstance);
	    pageFn.strict = pageInstance.strict.bind(pageInstance);
	    pageFn.start = pageInstance.start.bind(pageInstance);
	    pageFn.stop = pageInstance.stop.bind(pageInstance);
	    pageFn.show = pageInstance.show.bind(pageInstance);
	    pageFn.back = pageInstance.back.bind(pageInstance);
	    pageFn.redirect = pageInstance.redirect.bind(pageInstance);
	    pageFn.replace = pageInstance.replace.bind(pageInstance);
	    pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
	    pageFn.exit = pageInstance.exit.bind(pageInstance);
	    pageFn.configure = pageInstance.configure.bind(pageInstance);
	    pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
	    pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

	    pageFn.create = createPage;

	    Object.defineProperty(pageFn, 'len', {
	      get: function(){
	        return pageInstance.len;
	      },
	      set: function(val) {
	        pageInstance.len = val;
	      }
	    });

	    Object.defineProperty(pageFn, 'current', {
	      get: function(){
	        return pageInstance.current;
	      },
	      set: function(val) {
	        pageInstance.current = val;
	      }
	    });

	    // In 2.0 these can be named exports
	    pageFn.Context = Context;
	    pageFn.Route = Route;

	    return pageFn;
	  }

	  /**
	   * Register `path` with callback `fn()`,
	   * or route `path`, or redirection,
	   * or `page.start()`.
	   *
	   *   page(fn);
	   *   page('*', fn);
	   *   page('/user/:id', load, user);
	   *   page('/user/' + user.id, { some: 'thing' });
	   *   page('/user/' + user.id);
	   *   page('/from', '/to')
	   *   page();
	   *
	   * @param {string|!Function|!Object} path
	   * @param {Function=} fn
	   * @api public
	   */

	  function page(path, fn) {
	    // <callback>
	    if ('function' === typeof path) {
	      return page.call(this, '*', path);
	    }

	    // route <path> to <callback ...>
	    if ('function' === typeof fn) {
	      var route = new Route(/** @type {string} */ (path), null, this);
	      for (var i = 1; i < arguments.length; ++i) {
	        this.callbacks.push(route.middleware(arguments[i]));
	      }
	      // show <path> with [state]
	    } else if ('string' === typeof path) {
	      this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
	      // start [options]
	    } else {
	      this.start(path);
	    }
	  }

	  /**
	   * Unhandled `ctx`. When it's not the initial
	   * popstate then redirect. If you wish to handle
	   * 404s on your own use `page('*', callback)`.
	   *
	   * @param {Context} ctx
	   * @api private
	   */
	  function unhandled(ctx) {
	    if (ctx.handled) return;
	    var current;
	    var page = this;
	    var window = page._window;

	    if (page._hashbang) {
	      current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
	    } else {
	      current = isLocation && window.location.pathname + window.location.search;
	    }

	    if (current === ctx.canonicalPath) return;
	    page.stop();
	    ctx.handled = false;
	    isLocation && (window.location.href = ctx.canonicalPath);
	  }

	  /**
	   * Escapes RegExp characters in the given string.
	   *
	   * @param {string} s
	   * @api private
	   */
	  function escapeRegExp(s) {
	    return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
	  }

	  /**
	   * Initialize a new "request" `Context`
	   * with the given `path` and optional initial `state`.
	   *
	   * @constructor
	   * @param {string} path
	   * @param {Object=} state
	   * @api public
	   */

	  function Context(path, state, pageInstance) {
	    var _page = this.page = pageInstance || page;
	    var window = _page._window;
	    var hashbang = _page._hashbang;

	    var pageBase = _page._getBase();
	    if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
	    var i = path.indexOf('?');

	    this.canonicalPath = path;
	    var re = new RegExp('^' + escapeRegExp(pageBase));
	    this.path = path.replace(re, '') || '/';
	    if (hashbang) this.path = this.path.replace('#!', '') || '/';

	    this.title = (hasDocument && window.document.title);
	    this.state = state || {};
	    this.state.path = path;
	    this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
	    this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
	    this.params = {};

	    // fragment
	    this.hash = '';
	    if (!hashbang) {
	      if (!~this.path.indexOf('#')) return;
	      var parts = this.path.split('#');
	      this.path = this.pathname = parts[0];
	      this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
	      this.querystring = this.querystring.split('#')[0];
	    }
	  }

	  /**
	   * Push state.
	   *
	   * @api private
	   */

	  Context.prototype.pushState = function() {
	    var page = this.page;
	    var window = page._window;
	    var hashbang = page._hashbang;

	    page.len++;
	    if (hasHistory) {
	        window.history.pushState(this.state, this.title,
	          hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
	    }
	  };

	  /**
	   * Save the context state.
	   *
	   * @api public
	   */

	  Context.prototype.save = function() {
	    var page = this.page;
	    if (hasHistory) {
	        page._window.history.replaceState(this.state, this.title,
	          page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
	    }
	  };

	  /**
	   * Initialize `Route` with the given HTTP `path`,
	   * and an array of `callbacks` and `options`.
	   *
	   * Options:
	   *
	   *   - `sensitive`    enable case-sensitive routes
	   *   - `strict`       enable strict matching for trailing slashes
	   *
	   * @constructor
	   * @param {string} path
	   * @param {Object=} options
	   * @api private
	   */

	  function Route(path, options, page) {
	    var _page = this.page = page || globalPage;
	    var opts = options || {};
	    opts.strict = opts.strict || _page._strict;
	    this.path = (path === '*') ? '(.*)' : path;
	    this.method = 'GET';
	    this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
	  }

	  /**
	   * Return route middleware with
	   * the given callback `fn()`.
	   *
	   * @param {Function} fn
	   * @return {Function}
	   * @api public
	   */

	  Route.prototype.middleware = function(fn) {
	    var self = this;
	    return function(ctx, next) {
	      if (self.match(ctx.path, ctx.params)) {
	        ctx.routePath = self.path;
	        return fn(ctx, next);
	      }
	      next();
	    };
	  };

	  /**
	   * Check if this route matches `path`, if so
	   * populate `params`.
	   *
	   * @param {string} path
	   * @param {Object} params
	   * @return {boolean}
	   * @api private
	   */

	  Route.prototype.match = function(path, params) {
	    var keys = this.keys,
	      qsIndex = path.indexOf('?'),
	      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
	      m = this.regexp.exec(decodeURIComponent(pathname));

	    if (!m) return false;

	    delete params[0];

	    for (var i = 1, len = m.length; i < len; ++i) {
	      var key = keys[i - 1];
	      var val = this.page._decodeURLEncodedURIComponent(m[i]);
	      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
	        params[key.name] = val;
	      }
	    }

	    return true;
	  };


	  /**
	   * Module exports.
	   */

	  var globalPage = createPage();
	  var page_js = globalPage;
	  var default_1 = globalPage;

	page_js.default = default_1;

	return page_js;

	})));
	});

	function noop() { }
	const identity = x => x;
	function assign(tar, src) {
	    // @ts-ignore
	    for (const k in src)
	        tar[k] = src[k];
	    return tar;
	}
	function add_location(element, file, line, column, char) {
	    element.__svelte_meta = {
	        loc: { file, line, column, char }
	    };
	}
	function run(fn) {
	    return fn();
	}
	function blank_object() {
	    return Object.create(null);
	}
	function run_all(fns) {
	    fns.forEach(run);
	}
	function is_function(thing) {
	    return typeof thing === 'function';
	}
	function safe_not_equal(a, b) {
	    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}
	function validate_store(store, name) {
	    if (store != null && typeof store.subscribe !== 'function') {
	        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	    }
	}
	function subscribe(store, ...callbacks) {
	    if (store == null) {
	        return noop;
	    }
	    const unsub = store.subscribe(...callbacks);
	    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}
	function component_subscribe(component, store, callback) {
	    component.$$.on_destroy.push(subscribe(store, callback));
	}
	function create_slot(definition, ctx, $$scope, fn) {
	    if (definition) {
	        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
	        return definition[0](slot_ctx);
	    }
	}
	function get_slot_context(definition, ctx, $$scope, fn) {
	    return definition[1] && fn
	        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
	        : $$scope.ctx;
	}
	function get_slot_changes(definition, $$scope, dirty, fn) {
	    if (definition[2] && fn) {
	        const lets = definition[2](fn(dirty));
	        if ($$scope.dirty === undefined) {
	            return lets;
	        }
	        if (typeof lets === 'object') {
	            const merged = [];
	            const len = Math.max($$scope.dirty.length, lets.length);
	            for (let i = 0; i < len; i += 1) {
	                merged[i] = $$scope.dirty[i] | lets[i];
	            }
	            return merged;
	        }
	        return $$scope.dirty | lets;
	    }
	    return $$scope.dirty;
	}
	function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
	    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
	    if (slot_changes) {
	        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
	        slot.p(slot_context, slot_changes);
	    }
	}
	function exclude_internal_props(props) {
	    const result = {};
	    for (const k in props)
	        if (k[0] !== '$')
	            result[k] = props[k];
	    return result;
	}
	function null_to_empty(value) {
	    return value == null ? '' : value;
	}
	function set_store_value(store, ret, value = ret) {
	    store.set(value);
	    return ret;
	}
	function action_destroyer(action_result) {
	    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
	}

	const is_client = typeof window !== 'undefined';
	let now = is_client
	    ? () => window.performance.now()
	    : () => Date.now();
	let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

	const tasks = new Set();
	function run_tasks(now) {
	    tasks.forEach(task => {
	        if (!task.c(now)) {
	            tasks.delete(task);
	            task.f();
	        }
	    });
	    if (tasks.size !== 0)
	        raf(run_tasks);
	}
	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 */
	function loop(callback) {
	    let task;
	    if (tasks.size === 0)
	        raf(run_tasks);
	    return {
	        promise: new Promise(fulfill => {
	            tasks.add(task = { c: callback, f: fulfill });
	        }),
	        abort() {
	            tasks.delete(task);
	        }
	    };
	}

	function append(target, node) {
	    target.appendChild(node);
	}
	function insert(target, node, anchor) {
	    target.insertBefore(node, anchor || null);
	}
	function detach(node) {
	    node.parentNode.removeChild(node);
	}
	function destroy_each(iterations, detaching) {
	    for (let i = 0; i < iterations.length; i += 1) {
	        if (iterations[i])
	            iterations[i].d(detaching);
	    }
	}
	function element(name) {
	    return document.createElement(name);
	}
	function svg_element(name) {
	    return document.createElementNS('http://www.w3.org/2000/svg', name);
	}
	function text(data) {
	    return document.createTextNode(data);
	}
	function space() {
	    return text(' ');
	}
	function empty() {
	    return text('');
	}
	function listen(node, event, handler, options) {
	    node.addEventListener(event, handler, options);
	    return () => node.removeEventListener(event, handler, options);
	}
	function stop_propagation(fn) {
	    return function (event) {
	        event.stopPropagation();
	        // @ts-ignore
	        return fn.call(this, event);
	    };
	}
	function attr(node, attribute, value) {
	    if (value == null)
	        node.removeAttribute(attribute);
	    else if (node.getAttribute(attribute) !== value)
	        node.setAttribute(attribute, value);
	}
	function set_attributes(node, attributes) {
	    // @ts-ignore
	    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
	    for (const key in attributes) {
	        if (attributes[key] == null) {
	            node.removeAttribute(key);
	        }
	        else if (key === 'style') {
	            node.style.cssText = attributes[key];
	        }
	        else if (key === '__value') {
	            node.value = node[key] = attributes[key];
	        }
	        else if (descriptors[key] && descriptors[key].set) {
	            node[key] = attributes[key];
	        }
	        else {
	            attr(node, key, attributes[key]);
	        }
	    }
	}
	function children(element) {
	    return Array.from(element.childNodes);
	}
	function set_input_value(input, value) {
	    input.value = value == null ? '' : value;
	}
	function set_style(node, key, value, important) {
	    node.style.setProperty(key, value, important ? 'important' : '');
	}
	function toggle_class(element, name, toggle) {
	    element.classList[toggle ? 'add' : 'remove'](name);
	}
	function custom_event(type, detail) {
	    const e = document.createEvent('CustomEvent');
	    e.initCustomEvent(type, false, false, detail);
	    return e;
	}
	class HtmlTag {
	    constructor(anchor = null) {
	        this.a = anchor;
	        this.e = this.n = null;
	    }
	    m(html, target, anchor = null) {
	        if (!this.e) {
	            this.e = element(target.nodeName);
	            this.t = target;
	            this.h(html);
	        }
	        this.i(anchor);
	    }
	    h(html) {
	        this.e.innerHTML = html;
	        this.n = Array.from(this.e.childNodes);
	    }
	    i(anchor) {
	        for (let i = 0; i < this.n.length; i += 1) {
	            insert(this.t, this.n[i], anchor);
	        }
	    }
	    p(html) {
	        this.d();
	        this.h(html);
	        this.i(this.a);
	    }
	    d() {
	        this.n.forEach(detach);
	    }
	}

	const active_docs = new Set();
	let active = 0;
	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
	    let hash = 5381;
	    let i = str.length;
	    while (i--)
	        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	    return hash >>> 0;
	}
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
	    const step = 16.666 / duration;
	    let keyframes = '{\n';
	    for (let p = 0; p <= 1; p += step) {
	        const t = a + (b - a) * ease(p);
	        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
	    }
	    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	    const name = `__svelte_${hash(rule)}_${uid}`;
	    const doc = node.ownerDocument;
	    active_docs.add(doc);
	    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
	    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
	    if (!current_rules[name]) {
	        current_rules[name] = true;
	        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
	    }
	    const animation = node.style.animation || '';
	    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
	    active += 1;
	    return name;
	}
	function delete_rule(node, name) {
	    const previous = (node.style.animation || '').split(', ');
	    const next = previous.filter(name
	        ? anim => anim.indexOf(name) < 0 // remove specific animation
	        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
	    );
	    const deleted = previous.length - next.length;
	    if (deleted) {
	        node.style.animation = next.join(', ');
	        active -= deleted;
	        if (!active)
	            clear_rules();
	    }
	}
	function clear_rules() {
	    raf(() => {
	        if (active)
	            return;
	        active_docs.forEach(doc => {
	            const stylesheet = doc.__svelte_stylesheet;
	            let i = stylesheet.cssRules.length;
	            while (i--)
	                stylesheet.deleteRule(i);
	            doc.__svelte_rules = {};
	        });
	        active_docs.clear();
	    });
	}

	let current_component;
	function set_current_component(component) {
	    current_component = component;
	}
	function get_current_component() {
	    if (!current_component)
	        throw new Error(`Function called outside component initialization`);
	    return current_component;
	}
	function beforeUpdate(fn) {
	    get_current_component().$$.before_update.push(fn);
	}
	function onMount(fn) {
	    get_current_component().$$.on_mount.push(fn);
	}
	function onDestroy(fn) {
	    get_current_component().$$.on_destroy.push(fn);
	}
	function createEventDispatcher() {
	    const component = get_current_component();
	    return (type, detail) => {
	        const callbacks = component.$$.callbacks[type];
	        if (callbacks) {
	            // TODO are there situations where events could be dispatched
	            // in a server (non-DOM) environment?
	            const event = custom_event(type, detail);
	            callbacks.slice().forEach(fn => {
	                fn.call(component, event);
	            });
	        }
	    };
	}
	function getContext(key) {
	    return get_current_component().$$.context.get(key);
	}
	// TODO figure out if we still want to support
	// shorthand events, or if we want to implement
	// a real bubbling mechanism
	function bubble(component, event) {
	    const callbacks = component.$$.callbacks[event.type];
	    if (callbacks) {
	        callbacks.slice().forEach(fn => fn(event));
	    }
	}

	const dirty_components = [];
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];
	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	function schedule_update() {
	    if (!update_scheduled) {
	        update_scheduled = true;
	        resolved_promise.then(flush);
	    }
	}
	function tick() {
	    schedule_update();
	    return resolved_promise;
	}
	function add_render_callback(fn) {
	    render_callbacks.push(fn);
	}
	function add_flush_callback(fn) {
	    flush_callbacks.push(fn);
	}
	let flushing = false;
	const seen_callbacks = new Set();
	function flush() {
	    if (flushing)
	        return;
	    flushing = true;
	    do {
	        // first, call beforeUpdate functions
	        // and update components
	        for (let i = 0; i < dirty_components.length; i += 1) {
	            const component = dirty_components[i];
	            set_current_component(component);
	            update(component.$$);
	        }
	        dirty_components.length = 0;
	        while (binding_callbacks.length)
	            binding_callbacks.pop()();
	        // then, once components are updated, call
	        // afterUpdate functions. This may cause
	        // subsequent updates...
	        for (let i = 0; i < render_callbacks.length; i += 1) {
	            const callback = render_callbacks[i];
	            if (!seen_callbacks.has(callback)) {
	                // ...so guard against infinite loops
	                seen_callbacks.add(callback);
	                callback();
	            }
	        }
	        render_callbacks.length = 0;
	    } while (dirty_components.length);
	    while (flush_callbacks.length) {
	        flush_callbacks.pop()();
	    }
	    update_scheduled = false;
	    flushing = false;
	    seen_callbacks.clear();
	}
	function update($$) {
	    if ($$.fragment !== null) {
	        $$.update();
	        run_all($$.before_update);
	        const dirty = $$.dirty;
	        $$.dirty = [-1];
	        $$.fragment && $$.fragment.p($$.ctx, dirty);
	        $$.after_update.forEach(add_render_callback);
	    }
	}

	let promise;
	function wait() {
	    if (!promise) {
	        promise = Promise.resolve();
	        promise.then(() => {
	            promise = null;
	        });
	    }
	    return promise;
	}
	function dispatch(node, direction, kind) {
	    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}
	const outroing = new Set();
	let outros;
	function group_outros() {
	    outros = {
	        r: 0,
	        c: [],
	        p: outros // parent group
	    };
	}
	function check_outros() {
	    if (!outros.r) {
	        run_all(outros.c);
	    }
	    outros = outros.p;
	}
	function transition_in(block, local) {
	    if (block && block.i) {
	        outroing.delete(block);
	        block.i(local);
	    }
	}
	function transition_out(block, local, detach, callback) {
	    if (block && block.o) {
	        if (outroing.has(block))
	            return;
	        outroing.add(block);
	        outros.c.push(() => {
	            outroing.delete(block);
	            if (callback) {
	                if (detach)
	                    block.d(1);
	                callback();
	            }
	        });
	        block.o(local);
	    }
	}
	const null_transition = { duration: 0 };
	function create_in_transition(node, fn, params) {
	    let config = fn(node, params);
	    let running = false;
	    let animation_name;
	    let task;
	    let uid = 0;
	    function cleanup() {
	        if (animation_name)
	            delete_rule(node, animation_name);
	    }
	    function go() {
	        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
	        if (css)
	            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
	        tick(0, 1);
	        const start_time = now() + delay;
	        const end_time = start_time + duration;
	        if (task)
	            task.abort();
	        running = true;
	        add_render_callback(() => dispatch(node, true, 'start'));
	        task = loop(now => {
	            if (running) {
	                if (now >= end_time) {
	                    tick(1, 0);
	                    dispatch(node, true, 'end');
	                    cleanup();
	                    return running = false;
	                }
	                if (now >= start_time) {
	                    const t = easing((now - start_time) / duration);
	                    tick(t, 1 - t);
	                }
	            }
	            return running;
	        });
	    }
	    let started = false;
	    return {
	        start() {
	            if (started)
	                return;
	            delete_rule(node);
	            if (is_function(config)) {
	                config = config();
	                wait().then(go);
	            }
	            else {
	                go();
	            }
	        },
	        invalidate() {
	            started = false;
	        },
	        end() {
	            if (running) {
	                cleanup();
	                running = false;
	            }
	        }
	    };
	}
	function create_out_transition(node, fn, params) {
	    let config = fn(node, params);
	    let running = true;
	    let animation_name;
	    const group = outros;
	    group.r += 1;
	    function go() {
	        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
	        if (css)
	            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
	        const start_time = now() + delay;
	        const end_time = start_time + duration;
	        add_render_callback(() => dispatch(node, false, 'start'));
	        loop(now => {
	            if (running) {
	                if (now >= end_time) {
	                    tick(0, 1);
	                    dispatch(node, false, 'end');
	                    if (!--group.r) {
	                        // this will result in `end()` being called,
	                        // so we don't need to clean up here
	                        run_all(group.c);
	                    }
	                    return false;
	                }
	                if (now >= start_time) {
	                    const t = easing((now - start_time) / duration);
	                    tick(1 - t, t);
	                }
	            }
	            return running;
	        });
	    }
	    if (is_function(config)) {
	        wait().then(() => {
	            // @ts-ignore
	            config = config();
	            go();
	        });
	    }
	    else {
	        go();
	    }
	    return {
	        end(reset) {
	            if (reset && config.tick) {
	                config.tick(1, 0);
	            }
	            if (running) {
	                if (animation_name)
	                    delete_rule(node, animation_name);
	                running = false;
	            }
	        }
	    };
	}
	function create_bidirectional_transition(node, fn, params, intro) {
	    let config = fn(node, params);
	    let t = intro ? 0 : 1;
	    let running_program = null;
	    let pending_program = null;
	    let animation_name = null;
	    function clear_animation() {
	        if (animation_name)
	            delete_rule(node, animation_name);
	    }
	    function init(program, duration) {
	        const d = program.b - t;
	        duration *= Math.abs(d);
	        return {
	            a: t,
	            b: program.b,
	            d,
	            duration,
	            start: program.start,
	            end: program.start + duration,
	            group: program.group
	        };
	    }
	    function go(b) {
	        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
	        const program = {
	            start: now() + delay,
	            b
	        };
	        if (!b) {
	            // @ts-ignore todo: improve typings
	            program.group = outros;
	            outros.r += 1;
	        }
	        if (running_program) {
	            pending_program = program;
	        }
	        else {
	            // if this is an intro, and there's a delay, we need to do
	            // an initial tick and/or apply CSS animation immediately
	            if (css) {
	                clear_animation();
	                animation_name = create_rule(node, t, b, duration, delay, easing, css);
	            }
	            if (b)
	                tick(0, 1);
	            running_program = init(program, duration);
	            add_render_callback(() => dispatch(node, b, 'start'));
	            loop(now => {
	                if (pending_program && now > pending_program.start) {
	                    running_program = init(pending_program, duration);
	                    pending_program = null;
	                    dispatch(node, running_program.b, 'start');
	                    if (css) {
	                        clear_animation();
	                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
	                    }
	                }
	                if (running_program) {
	                    if (now >= running_program.end) {
	                        tick(t = running_program.b, 1 - t);
	                        dispatch(node, running_program.b, 'end');
	                        if (!pending_program) {
	                            // we're done
	                            if (running_program.b) {
	                                // intro — we can tidy up immediately
	                                clear_animation();
	                            }
	                            else {
	                                // outro — needs to be coordinated
	                                if (!--running_program.group.r)
	                                    run_all(running_program.group.c);
	                            }
	                        }
	                        running_program = null;
	                    }
	                    else if (now >= running_program.start) {
	                        const p = now - running_program.start;
	                        t = running_program.a + running_program.d * easing(p / running_program.duration);
	                        tick(t, 1 - t);
	                    }
	                }
	                return !!(running_program || pending_program);
	            });
	        }
	    }
	    return {
	        run(b) {
	            if (is_function(config)) {
	                wait().then(() => {
	                    // @ts-ignore
	                    config = config();
	                    go(b);
	                });
	            }
	            else {
	                go(b);
	            }
	        },
	        end() {
	            clear_animation();
	            running_program = pending_program = null;
	        }
	    };
	}

	const globals = (typeof window !== 'undefined'
	    ? window
	    : typeof globalThis !== 'undefined'
	        ? globalThis
	        : global);

	function get_spread_update(levels, updates) {
	    const update = {};
	    const to_null_out = {};
	    const accounted_for = { $$scope: 1 };
	    let i = levels.length;
	    while (i--) {
	        const o = levels[i];
	        const n = updates[i];
	        if (n) {
	            for (const key in o) {
	                if (!(key in n))
	                    to_null_out[key] = 1;
	            }
	            for (const key in n) {
	                if (!accounted_for[key]) {
	                    update[key] = n[key];
	                    accounted_for[key] = 1;
	                }
	            }
	            levels[i] = n;
	        }
	        else {
	            for (const key in o) {
	                accounted_for[key] = 1;
	            }
	        }
	    }
	    for (const key in to_null_out) {
	        if (!(key in update))
	            update[key] = undefined;
	    }
	    return update;
	}
	function get_spread_object(spread_props) {
	    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	function bind(component, name, callback) {
	    const index = component.$$.props[name];
	    if (index !== undefined) {
	        component.$$.bound[index] = callback;
	        callback(component.$$.ctx[index]);
	    }
	}
	function create_component(block) {
	    block && block.c();
	}
	function mount_component(component, target, anchor) {
	    const { fragment, on_mount, on_destroy, after_update } = component.$$;
	    fragment && fragment.m(target, anchor);
	    // onMount happens before the initial afterUpdate
	    add_render_callback(() => {
	        const new_on_destroy = on_mount.map(run).filter(is_function);
	        if (on_destroy) {
	            on_destroy.push(...new_on_destroy);
	        }
	        else {
	            // Edge case - component was destroyed immediately,
	            // most likely as a result of a binding initialising
	            run_all(new_on_destroy);
	        }
	        component.$$.on_mount = [];
	    });
	    after_update.forEach(add_render_callback);
	}
	function destroy_component(component, detaching) {
	    const $$ = component.$$;
	    if ($$.fragment !== null) {
	        run_all($$.on_destroy);
	        $$.fragment && $$.fragment.d(detaching);
	        // TODO null out other refs, including component.$$ (but need to
	        // preserve final state?)
	        $$.on_destroy = $$.fragment = null;
	        $$.ctx = [];
	    }
	}
	function make_dirty(component, i) {
	    if (component.$$.dirty[0] === -1) {
	        dirty_components.push(component);
	        schedule_update();
	        component.$$.dirty.fill(0);
	    }
	    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
	}
	function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
	    const parent_component = current_component;
	    set_current_component(component);
	    const prop_values = options.props || {};
	    const $$ = component.$$ = {
	        fragment: null,
	        ctx: null,
	        // state
	        props,
	        update: noop,
	        not_equal,
	        bound: blank_object(),
	        // lifecycle
	        on_mount: [],
	        on_destroy: [],
	        before_update: [],
	        after_update: [],
	        context: new Map(parent_component ? parent_component.$$.context : []),
	        // everything else
	        callbacks: blank_object(),
	        dirty
	    };
	    let ready = false;
	    $$.ctx = instance
	        ? instance(component, prop_values, (i, ret, ...rest) => {
	            const value = rest.length ? rest[0] : ret;
	            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
	                if ($$.bound[i])
	                    $$.bound[i](value);
	                if (ready)
	                    make_dirty(component, i);
	            }
	            return ret;
	        })
	        : [];
	    $$.update();
	    ready = true;
	    run_all($$.before_update);
	    // `false` as a special case of no DOM component
	    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	    if (options.target) {
	        if (options.hydrate) {
	            const nodes = children(options.target);
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            $$.fragment && $$.fragment.l(nodes);
	            nodes.forEach(detach);
	        }
	        else {
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            $$.fragment && $$.fragment.c();
	        }
	        if (options.intro)
	            transition_in(component.$$.fragment);
	        mount_component(component, options.target, options.anchor);
	        flush();
	    }
	    set_current_component(parent_component);
	}
	class SvelteComponent {
	    $destroy() {
	        destroy_component(this, 1);
	        this.$destroy = noop;
	    }
	    $on(type, callback) {
	        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
	        callbacks.push(callback);
	        return () => {
	            const index = callbacks.indexOf(callback);
	            if (index !== -1)
	                callbacks.splice(index, 1);
	        };
	    }
	    $set() {
	        // overridden by instance, if it has props
	    }
	}

	function dispatch_dev(type, detail) {
	    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
	}
	function append_dev(target, node) {
	    dispatch_dev("SvelteDOMInsert", { target, node });
	    append(target, node);
	}
	function insert_dev(target, node, anchor) {
	    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
	    insert(target, node, anchor);
	}
	function detach_dev(node) {
	    dispatch_dev("SvelteDOMRemove", { node });
	    detach(node);
	}
	function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
	    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
	    if (has_prevent_default)
	        modifiers.push('preventDefault');
	    if (has_stop_propagation)
	        modifiers.push('stopPropagation');
	    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
	    const dispose = listen(node, event, handler, options);
	    return () => {
	        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
	        dispose();
	    };
	}
	function attr_dev(node, attribute, value) {
	    attr(node, attribute, value);
	    if (value == null)
	        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
	    else
	        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
	}
	function set_data_dev(text, data) {
	    data = '' + data;
	    if (text.wholeText === data)
	        return;
	    dispatch_dev("SvelteDOMSetData", { node: text, data });
	    text.data = data;
	}
	function validate_each_argument(arg) {
	    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
	        let msg = '{#each} only iterates over array-like objects.';
	        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
	            msg += ' You can use a spread to convert this iterable into an array.';
	        }
	        throw new Error(msg);
	    }
	}
	function validate_slots(name, slot, keys) {
	    for (const slot_key of Object.keys(slot)) {
	        if (!~keys.indexOf(slot_key)) {
	            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
	        }
	    }
	}
	class SvelteComponentDev extends SvelteComponent {
	    constructor(options) {
	        if (!options || (!options.target && !options.$$inline)) {
	            throw new Error(`'target' is a required option`);
	        }
	        super();
	    }
	    $destroy() {
	        super.$destroy();
	        this.$destroy = () => {
	            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
	        };
	    }
	    $capture_state() { }
	    $inject_state() { }
	}

	function cubicOut(t) {
	    const f = t - 1.0;
	    return f * f * f + 1.0;
	}
	function quintOut(t) {
	    return --t * t * t * t * t + 1;
	}

	function fade(node, { delay = 0, duration = 400, easing = identity }) {
	    const o = +getComputedStyle(node).opacity;
	    return {
	        delay,
	        duration,
	        easing,
	        css: t => `opacity: ${t * o}`
	    };
	}
	function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
	    const style = getComputedStyle(node);
	    const target_opacity = +style.opacity;
	    const transform = style.transform === 'none' ? '' : style.transform;
	    const od = target_opacity * (1 - opacity);
	    return {
	        delay,
	        duration,
	        easing,
	        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
	    };
	}
	function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
	    const style = getComputedStyle(node);
	    const opacity = +style.opacity;
	    const height = parseFloat(style.height);
	    const padding_top = parseFloat(style.paddingTop);
	    const padding_bottom = parseFloat(style.paddingBottom);
	    const margin_top = parseFloat(style.marginTop);
	    const margin_bottom = parseFloat(style.marginBottom);
	    const border_top_width = parseFloat(style.borderTopWidth);
	    const border_bottom_width = parseFloat(style.borderBottomWidth);
	    return {
	        delay,
	        duration,
	        easing,
	        css: t => `overflow: hidden;` +
	            `opacity: ${Math.min(t * 20, 1) * opacity};` +
	            `height: ${t * height}px;` +
	            `padding-top: ${t * padding_top}px;` +
	            `padding-bottom: ${t * padding_bottom}px;` +
	            `margin-top: ${t * margin_top}px;` +
	            `margin-bottom: ${t * margin_bottom}px;` +
	            `border-top-width: ${t * border_top_width}px;` +
	            `border-bottom-width: ${t * border_bottom_width}px;`
	    };
	}
	function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
	    const style = getComputedStyle(node);
	    const target_opacity = +style.opacity;
	    const transform = style.transform === 'none' ? '' : style.transform;
	    const sd = 1 - start;
	    const od = target_opacity * (1 - opacity);
	    return {
	        delay,
	        duration,
	        easing,
	        css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
	    };
	}

	// Thanks to @AlexxNB

	function getEventsAction(component) {
		return (node) => {
			const events = Object.keys(component.$$.callbacks);
			const listeners = [];

			events.forEach((event) => listeners.push(listen(node, event, (e) => bubble(component, e))));

			return {
				destroy: () => {
					listeners.forEach((listener) => listener());
				},
			};
		};
	}

	function islegacy() {
		if (typeof window === 'undefined') return false;
		return !(window.CSS && window.CSS.supports && window.CSS.supports('(--foo: red)'));
	}

	function cssVar(name, value) {
		// if name like 'var(--variable)' or 'var(--variable, fallback_color)' reduce to '--variable'
		name = name.replace(/var\(|\s?,.+|\)|'|"/g, '');

		if (name.substr(0, 2) !== '--') {
			name = '--' + name;
		}

		if (value) {
			document.documentElement.style.setProperty(name, value);
		}

		return getComputedStyle(document.documentElement).getPropertyValue(name);
	}

	function normalize(color) {
		color = color.replace(/\s/, '');
		// var()
		if (color.charAt(0) === 'v') {
			color = cssVar(color);
		}
		// rgb(), rgba()
		if (color.charAt(0) === 'r') {
			color = rgb2hex(color);
		} else if (color.toLowerCase() === 'transparent') {
			color = '#00000000';
		}

		return color;
	}

	// http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	function luminance(color = '#ffffff') {
		let RsRGB, GsRGB, BsRGB, R, G, B;

		if (color.length === 0) {
			color = '#ffffff';
		}

		color = normalize(color);

		// Validate hex color
		color = String(color).replace(/[^0-9a-f]/gi, '');
		const valid = new RegExp(/^(?:[0-9a-f]{3}){1,2}$/i).test(color);

		if (valid) {
			if (color.length < 6) {
				color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}
		} else {
			throw new Error('Invalid HEX color!');
		}

		// Convert color to RGB
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
		const rgb = {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
		};

		RsRGB = rgb.r / 255;
		GsRGB = rgb.g / 255;
		BsRGB = rgb.b / 255;

		R = RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4);
		G = GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4);
		B = BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4);

		return 0.2126 * R + 0.7152 * G + 0.0722 * B;
	}

	function rgb2hex(rgb) {
		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		return rgb && rgb.length === 4
			? '#' +
					('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
					('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) +
					('0' + parseInt(rgb[3], 10).toString(16)).slice(-2)
			: '';
	}

	/* F:\git14\svelte-leaflet\src\Ripple.svelte generated by Svelte v3.24.0 */

	const { console: console_1 } = globals;
	const file = "F:\\git14\\svelte-leaflet\\src\\Ripple.svelte";

	function create_fragment(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				attr_dev(div, "class", "ripple svelte-po4fcb");
				add_location(div, file, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				/*div_binding*/ ctx[4](div);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				/*div_binding*/ ctx[4](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function isTouchEvent(e) {
		return e.constructor.name === "TouchEvent";
	}

	function transform(el, value) {
		el.style["transform"] = value;
		el.style["webkitTransform"] = value;
	}

	function opacity(el, value) {
		el.style["opacity"] = value.toString();
	}

	const calculate = (e, el) => {
		const offset = el.getBoundingClientRect();
		const target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e;
		const localX = target.clientX - offset.left;
		const localY = target.clientY - offset.top;
		let radius = 0;
		let scale = 0.3;

		// Get ripple position
		const center = el.dataset.center;

		const circle = el.dataset.circle;

		if (circle) {
			scale = 0.15;
			radius = el.clientWidth / 2;

			radius = center
			? radius
			: radius + Math.sqrt((localX - radius) ** 2 + (localY - radius) ** 2) / 4;
		} else {
			radius = Math.sqrt(el.clientWidth ** 2 + el.clientHeight ** 2) / 2;
		}

		const centerX = `${(el.clientWidth - radius * 2) / 2}px`;
		const centerY = `${(el.clientHeight - radius * 2) / 2}px`;
		const x = center ? centerX : `${localX - radius}px`;
		const y = center ? centerY : `${localY - radius}px`;
		return { radius, scale, x, y, centerX, centerY };
	};

	const startRipple = function (eventType, event) {
		const hideEvents = ["touchcancel", "mouseleave", "dragstart"];
		let container = event.currentTarget || event.target;

		if (container && !container.classList.contains("ripple")) {
			container = container.querySelector(".ripple");
		}

		if (!container) {
			return;
		}

		const prev = container.dataset.event;

		if (prev && prev !== eventType) {
			return;
		}

		container.dataset.event = eventType;

		// Create the ripple
		const wave = document.createElement("span");

		const { radius, scale, x, y, centerX, centerY } = calculate(event, container);
		const color = container.dataset.color;
		const size = `${radius * 2}px`;
		wave.className = "animation";
		wave.style.width = size;
		wave.style.height = size;
		wave.style.background = color;
		wave.classList.add("animation--enter");
		wave.classList.add("animation--visible");
		transform(wave, `translate(${x}, ${y}) scale3d(${scale},${scale},${scale})`);
		opacity(wave, 0);
		wave.dataset.activated = String(performance.now());
		container.appendChild(wave);

		setTimeout(
			() => {
				wave.classList.remove("animation--enter");
				wave.classList.add("animation--in");
				transform(wave, `translate(${centerX}, ${centerY}) scale3d(1,1,1)`);
				opacity(wave, 0.25);
			},
			0
		);

		const releaseEvent = eventType === "mousedown" ? "mouseup" : "touchend";

		const onRelease = function () {
			document.removeEventListener(releaseEvent, onRelease);

			hideEvents.forEach(name => {
				document.removeEventListener(name, onRelease);
			});

			const diff = performance.now() - Number(wave.dataset.activated);
			const delay = Math.max(250 - diff, 0);

			setTimeout(
				() => {
					wave.classList.remove("animation--in");
					wave.classList.add("animation--out");
					opacity(wave, 0);

					setTimeout(
						() => {
							wave && container.removeChild(wave);

							if (container.children.length === 0) {
								delete container.dataset.event;
							}
						},
						300
					);
				},
				delay
			);
		};

		document.addEventListener(releaseEvent, onRelease);

		hideEvents.forEach(name => {
			document.addEventListener(name, onRelease, { passive: true });
		});
	};

	const onMouseDown = function (e) {
		// Trigger on left click only
		if (e.button === 0) {
			startRipple(e.type, e);
		}
	};

	const onTouchStart = function (e) {
		if (e.changedTouches) {
			for (let i = 0; i < e.changedTouches.length; ++i) {
				startRipple(e.type, e.changedTouches[i]);
			}
		}
	};

	function instance($$self, $$props, $$invalidate) {
		let { center = false } = $$props;
		let { circle = false } = $$props;
		let { color = "currentColor" } = $$props;
		let el;
		let trigEl;

		onMount(async () => {
			await tick();

			try {
				if (center) {
					$$invalidate(0, el.dataset.center = "true", el);
				}

				if (circle) {
					$$invalidate(0, el.dataset.circle = "true", el);
				}

				$$invalidate(0, el.dataset.color = color, el);
				trigEl = el.parentElement;
			} catch(err) {
				
			} // eslint-disable-line

			if (!trigEl) {
				console.error("Ripple: Trigger element not found.");
				return;
			}

			let style = window.getComputedStyle(trigEl);

			if (style.position.length === 0 || style.position === "static") {
				trigEl.style.position = "relative";
			}

			trigEl.addEventListener("touchstart", onTouchStart, { passive: true });
			trigEl.addEventListener("mousedown", onMouseDown, { passive: true });
		});

		onDestroy(() => {
			if (!trigEl) {
				return;
			}

			trigEl.removeEventListener("mousedown", onMouseDown);
			trigEl.removeEventListener("touchstart", onTouchStart);
		});

		const writable_props = ["center", "circle", "color"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Ripple> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Ripple", $$slots, []);

		function div_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				el = $$value;
				$$invalidate(0, el);
			});
		}

		$$self.$set = $$props => {
			if ("center" in $$props) $$invalidate(1, center = $$props.center);
			if ("circle" in $$props) $$invalidate(2, circle = $$props.circle);
			if ("color" in $$props) $$invalidate(3, color = $$props.color);
		};

		$$self.$capture_state = () => ({
			isTouchEvent,
			transform,
			opacity,
			calculate,
			startRipple,
			onMouseDown,
			onTouchStart,
			center,
			circle,
			color,
			tick,
			onMount,
			onDestroy,
			el,
			trigEl
		});

		$$self.$inject_state = $$props => {
			if ("center" in $$props) $$invalidate(1, center = $$props.center);
			if ("circle" in $$props) $$invalidate(2, circle = $$props.circle);
			if ("color" in $$props) $$invalidate(3, color = $$props.color);
			if ("el" in $$props) $$invalidate(0, el = $$props.el);
			if ("trigEl" in $$props) trigEl = $$props.trigEl;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [el, center, circle, color, div_binding];
	}

	class Ripple extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, { center: 1, circle: 2, color: 3 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Ripple",
				options,
				id: create_fragment.name
			});
		}

		get center() {
			throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set center(value) {
			throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get circle() {
			throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set circle(value) {
			throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get color() {
			throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* F:\git14\svelte-leaflet\src\Button.svelte generated by Svelte v3.24.0 */
	const file$1 = "F:\\git14\\svelte-leaflet\\src\\Button.svelte";

	// (20:1) {#if ripple}
	function create_if_block(ctx) {
		let ripple_1;
		let current;

		ripple_1 = new Ripple({
				props: {
					center: /*icon*/ ctx[3],
					circle: /*icon*/ ctx[3]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(ripple_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(ripple_1, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const ripple_1_changes = {};
				if (dirty & /*icon*/ 8) ripple_1_changes.center = /*icon*/ ctx[3];
				if (dirty & /*icon*/ 8) ripple_1_changes.circle = /*icon*/ ctx[3];
				ripple_1.$set(ripple_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(ripple_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(ripple_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(ripple_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(20:1) {#if ripple}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let button;
		let t;
		let events_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*$$slots*/ ctx[19].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
		let if_block = /*ripple*/ ctx[10] && create_if_block(ctx);

		let button_levels = [
			{ class: /*className*/ ctx[1] },
			{ style: /*style*/ ctx[2] },
			/*attrs*/ ctx[14]
		];

		let button_data = {};

		for (let i = 0; i < button_levels.length; i += 1) {
			button_data = assign(button_data, button_levels[i]);
		}

		const block = {
			c: function create() {
				button = element("button");
				if (default_slot) default_slot.c();
				t = space();
				if (if_block) if_block.c();
				set_attributes(button, button_data);
				toggle_class(button, "toggle", /*toggle*/ ctx[11]);
				toggle_class(button, "outlined", /*outlined*/ ctx[8] && !(/*raised*/ ctx[6] || /*unelevated*/ ctx[7]));
				toggle_class(button, "shaped", /*shaped*/ ctx[9] && !/*icon*/ ctx[3]);
				toggle_class(button, "dense", /*dense*/ ctx[5]);
				toggle_class(button, "fab", /*fab*/ ctx[4] && /*icon*/ ctx[3]);
				toggle_class(button, "icon-button", /*icon*/ ctx[3]);
				toggle_class(button, "raised", /*raised*/ ctx[6]);
				toggle_class(button, "active", /*toggle*/ ctx[11] && /*active*/ ctx[0]);
				toggle_class(button, "full-width", /*fullWidth*/ ctx[12] && !/*icon*/ ctx[3]);
				toggle_class(button, "svelte-1sidyst", true);
				add_location(button, file$1, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);

				if (default_slot) {
					default_slot.m(button, null);
				}

				append_dev(button, t);
				if (if_block) if_block.m(button, null);
				/*button_binding*/ ctx[20](button);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(button, "click", /*onclick*/ ctx[16], false, false, false),
						action_destroyer(events_action = /*events*/ ctx[15].call(null, button))
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 262144) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
					}
				}

				if (/*ripple*/ ctx[10]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*ripple*/ 1024) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(button, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				set_attributes(button, button_data = get_spread_update(button_levels, [
					(!current || dirty & /*className*/ 2) && { class: /*className*/ ctx[1] },
					(!current || dirty & /*style*/ 4) && { style: /*style*/ ctx[2] },
					dirty & /*attrs*/ 16384 && /*attrs*/ ctx[14]
				]));

				toggle_class(button, "toggle", /*toggle*/ ctx[11]);
				toggle_class(button, "outlined", /*outlined*/ ctx[8] && !(/*raised*/ ctx[6] || /*unelevated*/ ctx[7]));
				toggle_class(button, "shaped", /*shaped*/ ctx[9] && !/*icon*/ ctx[3]);
				toggle_class(button, "dense", /*dense*/ ctx[5]);
				toggle_class(button, "fab", /*fab*/ ctx[4] && /*icon*/ ctx[3]);
				toggle_class(button, "icon-button", /*icon*/ ctx[3]);
				toggle_class(button, "raised", /*raised*/ ctx[6]);
				toggle_class(button, "active", /*toggle*/ ctx[11] && /*active*/ ctx[0]);
				toggle_class(button, "full-width", /*fullWidth*/ ctx[12] && !/*icon*/ ctx[3]);
				toggle_class(button, "svelte-1sidyst", true);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(button);
				if (default_slot) default_slot.d(detaching);
				if (if_block) if_block.d();
				/*button_binding*/ ctx[20](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		const dispatch = createEventDispatcher();
		const events = getEventsAction(current_component);
		let { class: className = "" } = $$props;
		let { style = null } = $$props;
		let { icon = false } = $$props;
		let { fab = false } = $$props;
		let { dense = false } = $$props;
		let { raised = false } = $$props;
		let { unelevated = false } = $$props;
		let { outlined = false } = $$props;
		let { shaped = false } = $$props;
		let { color = null } = $$props;
		let { ripple = true } = $$props;
		let { toggle = false } = $$props;
		let { active = false } = $$props;
		let { fullWidth = false } = $$props;
		let elm;
		let attrs = {};

		beforeUpdate(() => {
			if (!elm) return;
			let svgs = elm.getElementsByTagName("svg");
			let len = svgs.length;

			for (let i = 0; i < len; i++) {
				svgs[i].setAttribute("width", iconSize + (toggle && !icon ? 2 : 0));
				svgs[i].setAttribute("height", iconSize + (toggle && !icon ? 2 : 0));
			}

			$$invalidate(
				13,
				elm.style.color = raised || unelevated
				? luminance(color) > 0.5 ? "#000" : "#fff"
				: color,
				elm
			);

			$$invalidate(13, elm.style.backgroundColor = raised || unelevated ? color : "transparent", elm);
		});

		function onclick(e) {
			if (toggle) {
				$$invalidate(0, active = !active);
				dispatch("change", active);
			}
		}

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Button", $$slots, ['default']);

		function button_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				elm = $$value;
				$$invalidate(13, elm);
			});
		}

		$$self.$set = $$new_props => {
			$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
			if ("style" in $$new_props) $$invalidate(2, style = $$new_props.style);
			if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
			if ("fab" in $$new_props) $$invalidate(4, fab = $$new_props.fab);
			if ("dense" in $$new_props) $$invalidate(5, dense = $$new_props.dense);
			if ("raised" in $$new_props) $$invalidate(6, raised = $$new_props.raised);
			if ("unelevated" in $$new_props) $$invalidate(7, unelevated = $$new_props.unelevated);
			if ("outlined" in $$new_props) $$invalidate(8, outlined = $$new_props.outlined);
			if ("shaped" in $$new_props) $$invalidate(9, shaped = $$new_props.shaped);
			if ("color" in $$new_props) $$invalidate(17, color = $$new_props.color);
			if ("ripple" in $$new_props) $$invalidate(10, ripple = $$new_props.ripple);
			if ("toggle" in $$new_props) $$invalidate(11, toggle = $$new_props.toggle);
			if ("active" in $$new_props) $$invalidate(0, active = $$new_props.active);
			if ("fullWidth" in $$new_props) $$invalidate(12, fullWidth = $$new_props.fullWidth);
			if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			beforeUpdate,
			createEventDispatcher,
			current_component,
			getEventsAction,
			islegacy,
			luminance,
			Ripple,
			dispatch,
			events,
			className,
			style,
			icon,
			fab,
			dense,
			raised,
			unelevated,
			outlined,
			shaped,
			color,
			ripple,
			toggle,
			active,
			fullWidth,
			elm,
			attrs,
			onclick,
			iconSize
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
			if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
			if ("style" in $$props) $$invalidate(2, style = $$new_props.style);
			if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
			if ("fab" in $$props) $$invalidate(4, fab = $$new_props.fab);
			if ("dense" in $$props) $$invalidate(5, dense = $$new_props.dense);
			if ("raised" in $$props) $$invalidate(6, raised = $$new_props.raised);
			if ("unelevated" in $$props) $$invalidate(7, unelevated = $$new_props.unelevated);
			if ("outlined" in $$props) $$invalidate(8, outlined = $$new_props.outlined);
			if ("shaped" in $$props) $$invalidate(9, shaped = $$new_props.shaped);
			if ("color" in $$props) $$invalidate(17, color = $$new_props.color);
			if ("ripple" in $$props) $$invalidate(10, ripple = $$new_props.ripple);
			if ("toggle" in $$props) $$invalidate(11, toggle = $$new_props.toggle);
			if ("active" in $$props) $$invalidate(0, active = $$new_props.active);
			if ("fullWidth" in $$props) $$invalidate(12, fullWidth = $$new_props.fullWidth);
			if ("elm" in $$props) $$invalidate(13, elm = $$new_props.elm);
			if ("attrs" in $$props) $$invalidate(14, attrs = $$new_props.attrs);
			if ("iconSize" in $$props) iconSize = $$new_props.iconSize;
		};

		let iconSize;

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			 {
				/* eslint-disable no-unused-vars */
				const { style, icon, fab, dense, raised, unelevated, outlined, shaped, color, ripple, toggle, active, fullWidth, ...other } = $$props;

				!other.disabled && delete other.disabled;
				delete other.class;
				$$invalidate(14, attrs = other);
			}

			if ($$self.$$.dirty & /*icon, fab, dense*/ 56) {
				 iconSize = icon ? fab ? 24 : dense ? 20 : 24 : dense ? 16 : 18;
			}

			if ($$self.$$.dirty & /*color, elm*/ 139264) {
				 if (color === "primary") {
					$$invalidate(17, color = islegacy() ? "#1976d2" : "var(--primary, #1976d2)");
				} else if (color == "accent") {
					$$invalidate(17, color = islegacy() ? "#f50057" : "var(--accent, #f50057)");
				} else if (!color && elm) {
					$$invalidate(17, color = elm.style.color || elm.parentElement.style.color || (islegacy() ? "#333" : "var(--color, #333)"));
				}
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			active,
			className,
			style,
			icon,
			fab,
			dense,
			raised,
			unelevated,
			outlined,
			shaped,
			ripple,
			toggle,
			fullWidth,
			elm,
			attrs,
			events,
			onclick,
			color,
			$$scope,
			$$slots,
			button_binding
		];
	}

	class Button extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$1, create_fragment$1, safe_not_equal, {
				class: 1,
				style: 2,
				icon: 3,
				fab: 4,
				dense: 5,
				raised: 6,
				unelevated: 7,
				outlined: 8,
				shaped: 9,
				color: 17,
				ripple: 10,
				toggle: 11,
				active: 0,
				fullWidth: 12
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Button",
				options,
				id: create_fragment$1.name
			});
		}

		get class() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get style() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set style(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get icon() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set icon(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fab() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fab(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get dense() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set dense(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get raised() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set raised(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get unelevated() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set unelevated(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get outlined() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set outlined(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get shaped() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set shaped(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get color() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get ripple() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set ripple(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get toggle() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set toggle(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get active() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set active(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fullWidth() {
			throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fullWidth(value) {
			throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* F:\git14\svelte-leaflet\src\Icon.svelte generated by Svelte v3.24.0 */
	const file$2 = "F:\\git14\\svelte-leaflet\\src\\Icon.svelte";

	// (16:1) {:else}
	function create_else_block(ctx) {
		let current;
		const default_slot_template = /*$$slots*/ ctx[12].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 2048) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(16:1) {:else}",
			ctx
		});

		return block;
	}

	// (12:1) {#if typeof path === 'string'}
	function create_if_block$1(ctx) {
		let svg;
		let path_1;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path_1 = svg_element("path");
				attr_dev(path_1, "d", /*path*/ ctx[1]);
				add_location(path_1, file$2, 13, 3, 312);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "viewBox", /*viewBox*/ ctx[2]);
				attr_dev(svg, "class", "svelte-h2unzw");
				add_location(svg, file$2, 12, 2, 258);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path_1);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*path*/ 2) {
					attr_dev(path_1, "d", /*path*/ ctx[1]);
				}

				if (dirty & /*viewBox*/ 4) {
					attr_dev(svg, "viewBox", /*viewBox*/ ctx[2]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(svg);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(12:1) {#if typeof path === 'string'}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let em;
		let current_block_type_index;
		let if_block;
		let em_class_value;
		let events_action;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block$1, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (typeof /*path*/ ctx[1] === "string") return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		let em_levels = [
			{
				class: em_class_value = "icon " + /*className*/ ctx[0]
			},
			/*attrs*/ ctx[7]
		];

		let em_data = {};

		for (let i = 0; i < em_levels.length; i += 1) {
			em_data = assign(em_data, em_levels[i]);
		}

		const block = {
			c: function create() {
				em = element("em");
				if_block.c();
				set_attributes(em, em_data);
				toggle_class(em, "flip", /*flip*/ ctx[3] && typeof /*flip*/ ctx[3] === "boolean");
				toggle_class(em, "flip-h", /*flip*/ ctx[3] === "h");
				toggle_class(em, "flip-v", /*flip*/ ctx[3] === "v");
				toggle_class(em, "spin", /*spin*/ ctx[4]);
				toggle_class(em, "pulse", /*pulse*/ ctx[5] && !/*spin*/ ctx[4]);
				toggle_class(em, "svelte-h2unzw", true);
				add_location(em, file$2, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, em, anchor);
				if_blocks[current_block_type_index].m(em, null);
				/*em_binding*/ ctx[13](em);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(events_action = /*events*/ ctx[8].call(null, em));
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(em, null);
				}

				set_attributes(em, em_data = get_spread_update(em_levels, [
					(!current || dirty & /*className*/ 1 && em_class_value !== (em_class_value = "icon " + /*className*/ ctx[0])) && { class: em_class_value },
					dirty & /*attrs*/ 128 && /*attrs*/ ctx[7]
				]));

				toggle_class(em, "flip", /*flip*/ ctx[3] && typeof /*flip*/ ctx[3] === "boolean");
				toggle_class(em, "flip-h", /*flip*/ ctx[3] === "h");
				toggle_class(em, "flip-v", /*flip*/ ctx[3] === "v");
				toggle_class(em, "spin", /*spin*/ ctx[4]);
				toggle_class(em, "pulse", /*pulse*/ ctx[5] && !/*spin*/ ctx[4]);
				toggle_class(em, "svelte-h2unzw", true);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(em);
				if_blocks[current_block_type_index].d();
				/*em_binding*/ ctx[13](null);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		const events = getEventsAction(current_component);
		let { class: className = "" } = $$props;
		let { path = null } = $$props;
		let { size = 24 } = $$props;
		let { viewBox = "0 0 24 24" } = $$props;
		let { color = "currentColor" } = $$props;
		let { flip = false } = $$props;
		let { spin = false } = $$props;
		let { pulse = false } = $$props;
		let elm;
		let attrs = {};

		beforeUpdate(() => {
			if (elm) {
				elm.firstChild.setAttribute("width", size);
				elm.firstChild.setAttribute("height", size);
				color && elm.firstChild.setAttribute("fill", color);
			}
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Icon", $$slots, ['default']);

		function em_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				elm = $$value;
				$$invalidate(6, elm);
			});
		}

		$$self.$set = $$new_props => {
			$$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
			if ("path" in $$new_props) $$invalidate(1, path = $$new_props.path);
			if ("size" in $$new_props) $$invalidate(9, size = $$new_props.size);
			if ("viewBox" in $$new_props) $$invalidate(2, viewBox = $$new_props.viewBox);
			if ("color" in $$new_props) $$invalidate(10, color = $$new_props.color);
			if ("flip" in $$new_props) $$invalidate(3, flip = $$new_props.flip);
			if ("spin" in $$new_props) $$invalidate(4, spin = $$new_props.spin);
			if ("pulse" in $$new_props) $$invalidate(5, pulse = $$new_props.pulse);
			if ("$$scope" in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			beforeUpdate,
			current_component,
			getEventsAction,
			events,
			className,
			path,
			size,
			viewBox,
			color,
			flip,
			spin,
			pulse,
			elm,
			attrs
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(14, $$props = assign(assign({}, $$props), $$new_props));
			if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
			if ("path" in $$props) $$invalidate(1, path = $$new_props.path);
			if ("size" in $$props) $$invalidate(9, size = $$new_props.size);
			if ("viewBox" in $$props) $$invalidate(2, viewBox = $$new_props.viewBox);
			if ("color" in $$props) $$invalidate(10, color = $$new_props.color);
			if ("flip" in $$props) $$invalidate(3, flip = $$new_props.flip);
			if ("spin" in $$props) $$invalidate(4, spin = $$new_props.spin);
			if ("pulse" in $$props) $$invalidate(5, pulse = $$new_props.pulse);
			if ("elm" in $$props) $$invalidate(6, elm = $$new_props.elm);
			if ("attrs" in $$props) $$invalidate(7, attrs = $$new_props.attrs);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			 {
				/* eslint-disable no-unused-vars */
				const { path, size, viewBox, color, flip, spin, pulse, ...other } = $$props;

				delete other.class;
				$$invalidate(7, attrs = other);
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			className,
			path,
			viewBox,
			flip,
			spin,
			pulse,
			elm,
			attrs,
			events,
			size,
			color,
			$$scope,
			$$slots,
			em_binding
		];
	}

	class Icon extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$2, create_fragment$2, safe_not_equal, {
				class: 0,
				path: 1,
				size: 9,
				viewBox: 2,
				color: 10,
				flip: 3,
				spin: 4,
				pulse: 5
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Icon",
				options,
				id: create_fragment$2.name
			});
		}

		get class() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get path() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set path(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get size() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set size(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get viewBox() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set viewBox(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get color() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get flip() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set flip(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get spin() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set spin(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get pulse() {
			throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set pulse(value) {
			throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* F:\git14\svelte-leaflet\src\Textfield.svelte generated by Svelte v3.24.0 */
	const file$3 = "F:\\git14\\svelte-leaflet\\src\\Textfield.svelte";

	// (14:2) {#if required && !value.length}
	function create_if_block_2(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "*";
				attr_dev(span, "class", "required svelte-1dzu4e7");
				add_location(span, file$3, 14, 3, 307);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(span);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(14:2) {#if required && !value.length}",
			ctx
		});

		return block;
	}

	// (18:1) {#if !outlined || filled}
	function create_if_block_1(ctx) {
		let div0;
		let t;
		let div1;

		const block = {
			c: function create() {
				div0 = element("div");
				t = space();
				div1 = element("div");
				attr_dev(div0, "class", "input-line svelte-1dzu4e7");
				add_location(div0, file$3, 18, 2, 384);
				attr_dev(div1, "class", "focus-line svelte-1dzu4e7");
				add_location(div1, file$3, 19, 2, 413);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				insert_dev(target, t, anchor);
				insert_dev(target, div1, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
				if (detaching) detach_dev(t);
				if (detaching) detach_dev(div1);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(18:1) {#if !outlined || filled}",
			ctx
		});

		return block;
	}

	// (23:1) {#if !!message || !!error}
	function create_if_block$2(ctx) {
		let div1;
		let div0;
		let t_value = (/*error*/ ctx[11] || /*message*/ ctx[10]) + "";
		let t;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				t = text(t_value);
				attr_dev(div0, "class", "message");
				add_location(div0, file$3, 24, 3, 543);
				attr_dev(div1, "class", "help svelte-1dzu4e7");
				toggle_class(div1, "persist", /*messagePersist*/ ctx[9]);
				toggle_class(div1, "error", /*error*/ ctx[11]);
				add_location(div1, file$3, 23, 2, 478);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*error, message*/ 3072 && t_value !== (t_value = (/*error*/ ctx[11] || /*message*/ ctx[10]) + "")) set_data_dev(t, t_value);

				if (dirty & /*messagePersist*/ 512) {
					toggle_class(div1, "persist", /*messagePersist*/ ctx[9]);
				}

				if (dirty & /*error*/ 2048) {
					toggle_class(div1, "error", /*error*/ ctx[11]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div1);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(23:1) {#if !!message || !!error}",
			ctx
		});

		return block;
	}

	function create_fragment$3(ctx) {
		let div2;
		let input;
		let events_action;
		let t0;
		let div0;
		let t1;
		let div1;
		let t2;
		let t3;
		let t4;
		let t5;
		let div2_class_value;
		let mounted;
		let dispose;
		let input_levels = [{ class: "input" }, /*attrs*/ ctx[12]];
		let input_data = {};

		for (let i = 0; i < input_levels.length; i += 1) {
			input_data = assign(input_data, input_levels[i]);
		}

		let if_block0 = /*required*/ ctx[2] && !/*value*/ ctx[0].length && create_if_block_2(ctx);
		let if_block1 = (!/*outlined*/ ctx[7] || /*filled*/ ctx[8]) && create_if_block_1(ctx);
		let if_block2 = (!!/*message*/ ctx[10] || !!/*error*/ ctx[11]) && create_if_block$2(ctx);

		const block = {
			c: function create() {
				div2 = element("div");
				input = element("input");
				t0 = space();
				div0 = element("div");
				t1 = space();
				div1 = element("div");
				t2 = text(/*label*/ ctx[6]);
				t3 = space();
				if (if_block0) if_block0.c();
				t4 = space();
				if (if_block1) if_block1.c();
				t5 = space();
				if (if_block2) if_block2.c();
				set_attributes(input, input_data);
				toggle_class(input, "svelte-1dzu4e7", true);
				add_location(input, file$3, 8, 1, 153);
				attr_dev(div0, "class", "focus-ring svelte-1dzu4e7");
				add_location(div0, file$3, 10, 1, 212);
				attr_dev(div1, "class", "label svelte-1dzu4e7");
				add_location(div1, file$3, 11, 1, 240);

				attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(`text-field ${/*outlined*/ ctx[7] && !/*filled*/ ctx[8]
			? "outlined"
			: "baseline"} ${/*className*/ ctx[3]}`) + " svelte-1dzu4e7"));

				attr_dev(div2, "style", /*style*/ ctx[4]);
				attr_dev(div2, "title", /*title*/ ctx[5]);
				toggle_class(div2, "filled", /*filled*/ ctx[8]);
				toggle_class(div2, "dirty", /*dirty*/ ctx[13]);
				toggle_class(div2, "disabled", /*disabled*/ ctx[1]);
				add_location(div2, file$3, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, input);
				set_input_value(input, /*value*/ ctx[0]);
				append_dev(div2, t0);
				append_dev(div2, div0);
				append_dev(div2, t1);
				append_dev(div2, div1);
				append_dev(div1, t2);
				append_dev(div1, t3);
				if (if_block0) if_block0.m(div1, null);
				append_dev(div2, t4);
				if (if_block1) if_block1.m(div2, null);
				append_dev(div2, t5);
				if (if_block2) if_block2.m(div2, null);

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*input_input_handler*/ ctx[15]),
						action_destroyer(events_action = /*events*/ ctx[14].call(null, input))
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				set_attributes(input, input_data = get_spread_update(input_levels, [{ class: "input" }, dirty & /*attrs*/ 4096 && /*attrs*/ ctx[12]]));

				if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
					set_input_value(input, /*value*/ ctx[0]);
				}

				toggle_class(input, "svelte-1dzu4e7", true);
				if (dirty & /*label*/ 64) set_data_dev(t2, /*label*/ ctx[6]);

				if (/*required*/ ctx[2] && !/*value*/ ctx[0].length) {
					if (if_block0) ; else {
						if_block0 = create_if_block_2(ctx);
						if_block0.c();
						if_block0.m(div1, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (!/*outlined*/ ctx[7] || /*filled*/ ctx[8]) {
					if (if_block1) ; else {
						if_block1 = create_if_block_1(ctx);
						if_block1.c();
						if_block1.m(div2, t5);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!!/*message*/ ctx[10] || !!/*error*/ ctx[11]) {
					if (if_block2) {
						if_block2.p(ctx, dirty);
					} else {
						if_block2 = create_if_block$2(ctx);
						if_block2.c();
						if_block2.m(div2, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (dirty & /*outlined, filled, className*/ 392 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`text-field ${/*outlined*/ ctx[7] && !/*filled*/ ctx[8]
			? "outlined"
			: "baseline"} ${/*className*/ ctx[3]}`) + " svelte-1dzu4e7"))) {
					attr_dev(div2, "class", div2_class_value);
				}

				if (dirty & /*style*/ 16) {
					attr_dev(div2, "style", /*style*/ ctx[4]);
				}

				if (dirty & /*title*/ 32) {
					attr_dev(div2, "title", /*title*/ ctx[5]);
				}

				if (dirty & /*outlined, filled, className, filled*/ 392) {
					toggle_class(div2, "filled", /*filled*/ ctx[8]);
				}

				if (dirty & /*outlined, filled, className, dirty*/ 8584) {
					toggle_class(div2, "dirty", /*dirty*/ ctx[13]);
				}

				if (dirty & /*outlined, filled, className, disabled*/ 394) {
					toggle_class(div2, "disabled", /*disabled*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div2);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		const events = getEventsAction(current_component);
		let { value = "" } = $$props;
		let { disabled = false } = $$props;
		let { required = false } = $$props;
		let { class: className = "" } = $$props;
		let { style = null } = $$props;
		let { title = null } = $$props;
		let { label = "" } = $$props;
		let { outlined = false } = $$props;
		let { filled = false } = $$props;
		let { messagePersist = false } = $$props;
		let { message = "" } = $$props;
		let { error = "" } = $$props;
		let placeholder;
		let attrs = {};

		const allowedTypes = [
			"date",
			"datetime-local",
			"email",
			"month",
			"number",
			"password",
			"search",
			"tel",
			"text",
			"time",
			"url",
			"week"
		];

		const dirtyTypes = ["date", "datetime-local", "month", "time", "week"];
		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Textfield", $$slots, []);

		function input_input_handler() {
			value = this.value;
			$$invalidate(0, value);
		}

		$$self.$set = $$new_props => {
			$$invalidate(19, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
			if ("disabled" in $$new_props) $$invalidate(1, disabled = $$new_props.disabled);
			if ("required" in $$new_props) $$invalidate(2, required = $$new_props.required);
			if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
			if ("style" in $$new_props) $$invalidate(4, style = $$new_props.style);
			if ("title" in $$new_props) $$invalidate(5, title = $$new_props.title);
			if ("label" in $$new_props) $$invalidate(6, label = $$new_props.label);
			if ("outlined" in $$new_props) $$invalidate(7, outlined = $$new_props.outlined);
			if ("filled" in $$new_props) $$invalidate(8, filled = $$new_props.filled);
			if ("messagePersist" in $$new_props) $$invalidate(9, messagePersist = $$new_props.messagePersist);
			if ("message" in $$new_props) $$invalidate(10, message = $$new_props.message);
			if ("error" in $$new_props) $$invalidate(11, error = $$new_props.error);
		};

		$$self.$capture_state = () => ({
			current_component,
			getEventsAction,
			events,
			value,
			disabled,
			required,
			className,
			style,
			title,
			label,
			outlined,
			filled,
			messagePersist,
			message,
			error,
			placeholder,
			attrs,
			allowedTypes,
			dirtyTypes,
			dirty
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(19, $$props = assign(assign({}, $$props), $$new_props));
			if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
			if ("disabled" in $$props) $$invalidate(1, disabled = $$new_props.disabled);
			if ("required" in $$props) $$invalidate(2, required = $$new_props.required);
			if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
			if ("style" in $$props) $$invalidate(4, style = $$new_props.style);
			if ("title" in $$props) $$invalidate(5, title = $$new_props.title);
			if ("label" in $$props) $$invalidate(6, label = $$new_props.label);
			if ("outlined" in $$props) $$invalidate(7, outlined = $$new_props.outlined);
			if ("filled" in $$props) $$invalidate(8, filled = $$new_props.filled);
			if ("messagePersist" in $$props) $$invalidate(9, messagePersist = $$new_props.messagePersist);
			if ("message" in $$props) $$invalidate(10, message = $$new_props.message);
			if ("error" in $$props) $$invalidate(11, error = $$new_props.error);
			if ("placeholder" in $$props) $$invalidate(16, placeholder = $$new_props.placeholder);
			if ("attrs" in $$props) $$invalidate(12, attrs = $$new_props.attrs);
			if ("dirty" in $$props) $$invalidate(13, dirty = $$new_props.dirty);
		};

		let dirty;

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			 {
				/* eslint-disable no-unused-vars */
				const { value, style, title, label, outlined, filled, messagePersist, message, error, ...other } = $$props;

				!other.readonly && delete other.readonly;
				!other.disabled && delete other.disabled;
				delete other.class;

				other.type = allowedTypes.indexOf(other.type) < 0
				? "text"
				: other.type;

				$$invalidate(16, placeholder = other.placeholder);
				$$invalidate(12, attrs = other);
			}

			if ($$self.$$.dirty & /*value, placeholder, attrs*/ 69633) {
				 $$invalidate(13, dirty = typeof value === "string" && value.length > 0 || typeof value === "number" || placeholder || dirtyTypes.indexOf(attrs.type) >= 0);
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			value,
			disabled,
			required,
			className,
			style,
			title,
			label,
			outlined,
			filled,
			messagePersist,
			message,
			error,
			attrs,
			dirty,
			events,
			input_input_handler
		];
	}

	class Textfield extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$3, create_fragment$3, safe_not_equal, {
				value: 0,
				disabled: 1,
				required: 2,
				class: 3,
				style: 4,
				title: 5,
				label: 6,
				outlined: 7,
				filled: 8,
				messagePersist: 9,
				message: 10,
				error: 11
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Textfield",
				options,
				id: create_fragment$3.name
			});
		}

		get value() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set value(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get disabled() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set disabled(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get required() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set required(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get class() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get style() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set style(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get title() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set title(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get label() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set label(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get outlined() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set outlined(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get filled() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set filled(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get messagePersist() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set messagePersist(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get message() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set message(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get error() {
			throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set error(value) {
			throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	function getFocusable(context = document) {
		const focusable = Array.prototype.slice
			.call(
				context.querySelectorAll(
					'button, [href], select, textarea, input:not([type="hidden"]), [tabindex]:not([tabindex="-1"])'
				)
			)
			.filter(function(item) {
				const style = window.getComputedStyle(item);

				return (
					!item.disabled &&
					!item.getAttribute('disabled') &&
					!item.classList.contains('disabled') &&
					style.display !== 'none' &&
					style.visibility !== 'hidden' &&
					style.opacity > 0
				);
			});

		return focusable;
	}

	function trapTabKey(e, context) {
		if (e.key !== 'Tab' && e.keyCode !== 9) {
			return;
		}

		let focusableItems = getFocusable(context);

		if (focusableItems.length === 0) {
			e.preventDefault();
			return;
		}

		let focusedItem = document.activeElement;

		let focusedItemIndex = focusableItems.indexOf(focusedItem);

		if (e.shiftKey) {
			if (focusedItemIndex <= 0) {
				focusableItems[focusableItems.length - 1].focus();
				e.preventDefault();
			}
		} else {
			if (focusedItemIndex >= focusableItems.length - 1) {
				focusableItems[0].focus();
				e.preventDefault();
			}
		}
	}

	/* F:\git14\svelte-leaflet\src\Popover.svelte generated by Svelte v3.24.0 */

	const { window: window_1 } = globals;
	const file$4 = "F:\\git14\\svelte-leaflet\\src\\Popover.svelte";

	// (8:0) {#if visible}
	function create_if_block$3(ctx) {
		let div;
		let div_class_value;
		let events_action;
		let div_intro;
		let div_outro;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*$$slots*/ ctx[17].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

		const block = {
			c: function create() {
				div = element("div");
				if (default_slot) default_slot.c();
				attr_dev(div, "class", div_class_value = "" + (null_to_empty("popover " + /*className*/ ctx[1]) + " svelte-5k22n0"));
				attr_dev(div, "style", /*style*/ ctx[2]);
				attr_dev(div, "tabindex", "-1");
				add_location(div, file$4, 8, 1, 145);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				/*div_binding*/ ctx[20](div);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(div, "introstart", /*introstart_handler*/ ctx[18], false, false, false),
						listen_dev(div, "introend", /*introend_handler*/ ctx[19], false, false, false),
						action_destroyer(events_action = /*events*/ ctx[4].call(null, div))
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 65536) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[16], dirty, null, null);
					}
				}

				if (!current || dirty & /*className*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty("popover " + /*className*/ ctx[1]) + " svelte-5k22n0"))) {
					attr_dev(div, "class", div_class_value);
				}

				if (!current || dirty & /*style*/ 4) {
					attr_dev(div, "style", /*style*/ ctx[2]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);

				add_render_callback(() => {
					if (div_outro) div_outro.end(1);
					if (!div_intro) div_intro = create_in_transition(div, /*popoverIn*/ ctx[5], {});
					div_intro.start();
				});

				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				if (div_intro) div_intro.invalidate();
				div_outro = create_out_transition(div, /*popoverOut*/ ctx[6], {});
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
				/*div_binding*/ ctx[20](null);
				if (detaching && div_outro) div_outro.end();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$3.name,
			type: "if",
			source: "(8:0) {#if visible}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let if_block_anchor;
		let current;
		let mounted;
		let dispose;
		let if_block = /*visible*/ ctx[0] && create_if_block$3(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(window_1, "scroll", /*onScroll*/ ctx[8], { passive: true }, false, false),
						listen_dev(window_1, "resize", /*onResize*/ ctx[9], { passive: true }, false, false),
						listen_dev(window_1, "keydown", /*onKeydown*/ ctx[10], false, false, false),
						listen_dev(window_1, "click", /*onclickOutside*/ ctx[11], false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*visible*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*visible*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$3(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	const MARGIN = 8;

	function iend({ target }) {
		target.style.transformOrigin = null;
		target.style.transitionDuration = null;
		target.style.transitionProperty = null;
		target.style.transform = null;

		// grab focus
		target.focus();
	}

	function instance$4($$self, $$props, $$invalidate) {
		const events = getEventsAction(current_component);
		const dispatch = createEventDispatcher();
		let { class: className = "" } = $$props;
		let { style = null } = $$props;
		let { origin = "top left" } = $$props;
		let { dx = 0 } = $$props;
		let { dy = 0 } = $$props;
		let { visible = false } = $$props;
		let { duration = 300 } = $$props;
		let popoverEl;
		let triggerEl;

		function popoverIn(target) {
			target.style.transformOrigin = origin;
			target.style.transform = "scale(0.6)";
			target.style.opacity = "0";
			return { duration: +duration };
		}

		function popoverOut(target) {
			target.style.transformOrigin = origin;
			target.style.transitionDuration = duration + "ms";
			target.style.transitionProperty = "opacity, transform";
			target.style.transform = "scale(0.6)";
			target.style.opacity = "0";
			return { duration: +duration };
		}

		async function istart({ target }) {
			setTimeout(
				() => {
					target.style.transitionDuration = duration + "ms";
					target.style.transitionProperty = "opacity, transform";
					target.style.transform = "scale(1)";
					target.style.opacity = null;
				},
				0
			);
		}

		function getLeftPosition(width, rc) {
			let left = 0;
			$$invalidate(12, dx = +dx);
			const maxLeft = window.innerWidth - MARGIN - width;
			const minLeft = MARGIN;

			left = origin.indexOf("left") >= 0
			? left = rc.left + dx
			: left = rc.left + rc.width - width - dx;

			left = Math.min(maxLeft, left);
			left = Math.max(minLeft, left);
			return left;
		}

		function getTopPosition(height, rc) {
			let top = 0;
			$$invalidate(13, dy = +dy);
			const maxTop = window.innerHeight - MARGIN - height;
			const minTop = MARGIN;

			top = origin.indexOf("top") >= 0
			? top = rc.top + dy
			: top = rc.top + rc.height - height - dy;

			top = Math.min(maxTop, top);
			top = Math.max(minTop, top);
			return top;
		}

		function setStyle() {
			if (!visible || !popoverEl || !triggerEl) return;
			const rect = triggerEl.getBoundingClientRect();

			if (rect.top < -rect.height || rect.top > window.innerHeight) {
				close("overflow");
				return;
			}

			$$invalidate(3, popoverEl.style.top = getTopPosition(popoverEl.offsetHeight, rect) + "px", popoverEl);
			$$invalidate(3, popoverEl.style.left = getLeftPosition(popoverEl.offsetWidth, rect) + "px", popoverEl);
		}

		beforeUpdate(() => {
			triggerEl = popoverEl ? popoverEl.parentElement : null;
			triggerEl && setStyle();
		});

		function close(params) {
			dispatch("close", params);
			$$invalidate(0, visible = false);
		}

		// window event handlers
		function onScroll() {
			setStyle();
		}

		function onResize() {
			setStyle();
		}

		function onKeydown(e) {
			if (visible) {
				if (e.keyCode === 27) {
					close("escape");
				}

				trapTabKey(e, popoverEl);
			}
		}

		function onclickOutside(e) {
			if (visible && triggerEl && !triggerEl.contains(e.target)) {
				close("clickOutside");
			}
		}

		const writable_props = ["class", "style", "origin", "dx", "dy", "visible", "duration"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Popover> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Popover", $$slots, ['default']);
		const introstart_handler = e => istart(e);
		const introend_handler = e => iend(e);

		function div_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				popoverEl = $$value;
				$$invalidate(3, popoverEl);
			});
		}

		$$self.$set = $$props => {
			if ("class" in $$props) $$invalidate(1, className = $$props.class);
			if ("style" in $$props) $$invalidate(2, style = $$props.style);
			if ("origin" in $$props) $$invalidate(14, origin = $$props.origin);
			if ("dx" in $$props) $$invalidate(12, dx = $$props.dx);
			if ("dy" in $$props) $$invalidate(13, dy = $$props.dy);
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("duration" in $$props) $$invalidate(15, duration = $$props.duration);
			if ("$$scope" in $$props) $$invalidate(16, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			current_component,
			beforeUpdate,
			createEventDispatcher,
			getEventsAction,
			trapTabKey,
			events,
			dispatch,
			className,
			style,
			origin,
			dx,
			dy,
			visible,
			duration,
			popoverEl,
			triggerEl,
			MARGIN,
			popoverIn,
			popoverOut,
			istart,
			iend,
			getLeftPosition,
			getTopPosition,
			setStyle,
			close,
			onScroll,
			onResize,
			onKeydown,
			onclickOutside
		});

		$$self.$inject_state = $$props => {
			if ("className" in $$props) $$invalidate(1, className = $$props.className);
			if ("style" in $$props) $$invalidate(2, style = $$props.style);
			if ("origin" in $$props) $$invalidate(14, origin = $$props.origin);
			if ("dx" in $$props) $$invalidate(12, dx = $$props.dx);
			if ("dy" in $$props) $$invalidate(13, dy = $$props.dy);
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("duration" in $$props) $$invalidate(15, duration = $$props.duration);
			if ("popoverEl" in $$props) $$invalidate(3, popoverEl = $$props.popoverEl);
			if ("triggerEl" in $$props) triggerEl = $$props.triggerEl;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			visible,
			className,
			style,
			popoverEl,
			events,
			popoverIn,
			popoverOut,
			istart,
			onScroll,
			onResize,
			onKeydown,
			onclickOutside,
			dx,
			dy,
			origin,
			duration,
			$$scope,
			$$slots,
			introstart_handler,
			introend_handler,
			div_binding
		];
	}

	class Popover extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$4, create_fragment$4, safe_not_equal, {
				class: 1,
				style: 2,
				origin: 14,
				dx: 12,
				dy: 13,
				visible: 0,
				duration: 15
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Popover",
				options,
				id: create_fragment$4.name
			});
		}

		get class() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get style() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set style(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get origin() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set origin(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get dx() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set dx(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get dy() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set dy(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get visible() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set visible(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get duration() {
			throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set duration(value) {
			throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	function enableScroll(enable) {
		let isHidden = document.body.style.overflow === 'hidden';

		if (enable && isHidden) {
			let top = Math.abs(parseInt(document.body.style.top));

			document.body.style.cssText = null;
			document.body.removeAttribute('style');
			window.scrollTo(0, top);
		} else if (!enable && !isHidden) {
			document.body.style.top =
				'-' +
				Math.max(
					document.body.scrollTop,
					(document.documentElement && document.documentElement.scrollTop) || 0
				) +
				'px';
			document.body.style.position = 'fixed';
			document.body.style.width = '100%';
			document.body.style.overflow = 'hidden';
		}
	}

	/* F:\git14\svelte-leaflet\src\Dialog.svelte generated by Svelte v3.24.0 */
	const file$5 = "F:\\git14\\svelte-leaflet\\src\\Dialog.svelte";
	const get_footer_slot_changes = dirty => ({});
	const get_footer_slot_context = ctx => ({});
	const get_actions_slot_changes = dirty => ({});
	const get_actions_slot_context = ctx => ({});
	const get_title_slot_changes = dirty => ({});
	const get_title_slot_context = ctx => ({});

	// (3:0) {#if visible}
	function create_if_block$4(ctx) {
		let div3;
		let div2;
		let div0;
		let t0;
		let div1;
		let t1;
		let t2;
		let div2_class_value;
		let div2_style_value;
		let events_action;
		let div2_intro;
		let div3_transition;
		let current;
		let mounted;
		let dispose;
		const title_slot_template = /*$$slots*/ ctx[15].title;
		const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[14], get_title_slot_context);
		const default_slot_template = /*$$slots*/ ctx[15].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
		const actions_slot_template = /*$$slots*/ ctx[15].actions;
		const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[14], get_actions_slot_context);
		const footer_slot_template = /*$$slots*/ ctx[15].footer;
		const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[14], get_footer_slot_context);

		let div2_levels = [
			{
				class: div2_class_value = "dialog " + /*className*/ ctx[1]
			},
			{
				style: div2_style_value = `width: ${/*width*/ ctx[3]}px;${/*style*/ ctx[2]}`
			},
			{ tabindex: "-1" },
			/*attrs*/ ctx[6]
		];

		let div2_data = {};

		for (let i = 0; i < div2_levels.length; i += 1) {
			div2_data = assign(div2_data, div2_levels[i]);
		}

		const block = {
			c: function create() {
				div3 = element("div");
				div2 = element("div");
				div0 = element("div");
				if (title_slot) title_slot.c();
				t0 = space();
				div1 = element("div");
				if (default_slot) default_slot.c();
				t1 = space();
				if (actions_slot) actions_slot.c();
				t2 = space();
				if (footer_slot) footer_slot.c();
				attr_dev(div0, "class", "title svelte-88q7da");
				add_location(div0, file$5, 26, 3, 604);
				attr_dev(div1, "class", "content svelte-88q7da");
				add_location(div1, file$5, 30, 3, 664);
				set_attributes(div2, div2_data);
				toggle_class(div2, "svelte-88q7da", true);
				add_location(div2, file$5, 13, 2, 284);
				attr_dev(div3, "class", "overlay svelte-88q7da");
				add_location(div3, file$5, 3, 1, 78);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div3, anchor);
				append_dev(div3, div2);
				append_dev(div2, div0);

				if (title_slot) {
					title_slot.m(div0, null);
				}

				append_dev(div2, t0);
				append_dev(div2, div1);

				if (default_slot) {
					default_slot.m(div1, null);
				}

				append_dev(div2, t1);

				if (actions_slot) {
					actions_slot.m(div2, null);
				}

				append_dev(div2, t2);

				if (footer_slot) {
					footer_slot.m(div2, null);
				}

				/*div2_binding*/ ctx[17](div2);
				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(events_action = /*events*/ ctx[8].call(null, div2)),
						listen_dev(div2, "mousedown", stop_propagation(/*mousedown_handler*/ ctx[16]), false, false, true),
						listen_dev(div2, "mouseenter", /*mouseenter_handler*/ ctx[18], false, false, false),
						listen_dev(div3, "mousedown", /*mousedown_handler_1*/ ctx[19], false, false, false),
						listen_dev(div3, "mouseup", /*mouseup_handler*/ ctx[20], false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (title_slot) {
					if (title_slot.p && dirty & /*$$scope*/ 16384) {
						update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_title_slot_changes, get_title_slot_context);
					}
				}

				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 16384) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
					}
				}

				if (actions_slot) {
					if (actions_slot.p && dirty & /*$$scope*/ 16384) {
						update_slot(actions_slot, actions_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_actions_slot_changes, get_actions_slot_context);
					}
				}

				if (footer_slot) {
					if (footer_slot.p && dirty & /*$$scope*/ 16384) {
						update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_footer_slot_changes, get_footer_slot_context);
					}
				}

				set_attributes(div2, div2_data = get_spread_update(div2_levels, [
					(!current || dirty & /*className*/ 2 && div2_class_value !== (div2_class_value = "dialog " + /*className*/ ctx[1])) && { class: div2_class_value },
					(!current || dirty & /*width, style*/ 12 && div2_style_value !== (div2_style_value = `width: ${/*width*/ ctx[3]}px;${/*style*/ ctx[2]}`)) && { style: div2_style_value },
					{ tabindex: "-1" },
					dirty & /*attrs*/ 64 && /*attrs*/ ctx[6]
				]));

				toggle_class(div2, "svelte-88q7da", true);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(title_slot, local);
				transition_in(default_slot, local);
				transition_in(actions_slot, local);
				transition_in(footer_slot, local);

				if (!div2_intro) {
					add_render_callback(() => {
						div2_intro = create_in_transition(div2, scale, {
							duration: 180,
							opacity: 0.5,
							start: 0.75,
							easing: quintOut
						});

						div2_intro.start();
					});
				}

				add_render_callback(() => {
					if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 180 }, true);
					div3_transition.run(1);
				});

				current = true;
			},
			o: function outro(local) {
				transition_out(title_slot, local);
				transition_out(default_slot, local);
				transition_out(actions_slot, local);
				transition_out(footer_slot, local);
				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 180 }, false);
				div3_transition.run(0);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div3);
				if (title_slot) title_slot.d(detaching);
				if (default_slot) default_slot.d(detaching);
				if (actions_slot) actions_slot.d(detaching);
				if (footer_slot) footer_slot.d(detaching);
				/*div2_binding*/ ctx[17](null);
				if (detaching && div3_transition) div3_transition.end();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$4.name,
			type: "if",
			source: "(3:0) {#if visible}",
			ctx
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let if_block_anchor;
		let current;
		let mounted;
		let dispose;
		let if_block = /*visible*/ ctx[0] && create_if_block$4(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(window, "keydown", /*onKey*/ ctx[10], false, false, false),
						listen_dev(window, "popstate", /*onPopstate*/ ctx[11], false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*visible*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*visible*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$4(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props, $$invalidate) {
		const dispatch = createEventDispatcher();
		const events = getEventsAction(current_component);
		let { class: className = "" } = $$props;
		let { style = "" } = $$props;
		let { visible = false } = $$props;
		let { width = 320 } = $$props;
		let { modal = false } = $$props;
		let { closeByEsc = true } = $$props;
		let { beforeClose = () => true } = $$props;
		let mouseDownOutside = false;
		let attrs = {};
		let mounted = false;
		let elm;

		onMount(async () => {
			await tick();
			$$invalidate(21, mounted = true);
		});

		onDestroy(() => {
			mounted && enableScroll(true);
		});

		function close(params) {
			if (beforeClose()) {
				dispatch("close", params);
				$$invalidate(0, visible = false);
			}
		}

		async function onVisible() {
			await tick();
			let inputs = elm.querySelectorAll("input:not([type=\"hidden\"])");
			let length = inputs.length;
			let i = 0;

			for (; i < length; i++) {
				if (inputs[i].getAttribute("autofocus")) {
					break;
				}
			}

			i < length
			? inputs[i].focus()
			: length > 0 ? inputs[0].focus() : elm.focus();

			dispatch("open");
		}

		function onKey(e) {
			const esc = "Escape";

			if (e.keyCode === 27 || e.key === esc || e.code === esc) {
				closeByEsc && close(esc);
			}

			if (visible) {
				trapTabKey(e, elm);
			}
		}

		function onPopstate() {
			$$invalidate(0, visible = false);
		}

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Dialog", $$slots, ['title','default','actions','footer']);

		function mousedown_handler(event) {
			bubble($$self, event);
		}

		function div2_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				elm = $$value;
				$$invalidate(7, elm);
			});
		}

		const mouseenter_handler = () => {
			$$invalidate(5, mouseDownOutside = false);
		};

		const mousedown_handler_1 = () => {
			$$invalidate(5, mouseDownOutside = true);
		};

		const mouseup_handler = () => {
			mouseDownOutside && !modal && close("clickOutside");
		};

		$$self.$set = $$new_props => {
			$$invalidate(24, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
			if ("style" in $$new_props) $$invalidate(2, style = $$new_props.style);
			if ("visible" in $$new_props) $$invalidate(0, visible = $$new_props.visible);
			if ("width" in $$new_props) $$invalidate(3, width = $$new_props.width);
			if ("modal" in $$new_props) $$invalidate(4, modal = $$new_props.modal);
			if ("closeByEsc" in $$new_props) $$invalidate(12, closeByEsc = $$new_props.closeByEsc);
			if ("beforeClose" in $$new_props) $$invalidate(13, beforeClose = $$new_props.beforeClose);
			if ("$$scope" in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			tick,
			onMount,
			onDestroy,
			createEventDispatcher,
			fade,
			scale,
			quintOut,
			current_component,
			getEventsAction,
			trapTabKey,
			enableScroll,
			dispatch,
			events,
			className,
			style,
			visible,
			width,
			modal,
			closeByEsc,
			beforeClose,
			mouseDownOutside,
			attrs,
			mounted,
			elm,
			close,
			onVisible,
			onKey,
			onPopstate
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(24, $$props = assign(assign({}, $$props), $$new_props));
			if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
			if ("style" in $$props) $$invalidate(2, style = $$new_props.style);
			if ("visible" in $$props) $$invalidate(0, visible = $$new_props.visible);
			if ("width" in $$props) $$invalidate(3, width = $$new_props.width);
			if ("modal" in $$props) $$invalidate(4, modal = $$new_props.modal);
			if ("closeByEsc" in $$props) $$invalidate(12, closeByEsc = $$new_props.closeByEsc);
			if ("beforeClose" in $$props) $$invalidate(13, beforeClose = $$new_props.beforeClose);
			if ("mouseDownOutside" in $$props) $$invalidate(5, mouseDownOutside = $$new_props.mouseDownOutside);
			if ("attrs" in $$props) $$invalidate(6, attrs = $$new_props.attrs);
			if ("mounted" in $$props) $$invalidate(21, mounted = $$new_props.mounted);
			if ("elm" in $$props) $$invalidate(7, elm = $$new_props.elm);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			 {
				/* eslint-disable no-unused-vars */
				const { style, visible, width, modal, closeByEsc, beforeClose, ...other } = $$props;

				$$invalidate(6, attrs = other);
			}

			if ($$self.$$.dirty & /*visible, mounted*/ 2097153) {
				 if (visible) {
					mounted && enableScroll(false);
					onVisible();
				} else {
					$$invalidate(5, mouseDownOutside = false);
					mounted && enableScroll(true);
				}
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			visible,
			className,
			style,
			width,
			modal,
			mouseDownOutside,
			attrs,
			elm,
			events,
			close,
			onKey,
			onPopstate,
			closeByEsc,
			beforeClose,
			$$scope,
			$$slots,
			mousedown_handler,
			div2_binding,
			mouseenter_handler,
			mousedown_handler_1,
			mouseup_handler
		];
	}

	class Dialog extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$5, create_fragment$5, safe_not_equal, {
				class: 1,
				style: 2,
				visible: 0,
				width: 3,
				modal: 4,
				closeByEsc: 12,
				beforeClose: 13
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Dialog",
				options,
				id: create_fragment$5.name
			});
		}

		get class() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get style() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set style(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get visible() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set visible(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get width() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set width(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get modal() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set modal(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get closeByEsc() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set closeByEsc(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get beforeClose() {
			throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set beforeClose(value) {
			throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* F:\git14\svelte-leaflet\src\Menu.svelte generated by Svelte v3.24.0 */

	const { console: console_1$1 } = globals;
	const file$6 = "F:\\git14\\svelte-leaflet\\src\\Menu.svelte";
	const get_activator_slot_changes = dirty => ({});
	const get_activator_slot_context = ctx => ({});

	// (2:24)    
	function fallback_block(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				add_location(span, file$6, 2, 2, 104);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(span);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block.name,
			type: "fallback",
			source: "(2:24)    ",
			ctx
		});

		return block;
	}

	// (6:1) <Popover class={className} {style} {origin} {dx} {dy} bind:visible on:click={onPopoverClick}>
	function create_default_slot(ctx) {
		let ul;
		let ul_style_value;
		let current;
		const default_slot_template = /*$$slots*/ ctx[11].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

		const block = {
			c: function create() {
				ul = element("ul");
				if (default_slot) default_slot.c();
				attr_dev(ul, "style", ul_style_value = `min-width: ${/*width*/ ctx[5]}px`);
				attr_dev(ul, "class", "svelte-1vc5q8h");
				add_location(ul, file$6, 6, 2, 220);
			},
			m: function mount(target, anchor) {
				insert_dev(target, ul, anchor);

				if (default_slot) {
					default_slot.m(ul, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 16384) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
					}
				}

				if (!current || dirty & /*width*/ 32 && ul_style_value !== (ul_style_value = `min-width: ${/*width*/ ctx[5]}px`)) {
					attr_dev(ul, "style", ul_style_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(ul);
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot.name,
			type: "slot",
			source: "(6:1) <Popover class={className} {style} {origin} {dx} {dy} bind:visible on:click={onPopoverClick}>",
			ctx
		});

		return block;
	}

	function create_fragment$6(ctx) {
		let div;
		let t;
		let popover;
		let updating_visible;
		let events_action;
		let current;
		let mounted;
		let dispose;
		const activator_slot_template = /*$$slots*/ ctx[11].activator;
		const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[14], get_activator_slot_context);
		const activator_slot_or_fallback = activator_slot || fallback_block(ctx);

		function popover_visible_binding(value) {
			/*popover_visible_binding*/ ctx[12].call(null, value);
		}

		let popover_props = {
			class: /*className*/ ctx[0],
			style: /*style*/ ctx[1],
			origin: /*origin*/ ctx[4],
			dx: /*dx*/ ctx[2],
			dy: /*dy*/ ctx[3],
			$$slots: { default: [create_default_slot] },
			$$scope: { ctx }
		};

		if (/*visible*/ ctx[6] !== void 0) {
			popover_props.visible = /*visible*/ ctx[6];
		}

		popover = new Popover({ props: popover_props, $$inline: true });
		binding_callbacks.push(() => bind(popover, "visible", popover_visible_binding));
		popover.$on("click", /*onPopoverClick*/ ctx[10]);

		const block = {
			c: function create() {
				div = element("div");
				if (activator_slot_or_fallback) activator_slot_or_fallback.c();
				t = space();
				create_component(popover.$$.fragment);
				attr_dev(div, "class", "menu svelte-1vc5q8h");
				add_location(div, file$6, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (activator_slot_or_fallback) {
					activator_slot_or_fallback.m(div, null);
				}

				append_dev(div, t);
				mount_component(popover, div, null);
				/*div_binding*/ ctx[13](div);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(div, "click", /*onActivatorClick*/ ctx[9], false, false, false),
						action_destroyer(events_action = /*events*/ ctx[8].call(null, div))
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (activator_slot) {
					if (activator_slot.p && dirty & /*$$scope*/ 16384) {
						update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_activator_slot_changes, get_activator_slot_context);
					}
				}

				const popover_changes = {};
				if (dirty & /*className*/ 1) popover_changes.class = /*className*/ ctx[0];
				if (dirty & /*style*/ 2) popover_changes.style = /*style*/ ctx[1];
				if (dirty & /*origin*/ 16) popover_changes.origin = /*origin*/ ctx[4];
				if (dirty & /*dx*/ 4) popover_changes.dx = /*dx*/ ctx[2];
				if (dirty & /*dy*/ 8) popover_changes.dy = /*dy*/ ctx[3];

				if (dirty & /*$$scope, width*/ 16416) {
					popover_changes.$$scope = { dirty, ctx };
				}

				if (!updating_visible && dirty & /*visible*/ 64) {
					updating_visible = true;
					popover_changes.visible = /*visible*/ ctx[6];
					add_flush_callback(() => updating_visible = false);
				}

				popover.$set(popover_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(activator_slot_or_fallback, local);
				transition_in(popover.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(activator_slot_or_fallback, local);
				transition_out(popover.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (activator_slot_or_fallback) activator_slot_or_fallback.d(detaching);
				destroy_component(popover);
				/*div_binding*/ ctx[13](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$6($$self, $$props, $$invalidate) {
		const events = getEventsAction(current_component);
		let { class: className = "" } = $$props;
		let { style = null } = $$props;
		let { dx = 0 } = $$props;
		let { dy = 0 } = $$props;
		let { origin = "top left" } = $$props; // 'bottom left', 'bottom right', 'top left', 'top right'
		let { width = 2 * 56 } = $$props;
		let visible = false;
		let menuEl;

		function onActivatorClick(e) {
			try {
				let triggerEl = menuEl.childNodes[0];

				if (triggerEl.contains(e.target)) {
					$$invalidate(6, visible = !visible);
				} else if (e.target === menuEl) {
					$$invalidate(6, visible = false);
				}
			} catch(err) {
				console.error(err);
			}
		}

		function onPopoverClick(e) {
			if (e.target.classList.contains("menu-item")) {
				$$invalidate(6, visible = false);
			}
		}

		const writable_props = ["class", "style", "dx", "dy", "origin", "width"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Menu> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Menu", $$slots, ['activator','default']);

		function popover_visible_binding(value) {
			visible = value;
			$$invalidate(6, visible);
		}

		function div_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				menuEl = $$value;
				$$invalidate(7, menuEl);
			});
		}

		$$self.$set = $$props => {
			if ("class" in $$props) $$invalidate(0, className = $$props.class);
			if ("style" in $$props) $$invalidate(1, style = $$props.style);
			if ("dx" in $$props) $$invalidate(2, dx = $$props.dx);
			if ("dy" in $$props) $$invalidate(3, dy = $$props.dy);
			if ("origin" in $$props) $$invalidate(4, origin = $$props.origin);
			if ("width" in $$props) $$invalidate(5, width = $$props.width);
			if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			current_component,
			getEventsAction,
			Popover,
			events,
			className,
			style,
			dx,
			dy,
			origin,
			width,
			visible,
			menuEl,
			onActivatorClick,
			onPopoverClick
		});

		$$self.$inject_state = $$props => {
			if ("className" in $$props) $$invalidate(0, className = $$props.className);
			if ("style" in $$props) $$invalidate(1, style = $$props.style);
			if ("dx" in $$props) $$invalidate(2, dx = $$props.dx);
			if ("dy" in $$props) $$invalidate(3, dy = $$props.dy);
			if ("origin" in $$props) $$invalidate(4, origin = $$props.origin);
			if ("width" in $$props) $$invalidate(5, width = $$props.width);
			if ("visible" in $$props) $$invalidate(6, visible = $$props.visible);
			if ("menuEl" in $$props) $$invalidate(7, menuEl = $$props.menuEl);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			className,
			style,
			dx,
			dy,
			origin,
			width,
			visible,
			menuEl,
			events,
			onActivatorClick,
			onPopoverClick,
			$$slots,
			popover_visible_binding,
			div_binding,
			$$scope
		];
	}

	class Menu extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$6, create_fragment$6, safe_not_equal, {
				class: 0,
				style: 1,
				dx: 2,
				dy: 3,
				origin: 4,
				width: 5
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Menu",
				options,
				id: create_fragment$6.name
			});
		}

		get class() {
			throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get style() {
			throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set style(value) {
			throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get dx() {
			throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set dx(value) {
			throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get dy() {
			throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set dy(value) {
			throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get origin() {
			throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set origin(value) {
			throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get width() {
			throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set width(value) {
			throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* F:\git14\svelte-leaflet\src\Menuitem.svelte generated by Svelte v3.24.0 */
	const file$7 = "F:\\git14\\svelte-leaflet\\src\\Menuitem.svelte";

	// (18:0) {:else}
	function create_else_block$1(ctx) {
		let li;
		let t;
		let li_class_value;
		let li_tabindex_value;
		let events_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*$$slots*/ ctx[9].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
		let if_block = /*ripple*/ ctx[1] && create_if_block_2$1(ctx);

		let li_levels = [
			{
				class: li_class_value = "menu-item " + /*className*/ ctx[0]
			},
			{
				tabindex: li_tabindex_value = /*disabled*/ ctx[2] ? "-1" : "0"
			},
			/*attrs*/ ctx[4]
		];

		let li_data = {};

		for (let i = 0; i < li_levels.length; i += 1) {
			li_data = assign(li_data, li_levels[i]);
		}

		const block = {
			c: function create() {
				li = element("li");
				if (default_slot) default_slot.c();
				t = space();
				if (if_block) if_block.c();
				set_attributes(li, li_data);
				toggle_class(li, "svelte-mmrniu", true);
				add_location(li, file$7, 18, 1, 259);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);

				if (default_slot) {
					default_slot.m(li, null);
				}

				append_dev(li, t);
				if (if_block) if_block.m(li, null);
				/*li_binding*/ ctx[11](li);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(li, "keydown", /*onKeydown*/ ctx[7], false, false, false),
						action_destroyer(events_action = /*events*/ ctx[6].call(null, li))
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 256) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
					}
				}

				if (/*ripple*/ ctx[1]) {
					if (if_block) {
						if (dirty & /*ripple*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_2$1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(li, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				set_attributes(li, li_data = get_spread_update(li_levels, [
					(!current || dirty & /*className*/ 1 && li_class_value !== (li_class_value = "menu-item " + /*className*/ ctx[0])) && { class: li_class_value },
					(!current || dirty & /*disabled*/ 4 && li_tabindex_value !== (li_tabindex_value = /*disabled*/ ctx[2] ? "-1" : "0")) && { tabindex: li_tabindex_value },
					dirty & /*attrs*/ 16 && /*attrs*/ ctx[4]
				]));

				toggle_class(li, "svelte-mmrniu", true);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(li);
				if (default_slot) default_slot.d(detaching);
				if (if_block) if_block.d();
				/*li_binding*/ ctx[11](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$1.name,
			type: "else",
			source: "(18:0) {:else}",
			ctx
		});

		return block;
	}

	// (1:0) {#if url}
	function create_if_block$5(ctx) {
		let li;
		let a;
		let t;
		let a_class_value;
		let a_tabindex_value;
		let events_action;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*$$slots*/ ctx[9].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
		let if_block = /*ripple*/ ctx[1] && create_if_block_1$1(ctx);

		let a_levels = [
			{
				class: a_class_value = "menu-item " + /*className*/ ctx[0]
			},
			{ href: /*url*/ ctx[3] },
			{
				tabindex: a_tabindex_value = /*disabled*/ ctx[2] ? "-1" : "0"
			},
			/*attrs*/ ctx[4]
		];

		let a_data = {};

		for (let i = 0; i < a_levels.length; i += 1) {
			a_data = assign(a_data, a_levels[i]);
		}

		const block = {
			c: function create() {
				li = element("li");
				a = element("a");
				if (default_slot) default_slot.c();
				t = space();
				if (if_block) if_block.c();
				set_attributes(a, a_data);
				toggle_class(a, "svelte-mmrniu", true);
				add_location(a, file$7, 2, 2, 18);
				attr_dev(li, "class", "svelte-mmrniu");
				add_location(li, file$7, 1, 1, 11);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, a);

				if (default_slot) {
					default_slot.m(a, null);
				}

				append_dev(a, t);
				if (if_block) if_block.m(a, null);
				/*a_binding*/ ctx[10](a);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(a, "keydown", /*onKeydown*/ ctx[7], false, false, false),
						action_destroyer(events_action = /*events*/ ctx[6].call(null, a))
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 256) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
					}
				}

				if (/*ripple*/ ctx[1]) {
					if (if_block) {
						if (dirty & /*ripple*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_1$1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(a, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				set_attributes(a, a_data = get_spread_update(a_levels, [
					(!current || dirty & /*className*/ 1 && a_class_value !== (a_class_value = "menu-item " + /*className*/ ctx[0])) && { class: a_class_value },
					(!current || dirty & /*url*/ 8) && { href: /*url*/ ctx[3] },
					(!current || dirty & /*disabled*/ 4 && a_tabindex_value !== (a_tabindex_value = /*disabled*/ ctx[2] ? "-1" : "0")) && { tabindex: a_tabindex_value },
					dirty & /*attrs*/ 16 && /*attrs*/ ctx[4]
				]));

				toggle_class(a, "svelte-mmrniu", true);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(li);
				if (default_slot) default_slot.d(detaching);
				if (if_block) if_block.d();
				/*a_binding*/ ctx[10](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$5.name,
			type: "if",
			source: "(1:0) {#if url}",
			ctx
		});

		return block;
	}

	// (28:2) {#if ripple}
	function create_if_block_2$1(ctx) {
		let ripple_1;
		let current;
		ripple_1 = new Ripple({ $$inline: true });

		const block = {
			c: function create() {
				create_component(ripple_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(ripple_1, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(ripple_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(ripple_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(ripple_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$1.name,
			type: "if",
			source: "(28:2) {#if ripple}",
			ctx
		});

		return block;
	}

	// (13:3) {#if ripple}
	function create_if_block_1$1(ctx) {
		let ripple_1;
		let current;
		ripple_1 = new Ripple({ $$inline: true });

		const block = {
			c: function create() {
				create_component(ripple_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(ripple_1, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(ripple_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(ripple_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(ripple_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(13:3) {#if ripple}",
			ctx
		});

		return block;
	}

	function create_fragment$7(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$5, create_else_block$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*url*/ ctx[3]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$7($$self, $$props, $$invalidate) {
		const events = getEventsAction(current_component);
		let { class: className = "" } = $$props;
		let { ripple = true } = $$props;
		let disabled = false;
		let url = null;
		let attrs = {};
		let elm;

		function onKeydown(e) {
			// click simulate
			if (e.keyCode === 13 || e.keyCode === 32) {
				e.stopPropagation();
				e.preventDefault();
				const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
				elm.dispatchEvent(clickEvent);
				elm.blur();
			}
		}

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Menuitem", $$slots, ['default']);

		function a_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				elm = $$value;
				$$invalidate(5, elm);
			});
		}

		function li_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				elm = $$value;
				$$invalidate(5, elm);
			});
		}

		$$self.$set = $$new_props => {
			$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
			if ("ripple" in $$new_props) $$invalidate(1, ripple = $$new_props.ripple);
			if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			current_component,
			getEventsAction,
			Ripple,
			events,
			className,
			ripple,
			disabled,
			url,
			attrs,
			elm,
			onKeydown
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
			if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
			if ("ripple" in $$props) $$invalidate(1, ripple = $$new_props.ripple);
			if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
			if ("url" in $$props) $$invalidate(3, url = $$new_props.url);
			if ("attrs" in $$props) $$invalidate(4, attrs = $$new_props.attrs);
			if ("elm" in $$props) $$invalidate(5, elm = $$new_props.elm);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			 {
				/* eslint-disable no-unused-vars */
				const { href, ripple, ...other } = $$props;

				delete other.class;

				if (other.disabled === false) {
					delete other.disabled;
				}

				$$invalidate(2, disabled = !!other.disabled);
				$$invalidate(3, url = href && !disabled ? href : null);
				$$invalidate(4, attrs = other);
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			className,
			ripple,
			disabled,
			url,
			attrs,
			elm,
			events,
			onKeydown,
			$$scope,
			$$slots,
			a_binding,
			li_binding
		];
	}

	class Menuitem extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, { class: 0, ripple: 1 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Menuitem",
				options,
				id: create_fragment$7.name
			});
		}

		get class() {
			throw new Error("<Menuitem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Menuitem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get ripple() {
			throw new Error("<Menuitem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set ripple(value) {
			throw new Error("<Menuitem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* F:\git14\svelte-leaflet\src\Sidepanel.svelte generated by Svelte v3.24.0 */

	const { window: window_1$1 } = globals;
	const file$8 = "F:\\git14\\svelte-leaflet\\src\\Sidepanel.svelte";

	// (4:0) {#if visible}
	function create_if_block$6(ctx) {
		let div;
		let div_transition;
		let current;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div = element("div");
				attr_dev(div, "class", "overlay svelte-17hiab");
				add_location(div, file$8, 4, 1, 127);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				current = true;

				if (!mounted) {
					dispose = listen_dev(div, "click", /*hide*/ ctx[4], false, false, false);
					mounted = true;
				}
			},
			p: noop,
			i: function intro(local) {
				if (current) return;

				add_render_callback(() => {
					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 300 }, true);
					div_transition.run(1);
				});

				current = true;
			},
			o: function outro(local) {
				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 300 }, false);
				div_transition.run(0);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (detaching && div_transition) div_transition.end();
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$6.name,
			type: "if",
			source: "(4:0) {#if visible}",
			ctx
		});

		return block;
	}

	function create_fragment$8(ctx) {
		let t0;
		let t1;
		let aside;
		let events_action;
		let current;
		let mounted;
		let dispose;
		let if_block = /*visible*/ ctx[0] && create_if_block$6(ctx);
		const default_slot_template = /*$$slots*/ ctx[11].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

		const block = {
			c: function create() {
				t0 = space();
				if (if_block) if_block.c();
				t1 = space();
				aside = element("aside");
				if (default_slot) default_slot.c();
				attr_dev(aside, "class", "side-panel svelte-17hiab");
				attr_dev(aside, "tabindex", "-1");
				toggle_class(aside, "left", !/*right*/ ctx[1]);
				toggle_class(aside, "right", /*right*/ ctx[1]);
				toggle_class(aside, "visible", /*visible*/ ctx[0]);
				add_location(aside, file$8, 6, 0, 209);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t0, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, aside, anchor);

				if (default_slot) {
					default_slot.m(aside, null);
				}

				/*aside_binding*/ ctx[12](aside);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(window_1$1, "keydown", /*onKeydown*/ ctx[8], false, false, false),
						listen_dev(document.body, "touchstart", /*onTouchStart*/ ctx[6], false, false, false),
						listen_dev(document.body, "touchend", /*onTouchEnd*/ ctx[7], false, false, false),
						listen_dev(aside, "transitionend", /*transitionEnd*/ ctx[5], false, false, false),
						action_destroyer(events_action = /*events*/ ctx[3].call(null, aside))
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*visible*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*visible*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$6(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(t1.parentNode, t1);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 1024) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
					}
				}

				if (dirty & /*right*/ 2) {
					toggle_class(aside, "left", !/*right*/ ctx[1]);
				}

				if (dirty & /*right*/ 2) {
					toggle_class(aside, "right", /*right*/ ctx[1]);
				}

				if (dirty & /*visible*/ 1) {
					toggle_class(aside, "visible", /*visible*/ ctx[0]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t0);
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(t1);
				if (detaching) detach_dev(aside);
				if (default_slot) default_slot.d(detaching);
				/*aside_binding*/ ctx[12](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	let oneVisible = false;
	const swipeArea = 20;
	const swipeMin = 50;

	function instance$8($$self, $$props, $$invalidate) {
		const events = getEventsAction(current_component);
		let { right = false } = $$props;
		let { visible = false } = $$props;
		let { disableScroll = false } = $$props;
		let touchStart = { x: null, y: null };
		let mounted = false;
		let elm;

		onMount(async () => {
			await tick();
			$$invalidate(14, mounted = true);
		});

		function hide() {
			$$invalidate(0, visible = false);

			setTimeout(
				() => {
					oneVisible = false;
				},
				20
			);
		}

		function show() {
			$$invalidate(0, visible = true);
		}

		function transitionEnd(e) {
			if (visible && e.propertyName === "visibility") {
				elm.focus();
			}
		}

		function onTouchStart(e) {
			touchStart.x = e.changedTouches[0].clientX;
			touchStart.y = e.changedTouches[0].clientY;
		}

		function onTouchEnd(e) {
			const dx = e.changedTouches[0].clientX - touchStart.x;
			const dy = e.changedTouches[0].clientY - touchStart.y;
			const absDx = Math.abs(dx);

			if (absDx > swipeMin) {
				const absDy = Math.abs(dy);

				if (absDy < swipeMin << 1) {
					if (visible) {
						if (dx > 0 && right || dx < 0 && !right) {
							hide();
						}
					} else {
						if (oneVisible) {
							return;
						}

						if (dx > 0 && touchStart.x <= swipeArea) {
							if (!right) {
								show();
							}
						} else if (touchStart.x >= window.innerWidth - swipeArea) {
							if (right) {
								show();
							}
						}
					}
				}
			}
		}

		function onKeydown(e) {
			const esc = "Escape";

			if (!visible) {
				return;
			}

			if (e.keyCode === 27 || e.key === esc || e.code === esc) {
				hide();
			}

			if (visible) {
				trapTabKey(e, elm);
			}
		}

		const writable_props = ["right", "visible", "disableScroll"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidepanel> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Sidepanel", $$slots, ['default']);

		function aside_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				elm = $$value;
				$$invalidate(2, elm);
			});
		}

		$$self.$set = $$props => {
			if ("right" in $$props) $$invalidate(1, right = $$props.right);
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("disableScroll" in $$props) $$invalidate(9, disableScroll = $$props.disableScroll);
			if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			oneVisible,
			tick,
			onMount,
			fade,
			current_component,
			getEventsAction,
			trapTabKey,
			enableScroll,
			events,
			right,
			visible,
			disableScroll,
			swipeArea,
			swipeMin,
			touchStart,
			mounted,
			elm,
			hide,
			show,
			transitionEnd,
			onTouchStart,
			onTouchEnd,
			onKeydown
		});

		$$self.$inject_state = $$props => {
			if ("right" in $$props) $$invalidate(1, right = $$props.right);
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("disableScroll" in $$props) $$invalidate(9, disableScroll = $$props.disableScroll);
			if ("touchStart" in $$props) touchStart = $$props.touchStart;
			if ("mounted" in $$props) $$invalidate(14, mounted = $$props.mounted);
			if ("elm" in $$props) $$invalidate(2, elm = $$props.elm);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*visible, mounted, disableScroll*/ 16897) {
				 if (visible) {
					oneVisible = true;
					mounted && disableScroll && enableScroll(false);
				} else {
					mounted && enableScroll(true);
					hide();
				}
			}
		};

		return [
			visible,
			right,
			elm,
			events,
			hide,
			transitionEnd,
			onTouchStart,
			onTouchEnd,
			onKeydown,
			disableScroll,
			$$scope,
			$$slots,
			aside_binding
		];
	}

	class Sidepanel extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, { right: 1, visible: 0, disableScroll: 9 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Sidepanel",
				options,
				id: create_fragment$8.name
			});
		}

		get right() {
			throw new Error("<Sidepanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set right(value) {
			throw new Error("<Sidepanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get visible() {
			throw new Error("<Sidepanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set visible(value) {
			throw new Error("<Sidepanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get disableScroll() {
			throw new Error("<Sidepanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set disableScroll(value) {
			throw new Error("<Sidepanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	var leafletSrc = createCommonjsModule(function (module, exports) {
	/* @preserve
	 * Leaflet 1.6.0, a JS library for interactive maps. http://leafletjs.com
	 * (c) 2010-2019 Vladimir Agafonkin, (c) 2010-2011 CloudMade
	 */

	(function (global, factory) {
		 factory(exports) ;
	}(commonjsGlobal, (function (exports) {
	var version = "1.6.0";

	/*
	 * @namespace Util
	 *
	 * Various utility functions, used by Leaflet internally.
	 */

	var freeze = Object.freeze;
	Object.freeze = function (obj) { return obj; };

	// @function extend(dest: Object, src?: Object): Object
	// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
	function extend(dest) {
		var i, j, len, src;

		for (j = 1, len = arguments.length; j < len; j++) {
			src = arguments[j];
			for (i in src) {
				dest[i] = src[i];
			}
		}
		return dest;
	}

	// @function create(proto: Object, properties?: Object): Object
	// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
	var create = Object.create || (function () {
		function F() {}
		return function (proto) {
			F.prototype = proto;
			return new F();
		};
	})();

	// @function bind(fn: Function, …): Function
	// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	// Has a `L.bind()` shortcut.
	function bind(fn, obj) {
		var slice = Array.prototype.slice;

		if (fn.bind) {
			return fn.bind.apply(fn, slice.call(arguments, 1));
		}

		var args = slice.call(arguments, 2);

		return function () {
			return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
		};
	}

	// @property lastId: Number
	// Last unique ID used by [`stamp()`](#util-stamp)
	var lastId = 0;

	// @function stamp(obj: Object): Number
	// Returns the unique ID of an object, assigning it one if it doesn't have it.
	function stamp(obj) {
		/*eslint-disable */
		obj._leaflet_id = obj._leaflet_id || ++lastId;
		return obj._leaflet_id;
		/* eslint-enable */
	}

	// @function throttle(fn: Function, time: Number, context: Object): Function
	// Returns a function which executes function `fn` with the given scope `context`
	// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
	// `fn` will be called no more than one time per given amount of `time`. The arguments
	// received by the bound function will be any arguments passed when binding the
	// function, followed by any arguments passed when invoking the bound function.
	// Has an `L.throttle` shortcut.
	function throttle(fn, time, context) {
		var lock, args, wrapperFn, later;

		later = function () {
			// reset lock and call if queued
			lock = false;
			if (args) {
				wrapperFn.apply(context, args);
				args = false;
			}
		};

		wrapperFn = function () {
			if (lock) {
				// called too soon, queue to call later
				args = arguments;

			} else {
				// call and lock until later
				fn.apply(context, arguments);
				setTimeout(later, time);
				lock = true;
			}
		};

		return wrapperFn;
	}

	// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
	// Returns the number `num` modulo `range` in such a way so it lies within
	// `range[0]` and `range[1]`. The returned value will be always smaller than
	// `range[1]` unless `includeMax` is set to `true`.
	function wrapNum(x, range, includeMax) {
		var max = range[1],
		    min = range[0],
		    d = max - min;
		return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
	}

	// @function falseFn(): Function
	// Returns a function which always returns `false`.
	function falseFn() { return false; }

	// @function formatNum(num: Number, digits?: Number): Number
	// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
	function formatNum(num, digits) {
		var pow = Math.pow(10, (digits === undefined ? 6 : digits));
		return Math.round(num * pow) / pow;
	}

	// @function trim(str: String): String
	// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
	function trim(str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	}

	// @function splitWords(str: String): String[]
	// Trims and splits the string on whitespace and returns the array of parts.
	function splitWords(str) {
		return trim(str).split(/\s+/);
	}

	// @function setOptions(obj: Object, options: Object): Object
	// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
	function setOptions(obj, options) {
		if (!obj.hasOwnProperty('options')) {
			obj.options = obj.options ? create(obj.options) : {};
		}
		for (var i in options) {
			obj.options[i] = options[i];
		}
		return obj.options;
	}

	// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
	// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
	// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
	// be appended at the end. If `uppercase` is `true`, the parameter names will
	// be uppercased (e.g. `'?A=foo&B=bar'`)
	function getParamString(obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	}

	var templateRe = /\{ *([\w_-]+) *\}/g;

	// @function template(str: String, data: Object): String
	// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
	// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
	// `('Hello foo, bar')`. You can also specify functions instead of strings for
	// data values — they will be evaluated passing `data` as an argument.
	function template(str, data) {
		return str.replace(templateRe, function (str, key) {
			var value = data[key];

			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);

			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	}

	// @function isArray(obj): Boolean
	// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
	var isArray = Array.isArray || function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	};

	// @function indexOf(array: Array, el: Object): Number
	// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
	function indexOf(array, el) {
		for (var i = 0; i < array.length; i++) {
			if (array[i] === el) { return i; }
		}
		return -1;
	}

	// @property emptyImageUrl: String
	// Data URI string containing a base64-encoded empty GIF image.
	// Used as a hack to free memory from unused images on WebKit-powered
	// mobile devices (by setting image `src` to this string).
	var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

	// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	function getPrefixed(name) {
		return window['webkit' + name] || window['moz' + name] || window['ms' + name];
	}

	var lastTime = 0;

	// fallback for IE 7-8
	function timeoutDefer(fn) {
		var time = +new Date(),
		    timeToCall = Math.max(0, 16 - (time - lastTime));

		lastTime = time + timeToCall;
		return window.setTimeout(fn, timeToCall);
	}

	var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
	var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
			getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

	// @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
	// Schedules `fn` to be executed when the browser repaints. `fn` is bound to
	// `context` if given. When `immediate` is set, `fn` is called immediately if
	// the browser doesn't have native support for
	// [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
	// otherwise it's delayed. Returns a request ID that can be used to cancel the request.
	function requestAnimFrame(fn, context, immediate) {
		if (immediate && requestFn === timeoutDefer) {
			fn.call(context);
		} else {
			return requestFn.call(window, bind(fn, context));
		}
	}

	// @function cancelAnimFrame(id: Number): undefined
	// Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
	function cancelAnimFrame(id) {
		if (id) {
			cancelFn.call(window, id);
		}
	}


	var Util = (Object.freeze || Object)({
		freeze: freeze,
		extend: extend,
		create: create,
		bind: bind,
		lastId: lastId,
		stamp: stamp,
		throttle: throttle,
		wrapNum: wrapNum,
		falseFn: falseFn,
		formatNum: formatNum,
		trim: trim,
		splitWords: splitWords,
		setOptions: setOptions,
		getParamString: getParamString,
		template: template,
		isArray: isArray,
		indexOf: indexOf,
		emptyImageUrl: emptyImageUrl,
		requestFn: requestFn,
		cancelFn: cancelFn,
		requestAnimFrame: requestAnimFrame,
		cancelAnimFrame: cancelAnimFrame
	});

	// @class Class
	// @aka L.Class

	// @section
	// @uninheritable

	// Thanks to John Resig and Dean Edwards for inspiration!

	function Class() {}

	Class.extend = function (props) {

		// @function extend(props: Object): Function
		// [Extends the current class](#class-inheritance) given the properties to be included.
		// Returns a Javascript function that is a class constructor (to be called with `new`).
		var NewClass = function () {

			// call the constructor
			if (this.initialize) {
				this.initialize.apply(this, arguments);
			}

			// call all constructor hooks
			this.callInitHooks();
		};

		var parentProto = NewClass.__super__ = this.prototype;

		var proto = create(parentProto);
		proto.constructor = NewClass;

		NewClass.prototype = proto;

		// inherit parent's statics
		for (var i in this) {
			if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
				NewClass[i] = this[i];
			}
		}

		// mix static properties into the class
		if (props.statics) {
			extend(NewClass, props.statics);
			delete props.statics;
		}

		// mix includes into the prototype
		if (props.includes) {
			checkDeprecatedMixinEvents(props.includes);
			extend.apply(null, [proto].concat(props.includes));
			delete props.includes;
		}

		// merge options
		if (proto.options) {
			props.options = extend(create(proto.options), props.options);
		}

		// mix given properties into the prototype
		extend(proto, props);

		proto._initHooks = [];

		// add method for calling all hooks
		proto.callInitHooks = function () {

			if (this._initHooksCalled) { return; }

			if (parentProto.callInitHooks) {
				parentProto.callInitHooks.call(this);
			}

			this._initHooksCalled = true;

			for (var i = 0, len = proto._initHooks.length; i < len; i++) {
				proto._initHooks[i].call(this);
			}
		};

		return NewClass;
	};


	// @function include(properties: Object): this
	// [Includes a mixin](#class-includes) into the current class.
	Class.include = function (props) {
		extend(this.prototype, props);
		return this;
	};

	// @function mergeOptions(options: Object): this
	// [Merges `options`](#class-options) into the defaults of the class.
	Class.mergeOptions = function (options) {
		extend(this.prototype.options, options);
		return this;
	};

	// @function addInitHook(fn: Function): this
	// Adds a [constructor hook](#class-constructor-hooks) to the class.
	Class.addInitHook = function (fn) { // (Function) || (String, args...)
		var args = Array.prototype.slice.call(arguments, 1);

		var init = typeof fn === 'function' ? fn : function () {
			this[fn].apply(this, args);
		};

		this.prototype._initHooks = this.prototype._initHooks || [];
		this.prototype._initHooks.push(init);
		return this;
	};

	function checkDeprecatedMixinEvents(includes) {
		if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

		includes = isArray(includes) ? includes : [includes];

		for (var i = 0; i < includes.length; i++) {
			if (includes[i] === L.Mixin.Events) {
				console.warn('Deprecated include of L.Mixin.Events: ' +
					'this property will be removed in future releases, ' +
					'please inherit from L.Evented instead.', new Error().stack);
			}
		}
	}

	/*
	 * @class Evented
	 * @aka L.Evented
	 * @inherits Class
	 *
	 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
	 *
	 * @example
	 *
	 * ```js
	 * map.on('click', function(e) {
	 * 	alert(e.latlng);
	 * } );
	 * ```
	 *
	 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
	 *
	 * ```js
	 * function onClick(e) { ... }
	 *
	 * map.on('click', onClick);
	 * map.off('click', onClick);
	 * ```
	 */

	var Events = {
		/* @method on(type: String, fn: Function, context?: Object): this
		 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
		 *
		 * @alternative
		 * @method on(eventMap: Object): this
		 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
		 */
		on: function (types, fn, context) {

			// types can be a map of types/handlers
			if (typeof types === 'object') {
				for (var type in types) {
					// we don't process space-separated events here for performance;
					// it's a hot path since Layer uses the on(obj) syntax
					this._on(type, types[type], fn);
				}

			} else {
				// types can be a string of space-separated words
				types = splitWords(types);

				for (var i = 0, len = types.length; i < len; i++) {
					this._on(types[i], fn, context);
				}
			}

			return this;
		},

		/* @method off(type: String, fn?: Function, context?: Object): this
		 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
		 *
		 * @alternative
		 * @method off(eventMap: Object): this
		 * Removes a set of type/listener pairs.
		 *
		 * @alternative
		 * @method off: this
		 * Removes all listeners to all events on the object. This includes implicitly attached events.
		 */
		off: function (types, fn, context) {

			if (!types) {
				// clear all listeners if called without arguments
				delete this._events;

			} else if (typeof types === 'object') {
				for (var type in types) {
					this._off(type, types[type], fn);
				}

			} else {
				types = splitWords(types);

				for (var i = 0, len = types.length; i < len; i++) {
					this._off(types[i], fn, context);
				}
			}

			return this;
		},

		// attach listener (without syntactic sugar now)
		_on: function (type, fn, context) {
			this._events = this._events || {};

			/* get/init listeners for type */
			var typeListeners = this._events[type];
			if (!typeListeners) {
				typeListeners = [];
				this._events[type] = typeListeners;
			}

			if (context === this) {
				// Less memory footprint.
				context = undefined;
			}
			var newListener = {fn: fn, ctx: context},
			    listeners = typeListeners;

			// check if fn already there
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i].fn === fn && listeners[i].ctx === context) {
					return;
				}
			}

			listeners.push(newListener);
		},

		_off: function (type, fn, context) {
			var listeners,
			    i,
			    len;

			if (!this._events) { return; }

			listeners = this._events[type];

			if (!listeners) {
				return;
			}

			if (!fn) {
				// Set all removed listeners to noop so they are not called if remove happens in fire
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].fn = falseFn;
				}
				// clear all listeners for a type if function isn't specified
				delete this._events[type];
				return;
			}

			if (context === this) {
				context = undefined;
			}

			if (listeners) {

				// find fn and remove it
				for (i = 0, len = listeners.length; i < len; i++) {
					var l = listeners[i];
					if (l.ctx !== context) { continue; }
					if (l.fn === fn) {

						// set the removed listener to noop so that's not called if remove happens in fire
						l.fn = falseFn;

						if (this._firingCount) {
							/* copy array in case events are being fired */
							this._events[type] = listeners = listeners.slice();
						}
						listeners.splice(i, 1);

						return;
					}
				}
			}
		},

		// @method fire(type: String, data?: Object, propagate?: Boolean): this
		// Fires an event of the specified type. You can optionally provide an data
		// object — the first argument of the listener function will contain its
		// properties. The event can optionally be propagated to event parents.
		fire: function (type, data, propagate) {
			if (!this.listens(type, propagate)) { return this; }

			var event = extend({}, data, {
				type: type,
				target: this,
				sourceTarget: data && data.sourceTarget || this
			});

			if (this._events) {
				var listeners = this._events[type];

				if (listeners) {
					this._firingCount = (this._firingCount + 1) || 1;
					for (var i = 0, len = listeners.length; i < len; i++) {
						var l = listeners[i];
						l.fn.call(l.ctx || this, event);
					}

					this._firingCount--;
				}
			}

			if (propagate) {
				// propagate the event to parents (set with addEventParent)
				this._propagateEvent(event);
			}

			return this;
		},

		// @method listens(type: String): Boolean
		// Returns `true` if a particular event type has any listeners attached to it.
		listens: function (type, propagate) {
			var listeners = this._events && this._events[type];
			if (listeners && listeners.length) { return true; }

			if (propagate) {
				// also check parents for listeners if event propagates
				for (var id in this._eventParents) {
					if (this._eventParents[id].listens(type, propagate)) { return true; }
				}
			}
			return false;
		},

		// @method once(…): this
		// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
		once: function (types, fn, context) {

			if (typeof types === 'object') {
				for (var type in types) {
					this.once(type, types[type], fn);
				}
				return this;
			}

			var handler = bind(function () {
				this
				    .off(types, fn, context)
				    .off(types, handler, context);
			}, this);

			// add a listener that's executed once and removed after that
			return this
			    .on(types, fn, context)
			    .on(types, handler, context);
		},

		// @method addEventParent(obj: Evented): this
		// Adds an event parent - an `Evented` that will receive propagated events
		addEventParent: function (obj) {
			this._eventParents = this._eventParents || {};
			this._eventParents[stamp(obj)] = obj;
			return this;
		},

		// @method removeEventParent(obj: Evented): this
		// Removes an event parent, so it will stop receiving propagated events
		removeEventParent: function (obj) {
			if (this._eventParents) {
				delete this._eventParents[stamp(obj)];
			}
			return this;
		},

		_propagateEvent: function (e) {
			for (var id in this._eventParents) {
				this._eventParents[id].fire(e.type, extend({
					layer: e.target,
					propagatedFrom: e.target
				}, e), true);
			}
		}
	};

	// aliases; we should ditch those eventually

	// @method addEventListener(…): this
	// Alias to [`on(…)`](#evented-on)
	Events.addEventListener = Events.on;

	// @method removeEventListener(…): this
	// Alias to [`off(…)`](#evented-off)

	// @method clearAllEventListeners(…): this
	// Alias to [`off()`](#evented-off)
	Events.removeEventListener = Events.clearAllEventListeners = Events.off;

	// @method addOneTimeEventListener(…): this
	// Alias to [`once(…)`](#evented-once)
	Events.addOneTimeEventListener = Events.once;

	// @method fireEvent(…): this
	// Alias to [`fire(…)`](#evented-fire)
	Events.fireEvent = Events.fire;

	// @method hasEventListeners(…): Boolean
	// Alias to [`listens(…)`](#evented-listens)
	Events.hasEventListeners = Events.listens;

	var Evented = Class.extend(Events);

	/*
	 * @class Point
	 * @aka L.Point
	 *
	 * Represents a point with `x` and `y` coordinates in pixels.
	 *
	 * @example
	 *
	 * ```js
	 * var point = L.point(200, 300);
	 * ```
	 *
	 * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
	 *
	 * ```js
	 * map.panBy([200, 300]);
	 * map.panBy(L.point(200, 300));
	 * ```
	 *
	 * Note that `Point` does not inherit from Leafet's `Class` object,
	 * which means new classes can't inherit from it, and new methods
	 * can't be added to it with the `include` function.
	 */

	function Point(x, y, round) {
		// @property x: Number; The `x` coordinate of the point
		this.x = (round ? Math.round(x) : x);
		// @property y: Number; The `y` coordinate of the point
		this.y = (round ? Math.round(y) : y);
	}

	var trunc = Math.trunc || function (v) {
		return v > 0 ? Math.floor(v) : Math.ceil(v);
	};

	Point.prototype = {

		// @method clone(): Point
		// Returns a copy of the current point.
		clone: function () {
			return new Point(this.x, this.y);
		},

		// @method add(otherPoint: Point): Point
		// Returns the result of addition of the current and the given points.
		add: function (point) {
			// non-destructive, returns a new point
			return this.clone()._add(toPoint(point));
		},

		_add: function (point) {
			// destructive, used directly for performance in situations where it's safe to modify existing point
			this.x += point.x;
			this.y += point.y;
			return this;
		},

		// @method subtract(otherPoint: Point): Point
		// Returns the result of subtraction of the given point from the current.
		subtract: function (point) {
			return this.clone()._subtract(toPoint(point));
		},

		_subtract: function (point) {
			this.x -= point.x;
			this.y -= point.y;
			return this;
		},

		// @method divideBy(num: Number): Point
		// Returns the result of division of the current point by the given number.
		divideBy: function (num) {
			return this.clone()._divideBy(num);
		},

		_divideBy: function (num) {
			this.x /= num;
			this.y /= num;
			return this;
		},

		// @method multiplyBy(num: Number): Point
		// Returns the result of multiplication of the current point by the given number.
		multiplyBy: function (num) {
			return this.clone()._multiplyBy(num);
		},

		_multiplyBy: function (num) {
			this.x *= num;
			this.y *= num;
			return this;
		},

		// @method scaleBy(scale: Point): Point
		// Multiply each coordinate of the current point by each coordinate of
		// `scale`. In linear algebra terms, multiply the point by the
		// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
		// defined by `scale`.
		scaleBy: function (point) {
			return new Point(this.x * point.x, this.y * point.y);
		},

		// @method unscaleBy(scale: Point): Point
		// Inverse of `scaleBy`. Divide each coordinate of the current point by
		// each coordinate of `scale`.
		unscaleBy: function (point) {
			return new Point(this.x / point.x, this.y / point.y);
		},

		// @method round(): Point
		// Returns a copy of the current point with rounded coordinates.
		round: function () {
			return this.clone()._round();
		},

		_round: function () {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			return this;
		},

		// @method floor(): Point
		// Returns a copy of the current point with floored coordinates (rounded down).
		floor: function () {
			return this.clone()._floor();
		},

		_floor: function () {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			return this;
		},

		// @method ceil(): Point
		// Returns a copy of the current point with ceiled coordinates (rounded up).
		ceil: function () {
			return this.clone()._ceil();
		},

		_ceil: function () {
			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			return this;
		},

		// @method trunc(): Point
		// Returns a copy of the current point with truncated coordinates (rounded towards zero).
		trunc: function () {
			return this.clone()._trunc();
		},

		_trunc: function () {
			this.x = trunc(this.x);
			this.y = trunc(this.y);
			return this;
		},

		// @method distanceTo(otherPoint: Point): Number
		// Returns the cartesian distance between the current and the given points.
		distanceTo: function (point) {
			point = toPoint(point);

			var x = point.x - this.x,
			    y = point.y - this.y;

			return Math.sqrt(x * x + y * y);
		},

		// @method equals(otherPoint: Point): Boolean
		// Returns `true` if the given point has the same coordinates.
		equals: function (point) {
			point = toPoint(point);

			return point.x === this.x &&
			       point.y === this.y;
		},

		// @method contains(otherPoint: Point): Boolean
		// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
		contains: function (point) {
			point = toPoint(point);

			return Math.abs(point.x) <= Math.abs(this.x) &&
			       Math.abs(point.y) <= Math.abs(this.y);
		},

		// @method toString(): String
		// Returns a string representation of the point for debugging purposes.
		toString: function () {
			return 'Point(' +
			        formatNum(this.x) + ', ' +
			        formatNum(this.y) + ')';
		}
	};

	// @factory L.point(x: Number, y: Number, round?: Boolean)
	// Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

	// @alternative
	// @factory L.point(coords: Number[])
	// Expects an array of the form `[x, y]` instead.

	// @alternative
	// @factory L.point(coords: Object)
	// Expects a plain object of the form `{x: Number, y: Number}` instead.
	function toPoint(x, y, round) {
		if (x instanceof Point) {
			return x;
		}
		if (isArray(x)) {
			return new Point(x[0], x[1]);
		}
		if (x === undefined || x === null) {
			return x;
		}
		if (typeof x === 'object' && 'x' in x && 'y' in x) {
			return new Point(x.x, x.y);
		}
		return new Point(x, y, round);
	}

	/*
	 * @class Bounds
	 * @aka L.Bounds
	 *
	 * Represents a rectangular area in pixel coordinates.
	 *
	 * @example
	 *
	 * ```js
	 * var p1 = L.point(10, 10),
	 * p2 = L.point(40, 60),
	 * bounds = L.bounds(p1, p2);
	 * ```
	 *
	 * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
	 *
	 * ```js
	 * otherBounds.intersects([[10, 10], [40, 60]]);
	 * ```
	 *
	 * Note that `Bounds` does not inherit from Leafet's `Class` object,
	 * which means new classes can't inherit from it, and new methods
	 * can't be added to it with the `include` function.
	 */

	function Bounds(a, b) {
		if (!a) { return; }

		var points = b ? [a, b] : a;

		for (var i = 0, len = points.length; i < len; i++) {
			this.extend(points[i]);
		}
	}

	Bounds.prototype = {
		// @method extend(point: Point): this
		// Extends the bounds to contain the given point.
		extend: function (point) { // (Point)
			point = toPoint(point);

			// @property min: Point
			// The top left corner of the rectangle.
			// @property max: Point
			// The bottom right corner of the rectangle.
			if (!this.min && !this.max) {
				this.min = point.clone();
				this.max = point.clone();
			} else {
				this.min.x = Math.min(point.x, this.min.x);
				this.max.x = Math.max(point.x, this.max.x);
				this.min.y = Math.min(point.y, this.min.y);
				this.max.y = Math.max(point.y, this.max.y);
			}
			return this;
		},

		// @method getCenter(round?: Boolean): Point
		// Returns the center point of the bounds.
		getCenter: function (round) {
			return new Point(
			        (this.min.x + this.max.x) / 2,
			        (this.min.y + this.max.y) / 2, round);
		},

		// @method getBottomLeft(): Point
		// Returns the bottom-left point of the bounds.
		getBottomLeft: function () {
			return new Point(this.min.x, this.max.y);
		},

		// @method getTopRight(): Point
		// Returns the top-right point of the bounds.
		getTopRight: function () { // -> Point
			return new Point(this.max.x, this.min.y);
		},

		// @method getTopLeft(): Point
		// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
		getTopLeft: function () {
			return this.min; // left, top
		},

		// @method getBottomRight(): Point
		// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
		getBottomRight: function () {
			return this.max; // right, bottom
		},

		// @method getSize(): Point
		// Returns the size of the given bounds
		getSize: function () {
			return this.max.subtract(this.min);
		},

		// @method contains(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle contains the given one.
		// @alternative
		// @method contains(point: Point): Boolean
		// Returns `true` if the rectangle contains the given point.
		contains: function (obj) {
			var min, max;

			if (typeof obj[0] === 'number' || obj instanceof Point) {
				obj = toPoint(obj);
			} else {
				obj = toBounds(obj);
			}

			if (obj instanceof Bounds) {
				min = obj.min;
				max = obj.max;
			} else {
				min = max = obj;
			}

			return (min.x >= this.min.x) &&
			       (max.x <= this.max.x) &&
			       (min.y >= this.min.y) &&
			       (max.y <= this.max.y);
		},

		// @method intersects(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle intersects the given bounds. Two bounds
		// intersect if they have at least one point in common.
		intersects: function (bounds) { // (Bounds) -> Boolean
			bounds = toBounds(bounds);

			var min = this.min,
			    max = this.max,
			    min2 = bounds.min,
			    max2 = bounds.max,
			    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
			    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

			return xIntersects && yIntersects;
		},

		// @method overlaps(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle overlaps the given bounds. Two bounds
		// overlap if their intersection is an area.
		overlaps: function (bounds) { // (Bounds) -> Boolean
			bounds = toBounds(bounds);

			var min = this.min,
			    max = this.max,
			    min2 = bounds.min,
			    max2 = bounds.max,
			    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
			    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

			return xOverlaps && yOverlaps;
		},

		isValid: function () {
			return !!(this.min && this.max);
		}
	};


	// @factory L.bounds(corner1: Point, corner2: Point)
	// Creates a Bounds object from two corners coordinate pairs.
	// @alternative
	// @factory L.bounds(points: Point[])
	// Creates a Bounds object from the given array of points.
	function toBounds(a, b) {
		if (!a || a instanceof Bounds) {
			return a;
		}
		return new Bounds(a, b);
	}

	/*
	 * @class LatLngBounds
	 * @aka L.LatLngBounds
	 *
	 * Represents a rectangular geographical area on a map.
	 *
	 * @example
	 *
	 * ```js
	 * var corner1 = L.latLng(40.712, -74.227),
	 * corner2 = L.latLng(40.774, -74.125),
	 * bounds = L.latLngBounds(corner1, corner2);
	 * ```
	 *
	 * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
	 *
	 * ```js
	 * map.fitBounds([
	 * 	[40.712, -74.227],
	 * 	[40.774, -74.125]
	 * ]);
	 * ```
	 *
	 * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
	 *
	 * Note that `LatLngBounds` does not inherit from Leafet's `Class` object,
	 * which means new classes can't inherit from it, and new methods
	 * can't be added to it with the `include` function.
	 */

	function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
		if (!corner1) { return; }

		var latlngs = corner2 ? [corner1, corner2] : corner1;

		for (var i = 0, len = latlngs.length; i < len; i++) {
			this.extend(latlngs[i]);
		}
	}

	LatLngBounds.prototype = {

		// @method extend(latlng: LatLng): this
		// Extend the bounds to contain the given point

		// @alternative
		// @method extend(otherBounds: LatLngBounds): this
		// Extend the bounds to contain the given bounds
		extend: function (obj) {
			var sw = this._southWest,
			    ne = this._northEast,
			    sw2, ne2;

			if (obj instanceof LatLng) {
				sw2 = obj;
				ne2 = obj;

			} else if (obj instanceof LatLngBounds) {
				sw2 = obj._southWest;
				ne2 = obj._northEast;

				if (!sw2 || !ne2) { return this; }

			} else {
				return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
			}

			if (!sw && !ne) {
				this._southWest = new LatLng(sw2.lat, sw2.lng);
				this._northEast = new LatLng(ne2.lat, ne2.lng);
			} else {
				sw.lat = Math.min(sw2.lat, sw.lat);
				sw.lng = Math.min(sw2.lng, sw.lng);
				ne.lat = Math.max(ne2.lat, ne.lat);
				ne.lng = Math.max(ne2.lng, ne.lng);
			}

			return this;
		},

		// @method pad(bufferRatio: Number): LatLngBounds
		// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
		// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
		// Negative values will retract the bounds.
		pad: function (bufferRatio) {
			var sw = this._southWest,
			    ne = this._northEast,
			    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
			    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

			return new LatLngBounds(
			        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
			        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
		},

		// @method getCenter(): LatLng
		// Returns the center point of the bounds.
		getCenter: function () {
			return new LatLng(
			        (this._southWest.lat + this._northEast.lat) / 2,
			        (this._southWest.lng + this._northEast.lng) / 2);
		},

		// @method getSouthWest(): LatLng
		// Returns the south-west point of the bounds.
		getSouthWest: function () {
			return this._southWest;
		},

		// @method getNorthEast(): LatLng
		// Returns the north-east point of the bounds.
		getNorthEast: function () {
			return this._northEast;
		},

		// @method getNorthWest(): LatLng
		// Returns the north-west point of the bounds.
		getNorthWest: function () {
			return new LatLng(this.getNorth(), this.getWest());
		},

		// @method getSouthEast(): LatLng
		// Returns the south-east point of the bounds.
		getSouthEast: function () {
			return new LatLng(this.getSouth(), this.getEast());
		},

		// @method getWest(): Number
		// Returns the west longitude of the bounds
		getWest: function () {
			return this._southWest.lng;
		},

		// @method getSouth(): Number
		// Returns the south latitude of the bounds
		getSouth: function () {
			return this._southWest.lat;
		},

		// @method getEast(): Number
		// Returns the east longitude of the bounds
		getEast: function () {
			return this._northEast.lng;
		},

		// @method getNorth(): Number
		// Returns the north latitude of the bounds
		getNorth: function () {
			return this._northEast.lat;
		},

		// @method contains(otherBounds: LatLngBounds): Boolean
		// Returns `true` if the rectangle contains the given one.

		// @alternative
		// @method contains (latlng: LatLng): Boolean
		// Returns `true` if the rectangle contains the given point.
		contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
			if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
				obj = toLatLng(obj);
			} else {
				obj = toLatLngBounds(obj);
			}

			var sw = this._southWest,
			    ne = this._northEast,
			    sw2, ne2;

			if (obj instanceof LatLngBounds) {
				sw2 = obj.getSouthWest();
				ne2 = obj.getNorthEast();
			} else {
				sw2 = ne2 = obj;
			}

			return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
			       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
		},

		// @method intersects(otherBounds: LatLngBounds): Boolean
		// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
		intersects: function (bounds) {
			bounds = toLatLngBounds(bounds);

			var sw = this._southWest,
			    ne = this._northEast,
			    sw2 = bounds.getSouthWest(),
			    ne2 = bounds.getNorthEast(),

			    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
			    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

			return latIntersects && lngIntersects;
		},

		// @method overlaps(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
		overlaps: function (bounds) {
			bounds = toLatLngBounds(bounds);

			var sw = this._southWest,
			    ne = this._northEast,
			    sw2 = bounds.getSouthWest(),
			    ne2 = bounds.getNorthEast(),

			    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
			    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

			return latOverlaps && lngOverlaps;
		},

		// @method toBBoxString(): String
		// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
		toBBoxString: function () {
			return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
		},

		// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
		// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
		equals: function (bounds, maxMargin) {
			if (!bounds) { return false; }

			bounds = toLatLngBounds(bounds);

			return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
			       this._northEast.equals(bounds.getNorthEast(), maxMargin);
		},

		// @method isValid(): Boolean
		// Returns `true` if the bounds are properly initialized.
		isValid: function () {
			return !!(this._southWest && this._northEast);
		}
	};

	// TODO International date line?

	// @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
	// Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

	// @alternative
	// @factory L.latLngBounds(latlngs: LatLng[])
	// Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
	function toLatLngBounds(a, b) {
		if (a instanceof LatLngBounds) {
			return a;
		}
		return new LatLngBounds(a, b);
	}

	/* @class LatLng
	 * @aka L.LatLng
	 *
	 * Represents a geographical point with a certain latitude and longitude.
	 *
	 * @example
	 *
	 * ```
	 * var latlng = L.latLng(50.5, 30.5);
	 * ```
	 *
	 * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
	 *
	 * ```
	 * map.panTo([50, 30]);
	 * map.panTo({lon: 30, lat: 50});
	 * map.panTo({lat: 50, lng: 30});
	 * map.panTo(L.latLng(50, 30));
	 * ```
	 *
	 * Note that `LatLng` does not inherit from Leaflet's `Class` object,
	 * which means new classes can't inherit from it, and new methods
	 * can't be added to it with the `include` function.
	 */

	function LatLng(lat, lng, alt) {
		if (isNaN(lat) || isNaN(lng)) {
			throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
		}

		// @property lat: Number
		// Latitude in degrees
		this.lat = +lat;

		// @property lng: Number
		// Longitude in degrees
		this.lng = +lng;

		// @property alt: Number
		// Altitude in meters (optional)
		if (alt !== undefined) {
			this.alt = +alt;
		}
	}

	LatLng.prototype = {
		// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
		// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
		equals: function (obj, maxMargin) {
			if (!obj) { return false; }

			obj = toLatLng(obj);

			var margin = Math.max(
			        Math.abs(this.lat - obj.lat),
			        Math.abs(this.lng - obj.lng));

			return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
		},

		// @method toString(): String
		// Returns a string representation of the point (for debugging purposes).
		toString: function (precision) {
			return 'LatLng(' +
			        formatNum(this.lat, precision) + ', ' +
			        formatNum(this.lng, precision) + ')';
		},

		// @method distanceTo(otherLatLng: LatLng): Number
		// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
		distanceTo: function (other) {
			return Earth.distance(this, toLatLng(other));
		},

		// @method wrap(): LatLng
		// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
		wrap: function () {
			return Earth.wrapLatLng(this);
		},

		// @method toBounds(sizeInMeters: Number): LatLngBounds
		// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
		toBounds: function (sizeInMeters) {
			var latAccuracy = 180 * sizeInMeters / 40075017,
			    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

			return toLatLngBounds(
			        [this.lat - latAccuracy, this.lng - lngAccuracy],
			        [this.lat + latAccuracy, this.lng + lngAccuracy]);
		},

		clone: function () {
			return new LatLng(this.lat, this.lng, this.alt);
		}
	};



	// @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
	// Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

	// @alternative
	// @factory L.latLng(coords: Array): LatLng
	// Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

	// @alternative
	// @factory L.latLng(coords: Object): LatLng
	// Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

	function toLatLng(a, b, c) {
		if (a instanceof LatLng) {
			return a;
		}
		if (isArray(a) && typeof a[0] !== 'object') {
			if (a.length === 3) {
				return new LatLng(a[0], a[1], a[2]);
			}
			if (a.length === 2) {
				return new LatLng(a[0], a[1]);
			}
			return null;
		}
		if (a === undefined || a === null) {
			return a;
		}
		if (typeof a === 'object' && 'lat' in a) {
			return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
		}
		if (b === undefined) {
			return null;
		}
		return new LatLng(a, b, c);
	}

	/*
	 * @namespace CRS
	 * @crs L.CRS.Base
	 * Object that defines coordinate reference systems for projecting
	 * geographical points into pixel (screen) coordinates and back (and to
	 * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
	 * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
	 *
	 * Leaflet defines the most usual CRSs by default. If you want to use a
	 * CRS not defined by default, take a look at the
	 * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
	 *
	 * Note that the CRS instances do not inherit from Leafet's `Class` object,
	 * and can't be instantiated. Also, new classes can't inherit from them,
	 * and methods can't be added to them with the `include` function.
	 */

	var CRS = {
		// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
		// Projects geographical coordinates into pixel coordinates for a given zoom.
		latLngToPoint: function (latlng, zoom) {
			var projectedPoint = this.projection.project(latlng),
			    scale = this.scale(zoom);

			return this.transformation._transform(projectedPoint, scale);
		},

		// @method pointToLatLng(point: Point, zoom: Number): LatLng
		// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
		// zoom into geographical coordinates.
		pointToLatLng: function (point, zoom) {
			var scale = this.scale(zoom),
			    untransformedPoint = this.transformation.untransform(point, scale);

			return this.projection.unproject(untransformedPoint);
		},

		// @method project(latlng: LatLng): Point
		// Projects geographical coordinates into coordinates in units accepted for
		// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
		project: function (latlng) {
			return this.projection.project(latlng);
		},

		// @method unproject(point: Point): LatLng
		// Given a projected coordinate returns the corresponding LatLng.
		// The inverse of `project`.
		unproject: function (point) {
			return this.projection.unproject(point);
		},

		// @method scale(zoom: Number): Number
		// Returns the scale used when transforming projected coordinates into
		// pixel coordinates for a particular zoom. For example, it returns
		// `256 * 2^zoom` for Mercator-based CRS.
		scale: function (zoom) {
			return 256 * Math.pow(2, zoom);
		},

		// @method zoom(scale: Number): Number
		// Inverse of `scale()`, returns the zoom level corresponding to a scale
		// factor of `scale`.
		zoom: function (scale) {
			return Math.log(scale / 256) / Math.LN2;
		},

		// @method getProjectedBounds(zoom: Number): Bounds
		// Returns the projection's bounds scaled and transformed for the provided `zoom`.
		getProjectedBounds: function (zoom) {
			if (this.infinite) { return null; }

			var b = this.projection.bounds,
			    s = this.scale(zoom),
			    min = this.transformation.transform(b.min, s),
			    max = this.transformation.transform(b.max, s);

			return new Bounds(min, max);
		},

		// @method distance(latlng1: LatLng, latlng2: LatLng): Number
		// Returns the distance between two geographical coordinates.

		// @property code: String
		// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
		//
		// @property wrapLng: Number[]
		// An array of two numbers defining whether the longitude (horizontal) coordinate
		// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
		// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
		//
		// @property wrapLat: Number[]
		// Like `wrapLng`, but for the latitude (vertical) axis.

		// wrapLng: [min, max],
		// wrapLat: [min, max],

		// @property infinite: Boolean
		// If true, the coordinate space will be unbounded (infinite in both axes)
		infinite: false,

		// @method wrapLatLng(latlng: LatLng): LatLng
		// Returns a `LatLng` where lat and lng has been wrapped according to the
		// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
		wrapLatLng: function (latlng) {
			var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
			    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
			    alt = latlng.alt;

			return new LatLng(lat, lng, alt);
		},

		// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
		// Returns a `LatLngBounds` with the same size as the given one, ensuring
		// that its center is within the CRS's bounds.
		// Only accepts actual `L.LatLngBounds` instances, not arrays.
		wrapLatLngBounds: function (bounds) {
			var center = bounds.getCenter(),
			    newCenter = this.wrapLatLng(center),
			    latShift = center.lat - newCenter.lat,
			    lngShift = center.lng - newCenter.lng;

			if (latShift === 0 && lngShift === 0) {
				return bounds;
			}

			var sw = bounds.getSouthWest(),
			    ne = bounds.getNorthEast(),
			    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
			    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

			return new LatLngBounds(newSw, newNe);
		}
	};

	/*
	 * @namespace CRS
	 * @crs L.CRS.Earth
	 *
	 * Serves as the base for CRS that are global such that they cover the earth.
	 * Can only be used as the base for other CRS and cannot be used directly,
	 * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
	 * meters.
	 */

	var Earth = extend({}, CRS, {
		wrapLng: [-180, 180],

		// Mean Earth Radius, as recommended for use by
		// the International Union of Geodesy and Geophysics,
		// see http://rosettacode.org/wiki/Haversine_formula
		R: 6371000,

		// distance between two geographical points using spherical law of cosines approximation
		distance: function (latlng1, latlng2) {
			var rad = Math.PI / 180,
			    lat1 = latlng1.lat * rad,
			    lat2 = latlng2.lat * rad,
			    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
			    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
			    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
			    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return this.R * c;
		}
	});

	/*
	 * @namespace Projection
	 * @projection L.Projection.SphericalMercator
	 *
	 * Spherical Mercator projection — the most common projection for online maps,
	 * used by almost all free and commercial tile providers. Assumes that Earth is
	 * a sphere. Used by the `EPSG:3857` CRS.
	 */

	var earthRadius = 6378137;

	var SphericalMercator = {

		R: earthRadius,
		MAX_LATITUDE: 85.0511287798,

		project: function (latlng) {
			var d = Math.PI / 180,
			    max = this.MAX_LATITUDE,
			    lat = Math.max(Math.min(max, latlng.lat), -max),
			    sin = Math.sin(lat * d);

			return new Point(
				this.R * latlng.lng * d,
				this.R * Math.log((1 + sin) / (1 - sin)) / 2);
		},

		unproject: function (point) {
			var d = 180 / Math.PI;

			return new LatLng(
				(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
				point.x * d / this.R);
		},

		bounds: (function () {
			var d = earthRadius * Math.PI;
			return new Bounds([-d, -d], [d, d]);
		})()
	};

	/*
	 * @class Transformation
	 * @aka L.Transformation
	 *
	 * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
	 * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
	 * the reverse. Used by Leaflet in its projections code.
	 *
	 * @example
	 *
	 * ```js
	 * var transformation = L.transformation(2, 5, -1, 10),
	 * 	p = L.point(1, 2),
	 * 	p2 = transformation.transform(p), //  L.point(7, 8)
	 * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
	 * ```
	 */


	// factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
	// Creates a `Transformation` object with the given coefficients.
	function Transformation(a, b, c, d) {
		if (isArray(a)) {
			// use array properties
			this._a = a[0];
			this._b = a[1];
			this._c = a[2];
			this._d = a[3];
			return;
		}
		this._a = a;
		this._b = b;
		this._c = c;
		this._d = d;
	}

	Transformation.prototype = {
		// @method transform(point: Point, scale?: Number): Point
		// Returns a transformed point, optionally multiplied by the given scale.
		// Only accepts actual `L.Point` instances, not arrays.
		transform: function (point, scale) { // (Point, Number) -> Point
			return this._transform(point.clone(), scale);
		},

		// destructive transform (faster)
		_transform: function (point, scale) {
			scale = scale || 1;
			point.x = scale * (this._a * point.x + this._b);
			point.y = scale * (this._c * point.y + this._d);
			return point;
		},

		// @method untransform(point: Point, scale?: Number): Point
		// Returns the reverse transformation of the given point, optionally divided
		// by the given scale. Only accepts actual `L.Point` instances, not arrays.
		untransform: function (point, scale) {
			scale = scale || 1;
			return new Point(
			        (point.x / scale - this._b) / this._a,
			        (point.y / scale - this._d) / this._c);
		}
	};

	// factory L.transformation(a: Number, b: Number, c: Number, d: Number)

	// @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
	// Instantiates a Transformation object with the given coefficients.

	// @alternative
	// @factory L.transformation(coefficients: Array): Transformation
	// Expects an coefficients array of the form
	// `[a: Number, b: Number, c: Number, d: Number]`.

	function toTransformation(a, b, c, d) {
		return new Transformation(a, b, c, d);
	}

	/*
	 * @namespace CRS
	 * @crs L.CRS.EPSG3857
	 *
	 * The most common CRS for online maps, used by almost all free and commercial
	 * tile providers. Uses Spherical Mercator projection. Set in by default in
	 * Map's `crs` option.
	 */

	var EPSG3857 = extend({}, Earth, {
		code: 'EPSG:3857',
		projection: SphericalMercator,

		transformation: (function () {
			var scale = 0.5 / (Math.PI * SphericalMercator.R);
			return toTransformation(scale, 0.5, -scale, 0.5);
		}())
	});

	var EPSG900913 = extend({}, EPSG3857, {
		code: 'EPSG:900913'
	});

	// @namespace SVG; @section
	// There are several static functions which can be called without instantiating L.SVG:

	// @function create(name: String): SVGElement
	// Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
	// corresponding to the class name passed. For example, using 'line' will return
	// an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
	function svgCreate(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	// @function pointsToPath(rings: Point[], closed: Boolean): String
	// Generates a SVG path string for multiple rings, with each ring turning
	// into "M..L..L.." instructions
	function pointsToPath(rings, closed) {
		var str = '',
		i, j, len, len2, points, p;

		for (i = 0, len = rings.length; i < len; i++) {
			points = rings[i];

			for (j = 0, len2 = points.length; j < len2; j++) {
				p = points[j];
				str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
			}

			// closes the ring for polygons; "x" is VML syntax
			str += closed ? (svg ? 'z' : 'x') : '';
		}

		// SVG complains about empty path strings
		return str || 'M0 0';
	}

	/*
	 * @namespace Browser
	 * @aka L.Browser
	 *
	 * A namespace with static properties for browser/feature detection used by Leaflet internally.
	 *
	 * @example
	 *
	 * ```js
	 * if (L.Browser.ielt9) {
	 *   alert('Upgrade your browser, dude!');
	 * }
	 * ```
	 */

	var style$1 = document.documentElement.style;

	// @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
	var ie = 'ActiveXObject' in window;

	// @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
	var ielt9 = ie && !document.addEventListener;

	// @property edge: Boolean; `true` for the Edge web browser.
	var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

	// @property webkit: Boolean;
	// `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
	var webkit = userAgentContains('webkit');

	// @property android: Boolean
	// `true` for any browser running on an Android platform.
	var android = userAgentContains('android');

	// @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
	var android23 = userAgentContains('android 2') || userAgentContains('android 3');

	/* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
	var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
	// @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
	var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

	// @property opera: Boolean; `true` for the Opera browser
	var opera = !!window.opera;

	// @property chrome: Boolean; `true` for the Chrome browser.
	var chrome = userAgentContains('chrome');

	// @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
	var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

	// @property safari: Boolean; `true` for the Safari browser.
	var safari = !chrome && userAgentContains('safari');

	var phantom = userAgentContains('phantom');

	// @property opera12: Boolean
	// `true` for the Opera browser supporting CSS transforms (version 12 or later).
	var opera12 = 'OTransition' in style$1;

	// @property win: Boolean; `true` when the browser is running in a Windows platform
	var win = navigator.platform.indexOf('Win') === 0;

	// @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
	var ie3d = ie && ('transition' in style$1);

	// @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
	var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

	// @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
	var gecko3d = 'MozPerspective' in style$1;

	// @property any3d: Boolean
	// `true` for all browsers supporting CSS transforms.
	var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

	// @property mobile: Boolean; `true` for all browsers running in a mobile device.
	var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

	// @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
	var mobileWebkit = mobile && webkit;

	// @property mobileWebkit3d: Boolean
	// `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
	var mobileWebkit3d = mobile && webkit3d;

	// @property msPointer: Boolean
	// `true` for browsers implementing the Microsoft touch events model (notably IE10).
	var msPointer = !window.PointerEvent && window.MSPointerEvent;

	// @property pointer: Boolean
	// `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
	var pointer = !webkit && !!(window.PointerEvent || msPointer);

	// @property touch: Boolean
	// `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
	// This does not necessarily mean that the browser is running in a computer with
	// a touchscreen, it only means that the browser is capable of understanding
	// touch events.
	var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
			(window.DocumentTouch && document instanceof window.DocumentTouch));

	// @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
	var mobileOpera = mobile && opera;

	// @property mobileGecko: Boolean
	// `true` for gecko-based browsers running in a mobile device.
	var mobileGecko = mobile && gecko;

	// @property retina: Boolean
	// `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
	var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

	// @property passiveEvents: Boolean
	// `true` for browsers that support passive events.
	var passiveEvents = (function () {
		var supportsPassiveOption = false;
		try {
			var opts = Object.defineProperty({}, 'passive', {
				get: function () {
					supportsPassiveOption = true;
				}
			});
			window.addEventListener('testPassiveEventSupport', falseFn, opts);
			window.removeEventListener('testPassiveEventSupport', falseFn, opts);
		} catch (e) {
			// Errors can safely be ignored since this is only a browser support test.
		}
		return supportsPassiveOption;
	});

	// @property canvas: Boolean
	// `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
	var canvas = (function () {
		return !!document.createElement('canvas').getContext;
	}());

	// @property svg: Boolean
	// `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
	var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

	// @property vml: Boolean
	// `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
	var vml = !svg && (function () {
		try {
			var div = document.createElement('div');
			div.innerHTML = '<v:shape adj="1"/>';

			var shape = div.firstChild;
			shape.style.behavior = 'url(#default#VML)';

			return shape && (typeof shape.adj === 'object');

		} catch (e) {
			return false;
		}
	}());


	function userAgentContains(str) {
		return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
	}


	var Browser = (Object.freeze || Object)({
		ie: ie,
		ielt9: ielt9,
		edge: edge,
		webkit: webkit,
		android: android,
		android23: android23,
		androidStock: androidStock,
		opera: opera,
		chrome: chrome,
		gecko: gecko,
		safari: safari,
		phantom: phantom,
		opera12: opera12,
		win: win,
		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		any3d: any3d,
		mobile: mobile,
		mobileWebkit: mobileWebkit,
		mobileWebkit3d: mobileWebkit3d,
		msPointer: msPointer,
		pointer: pointer,
		touch: touch,
		mobileOpera: mobileOpera,
		mobileGecko: mobileGecko,
		retina: retina,
		passiveEvents: passiveEvents,
		canvas: canvas,
		svg: svg,
		vml: vml
	});

	/*
	 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
	 */


	var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
	var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
	var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
	var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';
	var TAG_WHITE_LIST = ['INPUT', 'SELECT', 'OPTION'];

	var _pointers = {};
	var _pointerDocListener = false;

	// DomEvent.DoubleTap needs to know about this
	var _pointersCount = 0;

	// Provides a touch events wrapper for (ms)pointer events.
	// ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	function addPointerListener(obj, type, handler, id) {
		if (type === 'touchstart') {
			_addPointerStart(obj, handler, id);

		} else if (type === 'touchmove') {
			_addPointerMove(obj, handler, id);

		} else if (type === 'touchend') {
			_addPointerEnd(obj, handler, id);
		}

		return this;
	}

	function removePointerListener(obj, type, id) {
		var handler = obj['_leaflet_' + type + id];

		if (type === 'touchstart') {
			obj.removeEventListener(POINTER_DOWN, handler, false);

		} else if (type === 'touchmove') {
			obj.removeEventListener(POINTER_MOVE, handler, false);

		} else if (type === 'touchend') {
			obj.removeEventListener(POINTER_UP, handler, false);
			obj.removeEventListener(POINTER_CANCEL, handler, false);
		}

		return this;
	}

	function _addPointerStart(obj, handler, id) {
		var onDown = bind(function (e) {
			if (e.pointerType !== 'mouse' && e.MSPOINTER_TYPE_MOUSE && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
				// In IE11, some touch events needs to fire for form controls, or
				// the controls will stop working. We keep a whitelist of tag names that
				// need these events. For other target tags, we prevent default on the event.
				if (TAG_WHITE_LIST.indexOf(e.target.tagName) < 0) {
					preventDefault(e);
				} else {
					return;
				}
			}

			_handlePointer(e, handler);
		});

		obj['_leaflet_touchstart' + id] = onDown;
		obj.addEventListener(POINTER_DOWN, onDown, false);

		// need to keep track of what pointers and how many are active to provide e.touches emulation
		if (!_pointerDocListener) {
			// we listen documentElement as any drags that end by moving the touch off the screen get fired there
			document.documentElement.addEventListener(POINTER_DOWN, _globalPointerDown, true);
			document.documentElement.addEventListener(POINTER_MOVE, _globalPointerMove, true);
			document.documentElement.addEventListener(POINTER_UP, _globalPointerUp, true);
			document.documentElement.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

			_pointerDocListener = true;
		}
	}

	function _globalPointerDown(e) {
		_pointers[e.pointerId] = e;
		_pointersCount++;
	}

	function _globalPointerMove(e) {
		if (_pointers[e.pointerId]) {
			_pointers[e.pointerId] = e;
		}
	}

	function _globalPointerUp(e) {
		delete _pointers[e.pointerId];
		_pointersCount--;
	}

	function _handlePointer(e, handler) {
		e.touches = [];
		for (var i in _pointers) {
			e.touches.push(_pointers[i]);
		}
		e.changedTouches = [e];

		handler(e);
	}

	function _addPointerMove(obj, handler, id) {
		var onMove = function (e) {
			// don't fire touch moves when mouse isn't down
			if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

			_handlePointer(e, handler);
		};

		obj['_leaflet_touchmove' + id] = onMove;
		obj.addEventListener(POINTER_MOVE, onMove, false);
	}

	function _addPointerEnd(obj, handler, id) {
		var onUp = function (e) {
			_handlePointer(e, handler);
		};

		obj['_leaflet_touchend' + id] = onUp;
		obj.addEventListener(POINTER_UP, onUp, false);
		obj.addEventListener(POINTER_CANCEL, onUp, false);
	}

	/*
	 * Extends the event handling code with double tap support for mobile browsers.
	 */

	var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
	var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
	var _pre = '_leaflet_';

	// inspired by Zepto touch code by Thomas Fuchs
	function addDoubleTapListener(obj, handler, id) {
		var last, touch$$1,
		    doubleTap = false,
		    delay = 250;

		function onTouchStart(e) {
			var count;

			if (pointer) {
				if ((!edge) || e.pointerType === 'mouse') { return; }
				count = _pointersCount;
			} else {
				count = e.touches.length;
			}

			if (count > 1) { return; }

			var now = Date.now(),
			    delta = now - (last || now);

			touch$$1 = e.touches ? e.touches[0] : e;
			doubleTap = (delta > 0 && delta <= delay);
			last = now;
		}

		function onTouchEnd(e) {
			if (doubleTap && !touch$$1.cancelBubble) {
				if (pointer) {
					if ((!edge) || e.pointerType === 'mouse') { return; }
					// work around .type being readonly with MSPointer* events
					var newTouch = {},
					    prop, i;

					for (i in touch$$1) {
						prop = touch$$1[i];
						newTouch[i] = prop && prop.bind ? prop.bind(touch$$1) : prop;
					}
					touch$$1 = newTouch;
				}
				touch$$1.type = 'dblclick';
				touch$$1.button = 0;
				handler(touch$$1);
				last = null;
			}
		}

		obj[_pre + _touchstart + id] = onTouchStart;
		obj[_pre + _touchend + id] = onTouchEnd;
		obj[_pre + 'dblclick' + id] = handler;

		obj.addEventListener(_touchstart, onTouchStart, passiveEvents ? {passive: false} : false);
		obj.addEventListener(_touchend, onTouchEnd, passiveEvents ? {passive: false} : false);

		// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
		// the browser doesn't fire touchend/pointerup events but does fire
		// native dblclicks. See #4127.
		// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
		obj.addEventListener('dblclick', handler, false);

		return this;
	}

	function removeDoubleTapListener(obj, id) {
		var touchstart = obj[_pre + _touchstart + id],
		    touchend = obj[_pre + _touchend + id],
		    dblclick = obj[_pre + 'dblclick' + id];

		obj.removeEventListener(_touchstart, touchstart, passiveEvents ? {passive: false} : false);
		obj.removeEventListener(_touchend, touchend, passiveEvents ? {passive: false} : false);
		if (!edge) {
			obj.removeEventListener('dblclick', dblclick, false);
		}

		return this;
	}

	/*
	 * @namespace DomUtil
	 *
	 * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
	 * tree, used by Leaflet internally.
	 *
	 * Most functions expecting or returning a `HTMLElement` also work for
	 * SVG elements. The only difference is that classes refer to CSS classes
	 * in HTML and SVG classes in SVG.
	 */


	// @property TRANSFORM: String
	// Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
	var TRANSFORM = testProp(
		['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

	// webkitTransition comes first because some browser versions that drop vendor prefix don't do
	// the same for the transitionend event, in particular the Android 4.1 stock browser

	// @property TRANSITION: String
	// Vendor-prefixed transition style name.
	var TRANSITION = testProp(
		['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

	// @property TRANSITION_END: String
	// Vendor-prefixed transitionend event name.
	var TRANSITION_END =
		TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


	// @function get(id: String|HTMLElement): HTMLElement
	// Returns an element given its DOM id, or returns the element itself
	// if it was passed directly.
	function get(id) {
		return typeof id === 'string' ? document.getElementById(id) : id;
	}

	// @function getStyle(el: HTMLElement, styleAttrib: String): String
	// Returns the value for a certain style attribute on an element,
	// including computed values or values set through CSS.
	function getStyle(el, style) {
		var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}
		return value === 'auto' ? null : value;
	}

	// @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
	// Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
	function create$1(tagName, className, container) {
		var el = document.createElement(tagName);
		el.className = className || '';

		if (container) {
			container.appendChild(el);
		}
		return el;
	}

	// @function remove(el: HTMLElement)
	// Removes `el` from its parent element
	function remove(el) {
		var parent = el.parentNode;
		if (parent) {
			parent.removeChild(el);
		}
	}

	// @function empty(el: HTMLElement)
	// Removes all of `el`'s children elements from `el`
	function empty(el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	}

	// @function toFront(el: HTMLElement)
	// Makes `el` the last child of its parent, so it renders in front of the other children.
	function toFront(el) {
		var parent = el.parentNode;
		if (parent && parent.lastChild !== el) {
			parent.appendChild(el);
		}
	}

	// @function toBack(el: HTMLElement)
	// Makes `el` the first child of its parent, so it renders behind the other children.
	function toBack(el) {
		var parent = el.parentNode;
		if (parent && parent.firstChild !== el) {
			parent.insertBefore(el, parent.firstChild);
		}
	}

	// @function hasClass(el: HTMLElement, name: String): Boolean
	// Returns `true` if the element's class attribute contains `name`.
	function hasClass(el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	}

	// @function addClass(el: HTMLElement, name: String)
	// Adds `name` to the element's class attribute.
	function addClass(el, name) {
		if (el.classList !== undefined) {
			var classes = splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!hasClass(el, name)) {
			var className = getClass(el);
			setClass(el, (className ? className + ' ' : '') + name);
		}
	}

	// @function removeClass(el: HTMLElement, name: String)
	// Removes `name` from the element's class attribute.
	function removeClass(el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	}

	// @function setClass(el: HTMLElement, name: String)
	// Sets the element's class.
	function setClass(el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	}

	// @function getClass(el: HTMLElement): String
	// Returns the element's class.
	function getClass(el) {
		// Check if the element is an SVGElementInstance and use the correspondingElement instead
		// (Required for linked SVG elements in IE11.)
		if (el.correspondingElement) {
			el = el.correspondingElement;
		}
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	}

	// @function setOpacity(el: HTMLElement, opacity: Number)
	// Set the opacity of an element (including old IE support).
	// `opacity` must be a number from `0` to `1`.
	function setOpacity(el, value) {
		if ('opacity' in el.style) {
			el.style.opacity = value;
		} else if ('filter' in el.style) {
			_setOpacityIE(el, value);
		}
	}

	function _setOpacityIE(el, value) {
		var filter = false,
		    filterName = 'DXImageTransform.Microsoft.Alpha';

		// filters collection throws an error if we try to retrieve a filter that doesn't exist
		try {
			filter = el.filters.item(filterName);
		} catch (e) {
			// don't set opacity to 1 if we haven't already set an opacity,
			// it isn't needed and breaks transparent pngs.
			if (value === 1) { return; }
		}

		value = Math.round(value * 100);

		if (filter) {
			filter.Enabled = (value !== 100);
			filter.Opacity = value;
		} else {
			el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
		}
	}

	// @function testProp(props: String[]): String|false
	// Goes through the array of style names and returns the first name
	// that is a valid style name for an element. If no such name is found,
	// it returns false. Useful for vendor-prefixed styles like `transform`.
	function testProp(props) {
		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	}

	// @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
	// Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
	// and optionally scaled by `scale`. Does not have an effect if the
	// browser doesn't support 3D CSS transforms.
	function setTransform(el, offset, scale) {
		var pos = offset || new Point(0, 0);

		el.style[TRANSFORM] =
			(ie3d ?
				'translate(' + pos.x + 'px,' + pos.y + 'px)' :
				'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
			(scale ? ' scale(' + scale + ')' : '');
	}

	// @function setPosition(el: HTMLElement, position: Point)
	// Sets the position of `el` to coordinates specified by `position`,
	// using CSS translate or top/left positioning depending on the browser
	// (used by Leaflet internally to position its layers).
	function setPosition(el, point) {

		/*eslint-disable */
		el._leaflet_pos = point;
		/* eslint-enable */

		if (any3d) {
			setTransform(el, point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	}

	// @function getPosition(el: HTMLElement): Point
	// Returns the coordinates of an element previously positioned with setPosition.
	function getPosition(el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		return el._leaflet_pos || new Point(0, 0);
	}

	// @function disableTextSelection()
	// Prevents the user from generating `selectstart` DOM events, usually generated
	// when the user drags the mouse through a page with text. Used internally
	// by Leaflet to override the behaviour of any click-and-drag interaction on
	// the map. Affects drag interactions on the whole document.

	// @function enableTextSelection()
	// Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
	var disableTextSelection;
	var enableTextSelection;
	var _userSelect;
	if ('onselectstart' in document) {
		disableTextSelection = function () {
			on(window, 'selectstart', preventDefault);
		};
		enableTextSelection = function () {
			off(window, 'selectstart', preventDefault);
		};
	} else {
		var userSelectProperty = testProp(
			['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

		disableTextSelection = function () {
			if (userSelectProperty) {
				var style = document.documentElement.style;
				_userSelect = style[userSelectProperty];
				style[userSelectProperty] = 'none';
			}
		};
		enableTextSelection = function () {
			if (userSelectProperty) {
				document.documentElement.style[userSelectProperty] = _userSelect;
				_userSelect = undefined;
			}
		};
	}

	// @function disableImageDrag()
	// As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
	// for `dragstart` DOM events, usually generated when the user drags an image.
	function disableImageDrag() {
		on(window, 'dragstart', preventDefault);
	}

	// @function enableImageDrag()
	// Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
	function enableImageDrag() {
		off(window, 'dragstart', preventDefault);
	}

	var _outlineElement;
	var _outlineStyle;
	// @function preventOutline(el: HTMLElement)
	// Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
	// of the element `el` invisible. Used internally by Leaflet to prevent
	// focusable elements from displaying an outline when the user performs a
	// drag interaction on them.
	function preventOutline(element) {
		while (element.tabIndex === -1) {
			element = element.parentNode;
		}
		if (!element.style) { return; }
		restoreOutline();
		_outlineElement = element;
		_outlineStyle = element.style.outline;
		element.style.outline = 'none';
		on(window, 'keydown', restoreOutline);
	}

	// @function restoreOutline()
	// Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
	function restoreOutline() {
		if (!_outlineElement) { return; }
		_outlineElement.style.outline = _outlineStyle;
		_outlineElement = undefined;
		_outlineStyle = undefined;
		off(window, 'keydown', restoreOutline);
	}

	// @function getSizedParentNode(el: HTMLElement): HTMLElement
	// Finds the closest parent node which size (width and height) is not null.
	function getSizedParentNode(element) {
		do {
			element = element.parentNode;
		} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
		return element;
	}

	// @function getScale(el: HTMLElement): Object
	// Computes the CSS scale currently applied on the element.
	// Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
	// and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
	function getScale(element) {
		var rect = element.getBoundingClientRect(); // Read-only in old browsers.

		return {
			x: rect.width / element.offsetWidth || 1,
			y: rect.height / element.offsetHeight || 1,
			boundingClientRect: rect
		};
	}


	var DomUtil = (Object.freeze || Object)({
		TRANSFORM: TRANSFORM,
		TRANSITION: TRANSITION,
		TRANSITION_END: TRANSITION_END,
		get: get,
		getStyle: getStyle,
		create: create$1,
		remove: remove,
		empty: empty,
		toFront: toFront,
		toBack: toBack,
		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		setClass: setClass,
		getClass: getClass,
		setOpacity: setOpacity,
		testProp: testProp,
		setTransform: setTransform,
		setPosition: setPosition,
		getPosition: getPosition,
		disableTextSelection: disableTextSelection,
		enableTextSelection: enableTextSelection,
		disableImageDrag: disableImageDrag,
		enableImageDrag: enableImageDrag,
		preventOutline: preventOutline,
		restoreOutline: restoreOutline,
		getSizedParentNode: getSizedParentNode,
		getScale: getScale
	});

	/*
	 * @namespace DomEvent
	 * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
	 */

	// Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

	// @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
	// Adds a listener function (`fn`) to a particular DOM event type of the
	// element `el`. You can optionally specify the context of the listener
	// (object the `this` keyword will point to). You can also pass several
	// space-separated types (e.g. `'click dblclick'`).

	// @alternative
	// @function on(el: HTMLElement, eventMap: Object, context?: Object): this
	// Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	function on(obj, types, fn, context) {

		if (typeof types === 'object') {
			for (var type in types) {
				addOne(obj, type, types[type], fn);
			}
		} else {
			types = splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				addOne(obj, types[i], fn, context);
			}
		}

		return this;
	}

	var eventsKey = '_leaflet_events';

	// @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
	// Removes a previously added listener function.
	// Note that if you passed a custom context to on, you must pass the same
	// context to `off` in order to remove the listener.

	// @alternative
	// @function off(el: HTMLElement, eventMap: Object, context?: Object): this
	// Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	function off(obj, types, fn, context) {

		if (typeof types === 'object') {
			for (var type in types) {
				removeOne(obj, type, types[type], fn);
			}
		} else if (types) {
			types = splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				removeOne(obj, types[i], fn, context);
			}
		} else {
			for (var j in obj[eventsKey]) {
				removeOne(obj, j, obj[eventsKey][j]);
			}
			delete obj[eventsKey];
		}

		return this;
	}

	function addOne(obj, type, fn, context) {
		var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

		if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

		var handler = function (e) {
			return fn.call(context || obj, e || window.event);
		};

		var originalHandler = handler;

		if (pointer && type.indexOf('touch') === 0) {
			// Needs DomEvent.Pointer.js
			addPointerListener(obj, type, handler, id);

		} else if (touch && (type === 'dblclick') && addDoubleTapListener &&
		           !(pointer && chrome)) {
			// Chrome >55 does not need the synthetic dblclicks from addDoubleTapListener
			// See #5180
			addDoubleTapListener(obj, handler, id);

		} else if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, passiveEvents ? {passive: false} : false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				handler = function (e) {
					e = e || window.event;
					if (isExternalTarget(obj, e)) {
						originalHandler(e);
					}
				};
				obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

			} else {
				if (type === 'click' && android) {
					handler = function (e) {
						filterClick(e, originalHandler);
					};
				}
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[eventsKey] = obj[eventsKey] || {};
		obj[eventsKey][id] = handler;
	}

	function removeOne(obj, type, fn, context) {

		var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
		    handler = obj[eventsKey] && obj[eventsKey][id];

		if (!handler) { return this; }

		if (pointer && type.indexOf('touch') === 0) {
			removePointerListener(obj, type, id);

		} else if (touch && (type === 'dblclick') && removeDoubleTapListener &&
		           !(pointer && chrome)) {
			removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, passiveEvents ? {passive: false} : false);

			} else {
				obj.removeEventListener(
					type === 'mouseenter' ? 'mouseover' :
					type === 'mouseleave' ? 'mouseout' : type, handler, false);
			}

		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[eventsKey][id] = null;
	}

	// @function stopPropagation(ev: DOMEvent): this
	// Stop the given event from propagation to parent elements. Used inside the listener functions:
	// ```js
	// L.DomEvent.on(div, 'click', function (ev) {
	// 	L.DomEvent.stopPropagation(ev);
	// });
	// ```
	function stopPropagation(e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else if (e.originalEvent) {  // In case of Leaflet event.
			e.originalEvent._stopped = true;
		} else {
			e.cancelBubble = true;
		}
		skipped(e);

		return this;
	}

	// @function disableScrollPropagation(el: HTMLElement): this
	// Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
	function disableScrollPropagation(el) {
		addOne(el, 'mousewheel', stopPropagation);
		return this;
	}

	// @function disableClickPropagation(el: HTMLElement): this
	// Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
	// `'mousedown'` and `'touchstart'` events (plus browser variants).
	function disableClickPropagation(el) {
		on(el, 'mousedown touchstart dblclick', stopPropagation);
		addOne(el, 'click', fakeStop);
		return this;
	}

	// @function preventDefault(ev: DOMEvent): this
	// Prevents the default action of the DOM Event `ev` from happening (such as
	// following a link in the href of the a element, or doing a POST request
	// with page reload when a `<form>` is submitted).
	// Use it inside listener functions.
	function preventDefault(e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	}

	// @function stop(ev: DOMEvent): this
	// Does `stopPropagation` and `preventDefault` at the same time.
	function stop(e) {
		preventDefault(e);
		stopPropagation(e);
		return this;
	}

	// @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
	// Gets normalized mouse position from a DOM event relative to the
	// `container` (border excluded) or to the whole page if not specified.
	function getMousePosition(e, container) {
		if (!container) {
			return new Point(e.clientX, e.clientY);
		}

		var scale = getScale(container),
		    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

		return new Point(
			// offset.left/top values are in page scale (like clientX/Y),
			// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
			(e.clientX - offset.left) / scale.x - container.clientLeft,
			(e.clientY - offset.top) / scale.y - container.clientTop
		);
	}

	// Chrome on Win scrolls double the pixels as in other platforms (see #4538),
	// and Firefox scrolls device pixels, not CSS pixels
	var wheelPxFactor =
		(win && chrome) ? 2 * window.devicePixelRatio :
		gecko ? window.devicePixelRatio : 1;

	// @function getWheelDelta(ev: DOMEvent): Number
	// Gets normalized wheel delta from a mousewheel DOM event, in vertical
	// pixels scrolled (negative if scrolling down).
	// Events from pointing devices without precise scrolling are mapped to
	// a best guess of 60 pixels.
	function getWheelDelta(e) {
		return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
		       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
		       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
		       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
		       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
		       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
		       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
		       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
		       0;
	}

	var skipEvents = {};

	function fakeStop(e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
		skipEvents[e.type] = true;
	}

	function skipped(e) {
		var events = skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		skipEvents[e.type] = false;
		return events;
	}

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	function isExternalTarget(el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	}

	var lastClick;

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	function filterClick(e, handler) {
		var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
		    elapsed = lastClick && (timeStamp - lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			stop(e);
			return;
		}
		lastClick = timeStamp;

		handler(e);
	}




	var DomEvent = (Object.freeze || Object)({
		on: on,
		off: off,
		stopPropagation: stopPropagation,
		disableScrollPropagation: disableScrollPropagation,
		disableClickPropagation: disableClickPropagation,
		preventDefault: preventDefault,
		stop: stop,
		getMousePosition: getMousePosition,
		getWheelDelta: getWheelDelta,
		fakeStop: fakeStop,
		skipped: skipped,
		isExternalTarget: isExternalTarget,
		addListener: on,
		removeListener: off
	});

	/*
	 * @class PosAnimation
	 * @aka L.PosAnimation
	 * @inherits Evented
	 * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
	 *
	 * @example
	 * ```js
	 * var fx = new L.PosAnimation();
	 * fx.run(el, [300, 500], 0.5);
	 * ```
	 *
	 * @constructor L.PosAnimation()
	 * Creates a `PosAnimation` object.
	 *
	 */

	var PosAnimation = Evented.extend({

		// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
		// Run an animation of a given element to a new position, optionally setting
		// duration in seconds (`0.25` by default) and easing linearity factor (3rd
		// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
		// `0.5` by default).
		run: function (el, newPos, duration, easeLinearity) {
			this.stop();

			this._el = el;
			this._inProgress = true;
			this._duration = duration || 0.25;
			this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

			this._startPos = getPosition(el);
			this._offset = newPos.subtract(this._startPos);
			this._startTime = +new Date();

			// @event start: Event
			// Fired when the animation starts
			this.fire('start');

			this._animate();
		},

		// @method stop()
		// Stops the animation (if currently running).
		stop: function () {
			if (!this._inProgress) { return; }

			this._step(true);
			this._complete();
		},

		_animate: function () {
			// animation loop
			this._animId = requestAnimFrame(this._animate, this);
			this._step();
		},

		_step: function (round) {
			var elapsed = (+new Date()) - this._startTime,
			    duration = this._duration * 1000;

			if (elapsed < duration) {
				this._runFrame(this._easeOut(elapsed / duration), round);
			} else {
				this._runFrame(1);
				this._complete();
			}
		},

		_runFrame: function (progress, round) {
			var pos = this._startPos.add(this._offset.multiplyBy(progress));
			if (round) {
				pos._round();
			}
			setPosition(this._el, pos);

			// @event step: Event
			// Fired continuously during the animation.
			this.fire('step');
		},

		_complete: function () {
			cancelAnimFrame(this._animId);

			this._inProgress = false;
			// @event end: Event
			// Fired when the animation ends.
			this.fire('end');
		},

		_easeOut: function (t) {
			return 1 - Math.pow(1 - t, this._easeOutPower);
		}
	});

	/*
	 * @class Map
	 * @aka L.Map
	 * @inherits Evented
	 *
	 * The central class of the API — it is used to create a map on a page and manipulate it.
	 *
	 * @example
	 *
	 * ```js
	 * // initialize the map on the "map" div with a given center and zoom
	 * var map = L.map('map', {
	 * 	center: [51.505, -0.09],
	 * 	zoom: 13
	 * });
	 * ```
	 *
	 */

	var Map = Evented.extend({

		options: {
			// @section Map State Options
			// @option crs: CRS = L.CRS.EPSG3857
			// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
			// sure what it means.
			crs: EPSG3857,

			// @option center: LatLng = undefined
			// Initial geographic center of the map
			center: undefined,

			// @option zoom: Number = undefined
			// Initial map zoom level
			zoom: undefined,

			// @option minZoom: Number = *
			// Minimum zoom level of the map.
			// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
			// the lowest of their `minZoom` options will be used instead.
			minZoom: undefined,

			// @option maxZoom: Number = *
			// Maximum zoom level of the map.
			// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
			// the highest of their `maxZoom` options will be used instead.
			maxZoom: undefined,

			// @option layers: Layer[] = []
			// Array of layers that will be added to the map initially
			layers: [],

			// @option maxBounds: LatLngBounds = null
			// When this option is set, the map restricts the view to the given
			// geographical bounds, bouncing the user back if the user tries to pan
			// outside the view. To set the restriction dynamically, use
			// [`setMaxBounds`](#map-setmaxbounds) method.
			maxBounds: undefined,

			// @option renderer: Renderer = *
			// The default method for drawing vector layers on the map. `L.SVG`
			// or `L.Canvas` by default depending on browser support.
			renderer: undefined,


			// @section Animation Options
			// @option zoomAnimation: Boolean = true
			// Whether the map zoom animation is enabled. By default it's enabled
			// in all browsers that support CSS3 Transitions except Android.
			zoomAnimation: true,

			// @option zoomAnimationThreshold: Number = 4
			// Won't animate zoom if the zoom difference exceeds this value.
			zoomAnimationThreshold: 4,

			// @option fadeAnimation: Boolean = true
			// Whether the tile fade animation is enabled. By default it's enabled
			// in all browsers that support CSS3 Transitions except Android.
			fadeAnimation: true,

			// @option markerZoomAnimation: Boolean = true
			// Whether markers animate their zoom with the zoom animation, if disabled
			// they will disappear for the length of the animation. By default it's
			// enabled in all browsers that support CSS3 Transitions except Android.
			markerZoomAnimation: true,

			// @option transform3DLimit: Number = 2^23
			// Defines the maximum size of a CSS translation transform. The default
			// value should not be changed unless a web browser positions layers in
			// the wrong place after doing a large `panBy`.
			transform3DLimit: 8388608, // Precision limit of a 32-bit float

			// @section Interaction Options
			// @option zoomSnap: Number = 1
			// Forces the map's zoom level to always be a multiple of this, particularly
			// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
			// By default, the zoom level snaps to the nearest integer; lower values
			// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
			// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
			zoomSnap: 1,

			// @option zoomDelta: Number = 1
			// Controls how much the map's zoom level will change after a
			// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
			// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
			// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
			zoomDelta: 1,

			// @option trackResize: Boolean = true
			// Whether the map automatically handles browser window resize to update itself.
			trackResize: true
		},

		initialize: function (id, options) { // (HTMLElement or String, Object)
			options = setOptions(this, options);

			// Make sure to assign internal flags at the beginning,
			// to avoid inconsistent state in some edge cases.
			this._handlers = [];
			this._layers = {};
			this._zoomBoundLayers = {};
			this._sizeChanged = true;

			this._initContainer(id);
			this._initLayout();

			// hack for https://github.com/Leaflet/Leaflet/issues/1980
			this._onResize = bind(this._onResize, this);

			this._initEvents();

			if (options.maxBounds) {
				this.setMaxBounds(options.maxBounds);
			}

			if (options.zoom !== undefined) {
				this._zoom = this._limitZoom(options.zoom);
			}

			if (options.center && options.zoom !== undefined) {
				this.setView(toLatLng(options.center), options.zoom, {reset: true});
			}

			this.callInitHooks();

			// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
			this._zoomAnimated = TRANSITION && any3d && !mobileOpera &&
					this.options.zoomAnimation;

			// zoom transitions run with the same duration for all layers, so if one of transitionend events
			// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
			if (this._zoomAnimated) {
				this._createAnimProxy();
				on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
			}

			this._addLayers(this.options.layers);
		},


		// @section Methods for modifying map state

		// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
		// Sets the view of the map (geographical center and zoom) with the given
		// animation options.
		setView: function (center, zoom, options) {

			zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
			center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
			options = options || {};

			this._stop();

			if (this._loaded && !options.reset && options !== true) {

				if (options.animate !== undefined) {
					options.zoom = extend({animate: options.animate}, options.zoom);
					options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
				}

				// try animating pan or zoom
				var moved = (this._zoom !== zoom) ?
					this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
					this._tryAnimatedPan(center, options.pan);

				if (moved) {
					// prevent resize handler call, the view will refresh after animation anyway
					clearTimeout(this._sizeTimer);
					return this;
				}
			}

			// animation didn't start, just reset the map view
			this._resetView(center, zoom);

			return this;
		},

		// @method setZoom(zoom: Number, options?: Zoom/pan options): this
		// Sets the zoom of the map.
		setZoom: function (zoom, options) {
			if (!this._loaded) {
				this._zoom = zoom;
				return this;
			}
			return this.setView(this.getCenter(), zoom, {zoom: options});
		},

		// @method zoomIn(delta?: Number, options?: Zoom options): this
		// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
		zoomIn: function (delta, options) {
			delta = delta || (any3d ? this.options.zoomDelta : 1);
			return this.setZoom(this._zoom + delta, options);
		},

		// @method zoomOut(delta?: Number, options?: Zoom options): this
		// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
		zoomOut: function (delta, options) {
			delta = delta || (any3d ? this.options.zoomDelta : 1);
			return this.setZoom(this._zoom - delta, options);
		},

		// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
		// Zooms the map while keeping a specified geographical point on the map
		// stationary (e.g. used internally for scroll zoom and double-click zoom).
		// @alternative
		// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
		// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
		setZoomAround: function (latlng, zoom, options) {
			var scale = this.getZoomScale(zoom),
			    viewHalf = this.getSize().divideBy(2),
			    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

			    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
			    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

			return this.setView(newCenter, zoom, {zoom: options});
		},

		_getBoundsCenterZoom: function (bounds, options) {

			options = options || {};
			bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

			var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
			    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

			    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

			zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

			if (zoom === Infinity) {
				return {
					center: bounds.getCenter(),
					zoom: zoom
				};
			}

			var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

			    swPoint = this.project(bounds.getSouthWest(), zoom),
			    nePoint = this.project(bounds.getNorthEast(), zoom),
			    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

			return {
				center: center,
				zoom: zoom
			};
		},

		// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
		// Sets a map view that contains the given geographical bounds with the
		// maximum zoom level possible.
		fitBounds: function (bounds, options) {

			bounds = toLatLngBounds(bounds);

			if (!bounds.isValid()) {
				throw new Error('Bounds are not valid.');
			}

			var target = this._getBoundsCenterZoom(bounds, options);
			return this.setView(target.center, target.zoom, options);
		},

		// @method fitWorld(options?: fitBounds options): this
		// Sets a map view that mostly contains the whole world with the maximum
		// zoom level possible.
		fitWorld: function (options) {
			return this.fitBounds([[-90, -180], [90, 180]], options);
		},

		// @method panTo(latlng: LatLng, options?: Pan options): this
		// Pans the map to a given center.
		panTo: function (center, options) { // (LatLng)
			return this.setView(center, this._zoom, {pan: options});
		},

		// @method panBy(offset: Point, options?: Pan options): this
		// Pans the map by a given number of pixels (animated).
		panBy: function (offset, options) {
			offset = toPoint(offset).round();
			options = options || {};

			if (!offset.x && !offset.y) {
				return this.fire('moveend');
			}
			// If we pan too far, Chrome gets issues with tiles
			// and makes them disappear or appear in the wrong place (slightly offset) #2602
			if (options.animate !== true && !this.getSize().contains(offset)) {
				this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
				return this;
			}

			if (!this._panAnim) {
				this._panAnim = new PosAnimation();

				this._panAnim.on({
					'step': this._onPanTransitionStep,
					'end': this._onPanTransitionEnd
				}, this);
			}

			// don't fire movestart if animating inertia
			if (!options.noMoveStart) {
				this.fire('movestart');
			}

			// animate pan unless animate: false specified
			if (options.animate !== false) {
				addClass(this._mapPane, 'leaflet-pan-anim');

				var newPos = this._getMapPanePos().subtract(offset).round();
				this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
			} else {
				this._rawPanBy(offset);
				this.fire('move').fire('moveend');
			}

			return this;
		},

		// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
		// Sets the view of the map (geographical center and zoom) performing a smooth
		// pan-zoom animation.
		flyTo: function (targetCenter, targetZoom, options) {

			options = options || {};
			if (options.animate === false || !any3d) {
				return this.setView(targetCenter, targetZoom, options);
			}

			this._stop();

			var from = this.project(this.getCenter()),
			    to = this.project(targetCenter),
			    size = this.getSize(),
			    startZoom = this._zoom;

			targetCenter = toLatLng(targetCenter);
			targetZoom = targetZoom === undefined ? startZoom : targetZoom;

			var w0 = Math.max(size.x, size.y),
			    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
			    u1 = (to.distanceTo(from)) || 1,
			    rho = 1.42,
			    rho2 = rho * rho;

			function r(i) {
				var s1 = i ? -1 : 1,
				    s2 = i ? w1 : w0,
				    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
				    b1 = 2 * s2 * rho2 * u1,
				    b = t1 / b1,
				    sq = Math.sqrt(b * b + 1) - b;

				    // workaround for floating point precision bug when sq = 0, log = -Infinite,
				    // thus triggering an infinite loop in flyTo
				    var log = sq < 0.000000001 ? -18 : Math.log(sq);

				return log;
			}

			function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
			function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
			function tanh(n) { return sinh(n) / cosh(n); }

			var r0 = r(0);

			function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
			function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

			function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

			var start = Date.now(),
			    S = (r(1) - r0) / rho,
			    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

			function frame() {
				var t = (Date.now() - start) / duration,
				    s = easeOut(t) * S;

				if (t <= 1) {
					this._flyToFrame = requestAnimFrame(frame, this);

					this._move(
						this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
						this.getScaleZoom(w0 / w(s), startZoom),
						{flyTo: true});

				} else {
					this
						._move(targetCenter, targetZoom)
						._moveEnd(true);
				}
			}

			this._moveStart(true, options.noMoveStart);

			frame.call(this);
			return this;
		},

		// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
		// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
		// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
		flyToBounds: function (bounds, options) {
			var target = this._getBoundsCenterZoom(bounds, options);
			return this.flyTo(target.center, target.zoom, options);
		},

		// @method setMaxBounds(bounds: Bounds): this
		// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
		setMaxBounds: function (bounds) {
			bounds = toLatLngBounds(bounds);

			if (!bounds.isValid()) {
				this.options.maxBounds = null;
				return this.off('moveend', this._panInsideMaxBounds);
			} else if (this.options.maxBounds) {
				this.off('moveend', this._panInsideMaxBounds);
			}

			this.options.maxBounds = bounds;

			if (this._loaded) {
				this._panInsideMaxBounds();
			}

			return this.on('moveend', this._panInsideMaxBounds);
		},

		// @method setMinZoom(zoom: Number): this
		// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
		setMinZoom: function (zoom) {
			var oldZoom = this.options.minZoom;
			this.options.minZoom = zoom;

			if (this._loaded && oldZoom !== zoom) {
				this.fire('zoomlevelschange');

				if (this.getZoom() < this.options.minZoom) {
					return this.setZoom(zoom);
				}
			}

			return this;
		},

		// @method setMaxZoom(zoom: Number): this
		// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
		setMaxZoom: function (zoom) {
			var oldZoom = this.options.maxZoom;
			this.options.maxZoom = zoom;

			if (this._loaded && oldZoom !== zoom) {
				this.fire('zoomlevelschange');

				if (this.getZoom() > this.options.maxZoom) {
					return this.setZoom(zoom);
				}
			}

			return this;
		},

		// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
		// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
		panInsideBounds: function (bounds, options) {
			this._enforcingBounds = true;
			var center = this.getCenter(),
			    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

			if (!center.equals(newCenter)) {
				this.panTo(newCenter, options);
			}

			this._enforcingBounds = false;
			return this;
		},

		// @method panInside(latlng: LatLng, options?: options): this
		// Pans the map the minimum amount to make the `latlng` visible. Use
		// `padding`, `paddingTopLeft` and `paddingTopRight` options to fit
		// the display to more restricted bounds, like [`fitBounds`](#map-fitbounds).
		// If `latlng` is already within the (optionally padded) display bounds,
		// the map will not be panned.
		panInside: function (latlng, options) {
			options = options || {};

			var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
			    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
			    center = this.getCenter(),
			    pixelCenter = this.project(center),
			    pixelPoint = this.project(latlng),
			    pixelBounds = this.getPixelBounds(),
			    halfPixelBounds = pixelBounds.getSize().divideBy(2),
			    paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]);

			if (!paddedBounds.contains(pixelPoint)) {
				this._enforcingBounds = true;
				var diff = pixelCenter.subtract(pixelPoint),
				    newCenter = toPoint(pixelPoint.x + diff.x, pixelPoint.y + diff.y);

				if (pixelPoint.x < paddedBounds.min.x || pixelPoint.x > paddedBounds.max.x) {
					newCenter.x = pixelCenter.x - diff.x;
					if (diff.x > 0) {
						newCenter.x += halfPixelBounds.x - paddingTL.x;
					} else {
						newCenter.x -= halfPixelBounds.x - paddingBR.x;
					}
				}
				if (pixelPoint.y < paddedBounds.min.y || pixelPoint.y > paddedBounds.max.y) {
					newCenter.y = pixelCenter.y - diff.y;
					if (diff.y > 0) {
						newCenter.y += halfPixelBounds.y - paddingTL.y;
					} else {
						newCenter.y -= halfPixelBounds.y - paddingBR.y;
					}
				}
				this.panTo(this.unproject(newCenter), options);
				this._enforcingBounds = false;
			}
			return this;
		},

		// @method invalidateSize(options: Zoom/pan options): this
		// Checks if the map container size changed and updates the map if so —
		// call it after you've changed the map size dynamically, also animating
		// pan by default. If `options.pan` is `false`, panning will not occur.
		// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
		// that it doesn't happen often even if the method is called many
		// times in a row.

		// @alternative
		// @method invalidateSize(animate: Boolean): this
		// Checks if the map container size changed and updates the map if so —
		// call it after you've changed the map size dynamically, also animating
		// pan by default.
		invalidateSize: function (options) {
			if (!this._loaded) { return this; }

			options = extend({
				animate: false,
				pan: true
			}, options === true ? {animate: true} : options);

			var oldSize = this.getSize();
			this._sizeChanged = true;
			this._lastCenter = null;

			var newSize = this.getSize(),
			    oldCenter = oldSize.divideBy(2).round(),
			    newCenter = newSize.divideBy(2).round(),
			    offset = oldCenter.subtract(newCenter);

			if (!offset.x && !offset.y) { return this; }

			if (options.animate && options.pan) {
				this.panBy(offset);

			} else {
				if (options.pan) {
					this._rawPanBy(offset);
				}

				this.fire('move');

				if (options.debounceMoveend) {
					clearTimeout(this._sizeTimer);
					this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
				} else {
					this.fire('moveend');
				}
			}

			// @section Map state change events
			// @event resize: ResizeEvent
			// Fired when the map is resized.
			return this.fire('resize', {
				oldSize: oldSize,
				newSize: newSize
			});
		},

		// @section Methods for modifying map state
		// @method stop(): this
		// Stops the currently running `panTo` or `flyTo` animation, if any.
		stop: function () {
			this.setZoom(this._limitZoom(this._zoom));
			if (!this.options.zoomSnap) {
				this.fire('viewreset');
			}
			return this._stop();
		},

		// @section Geolocation methods
		// @method locate(options?: Locate options): this
		// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
		// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
		// and optionally sets the map view to the user's location with respect to
		// detection accuracy (or to the world view if geolocation failed).
		// Note that, if your page doesn't use HTTPS, this method will fail in
		// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
		// See `Locate options` for more details.
		locate: function (options) {

			options = this._locateOptions = extend({
				timeout: 10000,
				watch: false
				// setView: false
				// maxZoom: <Number>
				// maximumAge: 0
				// enableHighAccuracy: false
			}, options);

			if (!('geolocation' in navigator)) {
				this._handleGeolocationError({
					code: 0,
					message: 'Geolocation not supported.'
				});
				return this;
			}

			var onResponse = bind(this._handleGeolocationResponse, this),
			    onError = bind(this._handleGeolocationError, this);

			if (options.watch) {
				this._locationWatchId =
				        navigator.geolocation.watchPosition(onResponse, onError, options);
			} else {
				navigator.geolocation.getCurrentPosition(onResponse, onError, options);
			}
			return this;
		},

		// @method stopLocate(): this
		// Stops watching location previously initiated by `map.locate({watch: true})`
		// and aborts resetting the map view if map.locate was called with
		// `{setView: true}`.
		stopLocate: function () {
			if (navigator.geolocation && navigator.geolocation.clearWatch) {
				navigator.geolocation.clearWatch(this._locationWatchId);
			}
			if (this._locateOptions) {
				this._locateOptions.setView = false;
			}
			return this;
		},

		_handleGeolocationError: function (error) {
			var c = error.code,
			    message = error.message ||
			            (c === 1 ? 'permission denied' :
			            (c === 2 ? 'position unavailable' : 'timeout'));

			if (this._locateOptions.setView && !this._loaded) {
				this.fitWorld();
			}

			// @section Location events
			// @event locationerror: ErrorEvent
			// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
			this.fire('locationerror', {
				code: c,
				message: 'Geolocation error: ' + message + '.'
			});
		},

		_handleGeolocationResponse: function (pos) {
			var lat = pos.coords.latitude,
			    lng = pos.coords.longitude,
			    latlng = new LatLng(lat, lng),
			    bounds = latlng.toBounds(pos.coords.accuracy * 2),
			    options = this._locateOptions;

			if (options.setView) {
				var zoom = this.getBoundsZoom(bounds);
				this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
			}

			var data = {
				latlng: latlng,
				bounds: bounds,
				timestamp: pos.timestamp
			};

			for (var i in pos.coords) {
				if (typeof pos.coords[i] === 'number') {
					data[i] = pos.coords[i];
				}
			}

			// @event locationfound: LocationEvent
			// Fired when geolocation (using the [`locate`](#map-locate) method)
			// went successfully.
			this.fire('locationfound', data);
		},

		// TODO Appropriate docs section?
		// @section Other Methods
		// @method addHandler(name: String, HandlerClass: Function): this
		// Adds a new `Handler` to the map, given its name and constructor function.
		addHandler: function (name, HandlerClass) {
			if (!HandlerClass) { return this; }

			var handler = this[name] = new HandlerClass(this);

			this._handlers.push(handler);

			if (this.options[name]) {
				handler.enable();
			}

			return this;
		},

		// @method remove(): this
		// Destroys the map and clears all related event listeners.
		remove: function () {

			this._initEvents(true);

			if (this._containerId !== this._container._leaflet_id) {
				throw new Error('Map container is being reused by another instance');
			}

			try {
				// throws error in IE6-8
				delete this._container._leaflet_id;
				delete this._containerId;
			} catch (e) {
				/*eslint-disable */
				this._container._leaflet_id = undefined;
				/* eslint-enable */
				this._containerId = undefined;
			}

			if (this._locationWatchId !== undefined) {
				this.stopLocate();
			}

			this._stop();

			remove(this._mapPane);

			if (this._clearControlPos) {
				this._clearControlPos();
			}
			if (this._resizeRequest) {
				cancelAnimFrame(this._resizeRequest);
				this._resizeRequest = null;
			}

			this._clearHandlers();

			if (this._loaded) {
				// @section Map state change events
				// @event unload: Event
				// Fired when the map is destroyed with [remove](#map-remove) method.
				this.fire('unload');
			}

			var i;
			for (i in this._layers) {
				this._layers[i].remove();
			}
			for (i in this._panes) {
				remove(this._panes[i]);
			}

			this._layers = [];
			this._panes = [];
			delete this._mapPane;
			delete this._renderer;

			return this;
		},

		// @section Other Methods
		// @method createPane(name: String, container?: HTMLElement): HTMLElement
		// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
		// then returns it. The pane is created as a child of `container`, or
		// as a child of the main map pane if not set.
		createPane: function (name, container) {
			var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
			    pane = create$1('div', className, container || this._mapPane);

			if (name) {
				this._panes[name] = pane;
			}
			return pane;
		},

		// @section Methods for Getting Map State

		// @method getCenter(): LatLng
		// Returns the geographical center of the map view
		getCenter: function () {
			this._checkIfLoaded();

			if (this._lastCenter && !this._moved()) {
				return this._lastCenter;
			}
			return this.layerPointToLatLng(this._getCenterLayerPoint());
		},

		// @method getZoom(): Number
		// Returns the current zoom level of the map view
		getZoom: function () {
			return this._zoom;
		},

		// @method getBounds(): LatLngBounds
		// Returns the geographical bounds visible in the current map view
		getBounds: function () {
			var bounds = this.getPixelBounds(),
			    sw = this.unproject(bounds.getBottomLeft()),
			    ne = this.unproject(bounds.getTopRight());

			return new LatLngBounds(sw, ne);
		},

		// @method getMinZoom(): Number
		// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
		getMinZoom: function () {
			return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
		},

		// @method getMaxZoom(): Number
		// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
		getMaxZoom: function () {
			return this.options.maxZoom === undefined ?
				(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
				this.options.maxZoom;
		},

		// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
		// Returns the maximum zoom level on which the given bounds fit to the map
		// view in its entirety. If `inside` (optional) is set to `true`, the method
		// instead returns the minimum zoom level on which the map view fits into
		// the given bounds in its entirety.
		getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
			bounds = toLatLngBounds(bounds);
			padding = toPoint(padding || [0, 0]);

			var zoom = this.getZoom() || 0,
			    min = this.getMinZoom(),
			    max = this.getMaxZoom(),
			    nw = bounds.getNorthWest(),
			    se = bounds.getSouthEast(),
			    size = this.getSize().subtract(padding),
			    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
			    snap = any3d ? this.options.zoomSnap : 1,
			    scalex = size.x / boundsSize.x,
			    scaley = size.y / boundsSize.y,
			    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

			zoom = this.getScaleZoom(scale, zoom);

			if (snap) {
				zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
				zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
			}

			return Math.max(min, Math.min(max, zoom));
		},

		// @method getSize(): Point
		// Returns the current size of the map container (in pixels).
		getSize: function () {
			if (!this._size || this._sizeChanged) {
				this._size = new Point(
					this._container.clientWidth || 0,
					this._container.clientHeight || 0);

				this._sizeChanged = false;
			}
			return this._size.clone();
		},

		// @method getPixelBounds(): Bounds
		// Returns the bounds of the current map view in projected pixel
		// coordinates (sometimes useful in layer and overlay implementations).
		getPixelBounds: function (center, zoom) {
			var topLeftPoint = this._getTopLeftPoint(center, zoom);
			return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
		},

		// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
		// the map pane? "left point of the map layer" can be confusing, specially
		// since there can be negative offsets.
		// @method getPixelOrigin(): Point
		// Returns the projected pixel coordinates of the top left point of
		// the map layer (useful in custom layer and overlay implementations).
		getPixelOrigin: function () {
			this._checkIfLoaded();
			return this._pixelOrigin;
		},

		// @method getPixelWorldBounds(zoom?: Number): Bounds
		// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
		// If `zoom` is omitted, the map's current zoom level is used.
		getPixelWorldBounds: function (zoom) {
			return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
		},

		// @section Other Methods

		// @method getPane(pane: String|HTMLElement): HTMLElement
		// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
		getPane: function (pane) {
			return typeof pane === 'string' ? this._panes[pane] : pane;
		},

		// @method getPanes(): Object
		// Returns a plain object containing the names of all [panes](#map-pane) as keys and
		// the panes as values.
		getPanes: function () {
			return this._panes;
		},

		// @method getContainer: HTMLElement
		// Returns the HTML element that contains the map.
		getContainer: function () {
			return this._container;
		},


		// @section Conversion Methods

		// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
		// Returns the scale factor to be applied to a map transition from zoom level
		// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
		getZoomScale: function (toZoom, fromZoom) {
			// TODO replace with universal implementation after refactoring projections
			var crs = this.options.crs;
			fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
			return crs.scale(toZoom) / crs.scale(fromZoom);
		},

		// @method getScaleZoom(scale: Number, fromZoom: Number): Number
		// Returns the zoom level that the map would end up at, if it is at `fromZoom`
		// level and everything is scaled by a factor of `scale`. Inverse of
		// [`getZoomScale`](#map-getZoomScale).
		getScaleZoom: function (scale, fromZoom) {
			var crs = this.options.crs;
			fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
			var zoom = crs.zoom(scale * crs.scale(fromZoom));
			return isNaN(zoom) ? Infinity : zoom;
		},

		// @method project(latlng: LatLng, zoom: Number): Point
		// Projects a geographical coordinate `LatLng` according to the projection
		// of the map's CRS, then scales it according to `zoom` and the CRS's
		// `Transformation`. The result is pixel coordinate relative to
		// the CRS origin.
		project: function (latlng, zoom) {
			zoom = zoom === undefined ? this._zoom : zoom;
			return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
		},

		// @method unproject(point: Point, zoom: Number): LatLng
		// Inverse of [`project`](#map-project).
		unproject: function (point, zoom) {
			zoom = zoom === undefined ? this._zoom : zoom;
			return this.options.crs.pointToLatLng(toPoint(point), zoom);
		},

		// @method layerPointToLatLng(point: Point): LatLng
		// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
		// returns the corresponding geographical coordinate (for the current zoom level).
		layerPointToLatLng: function (point) {
			var projectedPoint = toPoint(point).add(this.getPixelOrigin());
			return this.unproject(projectedPoint);
		},

		// @method latLngToLayerPoint(latlng: LatLng): Point
		// Given a geographical coordinate, returns the corresponding pixel coordinate
		// relative to the [origin pixel](#map-getpixelorigin).
		latLngToLayerPoint: function (latlng) {
			var projectedPoint = this.project(toLatLng(latlng))._round();
			return projectedPoint._subtract(this.getPixelOrigin());
		},

		// @method wrapLatLng(latlng: LatLng): LatLng
		// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
		// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
		// CRS's bounds.
		// By default this means longitude is wrapped around the dateline so its
		// value is between -180 and +180 degrees.
		wrapLatLng: function (latlng) {
			return this.options.crs.wrapLatLng(toLatLng(latlng));
		},

		// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
		// Returns a `LatLngBounds` with the same size as the given one, ensuring that
		// its center is within the CRS's bounds.
		// By default this means the center longitude is wrapped around the dateline so its
		// value is between -180 and +180 degrees, and the majority of the bounds
		// overlaps the CRS's bounds.
		wrapLatLngBounds: function (latlng) {
			return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
		},

		// @method distance(latlng1: LatLng, latlng2: LatLng): Number
		// Returns the distance between two geographical coordinates according to
		// the map's CRS. By default this measures distance in meters.
		distance: function (latlng1, latlng2) {
			return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
		},

		// @method containerPointToLayerPoint(point: Point): Point
		// Given a pixel coordinate relative to the map container, returns the corresponding
		// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
		containerPointToLayerPoint: function (point) { // (Point)
			return toPoint(point).subtract(this._getMapPanePos());
		},

		// @method layerPointToContainerPoint(point: Point): Point
		// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
		// returns the corresponding pixel coordinate relative to the map container.
		layerPointToContainerPoint: function (point) { // (Point)
			return toPoint(point).add(this._getMapPanePos());
		},

		// @method containerPointToLatLng(point: Point): LatLng
		// Given a pixel coordinate relative to the map container, returns
		// the corresponding geographical coordinate (for the current zoom level).
		containerPointToLatLng: function (point) {
			var layerPoint = this.containerPointToLayerPoint(toPoint(point));
			return this.layerPointToLatLng(layerPoint);
		},

		// @method latLngToContainerPoint(latlng: LatLng): Point
		// Given a geographical coordinate, returns the corresponding pixel coordinate
		// relative to the map container.
		latLngToContainerPoint: function (latlng) {
			return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
		},

		// @method mouseEventToContainerPoint(ev: MouseEvent): Point
		// Given a MouseEvent object, returns the pixel coordinate relative to the
		// map container where the event took place.
		mouseEventToContainerPoint: function (e) {
			return getMousePosition(e, this._container);
		},

		// @method mouseEventToLayerPoint(ev: MouseEvent): Point
		// Given a MouseEvent object, returns the pixel coordinate relative to
		// the [origin pixel](#map-getpixelorigin) where the event took place.
		mouseEventToLayerPoint: function (e) {
			return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
		},

		// @method mouseEventToLatLng(ev: MouseEvent): LatLng
		// Given a MouseEvent object, returns geographical coordinate where the
		// event took place.
		mouseEventToLatLng: function (e) { // (MouseEvent)
			return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
		},


		// map initialization methods

		_initContainer: function (id) {
			var container = this._container = get(id);

			if (!container) {
				throw new Error('Map container not found.');
			} else if (container._leaflet_id) {
				throw new Error('Map container is already initialized.');
			}

			on(container, 'scroll', this._onScroll, this);
			this._containerId = stamp(container);
		},

		_initLayout: function () {
			var container = this._container;

			this._fadeAnimated = this.options.fadeAnimation && any3d;

			addClass(container, 'leaflet-container' +
				(touch ? ' leaflet-touch' : '') +
				(retina ? ' leaflet-retina' : '') +
				(ielt9 ? ' leaflet-oldie' : '') +
				(safari ? ' leaflet-safari' : '') +
				(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

			var position = getStyle(container, 'position');

			if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
				container.style.position = 'relative';
			}

			this._initPanes();

			if (this._initControlPos) {
				this._initControlPos();
			}
		},

		_initPanes: function () {
			var panes = this._panes = {};
			this._paneRenderers = {};

			// @section
			//
			// Panes are DOM elements used to control the ordering of layers on the map. You
			// can access panes with [`map.getPane`](#map-getpane) or
			// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
			// [`map.createPane`](#map-createpane) method.
			//
			// Every map has the following default panes that differ only in zIndex.
			//
			// @pane mapPane: HTMLElement = 'auto'
			// Pane that contains all other map panes

			this._mapPane = this.createPane('mapPane', this._container);
			setPosition(this._mapPane, new Point(0, 0));

			// @pane tilePane: HTMLElement = 200
			// Pane for `GridLayer`s and `TileLayer`s
			this.createPane('tilePane');
			// @pane overlayPane: HTMLElement = 400
			// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
			this.createPane('shadowPane');
			// @pane shadowPane: HTMLElement = 500
			// Pane for overlay shadows (e.g. `Marker` shadows)
			this.createPane('overlayPane');
			// @pane markerPane: HTMLElement = 600
			// Pane for `Icon`s of `Marker`s
			this.createPane('markerPane');
			// @pane tooltipPane: HTMLElement = 650
			// Pane for `Tooltip`s.
			this.createPane('tooltipPane');
			// @pane popupPane: HTMLElement = 700
			// Pane for `Popup`s.
			this.createPane('popupPane');

			if (!this.options.markerZoomAnimation) {
				addClass(panes.markerPane, 'leaflet-zoom-hide');
				addClass(panes.shadowPane, 'leaflet-zoom-hide');
			}
		},


		// private methods that modify map state

		// @section Map state change events
		_resetView: function (center, zoom) {
			setPosition(this._mapPane, new Point(0, 0));

			var loading = !this._loaded;
			this._loaded = true;
			zoom = this._limitZoom(zoom);

			this.fire('viewprereset');

			var zoomChanged = this._zoom !== zoom;
			this
				._moveStart(zoomChanged, false)
				._move(center, zoom)
				._moveEnd(zoomChanged);

			// @event viewreset: Event
			// Fired when the map needs to redraw its content (this usually happens
			// on map zoom or load). Very useful for creating custom overlays.
			this.fire('viewreset');

			// @event load: Event
			// Fired when the map is initialized (when its center and zoom are set
			// for the first time).
			if (loading) {
				this.fire('load');
			}
		},

		_moveStart: function (zoomChanged, noMoveStart) {
			// @event zoomstart: Event
			// Fired when the map zoom is about to change (e.g. before zoom animation).
			// @event movestart: Event
			// Fired when the view of the map starts changing (e.g. user starts dragging the map).
			if (zoomChanged) {
				this.fire('zoomstart');
			}
			if (!noMoveStart) {
				this.fire('movestart');
			}
			return this;
		},

		_move: function (center, zoom, data) {
			if (zoom === undefined) {
				zoom = this._zoom;
			}
			var zoomChanged = this._zoom !== zoom;

			this._zoom = zoom;
			this._lastCenter = center;
			this._pixelOrigin = this._getNewPixelOrigin(center);

			// @event zoom: Event
			// Fired repeatedly during any change in zoom level, including zoom
			// and fly animations.
			if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
				this.fire('zoom', data);
			}

			// @event move: Event
			// Fired repeatedly during any movement of the map, including pan and
			// fly animations.
			return this.fire('move', data);
		},

		_moveEnd: function (zoomChanged) {
			// @event zoomend: Event
			// Fired when the map has changed, after any animations.
			if (zoomChanged) {
				this.fire('zoomend');
			}

			// @event moveend: Event
			// Fired when the center of the map stops changing (e.g. user stopped
			// dragging the map).
			return this.fire('moveend');
		},

		_stop: function () {
			cancelAnimFrame(this._flyToFrame);
			if (this._panAnim) {
				this._panAnim.stop();
			}
			return this;
		},

		_rawPanBy: function (offset) {
			setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
		},

		_getZoomSpan: function () {
			return this.getMaxZoom() - this.getMinZoom();
		},

		_panInsideMaxBounds: function () {
			if (!this._enforcingBounds) {
				this.panInsideBounds(this.options.maxBounds);
			}
		},

		_checkIfLoaded: function () {
			if (!this._loaded) {
				throw new Error('Set map center and zoom first.');
			}
		},

		// DOM event handling

		// @section Interaction events
		_initEvents: function (remove$$1) {
			this._targets = {};
			this._targets[stamp(this._container)] = this;

			var onOff = remove$$1 ? off : on;

			// @event click: MouseEvent
			// Fired when the user clicks (or taps) the map.
			// @event dblclick: MouseEvent
			// Fired when the user double-clicks (or double-taps) the map.
			// @event mousedown: MouseEvent
			// Fired when the user pushes the mouse button on the map.
			// @event mouseup: MouseEvent
			// Fired when the user releases the mouse button on the map.
			// @event mouseover: MouseEvent
			// Fired when the mouse enters the map.
			// @event mouseout: MouseEvent
			// Fired when the mouse leaves the map.
			// @event mousemove: MouseEvent
			// Fired while the mouse moves over the map.
			// @event contextmenu: MouseEvent
			// Fired when the user pushes the right mouse button on the map, prevents
			// default browser context menu from showing if there are listeners on
			// this event. Also fired on mobile when the user holds a single touch
			// for a second (also called long press).
			// @event keypress: KeyboardEvent
			// Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
			// @event keydown: KeyboardEvent
			// Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
			// the `keydown` event is fired for keys that produce a character value and for keys
			// that do not produce a character value.
			// @event keyup: KeyboardEvent
			// Fired when the user releases a key from the keyboard while the map is focused.
			onOff(this._container, 'click dblclick mousedown mouseup ' +
				'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

			if (this.options.trackResize) {
				onOff(window, 'resize', this._onResize, this);
			}

			if (any3d && this.options.transform3DLimit) {
				(remove$$1 ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
			}
		},

		_onResize: function () {
			cancelAnimFrame(this._resizeRequest);
			this._resizeRequest = requestAnimFrame(
			        function () { this.invalidateSize({debounceMoveend: true}); }, this);
		},

		_onScroll: function () {
			this._container.scrollTop  = 0;
			this._container.scrollLeft = 0;
		},

		_onMoveEnd: function () {
			var pos = this._getMapPanePos();
			if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
				// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
				// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
				this._resetView(this.getCenter(), this.getZoom());
			}
		},

		_findEventTargets: function (e, type) {
			var targets = [],
			    target,
			    isHover = type === 'mouseout' || type === 'mouseover',
			    src = e.target || e.srcElement,
			    dragging = false;

			while (src) {
				target = this._targets[stamp(src)];
				if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
					// Prevent firing click after you just dragged an object.
					dragging = true;
					break;
				}
				if (target && target.listens(type, true)) {
					if (isHover && !isExternalTarget(src, e)) { break; }
					targets.push(target);
					if (isHover) { break; }
				}
				if (src === this._container) { break; }
				src = src.parentNode;
			}
			if (!targets.length && !dragging && !isHover && isExternalTarget(src, e)) {
				targets = [this];
			}
			return targets;
		},

		_handleDOMEvent: function (e) {
			if (!this._loaded || skipped(e)) { return; }

			var type = e.type;

			if (type === 'mousedown' || type === 'keypress' || type === 'keyup' || type === 'keydown') {
				// prevents outline when clicking on keyboard-focusable element
				preventOutline(e.target || e.srcElement);
			}

			this._fireDOMEvent(e, type);
		},

		_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

		_fireDOMEvent: function (e, type, targets) {

			if (e.type === 'click') {
				// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
				// @event preclick: MouseEvent
				// Fired before mouse click on the map (sometimes useful when you
				// want something to happen on click before any existing click
				// handlers start running).
				var synth = extend({}, e);
				synth.type = 'preclick';
				this._fireDOMEvent(synth, synth.type, targets);
			}

			if (e._stopped) { return; }

			// Find the layer the event is propagating from and its parents.
			targets = (targets || []).concat(this._findEventTargets(e, type));

			if (!targets.length) { return; }

			var target = targets[0];
			if (type === 'contextmenu' && target.listens(type, true)) {
				preventDefault(e);
			}

			var data = {
				originalEvent: e
			};

			if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
				var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
				data.containerPoint = isMarker ?
					this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
				data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
				data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
			}

			for (var i = 0; i < targets.length; i++) {
				targets[i].fire(type, data, true);
				if (data.originalEvent._stopped ||
					(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
			}
		},

		_draggableMoved: function (obj) {
			obj = obj.dragging && obj.dragging.enabled() ? obj : this;
			return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
		},

		_clearHandlers: function () {
			for (var i = 0, len = this._handlers.length; i < len; i++) {
				this._handlers[i].disable();
			}
		},

		// @section Other Methods

		// @method whenReady(fn: Function, context?: Object): this
		// Runs the given function `fn` when the map gets initialized with
		// a view (center and zoom) and at least one layer, or immediately
		// if it's already initialized, optionally passing a function context.
		whenReady: function (callback, context) {
			if (this._loaded) {
				callback.call(context || this, {target: this});
			} else {
				this.on('load', callback, context);
			}
			return this;
		},


		// private methods for getting map state

		_getMapPanePos: function () {
			return getPosition(this._mapPane) || new Point(0, 0);
		},

		_moved: function () {
			var pos = this._getMapPanePos();
			return pos && !pos.equals([0, 0]);
		},

		_getTopLeftPoint: function (center, zoom) {
			var pixelOrigin = center && zoom !== undefined ?
				this._getNewPixelOrigin(center, zoom) :
				this.getPixelOrigin();
			return pixelOrigin.subtract(this._getMapPanePos());
		},

		_getNewPixelOrigin: function (center, zoom) {
			var viewHalf = this.getSize()._divideBy(2);
			return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
		},

		_latLngToNewLayerPoint: function (latlng, zoom, center) {
			var topLeft = this._getNewPixelOrigin(center, zoom);
			return this.project(latlng, zoom)._subtract(topLeft);
		},

		_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
			var topLeft = this._getNewPixelOrigin(center, zoom);
			return toBounds([
				this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
				this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
				this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
				this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
			]);
		},

		// layer point of the current center
		_getCenterLayerPoint: function () {
			return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
		},

		// offset of the specified place to the current center in pixels
		_getCenterOffset: function (latlng) {
			return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
		},

		// adjust center for view to get inside bounds
		_limitCenter: function (center, zoom, bounds) {

			if (!bounds) { return center; }

			var centerPoint = this.project(center, zoom),
			    viewHalf = this.getSize().divideBy(2),
			    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
			    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

			// If offset is less than a pixel, ignore.
			// This prevents unstable projections from getting into
			// an infinite loop of tiny offsets.
			if (offset.round().equals([0, 0])) {
				return center;
			}

			return this.unproject(centerPoint.add(offset), zoom);
		},

		// adjust offset for view to get inside bounds
		_limitOffset: function (offset, bounds) {
			if (!bounds) { return offset; }

			var viewBounds = this.getPixelBounds(),
			    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

			return offset.add(this._getBoundsOffset(newBounds, bounds));
		},

		// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
		_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
			var projectedMaxBounds = toBounds(
			        this.project(maxBounds.getNorthEast(), zoom),
			        this.project(maxBounds.getSouthWest(), zoom)
			    ),
			    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
			    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

			    dx = this._rebound(minOffset.x, -maxOffset.x),
			    dy = this._rebound(minOffset.y, -maxOffset.y);

			return new Point(dx, dy);
		},

		_rebound: function (left, right) {
			return left + right > 0 ?
				Math.round(left - right) / 2 :
				Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
		},

		_limitZoom: function (zoom) {
			var min = this.getMinZoom(),
			    max = this.getMaxZoom(),
			    snap = any3d ? this.options.zoomSnap : 1;
			if (snap) {
				zoom = Math.round(zoom / snap) * snap;
			}
			return Math.max(min, Math.min(max, zoom));
		},

		_onPanTransitionStep: function () {
			this.fire('move');
		},

		_onPanTransitionEnd: function () {
			removeClass(this._mapPane, 'leaflet-pan-anim');
			this.fire('moveend');
		},

		_tryAnimatedPan: function (center, options) {
			// difference between the new and current centers in pixels
			var offset = this._getCenterOffset(center)._trunc();

			// don't animate too far unless animate: true specified in options
			if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

			this.panBy(offset, options);

			return true;
		},

		_createAnimProxy: function () {

			var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
			this._panes.mapPane.appendChild(proxy);

			this.on('zoomanim', function (e) {
				var prop = TRANSFORM,
				    transform = this._proxy.style[prop];

				setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

				// workaround for case when transform is the same and so transitionend event is not fired
				if (transform === this._proxy.style[prop] && this._animatingZoom) {
					this._onZoomTransitionEnd();
				}
			}, this);

			this.on('load moveend', this._animMoveEnd, this);

			this._on('unload', this._destroyAnimProxy, this);
		},

		_destroyAnimProxy: function () {
			remove(this._proxy);
			this.off('load moveend', this._animMoveEnd, this);
			delete this._proxy;
		},

		_animMoveEnd: function () {
			var c = this.getCenter(),
			    z = this.getZoom();
			setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
		},

		_catchTransitionEnd: function (e) {
			if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
				this._onZoomTransitionEnd();
			}
		},

		_nothingToAnimate: function () {
			return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
		},

		_tryAnimatedZoom: function (center, zoom, options) {

			if (this._animatingZoom) { return true; }

			options = options || {};

			// don't animate if disabled, not supported or zoom difference is too large
			if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
			        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

			// offset is the pixel coords of the zoom origin relative to the current center
			var scale = this.getZoomScale(zoom),
			    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

			// don't animate if the zoom origin isn't within one screen from the current center, unless forced
			if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

			requestAnimFrame(function () {
				this
				    ._moveStart(true, false)
				    ._animateZoom(center, zoom, true);
			}, this);

			return true;
		},

		_animateZoom: function (center, zoom, startAnim, noUpdate) {
			if (!this._mapPane) { return; }

			if (startAnim) {
				this._animatingZoom = true;

				// remember what center/zoom to set after animation
				this._animateToCenter = center;
				this._animateToZoom = zoom;

				addClass(this._mapPane, 'leaflet-zoom-anim');
			}

			// @section Other Events
			// @event zoomanim: ZoomAnimEvent
			// Fired at least once per zoom animation. For continuous zoom, like pinch zooming, fired once per frame during zoom.
			this.fire('zoomanim', {
				center: center,
				zoom: zoom,
				noUpdate: noUpdate
			});

			// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
			setTimeout(bind(this._onZoomTransitionEnd, this), 250);
		},

		_onZoomTransitionEnd: function () {
			if (!this._animatingZoom) { return; }

			if (this._mapPane) {
				removeClass(this._mapPane, 'leaflet-zoom-anim');
			}

			this._animatingZoom = false;

			this._move(this._animateToCenter, this._animateToZoom);

			// This anim frame should prevent an obscure iOS webkit tile loading race condition.
			requestAnimFrame(function () {
				this._moveEnd(true);
			}, this);
		}
	});

	// @section

	// @factory L.map(id: String, options?: Map options)
	// Instantiates a map object given the DOM ID of a `<div>` element
	// and optionally an object literal with `Map options`.
	//
	// @alternative
	// @factory L.map(el: HTMLElement, options?: Map options)
	// Instantiates a map object given an instance of a `<div>` HTML element
	// and optionally an object literal with `Map options`.
	function createMap(id, options) {
		return new Map(id, options);
	}

	/*
	 * @class Control
	 * @aka L.Control
	 * @inherits Class
	 *
	 * L.Control is a base class for implementing map controls. Handles positioning.
	 * All other controls extend from this class.
	 */

	var Control = Class.extend({
		// @section
		// @aka Control options
		options: {
			// @option position: String = 'topright'
			// The position of the control (one of the map corners). Possible values are `'topleft'`,
			// `'topright'`, `'bottomleft'` or `'bottomright'`
			position: 'topright'
		},

		initialize: function (options) {
			setOptions(this, options);
		},

		/* @section
		 * Classes extending L.Control will inherit the following methods:
		 *
		 * @method getPosition: string
		 * Returns the position of the control.
		 */
		getPosition: function () {
			return this.options.position;
		},

		// @method setPosition(position: string): this
		// Sets the position of the control.
		setPosition: function (position) {
			var map = this._map;

			if (map) {
				map.removeControl(this);
			}

			this.options.position = position;

			if (map) {
				map.addControl(this);
			}

			return this;
		},

		// @method getContainer: HTMLElement
		// Returns the HTMLElement that contains the control.
		getContainer: function () {
			return this._container;
		},

		// @method addTo(map: Map): this
		// Adds the control to the given map.
		addTo: function (map) {
			this.remove();
			this._map = map;

			var container = this._container = this.onAdd(map),
			    pos = this.getPosition(),
			    corner = map._controlCorners[pos];

			addClass(container, 'leaflet-control');

			if (pos.indexOf('bottom') !== -1) {
				corner.insertBefore(container, corner.firstChild);
			} else {
				corner.appendChild(container);
			}

			this._map.on('unload', this.remove, this);

			return this;
		},

		// @method remove: this
		// Removes the control from the map it is currently active on.
		remove: function () {
			if (!this._map) {
				return this;
			}

			remove(this._container);

			if (this.onRemove) {
				this.onRemove(this._map);
			}

			this._map.off('unload', this.remove, this);
			this._map = null;

			return this;
		},

		_refocusOnMap: function (e) {
			// if map exists and event is not a keyboard event
			if (this._map && e && e.screenX > 0 && e.screenY > 0) {
				this._map.getContainer().focus();
			}
		}
	});

	var control = function (options) {
		return new Control(options);
	};

	/* @section Extension methods
	 * @uninheritable
	 *
	 * Every control should extend from `L.Control` and (re-)implement the following methods.
	 *
	 * @method onAdd(map: Map): HTMLElement
	 * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
	 *
	 * @method onRemove(map: Map)
	 * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
	 */

	/* @namespace Map
	 * @section Methods for Layers and Controls
	 */
	Map.include({
		// @method addControl(control: Control): this
		// Adds the given control to the map
		addControl: function (control) {
			control.addTo(this);
			return this;
		},

		// @method removeControl(control: Control): this
		// Removes the given control from the map
		removeControl: function (control) {
			control.remove();
			return this;
		},

		_initControlPos: function () {
			var corners = this._controlCorners = {},
			    l = 'leaflet-',
			    container = this._controlContainer =
			            create$1('div', l + 'control-container', this._container);

			function createCorner(vSide, hSide) {
				var className = l + vSide + ' ' + l + hSide;

				corners[vSide + hSide] = create$1('div', className, container);
			}

			createCorner('top', 'left');
			createCorner('top', 'right');
			createCorner('bottom', 'left');
			createCorner('bottom', 'right');
		},

		_clearControlPos: function () {
			for (var i in this._controlCorners) {
				remove(this._controlCorners[i]);
			}
			remove(this._controlContainer);
			delete this._controlCorners;
			delete this._controlContainer;
		}
	});

	/*
	 * @class Control.Layers
	 * @aka L.Control.Layers
	 * @inherits Control
	 *
	 * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control/)). Extends `Control`.
	 *
	 * @example
	 *
	 * ```js
	 * var baseLayers = {
	 * 	"Mapbox": mapbox,
	 * 	"OpenStreetMap": osm
	 * };
	 *
	 * var overlays = {
	 * 	"Marker": marker,
	 * 	"Roads": roadsLayer
	 * };
	 *
	 * L.control.layers(baseLayers, overlays).addTo(map);
	 * ```
	 *
	 * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
	 *
	 * ```js
	 * {
	 *     "<someName1>": layer1,
	 *     "<someName2>": layer2
	 * }
	 * ```
	 *
	 * The layer names can contain HTML, which allows you to add additional styling to the items:
	 *
	 * ```js
	 * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
	 * ```
	 */

	var Layers = Control.extend({
		// @section
		// @aka Control.Layers options
		options: {
			// @option collapsed: Boolean = true
			// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
			collapsed: true,
			position: 'topright',

			// @option autoZIndex: Boolean = true
			// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
			autoZIndex: true,

			// @option hideSingleBase: Boolean = false
			// If `true`, the base layers in the control will be hidden when there is only one.
			hideSingleBase: false,

			// @option sortLayers: Boolean = false
			// Whether to sort the layers. When `false`, layers will keep the order
			// in which they were added to the control.
			sortLayers: false,

			// @option sortFunction: Function = *
			// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
			// that will be used for sorting the layers, when `sortLayers` is `true`.
			// The function receives both the `L.Layer` instances and their names, as in
			// `sortFunction(layerA, layerB, nameA, nameB)`.
			// By default, it sorts layers alphabetically by their name.
			sortFunction: function (layerA, layerB, nameA, nameB) {
				return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
			}
		},

		initialize: function (baseLayers, overlays, options) {
			setOptions(this, options);

			this._layerControlInputs = [];
			this._layers = [];
			this._lastZIndex = 0;
			this._handlingClick = false;

			for (var i in baseLayers) {
				this._addLayer(baseLayers[i], i);
			}

			for (i in overlays) {
				this._addLayer(overlays[i], i, true);
			}
		},

		onAdd: function (map) {
			this._initLayout();
			this._update();

			this._map = map;
			map.on('zoomend', this._checkDisabledLayers, this);

			for (var i = 0; i < this._layers.length; i++) {
				this._layers[i].layer.on('add remove', this._onLayerChange, this);
			}

			return this._container;
		},

		addTo: function (map) {
			Control.prototype.addTo.call(this, map);
			// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
			return this._expandIfNotCollapsed();
		},

		onRemove: function () {
			this._map.off('zoomend', this._checkDisabledLayers, this);

			for (var i = 0; i < this._layers.length; i++) {
				this._layers[i].layer.off('add remove', this._onLayerChange, this);
			}
		},

		// @method addBaseLayer(layer: Layer, name: String): this
		// Adds a base layer (radio button entry) with the given name to the control.
		addBaseLayer: function (layer, name) {
			this._addLayer(layer, name);
			return (this._map) ? this._update() : this;
		},

		// @method addOverlay(layer: Layer, name: String): this
		// Adds an overlay (checkbox entry) with the given name to the control.
		addOverlay: function (layer, name) {
			this._addLayer(layer, name, true);
			return (this._map) ? this._update() : this;
		},

		// @method removeLayer(layer: Layer): this
		// Remove the given layer from the control.
		removeLayer: function (layer) {
			layer.off('add remove', this._onLayerChange, this);

			var obj = this._getLayer(stamp(layer));
			if (obj) {
				this._layers.splice(this._layers.indexOf(obj), 1);
			}
			return (this._map) ? this._update() : this;
		},

		// @method expand(): this
		// Expand the control container if collapsed.
		expand: function () {
			addClass(this._container, 'leaflet-control-layers-expanded');
			this._section.style.height = null;
			var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
			if (acceptableHeight < this._section.clientHeight) {
				addClass(this._section, 'leaflet-control-layers-scrollbar');
				this._section.style.height = acceptableHeight + 'px';
			} else {
				removeClass(this._section, 'leaflet-control-layers-scrollbar');
			}
			this._checkDisabledLayers();
			return this;
		},

		// @method collapse(): this
		// Collapse the control container if expanded.
		collapse: function () {
			removeClass(this._container, 'leaflet-control-layers-expanded');
			return this;
		},

		_initLayout: function () {
			var className = 'leaflet-control-layers',
			    container = this._container = create$1('div', className),
			    collapsed = this.options.collapsed;

			// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
			container.setAttribute('aria-haspopup', true);

			disableClickPropagation(container);
			disableScrollPropagation(container);

			var section = this._section = create$1('section', className + '-list');

			if (collapsed) {
				this._map.on('click', this.collapse, this);

				if (!android) {
					on(container, {
						mouseenter: this.expand,
						mouseleave: this.collapse
					}, this);
				}
			}

			var link = this._layersLink = create$1('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (touch) {
				on(link, 'click', stop);
				on(link, 'click', this.expand, this);
			} else {
				on(link, 'focus', this.expand, this);
			}

			if (!collapsed) {
				this.expand();
			}

			this._baseLayersList = create$1('div', className + '-base', section);
			this._separator = create$1('div', className + '-separator', section);
			this._overlaysList = create$1('div', className + '-overlays', section);

			container.appendChild(section);
		},

		_getLayer: function (id) {
			for (var i = 0; i < this._layers.length; i++) {

				if (this._layers[i] && stamp(this._layers[i].layer) === id) {
					return this._layers[i];
				}
			}
		},

		_addLayer: function (layer, name, overlay) {
			if (this._map) {
				layer.on('add remove', this._onLayerChange, this);
			}

			this._layers.push({
				layer: layer,
				name: name,
				overlay: overlay
			});

			if (this.options.sortLayers) {
				this._layers.sort(bind(function (a, b) {
					return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
				}, this));
			}

			if (this.options.autoZIndex && layer.setZIndex) {
				this._lastZIndex++;
				layer.setZIndex(this._lastZIndex);
			}

			this._expandIfNotCollapsed();
		},

		_update: function () {
			if (!this._container) { return this; }

			empty(this._baseLayersList);
			empty(this._overlaysList);

			this._layerControlInputs = [];
			var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

			for (i = 0; i < this._layers.length; i++) {
				obj = this._layers[i];
				this._addItem(obj);
				overlaysPresent = overlaysPresent || obj.overlay;
				baseLayersPresent = baseLayersPresent || !obj.overlay;
				baseLayersCount += !obj.overlay ? 1 : 0;
			}

			// Hide base layers section if there's only one layer.
			if (this.options.hideSingleBase) {
				baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
				this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
			}

			this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

			return this;
		},

		_onLayerChange: function (e) {
			if (!this._handlingClick) {
				this._update();
			}

			var obj = this._getLayer(stamp(e.target));

			// @namespace Map
			// @section Layer events
			// @event baselayerchange: LayersControlEvent
			// Fired when the base layer is changed through the [layer control](#control-layers).
			// @event overlayadd: LayersControlEvent
			// Fired when an overlay is selected through the [layer control](#control-layers).
			// @event overlayremove: LayersControlEvent
			// Fired when an overlay is deselected through the [layer control](#control-layers).
			// @namespace Control.Layers
			var type = obj.overlay ?
				(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
				(e.type === 'add' ? 'baselayerchange' : null);

			if (type) {
				this._map.fire(type, obj);
			}
		},

		// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
		_createRadioElement: function (name, checked) {

			var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
					name + '"' + (checked ? ' checked="checked"' : '') + '/>';

			var radioFragment = document.createElement('div');
			radioFragment.innerHTML = radioHtml;

			return radioFragment.firstChild;
		},

		_addItem: function (obj) {
			var label = document.createElement('label'),
			    checked = this._map.hasLayer(obj.layer),
			    input;

			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
			} else {
				input = this._createRadioElement('leaflet-base-layers_' + stamp(this), checked);
			}

			this._layerControlInputs.push(input);
			input.layerId = stamp(obj.layer);

			on(input, 'click', this._onInputClick, this);

			var name = document.createElement('span');
			name.innerHTML = ' ' + obj.name;

			// Helps from preventing layer control flicker when checkboxes are disabled
			// https://github.com/Leaflet/Leaflet/issues/2771
			var holder = document.createElement('div');

			label.appendChild(holder);
			holder.appendChild(input);
			holder.appendChild(name);

			var container = obj.overlay ? this._overlaysList : this._baseLayersList;
			container.appendChild(label);

			this._checkDisabledLayers();
			return label;
		},

		_onInputClick: function () {
			var inputs = this._layerControlInputs,
			    input, layer;
			var addedLayers = [],
			    removedLayers = [];

			this._handlingClick = true;

			for (var i = inputs.length - 1; i >= 0; i--) {
				input = inputs[i];
				layer = this._getLayer(input.layerId).layer;

				if (input.checked) {
					addedLayers.push(layer);
				} else if (!input.checked) {
					removedLayers.push(layer);
				}
			}

			// Bugfix issue 2318: Should remove all old layers before readding new ones
			for (i = 0; i < removedLayers.length; i++) {
				if (this._map.hasLayer(removedLayers[i])) {
					this._map.removeLayer(removedLayers[i]);
				}
			}
			for (i = 0; i < addedLayers.length; i++) {
				if (!this._map.hasLayer(addedLayers[i])) {
					this._map.addLayer(addedLayers[i]);
				}
			}

			this._handlingClick = false;

			this._refocusOnMap();
		},

		_checkDisabledLayers: function () {
			var inputs = this._layerControlInputs,
			    input,
			    layer,
			    zoom = this._map.getZoom();

			for (var i = inputs.length - 1; i >= 0; i--) {
				input = inputs[i];
				layer = this._getLayer(input.layerId).layer;
				input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
				                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

			}
		},

		_expandIfNotCollapsed: function () {
			if (this._map && !this.options.collapsed) {
				this.expand();
			}
			return this;
		},

		_expand: function () {
			// Backward compatibility, remove me in 1.1.
			return this.expand();
		},

		_collapse: function () {
			// Backward compatibility, remove me in 1.1.
			return this.collapse();
		}

	});


	// @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
	// Creates a layers control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
	var layers = function (baseLayers, overlays, options) {
		return new Layers(baseLayers, overlays, options);
	};

	/*
	 * @class Control.Zoom
	 * @aka L.Control.Zoom
	 * @inherits Control
	 *
	 * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
	 */

	var Zoom = Control.extend({
		// @section
		// @aka Control.Zoom options
		options: {
			position: 'topleft',

			// @option zoomInText: String = '+'
			// The text set on the 'zoom in' button.
			zoomInText: '+',

			// @option zoomInTitle: String = 'Zoom in'
			// The title set on the 'zoom in' button.
			zoomInTitle: 'Zoom in',

			// @option zoomOutText: String = '&#x2212;'
			// The text set on the 'zoom out' button.
			zoomOutText: '&#x2212;',

			// @option zoomOutTitle: String = 'Zoom out'
			// The title set on the 'zoom out' button.
			zoomOutTitle: 'Zoom out'
		},

		onAdd: function (map) {
			var zoomName = 'leaflet-control-zoom',
			    container = create$1('div', zoomName + ' leaflet-bar'),
			    options = this.options;

			this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
			        zoomName + '-in',  container, this._zoomIn);
			this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
			        zoomName + '-out', container, this._zoomOut);

			this._updateDisabled();
			map.on('zoomend zoomlevelschange', this._updateDisabled, this);

			return container;
		},

		onRemove: function (map) {
			map.off('zoomend zoomlevelschange', this._updateDisabled, this);
		},

		disable: function () {
			this._disabled = true;
			this._updateDisabled();
			return this;
		},

		enable: function () {
			this._disabled = false;
			this._updateDisabled();
			return this;
		},

		_zoomIn: function (e) {
			if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
				this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
			}
		},

		_zoomOut: function (e) {
			if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
				this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
			}
		},

		_createButton: function (html, title, className, container, fn) {
			var link = create$1('a', className, container);
			link.innerHTML = html;
			link.href = '#';
			link.title = title;

			/*
			 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
			 */
			link.setAttribute('role', 'button');
			link.setAttribute('aria-label', title);

			disableClickPropagation(link);
			on(link, 'click', stop);
			on(link, 'click', fn, this);
			on(link, 'click', this._refocusOnMap, this);

			return link;
		},

		_updateDisabled: function () {
			var map = this._map,
			    className = 'leaflet-disabled';

			removeClass(this._zoomInButton, className);
			removeClass(this._zoomOutButton, className);

			if (this._disabled || map._zoom === map.getMinZoom()) {
				addClass(this._zoomOutButton, className);
			}
			if (this._disabled || map._zoom === map.getMaxZoom()) {
				addClass(this._zoomInButton, className);
			}
		}
	});

	// @namespace Map
	// @section Control options
	// @option zoomControl: Boolean = true
	// Whether a [zoom control](#control-zoom) is added to the map by default.
	Map.mergeOptions({
		zoomControl: true
	});

	Map.addInitHook(function () {
		if (this.options.zoomControl) {
			// @section Controls
			// @property zoomControl: Control.Zoom
			// The default zoom control (only available if the
			// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
			this.zoomControl = new Zoom();
			this.addControl(this.zoomControl);
		}
	});

	// @namespace Control.Zoom
	// @factory L.control.zoom(options: Control.Zoom options)
	// Creates a zoom control
	var zoom = function (options) {
		return new Zoom(options);
	};

	/*
	 * @class Control.Scale
	 * @aka L.Control.Scale
	 * @inherits Control
	 *
	 * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
	 *
	 * @example
	 *
	 * ```js
	 * L.control.scale().addTo(map);
	 * ```
	 */

	var Scale = Control.extend({
		// @section
		// @aka Control.Scale options
		options: {
			position: 'bottomleft',

			// @option maxWidth: Number = 100
			// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
			maxWidth: 100,

			// @option metric: Boolean = True
			// Whether to show the metric scale line (m/km).
			metric: true,

			// @option imperial: Boolean = True
			// Whether to show the imperial scale line (mi/ft).
			imperial: true

			// @option updateWhenIdle: Boolean = false
			// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
		},

		onAdd: function (map) {
			var className = 'leaflet-control-scale',
			    container = create$1('div', className),
			    options = this.options;

			this._addScales(options, className + '-line', container);

			map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
			map.whenReady(this._update, this);

			return container;
		},

		onRemove: function (map) {
			map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		},

		_addScales: function (options, className, container) {
			if (options.metric) {
				this._mScale = create$1('div', className, container);
			}
			if (options.imperial) {
				this._iScale = create$1('div', className, container);
			}
		},

		_update: function () {
			var map = this._map,
			    y = map.getSize().y / 2;

			var maxMeters = map.distance(
				map.containerPointToLatLng([0, y]),
				map.containerPointToLatLng([this.options.maxWidth, y]));

			this._updateScales(maxMeters);
		},

		_updateScales: function (maxMeters) {
			if (this.options.metric && maxMeters) {
				this._updateMetric(maxMeters);
			}
			if (this.options.imperial && maxMeters) {
				this._updateImperial(maxMeters);
			}
		},

		_updateMetric: function (maxMeters) {
			var meters = this._getRoundNum(maxMeters),
			    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

			this._updateScale(this._mScale, label, meters / maxMeters);
		},

		_updateImperial: function (maxMeters) {
			var maxFeet = maxMeters * 3.2808399,
			    maxMiles, miles, feet;

			if (maxFeet > 5280) {
				maxMiles = maxFeet / 5280;
				miles = this._getRoundNum(maxMiles);
				this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

			} else {
				feet = this._getRoundNum(maxFeet);
				this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
			}
		},

		_updateScale: function (scale, text, ratio) {
			scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
			scale.innerHTML = text;
		},

		_getRoundNum: function (num) {
			var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
			    d = num / pow10;

			d = d >= 10 ? 10 :
			    d >= 5 ? 5 :
			    d >= 3 ? 3 :
			    d >= 2 ? 2 : 1;

			return pow10 * d;
		}
	});


	// @factory L.control.scale(options?: Control.Scale options)
	// Creates an scale control with the given options.
	var scale = function (options) {
		return new Scale(options);
	};

	/*
	 * @class Control.Attribution
	 * @aka L.Control.Attribution
	 * @inherits Control
	 *
	 * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
	 */

	var Attribution = Control.extend({
		// @section
		// @aka Control.Attribution options
		options: {
			position: 'bottomright',

			// @option prefix: String = 'Leaflet'
			// The HTML text shown before the attributions. Pass `false` to disable.
			prefix: '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
		},

		initialize: function (options) {
			setOptions(this, options);

			this._attributions = {};
		},

		onAdd: function (map) {
			map.attributionControl = this;
			this._container = create$1('div', 'leaflet-control-attribution');
			disableClickPropagation(this._container);

			// TODO ugly, refactor
			for (var i in map._layers) {
				if (map._layers[i].getAttribution) {
					this.addAttribution(map._layers[i].getAttribution());
				}
			}

			this._update();

			return this._container;
		},

		// @method setPrefix(prefix: String): this
		// Sets the text before the attributions.
		setPrefix: function (prefix) {
			this.options.prefix = prefix;
			this._update();
			return this;
		},

		// @method addAttribution(text: String): this
		// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
		addAttribution: function (text) {
			if (!text) { return this; }

			if (!this._attributions[text]) {
				this._attributions[text] = 0;
			}
			this._attributions[text]++;

			this._update();

			return this;
		},

		// @method removeAttribution(text: String): this
		// Removes an attribution text.
		removeAttribution: function (text) {
			if (!text) { return this; }

			if (this._attributions[text]) {
				this._attributions[text]--;
				this._update();
			}

			return this;
		},

		_update: function () {
			if (!this._map) { return; }

			var attribs = [];

			for (var i in this._attributions) {
				if (this._attributions[i]) {
					attribs.push(i);
				}
			}

			var prefixAndAttribs = [];

			if (this.options.prefix) {
				prefixAndAttribs.push(this.options.prefix);
			}
			if (attribs.length) {
				prefixAndAttribs.push(attribs.join(', '));
			}

			this._container.innerHTML = prefixAndAttribs.join(' | ');
		}
	});

	// @namespace Map
	// @section Control options
	// @option attributionControl: Boolean = true
	// Whether a [attribution control](#control-attribution) is added to the map by default.
	Map.mergeOptions({
		attributionControl: true
	});

	Map.addInitHook(function () {
		if (this.options.attributionControl) {
			new Attribution().addTo(this);
		}
	});

	// @namespace Control.Attribution
	// @factory L.control.attribution(options: Control.Attribution options)
	// Creates an attribution control.
	var attribution = function (options) {
		return new Attribution(options);
	};

	Control.Layers = Layers;
	Control.Zoom = Zoom;
	Control.Scale = Scale;
	Control.Attribution = Attribution;

	control.layers = layers;
	control.zoom = zoom;
	control.scale = scale;
	control.attribution = attribution;

	/*
		L.Handler is a base class for handler classes that are used internally to inject
		interaction features like dragging to classes like Map and Marker.
	*/

	// @class Handler
	// @aka L.Handler
	// Abstract class for map interaction handlers

	var Handler = Class.extend({
		initialize: function (map) {
			this._map = map;
		},

		// @method enable(): this
		// Enables the handler
		enable: function () {
			if (this._enabled) { return this; }

			this._enabled = true;
			this.addHooks();
			return this;
		},

		// @method disable(): this
		// Disables the handler
		disable: function () {
			if (!this._enabled) { return this; }

			this._enabled = false;
			this.removeHooks();
			return this;
		},

		// @method enabled(): Boolean
		// Returns `true` if the handler is enabled
		enabled: function () {
			return !!this._enabled;
		}

		// @section Extension methods
		// Classes inheriting from `Handler` must implement the two following methods:
		// @method addHooks()
		// Called when the handler is enabled, should add event hooks.
		// @method removeHooks()
		// Called when the handler is disabled, should remove the event hooks added previously.
	});

	// @section There is static function which can be called without instantiating L.Handler:
	// @function addTo(map: Map, name: String): this
	// Adds a new Handler to the given map with the given name.
	Handler.addTo = function (map, name) {
		map.addHandler(name, this);
		return this;
	};

	var Mixin = {Events: Events};

	/*
	 * @class Draggable
	 * @aka L.Draggable
	 * @inherits Evented
	 *
	 * A class for making DOM elements draggable (including touch support).
	 * Used internally for map and marker dragging. Only works for elements
	 * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
	 *
	 * @example
	 * ```js
	 * var draggable = new L.Draggable(elementToDrag);
	 * draggable.enable();
	 * ```
	 */

	var START = touch ? 'touchstart mousedown' : 'mousedown';
	var END = {
		mousedown: 'mouseup',
		touchstart: 'touchend',
		pointerdown: 'touchend',
		MSPointerDown: 'touchend'
	};
	var MOVE = {
		mousedown: 'mousemove',
		touchstart: 'touchmove',
		pointerdown: 'touchmove',
		MSPointerDown: 'touchmove'
	};


	var Draggable = Evented.extend({

		options: {
			// @section
			// @aka Draggable options
			// @option clickTolerance: Number = 3
			// The max number of pixels a user can shift the mouse pointer during a click
			// for it to be considered a valid click (as opposed to a mouse drag).
			clickTolerance: 3
		},

		// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
		// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
		initialize: function (element, dragStartTarget, preventOutline$$1, options) {
			setOptions(this, options);

			this._element = element;
			this._dragStartTarget = dragStartTarget || element;
			this._preventOutline = preventOutline$$1;
		},

		// @method enable()
		// Enables the dragging ability
		enable: function () {
			if (this._enabled) { return; }

			on(this._dragStartTarget, START, this._onDown, this);

			this._enabled = true;
		},

		// @method disable()
		// Disables the dragging ability
		disable: function () {
			if (!this._enabled) { return; }

			// If we're currently dragging this draggable,
			// disabling it counts as first ending the drag.
			if (Draggable._dragging === this) {
				this.finishDrag();
			}

			off(this._dragStartTarget, START, this._onDown, this);

			this._enabled = false;
			this._moved = false;
		},

		_onDown: function (e) {
			// Ignore simulated events, since we handle both touch and
			// mouse explicitly; otherwise we risk getting duplicates of
			// touch events, see #4315.
			// Also ignore the event if disabled; this happens in IE11
			// under some circumstances, see #3666.
			if (e._simulated || !this._enabled) { return; }

			this._moved = false;

			if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

			if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
			Draggable._dragging = this;  // Prevent dragging multiple objects at once.

			if (this._preventOutline) {
				preventOutline(this._element);
			}

			disableImageDrag();
			disableTextSelection();

			if (this._moving) { return; }

			// @event down: Event
			// Fired when a drag is about to start.
			this.fire('down');

			var first = e.touches ? e.touches[0] : e,
			    sizedParent = getSizedParentNode(this._element);

			this._startPoint = new Point(first.clientX, first.clientY);

			// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
			this._parentScale = getScale(sizedParent);

			on(document, MOVE[e.type], this._onMove, this);
			on(document, END[e.type], this._onUp, this);
		},

		_onMove: function (e) {
			// Ignore simulated events, since we handle both touch and
			// mouse explicitly; otherwise we risk getting duplicates of
			// touch events, see #4315.
			// Also ignore the event if disabled; this happens in IE11
			// under some circumstances, see #3666.
			if (e._simulated || !this._enabled) { return; }

			if (e.touches && e.touches.length > 1) {
				this._moved = true;
				return;
			}

			var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
			    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

			if (!offset.x && !offset.y) { return; }
			if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

			// We assume that the parent container's position, border and scale do not change for the duration of the drag.
			// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
			// and we can use the cached value for the scale.
			offset.x /= this._parentScale.x;
			offset.y /= this._parentScale.y;

			preventDefault(e);

			if (!this._moved) {
				// @event dragstart: Event
				// Fired when a drag starts
				this.fire('dragstart');

				this._moved = true;
				this._startPos = getPosition(this._element).subtract(offset);

				addClass(document.body, 'leaflet-dragging');

				this._lastTarget = e.target || e.srcElement;
				// IE and Edge do not give the <use> element, so fetch it
				// if necessary
				if ((window.SVGElementInstance) && (this._lastTarget instanceof SVGElementInstance)) {
					this._lastTarget = this._lastTarget.correspondingUseElement;
				}
				addClass(this._lastTarget, 'leaflet-drag-target');
			}

			this._newPos = this._startPos.add(offset);
			this._moving = true;

			cancelAnimFrame(this._animRequest);
			this._lastEvent = e;
			this._animRequest = requestAnimFrame(this._updatePosition, this, true);
		},

		_updatePosition: function () {
			var e = {originalEvent: this._lastEvent};

			// @event predrag: Event
			// Fired continuously during dragging *before* each corresponding
			// update of the element's position.
			this.fire('predrag', e);
			setPosition(this._element, this._newPos);

			// @event drag: Event
			// Fired continuously during dragging.
			this.fire('drag', e);
		},

		_onUp: function (e) {
			// Ignore simulated events, since we handle both touch and
			// mouse explicitly; otherwise we risk getting duplicates of
			// touch events, see #4315.
			// Also ignore the event if disabled; this happens in IE11
			// under some circumstances, see #3666.
			if (e._simulated || !this._enabled) { return; }
			this.finishDrag();
		},

		finishDrag: function () {
			removeClass(document.body, 'leaflet-dragging');

			if (this._lastTarget) {
				removeClass(this._lastTarget, 'leaflet-drag-target');
				this._lastTarget = null;
			}

			for (var i in MOVE) {
				off(document, MOVE[i], this._onMove, this);
				off(document, END[i], this._onUp, this);
			}

			enableImageDrag();
			enableTextSelection();

			if (this._moved && this._moving) {
				// ensure drag is not fired after dragend
				cancelAnimFrame(this._animRequest);

				// @event dragend: DragEndEvent
				// Fired when the drag ends.
				this.fire('dragend', {
					distance: this._newPos.distanceTo(this._startPos)
				});
			}

			this._moving = false;
			Draggable._dragging = false;
		}

	});

	/*
	 * @namespace LineUtil
	 *
	 * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
	 */

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	// @function simplify(points: Point[], tolerance: Number): Point[]
	// Dramatically reduces the number of points in a polyline while retaining
	// its shape and returns a new array of simplified points, using the
	// [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
	// Used for a huge performance boost when processing/displaying Leaflet polylines for
	// each zoom level and also reducing visual noise. tolerance affects the amount of
	// simplification (lesser value means higher quality but slower and with more points).
	// Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
	function simplify(points, tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		    // stage 1: vertex reduction
		    points = _reducePoints(points, sqTolerance);

		    // stage 2: Douglas-Peucker simplification
		    points = _simplifyDP(points, sqTolerance);

		return points;
	}

	// @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
	// Returns the distance between point `p` and segment `p1` to `p2`.
	function pointToSegmentDistance(p, p1, p2) {
		return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
	}

	// @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
	// Returns the closest point from a point `p` on a segment `p1` to `p2`.
	function closestPointOnSegment(p, p1, p2) {
		return _sqClosestPointOnSegment(p, p1, p2);
	}

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	function _simplifyDP(points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len);

		    markers[0] = markers[len - 1] = 1;

		_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
		    newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	}

	function _simplifyDPStep(points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			_simplifyDPStep(points, markers, sqTolerance, first, index);
			_simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	}

	// reduce points that are too close to each other to a single point
	function _reducePoints(points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
			if (_sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	}

	var _lastCode;

	// @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
	// Clips the segment a to b by rectangular bounds with the
	// [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
	// (modifying the segment points directly!). Used by Leaflet to only show polyline
	// points that are on the screen or near, increasing performance.
	function clipSegment(a, b, bounds, useLastCode, round) {
		var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
		    codeB = _getBitCode(b, bounds),

		    codeOut, p, newCode;

		    // save 2nd code to avoid calculating it on the next segment
		    _lastCode = codeB;

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) {
				return [a, b];
			}

			// if a,b is outside the clip window (trivial reject)
			if (codeA & codeB) {
				return false;
			}

			// other cases
			codeOut = codeA || codeB;
			p = _getEdgeIntersection(a, b, codeOut, bounds, round);
			newCode = _getBitCode(p, bounds);

			if (codeOut === codeA) {
				a = p;
				codeA = newCode;
			} else {
				b = p;
				codeB = newCode;
			}
		}
	}

	function _getEdgeIntersection(a, b, code, bounds, round) {
		var dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max,
		    x, y;

		if (code & 8) { // top
			x = a.x + dx * (max.y - a.y) / dy;
			y = max.y;

		} else if (code & 4) { // bottom
			x = a.x + dx * (min.y - a.y) / dy;
			y = min.y;

		} else if (code & 2) { // right
			x = max.x;
			y = a.y + dy * (max.x - a.x) / dx;

		} else if (code & 1) { // left
			x = min.x;
			y = a.y + dy * (min.x - a.x) / dx;
		}

		return new Point(x, y, round);
	}

	function _getBitCode(p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}

		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	}

	// square distance (to avoid unnecessary Math.sqrt calls)
	function _sqDist(p1, p2) {
		var dx = p2.x - p1.x,
		    dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	}

	// return closest point on segment or distance to that point
	function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
		var x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new Point(x, y);
	}


	// @function isFlat(latlngs: LatLng[]): Boolean
	// Returns true if `latlngs` is a flat array, false is nested.
	function isFlat(latlngs) {
		return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
	}

	function _flat(latlngs) {
		console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
		return isFlat(latlngs);
	}


	var LineUtil = (Object.freeze || Object)({
		simplify: simplify,
		pointToSegmentDistance: pointToSegmentDistance,
		closestPointOnSegment: closestPointOnSegment,
		clipSegment: clipSegment,
		_getEdgeIntersection: _getEdgeIntersection,
		_getBitCode: _getBitCode,
		_sqClosestPointOnSegment: _sqClosestPointOnSegment,
		isFlat: isFlat,
		_flat: _flat
	});

	/*
	 * @namespace PolyUtil
	 * Various utility functions for polygon geometries.
	 */

	/* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
	 * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
	 * Used by Leaflet to only show polygon points that are on the screen or near, increasing
	 * performance. Note that polygon points needs different algorithm for clipping
	 * than polyline, so there's a separate method for it.
	 */
	function clipPolygon(points, bounds, round) {
		var clippedPoints,
		    edges = [1, 4, 2, 8],
		    i, j, k,
		    a, b,
		    len, edge, p;

		for (i = 0, len = points.length; i < len; i++) {
			points[i]._code = _getBitCode(points[i], bounds);
		}

		// for each edge (left, bottom, right, top)
		for (k = 0; k < 4; k++) {
			edge = edges[k];
			clippedPoints = [];

			for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
				a = points[i];
				b = points[j];

				// if a is inside the clip window
				if (!(a._code & edge)) {
					// if b is outside the clip window (a->b goes out of screen)
					if (b._code & edge) {
						p = _getEdgeIntersection(b, a, edge, bounds, round);
						p._code = _getBitCode(p, bounds);
						clippedPoints.push(p);
					}
					clippedPoints.push(a);

				// else if b is inside the clip window (a->b enters the screen)
				} else if (!(b._code & edge)) {
					p = _getEdgeIntersection(b, a, edge, bounds, round);
					p._code = _getBitCode(p, bounds);
					clippedPoints.push(p);
				}
			}
			points = clippedPoints;
		}

		return points;
	}


	var PolyUtil = (Object.freeze || Object)({
		clipPolygon: clipPolygon
	});

	/*
	 * @namespace Projection
	 * @section
	 * Leaflet comes with a set of already defined Projections out of the box:
	 *
	 * @projection L.Projection.LonLat
	 *
	 * Equirectangular, or Plate Carree projection — the most simple projection,
	 * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
	 * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
	 * `EPSG:4326` and `Simple` CRS.
	 */

	var LonLat = {
		project: function (latlng) {
			return new Point(latlng.lng, latlng.lat);
		},

		unproject: function (point) {
			return new LatLng(point.y, point.x);
		},

		bounds: new Bounds([-180, -90], [180, 90])
	};

	/*
	 * @namespace Projection
	 * @projection L.Projection.Mercator
	 *
	 * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
	 */

	var Mercator = {
		R: 6378137,
		R_MINOR: 6356752.314245179,

		bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

		project: function (latlng) {
			var d = Math.PI / 180,
			    r = this.R,
			    y = latlng.lat * d,
			    tmp = this.R_MINOR / r,
			    e = Math.sqrt(1 - tmp * tmp),
			    con = e * Math.sin(y);

			var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
			y = -r * Math.log(Math.max(ts, 1E-10));

			return new Point(latlng.lng * d * r, y);
		},

		unproject: function (point) {
			var d = 180 / Math.PI,
			    r = this.R,
			    tmp = this.R_MINOR / r,
			    e = Math.sqrt(1 - tmp * tmp),
			    ts = Math.exp(-point.y / r),
			    phi = Math.PI / 2 - 2 * Math.atan(ts);

			for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
				con = e * Math.sin(phi);
				con = Math.pow((1 - con) / (1 + con), e / 2);
				dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
				phi += dphi;
			}

			return new LatLng(phi * d, point.x * d / r);
		}
	};

	/*
	 * @class Projection

	 * An object with methods for projecting geographical coordinates of the world onto
	 * a flat surface (and back). See [Map projection](http://en.wikipedia.org/wiki/Map_projection).

	 * @property bounds: Bounds
	 * The bounds (specified in CRS units) where the projection is valid

	 * @method project(latlng: LatLng): Point
	 * Projects geographical coordinates into a 2D point.
	 * Only accepts actual `L.LatLng` instances, not arrays.

	 * @method unproject(point: Point): LatLng
	 * The inverse of `project`. Projects a 2D point into a geographical location.
	 * Only accepts actual `L.Point` instances, not arrays.

	 * Note that the projection instances do not inherit from Leafet's `Class` object,
	 * and can't be instantiated. Also, new classes can't inherit from them,
	 * and methods can't be added to them with the `include` function.

	 */




	var index = (Object.freeze || Object)({
		LonLat: LonLat,
		Mercator: Mercator,
		SphericalMercator: SphericalMercator
	});

	/*
	 * @namespace CRS
	 * @crs L.CRS.EPSG3395
	 *
	 * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
	 */
	var EPSG3395 = extend({}, Earth, {
		code: 'EPSG:3395',
		projection: Mercator,

		transformation: (function () {
			var scale = 0.5 / (Math.PI * Mercator.R);
			return toTransformation(scale, 0.5, -scale, 0.5);
		}())
	});

	/*
	 * @namespace CRS
	 * @crs L.CRS.EPSG4326
	 *
	 * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
	 *
	 * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
	 * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
	 * with this CRS, ensure that there are two 256x256 pixel tiles covering the
	 * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
	 * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
	 */

	var EPSG4326 = extend({}, Earth, {
		code: 'EPSG:4326',
		projection: LonLat,
		transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
	});

	/*
	 * @namespace CRS
	 * @crs L.CRS.Simple
	 *
	 * A simple CRS that maps longitude and latitude into `x` and `y` directly.
	 * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
	 * axis should still be inverted (going from bottom to top). `distance()` returns
	 * simple euclidean distance.
	 */

	var Simple = extend({}, CRS, {
		projection: LonLat,
		transformation: toTransformation(1, 0, -1, 0),

		scale: function (zoom) {
			return Math.pow(2, zoom);
		},

		zoom: function (scale) {
			return Math.log(scale) / Math.LN2;
		},

		distance: function (latlng1, latlng2) {
			var dx = latlng2.lng - latlng1.lng,
			    dy = latlng2.lat - latlng1.lat;

			return Math.sqrt(dx * dx + dy * dy);
		},

		infinite: true
	});

	CRS.Earth = Earth;
	CRS.EPSG3395 = EPSG3395;
	CRS.EPSG3857 = EPSG3857;
	CRS.EPSG900913 = EPSG900913;
	CRS.EPSG4326 = EPSG4326;
	CRS.Simple = Simple;

	/*
	 * @class Layer
	 * @inherits Evented
	 * @aka L.Layer
	 * @aka ILayer
	 *
	 * A set of methods from the Layer base class that all Leaflet layers use.
	 * Inherits all methods, options and events from `L.Evented`.
	 *
	 * @example
	 *
	 * ```js
	 * var layer = L.marker(latlng).addTo(map);
	 * layer.addTo(map);
	 * layer.remove();
	 * ```
	 *
	 * @event add: Event
	 * Fired after the layer is added to a map
	 *
	 * @event remove: Event
	 * Fired after the layer is removed from a map
	 */


	var Layer = Evented.extend({

		// Classes extending `L.Layer` will inherit the following options:
		options: {
			// @option pane: String = 'overlayPane'
			// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
			pane: 'overlayPane',

			// @option attribution: String = null
			// String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
			attribution: null,

			bubblingMouseEvents: true
		},

		/* @section
		 * Classes extending `L.Layer` will inherit the following methods:
		 *
		 * @method addTo(map: Map|LayerGroup): this
		 * Adds the layer to the given map or layer group.
		 */
		addTo: function (map) {
			map.addLayer(this);
			return this;
		},

		// @method remove: this
		// Removes the layer from the map it is currently active on.
		remove: function () {
			return this.removeFrom(this._map || this._mapToAdd);
		},

		// @method removeFrom(map: Map): this
		// Removes the layer from the given map
		removeFrom: function (obj) {
			if (obj) {
				obj.removeLayer(this);
			}
			return this;
		},

		// @method getPane(name? : String): HTMLElement
		// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
		getPane: function (name) {
			return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
		},

		addInteractiveTarget: function (targetEl) {
			this._map._targets[stamp(targetEl)] = this;
			return this;
		},

		removeInteractiveTarget: function (targetEl) {
			delete this._map._targets[stamp(targetEl)];
			return this;
		},

		// @method getAttribution: String
		// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
		getAttribution: function () {
			return this.options.attribution;
		},

		_layerAdd: function (e) {
			var map = e.target;

			// check in case layer gets added and then removed before the map is ready
			if (!map.hasLayer(this)) { return; }

			this._map = map;
			this._zoomAnimated = map._zoomAnimated;

			if (this.getEvents) {
				var events = this.getEvents();
				map.on(events, this);
				this.once('remove', function () {
					map.off(events, this);
				}, this);
			}

			this.onAdd(map);

			if (this.getAttribution && map.attributionControl) {
				map.attributionControl.addAttribution(this.getAttribution());
			}

			this.fire('add');
			map.fire('layeradd', {layer: this});
		}
	});

	/* @section Extension methods
	 * @uninheritable
	 *
	 * Every layer should extend from `L.Layer` and (re-)implement the following methods.
	 *
	 * @method onAdd(map: Map): this
	 * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
	 *
	 * @method onRemove(map: Map): this
	 * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
	 *
	 * @method getEvents(): Object
	 * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
	 *
	 * @method getAttribution(): String
	 * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
	 *
	 * @method beforeAdd(map: Map): this
	 * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
	 */


	/* @namespace Map
	 * @section Layer events
	 *
	 * @event layeradd: LayerEvent
	 * Fired when a new layer is added to the map.
	 *
	 * @event layerremove: LayerEvent
	 * Fired when some layer is removed from the map
	 *
	 * @section Methods for Layers and Controls
	 */
	Map.include({
		// @method addLayer(layer: Layer): this
		// Adds the given layer to the map
		addLayer: function (layer) {
			if (!layer._layerAdd) {
				throw new Error('The provided object is not a Layer.');
			}

			var id = stamp(layer);
			if (this._layers[id]) { return this; }
			this._layers[id] = layer;

			layer._mapToAdd = this;

			if (layer.beforeAdd) {
				layer.beforeAdd(this);
			}

			this.whenReady(layer._layerAdd, layer);

			return this;
		},

		// @method removeLayer(layer: Layer): this
		// Removes the given layer from the map.
		removeLayer: function (layer) {
			var id = stamp(layer);

			if (!this._layers[id]) { return this; }

			if (this._loaded) {
				layer.onRemove(this);
			}

			if (layer.getAttribution && this.attributionControl) {
				this.attributionControl.removeAttribution(layer.getAttribution());
			}

			delete this._layers[id];

			if (this._loaded) {
				this.fire('layerremove', {layer: layer});
				layer.fire('remove');
			}

			layer._map = layer._mapToAdd = null;

			return this;
		},

		// @method hasLayer(layer: Layer): Boolean
		// Returns `true` if the given layer is currently added to the map
		hasLayer: function (layer) {
			return !!layer && (stamp(layer) in this._layers);
		},

		/* @method eachLayer(fn: Function, context?: Object): this
		 * Iterates over the layers of the map, optionally specifying context of the iterator function.
		 * ```
		 * map.eachLayer(function(layer){
		 *     layer.bindPopup('Hello');
		 * });
		 * ```
		 */
		eachLayer: function (method, context) {
			for (var i in this._layers) {
				method.call(context, this._layers[i]);
			}
			return this;
		},

		_addLayers: function (layers) {
			layers = layers ? (isArray(layers) ? layers : [layers]) : [];

			for (var i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		},

		_addZoomLimit: function (layer) {
			if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
				this._zoomBoundLayers[stamp(layer)] = layer;
				this._updateZoomLevels();
			}
		},

		_removeZoomLimit: function (layer) {
			var id = stamp(layer);

			if (this._zoomBoundLayers[id]) {
				delete this._zoomBoundLayers[id];
				this._updateZoomLevels();
			}
		},

		_updateZoomLevels: function () {
			var minZoom = Infinity,
			    maxZoom = -Infinity,
			    oldZoomSpan = this._getZoomSpan();

			for (var i in this._zoomBoundLayers) {
				var options = this._zoomBoundLayers[i].options;

				minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
				maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
			}

			this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
			this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

			// @section Map state change events
			// @event zoomlevelschange: Event
			// Fired when the number of zoomlevels on the map is changed due
			// to adding or removing a layer.
			if (oldZoomSpan !== this._getZoomSpan()) {
				this.fire('zoomlevelschange');
			}

			if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
				this.setZoom(this._layersMaxZoom);
			}
			if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
				this.setZoom(this._layersMinZoom);
			}
		}
	});

	/*
	 * @class LayerGroup
	 * @aka L.LayerGroup
	 * @inherits Layer
	 *
	 * Used to group several layers and handle them as one. If you add it to the map,
	 * any layers added or removed from the group will be added/removed on the map as
	 * well. Extends `Layer`.
	 *
	 * @example
	 *
	 * ```js
	 * L.layerGroup([marker1, marker2])
	 * 	.addLayer(polyline)
	 * 	.addTo(map);
	 * ```
	 */

	var LayerGroup = Layer.extend({

		initialize: function (layers, options) {
			setOptions(this, options);

			this._layers = {};

			var i, len;

			if (layers) {
				for (i = 0, len = layers.length; i < len; i++) {
					this.addLayer(layers[i]);
				}
			}
		},

		// @method addLayer(layer: Layer): this
		// Adds the given layer to the group.
		addLayer: function (layer) {
			var id = this.getLayerId(layer);

			this._layers[id] = layer;

			if (this._map) {
				this._map.addLayer(layer);
			}

			return this;
		},

		// @method removeLayer(layer: Layer): this
		// Removes the given layer from the group.
		// @alternative
		// @method removeLayer(id: Number): this
		// Removes the layer with the given internal ID from the group.
		removeLayer: function (layer) {
			var id = layer in this._layers ? layer : this.getLayerId(layer);

			if (this._map && this._layers[id]) {
				this._map.removeLayer(this._layers[id]);
			}

			delete this._layers[id];

			return this;
		},

		// @method hasLayer(layer: Layer): Boolean
		// Returns `true` if the given layer is currently added to the group.
		// @alternative
		// @method hasLayer(id: Number): Boolean
		// Returns `true` if the given internal ID is currently added to the group.
		hasLayer: function (layer) {
			return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers);
		},

		// @method clearLayers(): this
		// Removes all the layers from the group.
		clearLayers: function () {
			return this.eachLayer(this.removeLayer, this);
		},

		// @method invoke(methodName: String, …): this
		// Calls `methodName` on every layer contained in this group, passing any
		// additional parameters. Has no effect if the layers contained do not
		// implement `methodName`.
		invoke: function (methodName) {
			var args = Array.prototype.slice.call(arguments, 1),
			    i, layer;

			for (i in this._layers) {
				layer = this._layers[i];

				if (layer[methodName]) {
					layer[methodName].apply(layer, args);
				}
			}

			return this;
		},

		onAdd: function (map) {
			this.eachLayer(map.addLayer, map);
		},

		onRemove: function (map) {
			this.eachLayer(map.removeLayer, map);
		},

		// @method eachLayer(fn: Function, context?: Object): this
		// Iterates over the layers of the group, optionally specifying context of the iterator function.
		// ```js
		// group.eachLayer(function (layer) {
		// 	layer.bindPopup('Hello');
		// });
		// ```
		eachLayer: function (method, context) {
			for (var i in this._layers) {
				method.call(context, this._layers[i]);
			}
			return this;
		},

		// @method getLayer(id: Number): Layer
		// Returns the layer with the given internal ID.
		getLayer: function (id) {
			return this._layers[id];
		},

		// @method getLayers(): Layer[]
		// Returns an array of all the layers added to the group.
		getLayers: function () {
			var layers = [];
			this.eachLayer(layers.push, layers);
			return layers;
		},

		// @method setZIndex(zIndex: Number): this
		// Calls `setZIndex` on every layer contained in this group, passing the z-index.
		setZIndex: function (zIndex) {
			return this.invoke('setZIndex', zIndex);
		},

		// @method getLayerId(layer: Layer): Number
		// Returns the internal ID for a layer
		getLayerId: function (layer) {
			return stamp(layer);
		}
	});


	// @factory L.layerGroup(layers?: Layer[], options?: Object)
	// Create a layer group, optionally given an initial set of layers and an `options` object.
	var layerGroup = function (layers, options) {
		return new LayerGroup(layers, options);
	};

	/*
	 * @class FeatureGroup
	 * @aka L.FeatureGroup
	 * @inherits LayerGroup
	 *
	 * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
	 *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
	 *  * Events are propagated to the `FeatureGroup`, so if the group has an event
	 * handler, it will handle events from any of the layers. This includes mouse events
	 * and custom events.
	 *  * Has `layeradd` and `layerremove` events
	 *
	 * @example
	 *
	 * ```js
	 * L.featureGroup([marker1, marker2, polyline])
	 * 	.bindPopup('Hello world!')
	 * 	.on('click', function() { alert('Clicked on a member of the group!'); })
	 * 	.addTo(map);
	 * ```
	 */

	var FeatureGroup = LayerGroup.extend({

		addLayer: function (layer) {
			if (this.hasLayer(layer)) {
				return this;
			}

			layer.addEventParent(this);

			LayerGroup.prototype.addLayer.call(this, layer);

			// @event layeradd: LayerEvent
			// Fired when a layer is added to this `FeatureGroup`
			return this.fire('layeradd', {layer: layer});
		},

		removeLayer: function (layer) {
			if (!this.hasLayer(layer)) {
				return this;
			}
			if (layer in this._layers) {
				layer = this._layers[layer];
			}

			layer.removeEventParent(this);

			LayerGroup.prototype.removeLayer.call(this, layer);

			// @event layerremove: LayerEvent
			// Fired when a layer is removed from this `FeatureGroup`
			return this.fire('layerremove', {layer: layer});
		},

		// @method setStyle(style: Path options): this
		// Sets the given path options to each layer of the group that has a `setStyle` method.
		setStyle: function (style) {
			return this.invoke('setStyle', style);
		},

		// @method bringToFront(): this
		// Brings the layer group to the top of all other layers
		bringToFront: function () {
			return this.invoke('bringToFront');
		},

		// @method bringToBack(): this
		// Brings the layer group to the back of all other layers
		bringToBack: function () {
			return this.invoke('bringToBack');
		},

		// @method getBounds(): LatLngBounds
		// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
		getBounds: function () {
			var bounds = new LatLngBounds();

			for (var id in this._layers) {
				var layer = this._layers[id];
				bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
			}
			return bounds;
		}
	});

	// @factory L.featureGroup(layers: Layer[])
	// Create a feature group, optionally given an initial set of layers.
	var featureGroup = function (layers) {
		return new FeatureGroup(layers);
	};

	/*
	 * @class Icon
	 * @aka L.Icon
	 *
	 * Represents an icon to provide when creating a marker.
	 *
	 * @example
	 *
	 * ```js
	 * var myIcon = L.icon({
	 *     iconUrl: 'my-icon.png',
	 *     iconRetinaUrl: 'my-icon@2x.png',
	 *     iconSize: [38, 95],
	 *     iconAnchor: [22, 94],
	 *     popupAnchor: [-3, -76],
	 *     shadowUrl: 'my-icon-shadow.png',
	 *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
	 *     shadowSize: [68, 95],
	 *     shadowAnchor: [22, 94]
	 * });
	 *
	 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
	 * ```
	 *
	 * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
	 *
	 */

	var Icon = Class.extend({

		/* @section
		 * @aka Icon options
		 *
		 * @option iconUrl: String = null
		 * **(required)** The URL to the icon image (absolute or relative to your script path).
		 *
		 * @option iconRetinaUrl: String = null
		 * The URL to a retina sized version of the icon image (absolute or relative to your
		 * script path). Used for Retina screen devices.
		 *
		 * @option iconSize: Point = null
		 * Size of the icon image in pixels.
		 *
		 * @option iconAnchor: Point = null
		 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
		 * will be aligned so that this point is at the marker's geographical location. Centered
		 * by default if size is specified, also can be set in CSS with negative margins.
		 *
		 * @option popupAnchor: Point = [0, 0]
		 * The coordinates of the point from which popups will "open", relative to the icon anchor.
		 *
		 * @option tooltipAnchor: Point = [0, 0]
		 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
		 *
		 * @option shadowUrl: String = null
		 * The URL to the icon shadow image. If not specified, no shadow image will be created.
		 *
		 * @option shadowRetinaUrl: String = null
		 *
		 * @option shadowSize: Point = null
		 * Size of the shadow image in pixels.
		 *
		 * @option shadowAnchor: Point = null
		 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
		 * as iconAnchor if not specified).
		 *
		 * @option className: String = ''
		 * A custom class name to assign to both icon and shadow images. Empty by default.
		 */

		options: {
			popupAnchor: [0, 0],
			tooltipAnchor: [0, 0]
		},

		initialize: function (options) {
			setOptions(this, options);
		},

		// @method createIcon(oldIcon?: HTMLElement): HTMLElement
		// Called internally when the icon has to be shown, returns a `<img>` HTML element
		// styled according to the options.
		createIcon: function (oldIcon) {
			return this._createIcon('icon', oldIcon);
		},

		// @method createShadow(oldIcon?: HTMLElement): HTMLElement
		// As `createIcon`, but for the shadow beneath it.
		createShadow: function (oldIcon) {
			return this._createIcon('shadow', oldIcon);
		},

		_createIcon: function (name, oldIcon) {
			var src = this._getIconUrl(name);

			if (!src) {
				if (name === 'icon') {
					throw new Error('iconUrl not set in Icon options (see the docs).');
				}
				return null;
			}

			var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
			this._setIconStyles(img, name);

			return img;
		},

		_setIconStyles: function (img, name) {
			var options = this.options;
			var sizeOption = options[name + 'Size'];

			if (typeof sizeOption === 'number') {
				sizeOption = [sizeOption, sizeOption];
			}

			var size = toPoint(sizeOption),
			    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
			            size && size.divideBy(2, true));

			img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

			if (anchor) {
				img.style.marginLeft = (-anchor.x) + 'px';
				img.style.marginTop  = (-anchor.y) + 'px';
			}

			if (size) {
				img.style.width  = size.x + 'px';
				img.style.height = size.y + 'px';
			}
		},

		_createImg: function (src, el) {
			el = el || document.createElement('img');
			el.src = src;
			return el;
		},

		_getIconUrl: function (name) {
			return retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
		}
	});


	// @factory L.icon(options: Icon options)
	// Creates an icon instance with the given options.
	function icon(options) {
		return new Icon(options);
	}

	/*
	 * @miniclass Icon.Default (Icon)
	 * @aka L.Icon.Default
	 * @section
	 *
	 * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
	 * no icon is specified. Points to the blue marker image distributed with Leaflet
	 * releases.
	 *
	 * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
	 * (which is a set of `Icon options`).
	 *
	 * If you want to _completely_ replace the default icon, override the
	 * `L.Marker.prototype.options.icon` with your own icon instead.
	 */

	var IconDefault = Icon.extend({

		options: {
			iconUrl:       'marker-icon.png',
			iconRetinaUrl: 'marker-icon-2x.png',
			shadowUrl:     'marker-shadow.png',
			iconSize:    [25, 41],
			iconAnchor:  [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize:  [41, 41]
		},

		_getIconUrl: function (name) {
			if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
				IconDefault.imagePath = this._detectIconPath();
			}

			// @option imagePath: String
			// `Icon.Default` will try to auto-detect the location of the
			// blue icon images. If you are placing these images in a non-standard
			// way, set this option to point to the right path.
			return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
		},

		_detectIconPath: function () {
			var el = create$1('div',  'leaflet-default-icon-path', document.body);
			var path = getStyle(el, 'background-image') ||
			           getStyle(el, 'backgroundImage');	// IE8

			document.body.removeChild(el);

			if (path === null || path.indexOf('url') !== 0) {
				path = '';
			} else {
				path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
			}

			return path;
		}
	});

	/*
	 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
	 */


	/* @namespace Marker
	 * @section Interaction handlers
	 *
	 * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
	 *
	 * ```js
	 * marker.dragging.disable();
	 * ```
	 *
	 * @property dragging: Handler
	 * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
	 */

	var MarkerDrag = Handler.extend({
		initialize: function (marker) {
			this._marker = marker;
		},

		addHooks: function () {
			var icon = this._marker._icon;

			if (!this._draggable) {
				this._draggable = new Draggable(icon, icon, true);
			}

			this._draggable.on({
				dragstart: this._onDragStart,
				predrag: this._onPreDrag,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this).enable();

			addClass(icon, 'leaflet-marker-draggable');
		},

		removeHooks: function () {
			this._draggable.off({
				dragstart: this._onDragStart,
				predrag: this._onPreDrag,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this).disable();

			if (this._marker._icon) {
				removeClass(this._marker._icon, 'leaflet-marker-draggable');
			}
		},

		moved: function () {
			return this._draggable && this._draggable._moved;
		},

		_adjustPan: function (e) {
			var marker = this._marker,
			    map = marker._map,
			    speed = this._marker.options.autoPanSpeed,
			    padding = this._marker.options.autoPanPadding,
			    iconPos = getPosition(marker._icon),
			    bounds = map.getPixelBounds(),
			    origin = map.getPixelOrigin();

			var panBounds = toBounds(
				bounds.min._subtract(origin).add(padding),
				bounds.max._subtract(origin).subtract(padding)
			);

			if (!panBounds.contains(iconPos)) {
				// Compute incremental movement
				var movement = toPoint(
					(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
					(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

					(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
					(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
				).multiplyBy(speed);

				map.panBy(movement, {animate: false});

				this._draggable._newPos._add(movement);
				this._draggable._startPos._add(movement);

				setPosition(marker._icon, this._draggable._newPos);
				this._onDrag(e);

				this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
			}
		},

		_onDragStart: function () {
			// @section Dragging events
			// @event dragstart: Event
			// Fired when the user starts dragging the marker.

			// @event movestart: Event
			// Fired when the marker starts moving (because of dragging).

			this._oldLatLng = this._marker.getLatLng();
			this._marker
			    .closePopup()
			    .fire('movestart')
			    .fire('dragstart');
		},

		_onPreDrag: function (e) {
			if (this._marker.options.autoPan) {
				cancelAnimFrame(this._panRequest);
				this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
			}
		},

		_onDrag: function (e) {
			var marker = this._marker,
			    shadow = marker._shadow,
			    iconPos = getPosition(marker._icon),
			    latlng = marker._map.layerPointToLatLng(iconPos);

			// update shadow position
			if (shadow) {
				setPosition(shadow, iconPos);
			}

			marker._latlng = latlng;
			e.latlng = latlng;
			e.oldLatLng = this._oldLatLng;

			// @event drag: Event
			// Fired repeatedly while the user drags the marker.
			marker
			    .fire('move', e)
			    .fire('drag', e);
		},

		_onDragEnd: function (e) {
			// @event dragend: DragEndEvent
			// Fired when the user stops dragging the marker.

			 cancelAnimFrame(this._panRequest);

			// @event moveend: Event
			// Fired when the marker stops moving (because of dragging).
			delete this._oldLatLng;
			this._marker
			    .fire('moveend')
			    .fire('dragend', e);
		}
	});

	/*
	 * @class Marker
	 * @inherits Interactive layer
	 * @aka L.Marker
	 * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
	 *
	 * @example
	 *
	 * ```js
	 * L.marker([50.5, 30.5]).addTo(map);
	 * ```
	 */

	var Marker = Layer.extend({

		// @section
		// @aka Marker options
		options: {
			// @option icon: Icon = *
			// Icon instance to use for rendering the marker.
			// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
			// If not specified, a common instance of `L.Icon.Default` is used.
			icon: new IconDefault(),

			// Option inherited from "Interactive layer" abstract class
			interactive: true,

			// @option keyboard: Boolean = true
			// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
			keyboard: true,

			// @option title: String = ''
			// Text for the browser tooltip that appear on marker hover (no tooltip by default).
			title: '',

			// @option alt: String = ''
			// Text for the `alt` attribute of the icon image (useful for accessibility).
			alt: '',

			// @option zIndexOffset: Number = 0
			// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
			zIndexOffset: 0,

			// @option opacity: Number = 1.0
			// The opacity of the marker.
			opacity: 1,

			// @option riseOnHover: Boolean = false
			// If `true`, the marker will get on top of others when you hover the mouse over it.
			riseOnHover: false,

			// @option riseOffset: Number = 250
			// The z-index offset used for the `riseOnHover` feature.
			riseOffset: 250,

			// @option pane: String = 'markerPane'
			// `Map pane` where the markers icon will be added.
			pane: 'markerPane',

			// @option pane: String = 'shadowPane'
			// `Map pane` where the markers shadow will be added.
			shadowPane: 'shadowPane',

			// @option bubblingMouseEvents: Boolean = false
			// When `true`, a mouse event on this marker will trigger the same event on the map
			// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
			bubblingMouseEvents: false,

			// @section Draggable marker options
			// @option draggable: Boolean = false
			// Whether the marker is draggable with mouse/touch or not.
			draggable: false,

			// @option autoPan: Boolean = false
			// Whether to pan the map when dragging this marker near its edge or not.
			autoPan: false,

			// @option autoPanPadding: Point = Point(50, 50)
			// Distance (in pixels to the left/right and to the top/bottom) of the
			// map edge to start panning the map.
			autoPanPadding: [50, 50],

			// @option autoPanSpeed: Number = 10
			// Number of pixels the map should pan by.
			autoPanSpeed: 10
		},

		/* @section
		 *
		 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
		 */

		initialize: function (latlng, options) {
			setOptions(this, options);
			this._latlng = toLatLng(latlng);
		},

		onAdd: function (map) {
			this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

			if (this._zoomAnimated) {
				map.on('zoomanim', this._animateZoom, this);
			}

			this._initIcon();
			this.update();
		},

		onRemove: function (map) {
			if (this.dragging && this.dragging.enabled()) {
				this.options.draggable = true;
				this.dragging.removeHooks();
			}
			delete this.dragging;

			if (this._zoomAnimated) {
				map.off('zoomanim', this._animateZoom, this);
			}

			this._removeIcon();
			this._removeShadow();
		},

		getEvents: function () {
			return {
				zoom: this.update,
				viewreset: this.update
			};
		},

		// @method getLatLng: LatLng
		// Returns the current geographical position of the marker.
		getLatLng: function () {
			return this._latlng;
		},

		// @method setLatLng(latlng: LatLng): this
		// Changes the marker position to the given point.
		setLatLng: function (latlng) {
			var oldLatLng = this._latlng;
			this._latlng = toLatLng(latlng);
			this.update();

			// @event move: Event
			// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
			return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
		},

		// @method setZIndexOffset(offset: Number): this
		// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
		setZIndexOffset: function (offset) {
			this.options.zIndexOffset = offset;
			return this.update();
		},

		// @method getIcon: Icon
		// Returns the current icon used by the marker
		getIcon: function () {
			return this.options.icon;
		},

		// @method setIcon(icon: Icon): this
		// Changes the marker icon.
		setIcon: function (icon) {

			this.options.icon = icon;

			if (this._map) {
				this._initIcon();
				this.update();
			}

			if (this._popup) {
				this.bindPopup(this._popup, this._popup.options);
			}

			return this;
		},

		getElement: function () {
			return this._icon;
		},

		update: function () {

			if (this._icon && this._map) {
				var pos = this._map.latLngToLayerPoint(this._latlng).round();
				this._setPos(pos);
			}

			return this;
		},

		_initIcon: function () {
			var options = this.options,
			    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

			var icon = options.icon.createIcon(this._icon),
			    addIcon = false;

			// if we're not reusing the icon, remove the old one and init new one
			if (icon !== this._icon) {
				if (this._icon) {
					this._removeIcon();
				}
				addIcon = true;

				if (options.title) {
					icon.title = options.title;
				}

				if (icon.tagName === 'IMG') {
					icon.alt = options.alt || '';
				}
			}

			addClass(icon, classToAdd);

			if (options.keyboard) {
				icon.tabIndex = '0';
			}

			this._icon = icon;

			if (options.riseOnHover) {
				this.on({
					mouseover: this._bringToFront,
					mouseout: this._resetZIndex
				});
			}

			var newShadow = options.icon.createShadow(this._shadow),
			    addShadow = false;

			if (newShadow !== this._shadow) {
				this._removeShadow();
				addShadow = true;
			}

			if (newShadow) {
				addClass(newShadow, classToAdd);
				newShadow.alt = '';
			}
			this._shadow = newShadow;


			if (options.opacity < 1) {
				this._updateOpacity();
			}


			if (addIcon) {
				this.getPane().appendChild(this._icon);
			}
			this._initInteraction();
			if (newShadow && addShadow) {
				this.getPane(options.shadowPane).appendChild(this._shadow);
			}
		},

		_removeIcon: function () {
			if (this.options.riseOnHover) {
				this.off({
					mouseover: this._bringToFront,
					mouseout: this._resetZIndex
				});
			}

			remove(this._icon);
			this.removeInteractiveTarget(this._icon);

			this._icon = null;
		},

		_removeShadow: function () {
			if (this._shadow) {
				remove(this._shadow);
			}
			this._shadow = null;
		},

		_setPos: function (pos) {

			if (this._icon) {
				setPosition(this._icon, pos);
			}

			if (this._shadow) {
				setPosition(this._shadow, pos);
			}

			this._zIndex = pos.y + this.options.zIndexOffset;

			this._resetZIndex();
		},

		_updateZIndex: function (offset) {
			if (this._icon) {
				this._icon.style.zIndex = this._zIndex + offset;
			}
		},

		_animateZoom: function (opt) {
			var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

			this._setPos(pos);
		},

		_initInteraction: function () {

			if (!this.options.interactive) { return; }

			addClass(this._icon, 'leaflet-interactive');

			this.addInteractiveTarget(this._icon);

			if (MarkerDrag) {
				var draggable = this.options.draggable;
				if (this.dragging) {
					draggable = this.dragging.enabled();
					this.dragging.disable();
				}

				this.dragging = new MarkerDrag(this);

				if (draggable) {
					this.dragging.enable();
				}
			}
		},

		// @method setOpacity(opacity: Number): this
		// Changes the opacity of the marker.
		setOpacity: function (opacity) {
			this.options.opacity = opacity;
			if (this._map) {
				this._updateOpacity();
			}

			return this;
		},

		_updateOpacity: function () {
			var opacity = this.options.opacity;

			if (this._icon) {
				setOpacity(this._icon, opacity);
			}

			if (this._shadow) {
				setOpacity(this._shadow, opacity);
			}
		},

		_bringToFront: function () {
			this._updateZIndex(this.options.riseOffset);
		},

		_resetZIndex: function () {
			this._updateZIndex(0);
		},

		_getPopupAnchor: function () {
			return this.options.icon.options.popupAnchor;
		},

		_getTooltipAnchor: function () {
			return this.options.icon.options.tooltipAnchor;
		}
	});


	// factory L.marker(latlng: LatLng, options? : Marker options)

	// @factory L.marker(latlng: LatLng, options? : Marker options)
	// Instantiates a Marker object given a geographical point and optionally an options object.
	function marker(latlng, options) {
		return new Marker(latlng, options);
	}

	/*
	 * @class Path
	 * @aka L.Path
	 * @inherits Interactive layer
	 *
	 * An abstract class that contains options and constants shared between vector
	 * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
	 */

	var Path = Layer.extend({

		// @section
		// @aka Path options
		options: {
			// @option stroke: Boolean = true
			// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
			stroke: true,

			// @option color: String = '#3388ff'
			// Stroke color
			color: '#3388ff',

			// @option weight: Number = 3
			// Stroke width in pixels
			weight: 3,

			// @option opacity: Number = 1.0
			// Stroke opacity
			opacity: 1,

			// @option lineCap: String= 'round'
			// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
			lineCap: 'round',

			// @option lineJoin: String = 'round'
			// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
			lineJoin: 'round',

			// @option dashArray: String = null
			// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
			dashArray: null,

			// @option dashOffset: String = null
			// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
			dashOffset: null,

			// @option fill: Boolean = depends
			// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
			fill: false,

			// @option fillColor: String = *
			// Fill color. Defaults to the value of the [`color`](#path-color) option
			fillColor: null,

			// @option fillOpacity: Number = 0.2
			// Fill opacity.
			fillOpacity: 0.2,

			// @option fillRule: String = 'evenodd'
			// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
			fillRule: 'evenodd',

			// className: '',

			// Option inherited from "Interactive layer" abstract class
			interactive: true,

			// @option bubblingMouseEvents: Boolean = true
			// When `true`, a mouse event on this path will trigger the same event on the map
			// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
			bubblingMouseEvents: true
		},

		beforeAdd: function (map) {
			// Renderer is set here because we need to call renderer.getEvents
			// before this.getEvents.
			this._renderer = map.getRenderer(this);
		},

		onAdd: function () {
			this._renderer._initPath(this);
			this._reset();
			this._renderer._addPath(this);
		},

		onRemove: function () {
			this._renderer._removePath(this);
		},

		// @method redraw(): this
		// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
		redraw: function () {
			if (this._map) {
				this._renderer._updatePath(this);
			}
			return this;
		},

		// @method setStyle(style: Path options): this
		// Changes the appearance of a Path based on the options in the `Path options` object.
		setStyle: function (style) {
			setOptions(this, style);
			if (this._renderer) {
				this._renderer._updateStyle(this);
				if (this.options.stroke && style && style.hasOwnProperty('weight')) {
					this._updateBounds();
				}
			}
			return this;
		},

		// @method bringToFront(): this
		// Brings the layer to the top of all path layers.
		bringToFront: function () {
			if (this._renderer) {
				this._renderer._bringToFront(this);
			}
			return this;
		},

		// @method bringToBack(): this
		// Brings the layer to the bottom of all path layers.
		bringToBack: function () {
			if (this._renderer) {
				this._renderer._bringToBack(this);
			}
			return this;
		},

		getElement: function () {
			return this._path;
		},

		_reset: function () {
			// defined in child classes
			this._project();
			this._update();
		},

		_clickTolerance: function () {
			// used when doing hit detection for Canvas layers
			return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
		}
	});

	/*
	 * @class CircleMarker
	 * @aka L.CircleMarker
	 * @inherits Path
	 *
	 * A circle of a fixed size with radius specified in pixels. Extends `Path`.
	 */

	var CircleMarker = Path.extend({

		// @section
		// @aka CircleMarker options
		options: {
			fill: true,

			// @option radius: Number = 10
			// Radius of the circle marker, in pixels
			radius: 10
		},

		initialize: function (latlng, options) {
			setOptions(this, options);
			this._latlng = toLatLng(latlng);
			this._radius = this.options.radius;
		},

		// @method setLatLng(latLng: LatLng): this
		// Sets the position of a circle marker to a new location.
		setLatLng: function (latlng) {
			var oldLatLng = this._latlng;
			this._latlng = toLatLng(latlng);
			this.redraw();

			// @event move: Event
			// Fired when the marker is moved via [`setLatLng`](#circlemarker-setlatlng). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
			return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
		},

		// @method getLatLng(): LatLng
		// Returns the current geographical position of the circle marker
		getLatLng: function () {
			return this._latlng;
		},

		// @method setRadius(radius: Number): this
		// Sets the radius of a circle marker. Units are in pixels.
		setRadius: function (radius) {
			this.options.radius = this._radius = radius;
			return this.redraw();
		},

		// @method getRadius(): Number
		// Returns the current radius of the circle
		getRadius: function () {
			return this._radius;
		},

		setStyle : function (options) {
			var radius = options && options.radius || this._radius;
			Path.prototype.setStyle.call(this, options);
			this.setRadius(radius);
			return this;
		},

		_project: function () {
			this._point = this._map.latLngToLayerPoint(this._latlng);
			this._updateBounds();
		},

		_updateBounds: function () {
			var r = this._radius,
			    r2 = this._radiusY || r,
			    w = this._clickTolerance(),
			    p = [r + w, r2 + w];
			this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
		},

		_update: function () {
			if (this._map) {
				this._updatePath();
			}
		},

		_updatePath: function () {
			this._renderer._updateCircle(this);
		},

		_empty: function () {
			return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
		},

		// Needed by the `Canvas` renderer for interactivity
		_containsPoint: function (p) {
			return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
		}
	});


	// @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
	// Instantiates a circle marker object given a geographical point, and an optional options object.
	function circleMarker(latlng, options) {
		return new CircleMarker(latlng, options);
	}

	/*
	 * @class Circle
	 * @aka L.Circle
	 * @inherits CircleMarker
	 *
	 * A class for drawing circle overlays on a map. Extends `CircleMarker`.
	 *
	 * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
	 *
	 * @example
	 *
	 * ```js
	 * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
	 * ```
	 */

	var Circle = CircleMarker.extend({

		initialize: function (latlng, options, legacyOptions) {
			if (typeof options === 'number') {
				// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
				options = extend({}, legacyOptions, {radius: options});
			}
			setOptions(this, options);
			this._latlng = toLatLng(latlng);

			if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

			// @section
			// @aka Circle options
			// @option radius: Number; Radius of the circle, in meters.
			this._mRadius = this.options.radius;
		},

		// @method setRadius(radius: Number): this
		// Sets the radius of a circle. Units are in meters.
		setRadius: function (radius) {
			this._mRadius = radius;
			return this.redraw();
		},

		// @method getRadius(): Number
		// Returns the current radius of a circle. Units are in meters.
		getRadius: function () {
			return this._mRadius;
		},

		// @method getBounds(): LatLngBounds
		// Returns the `LatLngBounds` of the path.
		getBounds: function () {
			var half = [this._radius, this._radiusY || this._radius];

			return new LatLngBounds(
				this._map.layerPointToLatLng(this._point.subtract(half)),
				this._map.layerPointToLatLng(this._point.add(half)));
		},

		setStyle: Path.prototype.setStyle,

		_project: function () {

			var lng = this._latlng.lng,
			    lat = this._latlng.lat,
			    map = this._map,
			    crs = map.options.crs;

			if (crs.distance === Earth.distance) {
				var d = Math.PI / 180,
				    latR = (this._mRadius / Earth.R) / d,
				    top = map.project([lat + latR, lng]),
				    bottom = map.project([lat - latR, lng]),
				    p = top.add(bottom).divideBy(2),
				    lat2 = map.unproject(p).lat,
				    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
				            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

				if (isNaN(lngR) || lngR === 0) {
					lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
				}

				this._point = p.subtract(map.getPixelOrigin());
				this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
				this._radiusY = p.y - top.y;

			} else {
				var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

				this._point = map.latLngToLayerPoint(this._latlng);
				this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
			}

			this._updateBounds();
		}
	});

	// @factory L.circle(latlng: LatLng, options?: Circle options)
	// Instantiates a circle object given a geographical point, and an options object
	// which contains the circle radius.
	// @alternative
	// @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
	// Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
	// Do not use in new applications or plugins.
	function circle(latlng, options, legacyOptions) {
		return new Circle(latlng, options, legacyOptions);
	}

	/*
	 * @class Polyline
	 * @aka L.Polyline
	 * @inherits Path
	 *
	 * A class for drawing polyline overlays on a map. Extends `Path`.
	 *
	 * @example
	 *
	 * ```js
	 * // create a red polyline from an array of LatLng points
	 * var latlngs = [
	 * 	[45.51, -122.68],
	 * 	[37.77, -122.43],
	 * 	[34.04, -118.2]
	 * ];
	 *
	 * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
	 *
	 * // zoom the map to the polyline
	 * map.fitBounds(polyline.getBounds());
	 * ```
	 *
	 * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
	 *
	 * ```js
	 * // create a red polyline from an array of arrays of LatLng points
	 * var latlngs = [
	 * 	[[45.51, -122.68],
	 * 	 [37.77, -122.43],
	 * 	 [34.04, -118.2]],
	 * 	[[40.78, -73.91],
	 * 	 [41.83, -87.62],
	 * 	 [32.76, -96.72]]
	 * ];
	 * ```
	 */


	var Polyline = Path.extend({

		// @section
		// @aka Polyline options
		options: {
			// @option smoothFactor: Number = 1.0
			// How much to simplify the polyline on each zoom level. More means
			// better performance and smoother look, and less means more accurate representation.
			smoothFactor: 1.0,

			// @option noClip: Boolean = false
			// Disable polyline clipping.
			noClip: false
		},

		initialize: function (latlngs, options) {
			setOptions(this, options);
			this._setLatLngs(latlngs);
		},

		// @method getLatLngs(): LatLng[]
		// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
		getLatLngs: function () {
			return this._latlngs;
		},

		// @method setLatLngs(latlngs: LatLng[]): this
		// Replaces all the points in the polyline with the given array of geographical points.
		setLatLngs: function (latlngs) {
			this._setLatLngs(latlngs);
			return this.redraw();
		},

		// @method isEmpty(): Boolean
		// Returns `true` if the Polyline has no LatLngs.
		isEmpty: function () {
			return !this._latlngs.length;
		},

		// @method closestLayerPoint(p: Point): Point
		// Returns the point closest to `p` on the Polyline.
		closestLayerPoint: function (p) {
			var minDistance = Infinity,
			    minPoint = null,
			    closest = _sqClosestPointOnSegment,
			    p1, p2;

			for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
				var points = this._parts[j];

				for (var i = 1, len = points.length; i < len; i++) {
					p1 = points[i - 1];
					p2 = points[i];

					var sqDist = closest(p, p1, p2, true);

					if (sqDist < minDistance) {
						minDistance = sqDist;
						minPoint = closest(p, p1, p2);
					}
				}
			}
			if (minPoint) {
				minPoint.distance = Math.sqrt(minDistance);
			}
			return minPoint;
		},

		// @method getCenter(): LatLng
		// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
		getCenter: function () {
			// throws error when not yet added to map as this center calculation requires projected coordinates
			if (!this._map) {
				throw new Error('Must add layer to map before using getCenter()');
			}

			var i, halfDist, segDist, dist, p1, p2, ratio,
			    points = this._rings[0],
			    len = points.length;

			if (!len) { return null; }

			// polyline centroid algorithm; only uses the first ring if there are multiple

			for (i = 0, halfDist = 0; i < len - 1; i++) {
				halfDist += points[i].distanceTo(points[i + 1]) / 2;
			}

			// The line is so small in the current view that all points are on the same pixel.
			if (halfDist === 0) {
				return this._map.layerPointToLatLng(points[0]);
			}

			for (i = 0, dist = 0; i < len - 1; i++) {
				p1 = points[i];
				p2 = points[i + 1];
				segDist = p1.distanceTo(p2);
				dist += segDist;

				if (dist > halfDist) {
					ratio = (dist - halfDist) / segDist;
					return this._map.layerPointToLatLng([
						p2.x - ratio * (p2.x - p1.x),
						p2.y - ratio * (p2.y - p1.y)
					]);
				}
			}
		},

		// @method getBounds(): LatLngBounds
		// Returns the `LatLngBounds` of the path.
		getBounds: function () {
			return this._bounds;
		},

		// @method addLatLng(latlng: LatLng, latlngs? LatLng[]): this
		// Adds a given point to the polyline. By default, adds to the first ring of
		// the polyline in case of a multi-polyline, but can be overridden by passing
		// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
		addLatLng: function (latlng, latlngs) {
			latlngs = latlngs || this._defaultShape();
			latlng = toLatLng(latlng);
			latlngs.push(latlng);
			this._bounds.extend(latlng);
			return this.redraw();
		},

		_setLatLngs: function (latlngs) {
			this._bounds = new LatLngBounds();
			this._latlngs = this._convertLatLngs(latlngs);
		},

		_defaultShape: function () {
			return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
		},

		// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
		_convertLatLngs: function (latlngs) {
			var result = [],
			    flat = isFlat(latlngs);

			for (var i = 0, len = latlngs.length; i < len; i++) {
				if (flat) {
					result[i] = toLatLng(latlngs[i]);
					this._bounds.extend(result[i]);
				} else {
					result[i] = this._convertLatLngs(latlngs[i]);
				}
			}

			return result;
		},

		_project: function () {
			var pxBounds = new Bounds();
			this._rings = [];
			this._projectLatlngs(this._latlngs, this._rings, pxBounds);

			if (this._bounds.isValid() && pxBounds.isValid()) {
				this._rawPxBounds = pxBounds;
				this._updateBounds();
			}
		},

		_updateBounds: function () {
			var w = this._clickTolerance(),
			    p = new Point(w, w);
			this._pxBounds = new Bounds([
				this._rawPxBounds.min.subtract(p),
				this._rawPxBounds.max.add(p)
			]);
		},

		// recursively turns latlngs into a set of rings with projected coordinates
		_projectLatlngs: function (latlngs, result, projectedBounds) {
			var flat = latlngs[0] instanceof LatLng,
			    len = latlngs.length,
			    i, ring;

			if (flat) {
				ring = [];
				for (i = 0; i < len; i++) {
					ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
					projectedBounds.extend(ring[i]);
				}
				result.push(ring);
			} else {
				for (i = 0; i < len; i++) {
					this._projectLatlngs(latlngs[i], result, projectedBounds);
				}
			}
		},

		// clip polyline by renderer bounds so that we have less to render for performance
		_clipPoints: function () {
			var bounds = this._renderer._bounds;

			this._parts = [];
			if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
				return;
			}

			if (this.options.noClip) {
				this._parts = this._rings;
				return;
			}

			var parts = this._parts,
			    i, j, k, len, len2, segment, points;

			for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
				points = this._rings[i];

				for (j = 0, len2 = points.length; j < len2 - 1; j++) {
					segment = clipSegment(points[j], points[j + 1], bounds, j, true);

					if (!segment) { continue; }

					parts[k] = parts[k] || [];
					parts[k].push(segment[0]);

					// if segment goes out of screen, or it's the last one, it's the end of the line part
					if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
						parts[k].push(segment[1]);
						k++;
					}
				}
			}
		},

		// simplify each clipped part of the polyline for performance
		_simplifyPoints: function () {
			var parts = this._parts,
			    tolerance = this.options.smoothFactor;

			for (var i = 0, len = parts.length; i < len; i++) {
				parts[i] = simplify(parts[i], tolerance);
			}
		},

		_update: function () {
			if (!this._map) { return; }

			this._clipPoints();
			this._simplifyPoints();
			this._updatePath();
		},

		_updatePath: function () {
			this._renderer._updatePoly(this);
		},

		// Needed by the `Canvas` renderer for interactivity
		_containsPoint: function (p, closed) {
			var i, j, k, len, len2, part,
			    w = this._clickTolerance();

			if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

			// hit detection for polylines
			for (i = 0, len = this._parts.length; i < len; i++) {
				part = this._parts[i];

				for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
					if (!closed && (j === 0)) { continue; }

					if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
						return true;
					}
				}
			}
			return false;
		}
	});

	// @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
	// Instantiates a polyline object given an array of geographical points and
	// optionally an options object. You can create a `Polyline` object with
	// multiple separate lines (`MultiPolyline`) by passing an array of arrays
	// of geographic points.
	function polyline(latlngs, options) {
		return new Polyline(latlngs, options);
	}

	// Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
	Polyline._flat = _flat;

	/*
	 * @class Polygon
	 * @aka L.Polygon
	 * @inherits Polyline
	 *
	 * A class for drawing polygon overlays on a map. Extends `Polyline`.
	 *
	 * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
	 *
	 *
	 * @example
	 *
	 * ```js
	 * // create a red polygon from an array of LatLng points
	 * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
	 *
	 * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
	 *
	 * // zoom the map to the polygon
	 * map.fitBounds(polygon.getBounds());
	 * ```
	 *
	 * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
	 *
	 * ```js
	 * var latlngs = [
	 *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
	 *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
	 * ];
	 * ```
	 *
	 * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
	 *
	 * ```js
	 * var latlngs = [
	 *   [ // first polygon
	 *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
	 *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
	 *   ],
	 *   [ // second polygon
	 *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
	 *   ]
	 * ];
	 * ```
	 */

	var Polygon = Polyline.extend({

		options: {
			fill: true
		},

		isEmpty: function () {
			return !this._latlngs.length || !this._latlngs[0].length;
		},

		getCenter: function () {
			// throws error when not yet added to map as this center calculation requires projected coordinates
			if (!this._map) {
				throw new Error('Must add layer to map before using getCenter()');
			}

			var i, j, p1, p2, f, area, x, y, center,
			    points = this._rings[0],
			    len = points.length;

			if (!len) { return null; }

			// polygon centroid algorithm; only uses the first ring if there are multiple

			area = x = y = 0;

			for (i = 0, j = len - 1; i < len; j = i++) {
				p1 = points[i];
				p2 = points[j];

				f = p1.y * p2.x - p2.y * p1.x;
				x += (p1.x + p2.x) * f;
				y += (p1.y + p2.y) * f;
				area += f * 3;
			}

			if (area === 0) {
				// Polygon is so small that all points are on same pixel.
				center = points[0];
			} else {
				center = [x / area, y / area];
			}
			return this._map.layerPointToLatLng(center);
		},

		_convertLatLngs: function (latlngs) {
			var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
			    len = result.length;

			// remove last point if it equals first one
			if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
				result.pop();
			}
			return result;
		},

		_setLatLngs: function (latlngs) {
			Polyline.prototype._setLatLngs.call(this, latlngs);
			if (isFlat(this._latlngs)) {
				this._latlngs = [this._latlngs];
			}
		},

		_defaultShape: function () {
			return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
		},

		_clipPoints: function () {
			// polygons need a different clipping algorithm so we redefine that

			var bounds = this._renderer._bounds,
			    w = this.options.weight,
			    p = new Point(w, w);

			// increase clip padding by stroke width to avoid stroke on clip edges
			bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

			this._parts = [];
			if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
				return;
			}

			if (this.options.noClip) {
				this._parts = this._rings;
				return;
			}

			for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
				clipped = clipPolygon(this._rings[i], bounds, true);
				if (clipped.length) {
					this._parts.push(clipped);
				}
			}
		},

		_updatePath: function () {
			this._renderer._updatePoly(this, true);
		},

		// Needed by the `Canvas` renderer for interactivity
		_containsPoint: function (p) {
			var inside = false,
			    part, p1, p2, i, j, k, len, len2;

			if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

			// ray casting algorithm for detecting if point is in polygon
			for (i = 0, len = this._parts.length; i < len; i++) {
				part = this._parts[i];

				for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
					p1 = part[j];
					p2 = part[k];

					if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
						inside = !inside;
					}
				}
			}

			// also check if it's on polygon stroke
			return inside || Polyline.prototype._containsPoint.call(this, p, true);
		}

	});


	// @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
	function polygon(latlngs, options) {
		return new Polygon(latlngs, options);
	}

	/*
	 * @class GeoJSON
	 * @aka L.GeoJSON
	 * @inherits FeatureGroup
	 *
	 * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
	 * GeoJSON data and display it on the map. Extends `FeatureGroup`.
	 *
	 * @example
	 *
	 * ```js
	 * L.geoJSON(data, {
	 * 	style: function (feature) {
	 * 		return {color: feature.properties.color};
	 * 	}
	 * }).bindPopup(function (layer) {
	 * 	return layer.feature.properties.description;
	 * }).addTo(map);
	 * ```
	 */

	var GeoJSON = FeatureGroup.extend({

		/* @section
		 * @aka GeoJSON options
		 *
		 * @option pointToLayer: Function = *
		 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
		 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
		 * The default is to spawn a default `Marker`:
		 * ```js
		 * function(geoJsonPoint, latlng) {
		 * 	return L.marker(latlng);
		 * }
		 * ```
		 *
		 * @option style: Function = *
		 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
		 * called internally when data is added.
		 * The default value is to not override any defaults:
		 * ```js
		 * function (geoJsonFeature) {
		 * 	return {}
		 * }
		 * ```
		 *
		 * @option onEachFeature: Function = *
		 * A `Function` that will be called once for each created `Feature`, after it has
		 * been created and styled. Useful for attaching events and popups to features.
		 * The default is to do nothing with the newly created layers:
		 * ```js
		 * function (feature, layer) {}
		 * ```
		 *
		 * @option filter: Function = *
		 * A `Function` that will be used to decide whether to include a feature or not.
		 * The default is to include all features:
		 * ```js
		 * function (geoJsonFeature) {
		 * 	return true;
		 * }
		 * ```
		 * Note: dynamically changing the `filter` option will have effect only on newly
		 * added data. It will _not_ re-evaluate already included features.
		 *
		 * @option coordsToLatLng: Function = *
		 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
		 * The default is the `coordsToLatLng` static method.
		 *
		 * @option markersInheritOptions: Boolean = false
		 * Whether default Markers for "Point" type Features inherit from group options.
		 */

		initialize: function (geojson, options) {
			setOptions(this, options);

			this._layers = {};

			if (geojson) {
				this.addData(geojson);
			}
		},

		// @method addData( <GeoJSON> data ): this
		// Adds a GeoJSON object to the layer.
		addData: function (geojson) {
			var features = isArray(geojson) ? geojson : geojson.features,
			    i, len, feature;

			if (features) {
				for (i = 0, len = features.length; i < len; i++) {
					// only add this if geometry or geometries are set and not null
					feature = features[i];
					if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
						this.addData(feature);
					}
				}
				return this;
			}

			var options = this.options;

			if (options.filter && !options.filter(geojson)) { return this; }

			var layer = geometryToLayer(geojson, options);
			if (!layer) {
				return this;
			}
			layer.feature = asFeature(geojson);

			layer.defaultOptions = layer.options;
			this.resetStyle(layer);

			if (options.onEachFeature) {
				options.onEachFeature(geojson, layer);
			}

			return this.addLayer(layer);
		},

		// @method resetStyle( <Path> layer? ): this
		// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
		// If `layer` is omitted, the style of all features in the current layer is reset.
		resetStyle: function (layer) {
			if (layer === undefined) {
				return this.eachLayer(this.resetStyle, this);
			}
			// reset any custom styles
			layer.options = extend({}, layer.defaultOptions);
			this._setLayerStyle(layer, this.options.style);
			return this;
		},

		// @method setStyle( <Function> style ): this
		// Changes styles of GeoJSON vector layers with the given style function.
		setStyle: function (style) {
			return this.eachLayer(function (layer) {
				this._setLayerStyle(layer, style);
			}, this);
		},

		_setLayerStyle: function (layer, style) {
			if (layer.setStyle) {
				if (typeof style === 'function') {
					style = style(layer.feature);
				}
				layer.setStyle(style);
			}
		}
	});

	// @section
	// There are several static functions which can be called without instantiating L.GeoJSON:

	// @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
	// Creates a `Layer` from a given GeoJSON feature. Can use a custom
	// [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
	// functions if provided as options.
	function geometryToLayer(geojson, options) {

		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry ? geometry.coordinates : null,
		    layers = [],
		    pointToLayer = options && options.pointToLayer,
		    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
		    latlng, latlngs, i, len;

		if (!coords && !geometry) {
			return null;
		}

		switch (geometry.type) {
		case 'Point':
			latlng = _coordsToLatLng(coords);
			return _pointToLayer(pointToLayer, geojson, latlng, options);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = _coordsToLatLng(coords[i]);
				layers.push(_pointToLayer(pointToLayer, geojson, latlng, options));
			}
			return new FeatureGroup(layers);

		case 'LineString':
		case 'MultiLineString':
			latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
			return new Polyline(latlngs, options);

		case 'Polygon':
		case 'MultiPolygon':
			latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
			return new Polygon(latlngs, options);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {
				var layer = geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, options);

				if (layer) {
					layers.push(layer);
				}
			}
			return new FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	}

	function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
		return pointToLayerFn ?
			pointToLayerFn(geojson, latlng) :
			new Marker(latlng, options && options.markersInheritOptions && options);
	}

	// @function coordsToLatLng(coords: Array): LatLng
	// Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
	// or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
	function coordsToLatLng(coords) {
		return new LatLng(coords[1], coords[0], coords[2]);
	}

	// @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
	// Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
	// `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
	// Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
	function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
		var latlngs = [];

		for (var i = 0, len = coords.length, latlng; i < len; i++) {
			latlng = levelsDeep ?
				coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
				(_coordsToLatLng || coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	}

	// @function latLngToCoords(latlng: LatLng, precision?: Number): Array
	// Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
	function latLngToCoords(latlng, precision) {
		precision = typeof precision === 'number' ? precision : 6;
		return latlng.alt !== undefined ?
			[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
			[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
	}

	// @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
	// Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
	// `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
	function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
		var coords = [];

		for (var i = 0, len = latlngs.length; i < len; i++) {
			coords.push(levelsDeep ?
				latLngsToCoords(latlngs[i], levelsDeep - 1, closed, precision) :
				latLngToCoords(latlngs[i], precision));
		}

		if (!levelsDeep && closed) {
			coords.push(coords[0]);
		}

		return coords;
	}

	function getFeature(layer, newGeometry) {
		return layer.feature ?
			extend({}, layer.feature, {geometry: newGeometry}) :
			asFeature(newGeometry);
	}

	// @function asFeature(geojson: Object): Object
	// Normalize GeoJSON geometries/features into GeoJSON features.
	function asFeature(geojson) {
		if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
			return geojson;
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geojson
		};
	}

	var PointToGeoJSON = {
		toGeoJSON: function (precision) {
			return getFeature(this, {
				type: 'Point',
				coordinates: latLngToCoords(this.getLatLng(), precision)
			});
		}
	};

	// @namespace Marker
	// @section Other methods
	// @method toGeoJSON(precision?: Number): Object
	// `precision` is the number of decimal places for coordinates.
	// The default value is 6 places.
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
	Marker.include(PointToGeoJSON);

	// @namespace CircleMarker
	// @method toGeoJSON(precision?: Number): Object
	// `precision` is the number of decimal places for coordinates.
	// The default value is 6 places.
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
	Circle.include(PointToGeoJSON);
	CircleMarker.include(PointToGeoJSON);


	// @namespace Polyline
	// @method toGeoJSON(precision?: Number): Object
	// `precision` is the number of decimal places for coordinates.
	// The default value is 6 places.
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
	Polyline.include({
		toGeoJSON: function (precision) {
			var multi = !isFlat(this._latlngs);

			var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

			return getFeature(this, {
				type: (multi ? 'Multi' : '') + 'LineString',
				coordinates: coords
			});
		}
	});

	// @namespace Polygon
	// @method toGeoJSON(precision?: Number): Object
	// `precision` is the number of decimal places for coordinates.
	// The default value is 6 places.
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
	Polygon.include({
		toGeoJSON: function (precision) {
			var holes = !isFlat(this._latlngs),
			    multi = holes && !isFlat(this._latlngs[0]);

			var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

			if (!holes) {
				coords = [coords];
			}

			return getFeature(this, {
				type: (multi ? 'Multi' : '') + 'Polygon',
				coordinates: coords
			});
		}
	});


	// @namespace LayerGroup
	LayerGroup.include({
		toMultiPoint: function (precision) {
			var coords = [];

			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON(precision).geometry.coordinates);
			});

			return getFeature(this, {
				type: 'MultiPoint',
				coordinates: coords
			});
		},

		// @method toGeoJSON(precision?: Number): Object
		// `precision` is the number of decimal places for coordinates.
		// The default value is 6 places.
		// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
		toGeoJSON: function (precision) {

			var type = this.feature && this.feature.geometry && this.feature.geometry.type;

			if (type === 'MultiPoint') {
				return this.toMultiPoint(precision);
			}

			var isGeometryCollection = type === 'GeometryCollection',
			    jsons = [];

			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					var json = layer.toGeoJSON(precision);
					if (isGeometryCollection) {
						jsons.push(json.geometry);
					} else {
						var feature = asFeature(json);
						// Squash nested feature collections
						if (feature.type === 'FeatureCollection') {
							jsons.push.apply(jsons, feature.features);
						} else {
							jsons.push(feature);
						}
					}
				}
			});

			if (isGeometryCollection) {
				return getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}

			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});

	// @namespace GeoJSON
	// @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
	// Creates a GeoJSON layer. Optionally accepts an object in
	// [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
	// (you can alternatively add it later with `addData` method) and an `options` object.
	function geoJSON(geojson, options) {
		return new GeoJSON(geojson, options);
	}

	// Backward compatibility.
	var geoJson = geoJSON;

	/*
	 * @class ImageOverlay
	 * @aka L.ImageOverlay
	 * @inherits Interactive layer
	 *
	 * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
	 *
	 * @example
	 *
	 * ```js
	 * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
	 * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
	 * L.imageOverlay(imageUrl, imageBounds).addTo(map);
	 * ```
	 */

	var ImageOverlay = Layer.extend({

		// @section
		// @aka ImageOverlay options
		options: {
			// @option opacity: Number = 1.0
			// The opacity of the image overlay.
			opacity: 1,

			// @option alt: String = ''
			// Text for the `alt` attribute of the image (useful for accessibility).
			alt: '',

			// @option interactive: Boolean = false
			// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
			interactive: false,

			// @option crossOrigin: Boolean|String = false
			// Whether the crossOrigin attribute will be added to the image.
			// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
			// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
			crossOrigin: false,

			// @option errorOverlayUrl: String = ''
			// URL to the overlay image to show in place of the overlay that failed to load.
			errorOverlayUrl: '',

			// @option zIndex: Number = 1
			// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
			zIndex: 1,

			// @option className: String = ''
			// A custom class name to assign to the image. Empty by default.
			className: ''
		},

		initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
			this._url = url;
			this._bounds = toLatLngBounds(bounds);

			setOptions(this, options);
		},

		onAdd: function () {
			if (!this._image) {
				this._initImage();

				if (this.options.opacity < 1) {
					this._updateOpacity();
				}
			}

			if (this.options.interactive) {
				addClass(this._image, 'leaflet-interactive');
				this.addInteractiveTarget(this._image);
			}

			this.getPane().appendChild(this._image);
			this._reset();
		},

		onRemove: function () {
			remove(this._image);
			if (this.options.interactive) {
				this.removeInteractiveTarget(this._image);
			}
		},

		// @method setOpacity(opacity: Number): this
		// Sets the opacity of the overlay.
		setOpacity: function (opacity) {
			this.options.opacity = opacity;

			if (this._image) {
				this._updateOpacity();
			}
			return this;
		},

		setStyle: function (styleOpts) {
			if (styleOpts.opacity) {
				this.setOpacity(styleOpts.opacity);
			}
			return this;
		},

		// @method bringToFront(): this
		// Brings the layer to the top of all overlays.
		bringToFront: function () {
			if (this._map) {
				toFront(this._image);
			}
			return this;
		},

		// @method bringToBack(): this
		// Brings the layer to the bottom of all overlays.
		bringToBack: function () {
			if (this._map) {
				toBack(this._image);
			}
			return this;
		},

		// @method setUrl(url: String): this
		// Changes the URL of the image.
		setUrl: function (url) {
			this._url = url;

			if (this._image) {
				this._image.src = url;
			}
			return this;
		},

		// @method setBounds(bounds: LatLngBounds): this
		// Update the bounds that this ImageOverlay covers
		setBounds: function (bounds) {
			this._bounds = toLatLngBounds(bounds);

			if (this._map) {
				this._reset();
			}
			return this;
		},

		getEvents: function () {
			var events = {
				zoom: this._reset,
				viewreset: this._reset
			};

			if (this._zoomAnimated) {
				events.zoomanim = this._animateZoom;
			}

			return events;
		},

		// @method setZIndex(value: Number): this
		// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
		setZIndex: function (value) {
			this.options.zIndex = value;
			this._updateZIndex();
			return this;
		},

		// @method getBounds(): LatLngBounds
		// Get the bounds that this ImageOverlay covers
		getBounds: function () {
			return this._bounds;
		},

		// @method getElement(): HTMLElement
		// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
		// used by this overlay.
		getElement: function () {
			return this._image;
		},

		_initImage: function () {
			var wasElementSupplied = this._url.tagName === 'IMG';
			var img = this._image = wasElementSupplied ? this._url : create$1('img');

			addClass(img, 'leaflet-image-layer');
			if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
			if (this.options.className) { addClass(img, this.options.className); }

			img.onselectstart = falseFn;
			img.onmousemove = falseFn;

			// @event load: Event
			// Fired when the ImageOverlay layer has loaded its image
			img.onload = bind(this.fire, this, 'load');
			img.onerror = bind(this._overlayOnError, this, 'error');

			if (this.options.crossOrigin || this.options.crossOrigin === '') {
				img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
			}

			if (this.options.zIndex) {
				this._updateZIndex();
			}

			if (wasElementSupplied) {
				this._url = img.src;
				return;
			}

			img.src = this._url;
			img.alt = this.options.alt;
		},

		_animateZoom: function (e) {
			var scale = this._map.getZoomScale(e.zoom),
			    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

			setTransform(this._image, offset, scale);
		},

		_reset: function () {
			var image = this._image,
			    bounds = new Bounds(
			        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
			        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
			    size = bounds.getSize();

			setPosition(image, bounds.min);

			image.style.width  = size.x + 'px';
			image.style.height = size.y + 'px';
		},

		_updateOpacity: function () {
			setOpacity(this._image, this.options.opacity);
		},

		_updateZIndex: function () {
			if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
				this._image.style.zIndex = this.options.zIndex;
			}
		},

		_overlayOnError: function () {
			// @event error: Event
			// Fired when the ImageOverlay layer fails to load its image
			this.fire('error');

			var errorUrl = this.options.errorOverlayUrl;
			if (errorUrl && this._url !== errorUrl) {
				this._url = errorUrl;
				this._image.src = errorUrl;
			}
		}
	});

	// @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
	// Instantiates an image overlay object given the URL of the image and the
	// geographical bounds it is tied to.
	var imageOverlay = function (url, bounds, options) {
		return new ImageOverlay(url, bounds, options);
	};

	/*
	 * @class VideoOverlay
	 * @aka L.VideoOverlay
	 * @inherits ImageOverlay
	 *
	 * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
	 *
	 * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
	 * HTML5 element.
	 *
	 * @example
	 *
	 * ```js
	 * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
	 * 	videoBounds = [[ 32, -130], [ 13, -100]];
	 * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
	 * ```
	 */

	var VideoOverlay = ImageOverlay.extend({

		// @section
		// @aka VideoOverlay options
		options: {
			// @option autoplay: Boolean = true
			// Whether the video starts playing automatically when loaded.
			autoplay: true,

			// @option loop: Boolean = true
			// Whether the video will loop back to the beginning when played.
			loop: true,

			// @option keepAspectRatio: Boolean = true
			// Whether the video will save aspect ratio after the projection.
			// Relevant for supported browsers. Browser compatibility- https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
			keepAspectRatio: true
		},

		_initImage: function () {
			var wasElementSupplied = this._url.tagName === 'VIDEO';
			var vid = this._image = wasElementSupplied ? this._url : create$1('video');

			addClass(vid, 'leaflet-image-layer');
			if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }
			if (this.options.className) { addClass(vid, this.options.className); }

			vid.onselectstart = falseFn;
			vid.onmousemove = falseFn;

			// @event load: Event
			// Fired when the video has finished loading the first frame
			vid.onloadeddata = bind(this.fire, this, 'load');

			if (wasElementSupplied) {
				var sourceElements = vid.getElementsByTagName('source');
				var sources = [];
				for (var j = 0; j < sourceElements.length; j++) {
					sources.push(sourceElements[j].src);
				}

				this._url = (sourceElements.length > 0) ? sources : [vid.src];
				return;
			}

			if (!isArray(this._url)) { this._url = [this._url]; }

			if (!this.options.keepAspectRatio && vid.style.hasOwnProperty('objectFit')) { vid.style['objectFit'] = 'fill'; }
			vid.autoplay = !!this.options.autoplay;
			vid.loop = !!this.options.loop;
			for (var i = 0; i < this._url.length; i++) {
				var source = create$1('source');
				source.src = this._url[i];
				vid.appendChild(source);
			}
		}

		// @method getElement(): HTMLVideoElement
		// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
		// used by this overlay.
	});


	// @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
	// Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
	// geographical bounds it is tied to.

	function videoOverlay(video, bounds, options) {
		return new VideoOverlay(video, bounds, options);
	}

	/*
	 * @class SVGOverlay
	 * @aka L.SVGOverlay
	 * @inherits ImageOverlay
	 *
	 * Used to load, display and provide DOM access to an SVG file over specific bounds of the map. Extends `ImageOverlay`.
	 *
	 * An SVG overlay uses the [`<svg>`](https://developer.mozilla.org/docs/Web/SVG/Element/svg) element.
	 *
	 * @example
	 *
	 * ```js
	 * var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	 * svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
	 * svgElement.setAttribute('viewBox', "0 0 200 200");
	 * svgElement.innerHTML = '<rect width="200" height="200"/><rect x="75" y="23" width="50" height="50" style="fill:red"/><rect x="75" y="123" width="50" height="50" style="fill:#0013ff"/>';
	 * var svgElementBounds = [ [ 32, -130 ], [ 13, -100 ] ];
	 * L.svgOverlay(svgElement, svgElementBounds).addTo(map);
	 * ```
	 */

	var SVGOverlay = ImageOverlay.extend({
		_initImage: function () {
			var el = this._image = this._url;

			addClass(el, 'leaflet-image-layer');
			if (this._zoomAnimated) { addClass(el, 'leaflet-zoom-animated'); }
			if (this.options.className) { addClass(el, this.options.className); }

			el.onselectstart = falseFn;
			el.onmousemove = falseFn;
		}

		// @method getElement(): SVGElement
		// Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
		// used by this overlay.
	});


	// @factory L.svgOverlay(svg: String|SVGElement, bounds: LatLngBounds, options?: SVGOverlay options)
	// Instantiates an image overlay object given an SVG element and the geographical bounds it is tied to.
	// A viewBox attribute is required on the SVG element to zoom in and out properly.

	function svgOverlay(el, bounds, options) {
		return new SVGOverlay(el, bounds, options);
	}

	/*
	 * @class DivOverlay
	 * @inherits Layer
	 * @aka L.DivOverlay
	 * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
	 */

	// @namespace DivOverlay
	var DivOverlay = Layer.extend({

		// @section
		// @aka DivOverlay options
		options: {
			// @option offset: Point = Point(0, 7)
			// The offset of the popup position. Useful to control the anchor
			// of the popup when opening it on some overlays.
			offset: [0, 7],

			// @option className: String = ''
			// A custom CSS class name to assign to the popup.
			className: '',

			// @option pane: String = 'popupPane'
			// `Map pane` where the popup will be added.
			pane: 'popupPane'
		},

		initialize: function (options, source) {
			setOptions(this, options);

			this._source = source;
		},

		onAdd: function (map) {
			this._zoomAnimated = map._zoomAnimated;

			if (!this._container) {
				this._initLayout();
			}

			if (map._fadeAnimated) {
				setOpacity(this._container, 0);
			}

			clearTimeout(this._removeTimeout);
			this.getPane().appendChild(this._container);
			this.update();

			if (map._fadeAnimated) {
				setOpacity(this._container, 1);
			}

			this.bringToFront();
		},

		onRemove: function (map) {
			if (map._fadeAnimated) {
				setOpacity(this._container, 0);
				this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
			} else {
				remove(this._container);
			}
		},

		// @namespace Popup
		// @method getLatLng: LatLng
		// Returns the geographical point of popup.
		getLatLng: function () {
			return this._latlng;
		},

		// @method setLatLng(latlng: LatLng): this
		// Sets the geographical point where the popup will open.
		setLatLng: function (latlng) {
			this._latlng = toLatLng(latlng);
			if (this._map) {
				this._updatePosition();
				this._adjustPan();
			}
			return this;
		},

		// @method getContent: String|HTMLElement
		// Returns the content of the popup.
		getContent: function () {
			return this._content;
		},

		// @method setContent(htmlContent: String|HTMLElement|Function): this
		// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
		setContent: function (content) {
			this._content = content;
			this.update();
			return this;
		},

		// @method getElement: String|HTMLElement
		// Alias for [getContent()](#popup-getcontent)
		getElement: function () {
			return this._container;
		},

		// @method update: null
		// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
		update: function () {
			if (!this._map) { return; }

			this._container.style.visibility = 'hidden';

			this._updateContent();
			this._updateLayout();
			this._updatePosition();

			this._container.style.visibility = '';

			this._adjustPan();
		},

		getEvents: function () {
			var events = {
				zoom: this._updatePosition,
				viewreset: this._updatePosition
			};

			if (this._zoomAnimated) {
				events.zoomanim = this._animateZoom;
			}
			return events;
		},

		// @method isOpen: Boolean
		// Returns `true` when the popup is visible on the map.
		isOpen: function () {
			return !!this._map && this._map.hasLayer(this);
		},

		// @method bringToFront: this
		// Brings this popup in front of other popups (in the same map pane).
		bringToFront: function () {
			if (this._map) {
				toFront(this._container);
			}
			return this;
		},

		// @method bringToBack: this
		// Brings this popup to the back of other popups (in the same map pane).
		bringToBack: function () {
			if (this._map) {
				toBack(this._container);
			}
			return this;
		},

		_prepareOpen: function (parent, layer, latlng) {
			if (!(layer instanceof Layer)) {
				latlng = layer;
				layer = parent;
			}

			if (layer instanceof FeatureGroup) {
				for (var id in parent._layers) {
					layer = parent._layers[id];
					break;
				}
			}

			if (!latlng) {
				if (layer.getCenter) {
					latlng = layer.getCenter();
				} else if (layer.getLatLng) {
					latlng = layer.getLatLng();
				} else {
					throw new Error('Unable to get source layer LatLng.');
				}
			}

			// set overlay source to this layer
			this._source = layer;

			// update the overlay (content, layout, ect...)
			this.update();

			return latlng;
		},

		_updateContent: function () {
			if (!this._content) { return; }

			var node = this._contentNode;
			var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

			if (typeof content === 'string') {
				node.innerHTML = content;
			} else {
				while (node.hasChildNodes()) {
					node.removeChild(node.firstChild);
				}
				node.appendChild(content);
			}
			this.fire('contentupdate');
		},

		_updatePosition: function () {
			if (!this._map) { return; }

			var pos = this._map.latLngToLayerPoint(this._latlng),
			    offset = toPoint(this.options.offset),
			    anchor = this._getAnchor();

			if (this._zoomAnimated) {
				setPosition(this._container, pos.add(anchor));
			} else {
				offset = offset.add(pos).add(anchor);
			}

			var bottom = this._containerBottom = -offset.y,
			    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

			// bottom position the popup in case the height of the popup changes (images loading etc)
			this._container.style.bottom = bottom + 'px';
			this._container.style.left = left + 'px';
		},

		_getAnchor: function () {
			return [0, 0];
		}

	});

	/*
	 * @class Popup
	 * @inherits DivOverlay
	 * @aka L.Popup
	 * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
	 * open popups while making sure that only one popup is open at one time
	 * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
	 *
	 * @example
	 *
	 * If you want to just bind a popup to marker click and then open it, it's really easy:
	 *
	 * ```js
	 * marker.bindPopup(popupContent).openPopup();
	 * ```
	 * Path overlays like polylines also have a `bindPopup` method.
	 * Here's a more complicated way to open a popup on a map:
	 *
	 * ```js
	 * var popup = L.popup()
	 * 	.setLatLng(latlng)
	 * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
	 * 	.openOn(map);
	 * ```
	 */


	// @namespace Popup
	var Popup = DivOverlay.extend({

		// @section
		// @aka Popup options
		options: {
			// @option maxWidth: Number = 300
			// Max width of the popup, in pixels.
			maxWidth: 300,

			// @option minWidth: Number = 50
			// Min width of the popup, in pixels.
			minWidth: 50,

			// @option maxHeight: Number = null
			// If set, creates a scrollable container of the given height
			// inside a popup if its content exceeds it.
			maxHeight: null,

			// @option autoPan: Boolean = true
			// Set it to `false` if you don't want the map to do panning animation
			// to fit the opened popup.
			autoPan: true,

			// @option autoPanPaddingTopLeft: Point = null
			// The margin between the popup and the top left corner of the map
			// view after autopanning was performed.
			autoPanPaddingTopLeft: null,

			// @option autoPanPaddingBottomRight: Point = null
			// The margin between the popup and the bottom right corner of the map
			// view after autopanning was performed.
			autoPanPaddingBottomRight: null,

			// @option autoPanPadding: Point = Point(5, 5)
			// Equivalent of setting both top left and bottom right autopan padding to the same value.
			autoPanPadding: [5, 5],

			// @option keepInView: Boolean = false
			// Set it to `true` if you want to prevent users from panning the popup
			// off of the screen while it is open.
			keepInView: false,

			// @option closeButton: Boolean = true
			// Controls the presence of a close button in the popup.
			closeButton: true,

			// @option autoClose: Boolean = true
			// Set it to `false` if you want to override the default behavior of
			// the popup closing when another popup is opened.
			autoClose: true,

			// @option closeOnEscapeKey: Boolean = true
			// Set it to `false` if you want to override the default behavior of
			// the ESC key for closing of the popup.
			closeOnEscapeKey: true,

			// @option closeOnClick: Boolean = *
			// Set it if you want to override the default behavior of the popup closing when user clicks
			// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

			// @option className: String = ''
			// A custom CSS class name to assign to the popup.
			className: ''
		},

		// @namespace Popup
		// @method openOn(map: Map): this
		// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
		openOn: function (map) {
			map.openPopup(this);
			return this;
		},

		onAdd: function (map) {
			DivOverlay.prototype.onAdd.call(this, map);

			// @namespace Map
			// @section Popup events
			// @event popupopen: PopupEvent
			// Fired when a popup is opened in the map
			map.fire('popupopen', {popup: this});

			if (this._source) {
				// @namespace Layer
				// @section Popup events
				// @event popupopen: PopupEvent
				// Fired when a popup bound to this layer is opened
				this._source.fire('popupopen', {popup: this}, true);
				// For non-path layers, we toggle the popup when clicking
				// again the layer, so prevent the map to reopen it.
				if (!(this._source instanceof Path)) {
					this._source.on('preclick', stopPropagation);
				}
			}
		},

		onRemove: function (map) {
			DivOverlay.prototype.onRemove.call(this, map);

			// @namespace Map
			// @section Popup events
			// @event popupclose: PopupEvent
			// Fired when a popup in the map is closed
			map.fire('popupclose', {popup: this});

			if (this._source) {
				// @namespace Layer
				// @section Popup events
				// @event popupclose: PopupEvent
				// Fired when a popup bound to this layer is closed
				this._source.fire('popupclose', {popup: this}, true);
				if (!(this._source instanceof Path)) {
					this._source.off('preclick', stopPropagation);
				}
			}
		},

		getEvents: function () {
			var events = DivOverlay.prototype.getEvents.call(this);

			if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
				events.preclick = this._close;
			}

			if (this.options.keepInView) {
				events.moveend = this._adjustPan;
			}

			return events;
		},

		_close: function () {
			if (this._map) {
				this._map.closePopup(this);
			}
		},

		_initLayout: function () {
			var prefix = 'leaflet-popup',
			    container = this._container = create$1('div',
				prefix + ' ' + (this.options.className || '') +
				' leaflet-zoom-animated');

			var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
			this._contentNode = create$1('div', prefix + '-content', wrapper);

			disableClickPropagation(wrapper);
			disableScrollPropagation(this._contentNode);
			on(wrapper, 'contextmenu', stopPropagation);

			this._tipContainer = create$1('div', prefix + '-tip-container', container);
			this._tip = create$1('div', prefix + '-tip', this._tipContainer);

			if (this.options.closeButton) {
				var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
				closeButton.href = '#close';
				closeButton.innerHTML = '&#215;';

				on(closeButton, 'click', this._onCloseButtonClick, this);
			}
		},

		_updateLayout: function () {
			var container = this._contentNode,
			    style = container.style;

			style.width = '';
			style.whiteSpace = 'nowrap';

			var width = container.offsetWidth;
			width = Math.min(width, this.options.maxWidth);
			width = Math.max(width, this.options.minWidth);

			style.width = (width + 1) + 'px';
			style.whiteSpace = '';

			style.height = '';

			var height = container.offsetHeight,
			    maxHeight = this.options.maxHeight,
			    scrolledClass = 'leaflet-popup-scrolled';

			if (maxHeight && height > maxHeight) {
				style.height = maxHeight + 'px';
				addClass(container, scrolledClass);
			} else {
				removeClass(container, scrolledClass);
			}

			this._containerWidth = this._container.offsetWidth;
		},

		_animateZoom: function (e) {
			var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
			    anchor = this._getAnchor();
			setPosition(this._container, pos.add(anchor));
		},

		_adjustPan: function () {
			if (!this.options.autoPan) { return; }
			if (this._map._panAnim) { this._map._panAnim.stop(); }

			var map = this._map,
			    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
			    containerHeight = this._container.offsetHeight + marginBottom,
			    containerWidth = this._containerWidth,
			    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

			layerPos._add(getPosition(this._container));

			var containerPos = map.layerPointToContainerPoint(layerPos),
			    padding = toPoint(this.options.autoPanPadding),
			    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
			    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
			    size = map.getSize(),
			    dx = 0,
			    dy = 0;

			if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
				dx = containerPos.x + containerWidth - size.x + paddingBR.x;
			}
			if (containerPos.x - dx - paddingTL.x < 0) { // left
				dx = containerPos.x - paddingTL.x;
			}
			if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
				dy = containerPos.y + containerHeight - size.y + paddingBR.y;
			}
			if (containerPos.y - dy - paddingTL.y < 0) { // top
				dy = containerPos.y - paddingTL.y;
			}

			// @namespace Map
			// @section Popup events
			// @event autopanstart: Event
			// Fired when the map starts autopanning when opening a popup.
			if (dx || dy) {
				map
				    .fire('autopanstart')
				    .panBy([dx, dy]);
			}
		},

		_onCloseButtonClick: function (e) {
			this._close();
			stop(e);
		},

		_getAnchor: function () {
			// Where should we anchor the popup on the source layer?
			return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
		}

	});

	// @namespace Popup
	// @factory L.popup(options?: Popup options, source?: Layer)
	// Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
	var popup = function (options, source) {
		return new Popup(options, source);
	};


	/* @namespace Map
	 * @section Interaction Options
	 * @option closePopupOnClick: Boolean = true
	 * Set it to `false` if you don't want popups to close when user clicks the map.
	 */
	Map.mergeOptions({
		closePopupOnClick: true
	});


	// @namespace Map
	// @section Methods for Layers and Controls
	Map.include({
		// @method openPopup(popup: Popup): this
		// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
		// @alternative
		// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
		// Creates a popup with the specified content and options and opens it in the given point on a map.
		openPopup: function (popup, latlng, options) {
			if (!(popup instanceof Popup)) {
				popup = new Popup(options).setContent(popup);
			}

			if (latlng) {
				popup.setLatLng(latlng);
			}

			if (this.hasLayer(popup)) {
				return this;
			}

			if (this._popup && this._popup.options.autoClose) {
				this.closePopup();
			}

			this._popup = popup;
			return this.addLayer(popup);
		},

		// @method closePopup(popup?: Popup): this
		// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
		closePopup: function (popup) {
			if (!popup || popup === this._popup) {
				popup = this._popup;
				this._popup = null;
			}
			if (popup) {
				this.removeLayer(popup);
			}
			return this;
		}
	});

	/*
	 * @namespace Layer
	 * @section Popup methods example
	 *
	 * All layers share a set of methods convenient for binding popups to it.
	 *
	 * ```js
	 * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
	 * layer.openPopup();
	 * layer.closePopup();
	 * ```
	 *
	 * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
	 */

	// @section Popup methods
	Layer.include({

		// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
		// Binds a popup to the layer with the passed `content` and sets up the
		// necessary event listeners. If a `Function` is passed it will receive
		// the layer as the first argument and should return a `String` or `HTMLElement`.
		bindPopup: function (content, options) {

			if (content instanceof Popup) {
				setOptions(content, options);
				this._popup = content;
				content._source = this;
			} else {
				if (!this._popup || options) {
					this._popup = new Popup(options, this);
				}
				this._popup.setContent(content);
			}

			if (!this._popupHandlersAdded) {
				this.on({
					click: this._openPopup,
					keypress: this._onKeyPress,
					remove: this.closePopup,
					move: this._movePopup
				});
				this._popupHandlersAdded = true;
			}

			return this;
		},

		// @method unbindPopup(): this
		// Removes the popup previously bound with `bindPopup`.
		unbindPopup: function () {
			if (this._popup) {
				this.off({
					click: this._openPopup,
					keypress: this._onKeyPress,
					remove: this.closePopup,
					move: this._movePopup
				});
				this._popupHandlersAdded = false;
				this._popup = null;
			}
			return this;
		},

		// @method openPopup(latlng?: LatLng): this
		// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
		openPopup: function (layer, latlng) {
			if (this._popup && this._map) {
				latlng = this._popup._prepareOpen(this, layer, latlng);

				// open the popup on the map
				this._map.openPopup(this._popup, latlng);
			}

			return this;
		},

		// @method closePopup(): this
		// Closes the popup bound to this layer if it is open.
		closePopup: function () {
			if (this._popup) {
				this._popup._close();
			}
			return this;
		},

		// @method togglePopup(): this
		// Opens or closes the popup bound to this layer depending on its current state.
		togglePopup: function (target) {
			if (this._popup) {
				if (this._popup._map) {
					this.closePopup();
				} else {
					this.openPopup(target);
				}
			}
			return this;
		},

		// @method isPopupOpen(): boolean
		// Returns `true` if the popup bound to this layer is currently open.
		isPopupOpen: function () {
			return (this._popup ? this._popup.isOpen() : false);
		},

		// @method setPopupContent(content: String|HTMLElement|Popup): this
		// Sets the content of the popup bound to this layer.
		setPopupContent: function (content) {
			if (this._popup) {
				this._popup.setContent(content);
			}
			return this;
		},

		// @method getPopup(): Popup
		// Returns the popup bound to this layer.
		getPopup: function () {
			return this._popup;
		},

		_openPopup: function (e) {
			var layer = e.layer || e.target;

			if (!this._popup) {
				return;
			}

			if (!this._map) {
				return;
			}

			// prevent map click
			stop(e);

			// if this inherits from Path its a vector and we can just
			// open the popup at the new location
			if (layer instanceof Path) {
				this.openPopup(e.layer || e.target, e.latlng);
				return;
			}

			// otherwise treat it like a marker and figure out
			// if we should toggle it open/closed
			if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
				this.closePopup();
			} else {
				this.openPopup(layer, e.latlng);
			}
		},

		_movePopup: function (e) {
			this._popup.setLatLng(e.latlng);
		},

		_onKeyPress: function (e) {
			if (e.originalEvent.keyCode === 13) {
				this._openPopup(e);
			}
		}
	});

	/*
	 * @class Tooltip
	 * @inherits DivOverlay
	 * @aka L.Tooltip
	 * Used to display small texts on top of map layers.
	 *
	 * @example
	 *
	 * ```js
	 * marker.bindTooltip("my tooltip text").openTooltip();
	 * ```
	 * Note about tooltip offset. Leaflet takes two options in consideration
	 * for computing tooltip offsetting:
	 * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
	 *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
	 *   move it to the bottom. Negatives will move to the left and top.
	 * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
	 *   should adapt this value if you use a custom icon.
	 */


	// @namespace Tooltip
	var Tooltip = DivOverlay.extend({

		// @section
		// @aka Tooltip options
		options: {
			// @option pane: String = 'tooltipPane'
			// `Map pane` where the tooltip will be added.
			pane: 'tooltipPane',

			// @option offset: Point = Point(0, 0)
			// Optional offset of the tooltip position.
			offset: [0, 0],

			// @option direction: String = 'auto'
			// Direction where to open the tooltip. Possible values are: `right`, `left`,
			// `top`, `bottom`, `center`, `auto`.
			// `auto` will dynamically switch between `right` and `left` according to the tooltip
			// position on the map.
			direction: 'auto',

			// @option permanent: Boolean = false
			// Whether to open the tooltip permanently or only on mouseover.
			permanent: false,

			// @option sticky: Boolean = false
			// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
			sticky: false,

			// @option interactive: Boolean = false
			// If true, the tooltip will listen to the feature events.
			interactive: false,

			// @option opacity: Number = 0.9
			// Tooltip container opacity.
			opacity: 0.9
		},

		onAdd: function (map) {
			DivOverlay.prototype.onAdd.call(this, map);
			this.setOpacity(this.options.opacity);

			// @namespace Map
			// @section Tooltip events
			// @event tooltipopen: TooltipEvent
			// Fired when a tooltip is opened in the map.
			map.fire('tooltipopen', {tooltip: this});

			if (this._source) {
				// @namespace Layer
				// @section Tooltip events
				// @event tooltipopen: TooltipEvent
				// Fired when a tooltip bound to this layer is opened.
				this._source.fire('tooltipopen', {tooltip: this}, true);
			}
		},

		onRemove: function (map) {
			DivOverlay.prototype.onRemove.call(this, map);

			// @namespace Map
			// @section Tooltip events
			// @event tooltipclose: TooltipEvent
			// Fired when a tooltip in the map is closed.
			map.fire('tooltipclose', {tooltip: this});

			if (this._source) {
				// @namespace Layer
				// @section Tooltip events
				// @event tooltipclose: TooltipEvent
				// Fired when a tooltip bound to this layer is closed.
				this._source.fire('tooltipclose', {tooltip: this}, true);
			}
		},

		getEvents: function () {
			var events = DivOverlay.prototype.getEvents.call(this);

			if (touch && !this.options.permanent) {
				events.preclick = this._close;
			}

			return events;
		},

		_close: function () {
			if (this._map) {
				this._map.closeTooltip(this);
			}
		},

		_initLayout: function () {
			var prefix = 'leaflet-tooltip',
			    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

			this._contentNode = this._container = create$1('div', className);
		},

		_updateLayout: function () {},

		_adjustPan: function () {},

		_setPosition: function (pos) {
			var map = this._map,
			    container = this._container,
			    centerPoint = map.latLngToContainerPoint(map.getCenter()),
			    tooltipPoint = map.layerPointToContainerPoint(pos),
			    direction = this.options.direction,
			    tooltipWidth = container.offsetWidth,
			    tooltipHeight = container.offsetHeight,
			    offset = toPoint(this.options.offset),
			    anchor = this._getAnchor();

			if (direction === 'top') {
				pos = pos.add(toPoint(-tooltipWidth / 2 + offset.x, -tooltipHeight + offset.y + anchor.y, true));
			} else if (direction === 'bottom') {
				pos = pos.subtract(toPoint(tooltipWidth / 2 - offset.x, -offset.y, true));
			} else if (direction === 'center') {
				pos = pos.subtract(toPoint(tooltipWidth / 2 + offset.x, tooltipHeight / 2 - anchor.y + offset.y, true));
			} else if (direction === 'right' || direction === 'auto' && tooltipPoint.x < centerPoint.x) {
				direction = 'right';
				pos = pos.add(toPoint(offset.x + anchor.x, anchor.y - tooltipHeight / 2 + offset.y, true));
			} else {
				direction = 'left';
				pos = pos.subtract(toPoint(tooltipWidth + anchor.x - offset.x, tooltipHeight / 2 - anchor.y - offset.y, true));
			}

			removeClass(container, 'leaflet-tooltip-right');
			removeClass(container, 'leaflet-tooltip-left');
			removeClass(container, 'leaflet-tooltip-top');
			removeClass(container, 'leaflet-tooltip-bottom');
			addClass(container, 'leaflet-tooltip-' + direction);
			setPosition(container, pos);
		},

		_updatePosition: function () {
			var pos = this._map.latLngToLayerPoint(this._latlng);
			this._setPosition(pos);
		},

		setOpacity: function (opacity) {
			this.options.opacity = opacity;

			if (this._container) {
				setOpacity(this._container, opacity);
			}
		},

		_animateZoom: function (e) {
			var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
			this._setPosition(pos);
		},

		_getAnchor: function () {
			// Where should we anchor the tooltip on the source layer?
			return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
		}

	});

	// @namespace Tooltip
	// @factory L.tooltip(options?: Tooltip options, source?: Layer)
	// Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
	var tooltip = function (options, source) {
		return new Tooltip(options, source);
	};

	// @namespace Map
	// @section Methods for Layers and Controls
	Map.include({

		// @method openTooltip(tooltip: Tooltip): this
		// Opens the specified tooltip.
		// @alternative
		// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
		// Creates a tooltip with the specified content and options and open it.
		openTooltip: function (tooltip, latlng, options) {
			if (!(tooltip instanceof Tooltip)) {
				tooltip = new Tooltip(options).setContent(tooltip);
			}

			if (latlng) {
				tooltip.setLatLng(latlng);
			}

			if (this.hasLayer(tooltip)) {
				return this;
			}

			return this.addLayer(tooltip);
		},

		// @method closeTooltip(tooltip?: Tooltip): this
		// Closes the tooltip given as parameter.
		closeTooltip: function (tooltip) {
			if (tooltip) {
				this.removeLayer(tooltip);
			}
			return this;
		}

	});

	/*
	 * @namespace Layer
	 * @section Tooltip methods example
	 *
	 * All layers share a set of methods convenient for binding tooltips to it.
	 *
	 * ```js
	 * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
	 * layer.openTooltip();
	 * layer.closeTooltip();
	 * ```
	 */

	// @section Tooltip methods
	Layer.include({

		// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
		// Binds a tooltip to the layer with the passed `content` and sets up the
		// necessary event listeners. If a `Function` is passed it will receive
		// the layer as the first argument and should return a `String` or `HTMLElement`.
		bindTooltip: function (content, options) {

			if (content instanceof Tooltip) {
				setOptions(content, options);
				this._tooltip = content;
				content._source = this;
			} else {
				if (!this._tooltip || options) {
					this._tooltip = new Tooltip(options, this);
				}
				this._tooltip.setContent(content);

			}

			this._initTooltipInteractions();

			if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
				this.openTooltip();
			}

			return this;
		},

		// @method unbindTooltip(): this
		// Removes the tooltip previously bound with `bindTooltip`.
		unbindTooltip: function () {
			if (this._tooltip) {
				this._initTooltipInteractions(true);
				this.closeTooltip();
				this._tooltip = null;
			}
			return this;
		},

		_initTooltipInteractions: function (remove$$1) {
			if (!remove$$1 && this._tooltipHandlersAdded) { return; }
			var onOff = remove$$1 ? 'off' : 'on',
			    events = {
				remove: this.closeTooltip,
				move: this._moveTooltip
			    };
			if (!this._tooltip.options.permanent) {
				events.mouseover = this._openTooltip;
				events.mouseout = this.closeTooltip;
				if (this._tooltip.options.sticky) {
					events.mousemove = this._moveTooltip;
				}
				if (touch) {
					events.click = this._openTooltip;
				}
			} else {
				events.add = this._openTooltip;
			}
			this[onOff](events);
			this._tooltipHandlersAdded = !remove$$1;
		},

		// @method openTooltip(latlng?: LatLng): this
		// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
		openTooltip: function (layer, latlng) {
			if (this._tooltip && this._map) {
				latlng = this._tooltip._prepareOpen(this, layer, latlng);

				// open the tooltip on the map
				this._map.openTooltip(this._tooltip, latlng);

				// Tooltip container may not be defined if not permanent and never
				// opened.
				if (this._tooltip.options.interactive && this._tooltip._container) {
					addClass(this._tooltip._container, 'leaflet-clickable');
					this.addInteractiveTarget(this._tooltip._container);
				}
			}

			return this;
		},

		// @method closeTooltip(): this
		// Closes the tooltip bound to this layer if it is open.
		closeTooltip: function () {
			if (this._tooltip) {
				this._tooltip._close();
				if (this._tooltip.options.interactive && this._tooltip._container) {
					removeClass(this._tooltip._container, 'leaflet-clickable');
					this.removeInteractiveTarget(this._tooltip._container);
				}
			}
			return this;
		},

		// @method toggleTooltip(): this
		// Opens or closes the tooltip bound to this layer depending on its current state.
		toggleTooltip: function (target) {
			if (this._tooltip) {
				if (this._tooltip._map) {
					this.closeTooltip();
				} else {
					this.openTooltip(target);
				}
			}
			return this;
		},

		// @method isTooltipOpen(): boolean
		// Returns `true` if the tooltip bound to this layer is currently open.
		isTooltipOpen: function () {
			return this._tooltip.isOpen();
		},

		// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
		// Sets the content of the tooltip bound to this layer.
		setTooltipContent: function (content) {
			if (this._tooltip) {
				this._tooltip.setContent(content);
			}
			return this;
		},

		// @method getTooltip(): Tooltip
		// Returns the tooltip bound to this layer.
		getTooltip: function () {
			return this._tooltip;
		},

		_openTooltip: function (e) {
			var layer = e.layer || e.target;

			if (!this._tooltip || !this._map) {
				return;
			}
			this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
		},

		_moveTooltip: function (e) {
			var latlng = e.latlng, containerPoint, layerPoint;
			if (this._tooltip.options.sticky && e.originalEvent) {
				containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
				layerPoint = this._map.containerPointToLayerPoint(containerPoint);
				latlng = this._map.layerPointToLatLng(layerPoint);
			}
			this._tooltip.setLatLng(latlng);
		}
	});

	/*
	 * @class DivIcon
	 * @aka L.DivIcon
	 * @inherits Icon
	 *
	 * Represents a lightweight icon for markers that uses a simple `<div>`
	 * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
	 *
	 * @example
	 * ```js
	 * var myIcon = L.divIcon({className: 'my-div-icon'});
	 * // you can set .my-div-icon styles in CSS
	 *
	 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
	 * ```
	 *
	 * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
	 */

	var DivIcon = Icon.extend({
		options: {
			// @section
			// @aka DivIcon options
			iconSize: [12, 12], // also can be set through CSS

			// iconAnchor: (Point),
			// popupAnchor: (Point),

			// @option html: String|HTMLElement = ''
			// Custom HTML code to put inside the div element, empty by default. Alternatively,
			// an instance of `HTMLElement`.
			html: false,

			// @option bgPos: Point = [0, 0]
			// Optional relative position of the background, in pixels
			bgPos: null,

			className: 'leaflet-div-icon'
		},

		createIcon: function (oldIcon) {
			var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
			    options = this.options;

			if (options.html instanceof Element) {
				empty(div);
				div.appendChild(options.html);
			} else {
				div.innerHTML = options.html !== false ? options.html : '';
			}

			if (options.bgPos) {
				var bgPos = toPoint(options.bgPos);
				div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
			}
			this._setIconStyles(div, 'icon');

			return div;
		},

		createShadow: function () {
			return null;
		}
	});

	// @factory L.divIcon(options: DivIcon options)
	// Creates a `DivIcon` instance with the given options.
	function divIcon(options) {
		return new DivIcon(options);
	}

	Icon.Default = IconDefault;

	/*
	 * @class GridLayer
	 * @inherits Layer
	 * @aka L.GridLayer
	 *
	 * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
	 * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
	 *
	 *
	 * @section Synchronous usage
	 * @example
	 *
	 * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
	 *
	 * ```js
	 * var CanvasLayer = L.GridLayer.extend({
	 *     createTile: function(coords){
	 *         // create a <canvas> element for drawing
	 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
	 *
	 *         // setup tile width and height according to the options
	 *         var size = this.getTileSize();
	 *         tile.width = size.x;
	 *         tile.height = size.y;
	 *
	 *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
	 *         var ctx = tile.getContext('2d');
	 *
	 *         // return the tile so it can be rendered on screen
	 *         return tile;
	 *     }
	 * });
	 * ```
	 *
	 * @section Asynchronous usage
	 * @example
	 *
	 * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
	 *
	 * ```js
	 * var CanvasLayer = L.GridLayer.extend({
	 *     createTile: function(coords, done){
	 *         var error;
	 *
	 *         // create a <canvas> element for drawing
	 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
	 *
	 *         // setup tile width and height according to the options
	 *         var size = this.getTileSize();
	 *         tile.width = size.x;
	 *         tile.height = size.y;
	 *
	 *         // draw something asynchronously and pass the tile to the done() callback
	 *         setTimeout(function() {
	 *             done(error, tile);
	 *         }, 1000);
	 *
	 *         return tile;
	 *     }
	 * });
	 * ```
	 *
	 * @section
	 */


	var GridLayer = Layer.extend({

		// @section
		// @aka GridLayer options
		options: {
			// @option tileSize: Number|Point = 256
			// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
			tileSize: 256,

			// @option opacity: Number = 1.0
			// Opacity of the tiles. Can be used in the `createTile()` function.
			opacity: 1,

			// @option updateWhenIdle: Boolean = (depends)
			// Load new tiles only when panning ends.
			// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
			// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
			// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
			updateWhenIdle: mobile,

			// @option updateWhenZooming: Boolean = true
			// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
			updateWhenZooming: true,

			// @option updateInterval: Number = 200
			// Tiles will not update more than once every `updateInterval` milliseconds when panning.
			updateInterval: 200,

			// @option zIndex: Number = 1
			// The explicit zIndex of the tile layer.
			zIndex: 1,

			// @option bounds: LatLngBounds = undefined
			// If set, tiles will only be loaded inside the set `LatLngBounds`.
			bounds: null,

			// @option minZoom: Number = 0
			// The minimum zoom level down to which this layer will be displayed (inclusive).
			minZoom: 0,

			// @option maxZoom: Number = undefined
			// The maximum zoom level up to which this layer will be displayed (inclusive).
			maxZoom: undefined,

			// @option maxNativeZoom: Number = undefined
			// Maximum zoom number the tile source has available. If it is specified,
			// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
			// from `maxNativeZoom` level and auto-scaled.
			maxNativeZoom: undefined,

			// @option minNativeZoom: Number = undefined
			// Minimum zoom number the tile source has available. If it is specified,
			// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
			// from `minNativeZoom` level and auto-scaled.
			minNativeZoom: undefined,

			// @option noWrap: Boolean = false
			// Whether the layer is wrapped around the antimeridian. If `true`, the
			// GridLayer will only be displayed once at low zoom levels. Has no
			// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
			// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
			// tiles outside the CRS limits.
			noWrap: false,

			// @option pane: String = 'tilePane'
			// `Map pane` where the grid layer will be added.
			pane: 'tilePane',

			// @option className: String = ''
			// A custom class name to assign to the tile layer. Empty by default.
			className: '',

			// @option keepBuffer: Number = 2
			// When panning the map, keep this many rows and columns of tiles before unloading them.
			keepBuffer: 2
		},

		initialize: function (options) {
			setOptions(this, options);
		},

		onAdd: function () {
			this._initContainer();

			this._levels = {};
			this._tiles = {};

			this._resetView();
			this._update();
		},

		beforeAdd: function (map) {
			map._addZoomLimit(this);
		},

		onRemove: function (map) {
			this._removeAllTiles();
			remove(this._container);
			map._removeZoomLimit(this);
			this._container = null;
			this._tileZoom = undefined;
		},

		// @method bringToFront: this
		// Brings the tile layer to the top of all tile layers.
		bringToFront: function () {
			if (this._map) {
				toFront(this._container);
				this._setAutoZIndex(Math.max);
			}
			return this;
		},

		// @method bringToBack: this
		// Brings the tile layer to the bottom of all tile layers.
		bringToBack: function () {
			if (this._map) {
				toBack(this._container);
				this._setAutoZIndex(Math.min);
			}
			return this;
		},

		// @method getContainer: HTMLElement
		// Returns the HTML element that contains the tiles for this layer.
		getContainer: function () {
			return this._container;
		},

		// @method setOpacity(opacity: Number): this
		// Changes the [opacity](#gridlayer-opacity) of the grid layer.
		setOpacity: function (opacity) {
			this.options.opacity = opacity;
			this._updateOpacity();
			return this;
		},

		// @method setZIndex(zIndex: Number): this
		// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
		setZIndex: function (zIndex) {
			this.options.zIndex = zIndex;
			this._updateZIndex();

			return this;
		},

		// @method isLoading: Boolean
		// Returns `true` if any tile in the grid layer has not finished loading.
		isLoading: function () {
			return this._loading;
		},

		// @method redraw: this
		// Causes the layer to clear all the tiles and request them again.
		redraw: function () {
			if (this._map) {
				this._removeAllTiles();
				this._update();
			}
			return this;
		},

		getEvents: function () {
			var events = {
				viewprereset: this._invalidateAll,
				viewreset: this._resetView,
				zoom: this._resetView,
				moveend: this._onMoveEnd
			};

			if (!this.options.updateWhenIdle) {
				// update tiles on move, but not more often than once per given interval
				if (!this._onMove) {
					this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
				}

				events.move = this._onMove;
			}

			if (this._zoomAnimated) {
				events.zoomanim = this._animateZoom;
			}

			return events;
		},

		// @section Extension methods
		// Layers extending `GridLayer` shall reimplement the following method.
		// @method createTile(coords: Object, done?: Function): HTMLElement
		// Called only internally, must be overridden by classes extending `GridLayer`.
		// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
		// is specified, it must be called when the tile has finished loading and drawing.
		createTile: function () {
			return document.createElement('div');
		},

		// @section
		// @method getTileSize: Point
		// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
		getTileSize: function () {
			var s = this.options.tileSize;
			return s instanceof Point ? s : new Point(s, s);
		},

		_updateZIndex: function () {
			if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
				this._container.style.zIndex = this.options.zIndex;
			}
		},

		_setAutoZIndex: function (compare) {
			// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

			var layers = this.getPane().children,
			    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

			for (var i = 0, len = layers.length, zIndex; i < len; i++) {

				zIndex = layers[i].style.zIndex;

				if (layers[i] !== this._container && zIndex) {
					edgeZIndex = compare(edgeZIndex, +zIndex);
				}
			}

			if (isFinite(edgeZIndex)) {
				this.options.zIndex = edgeZIndex + compare(-1, 1);
				this._updateZIndex();
			}
		},

		_updateOpacity: function () {
			if (!this._map) { return; }

			// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
			if (ielt9) { return; }

			setOpacity(this._container, this.options.opacity);

			var now = +new Date(),
			    nextFrame = false,
			    willPrune = false;

			for (var key in this._tiles) {
				var tile = this._tiles[key];
				if (!tile.current || !tile.loaded) { continue; }

				var fade = Math.min(1, (now - tile.loaded) / 200);

				setOpacity(tile.el, fade);
				if (fade < 1) {
					nextFrame = true;
				} else {
					if (tile.active) {
						willPrune = true;
					} else {
						this._onOpaqueTile(tile);
					}
					tile.active = true;
				}
			}

			if (willPrune && !this._noPrune) { this._pruneTiles(); }

			if (nextFrame) {
				cancelAnimFrame(this._fadeFrame);
				this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
			}
		},

		_onOpaqueTile: falseFn,

		_initContainer: function () {
			if (this._container) { return; }

			this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
			this._updateZIndex();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}

			this.getPane().appendChild(this._container);
		},

		_updateLevels: function () {

			var zoom = this._tileZoom,
			    maxZoom = this.options.maxZoom;

			if (zoom === undefined) { return undefined; }

			for (var z in this._levels) {
				if (this._levels[z].el.children.length || z === zoom) {
					this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
					this._onUpdateLevel(z);
				} else {
					remove(this._levels[z].el);
					this._removeTilesAtZoom(z);
					this._onRemoveLevel(z);
					delete this._levels[z];
				}
			}

			var level = this._levels[zoom],
			    map = this._map;

			if (!level) {
				level = this._levels[zoom] = {};

				level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
				level.el.style.zIndex = maxZoom;

				level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
				level.zoom = zoom;

				this._setZoomTransform(level, map.getCenter(), map.getZoom());

				// force the browser to consider the newly added element for transition
				falseFn(level.el.offsetWidth);

				this._onCreateLevel(level);
			}

			this._level = level;

			return level;
		},

		_onUpdateLevel: falseFn,

		_onRemoveLevel: falseFn,

		_onCreateLevel: falseFn,

		_pruneTiles: function () {
			if (!this._map) {
				return;
			}

			var key, tile;

			var zoom = this._map.getZoom();
			if (zoom > this.options.maxZoom ||
				zoom < this.options.minZoom) {
				this._removeAllTiles();
				return;
			}

			for (key in this._tiles) {
				tile = this._tiles[key];
				tile.retain = tile.current;
			}

			for (key in this._tiles) {
				tile = this._tiles[key];
				if (tile.current && !tile.active) {
					var coords = tile.coords;
					if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
						this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
					}
				}
			}

			for (key in this._tiles) {
				if (!this._tiles[key].retain) {
					this._removeTile(key);
				}
			}
		},

		_removeTilesAtZoom: function (zoom) {
			for (var key in this._tiles) {
				if (this._tiles[key].coords.z !== zoom) {
					continue;
				}
				this._removeTile(key);
			}
		},

		_removeAllTiles: function () {
			for (var key in this._tiles) {
				this._removeTile(key);
			}
		},

		_invalidateAll: function () {
			for (var z in this._levels) {
				remove(this._levels[z].el);
				this._onRemoveLevel(z);
				delete this._levels[z];
			}
			this._removeAllTiles();

			this._tileZoom = undefined;
		},

		_retainParent: function (x, y, z, minZoom) {
			var x2 = Math.floor(x / 2),
			    y2 = Math.floor(y / 2),
			    z2 = z - 1,
			    coords2 = new Point(+x2, +y2);
			coords2.z = +z2;

			var key = this._tileCoordsToKey(coords2),
			    tile = this._tiles[key];

			if (tile && tile.active) {
				tile.retain = true;
				return true;

			} else if (tile && tile.loaded) {
				tile.retain = true;
			}

			if (z2 > minZoom) {
				return this._retainParent(x2, y2, z2, minZoom);
			}

			return false;
		},

		_retainChildren: function (x, y, z, maxZoom) {

			for (var i = 2 * x; i < 2 * x + 2; i++) {
				for (var j = 2 * y; j < 2 * y + 2; j++) {

					var coords = new Point(i, j);
					coords.z = z + 1;

					var key = this._tileCoordsToKey(coords),
					    tile = this._tiles[key];

					if (tile && tile.active) {
						tile.retain = true;
						continue;

					} else if (tile && tile.loaded) {
						tile.retain = true;
					}

					if (z + 1 < maxZoom) {
						this._retainChildren(i, j, z + 1, maxZoom);
					}
				}
			}
		},

		_resetView: function (e) {
			var animating = e && (e.pinch || e.flyTo);
			this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
		},

		_animateZoom: function (e) {
			this._setView(e.center, e.zoom, true, e.noUpdate);
		},

		_clampZoom: function (zoom) {
			var options = this.options;

			if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
				return options.minNativeZoom;
			}

			if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
				return options.maxNativeZoom;
			}

			return zoom;
		},

		_setView: function (center, zoom, noPrune, noUpdate) {
			var tileZoom = this._clampZoom(Math.round(zoom));
			if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
			    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
				tileZoom = undefined;
			}

			var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

			if (!noUpdate || tileZoomChanged) {

				this._tileZoom = tileZoom;

				if (this._abortLoading) {
					this._abortLoading();
				}

				this._updateLevels();
				this._resetGrid();

				if (tileZoom !== undefined) {
					this._update(center);
				}

				if (!noPrune) {
					this._pruneTiles();
				}

				// Flag to prevent _updateOpacity from pruning tiles during
				// a zoom anim or a pinch gesture
				this._noPrune = !!noPrune;
			}

			this._setZoomTransforms(center, zoom);
		},

		_setZoomTransforms: function (center, zoom) {
			for (var i in this._levels) {
				this._setZoomTransform(this._levels[i], center, zoom);
			}
		},

		_setZoomTransform: function (level, center, zoom) {
			var scale = this._map.getZoomScale(zoom, level.zoom),
			    translate = level.origin.multiplyBy(scale)
			        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

			if (any3d) {
				setTransform(level.el, translate, scale);
			} else {
				setPosition(level.el, translate);
			}
		},

		_resetGrid: function () {
			var map = this._map,
			    crs = map.options.crs,
			    tileSize = this._tileSize = this.getTileSize(),
			    tileZoom = this._tileZoom;

			var bounds = this._map.getPixelWorldBounds(this._tileZoom);
			if (bounds) {
				this._globalTileRange = this._pxBoundsToTileRange(bounds);
			}

			this._wrapX = crs.wrapLng && !this.options.noWrap && [
				Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
				Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
			];
			this._wrapY = crs.wrapLat && !this.options.noWrap && [
				Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
				Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
			];
		},

		_onMoveEnd: function () {
			if (!this._map || this._map._animatingZoom) { return; }

			this._update();
		},

		_getTiledPixelBounds: function (center) {
			var map = this._map,
			    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
			    scale = map.getZoomScale(mapZoom, this._tileZoom),
			    pixelCenter = map.project(center, this._tileZoom).floor(),
			    halfSize = map.getSize().divideBy(scale * 2);

			return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
		},

		// Private method to load tiles in the grid's active zoom level according to map bounds
		_update: function (center) {
			var map = this._map;
			if (!map) { return; }
			var zoom = this._clampZoom(map.getZoom());

			if (center === undefined) { center = map.getCenter(); }
			if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

			var pixelBounds = this._getTiledPixelBounds(center),
			    tileRange = this._pxBoundsToTileRange(pixelBounds),
			    tileCenter = tileRange.getCenter(),
			    queue = [],
			    margin = this.options.keepBuffer,
			    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
			                              tileRange.getTopRight().add([margin, -margin]));

			// Sanity check: panic if the tile range contains Infinity somewhere.
			if (!(isFinite(tileRange.min.x) &&
			      isFinite(tileRange.min.y) &&
			      isFinite(tileRange.max.x) &&
			      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

			for (var key in this._tiles) {
				var c = this._tiles[key].coords;
				if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
					this._tiles[key].current = false;
				}
			}

			// _update just loads more tiles. If the tile zoom level differs too much
			// from the map's, let _setView reset levels and prune old tiles.
			if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

			// create a queue of coordinates to load tiles from
			for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
				for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
					var coords = new Point(i, j);
					coords.z = this._tileZoom;

					if (!this._isValidTile(coords)) { continue; }

					var tile = this._tiles[this._tileCoordsToKey(coords)];
					if (tile) {
						tile.current = true;
					} else {
						queue.push(coords);
					}
				}
			}

			// sort tile queue to load tiles in order of their distance to center
			queue.sort(function (a, b) {
				return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
			});

			if (queue.length !== 0) {
				// if it's the first batch of tiles to load
				if (!this._loading) {
					this._loading = true;
					// @event loading: Event
					// Fired when the grid layer starts loading tiles.
					this.fire('loading');
				}

				// create DOM fragment to append tiles in one batch
				var fragment = document.createDocumentFragment();

				for (i = 0; i < queue.length; i++) {
					this._addTile(queue[i], fragment);
				}

				this._level.el.appendChild(fragment);
			}
		},

		_isValidTile: function (coords) {
			var crs = this._map.options.crs;

			if (!crs.infinite) {
				// don't load tile if it's out of bounds and not wrapped
				var bounds = this._globalTileRange;
				if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
				    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
			}

			if (!this.options.bounds) { return true; }

			// don't load tile if it doesn't intersect the bounds in options
			var tileBounds = this._tileCoordsToBounds(coords);
			return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
		},

		_keyToBounds: function (key) {
			return this._tileCoordsToBounds(this._keyToTileCoords(key));
		},

		_tileCoordsToNwSe: function (coords) {
			var map = this._map,
			    tileSize = this.getTileSize(),
			    nwPoint = coords.scaleBy(tileSize),
			    sePoint = nwPoint.add(tileSize),
			    nw = map.unproject(nwPoint, coords.z),
			    se = map.unproject(sePoint, coords.z);
			return [nw, se];
		},

		// converts tile coordinates to its geographical bounds
		_tileCoordsToBounds: function (coords) {
			var bp = this._tileCoordsToNwSe(coords),
			    bounds = new LatLngBounds(bp[0], bp[1]);

			if (!this.options.noWrap) {
				bounds = this._map.wrapLatLngBounds(bounds);
			}
			return bounds;
		},
		// converts tile coordinates to key for the tile cache
		_tileCoordsToKey: function (coords) {
			return coords.x + ':' + coords.y + ':' + coords.z;
		},

		// converts tile cache key to coordinates
		_keyToTileCoords: function (key) {
			var k = key.split(':'),
			    coords = new Point(+k[0], +k[1]);
			coords.z = +k[2];
			return coords;
		},

		_removeTile: function (key) {
			var tile = this._tiles[key];
			if (!tile) { return; }

			remove(tile.el);

			delete this._tiles[key];

			// @event tileunload: TileEvent
			// Fired when a tile is removed (e.g. when a tile goes off the screen).
			this.fire('tileunload', {
				tile: tile.el,
				coords: this._keyToTileCoords(key)
			});
		},

		_initTile: function (tile) {
			addClass(tile, 'leaflet-tile');

			var tileSize = this.getTileSize();
			tile.style.width = tileSize.x + 'px';
			tile.style.height = tileSize.y + 'px';

			tile.onselectstart = falseFn;
			tile.onmousemove = falseFn;

			// update opacity on tiles in IE7-8 because of filter inheritance problems
			if (ielt9 && this.options.opacity < 1) {
				setOpacity(tile, this.options.opacity);
			}

			// without this hack, tiles disappear after zoom on Chrome for Android
			// https://github.com/Leaflet/Leaflet/issues/2078
			if (android && !android23) {
				tile.style.WebkitBackfaceVisibility = 'hidden';
			}
		},

		_addTile: function (coords, container) {
			var tilePos = this._getTilePos(coords),
			    key = this._tileCoordsToKey(coords);

			var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

			this._initTile(tile);

			// if createTile is defined with a second argument ("done" callback),
			// we know that tile is async and will be ready later; otherwise
			if (this.createTile.length < 2) {
				// mark tile as ready, but delay one frame for opacity animation to happen
				requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
			}

			setPosition(tile, tilePos);

			// save tile in cache
			this._tiles[key] = {
				el: tile,
				coords: coords,
				current: true
			};

			container.appendChild(tile);
			// @event tileloadstart: TileEvent
			// Fired when a tile is requested and starts loading.
			this.fire('tileloadstart', {
				tile: tile,
				coords: coords
			});
		},

		_tileReady: function (coords, err, tile) {
			if (err) {
				// @event tileerror: TileErrorEvent
				// Fired when there is an error loading a tile.
				this.fire('tileerror', {
					error: err,
					tile: tile,
					coords: coords
				});
			}

			var key = this._tileCoordsToKey(coords);

			tile = this._tiles[key];
			if (!tile) { return; }

			tile.loaded = +new Date();
			if (this._map._fadeAnimated) {
				setOpacity(tile.el, 0);
				cancelAnimFrame(this._fadeFrame);
				this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
			} else {
				tile.active = true;
				this._pruneTiles();
			}

			if (!err) {
				addClass(tile.el, 'leaflet-tile-loaded');

				// @event tileload: TileEvent
				// Fired when a tile loads.
				this.fire('tileload', {
					tile: tile.el,
					coords: coords
				});
			}

			if (this._noTilesToLoad()) {
				this._loading = false;
				// @event load: Event
				// Fired when the grid layer loaded all visible tiles.
				this.fire('load');

				if (ielt9 || !this._map._fadeAnimated) {
					requestAnimFrame(this._pruneTiles, this);
				} else {
					// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
					// to trigger a pruning.
					setTimeout(bind(this._pruneTiles, this), 250);
				}
			}
		},

		_getTilePos: function (coords) {
			return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
		},

		_wrapCoords: function (coords) {
			var newCoords = new Point(
				this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
				this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
			newCoords.z = coords.z;
			return newCoords;
		},

		_pxBoundsToTileRange: function (bounds) {
			var tileSize = this.getTileSize();
			return new Bounds(
				bounds.min.unscaleBy(tileSize).floor(),
				bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
		},

		_noTilesToLoad: function () {
			for (var key in this._tiles) {
				if (!this._tiles[key].loaded) { return false; }
			}
			return true;
		}
	});

	// @factory L.gridLayer(options?: GridLayer options)
	// Creates a new instance of GridLayer with the supplied options.
	function gridLayer(options) {
		return new GridLayer(options);
	}

	/*
	 * @class TileLayer
	 * @inherits GridLayer
	 * @aka L.TileLayer
	 * Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under `Layer`. Extends `GridLayer`.
	 *
	 * @example
	 *
	 * ```js
	 * L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);
	 * ```
	 *
	 * @section URL template
	 * @example
	 *
	 * A string of the following form:
	 *
	 * ```
	 * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
	 * ```
	 *
	 * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
	 *
	 * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
	 *
	 * ```
	 * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
	 * ```
	 */


	var TileLayer = GridLayer.extend({

		// @section
		// @aka TileLayer options
		options: {
			// @option minZoom: Number = 0
			// The minimum zoom level down to which this layer will be displayed (inclusive).
			minZoom: 0,

			// @option maxZoom: Number = 18
			// The maximum zoom level up to which this layer will be displayed (inclusive).
			maxZoom: 18,

			// @option subdomains: String|String[] = 'abc'
			// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
			subdomains: 'abc',

			// @option errorTileUrl: String = ''
			// URL to the tile image to show in place of the tile that failed to load.
			errorTileUrl: '',

			// @option zoomOffset: Number = 0
			// The zoom number used in tile URLs will be offset with this value.
			zoomOffset: 0,

			// @option tms: Boolean = false
			// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
			tms: false,

			// @option zoomReverse: Boolean = false
			// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
			zoomReverse: false,

			// @option detectRetina: Boolean = false
			// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
			detectRetina: false,

			// @option crossOrigin: Boolean|String = false
			// Whether the crossOrigin attribute will be added to the tiles.
			// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
			// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
			crossOrigin: false
		},

		initialize: function (url, options) {

			this._url = url;

			options = setOptions(this, options);

			// detecting retina displays, adjusting tileSize and zoom levels
			if (options.detectRetina && retina && options.maxZoom > 0) {

				options.tileSize = Math.floor(options.tileSize / 2);

				if (!options.zoomReverse) {
					options.zoomOffset++;
					options.maxZoom--;
				} else {
					options.zoomOffset--;
					options.minZoom++;
				}

				options.minZoom = Math.max(0, options.minZoom);
			}

			if (typeof options.subdomains === 'string') {
				options.subdomains = options.subdomains.split('');
			}

			// for https://github.com/Leaflet/Leaflet/issues/137
			if (!android) {
				this.on('tileunload', this._onTileRemove);
			}
		},

		// @method setUrl(url: String, noRedraw?: Boolean): this
		// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
		// If the URL does not change, the layer will not be redrawn unless
		// the noRedraw parameter is set to false.
		setUrl: function (url, noRedraw) {
			if (this._url === url && noRedraw === undefined) {
				noRedraw = true;
			}

			this._url = url;

			if (!noRedraw) {
				this.redraw();
			}
			return this;
		},

		// @method createTile(coords: Object, done?: Function): HTMLElement
		// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
		// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
		// callback is called when the tile has been loaded.
		createTile: function (coords, done) {
			var tile = document.createElement('img');

			on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
			on(tile, 'error', bind(this._tileOnError, this, done, tile));

			if (this.options.crossOrigin || this.options.crossOrigin === '') {
				tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
			}

			/*
			 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
			 http://www.w3.org/TR/WCAG20-TECHS/H67
			*/
			tile.alt = '';

			/*
			 Set role="presentation" to force screen readers to ignore this
			 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
			*/
			tile.setAttribute('role', 'presentation');

			tile.src = this.getTileUrl(coords);

			return tile;
		},

		// @section Extension methods
		// @uninheritable
		// Layers extending `TileLayer` might reimplement the following method.
		// @method getTileUrl(coords: Object): String
		// Called only internally, returns the URL for a tile given its coordinates.
		// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
		getTileUrl: function (coords) {
			var data = {
				r: retina ? '@2x' : '',
				s: this._getSubdomain(coords),
				x: coords.x,
				y: coords.y,
				z: this._getZoomForUrl()
			};
			if (this._map && !this._map.options.crs.infinite) {
				var invertedY = this._globalTileRange.max.y - coords.y;
				if (this.options.tms) {
					data['y'] = invertedY;
				}
				data['-y'] = invertedY;
			}

			return template(this._url, extend(data, this.options));
		},

		_tileOnLoad: function (done, tile) {
			// For https://github.com/Leaflet/Leaflet/issues/3332
			if (ielt9) {
				setTimeout(bind(done, this, null, tile), 0);
			} else {
				done(null, tile);
			}
		},

		_tileOnError: function (done, tile, e) {
			var errorUrl = this.options.errorTileUrl;
			if (errorUrl && tile.getAttribute('src') !== errorUrl) {
				tile.src = errorUrl;
			}
			done(e, tile);
		},

		_onTileRemove: function (e) {
			e.tile.onload = null;
		},

		_getZoomForUrl: function () {
			var zoom = this._tileZoom,
			maxZoom = this.options.maxZoom,
			zoomReverse = this.options.zoomReverse,
			zoomOffset = this.options.zoomOffset;

			if (zoomReverse) {
				zoom = maxZoom - zoom;
			}

			return zoom + zoomOffset;
		},

		_getSubdomain: function (tilePoint) {
			var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
			return this.options.subdomains[index];
		},

		// stops loading all tiles in the background layer
		_abortLoading: function () {
			var i, tile;
			for (i in this._tiles) {
				if (this._tiles[i].coords.z !== this._tileZoom) {
					tile = this._tiles[i].el;

					tile.onload = falseFn;
					tile.onerror = falseFn;

					if (!tile.complete) {
						tile.src = emptyImageUrl;
						remove(tile);
						delete this._tiles[i];
					}
				}
			}
		},

		_removeTile: function (key) {
			var tile = this._tiles[key];
			if (!tile) { return; }

			// Cancels any pending http requests associated with the tile
			// unless we're on Android's stock browser,
			// see https://github.com/Leaflet/Leaflet/issues/137
			if (!androidStock) {
				tile.el.setAttribute('src', emptyImageUrl);
			}

			return GridLayer.prototype._removeTile.call(this, key);
		},

		_tileReady: function (coords, err, tile) {
			if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
				return;
			}

			return GridLayer.prototype._tileReady.call(this, coords, err, tile);
		}
	});


	// @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
	// Instantiates a tile layer object given a `URL template` and optionally an options object.

	function tileLayer(url, options) {
		return new TileLayer(url, options);
	}

	/*
	 * @class TileLayer.WMS
	 * @inherits TileLayer
	 * @aka L.TileLayer.WMS
	 * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
	 *
	 * @example
	 *
	 * ```js
	 * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
	 * 	layers: 'nexrad-n0r-900913',
	 * 	format: 'image/png',
	 * 	transparent: true,
	 * 	attribution: "Weather data © 2012 IEM Nexrad"
	 * });
	 * ```
	 */

	var TileLayerWMS = TileLayer.extend({

		// @section
		// @aka TileLayer.WMS options
		// If any custom options not documented here are used, they will be sent to the
		// WMS server as extra parameters in each request URL. This can be useful for
		// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
		defaultWmsParams: {
			service: 'WMS',
			request: 'GetMap',

			// @option layers: String = ''
			// **(required)** Comma-separated list of WMS layers to show.
			layers: '',

			// @option styles: String = ''
			// Comma-separated list of WMS styles.
			styles: '',

			// @option format: String = 'image/jpeg'
			// WMS image format (use `'image/png'` for layers with transparency).
			format: 'image/jpeg',

			// @option transparent: Boolean = false
			// If `true`, the WMS service will return images with transparency.
			transparent: false,

			// @option version: String = '1.1.1'
			// Version of the WMS service to use
			version: '1.1.1'
		},

		options: {
			// @option crs: CRS = null
			// Coordinate Reference System to use for the WMS requests, defaults to
			// map CRS. Don't change this if you're not sure what it means.
			crs: null,

			// @option uppercase: Boolean = false
			// If `true`, WMS request parameter keys will be uppercase.
			uppercase: false
		},

		initialize: function (url, options) {

			this._url = url;

			var wmsParams = extend({}, this.defaultWmsParams);

			// all keys that are not TileLayer options go to WMS params
			for (var i in options) {
				if (!(i in this.options)) {
					wmsParams[i] = options[i];
				}
			}

			options = setOptions(this, options);

			var realRetina = options.detectRetina && retina ? 2 : 1;
			var tileSize = this.getTileSize();
			wmsParams.width = tileSize.x * realRetina;
			wmsParams.height = tileSize.y * realRetina;

			this.wmsParams = wmsParams;
		},

		onAdd: function (map) {

			this._crs = this.options.crs || map.options.crs;
			this._wmsVersion = parseFloat(this.wmsParams.version);

			var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
			this.wmsParams[projectionKey] = this._crs.code;

			TileLayer.prototype.onAdd.call(this, map);
		},

		getTileUrl: function (coords) {

			var tileBounds = this._tileCoordsToNwSe(coords),
			    crs = this._crs,
			    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
			    min = bounds.min,
			    max = bounds.max,
			    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
			    [min.y, min.x, max.y, max.x] :
			    [min.x, min.y, max.x, max.y]).join(','),
			    url = TileLayer.prototype.getTileUrl.call(this, coords);
			return url +
				getParamString(this.wmsParams, url, this.options.uppercase) +
				(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
		},

		// @method setParams(params: Object, noRedraw?: Boolean): this
		// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
		setParams: function (params, noRedraw) {

			extend(this.wmsParams, params);

			if (!noRedraw) {
				this.redraw();
			}

			return this;
		}
	});


	// @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
	// Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
	function tileLayerWMS(url, options) {
		return new TileLayerWMS(url, options);
	}

	TileLayer.WMS = TileLayerWMS;
	tileLayer.wms = tileLayerWMS;

	/*
	 * @class Renderer
	 * @inherits Layer
	 * @aka L.Renderer
	 *
	 * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
	 * DOM container of the renderer, its bounds, and its zoom animation.
	 *
	 * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
	 * itself can be added or removed to the map. All paths use a renderer, which can
	 * be implicit (the map will decide the type of renderer and use it automatically)
	 * or explicit (using the [`renderer`](#path-renderer) option of the path).
	 *
	 * Do not use this class directly, use `SVG` and `Canvas` instead.
	 *
	 * @event update: Event
	 * Fired when the renderer updates its bounds, center and zoom, for example when
	 * its map has moved
	 */

	var Renderer = Layer.extend({

		// @section
		// @aka Renderer options
		options: {
			// @option padding: Number = 0.1
			// How much to extend the clip area around the map view (relative to its size)
			// e.g. 0.1 would be 10% of map view in each direction
			padding: 0.1,

			// @option tolerance: Number = 0
			// How much to extend click tolerance round a path/object on the map
			tolerance : 0
		},

		initialize: function (options) {
			setOptions(this, options);
			stamp(this);
			this._layers = this._layers || {};
		},

		onAdd: function () {
			if (!this._container) {
				this._initContainer(); // defined by renderer implementations

				if (this._zoomAnimated) {
					addClass(this._container, 'leaflet-zoom-animated');
				}
			}

			this.getPane().appendChild(this._container);
			this._update();
			this.on('update', this._updatePaths, this);
		},

		onRemove: function () {
			this.off('update', this._updatePaths, this);
			this._destroyContainer();
		},

		getEvents: function () {
			var events = {
				viewreset: this._reset,
				zoom: this._onZoom,
				moveend: this._update,
				zoomend: this._onZoomEnd
			};
			if (this._zoomAnimated) {
				events.zoomanim = this._onAnimZoom;
			}
			return events;
		},

		_onAnimZoom: function (ev) {
			this._updateTransform(ev.center, ev.zoom);
		},

		_onZoom: function () {
			this._updateTransform(this._map.getCenter(), this._map.getZoom());
		},

		_updateTransform: function (center, zoom) {
			var scale = this._map.getZoomScale(zoom, this._zoom),
			    position = getPosition(this._container),
			    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
			    currentCenterPoint = this._map.project(this._center, zoom),
			    destCenterPoint = this._map.project(center, zoom),
			    centerOffset = destCenterPoint.subtract(currentCenterPoint),

			    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

			if (any3d) {
				setTransform(this._container, topLeftOffset, scale);
			} else {
				setPosition(this._container, topLeftOffset);
			}
		},

		_reset: function () {
			this._update();
			this._updateTransform(this._center, this._zoom);

			for (var id in this._layers) {
				this._layers[id]._reset();
			}
		},

		_onZoomEnd: function () {
			for (var id in this._layers) {
				this._layers[id]._project();
			}
		},

		_updatePaths: function () {
			for (var id in this._layers) {
				this._layers[id]._update();
			}
		},

		_update: function () {
			// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
			// Subclasses are responsible of firing the 'update' event.
			var p = this.options.padding,
			    size = this._map.getSize(),
			    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

			this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

			this._center = this._map.getCenter();
			this._zoom = this._map.getZoom();
		}
	});

	/*
	 * @class Canvas
	 * @inherits Renderer
	 * @aka L.Canvas
	 *
	 * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
	 * Inherits `Renderer`.
	 *
	 * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
	 * available in all web browsers, notably IE8, and overlapping geometries might
	 * not display properly in some edge cases.
	 *
	 * @example
	 *
	 * Use Canvas by default for all paths in the map:
	 *
	 * ```js
	 * var map = L.map('map', {
	 * 	renderer: L.canvas()
	 * });
	 * ```
	 *
	 * Use a Canvas renderer with extra padding for specific vector geometries:
	 *
	 * ```js
	 * var map = L.map('map');
	 * var myRenderer = L.canvas({ padding: 0.5 });
	 * var line = L.polyline( coordinates, { renderer: myRenderer } );
	 * var circle = L.circle( center, { renderer: myRenderer } );
	 * ```
	 */

	var Canvas = Renderer.extend({
		getEvents: function () {
			var events = Renderer.prototype.getEvents.call(this);
			events.viewprereset = this._onViewPreReset;
			return events;
		},

		_onViewPreReset: function () {
			// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
			this._postponeUpdatePaths = true;
		},

		onAdd: function () {
			Renderer.prototype.onAdd.call(this);

			// Redraw vectors since canvas is cleared upon removal,
			// in case of removing the renderer itself from the map.
			this._draw();
		},

		_initContainer: function () {
			var container = this._container = document.createElement('canvas');

			on(container, 'mousemove', this._onMouseMove, this);
			on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
			on(container, 'mouseout', this._handleMouseOut, this);

			this._ctx = container.getContext('2d');
		},

		_destroyContainer: function () {
			cancelAnimFrame(this._redrawRequest);
			delete this._ctx;
			remove(this._container);
			off(this._container);
			delete this._container;
		},

		_updatePaths: function () {
			if (this._postponeUpdatePaths) { return; }

			var layer;
			this._redrawBounds = null;
			for (var id in this._layers) {
				layer = this._layers[id];
				layer._update();
			}
			this._redraw();
		},

		_update: function () {
			if (this._map._animatingZoom && this._bounds) { return; }

			Renderer.prototype._update.call(this);

			var b = this._bounds,
			    container = this._container,
			    size = b.getSize(),
			    m = retina ? 2 : 1;

			setPosition(container, b.min);

			// set canvas size (also clearing it); use double size on retina
			container.width = m * size.x;
			container.height = m * size.y;
			container.style.width = size.x + 'px';
			container.style.height = size.y + 'px';

			if (retina) {
				this._ctx.scale(2, 2);
			}

			// translate so we use the same path coordinates after canvas element moves
			this._ctx.translate(-b.min.x, -b.min.y);

			// Tell paths to redraw themselves
			this.fire('update');
		},

		_reset: function () {
			Renderer.prototype._reset.call(this);

			if (this._postponeUpdatePaths) {
				this._postponeUpdatePaths = false;
				this._updatePaths();
			}
		},

		_initPath: function (layer) {
			this._updateDashArray(layer);
			this._layers[stamp(layer)] = layer;

			var order = layer._order = {
				layer: layer,
				prev: this._drawLast,
				next: null
			};
			if (this._drawLast) { this._drawLast.next = order; }
			this._drawLast = order;
			this._drawFirst = this._drawFirst || this._drawLast;
		},

		_addPath: function (layer) {
			this._requestRedraw(layer);
		},

		_removePath: function (layer) {
			var order = layer._order;
			var next = order.next;
			var prev = order.prev;

			if (next) {
				next.prev = prev;
			} else {
				this._drawLast = prev;
			}
			if (prev) {
				prev.next = next;
			} else {
				this._drawFirst = next;
			}

			delete layer._order;

			delete this._layers[stamp(layer)];

			this._requestRedraw(layer);
		},

		_updatePath: function (layer) {
			// Redraw the union of the layer's old pixel
			// bounds and the new pixel bounds.
			this._extendRedrawBounds(layer);
			layer._project();
			layer._update();
			// The redraw will extend the redraw bounds
			// with the new pixel bounds.
			this._requestRedraw(layer);
		},

		_updateStyle: function (layer) {
			this._updateDashArray(layer);
			this._requestRedraw(layer);
		},

		_updateDashArray: function (layer) {
			if (typeof layer.options.dashArray === 'string') {
				var parts = layer.options.dashArray.split(/[, ]+/),
				    dashArray = [],
				    dashValue,
				    i;
				for (i = 0; i < parts.length; i++) {
					dashValue = Number(parts[i]);
					// Ignore dash array containing invalid lengths
					if (isNaN(dashValue)) { return; }
					dashArray.push(dashValue);
				}
				layer.options._dashArray = dashArray;
			} else {
				layer.options._dashArray = layer.options.dashArray;
			}
		},

		_requestRedraw: function (layer) {
			if (!this._map) { return; }

			this._extendRedrawBounds(layer);
			this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
		},

		_extendRedrawBounds: function (layer) {
			if (layer._pxBounds) {
				var padding = (layer.options.weight || 0) + 1;
				this._redrawBounds = this._redrawBounds || new Bounds();
				this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
				this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
			}
		},

		_redraw: function () {
			this._redrawRequest = null;

			if (this._redrawBounds) {
				this._redrawBounds.min._floor();
				this._redrawBounds.max._ceil();
			}

			this._clear(); // clear layers in redraw bounds
			this._draw(); // draw layers

			this._redrawBounds = null;
		},

		_clear: function () {
			var bounds = this._redrawBounds;
			if (bounds) {
				var size = bounds.getSize();
				this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
			} else {
				this._ctx.clearRect(0, 0, this._container.width, this._container.height);
			}
		},

		_draw: function () {
			var layer, bounds = this._redrawBounds;
			this._ctx.save();
			if (bounds) {
				var size = bounds.getSize();
				this._ctx.beginPath();
				this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
				this._ctx.clip();
			}

			this._drawing = true;

			for (var order = this._drawFirst; order; order = order.next) {
				layer = order.layer;
				if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
					layer._updatePath();
				}
			}

			this._drawing = false;

			this._ctx.restore();  // Restore state before clipping.
		},

		_updatePoly: function (layer, closed) {
			if (!this._drawing) { return; }

			var i, j, len2, p,
			    parts = layer._parts,
			    len = parts.length,
			    ctx = this._ctx;

			if (!len) { return; }

			ctx.beginPath();

			for (i = 0; i < len; i++) {
				for (j = 0, len2 = parts[i].length; j < len2; j++) {
					p = parts[i][j];
					ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
				}
				if (closed) {
					ctx.closePath();
				}
			}

			this._fillStroke(ctx, layer);

			// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
		},

		_updateCircle: function (layer) {

			if (!this._drawing || layer._empty()) { return; }

			var p = layer._point,
			    ctx = this._ctx,
			    r = Math.max(Math.round(layer._radius), 1),
			    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

			if (s !== 1) {
				ctx.save();
				ctx.scale(1, s);
			}

			ctx.beginPath();
			ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

			if (s !== 1) {
				ctx.restore();
			}

			this._fillStroke(ctx, layer);
		},

		_fillStroke: function (ctx, layer) {
			var options = layer.options;

			if (options.fill) {
				ctx.globalAlpha = options.fillOpacity;
				ctx.fillStyle = options.fillColor || options.color;
				ctx.fill(options.fillRule || 'evenodd');
			}

			if (options.stroke && options.weight !== 0) {
				if (ctx.setLineDash) {
					ctx.setLineDash(layer.options && layer.options._dashArray || []);
				}
				ctx.globalAlpha = options.opacity;
				ctx.lineWidth = options.weight;
				ctx.strokeStyle = options.color;
				ctx.lineCap = options.lineCap;
				ctx.lineJoin = options.lineJoin;
				ctx.stroke();
			}
		},

		// Canvas obviously doesn't have mouse events for individual drawn objects,
		// so we emulate that by calculating what's under the mouse on mousemove/click manually

		_onClick: function (e) {
			var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

			for (var order = this._drawFirst; order; order = order.next) {
				layer = order.layer;
				if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
					clickedLayer = layer;
				}
			}
			if (clickedLayer)  {
				fakeStop(e);
				this._fireEvent([clickedLayer], e);
			}
		},

		_onMouseMove: function (e) {
			if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

			var point = this._map.mouseEventToLayerPoint(e);
			this._handleMouseHover(e, point);
		},


		_handleMouseOut: function (e) {
			var layer = this._hoveredLayer;
			if (layer) {
				// if we're leaving the layer, fire mouseout
				removeClass(this._container, 'leaflet-interactive');
				this._fireEvent([layer], e, 'mouseout');
				this._hoveredLayer = null;
				this._mouseHoverThrottled = false;
			}
		},

		_handleMouseHover: function (e, point) {
			if (this._mouseHoverThrottled) {
				return;
			}

			var layer, candidateHoveredLayer;

			for (var order = this._drawFirst; order; order = order.next) {
				layer = order.layer;
				if (layer.options.interactive && layer._containsPoint(point)) {
					candidateHoveredLayer = layer;
				}
			}

			if (candidateHoveredLayer !== this._hoveredLayer) {
				this._handleMouseOut(e);

				if (candidateHoveredLayer) {
					addClass(this._container, 'leaflet-interactive'); // change cursor
					this._fireEvent([candidateHoveredLayer], e, 'mouseover');
					this._hoveredLayer = candidateHoveredLayer;
				}
			}

			if (this._hoveredLayer) {
				this._fireEvent([this._hoveredLayer], e);
			}

			this._mouseHoverThrottled = true;
			setTimeout(L.bind(function () {
				this._mouseHoverThrottled = false;
			}, this), 32);
		},

		_fireEvent: function (layers, e, type) {
			this._map._fireDOMEvent(e, type || e.type, layers);
		},

		_bringToFront: function (layer) {
			var order = layer._order;

			if (!order) { return; }

			var next = order.next;
			var prev = order.prev;

			if (next) {
				next.prev = prev;
			} else {
				// Already last
				return;
			}
			if (prev) {
				prev.next = next;
			} else if (next) {
				// Update first entry unless this is the
				// single entry
				this._drawFirst = next;
			}

			order.prev = this._drawLast;
			this._drawLast.next = order;

			order.next = null;
			this._drawLast = order;

			this._requestRedraw(layer);
		},

		_bringToBack: function (layer) {
			var order = layer._order;

			if (!order) { return; }

			var next = order.next;
			var prev = order.prev;

			if (prev) {
				prev.next = next;
			} else {
				// Already first
				return;
			}
			if (next) {
				next.prev = prev;
			} else if (prev) {
				// Update last entry unless this is the
				// single entry
				this._drawLast = prev;
			}

			order.prev = null;

			order.next = this._drawFirst;
			this._drawFirst.prev = order;
			this._drawFirst = order;

			this._requestRedraw(layer);
		}
	});

	// @factory L.canvas(options?: Renderer options)
	// Creates a Canvas renderer with the given options.
	function canvas$1(options) {
		return canvas ? new Canvas(options) : null;
	}

	/*
	 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
	 */


	var vmlCreate = (function () {
		try {
			document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
			return function (name) {
				return document.createElement('<lvml:' + name + ' class="lvml">');
			};
		} catch (e) {
			return function (name) {
				return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
			};
		}
	})();


	/*
	 * @class SVG
	 *
	 *
	 * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
	 * with old versions of Internet Explorer.
	 */

	// mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
	var vmlMixin = {

		_initContainer: function () {
			this._container = create$1('div', 'leaflet-vml-container');
		},

		_update: function () {
			if (this._map._animatingZoom) { return; }
			Renderer.prototype._update.call(this);
			this.fire('update');
		},

		_initPath: function (layer) {
			var container = layer._container = vmlCreate('shape');

			addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

			container.coordsize = '1 1';

			layer._path = vmlCreate('path');
			container.appendChild(layer._path);

			this._updateStyle(layer);
			this._layers[stamp(layer)] = layer;
		},

		_addPath: function (layer) {
			var container = layer._container;
			this._container.appendChild(container);

			if (layer.options.interactive) {
				layer.addInteractiveTarget(container);
			}
		},

		_removePath: function (layer) {
			var container = layer._container;
			remove(container);
			layer.removeInteractiveTarget(container);
			delete this._layers[stamp(layer)];
		},

		_updateStyle: function (layer) {
			var stroke = layer._stroke,
			    fill = layer._fill,
			    options = layer.options,
			    container = layer._container;

			container.stroked = !!options.stroke;
			container.filled = !!options.fill;

			if (options.stroke) {
				if (!stroke) {
					stroke = layer._stroke = vmlCreate('stroke');
				}
				container.appendChild(stroke);
				stroke.weight = options.weight + 'px';
				stroke.color = options.color;
				stroke.opacity = options.opacity;

				if (options.dashArray) {
					stroke.dashStyle = isArray(options.dashArray) ?
					    options.dashArray.join(' ') :
					    options.dashArray.replace(/( *, *)/g, ' ');
				} else {
					stroke.dashStyle = '';
				}
				stroke.endcap = options.lineCap.replace('butt', 'flat');
				stroke.joinstyle = options.lineJoin;

			} else if (stroke) {
				container.removeChild(stroke);
				layer._stroke = null;
			}

			if (options.fill) {
				if (!fill) {
					fill = layer._fill = vmlCreate('fill');
				}
				container.appendChild(fill);
				fill.color = options.fillColor || options.color;
				fill.opacity = options.fillOpacity;

			} else if (fill) {
				container.removeChild(fill);
				layer._fill = null;
			}
		},

		_updateCircle: function (layer) {
			var p = layer._point.round(),
			    r = Math.round(layer._radius),
			    r2 = Math.round(layer._radiusY || r);

			this._setPath(layer, layer._empty() ? 'M0 0' :
				'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
		},

		_setPath: function (layer, path) {
			layer._path.v = path;
		},

		_bringToFront: function (layer) {
			toFront(layer._container);
		},

		_bringToBack: function (layer) {
			toBack(layer._container);
		}
	};

	var create$2 = vml ? vmlCreate : svgCreate;

	/*
	 * @class SVG
	 * @inherits Renderer
	 * @aka L.SVG
	 *
	 * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
	 * Inherits `Renderer`.
	 *
	 * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
	 * available in all web browsers, notably Android 2.x and 3.x.
	 *
	 * Although SVG is not available on IE7 and IE8, these browsers support
	 * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
	 * (a now deprecated technology), and the SVG renderer will fall back to VML in
	 * this case.
	 *
	 * @example
	 *
	 * Use SVG by default for all paths in the map:
	 *
	 * ```js
	 * var map = L.map('map', {
	 * 	renderer: L.svg()
	 * });
	 * ```
	 *
	 * Use a SVG renderer with extra padding for specific vector geometries:
	 *
	 * ```js
	 * var map = L.map('map');
	 * var myRenderer = L.svg({ padding: 0.5 });
	 * var line = L.polyline( coordinates, { renderer: myRenderer } );
	 * var circle = L.circle( center, { renderer: myRenderer } );
	 * ```
	 */

	var SVG = Renderer.extend({

		getEvents: function () {
			var events = Renderer.prototype.getEvents.call(this);
			events.zoomstart = this._onZoomStart;
			return events;
		},

		_initContainer: function () {
			this._container = create$2('svg');

			// makes it possible to click through svg root; we'll reset it back in individual paths
			this._container.setAttribute('pointer-events', 'none');

			this._rootGroup = create$2('g');
			this._container.appendChild(this._rootGroup);
		},

		_destroyContainer: function () {
			remove(this._container);
			off(this._container);
			delete this._container;
			delete this._rootGroup;
			delete this._svgSize;
		},

		_onZoomStart: function () {
			// Drag-then-pinch interactions might mess up the center and zoom.
			// In this case, the easiest way to prevent this is re-do the renderer
			//   bounds and padding when the zooming starts.
			this._update();
		},

		_update: function () {
			if (this._map._animatingZoom && this._bounds) { return; }

			Renderer.prototype._update.call(this);

			var b = this._bounds,
			    size = b.getSize(),
			    container = this._container;

			// set size of svg-container if changed
			if (!this._svgSize || !this._svgSize.equals(size)) {
				this._svgSize = size;
				container.setAttribute('width', size.x);
				container.setAttribute('height', size.y);
			}

			// movement: update container viewBox so that we don't have to change coordinates of individual layers
			setPosition(container, b.min);
			container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

			this.fire('update');
		},

		// methods below are called by vector layers implementations

		_initPath: function (layer) {
			var path = layer._path = create$2('path');

			// @namespace Path
			// @option className: String = null
			// Custom class name set on an element. Only for SVG renderer.
			if (layer.options.className) {
				addClass(path, layer.options.className);
			}

			if (layer.options.interactive) {
				addClass(path, 'leaflet-interactive');
			}

			this._updateStyle(layer);
			this._layers[stamp(layer)] = layer;
		},

		_addPath: function (layer) {
			if (!this._rootGroup) { this._initContainer(); }
			this._rootGroup.appendChild(layer._path);
			layer.addInteractiveTarget(layer._path);
		},

		_removePath: function (layer) {
			remove(layer._path);
			layer.removeInteractiveTarget(layer._path);
			delete this._layers[stamp(layer)];
		},

		_updatePath: function (layer) {
			layer._project();
			layer._update();
		},

		_updateStyle: function (layer) {
			var path = layer._path,
			    options = layer.options;

			if (!path) { return; }

			if (options.stroke) {
				path.setAttribute('stroke', options.color);
				path.setAttribute('stroke-opacity', options.opacity);
				path.setAttribute('stroke-width', options.weight);
				path.setAttribute('stroke-linecap', options.lineCap);
				path.setAttribute('stroke-linejoin', options.lineJoin);

				if (options.dashArray) {
					path.setAttribute('stroke-dasharray', options.dashArray);
				} else {
					path.removeAttribute('stroke-dasharray');
				}

				if (options.dashOffset) {
					path.setAttribute('stroke-dashoffset', options.dashOffset);
				} else {
					path.removeAttribute('stroke-dashoffset');
				}
			} else {
				path.setAttribute('stroke', 'none');
			}

			if (options.fill) {
				path.setAttribute('fill', options.fillColor || options.color);
				path.setAttribute('fill-opacity', options.fillOpacity);
				path.setAttribute('fill-rule', options.fillRule || 'evenodd');
			} else {
				path.setAttribute('fill', 'none');
			}
		},

		_updatePoly: function (layer, closed) {
			this._setPath(layer, pointsToPath(layer._parts, closed));
		},

		_updateCircle: function (layer) {
			var p = layer._point,
			    r = Math.max(Math.round(layer._radius), 1),
			    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
			    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

			// drawing a circle with two half-arcs
			var d = layer._empty() ? 'M0 0' :
				'M' + (p.x - r) + ',' + p.y +
				arc + (r * 2) + ',0 ' +
				arc + (-r * 2) + ',0 ';

			this._setPath(layer, d);
		},

		_setPath: function (layer, path) {
			layer._path.setAttribute('d', path);
		},

		// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
		_bringToFront: function (layer) {
			toFront(layer._path);
		},

		_bringToBack: function (layer) {
			toBack(layer._path);
		}
	});

	if (vml) {
		SVG.include(vmlMixin);
	}

	// @namespace SVG
	// @factory L.svg(options?: Renderer options)
	// Creates a SVG renderer with the given options.
	function svg$1(options) {
		return svg || vml ? new SVG(options) : null;
	}

	Map.include({
		// @namespace Map; @method getRenderer(layer: Path): Renderer
		// Returns the instance of `Renderer` that should be used to render the given
		// `Path`. It will ensure that the `renderer` options of the map and paths
		// are respected, and that the renderers do exist on the map.
		getRenderer: function (layer) {
			// @namespace Path; @option renderer: Renderer
			// Use this specific instance of `Renderer` for this path. Takes
			// precedence over the map's [default renderer](#map-renderer).
			var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

			if (!renderer) {
				renderer = this._renderer = this._createRenderer();
			}

			if (!this.hasLayer(renderer)) {
				this.addLayer(renderer);
			}
			return renderer;
		},

		_getPaneRenderer: function (name) {
			if (name === 'overlayPane' || name === undefined) {
				return false;
			}

			var renderer = this._paneRenderers[name];
			if (renderer === undefined) {
				renderer = this._createRenderer({pane: name});
				this._paneRenderers[name] = renderer;
			}
			return renderer;
		},

		_createRenderer: function (options) {
			// @namespace Map; @option preferCanvas: Boolean = false
			// Whether `Path`s should be rendered on a `Canvas` renderer.
			// By default, all `Path`s are rendered in a `SVG` renderer.
			return (this.options.preferCanvas && canvas$1(options)) || svg$1(options);
		}
	});

	/*
	 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
	 */

	/*
	 * @class Rectangle
	 * @aka L.Rectangle
	 * @inherits Polygon
	 *
	 * A class for drawing rectangle overlays on a map. Extends `Polygon`.
	 *
	 * @example
	 *
	 * ```js
	 * // define rectangle geographical bounds
	 * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
	 *
	 * // create an orange rectangle
	 * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
	 *
	 * // zoom the map to the rectangle bounds
	 * map.fitBounds(bounds);
	 * ```
	 *
	 */


	var Rectangle = Polygon.extend({
		initialize: function (latLngBounds, options) {
			Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
		},

		// @method setBounds(latLngBounds: LatLngBounds): this
		// Redraws the rectangle with the passed bounds.
		setBounds: function (latLngBounds) {
			return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
		},

		_boundsToLatLngs: function (latLngBounds) {
			latLngBounds = toLatLngBounds(latLngBounds);
			return [
				latLngBounds.getSouthWest(),
				latLngBounds.getNorthWest(),
				latLngBounds.getNorthEast(),
				latLngBounds.getSouthEast()
			];
		}
	});


	// @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
	function rectangle(latLngBounds, options) {
		return new Rectangle(latLngBounds, options);
	}

	SVG.create = create$2;
	SVG.pointsToPath = pointsToPath;

	GeoJSON.geometryToLayer = geometryToLayer;
	GeoJSON.coordsToLatLng = coordsToLatLng;
	GeoJSON.coordsToLatLngs = coordsToLatLngs;
	GeoJSON.latLngToCoords = latLngToCoords;
	GeoJSON.latLngsToCoords = latLngsToCoords;
	GeoJSON.getFeature = getFeature;
	GeoJSON.asFeature = asFeature;

	/*
	 * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
	 * (zoom to a selected bounding box), enabled by default.
	 */

	// @namespace Map
	// @section Interaction Options
	Map.mergeOptions({
		// @option boxZoom: Boolean = true
		// Whether the map can be zoomed to a rectangular area specified by
		// dragging the mouse while pressing the shift key.
		boxZoom: true
	});

	var BoxZoom = Handler.extend({
		initialize: function (map) {
			this._map = map;
			this._container = map._container;
			this._pane = map._panes.overlayPane;
			this._resetStateTimeout = 0;
			map.on('unload', this._destroy, this);
		},

		addHooks: function () {
			on(this._container, 'mousedown', this._onMouseDown, this);
		},

		removeHooks: function () {
			off(this._container, 'mousedown', this._onMouseDown, this);
		},

		moved: function () {
			return this._moved;
		},

		_destroy: function () {
			remove(this._pane);
			delete this._pane;
		},

		_resetState: function () {
			this._resetStateTimeout = 0;
			this._moved = false;
		},

		_clearDeferredResetState: function () {
			if (this._resetStateTimeout !== 0) {
				clearTimeout(this._resetStateTimeout);
				this._resetStateTimeout = 0;
			}
		},

		_onMouseDown: function (e) {
			if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

			// Clear the deferred resetState if it hasn't executed yet, otherwise it
			// will interrupt the interaction and orphan a box element in the container.
			this._clearDeferredResetState();
			this._resetState();

			disableTextSelection();
			disableImageDrag();

			this._startPoint = this._map.mouseEventToContainerPoint(e);

			on(document, {
				contextmenu: stop,
				mousemove: this._onMouseMove,
				mouseup: this._onMouseUp,
				keydown: this._onKeyDown
			}, this);
		},

		_onMouseMove: function (e) {
			if (!this._moved) {
				this._moved = true;

				this._box = create$1('div', 'leaflet-zoom-box', this._container);
				addClass(this._container, 'leaflet-crosshair');

				this._map.fire('boxzoomstart');
			}

			this._point = this._map.mouseEventToContainerPoint(e);

			var bounds = new Bounds(this._point, this._startPoint),
			    size = bounds.getSize();

			setPosition(this._box, bounds.min);

			this._box.style.width  = size.x + 'px';
			this._box.style.height = size.y + 'px';
		},

		_finish: function () {
			if (this._moved) {
				remove(this._box);
				removeClass(this._container, 'leaflet-crosshair');
			}

			enableTextSelection();
			enableImageDrag();

			off(document, {
				contextmenu: stop,
				mousemove: this._onMouseMove,
				mouseup: this._onMouseUp,
				keydown: this._onKeyDown
			}, this);
		},

		_onMouseUp: function (e) {
			if ((e.which !== 1) && (e.button !== 1)) { return; }

			this._finish();

			if (!this._moved) { return; }
			// Postpone to next JS tick so internal click event handling
			// still see it as "moved".
			this._clearDeferredResetState();
			this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

			var bounds = new LatLngBounds(
			        this._map.containerPointToLatLng(this._startPoint),
			        this._map.containerPointToLatLng(this._point));

			this._map
				.fitBounds(bounds)
				.fire('boxzoomend', {boxZoomBounds: bounds});
		},

		_onKeyDown: function (e) {
			if (e.keyCode === 27) {
				this._finish();
			}
		}
	});

	// @section Handlers
	// @property boxZoom: Handler
	// Box (shift-drag with mouse) zoom handler.
	Map.addInitHook('addHandler', 'boxZoom', BoxZoom);

	/*
	 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
	 */

	// @namespace Map
	// @section Interaction Options

	Map.mergeOptions({
		// @option doubleClickZoom: Boolean|String = true
		// Whether the map can be zoomed in by double clicking on it and
		// zoomed out by double clicking while holding shift. If passed
		// `'center'`, double-click zoom will zoom to the center of the
		//  view regardless of where the mouse was.
		doubleClickZoom: true
	});

	var DoubleClickZoom = Handler.extend({
		addHooks: function () {
			this._map.on('dblclick', this._onDoubleClick, this);
		},

		removeHooks: function () {
			this._map.off('dblclick', this._onDoubleClick, this);
		},

		_onDoubleClick: function (e) {
			var map = this._map,
			    oldZoom = map.getZoom(),
			    delta = map.options.zoomDelta,
			    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

			if (map.options.doubleClickZoom === 'center') {
				map.setZoom(zoom);
			} else {
				map.setZoomAround(e.containerPoint, zoom);
			}
		}
	});

	// @section Handlers
	//
	// Map properties include interaction handlers that allow you to control
	// interaction behavior in runtime, enabling or disabling certain features such
	// as dragging or touch zoom (see `Handler` methods). For example:
	//
	// ```js
	// map.doubleClickZoom.disable();
	// ```
	//
	// @property doubleClickZoom: Handler
	// Double click zoom handler.
	Map.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

	/*
	 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
	 */

	// @namespace Map
	// @section Interaction Options
	Map.mergeOptions({
		// @option dragging: Boolean = true
		// Whether the map be draggable with mouse/touch or not.
		dragging: true,

		// @section Panning Inertia Options
		// @option inertia: Boolean = *
		// If enabled, panning of the map will have an inertia effect where
		// the map builds momentum while dragging and continues moving in
		// the same direction for some time. Feels especially nice on touch
		// devices. Enabled by default unless running on old Android devices.
		inertia: !android23,

		// @option inertiaDeceleration: Number = 3000
		// The rate with which the inertial movement slows down, in pixels/second².
		inertiaDeceleration: 3400, // px/s^2

		// @option inertiaMaxSpeed: Number = Infinity
		// Max speed of the inertial movement, in pixels/second.
		inertiaMaxSpeed: Infinity, // px/s

		// @option easeLinearity: Number = 0.2
		easeLinearity: 0.2,

		// TODO refactor, move to CRS
		// @option worldCopyJump: Boolean = false
		// With this option enabled, the map tracks when you pan to another "copy"
		// of the world and seamlessly jumps to the original one so that all overlays
		// like markers and vector layers are still visible.
		worldCopyJump: false,

		// @option maxBoundsViscosity: Number = 0.0
		// If `maxBounds` is set, this option will control how solid the bounds
		// are when dragging the map around. The default value of `0.0` allows the
		// user to drag outside the bounds at normal speed, higher values will
		// slow down map dragging outside bounds, and `1.0` makes the bounds fully
		// solid, preventing the user from dragging outside the bounds.
		maxBoundsViscosity: 0.0
	});

	var Drag = Handler.extend({
		addHooks: function () {
			if (!this._draggable) {
				var map = this._map;

				this._draggable = new Draggable(map._mapPane, map._container);

				this._draggable.on({
					dragstart: this._onDragStart,
					drag: this._onDrag,
					dragend: this._onDragEnd
				}, this);

				this._draggable.on('predrag', this._onPreDragLimit, this);
				if (map.options.worldCopyJump) {
					this._draggable.on('predrag', this._onPreDragWrap, this);
					map.on('zoomend', this._onZoomEnd, this);

					map.whenReady(this._onZoomEnd, this);
				}
			}
			addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
			this._draggable.enable();
			this._positions = [];
			this._times = [];
		},

		removeHooks: function () {
			removeClass(this._map._container, 'leaflet-grab');
			removeClass(this._map._container, 'leaflet-touch-drag');
			this._draggable.disable();
		},

		moved: function () {
			return this._draggable && this._draggable._moved;
		},

		moving: function () {
			return this._draggable && this._draggable._moving;
		},

		_onDragStart: function () {
			var map = this._map;

			map._stop();
			if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
				var bounds = toLatLngBounds(this._map.options.maxBounds);

				this._offsetLimit = toBounds(
					this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
					this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
						.add(this._map.getSize()));

				this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
			} else {
				this._offsetLimit = null;
			}

			map
			    .fire('movestart')
			    .fire('dragstart');

			if (map.options.inertia) {
				this._positions = [];
				this._times = [];
			}
		},

		_onDrag: function (e) {
			if (this._map.options.inertia) {
				var time = this._lastTime = +new Date(),
				    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

				this._positions.push(pos);
				this._times.push(time);

				this._prunePositions(time);
			}

			this._map
			    .fire('move', e)
			    .fire('drag', e);
		},

		_prunePositions: function (time) {
			while (this._positions.length > 1 && time - this._times[0] > 50) {
				this._positions.shift();
				this._times.shift();
			}
		},

		_onZoomEnd: function () {
			var pxCenter = this._map.getSize().divideBy(2),
			    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

			this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
			this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
		},

		_viscousLimit: function (value, threshold) {
			return value - (value - threshold) * this._viscosity;
		},

		_onPreDragLimit: function () {
			if (!this._viscosity || !this._offsetLimit) { return; }

			var offset = this._draggable._newPos.subtract(this._draggable._startPos);

			var limit = this._offsetLimit;
			if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
			if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
			if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
			if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

			this._draggable._newPos = this._draggable._startPos.add(offset);
		},

		_onPreDragWrap: function () {
			// TODO refactor to be able to adjust map pane position after zoom
			var worldWidth = this._worldWidth,
			    halfWidth = Math.round(worldWidth / 2),
			    dx = this._initialWorldOffset,
			    x = this._draggable._newPos.x,
			    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
			    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
			    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

			this._draggable._absPos = this._draggable._newPos.clone();
			this._draggable._newPos.x = newX;
		},

		_onDragEnd: function (e) {
			var map = this._map,
			    options = map.options,

			    noInertia = !options.inertia || this._times.length < 2;

			map.fire('dragend', e);

			if (noInertia) {
				map.fire('moveend');

			} else {
				this._prunePositions(+new Date());

				var direction = this._lastPos.subtract(this._positions[0]),
				    duration = (this._lastTime - this._times[0]) / 1000,
				    ease = options.easeLinearity,

				    speedVector = direction.multiplyBy(ease / duration),
				    speed = speedVector.distanceTo([0, 0]),

				    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
				    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

				    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
				    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

				if (!offset.x && !offset.y) {
					map.fire('moveend');

				} else {
					offset = map._limitOffset(offset, map.options.maxBounds);

					requestAnimFrame(function () {
						map.panBy(offset, {
							duration: decelerationDuration,
							easeLinearity: ease,
							noMoveStart: true,
							animate: true
						});
					});
				}
			}
		}
	});

	// @section Handlers
	// @property dragging: Handler
	// Map dragging handler (by both mouse and touch).
	Map.addInitHook('addHandler', 'dragging', Drag);

	/*
	 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
	 */

	// @namespace Map
	// @section Keyboard Navigation Options
	Map.mergeOptions({
		// @option keyboard: Boolean = true
		// Makes the map focusable and allows users to navigate the map with keyboard
		// arrows and `+`/`-` keys.
		keyboard: true,

		// @option keyboardPanDelta: Number = 80
		// Amount of pixels to pan when pressing an arrow key.
		keyboardPanDelta: 80
	});

	var Keyboard = Handler.extend({

		keyCodes: {
			left:    [37],
			right:   [39],
			down:    [40],
			up:      [38],
			zoomIn:  [187, 107, 61, 171],
			zoomOut: [189, 109, 54, 173]
		},

		initialize: function (map) {
			this._map = map;

			this._setPanDelta(map.options.keyboardPanDelta);
			this._setZoomDelta(map.options.zoomDelta);
		},

		addHooks: function () {
			var container = this._map._container;

			// make the container focusable by tabbing
			if (container.tabIndex <= 0) {
				container.tabIndex = '0';
			}

			on(container, {
				focus: this._onFocus,
				blur: this._onBlur,
				mousedown: this._onMouseDown
			}, this);

			this._map.on({
				focus: this._addHooks,
				blur: this._removeHooks
			}, this);
		},

		removeHooks: function () {
			this._removeHooks();

			off(this._map._container, {
				focus: this._onFocus,
				blur: this._onBlur,
				mousedown: this._onMouseDown
			}, this);

			this._map.off({
				focus: this._addHooks,
				blur: this._removeHooks
			}, this);
		},

		_onMouseDown: function () {
			if (this._focused) { return; }

			var body = document.body,
			    docEl = document.documentElement,
			    top = body.scrollTop || docEl.scrollTop,
			    left = body.scrollLeft || docEl.scrollLeft;

			this._map._container.focus();

			window.scrollTo(left, top);
		},

		_onFocus: function () {
			this._focused = true;
			this._map.fire('focus');
		},

		_onBlur: function () {
			this._focused = false;
			this._map.fire('blur');
		},

		_setPanDelta: function (panDelta) {
			var keys = this._panKeys = {},
			    codes = this.keyCodes,
			    i, len;

			for (i = 0, len = codes.left.length; i < len; i++) {
				keys[codes.left[i]] = [-1 * panDelta, 0];
			}
			for (i = 0, len = codes.right.length; i < len; i++) {
				keys[codes.right[i]] = [panDelta, 0];
			}
			for (i = 0, len = codes.down.length; i < len; i++) {
				keys[codes.down[i]] = [0, panDelta];
			}
			for (i = 0, len = codes.up.length; i < len; i++) {
				keys[codes.up[i]] = [0, -1 * panDelta];
			}
		},

		_setZoomDelta: function (zoomDelta) {
			var keys = this._zoomKeys = {},
			    codes = this.keyCodes,
			    i, len;

			for (i = 0, len = codes.zoomIn.length; i < len; i++) {
				keys[codes.zoomIn[i]] = zoomDelta;
			}
			for (i = 0, len = codes.zoomOut.length; i < len; i++) {
				keys[codes.zoomOut[i]] = -zoomDelta;
			}
		},

		_addHooks: function () {
			on(document, 'keydown', this._onKeyDown, this);
		},

		_removeHooks: function () {
			off(document, 'keydown', this._onKeyDown, this);
		},

		_onKeyDown: function (e) {
			if (e.altKey || e.ctrlKey || e.metaKey) { return; }

			var key = e.keyCode,
			    map = this._map,
			    offset;

			if (key in this._panKeys) {
				if (!map._panAnim || !map._panAnim._inProgress) {
					offset = this._panKeys[key];
					if (e.shiftKey) {
						offset = toPoint(offset).multiplyBy(3);
					}

					map.panBy(offset);

					if (map.options.maxBounds) {
						map.panInsideBounds(map.options.maxBounds);
					}
				}
			} else if (key in this._zoomKeys) {
				map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

			} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
				map.closePopup();

			} else {
				return;
			}

			stop(e);
		}
	});

	// @section Handlers
	// @section Handlers
	// @property keyboard: Handler
	// Keyboard navigation handler.
	Map.addInitHook('addHandler', 'keyboard', Keyboard);

	/*
	 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
	 */

	// @namespace Map
	// @section Interaction Options
	Map.mergeOptions({
		// @section Mousewheel options
		// @option scrollWheelZoom: Boolean|String = true
		// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
		// it will zoom to the center of the view regardless of where the mouse was.
		scrollWheelZoom: true,

		// @option wheelDebounceTime: Number = 40
		// Limits the rate at which a wheel can fire (in milliseconds). By default
		// user can't zoom via wheel more often than once per 40 ms.
		wheelDebounceTime: 40,

		// @option wheelPxPerZoomLevel: Number = 60
		// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
		// mean a change of one full zoom level. Smaller values will make wheel-zooming
		// faster (and vice versa).
		wheelPxPerZoomLevel: 60
	});

	var ScrollWheelZoom = Handler.extend({
		addHooks: function () {
			on(this._map._container, 'mousewheel', this._onWheelScroll, this);

			this._delta = 0;
		},

		removeHooks: function () {
			off(this._map._container, 'mousewheel', this._onWheelScroll, this);
		},

		_onWheelScroll: function (e) {
			var delta = getWheelDelta(e);

			var debounce = this._map.options.wheelDebounceTime;

			this._delta += delta;
			this._lastMousePos = this._map.mouseEventToContainerPoint(e);

			if (!this._startTime) {
				this._startTime = +new Date();
			}

			var left = Math.max(debounce - (+new Date() - this._startTime), 0);

			clearTimeout(this._timer);
			this._timer = setTimeout(bind(this._performZoom, this), left);

			stop(e);
		},

		_performZoom: function () {
			var map = this._map,
			    zoom = map.getZoom(),
			    snap = this._map.options.zoomSnap || 0;

			map._stop(); // stop panning and fly animations if any

			// map the delta with a sigmoid function to -4..4 range leaning on -1..1
			var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
			    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
			    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
			    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

			this._delta = 0;
			this._startTime = null;

			if (!delta) { return; }

			if (map.options.scrollWheelZoom === 'center') {
				map.setZoom(zoom + delta);
			} else {
				map.setZoomAround(this._lastMousePos, zoom + delta);
			}
		}
	});

	// @section Handlers
	// @property scrollWheelZoom: Handler
	// Scroll wheel zoom handler.
	Map.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

	/*
	 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
	 */

	// @namespace Map
	// @section Interaction Options
	Map.mergeOptions({
		// @section Touch interaction options
		// @option tap: Boolean = true
		// Enables mobile hacks for supporting instant taps (fixing 200ms click
		// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
		tap: true,

		// @option tapTolerance: Number = 15
		// The max number of pixels a user can shift his finger during touch
		// for it to be considered a valid tap.
		tapTolerance: 15
	});

	var Tap = Handler.extend({
		addHooks: function () {
			on(this._map._container, 'touchstart', this._onDown, this);
		},

		removeHooks: function () {
			off(this._map._container, 'touchstart', this._onDown, this);
		},

		_onDown: function (e) {
			if (!e.touches) { return; }

			preventDefault(e);

			this._fireClick = true;

			// don't simulate click or track longpress if more than 1 touch
			if (e.touches.length > 1) {
				this._fireClick = false;
				clearTimeout(this._holdTimeout);
				return;
			}

			var first = e.touches[0],
			    el = first.target;

			this._startPos = this._newPos = new Point(first.clientX, first.clientY);

			// if touching a link, highlight it
			if (el.tagName && el.tagName.toLowerCase() === 'a') {
				addClass(el, 'leaflet-active');
			}

			// simulate long hold but setting a timeout
			this._holdTimeout = setTimeout(bind(function () {
				if (this._isTapValid()) {
					this._fireClick = false;
					this._onUp();
					this._simulateEvent('contextmenu', first);
				}
			}, this), 1000);

			this._simulateEvent('mousedown', first);

			on(document, {
				touchmove: this._onMove,
				touchend: this._onUp
			}, this);
		},

		_onUp: function (e) {
			clearTimeout(this._holdTimeout);

			off(document, {
				touchmove: this._onMove,
				touchend: this._onUp
			}, this);

			if (this._fireClick && e && e.changedTouches) {

				var first = e.changedTouches[0],
				    el = first.target;

				if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
					removeClass(el, 'leaflet-active');
				}

				this._simulateEvent('mouseup', first);

				// simulate click if the touch didn't move too much
				if (this._isTapValid()) {
					this._simulateEvent('click', first);
				}
			}
		},

		_isTapValid: function () {
			return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
		},

		_onMove: function (e) {
			var first = e.touches[0];
			this._newPos = new Point(first.clientX, first.clientY);
			this._simulateEvent('mousemove', first);
		},

		_simulateEvent: function (type, e) {
			var simulatedEvent = document.createEvent('MouseEvents');

			simulatedEvent._simulated = true;
			e.target._simulatedClick = true;

			simulatedEvent.initMouseEvent(
			        type, true, true, window, 1,
			        e.screenX, e.screenY,
			        e.clientX, e.clientY,
			        false, false, false, false, 0, null);

			e.target.dispatchEvent(simulatedEvent);
		}
	});

	// @section Handlers
	// @property tap: Handler
	// Mobile touch hacks (quick tap and touch hold) handler.
	if (touch && !pointer) {
		Map.addInitHook('addHandler', 'tap', Tap);
	}

	/*
	 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
	 */

	// @namespace Map
	// @section Interaction Options
	Map.mergeOptions({
		// @section Touch interaction options
		// @option touchZoom: Boolean|String = *
		// Whether the map can be zoomed by touch-dragging with two fingers. If
		// passed `'center'`, it will zoom to the center of the view regardless of
		// where the touch events (fingers) were. Enabled for touch-capable web
		// browsers except for old Androids.
		touchZoom: touch && !android23,

		// @option bounceAtZoomLimits: Boolean = true
		// Set it to false if you don't want the map to zoom beyond min/max zoom
		// and then bounce back when pinch-zooming.
		bounceAtZoomLimits: true
	});

	var TouchZoom = Handler.extend({
		addHooks: function () {
			addClass(this._map._container, 'leaflet-touch-zoom');
			on(this._map._container, 'touchstart', this._onTouchStart, this);
		},

		removeHooks: function () {
			removeClass(this._map._container, 'leaflet-touch-zoom');
			off(this._map._container, 'touchstart', this._onTouchStart, this);
		},

		_onTouchStart: function (e) {
			var map = this._map;
			if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

			var p1 = map.mouseEventToContainerPoint(e.touches[0]),
			    p2 = map.mouseEventToContainerPoint(e.touches[1]);

			this._centerPoint = map.getSize()._divideBy(2);
			this._startLatLng = map.containerPointToLatLng(this._centerPoint);
			if (map.options.touchZoom !== 'center') {
				this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
			}

			this._startDist = p1.distanceTo(p2);
			this._startZoom = map.getZoom();

			this._moved = false;
			this._zooming = true;

			map._stop();

			on(document, 'touchmove', this._onTouchMove, this);
			on(document, 'touchend', this._onTouchEnd, this);

			preventDefault(e);
		},

		_onTouchMove: function (e) {
			if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

			var map = this._map,
			    p1 = map.mouseEventToContainerPoint(e.touches[0]),
			    p2 = map.mouseEventToContainerPoint(e.touches[1]),
			    scale = p1.distanceTo(p2) / this._startDist;

			this._zoom = map.getScaleZoom(scale, this._startZoom);

			if (!map.options.bounceAtZoomLimits && (
				(this._zoom < map.getMinZoom() && scale < 1) ||
				(this._zoom > map.getMaxZoom() && scale > 1))) {
				this._zoom = map._limitZoom(this._zoom);
			}

			if (map.options.touchZoom === 'center') {
				this._center = this._startLatLng;
				if (scale === 1) { return; }
			} else {
				// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
				var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
				if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
				this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
			}

			if (!this._moved) {
				map._moveStart(true, false);
				this._moved = true;
			}

			cancelAnimFrame(this._animRequest);

			var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
			this._animRequest = requestAnimFrame(moveFn, this, true);

			preventDefault(e);
		},

		_onTouchEnd: function () {
			if (!this._moved || !this._zooming) {
				this._zooming = false;
				return;
			}

			this._zooming = false;
			cancelAnimFrame(this._animRequest);

			off(document, 'touchmove', this._onTouchMove);
			off(document, 'touchend', this._onTouchEnd);

			// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
			if (this._map.options.zoomAnimation) {
				this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
			} else {
				this._map._resetView(this._center, this._map._limitZoom(this._zoom));
			}
		}
	});

	// @section Handlers
	// @property touchZoom: Handler
	// Touch zoom handler.
	Map.addInitHook('addHandler', 'touchZoom', TouchZoom);

	Map.BoxZoom = BoxZoom;
	Map.DoubleClickZoom = DoubleClickZoom;
	Map.Drag = Drag;
	Map.Keyboard = Keyboard;
	Map.ScrollWheelZoom = ScrollWheelZoom;
	Map.Tap = Tap;
	Map.TouchZoom = TouchZoom;

	Object.freeze = freeze;

	exports.version = version;
	exports.Control = Control;
	exports.control = control;
	exports.Browser = Browser;
	exports.Evented = Evented;
	exports.Mixin = Mixin;
	exports.Util = Util;
	exports.Class = Class;
	exports.Handler = Handler;
	exports.extend = extend;
	exports.bind = bind;
	exports.stamp = stamp;
	exports.setOptions = setOptions;
	exports.DomEvent = DomEvent;
	exports.DomUtil = DomUtil;
	exports.PosAnimation = PosAnimation;
	exports.Draggable = Draggable;
	exports.LineUtil = LineUtil;
	exports.PolyUtil = PolyUtil;
	exports.Point = Point;
	exports.point = toPoint;
	exports.Bounds = Bounds;
	exports.bounds = toBounds;
	exports.Transformation = Transformation;
	exports.transformation = toTransformation;
	exports.Projection = index;
	exports.LatLng = LatLng;
	exports.latLng = toLatLng;
	exports.LatLngBounds = LatLngBounds;
	exports.latLngBounds = toLatLngBounds;
	exports.CRS = CRS;
	exports.GeoJSON = GeoJSON;
	exports.geoJSON = geoJSON;
	exports.geoJson = geoJson;
	exports.Layer = Layer;
	exports.LayerGroup = LayerGroup;
	exports.layerGroup = layerGroup;
	exports.FeatureGroup = FeatureGroup;
	exports.featureGroup = featureGroup;
	exports.ImageOverlay = ImageOverlay;
	exports.imageOverlay = imageOverlay;
	exports.VideoOverlay = VideoOverlay;
	exports.videoOverlay = videoOverlay;
	exports.SVGOverlay = SVGOverlay;
	exports.svgOverlay = svgOverlay;
	exports.DivOverlay = DivOverlay;
	exports.Popup = Popup;
	exports.popup = popup;
	exports.Tooltip = Tooltip;
	exports.tooltip = tooltip;
	exports.Icon = Icon;
	exports.icon = icon;
	exports.DivIcon = DivIcon;
	exports.divIcon = divIcon;
	exports.Marker = Marker;
	exports.marker = marker;
	exports.TileLayer = TileLayer;
	exports.tileLayer = tileLayer;
	exports.GridLayer = GridLayer;
	exports.gridLayer = gridLayer;
	exports.SVG = SVG;
	exports.svg = svg$1;
	exports.Renderer = Renderer;
	exports.Canvas = Canvas;
	exports.canvas = canvas$1;
	exports.Path = Path;
	exports.CircleMarker = CircleMarker;
	exports.circleMarker = circleMarker;
	exports.Circle = Circle;
	exports.circle = circle;
	exports.Polyline = Polyline;
	exports.polyline = polyline;
	exports.Polygon = Polygon;
	exports.polygon = polygon;
	exports.Rectangle = Rectangle;
	exports.rectangle = rectangle;
	exports.Map = Map;
	exports.map = createMap;

	var oldL = window.L;
	exports.noConflict = function() {
		window.L = oldL;
		return this;
	};

	// Always export us to window global (see #2364)
	window.L = exports;

	})));
	//# sourceMappingURL=leaflet-src.js.map
	});

	/* F:\git14\svelte-leaflet\src\Map.svelte generated by Svelte v3.24.0 */

	const file$9 = "F:\\git14\\svelte-leaflet\\src\\Map.svelte";

	function create_fragment$9(ctx) {
		let div;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*$$slots*/ ctx[5].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

		const block = {
			c: function create() {
				div = element("div");
				if (default_slot) default_slot.c();
				attr_dev(div, "class", "map");
				add_location(div, file$9, 44, 0, 1245);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				/*div_binding*/ ctx[6](div);
				current = true;

				if (!mounted) {
					dispose = listen_dev(window, "resize", /*resize*/ ctx[1], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 16) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
				/*div_binding*/ ctx[6](null);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$9.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$9($$self, $$props, $$invalidate) {
		let mapContainer;
		let leafletMap;
		let { center = [47.52685546875001, 44.88701247981298] } = $$props;
		let { zoom = 6 } = $$props;

		// const headerHeight = getContext ('headerHeight');    
		onMount(() => {
			leafletMap = leafletSrc.map(mapContainer, {
				svgSprite: false,
				zoomControl: false,
				center,
				zoom
			});

			// console.log('tilePane', leafletMap._panes.tilePane, leafletMap.getPane('tilePane'));
			// const {url, attribution} = TileServers['osm.mapnik'];
			// L.tileLayer(url, {
			// attribution,            
			// maxZoom: 18,
			// id: 'osm.mapnik'
			// }).addTo(leafletMap);                       
			resize();
		});

		const resize = () => {
			// mapContainer.style.height = `${window.innerHeight - headerHeight}px`;
			leafletMap.invalidateSize();
		};

		const writable_props = ["center", "zoom"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Map", $$slots, ['default']);

		function div_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				mapContainer = $$value;
				$$invalidate(0, mapContainer);
			});
		}

		$$self.$set = $$props => {
			if ("center" in $$props) $$invalidate(2, center = $$props.center);
			if ("zoom" in $$props) $$invalidate(3, zoom = $$props.zoom);
			if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			L: leafletSrc,
			onMount,
			getContext,
			mapContainer,
			leafletMap,
			center,
			zoom,
			resize
		});

		$$self.$inject_state = $$props => {
			if ("mapContainer" in $$props) $$invalidate(0, mapContainer = $$props.mapContainer);
			if ("leafletMap" in $$props) leafletMap = $$props.leafletMap;
			if ("center" in $$props) $$invalidate(2, center = $$props.center);
			if ("zoom" in $$props) $$invalidate(3, zoom = $$props.zoom);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [mapContainer, resize, center, zoom, $$scope, $$slots, div_binding];
	}

	class Map$1 extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, { center: 2, zoom: 3 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Map",
				options,
				id: create_fragment$9.name
			});
		}

		get center() {
			throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set center(value) {
			throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get zoom() {
			throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set zoom(value) {
			throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	var TileServers = {
	    'osm.mapnik': {
	        attribution: '<a href="https://www.mapnik.org">Mapnik</a>',
	        description: 'OSM Mapnik',
	        url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
	    },
	    'osm.humanitarian': {
	        attribution: '<a href="https://www.openstreetmap.org">OpenStreetMap</a>',
	        description: 'OSM Humanitarian',
	        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
	    },
	    // 'osm.landscape': {
	    //     attribution: '',
	    //     description: 'OSM Landscape',
	    //     url: 'http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png'
	    // },
	    'esri.grey.dark': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Dark Grey',
	        url:'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.grey.light': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Dark Light',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.hillshade': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Hillshade',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.ocean': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Ocean',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.delorme': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'Delorme',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.street.map': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Street Map',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
	    },
	    // 'esri.world.navigation.charts': {
	    //     attribution: 'Map data &copy; <a href="https://www.esri.com">ESRI</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	    //     description: 'ESRI World Navigation Charts',
	    //     url:'http://services.arcgisonline.com/arcgis/rest/services/Specialty/World_Navigation_Charts/MapServer/tile/{z}/{y}/{x}'
	    // },
	    'esri.national.geographic': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI National Geographic',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.imagery': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Imagery',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.physical.map': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Physical Map',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.shaded.relief': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Shaded Relief',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.terrain': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Terrain',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
	    },
	    'esri.world.topo': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'ESRI Topo',
	        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
	    },
	    'cartodb.positron': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'CartoDB Positron',
	        url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	    },
	    'cartodb.dark.matter': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'CartoDB Dark Matter',
	        url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
	    },
	    'cartodb.positron2': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'CartoDB Positron 2',
	        url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
	    },
	    'cartodb.dark.matter2': {
	        attribution: '<a href="https://www.esri.com">ESRI</a>',
	        description: 'CartoDB Dark Matter 2',
	        url: 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'
	    },
	};

	/* F:\git14\svelte-leaflet\src\TileLayer.svelte generated by Svelte v3.24.0 */
	const file$a = "F:\\git14\\svelte-leaflet\\src\\TileLayer.svelte";

	function create_fragment$a(ctx) {
		let div;
		let current;
		const default_slot_template = /*$$slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		const block = {
			c: function create() {
				div = element("div");
				if (default_slot) default_slot.c();
				add_location(div, file$a, 22, 0, 538);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 1) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$a.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$a($$self, $$props, $$invalidate) {
		onMount(() => {
			leafletSrc.Map.addInitHook(function () {
				const map = this;
				const { url, attribution } = TileServers["osm.mapnik"];

				leafletSrc.tileLayer(url, {
					attribution,
					maxZoom: 18,
					id: "osm.mapnik"
				}).addTo(map);
			});
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TileLayer> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("TileLayer", $$slots, ['default']);

		$$self.$set = $$props => {
			if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({ L: leafletSrc, TileServers, onMount, getContext });
		return [$$scope, $$slots];
	}

	class TileLayer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TileLayer",
				options,
				id: create_fragment$a.name
			});
		}
	}

	var arrowBack = 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z';

	var arrowForward = 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z';

	var code = 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z';

	var home = 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';

	var invertColors = 'M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z';

	var menu = 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z';

	var moreVert = 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z';

	const subscriber_queue = [];
	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 * @param {*=}value initial value
	 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
	 */
	function writable(value, start = noop) {
	    let stop;
	    const subscribers = [];
	    function set(new_value) {
	        if (safe_not_equal(value, new_value)) {
	            value = new_value;
	            if (stop) { // store is ready
	                const run_queue = !subscriber_queue.length;
	                for (let i = 0; i < subscribers.length; i += 1) {
	                    const s = subscribers[i];
	                    s[1]();
	                    subscriber_queue.push(s, value);
	                }
	                if (run_queue) {
	                    for (let i = 0; i < subscriber_queue.length; i += 2) {
	                        subscriber_queue[i][0](subscriber_queue[i + 1]);
	                    }
	                    subscriber_queue.length = 0;
	                }
	            }
	        }
	    }
	    function update(fn) {
	        set(fn(value));
	    }
	    function subscribe(run, invalidate = noop) {
	        const subscriber = [run, invalidate];
	        subscribers.push(subscriber);
	        if (subscribers.length === 1) {
	            stop = start(set) || noop;
	        }
	        run(value);
	        return () => {
	            const index = subscribers.indexOf(subscriber);
	            if (index !== -1) {
	                subscribers.splice(index, 1);
	            }
	            if (subscribers.length === 0) {
	                stop();
	                stop = null;
	            }
	        };
	    }
	    return { set, update, subscribe };
	}

	// FIXME: used only inside Button page for color two buttons
	const theme = writable('light');

	/* src\components\AppBar.svelte generated by Svelte v3.24.0 */

	const { Object: Object_1 } = globals;
	const file$b = "src\\components\\AppBar.svelte";

	// (2:1) <Button   icon   id="hamburger"   color="inherit"   on:click={() => {    leftPanelVisible = true;   }}  >
	function create_default_slot_6(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { path: menu }, $$inline: true });

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_6.name,
			type: "slot",
			source: "(2:1) <Button   icon   id=\\\"hamburger\\\"   color=\\\"inherit\\\"   on:click={() => {    leftPanelVisible = true;   }}  >",
			ctx
		});

		return block;
	}

	// (19:1) {#if !legacy}
	function create_if_block$7(ctx) {
		let button;
		let current;

		button = new Button({
				props: {
					icon: true,
					$$slots: { default: [create_default_slot_5] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		button.$on("click", /*click_handler_1*/ ctx[9]);

		const block = {
			c: function create() {
				create_component(button.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(button, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 32768) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(button, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$7.name,
			type: "if",
			source: "(19:1) {#if !legacy}",
			ctx
		});

		return block;
	}

	// (20:2) <Button icon on:click={() => setTheme($theme === 'dark' ? 'light' : 'dark')}>
	function create_default_slot_5(ctx) {
		let icon;
		let current;

		icon = new Icon({
				props: { path: invertColors },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_5.name,
			type: "slot",
			source: "(20:2) <Button icon on:click={() => setTheme($theme === 'dark' ? 'light' : 'dark')}>",
			ctx
		});

		return block;
	}

	// (39:3) <Button icon color="inherit">
	function create_default_slot_4(ctx) {
		let icon;
		let current;

		icon = new Icon({
				props: { path: moreVert },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_4.name,
			type: "slot",
			source: "(39:3) <Button icon color=\\\"inherit\\\">",
			ctx
		});

		return block;
	}

	// (38:2) <span slot="activator" style="margin-right: 6px;display:block;">
	function create_activator_slot(ctx) {
		let span;
		let button;
		let current;

		button = new Button({
				props: {
					icon: true,
					color: "inherit",
					$$slots: { default: [create_default_slot_4] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				span = element("span");
				create_component(button.$$.fragment);
				attr_dev(span, "slot", "activator");
				set_style(span, "margin-right", "6px");
				set_style(span, "display", "block");
				add_location(span, file$b, 37, 2, 1374);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				mount_component(button, span, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 32768) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(span);
				destroy_component(button);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_activator_slot.name,
			type: "slot",
			source: "(38:2) <span slot=\\\"activator\\\" style=\\\"margin-right: 6px;display:block;\\\">",
			ctx
		});

		return block;
	}

	// (43:2) <Menuitem disabled={legacy} on:click={(e) => setTheme(e.target.textContent)}>
	function create_default_slot_3(ctx) {
		let t_value = (/*$theme*/ ctx[5] === "dark" ? "Light" : "Dark") + "";
		let t;

		const block = {
			c: function create() {
				t = text(t_value);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*$theme*/ 32 && t_value !== (t_value = (/*$theme*/ ctx[5] === "dark" ? "Light" : "Dark") + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_3.name,
			type: "slot",
			source: "(43:2) <Menuitem disabled={legacy} on:click={(e) => setTheme(e.target.textContent)}>",
			ctx
		});

		return block;
	}

	// (46:2) <Menuitem    on:click={() => (rightPanelVisible = true)}    ripple={false}    title="Item Menu withowt Ripple"   >
	function create_default_slot_2(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text("Help");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_2.name,
			type: "slot",
			source: "(46:2) <Menuitem    on:click={() => (rightPanelVisible = true)}    ripple={false}    title=\\\"Item Menu withowt Ripple\\\"   >",
			ctx
		});

		return block;
	}

	// (54:2) <Menuitem    on:click={() => {     loginDialogVisible = true;    }}   >
	function create_default_slot_1(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text("Login");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1.name,
			type: "slot",
			source: "(54:2) <Menuitem    on:click={() => {     loginDialogVisible = true;    }}   >",
			ctx
		});

		return block;
	}

	// (37:1) <Menu style="border-radius: 4px;" origin="top right" dx="4" dy="4">
	function create_default_slot$1(ctx) {
		let t0;
		let menuitem0;
		let t1;
		let menuitem1;
		let t2;
		let hr;
		let t3;
		let menuitem2;
		let current;

		menuitem0 = new Menuitem({
				props: {
					disabled: /*legacy*/ ctx[4],
					$$slots: { default: [create_default_slot_3] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		menuitem0.$on("click", /*click_handler_2*/ ctx[10]);

		menuitem1 = new Menuitem({
				props: {
					ripple: false,
					title: "Item Menu withowt Ripple",
					$$slots: { default: [create_default_slot_2] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		menuitem1.$on("click", /*click_handler_3*/ ctx[11]);

		menuitem2 = new Menuitem({
				props: {
					$$slots: { default: [create_default_slot_1] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		menuitem2.$on("click", /*click_handler_4*/ ctx[12]);

		const block = {
			c: function create() {
				t0 = space();
				create_component(menuitem0.$$.fragment);
				t1 = space();
				create_component(menuitem1.$$.fragment);
				t2 = space();
				hr = element("hr");
				t3 = space();
				create_component(menuitem2.$$.fragment);
				add_location(hr, file$b, 52, 2, 1801);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t0, anchor);
				mount_component(menuitem0, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(menuitem1, target, anchor);
				insert_dev(target, t2, anchor);
				insert_dev(target, hr, anchor);
				insert_dev(target, t3, anchor);
				mount_component(menuitem2, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const menuitem0_changes = {};
				if (dirty & /*legacy*/ 16) menuitem0_changes.disabled = /*legacy*/ ctx[4];

				if (dirty & /*$$scope, $theme*/ 32800) {
					menuitem0_changes.$$scope = { dirty, ctx };
				}

				menuitem0.$set(menuitem0_changes);
				const menuitem1_changes = {};

				if (dirty & /*$$scope*/ 32768) {
					menuitem1_changes.$$scope = { dirty, ctx };
				}

				menuitem1.$set(menuitem1_changes);
				const menuitem2_changes = {};

				if (dirty & /*$$scope*/ 32768) {
					menuitem2_changes.$$scope = { dirty, ctx };
				}

				menuitem2.$set(menuitem2_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(menuitem0.$$.fragment, local);
				transition_in(menuitem1.$$.fragment, local);
				transition_in(menuitem2.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(menuitem0.$$.fragment, local);
				transition_out(menuitem1.$$.fragment, local);
				transition_out(menuitem2.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t0);
				destroy_component(menuitem0, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(menuitem1, detaching);
				if (detaching) detach_dev(t2);
				if (detaching) detach_dev(hr);
				if (detaching) detach_dev(t3);
				destroy_component(menuitem2, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$1.name,
			type: "slot",
			source: "(37:1) <Menu style=\\\"border-radius: 4px;\\\" origin=\\\"top right\\\" dx=\\\"4\\\" dy=\\\"4\\\">",
			ctx
		});

		return block;
	}

	function create_fragment$b(ctx) {
		let div1;
		let button;
		let t0;
		let a0;
		let icon0;
		let t1;
		let div0;
		let t3;
		let t4;
		let a1;
		let icon1;
		let t5;
		let menu_1;
		let current;

		button = new Button({
				props: {
					icon: true,
					id: "hamburger",
					color: "inherit",
					$$slots: { default: [create_default_slot_6] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		button.$on("click", /*click_handler*/ ctx[8]);
		icon0 = new Icon({ props: { path: home }, $$inline: true });
		let if_block = !/*legacy*/ ctx[4] && create_if_block$7(ctx);

		icon1 = new Icon({
				props: {
					path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577\n\t\t\t0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633\n\t\t\t17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809\n\t\t\t1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93\n\t\t\t0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267\n\t\t\t1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24\n\t\t\t2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81\n\t\t\t2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24\n\t\t\t12.297c0-6.627-5.373-12-12-12"
				},
				$$inline: true
			});

		menu_1 = new Menu({
				props: {
					style: "border-radius: 4px;",
					origin: "top right",
					dx: "4",
					dy: "4",
					$$slots: {
						default: [create_default_slot$1],
						activator: [create_activator_slot]
					},
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				div1 = element("div");
				create_component(button.$$.fragment);
				t0 = space();
				a0 = element("a");
				create_component(icon0.$$.fragment);
				t1 = space();
				div0 = element("div");
				div0.textContent = "Svelte-Leaflet Components";
				t3 = space();
				if (if_block) if_block.c();
				t4 = space();
				a1 = element("a");
				create_component(icon1.$$.fragment);
				t5 = space();
				create_component(menu_1.$$.fragment);
				attr_dev(a0, "id", "brand");
				attr_dev(a0, "class", "icon");
				attr_dev(a0, "href", "/home");
				add_location(a0, file$b, 12, 1, 180);
				attr_dev(div0, "class", "title svelte-rwyimb");
				add_location(div0, file$b, 16, 1, 252);
				attr_dev(a1, "class", "icon");
				attr_dev(a1, "target", "_blank");
				attr_dev(a1, "href", "https://github.com/OriginalSin/svelte-leaflet");
				add_location(a1, file$b, 23, 1, 451);
				attr_dev(div1, "class", "app-bar svelte-rwyimb");
				add_location(div1, file$b, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				mount_component(button, div1, null);
				append_dev(div1, t0);
				append_dev(div1, a0);
				mount_component(icon0, a0, null);
				append_dev(div1, t1);
				append_dev(div1, div0);
				append_dev(div1, t3);
				if (if_block) if_block.m(div1, null);
				append_dev(div1, t4);
				append_dev(div1, a1);
				mount_component(icon1, a1, null);
				append_dev(div1, t5);
				mount_component(menu_1, div1, null);
				/*div1_binding*/ ctx[13](div1);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 32768) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);

				if (!/*legacy*/ ctx[4]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*legacy*/ 16) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$7(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div1, t4);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				const menu_1_changes = {};

				if (dirty & /*$$scope, loginDialogVisible, rightPanelVisible, legacy, $theme*/ 32822) {
					menu_1_changes.$$scope = { dirty, ctx };
				}

				menu_1.$set(menu_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				transition_in(icon0.$$.fragment, local);
				transition_in(if_block);
				transition_in(icon1.$$.fragment, local);
				transition_in(menu_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				transition_out(icon0.$$.fragment, local);
				transition_out(if_block);
				transition_out(icon1.$$.fragment, local);
				transition_out(menu_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div1);
				destroy_component(button);
				destroy_component(icon0);
				if (if_block) if_block.d();
				destroy_component(icon1);
				destroy_component(menu_1);
				/*div1_binding*/ ctx[13](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$b.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$b($$self, $$props, $$invalidate) {
		let $theme;
		validate_store(theme, "theme");
		component_subscribe($$self, theme, $$value => $$invalidate(5, $theme = $$value));
		let { fade = false } = $$props;
		let { leftPanelVisible = false } = $$props;
		let { rightPanelVisible = false } = $$props;
		let { loginDialogVisible = false } = $$props;
		let el;
		let legacy = true;

		const darkTheme = {
			"--color": "#eee",
			"--alternate": "#000",
			"--bg-color": "#303134",
			"--primary": "#3ea6ff",
			"--accent": "#ff6fab",
			"--divider": "rgba(255,255,255,0.175)",
			"--bg-popover": "#3f3f3f",
			"--border": "#555",
			"--label": "rgba(255,255,255,0.5)",
			"--bg-input-filled": "rgba(255,255,255,0.1)",
			"--bg-app-bar": "#838383",
			"--bg-panel": "#434343"
		};

		onMount(async () => {
			try {
				$$invalidate(4, legacy = !(window.CSS && window.CSS.supports && window.CSS.supports("(--foo: red)")));
				let mql = window.matchMedia("(prefers-color-scheme: dark)");
				mql.matches && setTheme("dark");
			} catch(err) {
				
			} // eslint-disable-line
		});

		function setTheme(name) {
			name = name.replace(/\s/g, "").toLowerCase();
			set_store_value(theme, $theme = name);

			$theme === "dark"
			? Object.keys(darkTheme).map(key => {
					document.documentElement.style.setProperty(key, darkTheme[key]);
				})
			: document.documentElement.removeAttribute("style");
		}

		const writable_props = ["fade", "leftPanelVisible", "rightPanelVisible", "loginDialogVisible"];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AppBar> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("AppBar", $$slots, []);

		const click_handler = () => {
			$$invalidate(0, leftPanelVisible = true);
		};

		const click_handler_1 = () => setTheme($theme === "dark" ? "light" : "dark");
		const click_handler_2 = e => setTheme(e.target.textContent);
		const click_handler_3 = () => $$invalidate(1, rightPanelVisible = true);

		const click_handler_4 = () => {
			$$invalidate(2, loginDialogVisible = true);
		};

		function div1_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				el = $$value;
				($$invalidate(3, el), $$invalidate(7, fade));
			});
		}

		$$self.$set = $$props => {
			if ("fade" in $$props) $$invalidate(7, fade = $$props.fade);
			if ("leftPanelVisible" in $$props) $$invalidate(0, leftPanelVisible = $$props.leftPanelVisible);
			if ("rightPanelVisible" in $$props) $$invalidate(1, rightPanelVisible = $$props.rightPanelVisible);
			if ("loginDialogVisible" in $$props) $$invalidate(2, loginDialogVisible = $$props.loginDialogVisible);
		};

		$$self.$capture_state = () => ({
			fade,
			leftPanelVisible,
			rightPanelVisible,
			loginDialogVisible,
			onMount,
			Button,
			Icon,
			Menu,
			Menuitem,
			home,
			menu,
			invertColors,
			moreVert,
			theme,
			el,
			legacy,
			darkTheme,
			setTheme,
			$theme
		});

		$$self.$inject_state = $$props => {
			if ("fade" in $$props) $$invalidate(7, fade = $$props.fade);
			if ("leftPanelVisible" in $$props) $$invalidate(0, leftPanelVisible = $$props.leftPanelVisible);
			if ("rightPanelVisible" in $$props) $$invalidate(1, rightPanelVisible = $$props.rightPanelVisible);
			if ("loginDialogVisible" in $$props) $$invalidate(2, loginDialogVisible = $$props.loginDialogVisible);
			if ("el" in $$props) $$invalidate(3, el = $$props.el);
			if ("legacy" in $$props) $$invalidate(4, legacy = $$props.legacy);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*el, fade*/ 136) {
				 if (el) {
					fade
					? $$invalidate(3, el.style.boxShadow = "0 1px 2px 0 rgba(0,0,0,.2), 0 2px 6px 2px rgba(0,0,0,.18)", el)
					: $$invalidate(3, el.style.boxShadow = "", el);
				}
			}
		};

		return [
			leftPanelVisible,
			rightPanelVisible,
			loginDialogVisible,
			el,
			legacy,
			$theme,
			setTheme,
			fade,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			click_handler_4,
			div1_binding
		];
	}

	class AppBar extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$b, create_fragment$b, safe_not_equal, {
				fade: 7,
				leftPanelVisible: 0,
				rightPanelVisible: 1,
				loginDialogVisible: 2
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "AppBar",
				options,
				id: create_fragment$b.name
			});
		}

		get fade() {
			throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fade(value) {
			throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get leftPanelVisible() {
			throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set leftPanelVisible(value) {
			throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get rightPanelVisible() {
			throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set rightPanelVisible(value) {
			throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get loginDialogVisible() {
			throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set loginDialogVisible(value) {
			throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\nav\NavItem.svelte generated by Svelte v3.24.0 */

	const file$c = "src\\components\\nav\\NavItem.svelte";

	// (1:0) {#if path && name}
	function create_if_block$8(ctx) {
		let a;
		let t;
		let a_style_value;

		const block = {
			c: function create() {
				a = element("a");
				t = text(/*name*/ ctx[1]);
				attr_dev(a, "href", /*path*/ ctx[0]);
				attr_dev(a, "class", "nav-item svelte-1jsnnsq");
				attr_dev(a, "style", a_style_value = `padding-left: ${12 * /*level*/ ctx[3]}px;`);
				toggle_class(a, "active", /*active*/ ctx[2]);
				toggle_class(a, "dense", /*level*/ ctx[3] > 1);
				add_location(a, file$c, 1, 1, 20);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				append_dev(a, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*name*/ 2) set_data_dev(t, /*name*/ ctx[1]);

				if (dirty & /*path*/ 1) {
					attr_dev(a, "href", /*path*/ ctx[0]);
				}

				if (dirty & /*level*/ 8 && a_style_value !== (a_style_value = `padding-left: ${12 * /*level*/ ctx[3]}px;`)) {
					attr_dev(a, "style", a_style_value);
				}

				if (dirty & /*active*/ 4) {
					toggle_class(a, "active", /*active*/ ctx[2]);
				}

				if (dirty & /*level*/ 8) {
					toggle_class(a, "dense", /*level*/ ctx[3] > 1);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(a);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$8.name,
			type: "if",
			source: "(1:0) {#if path && name}",
			ctx
		});

		return block;
	}

	function create_fragment$c(ctx) {
		let if_block_anchor;
		let if_block = /*path*/ ctx[0] && /*name*/ ctx[1] && create_if_block$8(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, [dirty]) {
				if (/*path*/ ctx[0] && /*name*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$8(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$c.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$c($$self, $$props, $$invalidate) {
		let { path } = $$props;
		let { name } = $$props;
		let { active = false } = $$props;
		const writable_props = ["path", "name", "active"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavItem> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("NavItem", $$slots, []);

		$$self.$set = $$props => {
			if ("path" in $$props) $$invalidate(0, path = $$props.path);
			if ("name" in $$props) $$invalidate(1, name = $$props.name);
			if ("active" in $$props) $$invalidate(2, active = $$props.active);
		};

		$$self.$capture_state = () => ({ path, name, active, level });

		$$self.$inject_state = $$props => {
			if ("path" in $$props) $$invalidate(0, path = $$props.path);
			if ("name" in $$props) $$invalidate(1, name = $$props.name);
			if ("active" in $$props) $$invalidate(2, active = $$props.active);
			if ("level" in $$props) $$invalidate(3, level = $$props.level);
		};

		let level;

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*path*/ 1) {
				 $$invalidate(3, level = path.split("/").length - 1);
			}
		};

		return [path, name, active, level];
	}

	class NavItem extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$c, create_fragment$c, safe_not_equal, { path: 0, name: 1, active: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NavItem",
				options,
				id: create_fragment$c.name
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*path*/ ctx[0] === undefined && !("path" in props)) {
				console.warn("<NavItem> was created without expected prop 'path'");
			}

			if (/*name*/ ctx[1] === undefined && !("name" in props)) {
				console.warn("<NavItem> was created without expected prop 'name'");
			}
		}

		get path() {
			throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set path(value) {
			throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get name() {
			throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set name(value) {
			throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get active() {
			throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set active(value) {
			throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\nav\Nav.svelte generated by Svelte v3.24.0 */
	const file$d = "src\\components\\nav\\Nav.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[3] = list[i].path;
		child_ctx[4] = list[i].name;
		return child_ctx;
	}

	// (2:1) {#each routes as { path, name }}
	function create_each_block(ctx) {
		let navitem;
		let current;

		navitem = new NavItem({
				props: {
					path: /*path*/ ctx[3],
					name: /*name*/ ctx[4],
					active: /*currentPath*/ ctx[1] === /*path*/ ctx[3]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(navitem.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(navitem, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const navitem_changes = {};
				if (dirty & /*routes*/ 1) navitem_changes.path = /*path*/ ctx[3];
				if (dirty & /*routes*/ 1) navitem_changes.name = /*name*/ ctx[4];
				if (dirty & /*currentPath, routes*/ 3) navitem_changes.active = /*currentPath*/ ctx[1] === /*path*/ ctx[3];
				navitem.$set(navitem_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(navitem.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(navitem.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(navitem, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(2:1) {#each routes as { path, name }}",
			ctx
		});

		return block;
	}

	function create_fragment$d(ctx) {
		let nav;
		let current;
		let mounted;
		let dispose;
		let each_value = /*routes*/ ctx[0];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				nav = element("nav");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(nav, "class", "svelte-143rmkk");
				add_location(nav, file$d, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, nav, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(nav, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(nav, "click", /*click_handler*/ ctx[2], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*routes, currentPath*/ 3) {
					each_value = /*routes*/ ctx[0];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(nav, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(nav);
				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$d.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$d($$self, $$props, $$invalidate) {
		let { routes = [] } = $$props;
		let { currentPath = "" } = $$props;
		const writable_props = ["routes", "currentPath"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Nav", $$slots, []);

		function click_handler(event) {
			bubble($$self, event);
		}

		$$self.$set = $$props => {
			if ("routes" in $$props) $$invalidate(0, routes = $$props.routes);
			if ("currentPath" in $$props) $$invalidate(1, currentPath = $$props.currentPath);
		};

		$$self.$capture_state = () => ({ routes, currentPath, NavItem });

		$$self.$inject_state = $$props => {
			if ("routes" in $$props) $$invalidate(0, routes = $$props.routes);
			if ("currentPath" in $$props) $$invalidate(1, currentPath = $$props.currentPath);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [routes, currentPath, click_handler];
	}

	class Nav extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$d, create_fragment$d, safe_not_equal, { routes: 0, currentPath: 1 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Nav",
				options,
				id: create_fragment$d.name
			});
		}

		get routes() {
			throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set routes(value) {
			throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get currentPath() {
			throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set currentPath(value) {
			throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\LeftPanel.svelte generated by Svelte v3.24.0 */
	const file$e = "src\\components\\LeftPanel.svelte";

	// (3:2) <Button    icon    color="inherit"    on:click={() => {     visible = false;    }}   >
	function create_default_slot_1$1(ctx) {
		let icon;
		let current;

		icon = new Icon({
				props: { path: arrowBack },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$1.name,
			type: "slot",
			source: "(3:2) <Button    icon    color=\\\"inherit\\\"    on:click={() => {     visible = false;    }}   >",
			ctx
		});

		return block;
	}

	// (1:0) <Sidepanel bind:visible disableScroll>
	function create_default_slot$2(ctx) {
		let div0;
		let button;
		let t0;
		let span;
		let t2;
		let div1;
		let nav;
		let current;

		button = new Button({
				props: {
					icon: true,
					color: "inherit",
					$$slots: { default: [create_default_slot_1$1] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		button.$on("click", /*click_handler*/ ctx[3]);

		nav = new Nav({
				props: {
					routes: /*sitenav*/ ctx[2],
					currentPath: /*currentPath*/ ctx[1]
				},
				$$inline: true
			});

		nav.$on("click", /*click_handler_1*/ ctx[4]);

		const block = {
			c: function create() {
				div0 = element("div");
				create_component(button.$$.fragment);
				t0 = space();
				span = element("span");
				span.textContent = "Logo";
				t2 = space();
				div1 = element("div");
				create_component(nav.$$.fragment);
				set_style(span, "margin-left", "4px");
				add_location(span, file$e, 11, 2, 191);
				attr_dev(div0, "class", "logo svelte-1pw4vtv");
				add_location(div0, file$e, 1, 1, 40);
				set_style(div1, "padding", "8px 0");
				add_location(div1, file$e, 14, 1, 244);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				mount_component(button, div0, null);
				append_dev(div0, t0);
				append_dev(div0, span);
				insert_dev(target, t2, anchor);
				insert_dev(target, div1, anchor);
				mount_component(nav, div1, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 64) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
				const nav_changes = {};
				if (dirty & /*sitenav*/ 4) nav_changes.routes = /*sitenav*/ ctx[2];
				if (dirty & /*currentPath*/ 2) nav_changes.currentPath = /*currentPath*/ ctx[1];
				nav.$set(nav_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				transition_in(nav.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				transition_out(nav.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
				destroy_component(button);
				if (detaching) detach_dev(t2);
				if (detaching) detach_dev(div1);
				destroy_component(nav);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$2.name,
			type: "slot",
			source: "(1:0) <Sidepanel bind:visible disableScroll>",
			ctx
		});

		return block;
	}

	function create_fragment$e(ctx) {
		let sidepanel;
		let updating_visible;
		let current;

		function sidepanel_visible_binding(value) {
			/*sidepanel_visible_binding*/ ctx[5].call(null, value);
		}

		let sidepanel_props = {
			disableScroll: true,
			$$slots: { default: [create_default_slot$2] },
			$$scope: { ctx }
		};

		if (/*visible*/ ctx[0] !== void 0) {
			sidepanel_props.visible = /*visible*/ ctx[0];
		}

		sidepanel = new Sidepanel({ props: sidepanel_props, $$inline: true });
		binding_callbacks.push(() => bind(sidepanel, "visible", sidepanel_visible_binding));

		const block = {
			c: function create() {
				create_component(sidepanel.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(sidepanel, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const sidepanel_changes = {};

				if (dirty & /*$$scope, sitenav, currentPath, visible*/ 71) {
					sidepanel_changes.$$scope = { dirty, ctx };
				}

				if (!updating_visible && dirty & /*visible*/ 1) {
					updating_visible = true;
					sidepanel_changes.visible = /*visible*/ ctx[0];
					add_flush_callback(() => updating_visible = false);
				}

				sidepanel.$set(sidepanel_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(sidepanel.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(sidepanel.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(sidepanel, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$e.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$e($$self, $$props, $$invalidate) {
		let { visible = false } = $$props;
		let { currentPath = "" } = $$props;
		let { sitenav = [] } = $$props;
		const writable_props = ["visible", "currentPath", "sitenav"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LeftPanel> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("LeftPanel", $$slots, []);

		const click_handler = () => {
			$$invalidate(0, visible = false);
		};

		const click_handler_1 = () => {
			$$invalidate(0, visible = false);
		};

		function sidepanel_visible_binding(value) {
			visible = value;
			$$invalidate(0, visible);
		}

		$$self.$set = $$props => {
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("currentPath" in $$props) $$invalidate(1, currentPath = $$props.currentPath);
			if ("sitenav" in $$props) $$invalidate(2, sitenav = $$props.sitenav);
		};

		$$self.$capture_state = () => ({
			visible,
			currentPath,
			sitenav,
			Button,
			Icon,
			Sidepanel,
			arrowBack,
			Nav
		});

		$$self.$inject_state = $$props => {
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("currentPath" in $$props) $$invalidate(1, currentPath = $$props.currentPath);
			if ("sitenav" in $$props) $$invalidate(2, sitenav = $$props.sitenav);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			visible,
			currentPath,
			sitenav,
			click_handler,
			click_handler_1,
			sidepanel_visible_binding
		];
	}

	class LeftPanel extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$e, create_fragment$e, safe_not_equal, { visible: 0, currentPath: 1, sitenav: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "LeftPanel",
				options,
				id: create_fragment$e.name
			});
		}

		get visible() {
			throw new Error("<LeftPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set visible(value) {
			throw new Error("<LeftPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get currentPath() {
			throw new Error("<LeftPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set currentPath(value) {
			throw new Error("<LeftPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get sitenav() {
			throw new Error("<LeftPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set sitenav(value) {
			throw new Error("<LeftPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\RightPanel.svelte generated by Svelte v3.24.0 */
	const file$f = "src\\components\\RightPanel.svelte";

	// (1:0) <Sidepanel right bind:visible>
	function create_default_slot$3(ctx) {
		let div;
		let t1;
		let p;
		let i;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = "Help";
				t1 = space();
				p = element("p");
				i = element("i");
				i.textContent = "Blank";
				attr_dev(div, "class", "logo svelte-1pw4vtv");
				set_style(div, "padding-left", "1rem");
				add_location(div, file$f, 1, 1, 32);
				set_style(i, "padding", "12px");
				add_location(i, file$f, 3, 2, 96);
				add_location(p, file$f, 2, 1, 90);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, p, anchor);
				append_dev(p, i);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (detaching) detach_dev(t1);
				if (detaching) detach_dev(p);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$3.name,
			type: "slot",
			source: "(1:0) <Sidepanel right bind:visible>",
			ctx
		});

		return block;
	}

	function create_fragment$f(ctx) {
		let sidepanel;
		let updating_visible;
		let current;

		function sidepanel_visible_binding(value) {
			/*sidepanel_visible_binding*/ ctx[1].call(null, value);
		}

		let sidepanel_props = {
			right: true,
			$$slots: { default: [create_default_slot$3] },
			$$scope: { ctx }
		};

		if (/*visible*/ ctx[0] !== void 0) {
			sidepanel_props.visible = /*visible*/ ctx[0];
		}

		sidepanel = new Sidepanel({ props: sidepanel_props, $$inline: true });
		binding_callbacks.push(() => bind(sidepanel, "visible", sidepanel_visible_binding));

		const block = {
			c: function create() {
				create_component(sidepanel.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(sidepanel, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const sidepanel_changes = {};

				if (dirty & /*$$scope*/ 4) {
					sidepanel_changes.$$scope = { dirty, ctx };
				}

				if (!updating_visible && dirty & /*visible*/ 1) {
					updating_visible = true;
					sidepanel_changes.visible = /*visible*/ ctx[0];
					add_flush_callback(() => updating_visible = false);
				}

				sidepanel.$set(sidepanel_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(sidepanel.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(sidepanel.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(sidepanel, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$f.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$f($$self, $$props, $$invalidate) {
		let { visible = false } = $$props;
		const writable_props = ["visible"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RightPanel> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("RightPanel", $$slots, []);

		function sidepanel_visible_binding(value) {
			visible = value;
			$$invalidate(0, visible);
		}

		$$self.$set = $$props => {
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
		};

		$$self.$capture_state = () => ({ visible, Sidepanel });

		$$self.$inject_state = $$props => {
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [visible, sidepanel_visible_binding];
	}

	class RightPanel extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$f, create_fragment$f, safe_not_equal, { visible: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "RightPanel",
				options,
				id: create_fragment$f.name
			});
		}

		get visible() {
			throw new Error("<RightPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set visible(value) {
			throw new Error("<RightPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\LoginDialog.svelte generated by Svelte v3.24.0 */
	const file$g = "src\\components\\LoginDialog.svelte";

	// (2:1) <div slot="title">
	function create_title_slot(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = " Welcome!";
				attr_dev(div, "slot", "title");
				add_location(div, file$g, 1, 1, 35);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_title_slot.name,
			type: "slot",
			source: "(2:1) <div slot=\\\"title\\\">",
			ctx
		});

		return block;
	}

	// (23:2) <Button color="primary" disabled>
	function create_default_slot_1$2(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text("Submit");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$2.name,
			type: "slot",
			source: "(23:2) <Button color=\\\"primary\\\" disabled>",
			ctx
		});

		return block;
	}

	// (22:1) <div slot="actions" class="actions center">
	function create_actions_slot(ctx) {
		let div;
		let button;
		let current;

		button = new Button({
				props: {
					color: "primary",
					disabled: true,
					$$slots: { default: [create_default_slot_1$2] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				create_component(button.$$.fragment);
				attr_dev(div, "slot", "actions");
				attr_dev(div, "class", "actions center");
				add_location(div, file$g, 21, 1, 364);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(button, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 64) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(button);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_actions_slot.name,
			type: "slot",
			source: "(22:1) <div slot=\\\"actions\\\" class=\\\"actions center\\\">",
			ctx
		});

		return block;
	}

	// (26:1) <div slot="footer" class="footer">
	function create_footer_slot(ctx) {
		let div;
		let t0;
		let a;

		const block = {
			c: function create() {
				div = element("div");
				t0 = text("Don't have account?\n\t\t");
				a = element("a");
				a.textContent = "Sing Up";
				attr_dev(a, "href", "/singup");
				attr_dev(a, "class", "disabled svelte-1f8j828");
				add_location(a, file$g, 27, 2, 528);
				attr_dev(div, "slot", "footer");
				attr_dev(div, "class", "footer svelte-1f8j828");
				add_location(div, file$g, 25, 1, 469);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t0);
				append_dev(div, a);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_footer_slot.name,
			type: "slot",
			source: "(26:1) <div slot=\\\"footer\\\" class=\\\"footer\\\">",
			ctx
		});

		return block;
	}

	// (1:0) <Dialog width="290" bind:visible>
	function create_default_slot$4(ctx) {
		let t0;
		let textfield0;
		let updating_value;
		let t1;
		let textfield1;
		let updating_value_1;
		let t2;
		let t3;
		let current;

		function textfield0_value_binding(value) {
			/*textfield0_value_binding*/ ctx[3].call(null, value);
		}

		let textfield0_props = {
			name: "username",
			autocomplete: "off",
			required: true,
			label: "username",
			message: "Your account name"
		};

		if (/*username*/ ctx[1] !== void 0) {
			textfield0_props.value = /*username*/ ctx[1];
		}

		textfield0 = new Textfield({ props: textfield0_props, $$inline: true });
		binding_callbacks.push(() => bind(textfield0, "value", textfield0_value_binding));

		function textfield1_value_binding(value) {
			/*textfield1_value_binding*/ ctx[4].call(null, value);
		}

		let textfield1_props = {
			type: "password",
			name: "password",
			autocomplete: "off",
			required: true,
			label: "password",
			message: "Your password"
		};

		if (/*password*/ ctx[2] !== void 0) {
			textfield1_props.value = /*password*/ ctx[2];
		}

		textfield1 = new Textfield({ props: textfield1_props, $$inline: true });
		binding_callbacks.push(() => bind(textfield1, "value", textfield1_value_binding));

		const block = {
			c: function create() {
				t0 = space();
				create_component(textfield0.$$.fragment);
				t1 = space();
				create_component(textfield1.$$.fragment);
				t2 = space();
				t3 = space();
			},
			m: function mount(target, anchor) {
				insert_dev(target, t0, anchor);
				mount_component(textfield0, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(textfield1, target, anchor);
				insert_dev(target, t2, anchor);
				insert_dev(target, t3, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const textfield0_changes = {};

				if (!updating_value && dirty & /*username*/ 2) {
					updating_value = true;
					textfield0_changes.value = /*username*/ ctx[1];
					add_flush_callback(() => updating_value = false);
				}

				textfield0.$set(textfield0_changes);
				const textfield1_changes = {};

				if (!updating_value_1 && dirty & /*password*/ 4) {
					updating_value_1 = true;
					textfield1_changes.value = /*password*/ ctx[2];
					add_flush_callback(() => updating_value_1 = false);
				}

				textfield1.$set(textfield1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(textfield0.$$.fragment, local);
				transition_in(textfield1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(textfield0.$$.fragment, local);
				transition_out(textfield1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t0);
				destroy_component(textfield0, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(textfield1, detaching);
				if (detaching) detach_dev(t2);
				if (detaching) detach_dev(t3);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$4.name,
			type: "slot",
			source: "(1:0) <Dialog width=\\\"290\\\" bind:visible>",
			ctx
		});

		return block;
	}

	function create_fragment$g(ctx) {
		let dialog;
		let updating_visible;
		let current;

		function dialog_visible_binding(value) {
			/*dialog_visible_binding*/ ctx[5].call(null, value);
		}

		let dialog_props = {
			width: "290",
			$$slots: {
				default: [create_default_slot$4],
				footer: [create_footer_slot],
				actions: [create_actions_slot],
				title: [create_title_slot]
			},
			$$scope: { ctx }
		};

		if (/*visible*/ ctx[0] !== void 0) {
			dialog_props.visible = /*visible*/ ctx[0];
		}

		dialog = new Dialog({ props: dialog_props, $$inline: true });
		binding_callbacks.push(() => bind(dialog, "visible", dialog_visible_binding));

		const block = {
			c: function create() {
				create_component(dialog.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(dialog, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const dialog_changes = {};

				if (dirty & /*$$scope, password, username*/ 70) {
					dialog_changes.$$scope = { dirty, ctx };
				}

				if (!updating_visible && dirty & /*visible*/ 1) {
					updating_visible = true;
					dialog_changes.visible = /*visible*/ ctx[0];
					add_flush_callback(() => updating_visible = false);
				}

				dialog.$set(dialog_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(dialog.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(dialog.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(dialog, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$g.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$g($$self, $$props, $$invalidate) {
		let { visible = false } = $$props;
		let { username = "" } = $$props;
		let { password = "" } = $$props;
		const writable_props = ["visible", "username", "password"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoginDialog> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("LoginDialog", $$slots, []);

		function textfield0_value_binding(value) {
			username = value;
			$$invalidate(1, username);
		}

		function textfield1_value_binding(value) {
			password = value;
			$$invalidate(2, password);
		}

		function dialog_visible_binding(value) {
			visible = value;
			$$invalidate(0, visible);
		}

		$$self.$set = $$props => {
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("username" in $$props) $$invalidate(1, username = $$props.username);
			if ("password" in $$props) $$invalidate(2, password = $$props.password);
		};

		$$self.$capture_state = () => ({
			visible,
			username,
			password,
			Dialog,
			Textfield,
			Button
		});

		$$self.$inject_state = $$props => {
			if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
			if ("username" in $$props) $$invalidate(1, username = $$props.username);
			if ("password" in $$props) $$invalidate(2, password = $$props.password);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			visible,
			username,
			password,
			textfield0_value_binding,
			textfield1_value_binding,
			dialog_visible_binding
		];
	}

	class LoginDialog extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$g, create_fragment$g, safe_not_equal, { visible: 0, username: 1, password: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "LoginDialog",
				options,
				id: create_fragment$g.name
			});
		}

		get visible() {
			throw new Error("<LoginDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set visible(value) {
			throw new Error("<LoginDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get username() {
			throw new Error("<LoginDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set username(value) {
			throw new Error("<LoginDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get password() {
			throw new Error("<LoginDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set password(value) {
			throw new Error("<LoginDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	var introduction = "<h3 id=\"introduction\">Introduction</h3>\n<p><strong><code>svelte-leaflet</code></strong> is a set of the lightweight (~30 KB minzipped) LeafletJS components for <a href=\"https://svelte.dev\">Svelte</a>, inspired by <a href=\"https://leafletjs.com/\">Leaflet</a> - open-source JavaScript library for mobile-friendly interactive maps</p>\n";

	var quickStart = "<h3 id=\"quick-start-with-new-project\">Quick start with new project</h3>\n<p><em>Note that you will need to have <a href=\"https://nodejs.org\">Node.js</a> installed</em></p>\n<p>Create a new project based on <a href=\"https://github.com/sveltejs/template\">sveltejs/template</a></p>\n<pre><code class=\"language-bash\">npx degit sveltejs/template svelte-app\n<span class=\"hljs-built_in\">cd</span> svelte-app\nnpm install</code></pre>\n<p>Add components</p>\n<pre><code class=\"language-bash\">npm install --save-dev svelte-leaflet</code></pre>\n<p>Modify file <code>src/App.svelte</code> in the following way</p>\n<pre><code class=\"language-html\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Map</span>&gt;</span>\n    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">TileLayer</span>\n        <span class=\"hljs-attr\">urlTemplate</span>=<span class=\"hljs-string\">\"\"</span>\n        <span class=\"hljs-attr\">options</span>=<span class=\"hljs-string\">{{</span>\n            <span class=\"hljs-attr\">minZoom:</span> <span class=\"hljs-attr\">2</span>,\n            <span class=\"hljs-attr\">errorTileUrl:</span> ''\n        }}\n    /&gt;</span>\n<span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">Map</span>&gt;</span></code></pre>\n<p>...then start <a href=\"https://rollupjs.org/\">Rollup</a></p>\n<pre><code class=\"language-bash\">npm run dev</code></pre>\n<p>Navigate to <a href=\"http://localhost:5000\">localhost:5000</a></p>\n<p><em>NOTE: In real applications, you have to add global styles to <code>disabled</code> states</em></p>\n<pre><code class=\"language-css\">    <span class=\"hljs-selector-class\">.disabled</span>,\n    <span class=\"hljs-selector-attr\">[disabled]</span> {\n        <span class=\"hljs-attribute\">opacity</span>: <span class=\"hljs-number\">0.5</span>;\n        <span class=\"hljs-attribute\">pointer-events</span>: none;\n    }\n\n    <span class=\"hljs-selector-class\">.disabled</span> <span class=\"hljs-selector-class\">.disabled</span>,\n    <span class=\"hljs-selector-class\">.disabled</span> <span class=\"hljs-selector-attr\">[disabled]</span>,\n    <span class=\"hljs-selector-attr\">[disabled]</span> <span class=\"hljs-selector-class\">.disabled</span>,\n    <span class=\"hljs-selector-attr\">[disabled]</span> <span class=\"hljs-selector-attr\">[disabled]</span> {\n        <span class=\"hljs-attribute\">opacity</span>: <span class=\"hljs-number\">1</span>;\n    }</code></pre>\n";

	var byExample = "<h3 id=\"get-started-with-an-example\">Get started with an example</h3>\n<p>Clone repo <a href=\"https://github.com/OriginalSin/svelte-leaflet.git\">OriginalSin/svelte-leaflet</a></p>\n<pre><code class=\"language-bash\">git <span class=\"hljs-built_in\">clone</span> https://github.com/OriginalSin/svelte-leaflet.git</code></pre>\n<p>Then explore the <strong>example</strong></p>\n<pre><code class=\"language-bash\"><span class=\"hljs-built_in\">cd</span> svelte-leaflet/example\nnpm install\nnpm run dev</code></pre>\n<p>Navigate to <a href=\"http://localhost:5000\">localhost:5000</a></p>\n";

	/* src\pages\home\Home.svelte generated by Svelte v3.24.0 */
	const file$h = "src\\pages\\home\\Home.svelte";

	function create_fragment$h(ctx) {
		let div;
		let p0;
		let em;
		let t1;
		let p1;
		let t3;
		let section;
		let html_tag;
		let t4;
		let html_tag_1;
		let t5;
		let html_tag_2;

		const block = {
			c: function create() {
				div = element("div");
				p0 = element("p");
				em = element("em");
				em.textContent = "WARNING";
				t1 = space();
				p1 = element("p");
				p1.textContent = "This is a demo of work in progress...";
				t3 = space();
				section = element("section");
				t4 = space();
				t5 = space();
				add_location(em, file$h, 2, 2, 29);
				add_location(p0, file$h, 1, 1, 23);
				add_location(p1, file$h, 4, 1, 53);
				attr_dev(div, "class", "warning svelte-1dpkrol");
				add_location(div, file$h, 0, 0, 0);
				html_tag = new HtmlTag(t4);
				html_tag_1 = new HtmlTag(t5);
				html_tag_2 = new HtmlTag(null);
				attr_dev(section, "class", "svelte-1dpkrol");
				add_location(section, file$h, 7, 0, 106);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, p0);
				append_dev(p0, em);
				append_dev(div, t1);
				append_dev(div, p1);
				insert_dev(target, t3, anchor);
				insert_dev(target, section, anchor);
				html_tag.m(introduction, section);
				append_dev(section, t4);
				html_tag_1.m(quickStart, section);
				append_dev(section, t5);
				html_tag_2.m(byExample, section);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (detaching) detach_dev(t3);
				if (detaching) detach_dev(section);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$h.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$h($$self, $$props, $$invalidate) {
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Home", $$slots, []);
		$$self.$capture_state = () => ({ introduction, quickStart, byExample });
		return [];
	}

	class Home extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Home",
				options,
				id: create_fragment$h.name
			});
		}
	}

	/* src\components\demo\DemoPanel.svelte generated by Svelte v3.24.0 */
	const file$i = "src\\components\\demo\\DemoPanel.svelte";
	const get_result_slot_changes = dirty => ({});
	const get_result_slot_context = ctx => ({});
	const get_action_slot_changes = dirty => ({});
	const get_action_slot_context = ctx => ({});
	const get_code_slot_changes = dirty => ({});
	const get_code_slot_context = ctx => ({});

	// (4:2) <Button icon title="Code" color="inherit" on:click={() => (codeVisible = !codeVisible)}>
	function create_default_slot$5(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { path: code }, $$inline: true });

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$5.name,
			type: "slot",
			source: "(4:2) <Button icon title=\\\"Code\\\" color=\\\"inherit\\\" on:click={() => (codeVisible = !codeVisible)}>",
			ctx
		});

		return block;
	}

	// (9:1) {#if codeVisible}
	function create_if_block$9(ctx) {
		let div;
		let div_transition;
		let current;
		const code_slot_template = /*$$slots*/ ctx[1].code;
		const code_slot = create_slot(code_slot_template, ctx, /*$$scope*/ ctx[3], get_code_slot_context);
		const code_slot_or_fallback = code_slot || fallback_block$1(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (code_slot_or_fallback) code_slot_or_fallback.c();
				attr_dev(div, "class", "hljs code svelte-1rdh1dq");
				add_location(div, file$i, 9, 2, 242);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (code_slot_or_fallback) {
					code_slot_or_fallback.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (code_slot) {
					if (code_slot.p && dirty & /*$$scope*/ 8) {
						update_slot(code_slot, code_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_code_slot_changes, get_code_slot_context);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(code_slot_or_fallback, local);

				add_render_callback(() => {
					if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
					div_transition.run(1);
				});

				current = true;
			},
			o: function outro(local) {
				transition_out(code_slot_or_fallback, local);
				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
				div_transition.run(0);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (code_slot_or_fallback) code_slot_or_fallback.d(detaching);
				if (detaching && div_transition) div_transition.end();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$9.name,
			type: "if",
			source: "(9:1) {#if codeVisible}",
			ctx
		});

		return block;
	}

	// (11:21) Not have code yet
	function fallback_block$1(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text("Not have code yet");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block$1.name,
			type: "fallback",
			source: "(11:21) Not have code yet",
			ctx
		});

		return block;
	}

	function create_fragment$i(ctx) {
		let div2;
		let div0;
		let span;
		let t1;
		let button;
		let t2;
		let t3;
		let div1;
		let t4;
		let t5;
		let current;

		button = new Button({
				props: {
					icon: true,
					title: "Code",
					color: "inherit",
					$$slots: { default: [create_default_slot$5] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		button.$on("click", /*click_handler*/ ctx[2]);
		let if_block = /*codeVisible*/ ctx[0] && create_if_block$9(ctx);
		const default_slot_template = /*$$slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
		const action_slot_template = /*$$slots*/ ctx[1].action;
		const action_slot = create_slot(action_slot_template, ctx, /*$$scope*/ ctx[3], get_action_slot_context);
		const result_slot_template = /*$$slots*/ ctx[1].result;
		const result_slot = create_slot(result_slot_template, ctx, /*$$scope*/ ctx[3], get_result_slot_context);

		const block = {
			c: function create() {
				div2 = element("div");
				div0 = element("div");
				span = element("span");
				span.textContent = "Example";
				t1 = space();
				create_component(button.$$.fragment);
				t2 = space();
				if (if_block) if_block.c();
				t3 = space();
				div1 = element("div");
				if (default_slot) default_slot.c();
				t4 = space();
				if (action_slot) action_slot.c();
				t5 = space();
				if (result_slot) result_slot.c();
				attr_dev(span, "class", "title svelte-1rdh1dq");
				add_location(span, file$i, 2, 2, 50);
				attr_dev(div0, "class", "toolbar svelte-1rdh1dq");
				add_location(div0, file$i, 1, 1, 26);
				attr_dev(div1, "class", "demo svelte-1rdh1dq");
				add_location(div1, file$i, 14, 1, 347);
				attr_dev(div2, "class", "demo-panel svelte-1rdh1dq");
				add_location(div2, file$i, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div0);
				append_dev(div0, span);
				append_dev(div0, t1);
				mount_component(button, div0, null);
				append_dev(div2, t2);
				if (if_block) if_block.m(div2, null);
				append_dev(div2, t3);
				append_dev(div2, div1);

				if (default_slot) {
					default_slot.m(div1, null);
				}

				append_dev(div1, t4);

				if (action_slot) {
					action_slot.m(div1, null);
				}

				append_dev(div2, t5);

				if (result_slot) {
					result_slot.m(div2, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 8) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);

				if (/*codeVisible*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*codeVisible*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$9(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div2, t3);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 8) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
					}
				}

				if (action_slot) {
					if (action_slot.p && dirty & /*$$scope*/ 8) {
						update_slot(action_slot, action_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_action_slot_changes, get_action_slot_context);
					}
				}

				if (result_slot) {
					if (result_slot.p && dirty & /*$$scope*/ 8) {
						update_slot(result_slot, result_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_result_slot_changes, get_result_slot_context);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				transition_in(if_block);
				transition_in(default_slot, local);
				transition_in(action_slot, local);
				transition_in(result_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				transition_out(if_block);
				transition_out(default_slot, local);
				transition_out(action_slot, local);
				transition_out(result_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div2);
				destroy_component(button);
				if (if_block) if_block.d();
				if (default_slot) default_slot.d(detaching);
				if (action_slot) action_slot.d(detaching);
				if (result_slot) result_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$i.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$i($$self, $$props, $$invalidate) {
		let codeVisible = false;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DemoPanel> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("DemoPanel", $$slots, ['code','default','action','result']);
		const click_handler = () => $$invalidate(0, codeVisible = !codeVisible);

		$$self.$set = $$props => {
			if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({ slide, Button, Icon, code, codeVisible });

		$$self.$inject_state = $$props => {
			if ("codeVisible" in $$props) $$invalidate(0, codeVisible = $$props.codeVisible);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [codeVisible, $$slots, click_handler, $$scope];
	}

	class DemoPanel extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "DemoPanel",
				options,
				id: create_fragment$i.name
			});
		}
	}

	/* src\components\demo\Description.svelte generated by Svelte v3.24.0 */

	const file$j = "src\\components\\demo\\Description.svelte";

	function create_fragment$j(ctx) {
		let section;
		let h3;
		let t1;
		let current;
		const default_slot_template = /*$$slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		const block = {
			c: function create() {
				section = element("section");
				h3 = element("h3");
				h3.textContent = "Description";
				t1 = space();
				if (default_slot) default_slot.c();
				add_location(h3, file$j, 1, 1, 11);
				attr_dev(section, "class", "svelte-1he8gwt");
				add_location(section, file$j, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				append_dev(section, h3);
				append_dev(section, t1);

				if (default_slot) {
					default_slot.m(section, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 1) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(section);
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$j.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$j($$self, $$props, $$invalidate) {
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Description> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Description", $$slots, ['default']);

		$$self.$set = $$props => {
			if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
		};

		return [$$scope, $$slots];
	}

	class Description extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Description",
				options,
				id: create_fragment$j.name
			});
		}
	}

	/* src\components\demo\Properties.svelte generated by Svelte v3.24.0 */

	const file$k = "src\\components\\demo\\Properties.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (10:2) {#each data as item}
	function create_each_block$1(ctx) {
		let tr;
		let td0;
		let code;
		let t0_value = /*item*/ ctx[1].name + "";
		let t0;
		let t1;
		let small;
		let t2_value = /*item*/ ctx[1].type + "";
		let t2;
		let t3;
		let td1;
		let raw_value = /*item*/ ctx[1].desc + "";
		let t4;
		let td2;
		let strong;
		let t5_value = /*item*/ ctx[1].def + "";
		let t5;
		let t6;

		const block = {
			c: function create() {
				tr = element("tr");
				td0 = element("td");
				code = element("code");
				t0 = text(t0_value);
				t1 = space();
				small = element("small");
				t2 = text(t2_value);
				t3 = space();
				td1 = element("td");
				t4 = space();
				td2 = element("td");
				strong = element("strong");
				t5 = text(t5_value);
				t6 = space();
				attr_dev(code, "class", "svelte-15xn5ym");
				add_location(code, file$k, 12, 5, 176);
				attr_dev(small, "class", "svelte-15xn5ym");
				add_location(small, file$k, 13, 5, 206);
				attr_dev(td0, "class", "svelte-15xn5ym");
				add_location(td0, file$k, 11, 4, 166);
				attr_dev(td1, "class", "svelte-15xn5ym");
				add_location(td1, file$k, 15, 4, 247);
				add_location(strong, file$k, 19, 5, 299);
				attr_dev(td2, "class", "svelte-15xn5ym");
				add_location(td2, file$k, 18, 4, 289);
				attr_dev(tr, "class", "svelte-15xn5ym");
				add_location(tr, file$k, 10, 3, 157);
			},
			m: function mount(target, anchor) {
				insert_dev(target, tr, anchor);
				append_dev(tr, td0);
				append_dev(td0, code);
				append_dev(code, t0);
				append_dev(td0, t1);
				append_dev(td0, small);
				append_dev(small, t2);
				append_dev(tr, t3);
				append_dev(tr, td1);
				td1.innerHTML = raw_value;
				append_dev(tr, t4);
				append_dev(tr, td2);
				append_dev(td2, strong);
				append_dev(strong, t5);
				append_dev(tr, t6);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*item*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
				if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*item*/ ctx[1].type + "")) set_data_dev(t2, t2_value);
				if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*item*/ ctx[1].desc + "")) td1.innerHTML = raw_value;			if (dirty & /*data*/ 1 && t5_value !== (t5_value = /*item*/ ctx[1].def + "")) set_data_dev(t5, t5_value);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(tr);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(10:2) {#each data as item}",
			ctx
		});

		return block;
	}

	function create_fragment$k(ctx) {
		let h4;
		let t1;
		let div;
		let table;
		let tr;
		let th0;
		let t3;
		let th1;
		let t5;
		let th2;
		let t7;
		let each_value = /*data*/ ctx[0];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				h4 = element("h4");
				h4.textContent = "Properties";
				t1 = space();
				div = element("div");
				table = element("table");
				tr = element("tr");
				th0 = element("th");
				th0.textContent = "Name";
				t3 = space();
				th1 = element("th");
				th1.textContent = "Description";
				t5 = space();
				th2 = element("th");
				th2.textContent = "Default";
				t7 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				add_location(h4, file$k, 0, 0, 0);
				attr_dev(th0, "class", "svelte-15xn5ym");
				add_location(th0, file$k, 5, 3, 65);
				attr_dev(th1, "class", "svelte-15xn5ym");
				add_location(th1, file$k, 6, 3, 82);
				attr_dev(th2, "class", "svelte-15xn5ym");
				add_location(th2, file$k, 7, 3, 106);
				attr_dev(tr, "class", "svelte-15xn5ym");
				add_location(tr, file$k, 4, 2, 57);
				attr_dev(table, "class", "svelte-15xn5ym");
				add_location(table, file$k, 3, 1, 47);
				attr_dev(div, "class", "properties");
				add_location(div, file$k, 2, 0, 21);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h4, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, div, anchor);
				append_dev(div, table);
				append_dev(table, tr);
				append_dev(tr, th0);
				append_dev(tr, t3);
				append_dev(tr, th1);
				append_dev(tr, t5);
				append_dev(tr, th2);
				append_dev(table, t7);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(table, null);
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*data*/ 1) {
					each_value = /*data*/ ctx[0];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(table, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(h4);
				if (detaching) detach_dev(t1);
				if (detaching) detach_dev(div);
				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$k.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$k($$self, $$props, $$invalidate) {
		let { data = [] } = $$props;
		const writable_props = ["data"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Properties> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Properties", $$slots, []);

		$$self.$set = $$props => {
			if ("data" in $$props) $$invalidate(0, data = $$props.data);
		};

		$$self.$capture_state = () => ({ data });

		$$self.$inject_state = $$props => {
			if ("data" in $$props) $$invalidate(0, data = $$props.data);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [data];
	}

	class Properties extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$k, create_fragment$k, safe_not_equal, { data: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Properties",
				options,
				id: create_fragment$k.name
			});
		}

		get data() {
			throw new Error("<Properties>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set data(value) {
			throw new Error("<Properties>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	var code$1 = "<pre><code class=\"language-xml\">    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Map</span>\n        <span class=\"hljs-attr\">center</span>=<span class=\"hljs-string\">{[55.751849,</span> <span class=\"hljs-attr\">37.595214</span>]}\n        <span class=\"hljs-attr\">zoom</span>=<span class=\"hljs-string\">{8}</span>\n    &gt;</span>\n    <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">Map</span>&gt;</span></code></pre>\n";

	var doc = "<p>The central class of the API — it is used to create a map on a page and manipulate it.</p>\n<h4 id=\"options\">Options</h4>\n<p>You can use any options for Leaflet map <a href=\"https://leafletjs.com/reference-1.6.0.html#map\">https://leafletjs.com/reference-1.6.0.html#map</a> , like</p>\n<p><code>center</code>, <code>zoom</code> and so on</p>\n<h4 id=\"events\">Events</h4>\n<p><code>open</code>, <code>close</code> custom events</p>\n<p>Any Leaflet map events</p>\n";

	var properties = [
		{
			name: 'class',
			def: "''",
			type: 'string',
			desc: 'Custom global CSS class name',
		},
	];

	/* src\pages\map\Map.svelte generated by Svelte v3.24.0 */
	const file$l = "src\\pages\\map\\Map.svelte";

	// (2:1) <Map   center={[55.751849, 37.595214]}   zoom={8}  >
	function create_default_slot_2$1(ctx) {
		let tilelayer;
		let current;
		tilelayer = new TileLayer({ $$inline: true });

		const block = {
			c: function create() {
				create_component(tilelayer.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(tilelayer, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tilelayer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(tilelayer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(tilelayer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_2$1.name,
			type: "slot",
			source: "(2:1) <Map   center={[55.751849, 37.595214]}   zoom={8}  >",
			ctx
		});

		return block;
	}

	// (9:1) <div slot="code">
	function create_code_slot(ctx) {
		let div0;
		let div1;

		const block = {
			c: function create() {
				div0 = element("div");
				div1 = element("div");
				add_location(div1, file$l, 9, 2, 111);
				attr_dev(div0, "slot", "code");
				add_location(div0, file$l, 8, 1, 91);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				append_dev(div0, div1);
				div1.innerHTML = code$1;
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_code_slot.name,
			type: "slot",
			source: "(9:1) <div slot=\\\"code\\\">",
			ctx
		});

		return block;
	}

	// (1:0) <DemoPanel>
	function create_default_slot_1$3(ctx) {
		let map;
		let t;
		let current;

		map = new Map$1({
				props: {
					center: [55.751849, 37.595214],
					zoom: 8,
					$$slots: { default: [create_default_slot_2$1] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(map.$$.fragment);
				t = space();
			},
			m: function mount(target, anchor) {
				mount_component(map, target, anchor);
				insert_dev(target, t, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const map_changes = {};

				if (dirty & /*$$scope*/ 2) {
					map_changes.$$scope = { dirty, ctx };
				}

				map.$set(map_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(map.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(map.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(map, detaching);
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$3.name,
			type: "slot",
			source: "(1:0) <DemoPanel>",
			ctx
		});

		return block;
	}

	// (16:0) <Description>
	function create_default_slot$6(ctx) {
		let html_tag;
		let html_anchor;

		const block = {
			c: function create() {
				html_anchor = empty();
				html_tag = new HtmlTag(html_anchor);
			},
			m: function mount(target, anchor) {
				html_tag.m(doc, target, anchor);
				insert_dev(target, html_anchor, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(html_anchor);
				if (detaching) html_tag.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$6.name,
			type: "slot",
			source: "(16:0) <Description>",
			ctx
		});

		return block;
	}

	function create_fragment$l(ctx) {
		let demopanel;
		let t0;
		let description;
		let t1;
		let properties_1;
		let current;

		demopanel = new DemoPanel({
				props: {
					$$slots: {
						default: [create_default_slot_1$3],
						code: [create_code_slot]
					},
					$$scope: { ctx }
				},
				$$inline: true
			});

		description = new Description({
				props: {
					$$slots: { default: [create_default_slot$6] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		properties_1 = new Properties({
				props: { data: properties },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(demopanel.$$.fragment);
				t0 = space();
				create_component(description.$$.fragment);
				t1 = space();
				create_component(properties_1.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(demopanel, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(description, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(properties_1, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const demopanel_changes = {};

				if (dirty & /*$$scope*/ 2) {
					demopanel_changes.$$scope = { dirty, ctx };
				}

				demopanel.$set(demopanel_changes);
				const description_changes = {};

				if (dirty & /*$$scope*/ 2) {
					description_changes.$$scope = { dirty, ctx };
				}

				description.$set(description_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(demopanel.$$.fragment, local);
				transition_in(description.$$.fragment, local);
				transition_in(properties_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(demopanel.$$.fragment, local);
				transition_out(description.$$.fragment, local);
				transition_out(properties_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(demopanel, detaching);
				if (detaching) detach_dev(t0);
				destroy_component(description, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(properties_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$l.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$l($$self, $$props, $$invalidate) {
		let visible = false;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("Map", $$slots, []);

		$$self.$capture_state = () => ({
			Map: Map$1,
			TileLayer,
			DemoPanel,
			Description,
			Properties,
			code: code$1,
			doc,
			properties,
			visible
		});

		$$self.$inject_state = $$props => {
			if ("visible" in $$props) visible = $$props.visible;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [];
	}

	class Map_1 extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Map_1",
				options,
				id: create_fragment$l.name
			});
		}
	}

	var code$2 = "<pre><code class=\"language-xml\">    <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Map</span>&gt;</span>\n        <span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">TileLayer</span>\n            <span class=\"hljs-attr\">urlTemplate</span>=<span class=\"hljs-string\">\"\"</span>\n            <span class=\"hljs-attr\">options</span>=<span class=\"hljs-string\">{{</span>\n                <span class=\"hljs-attr\">minZoom:</span> <span class=\"hljs-attr\">2</span>,\n                <span class=\"hljs-attr\">errorTileUrl:</span> ''\n            }}\n        /&gt;</span>\n    <span class=\"hljs-tag\">&lt;/<span class=\"hljs-name\">Map</span>&gt;</span>\n</code></pre>\n";

	var doc$1 = "<p>Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under Layer.</p>\n<h4 id=\"options\">Options</h4>\n<p>You can use any options like this object <a href=\"https://leafletjs.com/reference-1.6.0.html#tilelayer\">https://leafletjs.com/reference-1.6.0.html#tilelayer</a> </p>\n<h4 id=\"events\">Events</h4>\n<p>Any <a href=\"https://leafletjs.com/reference-1.6.0.html#tilelayer\">https://leafletjs.com/reference-1.6.0.html#tilelayer</a> events</p>\n";

	var properties$1 = [
		{
			name: 'class',
			def: "''",
			type: 'string',
			desc: 'Custom global CSS class name',
		},
	];

	/* src\pages\tilelayer\TileLayer.svelte generated by Svelte v3.24.0 */
	const file$m = "src\\pages\\tilelayer\\TileLayer.svelte";

	// (2:1) <Map>
	function create_default_slot_2$2(ctx) {
		let tilelayer;
		let current;

		tilelayer = new TileLayer({
				props: {
					urlTemplate: "",
					options: { minZoom: 2, errorTileUrl: "" }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(tilelayer.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(tilelayer, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(tilelayer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(tilelayer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(tilelayer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_2$2.name,
			type: "slot",
			source: "(2:1) <Map>",
			ctx
		});

		return block;
	}

	// (12:1) <div slot="code">
	function create_code_slot$1(ctx) {
		let div0;
		let div1;

		const block = {
			c: function create() {
				div0 = element("div");
				div1 = element("div");
				add_location(div1, file$m, 12, 2, 142);
				attr_dev(div0, "slot", "code");
				add_location(div0, file$m, 11, 1, 122);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				append_dev(div0, div1);
				div1.innerHTML = code$2;
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_code_slot$1.name,
			type: "slot",
			source: "(12:1) <div slot=\\\"code\\\">",
			ctx
		});

		return block;
	}

	// (1:0) <DemoPanel>
	function create_default_slot_1$4(ctx) {
		let map;
		let t;
		let current;

		map = new Map$1({
				props: {
					$$slots: { default: [create_default_slot_2$2] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(map.$$.fragment);
				t = space();
			},
			m: function mount(target, anchor) {
				mount_component(map, target, anchor);
				insert_dev(target, t, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const map_changes = {};

				if (dirty & /*$$scope*/ 1) {
					map_changes.$$scope = { dirty, ctx };
				}

				map.$set(map_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(map.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(map.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(map, detaching);
				if (detaching) detach_dev(t);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$4.name,
			type: "slot",
			source: "(1:0) <DemoPanel>",
			ctx
		});

		return block;
	}

	// (19:0) <Description>
	function create_default_slot$7(ctx) {
		let html_tag;
		let html_anchor;

		const block = {
			c: function create() {
				html_anchor = empty();
				html_tag = new HtmlTag(html_anchor);
			},
			m: function mount(target, anchor) {
				html_tag.m(doc$1, target, anchor);
				insert_dev(target, html_anchor, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(html_anchor);
				if (detaching) html_tag.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$7.name,
			type: "slot",
			source: "(19:0) <Description>",
			ctx
		});

		return block;
	}

	function create_fragment$m(ctx) {
		let demopanel;
		let t0;
		let description;
		let t1;
		let properties_1;
		let current;

		demopanel = new DemoPanel({
				props: {
					$$slots: {
						default: [create_default_slot_1$4],
						code: [create_code_slot$1]
					},
					$$scope: { ctx }
				},
				$$inline: true
			});

		description = new Description({
				props: {
					$$slots: { default: [create_default_slot$7] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		properties_1 = new Properties({
				props: { data: properties$1 },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(demopanel.$$.fragment);
				t0 = space();
				create_component(description.$$.fragment);
				t1 = space();
				create_component(properties_1.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(demopanel, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(description, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(properties_1, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const demopanel_changes = {};

				if (dirty & /*$$scope*/ 1) {
					demopanel_changes.$$scope = { dirty, ctx };
				}

				demopanel.$set(demopanel_changes);
				const description_changes = {};

				if (dirty & /*$$scope*/ 1) {
					description_changes.$$scope = { dirty, ctx };
				}

				description.$set(description_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(demopanel.$$.fragment, local);
				transition_in(description.$$.fragment, local);
				transition_in(properties_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(demopanel.$$.fragment, local);
				transition_out(description.$$.fragment, local);
				transition_out(properties_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(demopanel, detaching);
				if (detaching) detach_dev(t0);
				destroy_component(description, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(properties_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$m.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$m($$self, $$props, $$invalidate) {
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TileLayer> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("TileLayer", $$slots, []);

		$$self.$capture_state = () => ({
			Map: Map$1,
			TileLayer,
			DemoPanel,
			Description,
			Properties,
			code: code$2,
			doc: doc$1,
			properties: properties$1
		});

		return [];
	}

	class TileLayer_1 extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TileLayer_1",
				options,
				id: create_fragment$m.name
			});
		}
	}

	/*
	import Button from '/pages/button';
	import ButtonGroup from '/pages/button-group';
	import Checkbox from '/pages/checkbox';
	import CheckboxGroup from '/pages/checkbox-group';
	import Datefield from '/pages/datefield';
	import Datepicker from '/pages/datepicker';
	import Dialog from '/pages/dialog';
	import Icon from '/pages/icon';
	import Menu from '/pages/menu';
	import Radio from '/pages/radio';
	import Ripple from '/pages/ripple';
	import Sidepanel from '/pages/sidepanel';
	import Snackbar from '/pages/snackbar';
	import Textfield from '/pages/textfield';
	import { NotFound } from '/pages/errors';
	*/
	let routes = [
		{
			path: '/home',
			component: Home,
		},
		{
			path: '/map',
			component: Map_1,
			name: 'Map',
		},
		{
			path: '/tilelayer',
			component: TileLayer_1,
			name: 'TileLayer',
		},
	/*
		{
			path: '/button',
			component: Button,
			name: 'Button',
		},
		{
			path: '/button/button-group',
			component: ButtonGroup,
			name: 'Button Group',
		},
		{
			path: '/checkbox',
			component: Checkbox,
			name: 'Checkbox',
		},
		{
			path: '/checkbox/checkbox-group',
			component: CheckboxGroup,
			name: 'Checkbox Group',
		},
		{
			path: '/datepicker',
			component: Datepicker,
			name: 'Datepicker *',
		},
		{
			path: '/datepicker/datefield',
			component: Datefield,
			name: 'Datefield *',
		},
		{
			path: '/dialog',
			component: Dialog,
			name: 'Dialog',
		},
		{
			path: '/icon',
			component: Icon,
			name: 'Icon',
		},
		{
			path: '/menu',
			component: Menu,
			name: 'Menu',
		},
		{
			path: '/radio-button',
			component: Radio,
			name: 'Radio Button',
		},
		{
			path: '/ripple',
			component: Ripple,
			name: 'Ripple',
		},
		{
			path: '/side-panel',
			component: Sidepanel,
			name: 'Sidepanel',
		},
		{
			path: '/snackbar',
			component: Snackbar,
			name: 'Snackbar',
		},
		{
			path: '/textfield',
			component: Textfield,
			name: 'Textfield',
		},
		*/
		{
			path: '*',
			component: Home,
		},
	];

	/* src\App.svelte generated by Svelte v3.24.0 */

	const { document: document_1, window: window_1$2 } = globals;
	const file$n = "src\\App.svelte";

	// (21:1) {#if maxWidth > 720}
	function create_if_block_3(ctx) {
		let div;
		let nav;
		let div_transition;
		let current;

		nav = new Nav({
				props: {
					routes: /*sitenav*/ ctx[3],
					currentPath: /*ctx*/ ctx[2] ? /*ctx*/ ctx[2].path : null
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				create_component(nav.$$.fragment);
				attr_dev(div, "class", "nav-panel svelte-6xopd5");
				add_location(div, file$n, 21, 2, 527);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(nav, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const nav_changes = {};
				if (dirty & /*sitenav*/ 8) nav_changes.routes = /*sitenav*/ ctx[3];
				if (dirty & /*ctx*/ 4) nav_changes.currentPath = /*ctx*/ ctx[2] ? /*ctx*/ ctx[2].path : null;
				nav.$set(nav_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(nav.$$.fragment, local);

				add_render_callback(() => {
					if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: -224, duration: 150, easing: identity }, true);
					div_transition.run(1);
				});

				current = true;
			},
			o: function outro(local) {
				transition_out(nav.$$.fragment, local);
				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: -224, duration: 150, easing: identity }, false);
				div_transition.run(0);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(nav);
				if (detaching && div_transition) div_transition.end();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(21:1) {#if maxWidth > 720}",
			ctx
		});

		return block;
	}

	// (28:2) {#if page}
	function create_if_block$a(ctx) {
		let t0;
		let switch_instance;
		let t1;
		let if_block1_anchor;
		let current;
		let if_block0 = /*titlePage*/ ctx[1] && create_if_block_2$2(ctx);
		const switch_instance_spread_levels = [/*ctx*/ ctx[2]];
		var switch_value = /*page*/ ctx[0].default || /*page*/ ctx[0];

		function switch_props(ctx) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = new switch_value(switch_props());
		}

		let if_block1 = /*maxWidth*/ ctx[4] < 721 && /*ctx*/ ctx[2].path === "/" && create_if_block_1$2(ctx);

		const block = {
			c: function create() {
				if (if_block0) if_block0.c();
				t0 = space();
				if (switch_instance) create_component(switch_instance.$$.fragment);
				t1 = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert_dev(target, t0, anchor);

				if (switch_instance) {
					mount_component(switch_instance, target, anchor);
				}

				insert_dev(target, t1, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert_dev(target, if_block1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (/*titlePage*/ ctx[1]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_2$2(ctx);
						if_block0.c();
						if_block0.m(t0.parentNode, t0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				const switch_instance_changes = (dirty & /*ctx*/ 4)
				? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*ctx*/ ctx[2])])
				: {};

				if (switch_value !== (switch_value = /*page*/ ctx[0].default || /*page*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, t1.parentNode, t1);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					switch_instance.$set(switch_instance_changes);
				}

				if (/*maxWidth*/ ctx[4] < 721 && /*ctx*/ ctx[2].path === "/") {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*maxWidth, ctx*/ 20) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_1$2(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (if_block0) if_block0.d(detaching);
				if (detaching) detach_dev(t0);
				if (switch_instance) destroy_component(switch_instance, detaching);
				if (detaching) detach_dev(t1);
				if (if_block1) if_block1.d(detaching);
				if (detaching) detach_dev(if_block1_anchor);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$a.name,
			type: "if",
			source: "(28:2) {#if page}",
			ctx
		});

		return block;
	}

	// (29:3) {#if titlePage}
	function create_if_block_2$2(ctx) {
		let h3;
		let t;

		const block = {
			c: function create() {
				h3 = element("h3");
				t = text(/*titlePage*/ ctx[1]);
				attr_dev(h3, "class", "svelte-6xopd5");
				add_location(h3, file$n, 29, 4, 748);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h3, anchor);
				append_dev(h3, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*titlePage*/ 2) set_data_dev(t, /*titlePage*/ ctx[1]);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(h3);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$2.name,
			type: "if",
			source: "(29:3) {#if titlePage}",
			ctx
		});

		return block;
	}

	// (35:3) {#if maxWidth < 721 && ctx.path === '/'}
	function create_if_block_1$2(ctx) {
		let div;
		let span;
		let t1;
		let icon;
		let current;
		let mounted;
		let dispose;

		icon = new Icon({
				props: { path: arrowForward },
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				span = element("span");
				span.textContent = "Explore components";
				t1 = space();
				create_component(icon.$$.fragment);
				attr_dev(span, "class", "svelte-6xopd5");
				add_location(span, file$n, 43, 5, 1034);
				attr_dev(div, "class", "explore svelte-6xopd5");
				attr_dev(div, "tabindex", "0");
				add_location(div, file$n, 35, 4, 889);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, span);
				append_dev(div, t1);
				mount_component(icon, div, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(div, "click", /*click_handler*/ ctx[22], false, false, false),
						listen_dev(div, "keydown", /*onKeyDown*/ ctx[11], false, false, false)
					];

					mounted = true;
				}
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(icon);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$2.name,
			type: "if",
			source: "(35:3) {#if maxWidth < 721 && ctx.path === '/'}",
			ctx
		});

		return block;
	}

	function create_fragment$n(ctx) {
		let title_value;
		let t0;
		let appbar;
		let updating_leftPanelVisible;
		let updating_rightPanelVisible;
		let updating_loginDialogVisible;
		let t1;
		let leftpanel;
		let updating_visible;
		let t2;
		let rightpanel;
		let updating_visible_1;
		let t3;
		let logindialog;
		let updating_visible_2;
		let updating_username;
		let updating_password;
		let t4;
		let main;
		let t5;
		let div;
		let current;
		let mounted;
		let dispose;
		document_1.title = title_value = "svelte-ui" + (/*titlePage*/ ctx[1] ? `: ${/*titlePage*/ ctx[1]}` : "");

		function appbar_leftPanelVisible_binding(value) {
			/*appbar_leftPanelVisible_binding*/ ctx[14].call(null, value);
		}

		function appbar_rightPanelVisible_binding(value) {
			/*appbar_rightPanelVisible_binding*/ ctx[15].call(null, value);
		}

		function appbar_loginDialogVisible_binding(value) {
			/*appbar_loginDialogVisible_binding*/ ctx[16].call(null, value);
		}

		let appbar_props = { fade: /*offsetTop*/ ctx[5] > 36 };

		if (/*leftPanelVisible*/ ctx[6] !== void 0) {
			appbar_props.leftPanelVisible = /*leftPanelVisible*/ ctx[6];
		}

		if (/*rightPanelVisible*/ ctx[7] !== void 0) {
			appbar_props.rightPanelVisible = /*rightPanelVisible*/ ctx[7];
		}

		if (/*loginDialogVisible*/ ctx[8] !== void 0) {
			appbar_props.loginDialogVisible = /*loginDialogVisible*/ ctx[8];
		}

		appbar = new AppBar({ props: appbar_props, $$inline: true });
		binding_callbacks.push(() => bind(appbar, "leftPanelVisible", appbar_leftPanelVisible_binding));
		binding_callbacks.push(() => bind(appbar, "rightPanelVisible", appbar_rightPanelVisible_binding));
		binding_callbacks.push(() => bind(appbar, "loginDialogVisible", appbar_loginDialogVisible_binding));

		function leftpanel_visible_binding(value) {
			/*leftpanel_visible_binding*/ ctx[17].call(null, value);
		}

		let leftpanel_props = {
			currentPath: /*ctx*/ ctx[2] ? /*ctx*/ ctx[2].path : null,
			sitenav: /*sitenav*/ ctx[3]
		};

		if (/*leftPanelVisible*/ ctx[6] !== void 0) {
			leftpanel_props.visible = /*leftPanelVisible*/ ctx[6];
		}

		leftpanel = new LeftPanel({ props: leftpanel_props, $$inline: true });
		binding_callbacks.push(() => bind(leftpanel, "visible", leftpanel_visible_binding));

		function rightpanel_visible_binding(value) {
			/*rightpanel_visible_binding*/ ctx[18].call(null, value);
		}

		let rightpanel_props = {};

		if (/*rightPanelVisible*/ ctx[7] !== void 0) {
			rightpanel_props.visible = /*rightPanelVisible*/ ctx[7];
		}

		rightpanel = new RightPanel({ props: rightpanel_props, $$inline: true });
		binding_callbacks.push(() => bind(rightpanel, "visible", rightpanel_visible_binding));

		function logindialog_visible_binding(value) {
			/*logindialog_visible_binding*/ ctx[19].call(null, value);
		}

		function logindialog_username_binding(value) {
			/*logindialog_username_binding*/ ctx[20].call(null, value);
		}

		function logindialog_password_binding(value) {
			/*logindialog_password_binding*/ ctx[21].call(null, value);
		}

		let logindialog_props = {};

		if (/*loginDialogVisible*/ ctx[8] !== void 0) {
			logindialog_props.visible = /*loginDialogVisible*/ ctx[8];
		}

		if (/*username*/ ctx[9] !== void 0) {
			logindialog_props.username = /*username*/ ctx[9];
		}

		if (/*password*/ ctx[10] !== void 0) {
			logindialog_props.password = /*password*/ ctx[10];
		}

		logindialog = new LoginDialog({ props: logindialog_props, $$inline: true });
		binding_callbacks.push(() => bind(logindialog, "visible", logindialog_visible_binding));
		binding_callbacks.push(() => bind(logindialog, "username", logindialog_username_binding));
		binding_callbacks.push(() => bind(logindialog, "password", logindialog_password_binding));
		let if_block0 = /*maxWidth*/ ctx[4] > 720 && create_if_block_3(ctx);
		let if_block1 = /*page*/ ctx[0] && create_if_block$a(ctx);

		const block = {
			c: function create() {
				t0 = space();
				create_component(appbar.$$.fragment);
				t1 = space();
				create_component(leftpanel.$$.fragment);
				t2 = space();
				create_component(rightpanel.$$.fragment);
				t3 = space();
				create_component(logindialog.$$.fragment);
				t4 = space();
				main = element("main");
				if (if_block0) if_block0.c();
				t5 = space();
				div = element("div");
				if (if_block1) if_block1.c();
				attr_dev(div, "class", "page svelte-6xopd5");
				add_location(div, file$n, 26, 1, 693);
				attr_dev(main, "class", "svelte-6xopd5");
				add_location(main, file$n, 19, 0, 496);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t0, anchor);
				mount_component(appbar, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(leftpanel, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(rightpanel, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(logindialog, target, anchor);
				insert_dev(target, t4, anchor);
				insert_dev(target, main, anchor);
				if (if_block0) if_block0.m(main, null);
				append_dev(main, t5);
				append_dev(main, div);
				if (if_block1) if_block1.m(div, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(window_1$2, "scroll", /*onScroll*/ ctx[13], { passive: true }, false, false),
						listen_dev(window_1$2, "resize", /*onResize*/ ctx[12], { passive: true }, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if ((!current || dirty & /*titlePage*/ 2) && title_value !== (title_value = "svelte-ui" + (/*titlePage*/ ctx[1] ? `: ${/*titlePage*/ ctx[1]}` : ""))) {
					document_1.title = title_value;
				}

				const appbar_changes = {};
				if (dirty & /*offsetTop*/ 32) appbar_changes.fade = /*offsetTop*/ ctx[5] > 36;

				if (!updating_leftPanelVisible && dirty & /*leftPanelVisible*/ 64) {
					updating_leftPanelVisible = true;
					appbar_changes.leftPanelVisible = /*leftPanelVisible*/ ctx[6];
					add_flush_callback(() => updating_leftPanelVisible = false);
				}

				if (!updating_rightPanelVisible && dirty & /*rightPanelVisible*/ 128) {
					updating_rightPanelVisible = true;
					appbar_changes.rightPanelVisible = /*rightPanelVisible*/ ctx[7];
					add_flush_callback(() => updating_rightPanelVisible = false);
				}

				if (!updating_loginDialogVisible && dirty & /*loginDialogVisible*/ 256) {
					updating_loginDialogVisible = true;
					appbar_changes.loginDialogVisible = /*loginDialogVisible*/ ctx[8];
					add_flush_callback(() => updating_loginDialogVisible = false);
				}

				appbar.$set(appbar_changes);
				const leftpanel_changes = {};
				if (dirty & /*ctx*/ 4) leftpanel_changes.currentPath = /*ctx*/ ctx[2] ? /*ctx*/ ctx[2].path : null;
				if (dirty & /*sitenav*/ 8) leftpanel_changes.sitenav = /*sitenav*/ ctx[3];

				if (!updating_visible && dirty & /*leftPanelVisible*/ 64) {
					updating_visible = true;
					leftpanel_changes.visible = /*leftPanelVisible*/ ctx[6];
					add_flush_callback(() => updating_visible = false);
				}

				leftpanel.$set(leftpanel_changes);
				const rightpanel_changes = {};

				if (!updating_visible_1 && dirty & /*rightPanelVisible*/ 128) {
					updating_visible_1 = true;
					rightpanel_changes.visible = /*rightPanelVisible*/ ctx[7];
					add_flush_callback(() => updating_visible_1 = false);
				}

				rightpanel.$set(rightpanel_changes);
				const logindialog_changes = {};

				if (!updating_visible_2 && dirty & /*loginDialogVisible*/ 256) {
					updating_visible_2 = true;
					logindialog_changes.visible = /*loginDialogVisible*/ ctx[8];
					add_flush_callback(() => updating_visible_2 = false);
				}

				if (!updating_username && dirty & /*username*/ 512) {
					updating_username = true;
					logindialog_changes.username = /*username*/ ctx[9];
					add_flush_callback(() => updating_username = false);
				}

				if (!updating_password && dirty & /*password*/ 1024) {
					updating_password = true;
					logindialog_changes.password = /*password*/ ctx[10];
					add_flush_callback(() => updating_password = false);
				}

				logindialog.$set(logindialog_changes);

				if (/*maxWidth*/ ctx[4] > 720) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*maxWidth*/ 16) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_3(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(main, t5);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*page*/ ctx[0]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*page*/ 1) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block$a(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(appbar.$$.fragment, local);
				transition_in(leftpanel.$$.fragment, local);
				transition_in(rightpanel.$$.fragment, local);
				transition_in(logindialog.$$.fragment, local);
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(appbar.$$.fragment, local);
				transition_out(leftpanel.$$.fragment, local);
				transition_out(rightpanel.$$.fragment, local);
				transition_out(logindialog.$$.fragment, local);
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t0);
				destroy_component(appbar, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(leftpanel, detaching);
				if (detaching) detach_dev(t2);
				destroy_component(rightpanel, detaching);
				if (detaching) detach_dev(t3);
				destroy_component(logindialog, detaching);
				if (detaching) detach_dev(t4);
				if (detaching) detach_dev(main);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$n.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$n($$self, $$props, $$invalidate) {
		let { page = null } = $$props;
		let { titlePage = null } = $$props;
		let { ctx = null } = $$props;
		let sitenav = routes;
		let maxWidth = 720;
		let offsetTop = 0;
		let leftPanelVisible = false;
		let rightPanelVisible = false;
		let loginDialogVisible = false;
		let username = "";
		let password = "";

		onMount(async () => {
			onResize();
		});

		function onKeyDown(e) {
			if (e.keyCode === 13 || e.keyCode === 32) {
				e.stopPropagation();
				e.preventDefault();
				$$invalidate(6, leftPanelVisible = true);
			}
		}

		function onResize() {
			$$invalidate(4, maxWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);

			if (maxWidth > 720) {
				delete sitenav[0].name;
				$$invalidate(6, leftPanelVisible = false);
			} else {
				$$invalidate(3, sitenav[0].name = "Home", sitenav);
			}
		}

		function onScroll() {
			$$invalidate(5, offsetTop = window.pageYOffset || document.documentElement.scrollTop);
		}

		const writable_props = ["page", "titlePage", "ctx"];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
		});

		let { $$slots = {}, $$scope } = $$props;
		validate_slots("App", $$slots, []);

		function appbar_leftPanelVisible_binding(value) {
			leftPanelVisible = value;
			$$invalidate(6, leftPanelVisible);
		}

		function appbar_rightPanelVisible_binding(value) {
			rightPanelVisible = value;
			$$invalidate(7, rightPanelVisible);
		}

		function appbar_loginDialogVisible_binding(value) {
			loginDialogVisible = value;
			$$invalidate(8, loginDialogVisible);
		}

		function leftpanel_visible_binding(value) {
			leftPanelVisible = value;
			$$invalidate(6, leftPanelVisible);
		}

		function rightpanel_visible_binding(value) {
			rightPanelVisible = value;
			$$invalidate(7, rightPanelVisible);
		}

		function logindialog_visible_binding(value) {
			loginDialogVisible = value;
			$$invalidate(8, loginDialogVisible);
		}

		function logindialog_username_binding(value) {
			username = value;
			$$invalidate(9, username);
		}

		function logindialog_password_binding(value) {
			password = value;
			$$invalidate(10, password);
		}

		const click_handler = () => {
			$$invalidate(6, leftPanelVisible = true);
		};

		$$self.$set = $$props => {
			if ("page" in $$props) $$invalidate(0, page = $$props.page);
			if ("titlePage" in $$props) $$invalidate(1, titlePage = $$props.titlePage);
			if ("ctx" in $$props) $$invalidate(2, ctx = $$props.ctx);
		};

		$$self.$capture_state = () => ({
			page,
			titlePage,
			ctx,
			onMount,
			fly,
			linear: identity,
			Icon,
			arrowForward,
			AppBar,
			LeftPanel,
			RightPanel,
			LoginDialog,
			Nav,
			sn: routes,
			sitenav,
			maxWidth,
			offsetTop,
			leftPanelVisible,
			rightPanelVisible,
			loginDialogVisible,
			username,
			password,
			onKeyDown,
			onResize,
			onScroll
		});

		$$self.$inject_state = $$props => {
			if ("page" in $$props) $$invalidate(0, page = $$props.page);
			if ("titlePage" in $$props) $$invalidate(1, titlePage = $$props.titlePage);
			if ("ctx" in $$props) $$invalidate(2, ctx = $$props.ctx);
			if ("sitenav" in $$props) $$invalidate(3, sitenav = $$props.sitenav);
			if ("maxWidth" in $$props) $$invalidate(4, maxWidth = $$props.maxWidth);
			if ("offsetTop" in $$props) $$invalidate(5, offsetTop = $$props.offsetTop);
			if ("leftPanelVisible" in $$props) $$invalidate(6, leftPanelVisible = $$props.leftPanelVisible);
			if ("rightPanelVisible" in $$props) $$invalidate(7, rightPanelVisible = $$props.rightPanelVisible);
			if ("loginDialogVisible" in $$props) $$invalidate(8, loginDialogVisible = $$props.loginDialogVisible);
			if ("username" in $$props) $$invalidate(9, username = $$props.username);
			if ("password" in $$props) $$invalidate(10, password = $$props.password);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			page,
			titlePage,
			ctx,
			sitenav,
			maxWidth,
			offsetTop,
			leftPanelVisible,
			rightPanelVisible,
			loginDialogVisible,
			username,
			password,
			onKeyDown,
			onResize,
			onScroll,
			appbar_leftPanelVisible_binding,
			appbar_rightPanelVisible_binding,
			appbar_loginDialogVisible_binding,
			leftpanel_visible_binding,
			rightpanel_visible_binding,
			logindialog_visible_binding,
			logindialog_username_binding,
			logindialog_password_binding,
			click_handler
		];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$n, create_fragment$n, safe_not_equal, { page: 0, titlePage: 1, ctx: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment$n.name
			});
		}

		get page() {
			throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set page(value) {
			throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get titlePage() {
			throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set titlePage(value) {
			throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get ctx() {
			throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set ctx(value) {
			throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const app = new App({
		target: document.body,
		intro: false,
	});

	// page.base(location.pathname.replace('/index.html', ''));
	page('*', (ctx, next) => {
		const qs = ctx.querystring ? ctx.querystring.replace('?', '').split('&') : [];
		ctx.query = qs.reduce((query, param) => {
			const [key, val] = param.split('=');
			query[key] = decodeURIComponent(val);
			return query;
		}, {});

		next();
	});

	routes.forEach(({ path, component, name }) => {
		page(path, (ctx) => {
			app.$set({ ctx, page: component, titlePage: name });
			window && window.scrollTo(0, 0);
		});
	});

	page.start();

	return app;

}());
//# sourceMappingURL=bundle.js.map
