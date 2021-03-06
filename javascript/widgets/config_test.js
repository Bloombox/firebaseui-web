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
 * @fileoverview Tests for config.js
 */

goog.provide('firebaseui.auth.widget.ConfigTest');

goog.require('firebaseui.auth.CredentialHelper');
goog.require('firebaseui.auth.log');
goog.require('firebaseui.auth.testing.FakeUtil');
goog.require('firebaseui.auth.util');
goog.require('firebaseui.auth.widget.Config');
goog.require('goog.array');
goog.require('goog.testing');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.widget.ConfigTest');

var config;
var stub = new goog.testing.PropertyReplacer();
var testUtil;
var errorLogMessages = [];
var warningLogMessages = [];
var firebase = {};


function setUp() {
  config = new firebaseui.auth.widget.Config();
  // Remember error log messages.
  stub.replace(firebaseui.auth.log, 'error', function(msg) {
    errorLogMessages.push(msg);
  });
  // Remember error warning messages.
  stub.replace(firebaseui.auth.log, 'warning', function(msg) {
    warningLogMessages.push(msg);
  });
  firebase.auth = {
    GoogleAuthProvider: {PROVIDER_ID: 'google.com'},
    GithubAuthProvider: {PROVIDER_ID: 'github.com'},
    FacebookAuthProvider: {PROVIDER_ID: 'facebook.com'},
    EmailAuthProvider: {
      EMAIL_LINK_SIGN_IN_METHOD: 'emailLink',
      EMAIL_PASSWORD_SIGN_IN_METHOD: 'password',
      PROVIDER_ID: 'password',
    },
    PhoneAuthProvider: {PROVIDER_ID: 'phone'}
  };
  testUtil = new firebaseui.auth.testing.FakeUtil().install();
}


function tearDown() {
  errorLogMessages = [];
  warningLogMessages = [];
  stub.reset();
}


function testGetAcUiConfig() {
  assertNull(config.getAcUiConfig());
  var ui = {favicon: 'http://localhost/favicon.ico'};
  config.update('acUiConfig', ui);
  assertObjectEquals(ui, config.getAcUiConfig());
}


function testGetQueryParameterForSignInSuccessUrl() {
  // Confirm default value for query parameter for sign-in success URL.
  assertEquals(
      'signInSuccessUrl',
      config.getQueryParameterForSignInSuccessUrl());
  // Update query parameter.
  config.update('queryParameterForSignInSuccessUrl', 'continue');
  // Confirm value changed.
  assertEquals(
      'continue',
      config.getQueryParameterForSignInSuccessUrl());
}


function testGetRequiredWidgetUrl() {
  assertThrows(function() {config.getRequiredWidgetUrl();});
  config.update('widgetUrl', 'http://localhost/callback');

  var widgetUrl = config.getRequiredWidgetUrl();
  assertEquals('http://localhost/callback', widgetUrl);
  widgetUrl = config.getRequiredWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode=select', widgetUrl);

  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getRequiredWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode2=select', widgetUrl);
}


function testFederatedProviderShouldImmediatelyRedirect() {
  // Returns true when immediateFederatedRedirect is set, there is
  // only one federated provider and the signInFlow is set to redirect.
  config.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    'signInFlow': firebaseui.auth.widget.Config.SignInFlow.REDIRECT
  });
  assertTrue(config.federatedProviderShouldImmediatelyRedirect());

  // Returns false if the immediateFederatedRedirect option is false.
  config.setConfig({
    'immediateFederatedRedirect': false,
    'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    'signInFlow': firebaseui.auth.widget.Config.SignInFlow.REDIRECT
  });
  assertFalse(config.federatedProviderShouldImmediatelyRedirect());

  // Returns false if the provider is not a federated provider.
  config.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    'signInFlow': firebaseui.auth.widget.Config.SignInFlow.REDIRECT
  });
  assertFalse(config.federatedProviderShouldImmediatelyRedirect());

  // Returns false if there is more than one federated provider.
  config.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    'signInFlow': firebaseui.auth.widget.Config.SignInFlow.REDIRECT
  });
  assertFalse(config.federatedProviderShouldImmediatelyRedirect());

  // Returns false if there is more than one provider of any kind.
  config.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    'signInFlow': firebaseui.auth.widget.Config.SignInFlow.REDIRECT
  });
  assertFalse(config.federatedProviderShouldImmediatelyRedirect());

  // Returns false if signInFlow is using a popup.
  config.setConfig({
    'immediateFederatedRedirect': true,
    'signInOptions': [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    'signInFlow': firebaseui.auth.widget.Config.SignInFlow.POPUP
  });
  assertFalse(config.federatedProviderShouldImmediatelyRedirect());
}


function testGetSignInFlow() {
  // Confirm default value for sign-in flow
  assertEquals(
      'redirect',
      config.getSignInFlow());
  // Update sign-in flow parameter to popup flow.
  config.update('signInFlow', 'popup');
  // Confirm value changed.
  assertEquals(
      'popup',
      config.getSignInFlow());
  // Use an invalid option. Redirect should be returned.
  // Update sign-in flow parameter.
  config.update('signInFlow', 'continue');
  assertEquals(
      'redirect',
      config.getSignInFlow());
}


function testGetWidgetUrl_notSpecified() {
  var widgetUrl = config.getWidgetUrl();
  assertEquals(window.location.href, widgetUrl);
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(window.location.href + '?mode=select', widgetUrl);

  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(window.location.href + '?mode2=select', widgetUrl);
}


