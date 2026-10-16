import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Card,
    Button,
    Select,
    Tag,
    Modal,
    Space,
    Breadcrumb,
    Typography,
    Row,
    Col,
    Statistic,
} from 'antd'
import {
    ReloadOutlined,
    DownloadOutlined,
    FileTextOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetAccountStatements } from '@/services/StatementsService'
import type { StatementItem } from '@/@types/statement'
import { MdReceiptLong } from 'react-icons/md'

const { Title, Text } = Typography

const StatementView = () => {
    const location = useLocation()
    const queryUser = new URLSearchParams(location.search).get('user') || new URLSearchParams(location.search).get('username') || ''

    const [statements, setStatements] = useState<StatementItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter states
    const [selectedUser, setSelectedUser] = useState<string>(queryUser || 'Mastan777 (mastan247.club)')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedDetail, setSelectedDetail] = useState<StatementItem | null>(null)

    const fetchStatements = async () => {
        setLoading(true)
        try {
            const data = await apiGetAccountStatements()
            setStatements(data)
        } catch (err: any) {
            console.error('Failed to load statements', err)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to fetch statement records.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatements()
    }, [])

    const filteredStatements = statements.filter((item) => {
        if (selectedType && selectedType !== 'Select type' && selectedType !== 'All') {
            if (item.type.toLowerCase() !== selectedType.toLowerCase()) return false
        }
        if (selectedUser && selectedUser !== 'All') {
            const cleanUser = selectedUser.split(' ')[0].toLowerCase()
            if (!item.site_user.toLowerCase().includes(cleanUser)) return false
        }
        return true
    })

    // Totals
    const totalCredit = filteredStatements
        .filter((s) => s.dc === 'Credit')
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)

    const totalDebit = filteredStatements
        .filter((s) => s.dc === 'Debit')
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)

    const netDifference = totalCredit - totalDebit
    const currentBalance = filteredStatements.length > 0 ? filteredStatements[0].balance : 762427.20

    const exportToCSV = () => {
        const headers = ['NO,DATE,EVENT TYPE,AMOUNT,TOTAL,BALANCE,TYPE,D/C,DESCRIPTION\n']
        const rows = filteredStatements.map((s, idx) =>
            [
                idx + 1,
                `"${s.date_str || ''}"`,
                `"${s.event_type}"`,
                s.amount,
                s.total,
                s.balance,
                `"${s.type}"`,
                `"${s.dc}"`,
                `"${(s.description || '').replace(/"/g, '""')}"`,
            ].join(',')
        )
        const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Account_Statement_${Date.now()}.csv`
        a.click()
    }

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Ledger Audit' },
                            { title: 'Account Statement' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Account Statement ({selectedUser})
                        </Title>
                        <Tag color="green">Audit</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Comprehensive ledger audit trail, market odds settlement, and balance reconciliation.
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={exportToCSV}
                    >
                        Export CSV
                    </Button>
                    <Button
                        icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchStatements}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* KPI Overview Strip */}
            <Row gutter={[12, 12]}>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Closing Ledger</span>}
                            value={currentBalance}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Credit</span>}
                            value={totalCredit}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Debit</span>}
                            value={totalDebit}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--error)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Net Ledger Delta</span>}
                            value={netDifference}
                            precision={2}
                            prefix="₹"
                            valueStyle={{
                                fontSize: '18px',
                                fontWeight: 600,
                                color: netDifference >= 0 ? 'var(--success)' : 'var(--error)',
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Card */}
            <Card size="small" className="border border-line">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-64">
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Account / User
                        </label>
                        <Select
                            value={selectedUser}
                            onChange={(val) => setSelectedUser(val)}
                            className="w-full"
                            options={[
                                { label: 'All Accounts', value: 'All' },
                                { label: 'Mastan777 (mastan247.club)', value: 'Mastan777 (mastan247.club)' },
                                { label: 'Mastan365m (mastan365.com)', value: 'Mastan365m (mastan365.com)' },
                                { label: 'Mastan99m (mastan99.com)', value: 'Mastan99m (mastan99.com)' },
                                { label: 'Mastanreddymas (mastanreddy.com)', value: 'Mastanreddymas (mastanreddy.com)' },
                            ]}
                        />
                    </div>

                    <div className="w-56">
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Transaction Type
                        </label>
                        <Select
                            value={selectedType || 'All'}
                            onChange={(val) => setSelectedType(val)}
                            className="w-full"
                            options={[
                                { label: 'All Types', value: 'All' },
                                { label: 'Deposit', value: 'Deposit' },
                                { label: 'Withdraw', value: 'Withdraw' },
                                { label: 'Market Win', value: 'Market Win' },
                                { label: 'Market Loss', value: 'Market Loss' },
                                { label: 'Commission', value: 'Commission' },
                            ]}
                        />
                    </div>

                    <Button
                        type="primary"
                        icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                        onClick={fetchStatements}
                    >
                        Filter
                    </Button>
                </div>
            </Card>

            {/* Statement Table */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3">NO</th>
                                <th className="py-2.5 px-3">DATE</th>
                                <th className="py-2.5 px-3">USER / ACCOUNT</th>
                                <th className="py-2.5 px-3">EVENT TYPE</th>
                                <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                <th className="py-2.5 px-3 text-right">TOTAL</th>
                                <th className="py-2.5 px-3 text-right">BALANCE</th>
                                <th className="py-2.5 px-3 text-center">TYPE</th>
                                <th className="py-2.5 px-3 text-center">D / C</th>
                                <th className="py-2.5 px-3">DESCRIPTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-10 text-center text-ink-3 font-medium">
                                        Loading ledger statements...
                                    </td>
                                </tr>
                            ) : filteredStatements.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-10 text-center text-ink-3 font-medium">
                                        No Data Available In Table
                                    </td>
                                </tr>
                            ) : (
                                filteredStatements.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedDetail(item)}
                                        className="hover:bg-surface-hover transition-colors cursor-pointer"
                                    >
                                        <td className="py-2.5 px-3 font-semibold text-ink-3">{idx + 1}</td>
                                        <td className="py-2.5 px-3 text-[11px] text-ink-3 whitespace-nowrap">{item.date_str}</td>
                                        <td className="py-2.5 px-3 font-medium text-ink-2">
                                            {item.site_user}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-ink">
                                            {item.event_type}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                                            <span className={item.amount > 0 ? 'text-success' : item.amount < 0 ? 'text-error' : 'text-ink-3'}>
                                                {item.amount > 0 ? '+' : ''}
                                                {item.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-ink-2">
                                            {item.total.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-ink">
                                            {item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag>{item.type}</Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag color={item.dc === 'Credit' ? 'success' : 'error'}>
                                                {item.dc}
                                            </Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-[11px] text-ink-2">
                                            <div className="truncate max-w-[450px]" title={item.description}>
                                                {item.description}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2.5 bg-surface-2 border-t border-line flex items-center justify-between text-xs text-ink-3">
                    <span>Showing <strong>1</strong> to <strong>{filteredStatements.length}</strong> of <strong>{statements.length}</strong> ledger records</span>
                    <span className="font-medium text-ink-3">Rolex Financial Settlement Ledger</span>
                </div>
            </Card>

            {/* Entry Detail Dialog */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <MdReceiptLong className="text-primary text-lg" />
                        <span>Ledger Entry Audit</span>
                    </div>
                }
                open={Boolean(selectedDetail)}
                onCancel={() => setSelectedDetail(null)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setSelectedDetail(null)}>
                        Close
                    </Button>,
                ]}
            >
                {selectedDetail && (
                    <div className="space-y-3 pt-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-line">
                            <span className="text-ink-3">Transaction Classification</span>
                            <Tag color={selectedDetail.dc === 'Credit' ? 'success' : 'error'}>
                                {selectedDetail.dc}
                            </Tag>
                        </div>

                        <div className="bg-surface-2 p-3 rounded border border-line text-xs space-y-1.5 font-mono">
                            <div className="flex justify-between">
                                <span className="text-ink-3 font-sans">Timestamp:</span>
                                <span>{selectedDetail.date_str}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3 font-sans">Account:</span>
                                <span>{selectedDetail.site_user}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3 font-sans">Event Category:</span>
                                <span>{selectedDetail.event_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3 font-sans">Transaction Type:</span>
                                <span>{selectedDetail.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3 font-sans">Ledger Amount:</span>
                                <span className={selectedDetail.amount >= 0 ? 'text-success' : 'text-error'}>
                                    ₹{selectedDetail.amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3 font-sans">Updated Balance:</span>
                                <span className="font-bold text-ink">
                                    ₹{selectedDetail.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1">
                                Market / Bet Slip Description:
                            </div>
                            <div className="p-2.5 bg-surface-2 border border-line rounded text-xs text-ink-2">
                                {selectedDetail.description}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default StatementView
