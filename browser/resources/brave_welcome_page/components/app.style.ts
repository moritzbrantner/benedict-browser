/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import { color, font, radius, spacing } from '@brave/leo/tokens/css/variables'
import { scoped, addStyles } from '$web-common/scoped_css'

import background from '../assets/background.jpg'

export const style = scoped.css`
  & {
    --app-logo-size: 52px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: ${color.primitive.neutral['0']};
    background-image: url(${background});
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    padding: ${spacing.xl};
  }

  .welcome-container {
    position: relative;
    max-width: 1130px;
    max-height: 700px;
    width: 100%;
    height: calc(100dvh - 2 * ${spacing.xl});
    background-color: ${color.material.thick};
    border-radius: ${radius.xxl};
    backdrop-filter: blur(35px);
    overflow: hidden;
    opacity: 0;

    animation:
      container-fade-in 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
  }

  @keyframes container-fade-in {
    0% {
      opacity: 0;
      transform: scale(0.85);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .logo {
    --leo-icon-size: var(--app-logo-size);
    position: absolute;
    inset-block-start: ${spacing['4Xl']};
    inset-inline-start: ${spacing['4Xl']};
    z-index: 10;
  }
`

style.passthrough.css`
  & {
    font: ${font.large.regular};
    color: ${color.text.primary};
  }

  h1 {
    font: ${font.heading.h1};
    margin: 0;
  }

  p {
    margin: 0;
  }

  .step-view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .step-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: ${spacing['4Xl']};
    gap: ${spacing['2Xl']};
    overflow-y: auto;
  }

  .step-text {
    padding-top: calc(${spacing['4Xl']} + var(--app-logo-size));
    display: flex;
    flex-direction: column;
    gap: ${spacing['2Xl']};
  }

  .step-ui {
    flex: 1 1 auto;
  }

  .step-view footer {
    width: 100%;
    padding: ${spacing['2Xl']};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing['m']};
    background:
      linear-gradient(to bottom, ${color.material.thick}, transparent);

    .forward {
      margin-left: auto;
      display: flex;
      gap: ${spacing['m']};
      align-items: center;
      text-align: end;

      leo-button[kind=filled]:last-child {
        min-width: 240px;
      }
    }
  }

  @media (min-width: 1024px) {
    .step-content {
      flex-direction: row;
      align-items: stretch;
      height: 100%;
      overflow-y: unset;
      gap: ${spacing['4Xl']};
    }

    .step-text {
      max-width: 430px;
      width: 40%;
      overflow-y: auto;
    }

    .step-ui {
      overflow-y: auto;
    }
  }
`

addStyles('view-transitions', `

  @keyframes slide-forward-out {
    from {
      opacity: 1;
    }
    to {
      translate: -40px 0;
      opacity: 0;
    }
  }

  @keyframes slide-forward-in {
    from {
      translate: 40px 0;
      opacity: 0;
    }
    50% {
      translate: 40px 0;
      opacity: 0;
    }
    to {
      translate: 0;
      opacity: 1;
    }
  }

  @keyframes slide-backward-out {
    from {
      translate: 0;
      opacity: 1;
    }
    to {
      translate: 40px  0;
      opacity: 0;
    }
  }

  @keyframes slide-backward-in {
    from {
      translate: -40px 0;
      opacity: 0;
    }
    50% {
      translate: -40px 0;
      opacity: 0;
    }
    to {
      translate: 0;
      opacity: 1;
    }
  }

  :root {
    view-transition-name: none;
  }
  .step-content {
    view-transition-name: slide-step-content;
  }

  html:active-view-transition-type(forward) {
    &::view-transition-old(slide-step-content) {
      animation-name: slide-forward-out;
    }
    &::view-transition-new(slide-step-content) {
      animation-name: slide-forward-in;
    }
  }

  html:active-view-transition-type(backward) {
    &::view-transition-old(slide-step-content) {
      animation-name: slide-backward-out;
    }
    &::view-transition-new(slide-step-content) {
      animation-name: slide-backward-in;
    }
  }

`)
