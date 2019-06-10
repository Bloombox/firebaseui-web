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
 * @fileoverview Binds handlers for the new password UI element.
 */

goog.provide('firebaseui.auth.ui.element.newPassword');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('goog.dom.classlist');


goog.scope(function() {
const element = firebaseui.auth.ui.element;


/**
 * @return {!Element} The new password input.
 * @this {goog.ui.Component}
 */
element.newPassword.getNewPasswordElement = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-new-password')));
};


/**
 * @return {!Element} The toggle button to show or hide the password text.
 * @this {goog.ui.Component}
 */
element.newPassword.getPasswordToggleElement = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-password-toggle')));
};


/**
 * The CSS class for the "visiblility on" eye icon.
 *
 * @private
 * @const
 * @type {string}
 **/
const CLASS_TOGGLE_ON_ = goog.getCssName('firebaseui-input-toggle-on');


/**
 * The CSS class for the "visiblility off" eye icon.
 *
 * @private
 * @const
 * @type {string}
 */
const CLASS_TOGGLE_OFF_ = goog.getCssName('firebaseui-input-toggle-off');


/**
 * The CSS class for the eye icon when the input is focused.
 *
 * @private
 * @const
 * @type {string}
 */
const CLASS_TOGGLE_FOCUS_ = goog.getCssName('firebaseui-input-toggle-focus');


/**
 * The CSS class for the eye icon when the input is not focused.
 *
 * @private
 * @const
 * @type {string}
 */
const CLASS_TOGGLE_BLUR_ = goog.getCssName('firebaseui-input-toggle-blur');


/**
 * Toggles the visibility of the password text.
 * @this {goog.ui.Component}
 */
element.newPassword.togglePasswordVisible = function() {
  this.isPasswordVisible_ = !this.isPasswordVisible_;

  const toggleElement = element.newPassword.getPasswordToggleElement.call(this);
  const newPasswordElement = element.newPassword.getNewPasswordElement.call(this);

  if (this.isPasswordVisible_) {
    newPasswordElement['type'] = 'text';
    goog.dom.classlist.add(toggleElement, CLASS_TOGGLE_OFF_);
    goog.dom.classlist.remove(toggleElement, CLASS_TOGGLE_ON_);
  } else {
    newPasswordElement['type'] = 'password';
    goog.dom.classlist.add(toggleElement, CLASS_TOGGLE_ON_);
    goog.dom.classlist.remove(toggleElement, CLASS_TOGGLE_OFF_);
  }
  newPasswordElement.focus();
};


/**
 * @return {!Element} The error panel.
 * @this {goog.ui.Component}
 */
element.newPassword.getNewPasswordErrorElement = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-new-password-error')));
};


/**
 * Validates the password field and shows/clears the error message if necessary.
 * @param {!Element} newPasswordElement The new password input.
 * @param {!Element} errorElement The error panel.
 * @return {boolean} True if fields are valid.
 * @private
 */
element.newPassword.validate_ = function(newPasswordElement, errorElement) {
  const password = element.getInputValue(newPasswordElement) || '';
  if (!password) {
    element.setValid(newPasswordElement, false);
    element.show(errorElement,
        firebaseui.auth.soy2.strings.errorMissingPassword().toString());
    return false;
  } else {
    element.setValid(newPasswordElement, true);
    element.hide(errorElement);
    return true;
  }
};


/**
 * Initializes the new password element.
 * @this {goog.ui.Component}
 */
element.newPassword.initNewPasswordElement = function() {
  /**
   * @type {boolean}
   * @private
   */
  this.isPasswordVisible_ = false;

  const newPasswordElement = element.newPassword.getNewPasswordElement.call(this);
  newPasswordElement['type'] = 'password';

  const errorElement = element.newPassword.getNewPasswordErrorElement.call(this);

  element.listenForInputEvent(this, newPasswordElement, function(e) {
    // Clear but not show error on-the-fly.
    if (element.isShown(errorElement)) {
      element.setValid(newPasswordElement, true);
      element.hide(errorElement);
    }
  });

  const toggleElement = element.newPassword.getPasswordToggleElement.call(this);
  goog.dom.classlist.add(toggleElement, CLASS_TOGGLE_ON_);
  goog.dom.classlist.remove(toggleElement, CLASS_TOGGLE_OFF_);

  element.listenForFocusInEvent(this, newPasswordElement, function(e) {
    goog.dom.classlist.add(toggleElement, CLASS_TOGGLE_FOCUS_);
    goog.dom.classlist.remove(toggleElement, CLASS_TOGGLE_BLUR_);
  });

  element.listenForFocusOutEvent(this, newPasswordElement, function(e) {
    goog.dom.classlist.add(toggleElement, CLASS_TOGGLE_BLUR_);
    goog.dom.classlist.remove(toggleElement, CLASS_TOGGLE_FOCUS_);
  });

  element.listenForActionEvent(this, toggleElement,
      goog.bind(element.newPassword.togglePasswordVisible, this));
};


/**
 * Gets the new password.
 * It validates the fields and shows/clears the error message if necessary.
 * @return {?string} The new password.
 * @this {goog.ui.Component}
 */
element.newPassword.checkAndGetNewPassword = function() {
  const newPasswordElement = element.newPassword.getNewPasswordElement.call(this);
  const errorElement = element.newPassword.getNewPasswordErrorElement.call(this);
  if (element.newPassword.validate_(newPasswordElement, errorElement)) {
    return element.getInputValue(newPasswordElement);
  }
  return null;
};
}); // goog.scope
