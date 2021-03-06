"use strict";
var RouteRecognizer = require("route-recognizer")["default"];
var Promise = require("rsvp/promise")["default"];
var trigger = require("./utils").trigger;
var log = require("./utils").log;
var slice = require("./utils").slice;
var forEach = require("./utils").forEach;
var merge = require("./utils").merge;
var extractQueryParams = require("./utils").extractQueryParams;
var getChangelist = require("./utils").getChangelist;
var promiseLabel = require("./utils").promiseLabel;
var callHook = require("./utils").callHook;
var TransitionState = require("./transition-state")["default"];
var logAbort = require("./transition").logAbort;
var Transition = require("./transition").Transition;
var TransitionAborted = require("./transition").TransitionAborted;
var NamedTransitionIntent = require("./transition-intent/named-transition-intent")["default"];
var URLTransitionIntent = require("./transition-intent/url-transition-intent")["default"];

var pop = Array.prototype.pop;

function Router(_options) {
  var options = _options || {};
  this.getHandler = options.getHandler || this.getHandler;
  this.getSerializer = options.getSerializer || this.getSerializer;
  this.updateURL = options.updateURL || this.updateURL;
  this.replaceURL = options.replaceURL || this.replaceURL;
  this.didTransition = options.didTransition || this.didTransition;
  this.willTransition = options.willTransition || this.willTransition;
  this.delegate = options.delegate || this.delegate;
  this.triggerEvent = options.triggerEvent || this.triggerEvent;
  this.log = options.log || this.log;
  this.dslCallBacks = []; // NOTE: set by Ember
  this.state = undefined;
  this.activeTransition = undefined;
  this._changedQueryParams = undefined;
  this.oldState = undefined;
  this.currentHandlerInfos = undefined;
  this.state = undefined;

  this.recognizer = new RouteRecognizer();
  this.reset();
}

function getTransitionByIntent(intent, isIntermediate) {
  var wasTransitioning = !!this.activeTransition;
  var oldState = wasTransitioning ? this.activeTransition.state : this.state;
  var newTransition;

  var newState = intent.applyToState(oldState, this.recognizer, this.getHandler, isIntermediate, this.getSerializer);
  var queryParamChangelist = getChangelist(oldState.queryParams, newState.queryParams);

  if (handlerInfosEqual(newState.handlerInfos, oldState.handlerInfos)) {

    // This is a no-op transition. See if query params changed.
    if (queryParamChangelist) {
      newTransition = this.queryParamsTransition(queryParamChangelist, wasTransitioning, oldState, newState);
      if (newTransition) {
        return newTransition;
      }
    }

    // No-op. No need to create a new transition.
    return this.activeTransition || new Transition(this);
  }

  if (isIntermediate) {
    setupContexts(this, newState);
    return;
  }

  // Create a new transition to the destination route.
  newTransition = new Transition(this, intent, newState);

  // Abort and usurp any previously active transition.
  if (this.activeTransition) {
    this.activeTransition.abort();
  }
  this.activeTransition = newTransition;

  // Transition promises by default resolve with resolved state.
  // For our purposes, swap out the promise to resolve
  // after the transition has been finalized.
  newTransition.promise = newTransition.promise.then(function(result) {
    return finalizeTransition(newTransition, result.state);
  }, null, promiseLabel("Settle transition promise when transition is finalized"));

  if (!wasTransitioning) {
    notifyExistingHandlers(this, newState, newTransition);
  }

  fireQueryParamDidChange(this, newState, queryParamChangelist);

  return newTransition;
}

