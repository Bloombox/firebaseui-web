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
 * @fileoverview UI component for the password sign-in page.
 */

goog.provide('firebaseui.auth.ui.page.PasswordSignIn');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.email');
goog.require('firebaseui.auth.ui.element.form');
goog.require('firebaseui.auth.ui.element.password');
goog.require('firebaseui.auth.ui.page.Base');


goog.scope(function() {
    const pageTemplates = goog.module.get('firebaseui.auth.soy2.page');
    /**
     * Password sign-in UI component.
     * @param {function()} onSubmitClick Callback to invoke when the submit button
     *     is clicked.
     * @param {function()} onForgotClick Callback to invoke when the forgot password
     *     link is clicked.
     * @param {string=} opt_email The email to prefill.
     * @param {?function()=} opt_tosCallback Callback to invoke when the ToS link
     *     is clicked.
     * @param {?function()=} opt_privacyPolicyCallback Callback to invoke when the
     *     Privacy Policy link is clicked.
     * @param {boolean=} opt_displayFullTosPpMessage Whether to display the full
     *     message of Term of Service and Privacy Policy.
     * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
     * @constructor
     * @extends {firebaseui.auth.ui.page.Base}
     */
    firebaseui.auth.ui.page.PasswordSignIn = function(
        onSubmitClick,
        onForgotClick,
        opt_email,
        opt_tosCallback,
        opt_privacyPolicyCallback,
        opt_displayFullTosPpMessage,
        opt_domHelper) {
    const ijData_ = {};
    if (opt_tosCallback) ijData_.tosCallback = opt_tosCallback;
    if (opt_privacyPolicyCallback) ijData_.privacyPolicyCallback = opt_privacyPolicyCallback;
    firebaseui.auth.ui.page.PasswordSignIn.base(
        this,
        'constructor',
        pageTemplates.passwordSignIn,
        {
            email: opt_email,
            displayFullTosPpMessage: !!opt_displayFullTosPpMessage
        },
        opt_domHelper,
        'passwordSignIn',
        ijData_ || null);

    /**
     * @private
     */
    this.onSubmitClick_ = onSubmitClick;

    /**
     * @private
     */
    this.onForgotClick_ = onForgotClick;
    };
    goog.inherits(firebaseui.auth.ui.page.PasswordSignIn,
        firebaseui.auth.ui.page.Base);


    /** @override */
    firebaseui.auth.ui.page.PasswordSignIn.prototype.enterDocument = function() {
    this.initEmailElement();
    this.initPasswordElement();
    this.initFormElement(this.onSubmitClick_, this.onForgotClick_);
    this.focusToNextOnEnter(this.getEmailElement(), this.getPasswordElement());
    // Submit if enter pressed in password element.
    this.submitOnEnter(this.getPasswordElement(), this.onSubmitClick_);
    // Auto focus.
    if (!firebaseui.auth.ui.element.getInputValue(this.getEmailElement())) {
        this.getEmailElement().focus();
    } else {
        this.getPasswordElement().focus();
    }
    firebaseui.auth.ui.page.PasswordSignIn.base(this, 'enterDocument');
    };


    /** @override */
    firebaseui.auth.ui.page.PasswordSignIn.prototype.disposeInternal = function() {
    this.onSubmitClick_ = null;
    this.onForgotClick_ = null;
    firebaseui.auth.ui.page.PasswordSignIn.base(this, 'disposeInternal');
    };


    goog.mixin(
        firebaseui.auth.ui.page.PasswordSignIn.prototype,
        /** @lends {firebaseui.auth.ui.page.PasswordSignIn.prototype} */
        {
        // For email.
        getEmailElement:
            firebaseui.auth.ui.element.email.getEmailElement,
        getEmailErrorElement:
            firebaseui.auth.ui.element.email.getEmailErrorElement,
        initEmailElement:
            firebaseui.auth.ui.element.email.initEmailElement,
        getEmail:
            firebaseui.auth.ui.element.email.getEmail,
        checkAndGetEmail:
            firebaseui.auth.ui.element.email.checkAndGetEmail,

        // For password.
        getPasswordElement:
            firebaseui.auth.ui.element.password.getPasswordElement,
        getPasswordErrorElement:
            firebaseui.auth.ui.element.password.getPasswordErrorElement,
        initPasswordElement:
            firebaseui.auth.ui.element.password.initPasswordElement,
        checkAndGetPassword:
            firebaseui.auth.ui.element.password.checkAndGetPassword,

        // For form.
        getSubmitElement:
            firebaseui.auth.ui.element.form.getSubmitElement,
        getSecondaryLinkElement:
            firebaseui.auth.ui.element.form.getSecondaryLinkElement,
        initFormElement:
            firebaseui.auth.ui.element.form.initFormElement
        });
});
