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
import React from 'react';
import { render, screen } from 'spec/helpers/testing-library';
import { useUiConfig, UiConfigContext, EmbeddedUiConfigProvider } from '.';

jest.mock('src/utils/urlUtils', () => ({
  getUrlParam: jest.fn(() => null),
}));

const { getUrlParam } = jest.requireMock('src/utils/urlUtils');

function ConfigDisplay() {
  const config = useUiConfig();
  return (
    <div>
      <span data-test="hideTitle">{String(config.hideTitle)}</span>
      <span data-test="hideTab">{String(config.hideTab)}</span>
      <span data-test="hideNav">{String(config.hideNav)}</span>
      <span data-test="hideChartControls">
        {String(config.hideChartControls)}
      </span>
      <span data-test="emitDataMasks">{String(config.emitDataMasks)}</span>
      <span data-test="showRowLimitWarning">
        {String(config.showRowLimitWarning)}
      </span>
    </div>
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

test('UiConfigContext provides default values of false for all fields', () => {
  render(
    <UiConfigContext.Consumer>
      {config => (
        <div>
          <span data-test="hideTitle">{String(config.hideTitle)}</span>
          <span data-test="hideTab">{String(config.hideTab)}</span>
          <span data-test="hideNav">{String(config.hideNav)}</span>
          <span data-test="hideChartControls">
            {String(config.hideChartControls)}
          </span>
          <span data-test="emitDataMasks">{String(config.emitDataMasks)}</span>
          <span data-test="showRowLimitWarning">
            {String(config.showRowLimitWarning)}
          </span>
        </div>
      )}
    </UiConfigContext.Consumer>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('false');
  expect(screen.getByTestId('hideNav')).toHaveTextContent('false');
  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('false');
  expect(screen.getByTestId('emitDataMasks')).toHaveTextContent('false');
  expect(screen.getByTestId('showRowLimitWarning')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider sets all flags to false when uiConfig param is absent', () => {
  getUrlParam.mockReturnValue(null);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('false');
  expect(screen.getByTestId('hideNav')).toHaveTextContent('false');
  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('false');
  expect(screen.getByTestId('emitDataMasks')).toHaveTextContent('false');
  expect(screen.getByTestId('showRowLimitWarning')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider parses bitmask 1 as hideTitle only', () => {
  getUrlParam.mockReturnValue(1);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('false');
  expect(screen.getByTestId('hideNav')).toHaveTextContent('false');
  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('false');
  expect(screen.getByTestId('emitDataMasks')).toHaveTextContent('false');
  expect(screen.getByTestId('showRowLimitWarning')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider parses bitmask 2 as hideTab only', () => {
  getUrlParam.mockReturnValue(2);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('true');
});

test('EmbeddedUiConfigProvider parses bitmask 4 as hideNav only', () => {
  getUrlParam.mockReturnValue(4);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideNav')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider parses bitmask 8 as hideChartControls only', () => {
  getUrlParam.mockReturnValue(8);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider parses bitmask 16 as emitDataMasks only', () => {
  getUrlParam.mockReturnValue(16);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('emitDataMasks')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider parses bitmask 32 as showRowLimitWarning only', () => {
  getUrlParam.mockReturnValue(32);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('showRowLimitWarning')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTitle')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider parses combined bitmask 63 enabling all flags', () => {
  getUrlParam.mockReturnValue(63);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('true');
  expect(screen.getByTestId('hideNav')).toHaveTextContent('true');
  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('true');
  expect(screen.getByTestId('emitDataMasks')).toHaveTextContent('true');
  expect(screen.getByTestId('showRowLimitWarning')).toHaveTextContent('true');
});

test('EmbeddedUiConfigProvider parses partial bitmask 11 (hideTitle + hideTab + hideChartControls)', () => {
  getUrlParam.mockReturnValue(11);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('true');
  expect(screen.getByTestId('hideNav')).toHaveTextContent('false');
  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('true');
  expect(screen.getByTestId('emitDataMasks')).toHaveTextContent('false');
  expect(screen.getByTestId('showRowLimitWarning')).toHaveTextContent('false');
});

test('EmbeddedUiConfigProvider renders children', () => {
  getUrlParam.mockReturnValue(null);

  render(
    <EmbeddedUiConfigProvider>
      <div data-test="child">child content</div>
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('child')).toHaveTextContent('child content');
});

test('useUiConfig returns the context value from EmbeddedUiConfigProvider', () => {
  getUrlParam.mockReturnValue(5);

  render(
    <EmbeddedUiConfigProvider>
      <ConfigDisplay />
    </EmbeddedUiConfigProvider>,
  );

  expect(screen.getByTestId('hideTitle')).toHaveTextContent('true');
  expect(screen.getByTestId('hideTab')).toHaveTextContent('false');
  expect(screen.getByTestId('hideNav')).toHaveTextContent('true');
  expect(screen.getByTestId('hideChartControls')).toHaveTextContent('false');
});