Router.prototype = {

  /**
    The main entry point into the router. The API is essentially
    the same as the `map` method in `route-recognizer`.

    This method extracts the String handler at the last `.to()`
    call and uses it as the name of the whole route.

    @param {Function} callback
  */
  map: function(callback) {
    this.recognizer.delegate = this.delegate;

    this.recognizer.map(callback, function(recognizer, routes) {
      for (var i = routes.length - 1, proceed = true; i >= 0 && proceed; --i) {
        var route = routes[i];
        recognizer.add(routes, { as: route.handler });
        proceed = route.path === '/' || route.path === '' || route.handler.slice(-6) === '.index';
      }
    });
  },

  hasRoute: function(route) {
    return this.recognizer.hasRoute(route);
  },

  getHandler: function() {},

  getSerializer: function() {},

  queryParamsTransition: function(changelist, wasTransitioning, oldState, newState) {
    var router = this;

    fireQueryParamDidChange(this, newState, changelist);

    if (!wasTransitioning && this.activeTransition) {
      // One of the handlers in queryParamsDidChange
      // caused a transition. Just return that transition.
      return this.activeTransition;
    } else {
      // Running queryParamsDidChange didn't change anything.
      // Just update query params and be on our way.

      // We have to return a noop transition that will
      // perform a URL update at the end. This gives
      // the user the ability to set the url update
      // method (default is replaceState).
      var newTransition = new Transition(this);
      newTransition.queryParamsOnly = true;

      oldState.queryParams = finalizeQueryParamChange(this, newState.handlerInfos, newState.queryParams, newTransition);

      newTransition.promise = newTransition.promise.then(function(result) {
        updateURL(newTransition, oldState, true);
        if (router.didTransition) {
          router.didTransition(router.currentHandlerInfos);
        }
        return result;
      }, null, promiseLabel("Transition complete"));
      return newTransition;
    }
  },

  // NOTE: this doesn't really belong here, but here
  // it shall remain until our ES6 transpiler can
  // handle cyclical deps.
  transitionByIntent: function(intent/*, isIntermediate*/) {
    try {
      return getTransitionByIntent.apply(this, arguments);
    } catch(e) {
      return new Transition(this, intent, null, e);
    }
  },

  /**
    Clears the current and target route handlers and triggers exit
    on each of them starting at the leaf and traversing up through
    its ancestors.
  */
  reset: function() {
    if (this.state) {
      forEach(this.state.handlerInfos.slice().reverse(), function(handlerInfo) {
        var handler = handlerInfo.handler;
        callHook(handler, 'exit');
      });
    }

    this.oldState = undefined;
    this.state = new TransitionState();
    this.currentHandlerInfos = null;
  },

  activeTransition: null,

  /**
    var handler = handlerInfo.handler;
    The entry point for handling a change to the URL (usually
    via the back and forward button).

    Returns an Array of handlers and the parameters associated
    with those parameters.

    @param {String} url a URL to process

    @return {Array} an Array of `[handler, parameter]` tuples
  */
  handleURL: function(url) {
    // Perform a URL-based transition, but don't change
    // the URL afterward, since it already happened.
    var args = slice.call(arguments);
    if (url.charAt(0) !== '/') { args[0] = '/' + url; }

    return doTransition(this, args).method(null);
  },

  /**
    Hook point for updating the URL.

    @param {String} url a URL to update to
  */
  updateURL: function() {
    throw new Error("updateURL is not implemented");
  },

  /**
    Hook point for replacing the current URL, i.e. with replaceState

    By default this behaves the same as `updateURL`

    @param {String} url a URL to update to
  */
  replaceURL: function(url) {
    this.updateURL(url);
  },

  /**
    Transition into the specified named route.

    If necessary, trigger the exit callback on any handlers
    that are no longer represented by the target route.

    @param {String} name the name of the route
  */
  transitionTo: function(/*name*/) {
    return doTransition(this, arguments);
  },

  intermediateTransitionTo: function(/*name*/) {
    return doTransition(this, arguments, true);
  },

  refresh: function(pivotHandler) {
    var state = this.activeTransition ? this.activeTransition.state : this.state;
    var handlerInfos = state.handlerInfos;
    var params = {};
    for (var i = 0, len = handlerInfos.length; i < len; ++i) {
      var handlerInfo = handlerInfos[i];
      params[handlerInfo.name] = handlerInfo.params || {};
    }

    log(this, "Starting a refresh transition");
    var intent = new NamedTransitionIntent({
      name: handlerInfos[handlerInfos.length - 1].name,
      pivotHandler: pivotHandler || handlerInfos[0].handler,
      contexts: [], // TODO collect contexts...?
      queryParams: this._changedQueryParams || state.queryParams || {}
    });

    return this.transitionByIntent(intent, false);
  },

  /**
    Identical to `transitionTo` except that the current URL will be replaced
    if possible.

    This method is intended primarily for use with `replaceState`.

    @param {String} name the name of the route
  */
  replaceWith: function(/*name*/) {
    return doTransition(this, arguments).method('replace');
  },

  /**
    Take a named route and context objects and generate a
    URL.

    @param {String} name the name of the route to generate
      a URL for
    @param {...Object} objects a list of objects to serialize

    @return {String} a URL
  */
  generate: function(handlerName) {

    var partitionedArgs = extractQueryParams(slice.call(arguments, 1)),
      suppliedParams = partitionedArgs[0],
      queryParams = partitionedArgs[1];

    // Construct a TransitionIntent with the provided params
    // and apply it to the present state of the router.
    var intent = new NamedTransitionIntent({ name: handlerName, contexts: suppliedParams });
    var state = intent.applyToState(this.state, this.recognizer, this.getHandler, null, this.getSerializer);
    var params = {};

    for (var i = 0, len = state.handlerInfos.length; i < len; ++i) {
      var handlerInfo = state.handlerInfos[i];
      var handlerParams = handlerInfo.serialize();
      merge(params, handlerParams);
    }
    params.queryParams = queryParams;

    return this.recognizer.generate(handlerName, params);
  },

  applyIntent: function(handlerName, contexts) {
    var intent = new NamedTransitionIntent({
      name: handlerName,
      contexts: contexts
    });

    var state = this.activeTransition && this.activeTransition.state || this.state;
    return intent.applyToState(state, this.recognizer, this.getHandler, null, this.getSerializer);
  },

  isActiveIntent: function(handlerName, contexts, queryParams, _state) {
    var state = _state || this.state,
        targetHandlerInfos = state.handlerInfos,
        handlerInfo, len;

    if (!targetHandlerInfos.length) { return false; }

    var targetHandler = targetHandlerInfos[targetHandlerInfos.length - 1].name;
    var recogHandlers = this.recognizer.handlersFor(targetHandler);

    var index = 0;
    for (len = recogHandlers.length; index < len; ++index) {
      handlerInfo = targetHandlerInfos[index];
      if (handlerInfo.name === handlerName) { break; }
    }

    if (index === recogHandlers.length) {
      // The provided route name isn't even in the route hierarchy.
      return false;
    }

    var testState = new TransitionState();
    testState.handlerInfos = targetHandlerInfos.slice(0, index + 1);
    recogHandlers = recogHandlers.slice(0, index + 1);

    var intent = new NamedTransitionIntent({
      name: targetHandler,
      contexts: contexts
    });

    var newState = intent.applyToHandlers(testState, recogHandlers, this.getHandler, targetHandler, true, true, this.getSerializer);

    var handlersEqual = handlerInfosEqual(newState.handlerInfos, testState.handlerInfos);
    if (!queryParams || !handlersEqual) {
      return handlersEqual;
    }

    // Get a hash of QPs that will still be active on new route
    var activeQPsOnNewHandler = {};
    merge(activeQPsOnNewHandler, queryParams);

    var activeQueryParams  = state.queryParams;
    for (var key in activeQueryParams) {
      if (activeQueryParams.hasOwnProperty(key) &&
          activeQPsOnNewHandler.hasOwnProperty(key)) {
        activeQPsOnNewHandler[key] = activeQueryParams[key];
      }
    }

    return handlersEqual && !getChangelist(activeQPsOnNewHandler, queryParams);
  },

  isActive: function(handlerName) {
    var partitionedArgs = extractQueryParams(slice.call(arguments, 1));
    return this.isActiveIntent(handlerName, partitionedArgs[0], partitionedArgs[1]);
  },

  trigger: function(/*name*/) {
    var args = slice.call(arguments);
    trigger(this, this.currentHandlerInfos, false, args);
  },

  /**
    Hook point for logging transition status updates.

    @param {String} message The message to log.
  */
  log: null
};

