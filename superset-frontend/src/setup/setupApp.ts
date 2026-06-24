/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import $ from 'jquery';
import {
  SupersetClient,
  getClientErrorObject,
  ClientErrorObject,
} from '@superset-ui/core';
import setupErrorMessages from 'src/setup/setupErrorMessages';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}

export function showApiMessage(resp: ClientErrorObject) {
  const container = document.getElementById('alert-container');
  if (!container) {
    return;
  }

  const severity = resp.severity || 'info';

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${severity}`;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'close';
  closeButton.setAttribute('data-dismiss', 'alert');
  closeButton.textContent = '\xD7';
  closeButton.addEventListener('click', () => {
    alertDiv.remove();
  });

  const messageSpan = document.createElement('span');
  messageSpan.textContent = resp.message || '';

  alertDiv.appendChild(closeButton);
  alertDiv.appendChild(messageSpan);
  container.appendChild(alertDiv);
}

function toggleCheckbox(apiUrlPrefix: string, checkbox: HTMLInputElement) {
  SupersetClient.get({
    endpoint: apiUrlPrefix + checkbox.checked,
  })
    .then(() => undefined)
    .catch((response: Response) =>
      getClientErrorObject(response).then((parsedResp: ClientErrorObject) => {
        if (parsedResp?.message) {
          showApiMessage(parsedResp);
        }
      }),
    );
}

export default function setupApp() {
  document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"][data-checkbox-api-prefix]',
    );
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const prefix = checkbox.dataset.checkboxApiPrefix;
        if (prefix) {
          toggleCheckbox(prefix, checkbox);
        }
      });
    });

    // for language picker dropdown
    const languagePicker = document.getElementById('language-picker');
    if (languagePicker) {
      const links = languagePicker.querySelectorAll<HTMLAnchorElement>('a');
      links.forEach(link => {
        link.addEventListener('click', (ev: MouseEvent) => {
          ev.preventDefault();
          SupersetClient.get({
            url: link.href,
            parseMethod: null,
          }).then(() => {
            window.location.reload();
          });
        });
      });
    }
  });

  // A set of hacks to allow apps to run within a FAB template
  // this allows for the server side generated menus to function
  window.$ = $;
  window.jQuery = $;

  // set up app wide custom error messages
  setupErrorMessages();
}
