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
 * @fileoverview Binds handlers for the password UI element.
 */

goog.provide('firebaseui.auth.ui.element.password');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('goog.ui.Component');


goog.scope(function() {
const element = goog.module.get('firebaseui.auth.ui.element');
const strings = goog.module.get('firebaseui.auth.soy2.strings');


/**
 * @return {!Element} The password input.
 * @this {goog.ui.Component}
 */
element.password.getPasswordElement = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-password')));
};


/**
 * @return {!Element} The error panel.
 * @this {goog.ui.Component}
 */
element.password.getPasswordErrorElement = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-password-error')));
};


/**
 * Validates the field and shows/clears the error message if necessary.
 * @param {!Element} passwordElement The password input.
 * @param {!Element} errorElement The error panel.
 * @return {boolean} True if field is valid.
 * @private
 */
element.password.validate_ = function(passwordElement, errorElement) {
  const password = element.getInputValue(passwordElement);
  if (password) {
    element.setValid(passwordElement, true);
    element.hide(errorElement);
    return true;
  } else {
    element.setValid(passwordElement, false);
    element.show(errorElement,
        strings.errorMissingPassword().toString());
    return false;
  }
};


/**
 * Initializes the password element.
 * @this {goog.ui.Component}
 */
element.password.initPasswordElement = function() {
  const passwordElement = element.password.getPasswordElement.call(this);
  const errorElement = element.password.getPasswordErrorElement.call(this);
  element.listenForInputEvent(this, passwordElement, function(e) {
    // Clear but not show error on-the-fly.
    if (element.isShown(errorElement)) {
      element.setValid(passwordElement, true);
      element.hide(errorElement);
    }
  });
};


/**
 * Gets the password.
 * It validates the field and shows/clears the error message if necessary.
 * @return {?string} The password.
 * @this {goog.ui.Component}
 */
element.password.checkAndGetPassword = function() {
  const passwordElement = element.password.getPasswordElement.call(this);
  const errorElement = element.password.getPasswordErrorElement.call(this);
  if (element.password.validate_(passwordElement, errorElement)) {
    return element.getInputValue(passwordElement);
  }
  return null;
};
});
