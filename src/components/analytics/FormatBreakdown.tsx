"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface FormatData {
    format: string
    percentage: number
    count: number
}

interface FormatBreakdownProps {
    data: FormatData[]
}

const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e']

export function FormatBreakdown({ data }: FormatBreakdownProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-lg">Performance por Formato</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[250px]">
                    <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">Performance por Formato</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="count"
                                nameKey="format"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={((value: any, name: string, props: any) => [
                                    `${value} posts (${props.payload.percentage}%)`,
                                    name ? String(name).toUpperCase() : ''
                                ]) as any}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span className="text-xs font-medium uppercase">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