/**
  @private

  Fires queryParamsDidChange event
*/
function fireQueryParamDidChange(router, newState, queryParamChangelist) {
  // If queryParams changed trigger event
  if (queryParamChangelist) {

    // This is a little hacky but we need some way of storing
    // changed query params given that no activeTransition
    // is guaranteed to have occurred.
    router._changedQueryParams = queryParamChangelist.all;
    trigger(router, newState.handlerInfos, true, ['queryParamsDidChange', queryParamChangelist.changed, queryParamChangelist.all, queryParamChangelist.removed]);
    router._changedQueryParams = null;
  }
}

/**
  @private

  Takes an Array of `HandlerInfo`s, figures out which ones are
  exiting, entering, or changing contexts, and calls the
  proper handler hooks.

  For example, consider the following tree of handlers. Each handler is
  followed by the URL segment it handles.

  ```
  |~index ("/")
  | |~posts ("/posts")
  | | |-showPost ("/:id")
  | | |-newPost ("/new")
  | | |-editPost ("/edit")
  | |~about ("/about/:id")
  ```

  Consider the following transitions:

  1. A URL transition to `/posts/1`.
     1. Triggers the `*model` callbacks on the
        `index`, `posts`, and `showPost` handlers
     2. Triggers the `enter` callback on the same
     3. Triggers the `setup` callback on the same
  2. A direct transition to `newPost`
     1. Triggers the `exit` callback on `showPost`
     2. Triggers the `enter` callback on `newPost`
     3. Triggers the `setup` callback on `newPost`
  3. A direct transition to `about` with a specified
     context object
     1. Triggers the `exit` callback on `newPost`
        and `posts`
     2. Triggers the `serialize` callback on `about`
     3. Triggers the `enter` callback on `about`
     4. Triggers the `setup` callback on `about`

  @param {Router} transition
  @param {TransitionState} newState
*/
function setupContexts(router, newState, transition) {
  var partition = partitionHandlers(router.state, newState);
  var i, l, handler;

  for (i=0, l=partition.exited.length; i<l; i++) {
    handler = partition.exited[i].handler;
    delete handler.context;

    callHook(handler, 'reset', true, transition);
    callHook(handler, 'exit', transition);
  }

  var oldState = router.oldState = router.state;
  router.state = newState;
  var currentHandlerInfos = router.currentHandlerInfos = partition.unchanged.slice();

  try {
    for (i=0, l=partition.reset.length; i<l; i++) {
      handler = partition.reset[i].handler;
      callHook(handler, 'reset', false, transition);
    }

    for (i=0, l=partition.updatedContext.length; i<l; i++) {
      handlerEnteredOrUpdated(currentHandlerInfos, partition.updatedContext[i], false, transition);
    }

    for (i=0, l=partition.entered.length; i<l; i++) {
      handlerEnteredOrUpdated(currentHandlerInfos, partition.entered[i], true, transition);
    }
  } catch(e) {
    router.state = oldState;
    router.currentHandlerInfos = oldState.handlerInfos;
    throw e;
  }

  router.state.queryParams = finalizeQueryParamChange(router, currentHandlerInfos, newState.queryParams, transition);
}