function testGetWidgetUrl_notSpecified_withQueryAndFragment() {
  // Simulate current URL has mode/mode2 queries, other query parameters and a
  // fragment.
  stub.replace(
      firebaseui.auth.util,
      'getCurrentUrl',
      function() {
        return 'http://www.example.com/path/?mode=foo&mode2=bar#a=1';
      });
  var widgetUrl = config.getWidgetUrl();
  // The same current URL should be returned.
  assertEquals(
      firebaseui.auth.util.getCurrentUrl(), widgetUrl);
  // Only the mode query param should be overwritten.
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(
      'http://www.example.com/path/?mode2=bar&mode=select#a=1', widgetUrl);

  // Only the mode2 query param should be overwritten.
  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals(
      'http://www.example.com/path/?mode=foo&mode2=select#a=1', widgetUrl);
}


function testGetWidgetUrl_specified() {
  config.update('widgetUrl', 'http://localhost/callback');
  var widgetUrl = config.getWidgetUrl();
  assertEquals('http://localhost/callback', widgetUrl);
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode=select', widgetUrl);

  config.update('queryParameterForWidgetMode', 'mode2');
  widgetUrl = config.getWidgetUrl(
      firebaseui.auth.widget.Config.WidgetMode.SELECT);
  assertEquals('http://localhost/callback?mode2=select', widgetUrl);
}


function testGetSignInSuccessUrl() {
  assertUndefined(config.getSignInSuccessUrl());
  config.update('signInSuccessUrl', 'http://localhost/home');
  assertEquals(
      'http://localhost/home', config.getSignInSuccessUrl());
}


function testGetProviders_providerIds() {
  assertArrayEquals([], config.getProviders());
  config.update('signInOptions', ['google.com', 'github.com', 'twitter.com']);
  // Check that predefined OAuth providers are included in the list in the
  // correct order.
  assertArrayEquals(
      ['google.com', 'github.com', 'twitter.com'],
      config.getProviders());

  // Test when password accounts are to be enabled.
  config.update('signInOptions', ['google.com', 'password']);
  // Check that password accounts are included in the list in the correct
  // order.
  assertArrayEquals(['google.com', 'password'], config.getProviders());

  // Test when phone accounts are to be enabled.
  config.update('signInOptions', ['google.com', 'phone']);
  // Check that phone accounts are included in the list in the correct
  // order.
  assertArrayEquals(['google.com', 'phone'], config.getProviders());

  // Test when anonymous provider is to be enabled.
  config.update('signInOptions', ['google.com', 'anonymous']);
  // Check that anonymous provider is included in the list in the correct
  // order.
  assertArrayEquals(['google.com', 'anonymous'], config.getProviders());

  // Test when generic provider is to be enabled.
  config.update('signInOptions',
                [
                  'google.com',
                  {
                    'provider': 'microsoft.com',
                    'providerName': 'Microsoft',
                    'buttonColor': '#FFB6C1',
                    'iconUrl': '<url-of-the-icon-of-the-sign-in-button>'
                  }
                ]);
  // Check that generic provider is included in the list in the correct
  // order.
  assertArrayEquals(['google.com', 'microsoft.com'], config.getProviders());
}


function testGetProviders_fullConfig() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['foo', 'bar']
    },
    {'provider': 'github.com'},
    'facebook.com',
    {
      'provider': 'microsoft.com',
      'providerName': 'Microsoft',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>'

    },
    {'not a': 'valid config'},
    {'provider': 'phone', 'recaptchaParameters': {'size': 'invisible'}},
    {'provider': 'anonymous'}
  ]);
  // Check that invalid configs are not included.
  assertArrayEquals(
      ['google.com', 'github.com', 'facebook.com', 'microsoft.com', 'phone',
       'anonymous'],
      config.getProviders());
}


function testGetProviderConfigs() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['foo', 'bar'],
      // providerName, buttonColor and iconUrl should be override with null.
      'providerName': 'Google',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>'
    },
    'facebook.com',
    {
      'provider': 'microsoft.com',
      'providerName': 'Microsoft',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
      'loginHintKey': 'login_hint'
    },
    {'not a': 'valid config'},
    {
      'provider': 'yahoo.com',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>'
    }
  ]);
  var providerConfigs = config.getProviderConfigs();
  assertEquals(4, providerConfigs.length);
  assertObjectEquals({
    providerId: 'google.com',
  }, providerConfigs[0]);
  assertObjectEquals({
    providerId: 'facebook.com',
  }, providerConfigs[1]);
  assertObjectEquals({
    providerId: 'microsoft.com',
    providerName: 'Microsoft',
    buttonColor: '#FFB6C1',
    iconUrl: '<url-of-the-icon-of-the-sign-in-button>',
    loginHintKey: 'login_hint'
  }, providerConfigs[2]);
  assertObjectEquals({
    providerId: 'yahoo.com',
    // ProviderName should default to providerId if not provided.
    providerName: 'yahoo.com',
    buttonColor: '#FFB6C1',
    iconUrl: '<url-of-the-icon-of-the-sign-in-button>',
    loginHintKey: null
  }, providerConfigs[3]);
}


