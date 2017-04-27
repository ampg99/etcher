/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const hideWebview = (elem) => {

  // We hide with width and height instead of display as that may be buggy
  // with <webview>s.
  elem.style.flex = '0 1';
  elem.style.width = '0';
  elem.style.height = '0';
};

const showWebview = (elem) => {
  elem.style.flex = null;
  elem.style.width = null;
  elem.style.height = null;
};

module.exports = ($timeout) => {
  return {
    template: '<div><webview></webview><div ng-show="showDefaultBanner" ng-transclude></div></div>',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
    },
    link: (scope, $element) => {
      const webviewElem = $element[0].querySelector('webview');

      let loadingTimeout;

      webviewElem.addEventListener('did-start-loading', (event) => {
        loadingTimeout = $timeout(() => {
          webviewElem.src = null;
          scope.showDefaultBanner = true;

        // Seconds to wait before cancelling the page-load.
        }, 2000);
      });
      webviewElem.addEventListener('did-fail-load', (event) => {
        $timeout(() => {
          scope.showDefaultBanner = true;
        });
      });
      webviewElem.addEventListener('did-stop-loading', (event) => {

        // We cancel loading of the page after n seconds to remain resposive.
        $timeout.cancel(loadingTimeout);

        if (!scope.showDefaultBanner) {
          $timeout(() => {
            scope.showDefaultBanner = false;
          });

          // Only show the webview after it's fully loaded.
          showWebview(webviewElem);
        }
      });
      webviewElem.addEventListener('did-get-response-details', (event) => {
        const { httpResponseCode } = event;

        if (httpResponseCode !== 200) {
          $timeout(() => {
            scope.showDefaultBanner = true;
          });

          hideWebview(webviewElem);

        } else {
          console.log(httpResponseCode);
        }
      });

      webviewElem.src = 'https://etcher.io/banner/';

      hideWebview(webviewElem);
    }
  };
};
