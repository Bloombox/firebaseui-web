/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview UI component for the callback page.
 */

goog.provide('firebaseui.auth.ui.page.Callback');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.page.Base');


goog.scope(function() {
  const pageTemplates = goog.module.get('firebaseui.auth.soy2.page');
  /**
   * Callback page UI componenet.
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   * @constructor
   * @extends {firebaseui.auth.ui.page.Base}
   */
  firebaseui.auth.ui.page.Callback = function(opt_domHelper) {
    firebaseui.auth.ui.page.Callback.base(
        this,
        'constructor',
        pageTemplates.callback,
        undefined,
        opt_domHelper,
        'callback');
  };
  goog.inherits(firebaseui.auth.ui.page.Callback, firebaseui.auth.ui.page.Base);


  /**
   * Executes an API promise based request. This page already has a progress bar,
   * no need to show another progress bar when executing a promise.
   * @param {function(...):!goog.Promise} executor The request executor.
   * @param {!Array} parameters The API request array of parameters.
   * @param {function(*)} onSuccess The response handling success callback.
   * @param {function(*)} onError The response handling error callback.
   * @return {!goog.Promise} The pending promise.
   * @override
   */
  firebaseui.auth.ui.page.Callback.prototype.executePromiseRequest =
      function(executor, parameters, onSuccess, onError) {
    return executor.apply(null, parameters)
        .then(onSuccess, onError);
  };
});