function testGetConfigForProvider() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['foo', 'bar'],
      // providerName, buttonColor and iconUrl should be override with null.
      'providerName': 'Google',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>'
    },
    'facebook.com',
    {
      'provider': 'microsoft.com',
      'providerName': 'Microsoft',
      'buttonColor': '#FFB6C1',
      'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
      'loginHintKey': 'login_hint'
    },
    {'not a': 'valid config'},
    {
      'provider': 'yahoo.com',
      'providerName': 'Yahoo',
      'buttonColor': '#FFB6C1',
      'iconUrl': 'javascript:doEvilStuff()'
    }
  ]);
  assertObjectEquals({
    providerId: 'google.com'
  }, config.getConfigForProvider('google.com'));
  assertObjectEquals({
    providerId: 'facebook.com'
  }, config.getConfigForProvider('facebook.com'));
  assertObjectEquals({
    providerId: 'microsoft.com',
    providerName: 'Microsoft',
    buttonColor: '#FFB6C1',
    iconUrl: '<url-of-the-icon-of-the-sign-in-button>',
    loginHintKey: 'login_hint'
  }, config.getConfigForProvider('microsoft.com'));
  assertNull(config.getConfigForProvider('INVALID_ID'));
  assertObjectEquals({
    providerId: 'yahoo.com',
    providerName: 'Yahoo',
    buttonColor: '#FFB6C1',
    iconUrl: 'about:invalid#zClosurez',
    loginHintKey: null
  }, config.getConfigForProvider('yahoo.com'));
}


function testGetRecaptchaParameters() {
  // Empty config.
  assertNull(config.getRecaptchaParameters());

  // No phone provider config.
  config.update('signInOptions', [{'provider': 'google.com'}]);
  assertNull(config.getRecaptchaParameters());

  // Phone config with no additional parameters.
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'}, {'provider': 'phone'}]);
  assertNull(config.getRecaptchaParameters());

    // Phone config with invalid reCAPTCHA parameters.
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'},
       {'provider': 'phone', 'recaptchaParameters': [1, true]}, 'password']);
  assertNull(config.getRecaptchaParameters());

  // Phone config with an empty object reCAPTCHA parameters.
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'},
       {'provider': 'phone', 'recaptchaParameters': {}}, 'password']);
  assertObjectEquals({}, config.getRecaptchaParameters());

  // Confirm no warning logged so far.
  assertArrayEquals([], warningLogMessages);

  // Phone config with blacklisted reCAPTCHA parameters.
  var blacklist = {
    'sitekey': 'SITEKEY',
    'tabindex': 0,
    'callback': function(token) {},
    'expired-callback': function() {}
  };
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'},
       {'provider': 'phone', 'recaptchaParameters': blacklist}, 'password']);
  assertObjectEquals({}, config.getRecaptchaParameters());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'The following provided "recaptchaParameters" keys are not allowed: ' +
        'sitekey, tabindex, callback, expired-callback'
      ], warningLogMessages);
  // Reset warnings.
  warningLogMessages = [];

  // Phone config with blacklisted, valid and invalid reCAPTCHA parameters.
  var mixed = {
    'sitekey': 'SITEKEY',
    'tabindex': 0,
    'callback': function(token) {},
    'expired-callback': function() {},
    'type': 'audio',
    'size': 'invisible',
    'badge': 'bottomleft',
    'theme': 'dark',
    'foo': 'bar'
  };
  var expectedParameters = {
    'type': 'audio',
    'size': 'invisible',
    'badge': 'bottomleft',
    'theme': 'dark',
    'foo': 'bar'
  };
  config.update(
      'signInOptions',
      ['github.com', {'provider': 'google.com'},
       {'provider': 'phone', 'recaptchaParameters': mixed}, 'password']);
  assertObjectEquals(expectedParameters, config.getRecaptchaParameters());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'The following provided "recaptchaParameters" keys are not allowed: ' +
        'sitekey, tabindex, callback, expired-callback'
      ], warningLogMessages);

  // No error should be logged.
  assertArrayEquals([], errorLogMessages);
}


function testGetProviderCustomParameters_noSignInOptions() {
  config.update('signInOptions', null);
  assertNull(config.getProviderCustomParameters('google.com'));
}


function testGetProviderCustomParameters_genericProvider() {
  config.update('signInOptions', [{
    'provider': 'microsoft.com',
    'providerName': 'Microsoft',
    'buttonColor': '#FFB6C1',
    'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
    'customParameters': {'foo': 'bar'}
  }]);
  assertObjectEquals({'foo': 'bar'},
                     config.getProviderCustomParameters('microsoft.com'));
}


function testGetProviderCustomParameters_missingCustomParameters() {
  config.update('signInOptions', [{
    'provider': 'google.com',
  }]);
  assertNull(config.getProviderCustomParameters('google.com'));
}


function testGetProviderCustomParameters_multipleIdp() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['google1', 'google2'],
      'customParameters': {
        'prompt': 'select_account',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'scopes': ['facebook1', 'facebook2'],
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      }
    },
    'github.com'
  ]);
  assertObjectEquals(
      {'prompt': 'select_account'},
      config.getProviderCustomParameters('google.com'));
  assertObjectEquals(
      {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      },
      config.getProviderCustomParameters('facebook.com'));
  assertNull(config.getProviderCustomParameters('github.com'));
  assertNull(config.getProviderCustomParameters('twitter.com'));
}


function testGetProviderCustomParameters_github() {
  config.update('signInOptions', [
    {
      'provider': 'github.com',
      'customParameters': {
        'allow_signup': 'false',
        'login': 'user@example.com'
      }
    }
  ]);
  // login custom parameter should be deleted.
  assertObjectEquals(
      {
        'allow_signup': 'false'
      },
      config.getProviderCustomParameters('github.com'));
}


