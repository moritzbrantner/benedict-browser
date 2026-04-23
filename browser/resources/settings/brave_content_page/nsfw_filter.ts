// Copyright (c) 2026 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import '../settings_shared.css.js'
import '../settings_vars.css.js'

import {PrefsMixin} from '/shared/settings/prefs/prefs_mixin.js'
import {I18nMixin} from 'chrome://resources/cr_elements/i18n_mixin.js'
import {PolymerElement} from 'chrome://resources/polymer/v3_0/polymer/polymer_bundled.min.js'
import {DropdownMenuOptionList} from '../controls/settings_dropdown_menu.js'

import {loadTimeData} from '../i18n_setup.js'
import {getTemplate} from './nsfw_filter.html.js'

const SettingsBraveNsfwFilterElementBase =
  I18nMixin(PrefsMixin(PolymerElement))

export class SettingsBraveNsfwFilterElement
    extends SettingsBraveNsfwFilterElementBase {
  static get is() {
    return 'settings-brave-nsfw-filter'
  }

  static get template() {
    return getTemplate()
  }

  static get properties() {
    return {
      nsfwFilterActionOptions_: {
        readOnly: true,
        type: Array,
        value() {
          return [
            {value: 0, name: loadTimeData.getString('nsfwFilterActionNothing')},
            {value: 1, name: loadTimeData.getString('nsfwFilterActionBlur')},
            {value: 2, name: loadTimeData.getString('nsfwFilterActionHide')},
            {
              value: 3,
              name: loadTimeData.getString('nsfwFilterActionCollapse'),
            },
          ]
        },
      },
    }
  }

  private declare nsfwFilterActionOptions_: DropdownMenuOptionList
}

customElements.define(
  SettingsBraveNsfwFilterElement.is, SettingsBraveNsfwFilterElement)
