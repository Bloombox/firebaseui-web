/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview UI component for the email link sign in sent page.
 */

goog.provide('firebaseui.auth.ui.page.EmailLinkSignInSent');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.page.Base');


goog.scope(function() {
  const pageTemplates = goog.module.get('firebaseui.auth.soy2.page');
  /**
   * Email link sign in sent UI component.
   * @param {string} email The email formerly used to sign in.
   * @param {function()} onTroubleGetingEmailLinkClick Callback to invoke when
   *     the trouble getting email link is clicked.
   * @param {function()} onCancelClick Callback to invoke when the back button is
   *     clicked.
   * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
   *     is clicked.
   * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
   *     Privacy Policy link is clicked.
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   * @constructor
   * @extends {firebaseui.auth.ui.page.Base}
   */
  firebaseui.auth.ui.page.EmailLinkSignInSent = function(
      email,
      onTroubleGetingEmailLinkClick,
      onCancelClick,
      opt_tosCallback,
      opt_privacyPolicyCallback,
      opt_domHelper) {
    const ijData_ = {};
    if (opt_tosCallback) ijData_.tosCallback = opt_tosCallback;
    if (opt_privacyPolicyCallback) ijData_.privacyPolicyCallback = opt_privacyPolicyCallback;

    // Extend base page class and render email link sign in sent soy template.
    firebaseui.auth.ui.page.EmailLinkSignInSent.base(
        this,
        'constructor',
        pageTemplates.emailLinkSignInSent,
        {
          email: email
        },
        opt_domHelper,
        'emailLinkSignInSent',
        ijData_ || null);
    this.onTroubleGetingEmailLinkClick_ = onTroubleGetingEmailLinkClick;
    this.onCancelClick_ = onCancelClick;
  };
  goog.inherits(firebaseui.auth.ui.page.EmailLinkSignInSent,
      firebaseui.auth.ui.page.Base);


  /** @override */
  firebaseui.auth.ui.page.EmailLinkSignInSent.prototype.enterDocument =
      function() {
    const self = this;
    // Handle action event for cancel button.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getSecondaryLinkElement(), function(e) {
          self.onCancelClick_();
        });
    // Handle action event for trouble getting email link.
    firebaseui.auth.ui.element.listenForActionEvent(
        this, this.getTroubleGettingEmailLink(), function(e) {
          self.onTroubleGetingEmailLinkClick_();
        });
    // Set initial focus on the cancel button.
    this.getSecondaryLinkElement().focus();
    firebaseui.auth.ui.page.EmailLinkSignInSent.base(this, 'enterDocument');
  };


  /**
   * @return {!Element} The trouble getting email link.
   */
  firebaseui.auth.ui.page.EmailLinkSignInSent.prototype
      .getTroubleGettingEmailLink = function() {
    return /** @type {!Element} */ (
      this.getElementByClass(goog.getCssName('firebaseui-id-trouble-getting-email-link')));
  };


  /** @override */
  firebaseui.auth.ui.page.EmailLinkSignInSent.prototype.disposeInternal =
      function() {
    this.onTroubleGetingEmailLinkClick_ = null;
    this.onCancelClick_ = null;
    firebaseui.auth.ui.page.EmailLinkSignInSent.base(this, 'disposeInternal');
  };


  goog.mixin(
      firebaseui.auth.ui.page.EmailLinkSignInSent.prototype,
      /** @lends {firebaseui.auth.ui.page.EmailLinkSignInSent.prototype} */
      {
        // For form.
        getSecondaryLinkElement:
            firebaseui.auth.ui.element.form.getSecondaryLinkElement
      });
});