function testIsAccountSelectionPromptEnabled_googleLoginHint() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'select_account',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      }
    },
    'github.com'
  ]);
  assertTrue(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_nonGoogleLoginHint() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
        // This does nothing.
        'prompt': 'select_account'
      }
    },
    'github.com',
    'password'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_noCustomParameter() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['google1', 'google2']
    },
    'github.com'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_noAdditionalParameters() {
  config.update('signInOptions', [
    'google.com'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testIsAccountSelectionPromptEnabled_noOAuthProvider() {
  config.update('signInOptions', [
    'phone',
    'password'
  ]);
  assertFalse(config.isAccountSelectionPromptEnabled());
}


function testGetProviderIdFromAuthMethod() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none'
      },
      'authMethod': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    },
    {
      'provider': 'password',
      'authMethod': 'googleyolo://id-and-password'
    },
    {
      'authMethod': 'unknown'
    }
  ]);
  assertEquals(
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      config.getProviderIdFromAuthMethod('https://accounts.google.com'));
  assertEquals(
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      config.getProviderIdFromAuthMethod('googleyolo://id-and-password'));
  // Test with authMethod that is not provided in the configuration.
  assertNull(config.getProviderIdFromAuthMethod('https://www.facebook.com'));
  // Test with null authMethod.
  assertNull(config.getProviderIdFromAuthMethod(null));
  // Test with authMethod that does not have a provider ID in the configuration.
  assertNull(config.getProviderIdFromAuthMethod('unknown'));
}


function testGetGoogleYoloConfig_availableAndEnabled() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none'
      },
      'authMethod': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    },
    {
      'provider': 'password',
      'authMethod': 'googleyolo://id-and-password'
    },
    {
      'authMethod': 'unknown'
    },
    {
      'provider': 'facebook.com',
      // authMethod is required.
      'clientId': 'CLIENT_ID'
    }
  ]);
  // GOOGLE_YOLO credentialHelper must be selected.
  config.update(
      'credentialHelper', firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  var expectedConfig = {
    'supportedAuthMethods': [
      'https://accounts.google.com',
      'googleyolo://id-and-password'
    ],
    'supportedIdTokenProviders': [
      {
        'uri': 'https://accounts.google.com',
        'clientId': '1234567890.apps.googleusercontent.com'
      }
    ]
  };
  assertObjectEquals(expectedConfig, config.getGoogleYoloConfig());
}


function testGetGoogleYoloConfig_notEnabled() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none'
      },
      'authMethod': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    },
    {
      'provider': 'password',
      'authMethod': 'googleyolo://id-and-password'
    },
    {
      'authMethod': 'unknown'
    },
    {
      'provider': 'facebook.com',
      // authMethod is required.
      'clientId': 'CLIENT_ID'
    }
  ]);
  // GOOGLE_YOLO credentialHelper not selected.
  config.update(
      'credentialHelper', firebaseui.auth.CredentialHelper.NONE);
  assertNull(config.getGoogleYoloConfig());
}


function testGetGoogleYoloConfig_notAvailable() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'customParameters': {
        'prompt': 'none',
        'login_hint': 'user@example.com'
      }
    },
    {
      'provider': 'facebook.com',
      'customParameters': {
        'display': 'popup',
        'auth_type': 'rerequest',
        'locale': 'pt_BR',
      }
    },
    'github.com',
    'password',
    // authMethod with no provider.
    {
      'authMethod': 'unknown'
    },
    // clientId with no authMethod.
    {
      'provider': 'facebook.com',
      // authMethod is required.
      'clientId': 'CLIENT_ID'
    }
  ]);
  // GOOGLE_YOLO credentialHelper is selected.
  config.update(
      'credentialHelper', firebaseui.auth.CredentialHelper.GOOGLE_YOLO);
  assertNull(config.getGoogleYoloConfig());
}


function testGetPhoneAuthDefaultCountry() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'gb'
  }]);
  assertEquals('United Kingdom', config.getPhoneAuthDefaultCountry().name);
  assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultCountry_defaultCountryAndLoginHint() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'gb',
    // loginHint will be ignored in favor of the above.
    'loginHint': '+112345678890'
  }]);
  assertEquals('United Kingdom', config.getPhoneAuthDefaultCountry().name);
  assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultCountry_loginHintOnly() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'loginHint': '+4412345678890'
  }]);
  assertEquals('Guernsey', config.getPhoneAuthDefaultCountry().name);
  assertEquals('44', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultCountry_null() {
  config.update('signInOptions', null);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_noCountrySpecified() {
  config.update('signInOptions', [{
    'provider': 'phone'
  }]);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_invalidIdp() {
  config.update('signInOptions', [{
    'provider': 'google.com',
    'defaultCountry': 'gb',
    'loginHint': '+112345678890'
  }]);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_invalidCountry() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'zz'
  }]);
  assertNull(config.getPhoneAuthDefaultCountry());
}


function testGetPhoneAuthDefaultCountry_invalidDefaultCountry_loginHint() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'zz',
    'loginHint': '+112345678890'
  }]);
  // Since the defaultCountry is invalid, loginHint will be used instead.
  assertEquals('United States', config.getPhoneAuthDefaultCountry().name);
  assertEquals('1', config.getPhoneAuthDefaultCountry().e164_cc);
}