/**
  @private

  Helper method used by setupContexts. Handles errors or redirects
  that may happen in enter/setup.
*/
function handlerEnteredOrUpdated(currentHandlerInfos, handlerInfo, enter, transition) {
  var handler = handlerInfo.handler,
      context = handlerInfo.context;

  function _handlerEnteredOrUpdated(handler) {
    if (enter) {
      callHook(handler, 'enter', transition);
    }

    if (transition && transition.isAborted) {
      throw new TransitionAborted();
    }

    handler.context = context;
    callHook(handler, 'contextDidChange');

    callHook(handler, 'setup', context, transition);
    if (transition && transition.isAborted) {
      throw new TransitionAborted();
    }

    currentHandlerInfos.push(handlerInfo);
  }

  // If the handler doesn't exist, it means we haven't resolved the handler promise yet
  if (!handler) {
    handlerInfo.handlerPromise = handlerInfo.handlerPromise.then(_handlerEnteredOrUpdated);
  } else {
    _handlerEnteredOrUpdated(handler);
  }

  return true;
}


/**
  @private

  This function is called when transitioning from one URL to
  another to determine which handlers are no longer active,
  which handlers are newly active, and which handlers remain
  active but have their context changed.

  Take a list of old handlers and new handlers and partition
  them into four buckets:

  * unchanged: the handler was active in both the old and
    new URL, and its context remains the same
  * updated context: the handler was active in both the
    old and new URL, but its context changed. The handler's
    `setup` method, if any, will be called with the new
    context.
  * exited: the handler was active in the old URL, but is
    no longer active.
  * entered: the handler was not active in the old URL, but
    is now active.

  The PartitionedHandlers structure has four fields:

  * `updatedContext`: a list of `HandlerInfo` objects that
    represent handlers that remain active but have a changed
    context
  * `entered`: a list of `HandlerInfo` objects that represent
    handlers that are newly active
  * `exited`: a list of `HandlerInfo` objects that are no
    longer active.
  * `unchanged`: a list of `HanderInfo` objects that remain active.

  @param {Array[HandlerInfo]} oldHandlers a list of the handler
    information for the previous URL (or `[]` if this is the
    first handled transition)
  @param {Array[HandlerInfo]} newHandlers a list of the handler
    information for the new URL

  @return {Partition}
*/
function partitionHandlers(oldState, newState) {
  var oldHandlers = oldState.handlerInfos;
  var newHandlers = newState.handlerInfos;

  var handlers = {
        updatedContext: [],
        exited: [],
        entered: [],
        unchanged: [],
        reset: undefined
      };

  var handlerChanged, contextChanged = false, i, l;

  for (i=0, l=newHandlers.length; i<l; i++) {
    var oldHandler = oldHandlers[i], newHandler = newHandlers[i];

    if (!oldHandler || oldHandler.handler !== newHandler.handler) {
      handlerChanged = true;
    }

    if (handlerChanged) {
      handlers.entered.push(newHandler);
      if (oldHandler) { handlers.exited.unshift(oldHandler); }
    } else if (contextChanged || oldHandler.context !== newHandler.context) {
      contextChanged = true;
      handlers.updatedContext.push(newHandler);
    } else {
      handlers.unchanged.push(oldHandler);
    }
  }

  for (i=newHandlers.length, l=oldHandlers.length; i<l; i++) {
    handlers.exited.unshift(oldHandlers[i]);
  }

  handlers.reset = handlers.updatedContext.slice();
  handlers.reset.reverse();

  return handlers;
}

