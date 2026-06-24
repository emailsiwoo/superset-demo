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
import { ClientErrorObject } from '@superset-ui/core';
import { showApiMessage } from './setupApp';

test('showApiMessage renders message as text content, not HTML', () => {
  const container = document.createElement('div');
  container.id = 'alert-container';
  document.body.appendChild(container);

  const xssPayload = '<img src=x onerror=alert("XSS")>';
  const resp: ClientErrorObject = {
    message: xssPayload,
    error: 'test error',
    errors: [],
  };

  showApiMessage(resp);

  const alertDiv = container.querySelector('.alert');
  expect(alertDiv).not.toBeNull();

  const messageSpan = alertDiv!.querySelector('span');
  expect(messageSpan).not.toBeNull();
  expect(messageSpan!.textContent).toBe(xssPayload);
  // The XSS payload is rendered as text, not interpreted as HTML
  expect(container.querySelector('img')).toBeNull();

  document.body.removeChild(container);
});

test('showApiMessage uses correct severity class', () => {
  const container = document.createElement('div');
  container.id = 'alert-container';
  document.body.appendChild(container);

  const resp: ClientErrorObject = {
    message: 'Error occurred',
    severity: 'danger',
    error: 'test error',
    errors: [],
  };

  showApiMessage(resp);

  const alertDiv = container.querySelector('.alert');
  expect(alertDiv).not.toBeNull();
  expect(alertDiv!.classList.contains('alert-danger')).toBe(true);

  document.body.removeChild(container);
});

test('showApiMessage defaults severity to info', () => {
  const container = document.createElement('div');
  container.id = 'alert-container';
  document.body.appendChild(container);

  const resp: ClientErrorObject = {
    message: 'Info message',
    error: 'test error',
    errors: [],
  };

  showApiMessage(resp);

  const alertDiv = container.querySelector('.alert');
  expect(alertDiv).not.toBeNull();
  expect(alertDiv!.classList.contains('alert-info')).toBe(true);

  document.body.removeChild(container);
});

test('showApiMessage close button removes the alert', () => {
  const container = document.createElement('div');
  container.id = 'alert-container';
  document.body.appendChild(container);

  const resp: ClientErrorObject = {
    message: 'Dismissible alert',
    error: 'test error',
    errors: [],
  };

  showApiMessage(resp);

  const closeButton = container.querySelector('button.close');
  expect(closeButton).not.toBeNull();

  (closeButton as HTMLButtonElement).click();
  expect(container.querySelector('.alert')).toBeNull();

  document.body.removeChild(container);
});

test('showApiMessage does nothing when alert-container is missing', () => {
  const resp: ClientErrorObject = {
    message: 'No container',
    error: 'test error',
    errors: [],
  };

  // Should not throw
  expect(() => showApiMessage(resp)).not.toThrow();
});

test('showApiMessage handles empty message gracefully', () => {
  const container = document.createElement('div');
  container.id = 'alert-container';
  document.body.appendChild(container);

  const resp: ClientErrorObject = {
    message: '',
    error: 'test error',
    errors: [],
  };

  showApiMessage(resp);

  const messageSpan = container.querySelector('.alert span');
  expect(messageSpan).not.toBeNull();
  expect(messageSpan!.textContent).toBe('');

  document.body.removeChild(container);
});