function testGetPhoneAuthDefaultNationalNumber() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultCountry': 'us',
    'defaultNationalNumber': '1234567890'
  }]);
  assertEquals('1234567890', config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_defaultNationalNumberAndHint() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'defaultNationalNumber': '1234567890',
    // loginHint will be ignored in favor of the above.
    'loginHint': '+12223334444'
  }]);
  assertEquals('1234567890', config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_loginHintOnly() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'loginHint': '+12223334444'
  }]);
  assertEquals('2223334444', config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_null() {
  config.update('signInOptions', null);
  assertNull(config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_noNationalNumberSpecified() {
  config.update('signInOptions', [{
    'provider': 'phone'
  }]);
  assertNull(config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthDefaultNationalNumber_invalidIdp() {
  config.update('signInOptions', [{
    'provider': 'google.com',
    'defaultCountry': 'ca',
    'defaultNationalNumber': '1234567890',
    'loginHint': '+12223334444'
  }]);
  assertNull(config.getPhoneAuthDefaultNationalNumber());
}


function testGetPhoneAuthSelectedCountries_whitelist() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'whitelistedCountries': ['+44', 'us']
  }]);
  var countries = config.getPhoneAuthAvailableCountries();
  var actualKeys = goog.array.map(countries, function(country) {
    return country.e164_key;
  });
  assertSameElements(
      ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0', '1-US-0'], actualKeys);
}


function testGetPhoneAuthSelectedCountries_whitelist_overlap() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'whitelistedCountries': ['+44', 'GB']
  }]);
  var countries = config.getPhoneAuthAvailableCountries();
  var actualKeys = goog.array.map(countries, function(country) {
    return country.e164_key;
  });
  assertSameElements(['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0'], actualKeys);
}


function testGetPhoneAuthSelectedCountries_blacklist() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'blacklistedCountries': ['+44', 'US']
  }]);
  var countries = config.getPhoneAuthAvailableCountries();
  // BlacklistedCountries should not appear in the available countries list.
  var blacklistedKeys = ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0', '1-US-0'];
  for (var i = 0; i < countries.length; i++) {
    assertNotContains(countries[i].e164_key, blacklistedKeys);
  }
}


function testGetPhoneAuthSelectedCountries_blacklist_overlap() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'blacklistedCountries': ['+44', 'GB']
  }]);
  var countries = config.getPhoneAuthAvailableCountries();
  // BlacklistedCountries should not appear in the available countries list.
  var blacklistedKeys = ['44-GG-0', '44-IM-0', '44-JE-0', '44-GB-0'];
  for (var i = 0; i < countries.length; i++) {
    assertNotContains(countries[i].e164_key, blacklistedKeys);
  }
}


function testGetPhoneAuthSelectedCountries_noBlackOrWhiteListProvided() {
  config.update('signInOptions', [{
    'provider': 'phone'
  }]);
  var countries = config.getPhoneAuthAvailableCountries();
  assertSameElements(firebaseui.auth.data.country.COUNTRY_LIST, countries);
}


function testGetPhoneAuthSelectedCountries_emptyBlacklist() {
  config.update('signInOptions', [{
    'provider': 'phone',
    'blacklistedCountries': []
  }]);
  var countries = config.getPhoneAuthAvailableCountries();
  assertSameElements(firebaseui.auth.data.country.COUNTRY_LIST, countries);
}


function testUpdateConfig_phoneSignInOption_error() {
  // Tests when both whitelist and blacklist are provided.
  var error = assertThrows(function() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'blacklistedCountries': ['+44'],
      'whitelistedCountries': ['+1']
    }]);
  });
  assertEquals(
      'Both whitelistedCountries and blacklistedCountries are provided.',
      error.message);
  // Tests when empty whitelist is provided.
  error = assertThrows(function() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'whitelistedCountries': []
    }]);
  });
  assertEquals(
      'WhitelistedCountries must be a non-empty array.',
      error.message);
  // Tests string is provided as whitelistedCountries.
  error = assertThrows(function() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'whitelistedCountries': 'US'
    }]);
  });
  assertEquals(
      'WhitelistedCountries must be a non-empty array.',
      error.message);
  // Tests falsy value is provided as whitelistedCountries.
  error = assertThrows(function() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'whitelistedCountries': 0
    }]);
  });
  assertEquals(
      'WhitelistedCountries must be a non-empty array.',
      error.message);
  // Tests string is provided as blacklistedCountries.
  error = assertThrows(function() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'blacklistedCountries': 'US'
    }]);
  });
  assertEquals(
      'BlacklistedCountries must be an array.',
      error.message);
  // Tests falsy value is provided as blacklistedCountries.
  error = assertThrows(function() {
    config.update('signInOptions', [{
      'provider': 'phone',
      'blacklistedCountries': 0
    }]);
  });
  assertEquals(
      'BlacklistedCountries must be an array.',
      error.message);
}


function testSetConfig_phoneSignInOption_error() {
  // Tests when both whitelist and blacklist are provided.
  var error = assertThrows(function() {
    config.setConfig({
      'signInOptions': [{
        'provider': 'phone',
        'blacklistedCountries': ['+44'],
        'whitelistedCountries': ['+1']
      }]
    });
  });
  assertEquals(
      'Both whitelistedCountries and blacklistedCountries are provided.',
      error.message);
  // Tests when empty whitelist is provided.
  error = assertThrows(function() {
    config.setConfig({
      'signInOptions': [{
        'provider': 'phone',
        'whitelistedCountries': []
      }]
    });
  });
  assertEquals(
      'WhitelistedCountries must be a non-empty array.',
      error.message);
  // Tests string is provided as whitelistedCountries.
  error = assertThrows(function() {
    config.setConfig({
      'signInOptions': [
        {
          'provider': 'phone',
          'whitelistedCountries': 'US'
        }]
    });
  });
  assertEquals(
      'WhitelistedCountries must be a non-empty array.',
      error.message);
  // Tests falsy value is provided as whitelistedCountries.
  error = assertThrows(function() {
    config.setConfig({
      'signInOptions': [
        {
          'provider': 'phone',
          'whitelistedCountries': 0
        }]
    });
  });
  assertEquals(
      'WhitelistedCountries must be a non-empty array.',
      error.message);
  // Tests string is provided as blacklistedCountries.
  error = assertThrows(function() {
    config.setConfig({
      'signInOptions': [
        {
          'provider': 'phone',
          'blacklistedCountries': 'US'
        }]
    });
  });
  assertEquals(
      'BlacklistedCountries must be an array.',
      error.message);
  // Tests falsy value is provided as blacklistedCountries.
  error = assertThrows(function() {
    config.setConfig({
      'signInOptions': [
        {
          'provider': 'phone',
          'blacklistedCountries': 0
        }]
    });
  });
  assertEquals(
      'BlacklistedCountries must be an array.',
      error.message);
}


