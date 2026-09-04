import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthTotal } from '../lib/aggregate'
import { CHART_COLORS } from '../lib/palette'

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function formatMonth(month: string): string {
  const [y, m] = month.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

export function TrendChart({ data }: { data: MonthTotal[] }) {
  if (data.length === 0) return null

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-medium text-slate-300 mb-3">Income vs. expenses by month</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            stroke={CHART_COLORS.gray}
            tick={{ fontSize: 11, fill: CHART_COLORS.gray }}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrency(v)}
            stroke={CHART_COLORS.gray}
            tick={{ fontSize: 11, fill: CHART_COLORS.gray }}
            width={70}
          />
          <Tooltip
            labelFormatter={(label: string) => formatMonth(label)}
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              background: '#1a1a19',
              border: '1px solid #2c2c2a',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#c3c2b7' }} />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke={CHART_COLORS.blue}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke={CHART_COLORS.aqua}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
