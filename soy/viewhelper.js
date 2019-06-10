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
 * @fileoverview Helpers for Soy viewer.
 */

goog.provide('firebaseui.auth.soy2.viewHelper');
goog.setTestOnly('firebaseui.auth.soy2.viewHelper');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.safe');
goog.require('goog.dom.TagName');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string.Const');


const imgEl_ = goog.dom.TagName.IMAGE.toString();
const linkEl_ = goog.dom.TagName.LINK.toString();
const headEl_ = goog.dom.TagName.HEAD.toString();


/**
 * Enumerates classes used in the view helper.
 *
 * @enum {!string}
 */
const ViewHelperClasses_ = {
  FIREBASE_INPUT: goog.getCssName('firebaseui-input'),
  FIREBASE_INPUT_INVALID: goog.getCssName('firebaseui-input-invalid'),
  RECAPTCHA_CONTAINER: goog.getCssName('firebaseui-recaptcha-container'),
  FIREBASE_HIDDEN: goog.getCssName('firebaseui-hidden')
};


function isViewerMode() {
  return typeof thisIsRunningInSoyViewerMode != 'undefined' &&
      !!thisIsRunningInSoyViewerMode;
}


function isRtlMode() {
  return typeof thisIsRunningInRtlMode != 'undefined' &&
      !!thisIsRunningInRtlMode;
}


function loadCss(path) {
  var link = goog.dom.createElement(linkEl_);
  link.type = 'text/css';
  goog.dom.safe.setLinkHrefAndRel(
      link,
      goog.html.TrustedResourceUrl.fromConstant(goog.string.Const.from(path)),
      'stylesheet');
  var head = goog.dom.getElementsByTagNameAndClass(headEl_)[0];
  goog.dom.insertChildAt(head, link, 0);
}


/**
 * Simulates a reCAPTCHA being rendered for UI testing. This will just load a
 * mock visible reCAPTCHA in the reCAPTCHA element.
 * @param {Element} container The root container that holds the reCAPTCHA.
 */
function loadRecaptcha(container) {
  var root = goog.dom.getElement(container);
  var recaptchaContainer =
      goog.dom.getElementByClass(ViewHelperClasses_.RECAPTCHA_CONTAINER, root);
  recaptchaContainer.style.display = 'block';
  var img = goog.dom.createElement(imgEl_);
  img.src = '../image/test/recaptcha-widget.png';
  recaptchaContainer.appendChild(img);
}


function setInvalid(root, id) {
  var e = goog.dom.getElementByClass(goog.getCssName(id), root);
  goog.dom.classlist.addRemove(
      e, ViewHelperClasses_.FIREBASE_INPUT, ViewHelperClasses_.FIREBASE_INPUT_INVALID);
}


function setError(root, id, message) {
  var e = goog.dom.getElementByClass(goog.getCssName(id), root);
  goog.dom.setTextContent(e, message);
  goog.dom.classlist.remove(e, ViewHelperClasses_.FIREBASE_HIDDEN);
}

function initViewer(file) {
  if (isViewerMode()) {
    if (isRtlMode()) {
      loadCss('../stylesheet/firebase-ui_rtl.css');
    } else {
      loadCss('../stylesheet/firebase-ui_ltr.css');
    }
  }
}