function testGetProviderAdditionalScopes_noSignInOptions() {
  config.update('signInOptions', null);
  assertArrayEquals([], config.getProviderAdditionalScopes('google.com'));
}


function testGetProviderAdditionalScopes_genericProvider() {
  config.update('signInOptions', [{
    'provider': 'microsoft.com',
    'providerName': 'Microsoft',
    'buttonColor': '#FFB6C1',
    'iconUrl': '<url-of-the-icon-of-the-sign-in-button>',
    'scopes': ['foo', 'bar']
  }]);
  assertArrayEquals(['foo', 'bar'],
                    config.getProviderAdditionalScopes('microsoft.com'));
}


function testGetProviderAdditionalScopes_missingScopes() {
  config.update('signInOptions', [{
    'provider': 'google.com',
  }]);
  assertArrayEquals([], config.getProviderAdditionalScopes('google.com'));
}


function testGetProviderAdditionalScopes_multipleIdp() {
  config.update('signInOptions', [
    {
      'provider': 'google.com',
      'scopes': ['google1', 'google2']
    },
    {
      'provider': 'github.com',
      'scopes': ['github1', 'github2']
    },
    'facebook.com'
  ]);
  assertArrayEquals(
      ['google1', 'google2'],
      config.getProviderAdditionalScopes('google.com'));
  assertArrayEquals(
      ['github1', 'github2'],
      config.getProviderAdditionalScopes('github.com'));
  assertArrayEquals(
      [],
      config.getProviderAdditionalScopes('facebook.com'));
  assertArrayEquals(
      [],
      config.getProviderAdditionalScopes('twitter.com'));
}


function testGetQueryParameterForWidgetMode() {
  assertEquals('mode', config.getQueryParameterForWidgetMode());
  config.update('queryParameterForWidgetMode', 'mode2');
  assertEquals('mode2', config.getQueryParameterForWidgetMode());
}


function testGetTosUrl() {
  assertNull(config.getTosUrl());
  config.update('tosUrl', 'http://localhost/tos');
  assertNull(config.getTosUrl());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'Privacy Policy URL is missing, the link will not be displayed.'
      ], warningLogMessages);
  config.update('privacyPolicyUrl', 'http://localhost/privacy_policy');
  var tosCallback = config.getTosUrl();
  tosCallback();
  testUtil.assertOpen('http://localhost/tos', '_blank');
  // No additional warning logged.
  assertArrayEquals(
      [
        'Privacy Policy URL is missing, the link will not be displayed.'
      ], warningLogMessages);
  // Mock that Cordova InAppBrowser plugin is installed.
  stub.replace(
      firebaseui.auth.util,
      'isCordovaInAppBrowserInstalled',
      function() {
        return true;
      });
  tosCallback = config.getTosUrl();
  tosCallback();
  // Target should be _system if Cordova InAppBrowser plugin is installed.
  testUtil.assertOpen('http://localhost/tos', '_system');
  // Tests if callback function is passed to tosUrl config.
  tosCallback = function() {};
  config.update('tosUrl', tosCallback);
  assertEquals(tosCallback, config.getTosUrl());
  // Tests if invalid tyoe is passed to tosUrl config.
  config.update('tosUrl', 123456);
  assertNull(config.getTosUrl());
}


function testGetPrivacyPolicyUrl() {
  assertNull(config.getPrivacyPolicyUrl());
  config.update('privacyPolicyUrl', 'http://localhost/privacy_policy');
  assertNull(config.getPrivacyPolicyUrl());
  // Expected warning should be logged.
  assertArrayEquals(
      [
        'Term of Service URL is missing, the link will not be displayed.'
      ], warningLogMessages);
  config.update('tosUrl', 'http://localhost/tos');
  var privacyPolicyCallback = config.getPrivacyPolicyUrl();
  privacyPolicyCallback();
  testUtil.assertOpen('http://localhost/privacy_policy', '_blank');
  // No additional warning logged.
  assertArrayEquals(
      [
        'Term of Service URL is missing, the link will not be displayed.'
      ], warningLogMessages);
  // Mock that Cordova InAppBrowser plugin is installed.
  stub.replace(
      firebaseui.auth.util,
      'isCordovaInAppBrowserInstalled',
      function() {
        return true;
      });
  privacyPolicyCallback = config.getPrivacyPolicyUrl();
  privacyPolicyCallback();
  // Target should be _system if Cordova InAppBrowser plugin is installed.
  testUtil.assertOpen('http://localhost/privacy_policy', '_system');
  // Tests if callback function is passed to privacyPolicyUrl config.
  privacyPolicyCallback = function() {};
  config.update('privacyPolicyUrl', privacyPolicyCallback);
  assertEquals(privacyPolicyCallback, config.getPrivacyPolicyUrl());
  // Tests if invalid tyoe is passed to tosUrl config.
  config.update('privacyPolicyUrl', 123456);
  assertNull(config.getPrivacyPolicyUrl());
}


function testRequireDisplayName_shouldBeTrueByDefault() {
  assertTrue(config.isDisplayNameRequired());
}


