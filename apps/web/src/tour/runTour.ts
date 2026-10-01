import { driver, type Driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import './tour.css'
import type { TFunction } from 'i18next'
import type { NavigateFunction } from 'react-router'
import { TOUR_STEPS, type TourStepDef } from './steps'

function waitFor(selector: string, timeout = 4000): Promise<Element> {
  const existing = document.querySelector(selector)
  if (existing) return Promise.resolve(existing)
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Missing tour target ${selector}`))
    }, timeout)
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (!el) return
      window.clearTimeout(timer)
      observer.disconnect()
      resolve(el)
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

async function ensureStep(navigate: NavigateFunction, step: TourStepDef) {
  if (window.location.pathname !== step.route) navigate(step.route)
  await waitFor(step.selector)
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

export function runTour(options: {
  t: TFunction
  language: string
  navigate: NavigateFunction
  onComplete: () => void
  onAbort: () => void
}) {
  const { t, language, navigate, onComplete, onAbort } = options
  let settled = false
  let tour: Driver

  const finish = (completed: boolean) => {
    if (settled) return
    settled = true
    if (tour?.isActive()) tour.destroy()
    if (completed) onComplete()
    else onAbort()
  }

  const steps: DriveStep[] = TOUR_STEPS.map((step, index) => {
    const next = TOUR_STEPS[index + 1]
    const prev = TOUR_STEPS[index - 1]
    const popover: NonNullable<DriveStep['popover']> = {
      title: t(step.titleKey),
      description: t(step.bodyKey),
      side: step.side,
      align: 'start',
    }
    if (next && next.route !== step.route) {
      popover.onNextClick = () => {
        void ensureStep(navigate, next)
          .then(() => tour.moveNext())
          .catch(() => finish(true))
      }
    }
    if (prev && prev.route !== step.route) {
      popover.onPrevClick = () => {
        void ensureStep(navigate, prev)
          .then(() => tour.movePrevious())
          .catch(() => finish(true))
      }
    }
    return { element: step.selector, popover }
  })

  tour = driver({
    animate: true,
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 12,
    popoverClass: 'pivoa-tour',
    progressText: language.toLowerCase().startsWith('es') ? '{{current}} de {{total}}' : '{{current}} of {{total}}',
    nextBtnText: t('tour.next'),
    prevBtnText: t('tour.back'),
    doneBtnText: t('tour.done'),
    steps,
    onPopoverRender: (popover) => {
      popover.closeButton.textContent = t('tour.skip')
      popover.closeButton.setAttribute('aria-label', t('tour.skip'))
    },
    onDestroyStarted: () => finish(true),
  })

  void ensureStep(navigate, TOUR_STEPS[0])
    .then(() => {
      if (!settled) tour.drive()
    })
    .catch(() => finish(false))
}
