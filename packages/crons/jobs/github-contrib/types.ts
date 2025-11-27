export type ContributionCalendar = Record<string, ({ level: number, tooltip: string, count: number } | null)[]>

export interface YearContribution {
  count: number
  calendar: ContributionCalendar
  monthPosition: Record<string, number>
}

export type ContributionsByYear = Record<string, YearContribution>