function testRequireDisplayName_canBeSet() {
  config.update('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': true
    }
  ]);
  assertTrue(config.isDisplayNameRequired());

  config.update('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': false
    }
  ]);
  assertFalse(config.isDisplayNameRequired());
}


function testRequireDisplayName_isTrueWithNonBooleanArgs() {
  config.update('signInOptions', [
    {
      'provider': 'password',
      'requireDisplayName': 'a string'
    }
  ]);
  assertTrue(config.isDisplayNameRequired());
}


function testEmailProviderConfig_passwordAllowed() {
  config.update('signInOptions', [
    {
      'provider': 'password'
    }
  ]);
  assertTrue(config.isEmailPasswordSignInAllowed());
  assertFalse(config.isEmailLinkSignInAllowed());
  assertFalse(config.isEmailLinkSameDeviceForced());
  assertNull(config.getEmailLinkSignInActionCodeSettings());

  // Even if emailLinkSignIn is provided, it should still be ignored.
  config.update('signInOptions', [
    {
      'provider': 'password',
      'emailLinkSignIn': function() {
        return {
          'url': firebaseui.auth.util.getCurrentUrl()
        };
      }
    }
  ]);
  assertTrue(config.isEmailPasswordSignInAllowed());
  assertFalse(config.isEmailLinkSignInAllowed());
  assertFalse(config.isEmailLinkSameDeviceForced());
  assertNull(config.getEmailLinkSignInActionCodeSettings());
}


function testEmailProviderConfig_emailLinkAllowed() {
  stub.replace(
      firebaseui.auth.util,
      'getCurrentUrl',
      function() {
        return 'https://www.example.com/path/?mode=foo&mode2=bar#a=1';
      });
  var originalActionCodeSettings = {
    'url': 'https://other.com/handleSignIn',
    'dynamicLinkDomain': 'example.page.link',
    'iOS': {
      'bundleId': 'com.example.ios'
    },
    'android': {
      'packageName': 'com.example.android',
      'installApp': true,
      'minimumVersion': '12'
    }
  };
  var expectedActionCodeSettings = {
    'url': 'https://other.com/handleSignIn',
    'handleCodeInApp': true,
    'dynamicLinkDomain': 'example.page.link',
    'iOS': {
      'bundleId': 'com.example.ios'
    },
    'android': {
      'packageName': 'com.example.android',
      'installApp': true,
      'minimumVersion': '12'
    }
  };

  config.update('signInOptions', [
    {
      'provider': 'password',
      'signInMethod': firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
    }
  ]);
  assertFalse(config.isEmailPasswordSignInAllowed());
  assertTrue(config.isEmailLinkSignInAllowed());
  assertFalse(config.isEmailLinkSameDeviceForced());
  assertObjectEquals(
      {
        'url': firebaseui.auth.util.getCurrentUrl(),
        'handleCodeInApp': true
      },
      config.getEmailLinkSignInActionCodeSettings());

  // Same device flow and explicit actionCodeUrl.
  config.update('signInOptions', [
    {
      'provider': 'password',
      'signInMethod': firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      'forceSameDevice': true,
      'emailLinkSignIn': function() {
        return originalActionCodeSettings;
      }
    }
  ]);
  assertFalse(config.isEmailPasswordSignInAllowed());
  assertTrue(config.isEmailLinkSignInAllowed());
  assertTrue(config.isEmailLinkSameDeviceForced());
  assertObjectEquals(
      expectedActionCodeSettings,
      config.getEmailLinkSignInActionCodeSettings());

  // Relative URL in actionCodeUrl.
  config.update('signInOptions', [
    {
      'provider': 'password',
      'signInMethod': firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      'forceSameDevice': true,
      'emailLinkSignIn': function() {
        return {
          // Relative path will be resolved relative to current URL.
          'url': '../completeSignIn?a=1#b=2'
        };
      }
    }
  ]);
  assertFalse(config.isEmailPasswordSignInAllowed());
  assertTrue(config.isEmailLinkSignInAllowed());
  assertTrue(config.isEmailLinkSameDeviceForced());
  assertObjectEquals(
      {
        'url': 'https://www.example.com/completeSignIn?a=1#b=2',
        'handleCodeInApp': true
      },
      config.getEmailLinkSignInActionCodeSettings());
}


function testSetConfig() {
  config.setConfig({
    tosUrl: 'www.testUrl1.com',
    privacyPolicyUrl: 'www.testUrl2.com'
  });
  var tosCallback = config.getTosUrl();
  tosCallback();
  testUtil.assertOpen('www.testUrl1.com', '_blank');
  var privacyPolicyCallback = config.getPrivacyPolicyUrl();
  privacyPolicyCallback();
  testUtil.assertOpen('www.testUrl2.com', '_blank');
}


function testSetConfig_nonDefined() {
  config.setConfig({test1: 1, test2: 2});
  assertArrayEquals(
      [
        'Invalid config: "test1"',
        'Invalid config: "test2"'
      ], errorLogMessages);
}


function testPopupInMobileBrowser() {
  goog.testing.createMethodMock(firebaseui.auth.util, 'isMobileBrowser');
  firebaseui.auth.util.isMobileBrowser().$returns(true);
  firebaseui.auth.util.isMobileBrowser().$replay();
  config.setConfig({
    popupMode: true});

  assertFalse(config.getPopupMode());
  firebaseui.auth.util.isMobileBrowser.$tearDown();
}


