export interface UserSettings {
  userId: string;
  monthlyIncomeCap: number;
  currency: string;
  /** Day of the month the budget cycle restarts (1-31, clamped in short months). */
  cycleStartDay: number;
  /** UI language: en | es */
  language: 'en' | 'es';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  monthlyIncomeCap?: number;
  currency?: string;
  cycleStartDay?: number;
  language?: 'en' | 'es';
}

export interface CompleteOnboardingDto {
  monthlyIncomeCap: number;
  currency?: string;
  cycleStartDay?: number;
  language?: 'en' | 'es';
}
