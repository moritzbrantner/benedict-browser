/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import Button from '@brave/leo/react/button'

import { getString } from '../lib/strings'

import { style } from './import_step.style'

interface Props {
  onBack: () => void
  onNext: () => void
  onRender: () => void
}

export function ImportStep(props: Props) {
  React.useEffect(props.onRender, [props.onRender])

  return (
    <div
      data-css-scope={style.scope}
      className='step-view'
    >
      <div className='step-content'>
        <div className='step-text'>
          <h1>{getString('WELCOME_PAGE_IMPORT_STEP_TITLE')}</h1>
          <p>{getString('WELCOME_PAGE_IMPORT_STEP_TEXT1')}</p>
          <p>{getString('WELCOME_PAGE_IMPORT_STEP_TEXT2')}</p>
        </div>
        <div className='step-ui'></div>
      </div>
      <footer>
        <div className='back'>
          <Button
            kind='plain-faint'
            size='large'
            onClick={props.onBack}
          >
            {getString('WELCOME_PAGE_BACK_BUTTON_LABEL')}
          </Button>
        </div>
        <div className='forward'>
          <Button
            kind='plain-faint'
            size='large'
            onClick={props.onNext}
          >
            {getString('WELCOME_PAGE_SKIP_IMPORT_BUTTON_LABEL')}
          </Button>
          <Button
            kind='filled'
            size='large'
            onClick={props.onNext}
          >
            {getString('WELCOME_PAGE_IMPORT_BUTTON_LABEL')}
          </Button>
        </div>
      </footer>
    </div>
  )
}
