/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify, type ThemeDefinition } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    'background': '#ffffff',
    'surface': '#f3f3f3',
    'surface-bright': '#e4e4e4',
    'surface-light': '#ffffff',
    'surface-variant': '#bfbfbf',
    'on-surface-variant': '#EEE',
    'primary': '#000000',
    'primary-lighten-1': '#4e4e4e',
    'primary-lighten-2': '#0099c2',
    'primary-darken-1': '#001f25',
    'primary-darken-2': '#00161c',
    'secondary': '#f2df73',
    'secondary-darken-1': '#bfb05a',
    'error': '#B00020',
    'info': '#007b9c',
    'success': '#4CAF50',
    'warning': '#FB8C00',
  },
  variables: {
    'border-color': '#000000',
    'border-opacity': 0.12,
    'border-radius': '8px',
    'border-button-radius': '12px',
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.6,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: { myCustomLightTheme },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      class: 'font-weight-bold text-none',
      color: 'primary',
    },
    VTextField: {
      variant: 'outlined',
      hideDetails: true,
    },
    VRadioGroup: { hideDetails: true },
    VCheckbox: { hideDetails: true },
  },
})
