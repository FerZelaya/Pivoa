export type TourStepDef = {
  route: string
  selector: string
  titleKey: string
  bodyKey: string
  side: 'top' | 'right' | 'bottom' | 'left'
}

export const TOUR_STEPS: TourStepDef[] = [
  {
    route: '/overview',
    selector: '[data-tour="nav-overview"]',
    titleKey: 'tour.steps.overview.title',
    bodyKey: 'tour.steps.overview.body',
    side: 'right',
  },
  {
    route: '/overview',
    selector: '[data-tour="cycle-range"]',
    titleKey: 'tour.steps.cycle.title',
    bodyKey: 'tour.steps.cycle.body',
    side: 'bottom',
  },
  {
    route: '/overview',
    selector: '[data-tour="overview-kpis"]',
    titleKey: 'tour.steps.kpis.title',
    bodyKey: 'tour.steps.kpis.body',
    side: 'bottom',
  },
  {
    route: '/overview',
    selector: '[data-tour="new-expense"]',
    titleKey: 'tour.steps.expense.title',
    bodyKey: 'tour.steps.expense.body',
    side: 'right',
  },
  {
    route: '/transactions',
    selector: '[data-tour="nav-transactions"]',
    titleKey: 'tour.steps.transactions.title',
    bodyKey: 'tour.steps.transactions.body',
    side: 'right',
  },
  {
    route: '/budgets',
    selector: '[data-tour="budgets-cards"]',
    titleKey: 'tour.steps.budgets.title',
    bodyKey: 'tour.steps.budgets.body',
    side: 'bottom',
  },
  {
    route: '/settings',
    selector: '[data-tour="nav-settings"]',
    titleKey: 'tour.steps.settings.title',
    bodyKey: 'tour.steps.settings.body',
    side: 'right',
  },
]
