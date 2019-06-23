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
 * @fileoverview Manages progress dialog boxes.
 */

goog.provide('firebaseui.auth.ui.element.progressDialog');
goog.provide('firebaseui.auth.ui.element.progressDialog.Progress');

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('goog.soy');
goog.require('goog.ui.Component');


goog.scope(function() {
  const elementTemplates = goog.module.get('firebaseui.auth.soy2.element');
  /**
   * Renders a dialog for showing progress.
   * @param {!firebaseui.auth.ui.element.progressDialog.State} state The
   *     loading state that we wish to show, reflected in the icon of the dialog.
   * @param {string} message The message to show on the progress dialog.
   * @this {goog.ui.Component}
   */
  firebaseui.auth.ui.element.progressDialog.showProgressDialog = function(
      state, message) {
    const progressDialog = goog.soy.renderAsElement(
        elementTemplates.progressDialog,
        {
          iconClass: state,
          message: message,
        },
        null,
        this.getDomHelper());
    firebaseui.auth.ui.element.dialog.showDialog.call(this, /** @type {!HTMLDialogElement} */ (
      progressDialog));
  };


  /**
   * The state of the dialog, which is reflected on the icon in the dialog.
   *
   * Internally, this is a map to the CSS class of the icon.
   * @enum {string}
   */
  firebaseui.auth.ui.element.progressDialog.State = {
    LOADING: [
      goog.getCssName('mdl-spinner'),
      goog.getCssName('mdl-spinner--single-color'),
      goog.getCssName('mdl-js-spinner'),
      goog.getCssName('is-active'),
      goog.getCssName('firebaseui-progress-dialog-loading-icon')].join(' '),
    DONE: goog.getCssName('firebaseui-icon-done')
  };
});