function updateURL(transition, state/*, inputUrl*/) {
  var urlMethod = transition.urlMethod;

  if (!urlMethod) {
    return;
  }

  var router = transition.router,
      handlerInfos = state.handlerInfos,
      handlerName = handlerInfos[handlerInfos.length - 1].name,
      params = {};

  for (var i = handlerInfos.length - 1; i >= 0; --i) {
    var handlerInfo = handlerInfos[i];
    merge(params, handlerInfo.params);
    if (handlerInfo.handler.inaccessibleByURL) {
      urlMethod = null;
    }
  }

  if (urlMethod) {
    params.queryParams = transition._visibleQueryParams || state.queryParams;
    var url = router.recognizer.generate(handlerName, params);

    if (urlMethod === 'replace') {
      router.replaceURL(url);
    } else {
      router.updateURL(url);
    }
  }
}

/**
  @private

  Updates the URL (if necessary) and calls `setupContexts`
  to update the router's array of `currentHandlerInfos`.
 */
function finalizeTransition(transition, newState) {

  try {
    log(transition.router, transition.sequence, "Resolved all models on destination route; finalizing transition.");

    var router = transition.router,
        handlerInfos = newState.handlerInfos;

    // Run all the necessary enter/setup/exit hooks
    setupContexts(router, newState, transition);

    // Check if a redirect occurred in enter/setup
    if (transition.isAborted) {
      // TODO: cleaner way? distinguish b/w targetHandlerInfos?
      router.state.handlerInfos = router.currentHandlerInfos;
      return Promise.reject(logAbort(transition));
    }

    updateURL(transition, newState, transition.intent.url);

    transition.isActive = false;
    router.activeTransition = null;

    trigger(router, router.currentHandlerInfos, true, ['didTransition']);

    if (router.didTransition) {
      router.didTransition(router.currentHandlerInfos);
    }

    log(router, transition.sequence, "TRANSITION COMPLETE.");

    // Resolve with the final handler.
    return handlerInfos[handlerInfos.length - 1].handler;
  } catch(e) {
    if (!((e instanceof TransitionAborted))) {
      //var erroneousHandler = handlerInfos.pop();
      var infos = transition.state.handlerInfos;
      transition.trigger(true, 'error', e, transition, infos[infos.length-1].handler);
      transition.abort();
    }

    throw e;
  }
}

