import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Card,
    Button,
    Tag,
    Space,
    Breadcrumb,
    Typography,
    Row,
    Col,
    Statistic,
    Input,
} from 'antd'
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetSiteStats } from '@/services/StatementsService'
import type { SiteStatRow } from '@/@types/statement'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const SiteStatsView = () => {
    const [stats, setStats] = useState<SiteStatRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    // Default to the last 7 days, today included
    const [startDate, setStartDate] = useState<string>(dayjs().subtract(6, 'day').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'))

    const fetchStats = async () => {
        if (startDate && endDate && startDate > endDate) {
            toast.push(
                <Notification title="Invalid date range" type="warning">
                    Start date must be on or before the end date.
                </Notification>
            )
            return
        }
        setLoading(true)
        try {
            const data = await apiGetSiteStats({
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            })
            setStats(data)
        } catch (err: any) {
            console.error('Failed to load stats', err)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to fetch user stats.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    // Totals calculations
    const sumClients = stats.reduce((acc, curr) => acc + curr.total_clients, 0)
    const sumAppDepAmt = stats.reduce((acc, curr) => acc + curr.total_approved_deposit, 0)
    const sumAppDepCount = stats.reduce((acc, curr) => acc + curr.number_approved_deposit, 0)
    const sumRejDepAmt = stats.reduce((acc, curr) => acc + curr.total_rejected_deposit, 0)
    const sumRejDepCount = stats.reduce((acc, curr) => acc + curr.number_rejected_deposit, 0)
    const sumAppWithAmt = stats.reduce((acc, curr) => acc + curr.total_approved_withdraw, 0)
    const sumAppWithCount = stats.reduce((acc, curr) => acc + curr.number_approved_withdraw, 0)
    const sumRejWithAmt = stats.reduce((acc, curr) => acc + curr.total_rejected_withdraw, 0)
    const sumRejWithCount = stats.reduce((acc, curr) => acc + curr.number_rejected_withdraw, 0)

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Analytics' },
                            { title: 'Site User Stats' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Site User Stats & Performance Matrix
                        </Title>
                        <Tag color="cyan">Analytics</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Real-time player volume, deposit approvals vs rejections, and withdrawal payout ratios across master domains.
                    </Text>
                </div>

                <Button
                    icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                    onClick={fetchStats}
                >
                    Refresh
                </Button>
            </div>

            {/* Quick KPI Strip */}
            <Row gutter={[12, 12]}>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Active Clients</span>}
                            value={sumClients}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--info)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Approved Deposits</span>}
                            value={sumAppDepAmt}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">({sumAppDepCount})</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Approved Withdrawals</span>}
                            value={sumAppWithAmt}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">({sumAppWithCount})</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Rejections</span>}
                            value={sumRejDepAmt + sumRejWithAmt}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--error)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">({sumRejDepCount + sumRejWithCount})</span>}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Date Search Filter Bar */}
            <Card size="small" className="border border-line">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Start Date
                        </label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full min-w-[150px]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            End Date
                        </label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full min-w-[150px]"
                        />
                    </div>

                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={fetchStats}
                        loading={loading}
                    >
                        Search
                    </Button>
                </div>
            </Card>

            {/* Master Stats Table */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3">NO</th>
                                <th className="py-2.5 px-3">ID</th>
                                <th className="py-2.5 px-3">USERNAME</th>
                                <th className="py-2.5 px-3 text-center">TOTAL CLIENTS</th>
                                <th className="py-2.5 px-3 text-right">APPROVED DEPOSIT</th>
                                <th className="py-2.5 px-3 text-center">DEP COUNT</th>
                                <th className="py-2.5 px-3 text-right">REJECTED DEPOSIT</th>
                                <th className="py-2.5 px-3 text-center">REJ DEP</th>
                                <th className="py-2.5 px-3 text-right">APPROVED WITHDRAW</th>
                                <th className="py-2.5 px-3 text-center">WITH COUNT</th>
                                <th className="py-2.5 px-3 text-right">REJECTED WITHDRAW</th>
                                <th className="py-2.5 px-3 text-center">REJ WITH</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {stats.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-surface-hover transition-colors">
                                    <td className="py-2.5 px-3 font-semibold text-ink-3">{idx + 1}</td>
                                    <td className="py-2.5 px-3 font-mono font-medium text-ink-2">
                                        {row.master_id}
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-ink">
                                        {row.username}
                                    </td>

                                    <td className="py-2.5 px-3 text-center font-bold text-info">
                                        {row.total_clients}
                                    </td>

                                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-success">
                                        ₹{row.total_approved_deposit.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-success">
                                        {row.number_approved_deposit}
                                    </td>

                                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-error">
                                        ₹{row.total_rejected_deposit.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-error">
                                        {row.number_rejected_deposit}
                                    </td>

                                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary">
                                        ₹{row.total_approved_withdraw.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-primary">
                                        {row.number_approved_withdraw}
                                    </td>

                                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-error">
                                        ₹{row.total_rejected_withdraw.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-error">
                                        {row.number_rejected_withdraw}
                                    </td>
                                </tr>
                            ))}

                            {/* Total Row */}
                            <tr className="bg-surface-2 font-bold text-ink border-t border-line">
                                <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                                    Total :
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-info">
                                    {sumClients}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-success">
                                    ₹{sumAppDepAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-success">
                                    {sumAppDepCount}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-error">
                                    ₹{sumRejDepAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-error">
                                    {sumRejDepCount}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                                    ₹{sumAppWithAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-primary">
                                    {sumAppWithCount}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-error">
                                    ₹{sumRejWithAmt.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-error">
                                    {sumRejWithCount}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

export default SiteStatsView