function testGetCallbacks() {
  var uiShownCallback = function() {};
  var signInSuccessCallback = function() { return true; };
  var signInSuccessWithAuthResultCallback = function() { return true; };
  var uiChangedCallback = function() {};
  var accountChooserInvokedCallback = function() {};
  var accountChooserResultCallback = function() {};
  var signInFailureCallback = function() {};
  assertNull(config.getUiShownCallback());
  assertNull(config.getSignInSuccessCallback());
  assertNull(config.getSignInSuccessWithAuthResultCallback());
  assertNull(config.getUiChangedCallback());
  assertNull(config.getAccountChooserInvokedCallback());
  assertNull(config.getAccountChooserResultCallback());
  assertNull(config.getAccountChooserResultCallback());
  config.update('callbacks', {
    'uiShown': uiShownCallback,
    'signInSuccess': signInSuccessCallback,
    'signInSuccessWithAuthResult': signInSuccessWithAuthResultCallback,
    'uiChanged': uiChangedCallback,
    'accountChooserInvoked': accountChooserInvokedCallback,
    'accountChooserResult': accountChooserResultCallback,
    'signInFailure': signInFailureCallback
  });
  assertEquals(uiShownCallback, config.getUiShownCallback());
  assertEquals(
      signInSuccessCallback, config.getSignInSuccessCallback());
  assertEquals(
      signInSuccessWithAuthResultCallback,
      config.getSignInSuccessWithAuthResultCallback());
  assertEquals(uiChangedCallback, config.getUiChangedCallback());
  assertEquals(
      accountChooserInvokedCallback,
      config.getAccountChooserInvokedCallback());
  assertEquals(
      accountChooserResultCallback,
      config.getAccountChooserResultCallback());
  assertEquals(
      signInFailureCallback, config.getSignInFailureCallback());
}


function testAutoUpgradeAnonymousUsers() {
  var expectedErrorLogMessage = 'Missing "signInFailure" callback: ' +
      '"signInFailure" callback needs to be provided when ' +
      '"autoUpgradeAnonymousUsers" is set to true.';
  assertFalse(config.autoUpgradeAnonymousUsers());

  config.update('autoUpgradeAnonymousUsers', '');
  assertFalse(config.autoUpgradeAnonymousUsers());

  config.update('autoUpgradeAnonymousUsers', null);
  assertFalse(config.autoUpgradeAnonymousUsers());

  config.update('autoUpgradeAnonymousUsers', false);
  assertFalse(config.autoUpgradeAnonymousUsers());

  // No error or warning should be logged.
  assertArrayEquals([], errorLogMessages);
  assertArrayEquals([], warningLogMessages);

  // Set autoUpgradeAnonymousUsers to true without providing a signInFailure
  // callback.
  config.update('autoUpgradeAnonymousUsers', true);
  assertTrue(config.autoUpgradeAnonymousUsers());
  // Error should be logged.
  assertArrayEquals([expectedErrorLogMessage], errorLogMessages);
  assertArrayEquals([], warningLogMessages);

  // Provide the signInFailure callback.
  config.update('callbacks', {
    'signInFailure': goog.nullFunction
  });
  config.update('autoUpgradeAnonymousUsers', 'true');
  assertTrue(config.autoUpgradeAnonymousUsers());
  config.update('autoUpgradeAnonymousUsers', 1);
  assertTrue(config.autoUpgradeAnonymousUsers());
  // No additional error logged.
  assertArrayEquals([expectedErrorLogMessage], errorLogMessages);
  assertArrayEquals([], warningLogMessages);
}


function testGetCredentialHelper_httpOrHttps() {
  // Test credential helper configuration setting, as well as the
  // accountchooser.com enabled helper method, in a HTTP or HTTPS environment.
  // Simulate HTTP or HTTPS environment.
  stub.replace(
      firebaseui.auth.util,
      'isHttpOrHttps',
      function() {
        return true;
      });
  // Default is accountchooser.com.
  assertEquals('accountchooser.com', config.getCredentialHelper());
  assertTrue(config.isAccountChooserEnabled());

  // Use an invalid credential helper.
  config.update('credentialHelper', 'invalid');
  assertEquals('accountchooser.com', config.getCredentialHelper());
  assertTrue(config.isAccountChooserEnabled());

  // Explicitly disable credential helper.
  config.update('credentialHelper', 'none');
  assertEquals('none', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());

  // Explicitly enable accountchooser.com.
  config.update('credentialHelper', 'accountchooser.com');
  assertEquals('accountchooser.com', config.getCredentialHelper());
  assertTrue(config.isAccountChooserEnabled());

  // Explicitly enable googleyolo.
  config.update('credentialHelper', 'googleyolo');
  assertEquals('googleyolo', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());
}


function testGetCredentialHelper_nonHttpOrHttps() {
  // Test credential helper configuration setting, as well as the
  // accountchooser.com enabled helper method, in a non HTTP or HTTPS
  // environment. This could be a Cordova file environment.
  // Simulate non HTTP or HTTPS environment.
  stub.replace(
      firebaseui.auth.util,
      'isHttpOrHttps',
      function() {
        return false;
      });
  // All should resolve to none.
  // Default is accountchooser.com.
  assertEquals('none', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());

  // Use an invalid credential helper.
  config.update('credentialHelper', 'invalid');
  assertEquals('none', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());

  // Explicitly disable credential helper.
  config.update('credentialHelper', 'none');
  assertEquals('none', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());

  // Explicitly enable accountchooser.com.
  config.update('credentialHelper', 'accountchooser.com');
  assertEquals('none', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());

  // Explicitly enable googleyolo.
  config.update('credentialHelper', 'googleyolo');
  assertEquals('none', config.getCredentialHelper());
  assertFalse(config.isAccountChooserEnabled());
}
