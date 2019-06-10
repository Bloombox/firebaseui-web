/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Binds handlers for resend UI element.
 */

goog.provide('firebaseui.auth.ui.element.resend');

goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('goog.dom');
goog.require('goog.ui.Component');


goog.scope(function() {
const element = firebaseui.auth.ui.element;


/**
 * @return {!Element} The resend countdown.
 *
 * @this {goog.ui.Component}
 */
element.resend.getResendCountdown = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-resend-countdown')));
};


/**
 * @return {!Element} The resend link.
 *
 * @this {goog.ui.Component}
 */
element.resend.getResendLink = function() {
  return /** @type {!Element} */ (
    this.getElementByClass(goog.getCssName('firebaseui-id-resend-link')));
};


/**
 * Hide the resend countdown.
 *
 * @this {goog.ui.Component}
 */
element.resend.hideResendCountdown = function() {
  const el = element.resend.getResendCountdown.call(this);
  element.hide(el);
};


/**
 * Show the resend link.
 * @this {goog.ui.Component}
 */
element.resend.showResendLink = function() {
  const el = element.resend.getResendLink.call(this);
  element.show(el);
};


/**
 * Updates the countdown.
 * @param {number} secondsRemaining The number of seconds remaining.
 * @this {goog.ui.Component}
 */
element.resend.updateResendCountdown = function(secondsRemaining) {
  const countdown = element.resend.getResendCountdown.call(this);
  const prefix = secondsRemaining > 9 ? '0:' : '0:0';
  const text = firebaseui.auth.soy2.strings
                 .resendCountdown({timeRemaining: prefix + secondsRemaining})
                 .toString();
  goog.dom.setTextContent(countdown, text);
};
});