/**
  @private

  Begins and returns a Transition based on the provided
  arguments. Accepts arguments in the form of both URL
  transitions and named transitions.

  @param {Router} router
  @param {Array[Object]} args arguments passed to transitionTo,
    replaceWith, or handleURL
*/
function doTransition(router, args, isIntermediate) {
  // Normalize blank transitions to root URL transitions.
  var name = args[0] || '/';

  var lastArg = args[args.length-1];
  var queryParams = {};
  if (lastArg && lastArg.hasOwnProperty('queryParams')) {
    queryParams = pop.call(args).queryParams;
  }

  var intent;
  if (args.length === 0) {

    log(router, "Updating query params");

    // A query param update is really just a transition
    // into the route you're already on.
    var handlerInfos = router.state.handlerInfos;
    intent = new NamedTransitionIntent({
      name: handlerInfos[handlerInfos.length - 1].name,
      contexts: [],
      queryParams: queryParams
    });

  } else if (name.charAt(0) === '/') {

    log(router, "Attempting URL transition to " + name);
    intent = new URLTransitionIntent({ url: name });

  } else {

    log(router, "Attempting transition to " + name);
    intent = new NamedTransitionIntent({
      name: args[0],
      contexts: slice.call(args, 1),
      queryParams: queryParams
    });
  }

  return router.transitionByIntent(intent, isIntermediate);
}

function handlerInfosEqual(handlerInfos, otherHandlerInfos) {
  if (handlerInfos.length !== otherHandlerInfos.length) {
    return false;
  }

  for (var i = 0, len = handlerInfos.length; i < len; ++i) {
    if (handlerInfos[i] !== otherHandlerInfos[i]) {
      return false;
    }
  }
  return true;
}

function finalizeQueryParamChange(router, resolvedHandlers, newQueryParams, transition) {
  // We fire a finalizeQueryParamChange event which
  // gives the new route hierarchy a chance to tell
  // us which query params it's consuming and what
  // their final values are. If a query param is
  // no longer consumed in the final route hierarchy,
  // its serialized segment will be removed
  // from the URL.

  for (var k in newQueryParams) {
    if (newQueryParams.hasOwnProperty(k) &&
        newQueryParams[k] === null) {
      delete newQueryParams[k];
    }
  }

  var finalQueryParamsArray = [];
  trigger(router, resolvedHandlers, true, ['finalizeQueryParamChange', newQueryParams, finalQueryParamsArray, transition]);

  if (transition) {
    transition._visibleQueryParams = {};
  }

  var finalQueryParams = {};
  for (var i = 0, len = finalQueryParamsArray.length; i < len; ++i) {
    var qp = finalQueryParamsArray[i];
    finalQueryParams[qp.key] = qp.value;
    if (transition && qp.visible !== false) {
      transition._visibleQueryParams[qp.key] = qp.value;
    }
  }
  return finalQueryParams;
}

function notifyExistingHandlers(router, newState, newTransition) {
  var oldHandlers = router.state.handlerInfos,
      changing = [],
      leavingIndex = null,
      leaving, leavingChecker, i, oldHandlerLen, oldHandler, newHandler;

  oldHandlerLen = oldHandlers.length;
  for (i = 0; i < oldHandlerLen; i++) {
    oldHandler = oldHandlers[i];
    newHandler = newState.handlerInfos[i];

    if (!newHandler || oldHandler.name !== newHandler.name) {
      leavingIndex = i;
      break;
    }

    if (!newHandler.isResolved) {
      changing.push(oldHandler);
    }
  }

  if (leavingIndex !== null) {
    leaving = oldHandlers.slice(leavingIndex, oldHandlerLen);
    leavingChecker = function(name) {
      for (var h = 0, len = leaving.length; h < len; h++) {
        if (leaving[h].name === name) {
          return true;
        }
      }
      return false;
    };
  }

  trigger(router, oldHandlers, true, ['willTransition', newTransition]);

  if (router.willTransition) {
    router.willTransition(oldHandlers, newState.handlerInfos, newTransition);
  }
}

exports["default"] = Router;