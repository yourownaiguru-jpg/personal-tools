import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CategoryTotal } from '../lib/aggregate'
import { CHART_COLORS } from '../lib/palette'

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export function CategoryChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) return null
  const top = data.slice(0, 8)

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-medium text-slate-300 mb-3">Spend by category</h2>
      <ResponsiveContainer width="100%" height={Math.max(160, top.length * 36)}>
        <BarChart data={top} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCurrency(v)}
            stroke={CHART_COLORS.gray}
            tick={{ fontSize: 11, fill: CHART_COLORS.gray }}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={110}
            stroke={CHART_COLORS.gray}
            tick={{ fontSize: 12, fill: '#c3c2b7' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#1a1a19',
              border: '1px solid #2c2c2a',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {top.map((entry) => (
              <Cell key={entry.category} fill={CHART_COLORS.blue} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
