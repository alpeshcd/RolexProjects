import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Card,
    Tabs,
    Button,
    Input,
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
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    SearchOutlined,
    CopyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
    StopOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetWithdrawals,
    apiCreateWithdrawal,
    apiApproveWithdrawal,
    apiRejectWithdrawal,
    apiCancelWithdrawal,
} from '@/services/WithdrawalsService'
import type { Withdrawal } from '@/@types/withdrawal'
import { MdAccountBalance, MdPayments } from 'react-icons/md'

type TabType = 'pending' | 'history'

const { Title, Text } = Typography

const WithdrawView = () => {
    const location = useLocation()

    // Determine initial active tab based on route pathname
    const getInitialTab = (): TabType => {
        const path = location.pathname.toLowerCase()
        if (path.includes('history')) return 'history'
        return 'pending'
    }

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab())

    // Withdrawals state
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(true)

    const queryUser = new URLSearchParams(location.search).get('user') || new URLSearchParams(location.search).get('username') || ''

    // Filter state for Pending Queue
    const [pendingUserFilter, setPendingUserFilter] = useState<string>(queryUser)
    const [pendingStatusFilter, setPendingStatusFilter] = useState<string>('Pending')
    const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('Client')

    // Filter state for Withdraw History
    const [histDomainFilter, setHistDomainFilter] = useState<string>('')
    const [histStatusFilter, setHistStatusFilter] = useState<string>('')
    const [histTypeFilter, setHistTypeFilter] = useState<string>('')
    const [histUserFilter, setHistUserFilter] = useState<string>(queryUser)
    const [histUtrFilter, setHistUtrFilter] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    // Modal States
    const [approveModalItem, setApproveModalItem] = useState<Withdrawal | null>(null)
    const [approvalUtr, setApprovalUtr] = useState<string>('')
    const [isApproving, setIsApproving] = useState<boolean>(false)

    const [rejectModalItem, setRejectModalItem] = useState<Withdrawal | null>(null)
    const [rejectReason, setRejectReason] = useState<string>('Account details mismatch / Bank server failure')
    const [isRejecting, setIsRejecting] = useState<boolean>(false)

    const [selectedDetailWithdrawal, setSelectedDetailWithdrawal] = useState<Withdrawal | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
    const [newUsername, setNewUsername] = useState<string>('')
    const [newSite, setNewSite] = useState<string>('Mastan365')
    const [newAmount, setNewAmount] = useState<string>('')
    const [newAccountName, setNewAccountName] = useState<string>('')
    const [newAccountNo, setNewAccountNo] = useState<string>('')
    const [newIfsc, setNewIfsc] = useState<string>('')
    const [newBankName, setNewBankName] = useState<string>('')
    const [isCreating, setIsCreating] = useState<boolean>(false)

    // Sync tab when URL changes
    useEffect(() => {
        setActiveTab(getInitialTab())
    }, [location.pathname])

    // Fetch withdrawals from FastAPI
    const fetchWithdrawals = async () => {
        setLoadingWithdrawals(true)
        try {
            const data = await apiGetWithdrawals()
            setWithdrawals(data)
        } catch (err: any) {
            console.error('Failed to load withdrawals', err)
            toast.push(
                <Notification title="Data Sync Error" type="danger">
                    Failed to sync withdrawals from server.
                </Notification>
            )
        } finally {
            setLoadingWithdrawals(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    // Copy to clipboard helper
    const handleCopy = (text: string, label: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.push(
            <Notification title="Copied" type="success" duration={2000}>
                {label} copied to clipboard
            </Notification>
        )
    }

    // Approve handler with UTR number
    const handleApproveConfirm = async () => {
        if (!approveModalItem) return
        if (!approvalUtr.trim()) {
            toast.push(
                <Notification title="Missing UTR" type="warning">
                    Please provide the bank transfer UTR number before confirming payout.
                </Notification>
            )
            return
        }

        setIsApproving(true)
        try {
            const updated = await apiApproveWithdrawal(approveModalItem.id, {
                utr_number: approvalUtr.trim(),
            })
            setWithdrawals((prev) =>
                prev.map((w) => (w.id === updated.id ? updated : w))
            )
            toast.push(
                <Notification title="Payout Approved!" type="success">
                    Withdrawal #{updated.withdrawal_id} approved. Client balance and dashboard KPIs updated!
                </Notification>
            )
            setApproveModalItem(null)
            setApprovalUtr('')
        } catch (err: any) {
            toast.push(
                <Notification title="Approval Failed" type="danger">
                    {err?.response?.data?.detail || 'Could not approve withdrawal payout.'}
                </Notification>
            )
        } finally {
            setIsApproving(false)
        }
    }

    // Reject handler
    const handleRejectConfirm = async () => {
        if (!rejectModalItem) return
        setIsRejecting(true)
        try {
            const updated = await apiRejectWithdrawal(rejectModalItem.id, {
                reason: rejectReason,
            })
            setWithdrawals((prev) =>
                prev.map((w) => (w.id === updated.id ? updated : w))
            )
            toast.push(
                <Notification title="Withdrawal Rejected" type="warning">
                    Withdrawal #{updated.withdrawal_id} rejected. Client balance is unchanged.
                </Notification>
            )
            setRejectModalItem(null)
        } catch (err: any) {
            toast.push(
                <Notification title="Rejection Failed" type="danger">
                    {err?.response?.data?.detail || 'Could not reject withdrawal.'}
                </Notification>
            )
        } finally {
            setIsRejecting(false)
        }
    }

    // Cancel handler
    const handleCancel = async (item: Withdrawal) => {
        try {
            const updated = await apiCancelWithdrawal(item.id)
            setWithdrawals((prev) =>
                prev.map((w) => (w.id === item.id ? updated : w))
            )
            toast.push(
                <Notification title="Withdrawal Canceled" type="info">
                    Withdrawal #{updated.withdrawal_id} canceled.
                </Notification>
            )
        } catch (err: any) {
            toast.push(
                <Notification title="Cancel Failed" type="danger">
                    {err?.response?.data?.detail || 'Could not cancel withdrawal.'}
                </Notification>
            )
        }
    }

    // Create withdrawal
    const handleCreateWithdrawal = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!newUsername.trim() || !newAmount.trim() || !newAccountNo.trim()) {
            toast.push(
                <Notification title="Required Fields" type="warning">
                    Username, Amount, and Account Number are required.
                </Notification>
            )
            return
        }

        setIsCreating(true)
        try {
            const created = await apiCreateWithdrawal({
                username: newUsername.trim(),
                site: newSite,
                amount: parseFloat(newAmount) || 0,
                account_name: newAccountName.trim() || newUsername.trim(),
                account_no: newAccountNo.trim(),
                ifsc_code: newIfsc.trim() || 'SBIN0001890',
                bank_name: newBankName.trim() || 'State Bank of India',
                type: 'Client',
            })
            setWithdrawals((prev) => [created, ...prev])
            toast.push(
                <Notification title="Withdrawal Created" type="success">
                    Payout request #{created.withdrawal_id} created in Pending queue!
                </Notification>
            )
            setIsCreateModalOpen(false)
            setNewUsername('')
            setNewAmount('')
            setNewAccountName('')
            setNewAccountNo('')
            setNewIfsc('')
            setNewBankName('')
        } catch (err: any) {
            toast.push(
                <Notification title="Request Failed" type="danger">
                    {err?.response?.data?.detail || 'Failed to submit withdrawal request.'}
                </Notification>
            )
        } finally {
            setIsCreating(false)
        }
    }

    // Filtered lists
    const pendingWithdrawals = withdrawals.filter((w) => {
        if (pendingStatusFilter && pendingStatusFilter.toLowerCase() !== 'all') {
            if (w.status.toLowerCase() !== pendingStatusFilter.toLowerCase()) return false
        }
        if (pendingTypeFilter && pendingTypeFilter.toLowerCase() !== 'all') {
            if (w.type.toLowerCase() !== pendingTypeFilter.toLowerCase()) return false
        }
        if (pendingUserFilter.trim()) {
            if (!w.username.toLowerCase().includes(pendingUserFilter.toLowerCase().trim()))
                return false
        }
        return true
    })

    const historyWithdrawals = withdrawals.filter((w) => {
        if (histDomainFilter && histDomainFilter !== 'Select domain' && histDomainFilter !== 'All') {
            const matchDomain = (w.domain || '').toLowerCase().includes(histDomainFilter.toLowerCase())
            const matchSite = (w.site || '').toLowerCase().includes(histDomainFilter.toLowerCase())
            if (!matchDomain && !matchSite) return false
        }
        if (histStatusFilter && histStatusFilter !== 'Select status' && histStatusFilter !== 'All') {
            if (w.status.toLowerCase() !== histStatusFilter.toLowerCase()) return false
        }
        if (histTypeFilter && histTypeFilter !== 'Select type' && histTypeFilter !== 'All') {
            if (w.type.toLowerCase() !== histTypeFilter.toLowerCase()) return false
        }
        if (histUserFilter.trim()) {
            if (!w.username.toLowerCase().includes(histUserFilter.toLowerCase().trim())) return false
        }
        if (histUtrFilter.trim()) {
            if (!(w.utr_number || '').toLowerCase().includes(histUtrFilter.toLowerCase().trim()))
                return false
        }
        return true
    })

    // KPI Calculations
    const approvedVolume = withdrawals
        .filter((w) => w.status === 'Approved')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0)
    const pendingCount = withdrawals.filter((w) => w.status === 'Pending').length
    const pendingVolume = withdrawals
        .filter((w) => w.status === 'Pending')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0)
    const approvedCount = withdrawals.filter((w) => w.status === 'Approved').length
    const rejectedCount = withdrawals.filter((w) => w.status === 'Rejected').length
    const successRate = withdrawals.length > 0 ? Math.round((approvedCount / withdrawals.length) * 100) : 0

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Payout Operations' },
                            {
                                title:
                                    activeTab === 'history'
                                        ? 'Withdraw History'
                                        : 'Pending Queue',
                            },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Withdrawal & Banking Settlement
                        </Title>
                        <Tag color="cyan">Settlement</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Real-time client payout verification, UTR issuance, and multi-bank settlement ledger.
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        New Withdrawal
                    </Button>
                    <Button
                        icon={<ReloadOutlined className={loadingWithdrawals ? 'animate-spin' : ''} />}
                        onClick={fetchWithdrawals}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* KPI Summary Cards Strip */}
            <Row gutter={[12, 12]}>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Pending Payouts</span>}
                            value={pendingVolume}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--warning)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">({pendingCount})</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Settled</span>}
                            value={approvedVolume}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">({approvedCount})</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Rejected / Blocked</span>}
                            value={rejectedCount}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--error)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">requests</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Settlement Rate</span>}
                            value={successRate}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Ant Design Sub-Navigation Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as TabType)}
                items={[
                    {
                        key: 'pending',
                        label: `Pending Withdrawals (${pendingCount})`,
                    },
                    {
                        key: 'history',
                        label: `Withdraw History (${withdrawals.length})`,
                    },
                ]}
            />

            {/* TAB 1: PENDING WITHDRAWALS */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {/* Filter Card */}
                    <Card size="small" className="border border-line">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Username
                                </label>
                                <Input
                                    placeholder="Search by client username..."
                                    prefix={<SearchOutlined className="text-ink-3" />}
                                    value={pendingUserFilter}
                                    onChange={(e) => setPendingUserFilter(e.target.value)}
                                    allowClear
                                />
                            </div>

                            <div className="w-44">
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <Select
                                    value={pendingStatusFilter}
                                    onChange={(val) => setPendingStatusFilter(val)}
                                    className="w-full"
                                    options={[
                                        { label: 'All Statuses', value: 'All' },
                                        { label: 'Pending', value: 'Pending' },
                                        { label: 'Approved', value: 'Approved' },
                                        { label: 'Rejected', value: 'Rejected' },
                                        { label: 'Canceled', value: 'Canceled' },
                                    ]}
                                />
                            </div>

                            <div className="w-44">
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Type
                                </label>
                                <Select
                                    value={pendingTypeFilter}
                                    onChange={(val) => setPendingTypeFilter(val)}
                                    className="w-full"
                                    options={[
                                        { label: 'All Types', value: 'All' },
                                        { label: 'Client', value: 'Client' },
                                        { label: 'Manual', value: 'Manual' },
                                    ]}
                                />
                            </div>

                            <Button
                                type="primary"
                                icon={<ReloadOutlined className={loadingWithdrawals ? 'animate-spin' : ''} />}
                                onClick={fetchWithdrawals}
                            >
                                Refresh
                            </Button>
                        </div>
                    </Card>

                    {/* Pending Table */}
                    <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                                    <tr>
                                        <th className="py-2.5 px-3">NO</th>
                                        <th className="py-2.5 px-3">ID</th>
                                        <th className="py-2.5 px-3">SITE</th>
                                        <th className="py-2.5 px-3">USERNAME</th>
                                        <th className="py-2.5 px-3 min-w-[220px]">DESTINATION ACCOUNT</th>
                                        <th className="py-2.5 px-3">AMOUNT</th>
                                        <th className="py-2.5 px-3">TYPE</th>
                                        <th className="py-2.5 px-3">STATUS</th>
                                        <th className="py-2.5 px-3 text-center min-w-[170px]">ACTION</th>
                                        <th className="py-2.5 px-3">DATE</th>
                                        <th className="py-2.5 px-3">APPROVED AT</th>
                                        <th className="py-2.5 px-3">REJECTED AT</th>
                                        <th className="py-2.5 px-3">CANCELED AT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {pendingWithdrawals.length === 0 ? (
                                        <tr>
                                            <td colSpan={13} className="py-10 text-center text-ink-3 font-medium">
                                                No Data Available In Table
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingWithdrawals.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-surface-hover transition-colors"
                                            >
                                                <td className="py-2.5 px-3 font-semibold text-ink-3">{idx + 1}</td>
                                                <td className="py-2.5 px-3 font-mono font-medium text-ink-2">
                                                    {item.withdrawal_id}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Tag color="cyan">{item.site}</Tag>
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-ink">
                                                    {item.username}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <div className="bg-surface-2 p-2 rounded border border-line space-y-1">
                                                        <div className="font-semibold text-ink flex items-center gap-1.5">
                                                            <MdAccountBalance className="text-primary" />
                                                            <span>{item.account_name || 'N/A'}</span>
                                                        </div>
                                                        <div className="font-mono text-[11px] text-ink-2 flex items-center justify-between">
                                                            <span>A/C: {item.account_no || '-'}</span>
                                                            {item.account_no && (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<CopyOutlined className="text-xs" />}
                                                                    onClick={() => handleCopy(item.account_no || '', 'Account No')}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-ink-3 flex items-center justify-between">
                                                            <span>IFSC: {item.ifsc_code || '-'}</span>
                                                            {item.ifsc_code && (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<CopyOutlined className="text-xs" />}
                                                                    onClick={() => handleCopy(item.ifsc_code || '', 'IFSC')}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-ink">
                                                    ₹{item.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Tag>{item.type}</Tag>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {item.status === 'Approved' ? (
                                                        <Tag color="success">Approved</Tag>
                                                    ) : item.status === 'Rejected' ? (
                                                        <Tag color="error">Rejected</Tag>
                                                    ) : item.status === 'Canceled' ? (
                                                        <Tag color="default">Canceled</Tag>
                                                    ) : (
                                                        <Tag color="warning">Pending</Tag>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {item.status === 'Pending' ? (
                                                        <Space size="small">
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                icon={<CheckOutlined />}
                                                                style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                                                                onClick={() => {
                                                                    setApproveModalItem(item)
                                                                    setApprovalUtr('')
                                                                }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                danger
                                                                size="small"
                                                                icon={<CloseOutlined />}
                                                                onClick={() => setRejectModalItem(item)}
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                icon={<StopOutlined />}
                                                                onClick={() => handleCancel(item)}
                                                            />
                                                        </Space>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            onClick={() => setSelectedDetailWithdrawal(item)}
                                                        >
                                                            Details
                                                        </Button>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-[11px] text-ink-3">{item.date_str || '-'}</td>
                                                <td className="py-2.5 px-3 text-[11px] text-success font-medium">
                                                    {item.approved_at_str || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-[11px] text-error font-medium">
                                                    {item.rejected_at_str || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-[11px] text-ink-3">
                                                    {item.canceled_at_str || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 2: WITHDRAW HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Filter Card */}
                    <Card size="small" className="border border-line">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Domain
                                </label>
                                <Select
                                    value={histDomainFilter || 'Select domain'}
                                    onChange={(val) => setHistDomainFilter(val)}
                                    className="w-full"
                                    options={[
                                        { label: 'Select domain', value: 'Select domain' },
                                        { label: 'All Domains', value: 'All' },
                                        { label: 'mastan247.com', value: 'mastan247.com' },
                                        { label: 'mastan365.com', value: 'mastan365.com' },
                                        { label: 'mastan99.com', value: 'mastan99.com' },
                                        { label: 'mastanreddy.com', value: 'mastanreddy.com' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <Select
                                    value={histStatusFilter || 'Select status'}
                                    onChange={(val) => setHistStatusFilter(val)}
                                    className="w-full"
                                    options={[
                                        { label: 'Select status', value: 'Select status' },
                                        { label: 'All Statuses', value: 'All' },
                                        { label: 'Approved', value: 'Approved' },
                                        { label: 'Rejected', value: 'Rejected' },
                                        { label: 'Pending', value: 'Pending' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Type
                                </label>
                                <Select
                                    value={histTypeFilter || 'Select type'}
                                    onChange={(val) => setHistTypeFilter(val)}
                                    className="w-full"
                                    options={[
                                        { label: 'Select type', value: 'Select type' },
                                        { label: 'All Types', value: 'All' },
                                        { label: 'Client', value: 'Client' },
                                        { label: 'Manual', value: 'Manual' },
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Username
                                </label>
                                <Input
                                    placeholder="Username"
                                    value={histUserFilter}
                                    onChange={(e) => setHistUserFilter(e.target.value)}
                                    allowClear
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    UTR Number
                                </label>
                                <Input
                                    placeholder="UTR Number"
                                    value={histUtrFilter}
                                    onChange={(e) => setHistUtrFilter(e.target.value)}
                                    allowClear
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
                            <div className="flex items-center gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-2.5 py-1.5 bg-surface border border-line-strong rounded text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-2.5 py-1.5 bg-surface border border-line-strong rounded text-xs"
                                    />
                                </div>
                            </div>

                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={fetchWithdrawals}
                            >
                                Search
                            </Button>
                        </div>
                    </Card>

                    {/* History Table */}
                    <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                                    <tr>
                                        <th className="py-2.5 px-3">NO</th>
                                        <th className="py-2.5 px-3">ID</th>
                                        <th className="py-2.5 px-3">SITE</th>
                                        <th className="py-2.5 px-3">USERNAME</th>
                                        <th className="py-2.5 px-3">MASTER</th>
                                        <th className="py-2.5 px-3 min-w-[220px]">ACCOUNT</th>
                                        <th className="py-2.5 px-3">AMOUNT</th>
                                        <th className="py-2.5 px-3">TYPE</th>
                                        <th className="py-2.5 px-3">UTR NUMBER</th>
                                        <th className="py-2.5 px-3">STATUS</th>
                                        <th className="py-2.5 px-3 text-center">ACTION</th>
                                        <th className="py-2.5 px-3">DATE</th>
                                        <th className="py-2.5 px-3">APPROVED AT</th>
                                        <th className="py-2.5 px-3">REJECTED AT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {historyWithdrawals.length === 0 ? (
                                        <tr>
                                            <td colSpan={14} className="py-10 text-center text-ink-3 font-medium">
                                                No Matching Historical Records Found
                                            </td>
                                        </tr>
                                    ) : (
                                        historyWithdrawals.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-surface-hover transition-colors"
                                            >
                                                <td className="py-2.5 px-3 font-semibold text-ink-3">{idx + 1}</td>
                                                <td className="py-2.5 px-3 font-mono font-medium text-ink-2">
                                                    {item.withdrawal_id}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Tag color="cyan">{item.site}</Tag>
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-ink">
                                                    {item.username}
                                                </td>
                                                <td className="py-2.5 px-3 text-ink-3">
                                                    {item.master}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <div className="bg-surface-2 p-2 rounded border border-line space-y-1">
                                                        <div className="font-semibold text-ink">
                                                            {item.account_name || 'N/A'}
                                                        </div>
                                                        <div className="font-mono text-[11px] text-ink-2 flex items-center justify-between">
                                                            <span>A/C: {item.account_no || '-'}</span>
                                                            {item.account_no && (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<CopyOutlined className="text-xs" />}
                                                                    onClick={() => handleCopy(item.account_no || '', 'Account No')}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-ink-3 flex items-center justify-between">
                                                            <span>IFSC: {item.ifsc_code || '-'}</span>
                                                            {item.ifsc_code && (
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<CopyOutlined className="text-xs" />}
                                                                    onClick={() => handleCopy(item.ifsc_code || '', 'IFSC')}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-ink">
                                                    ₹{item.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Tag>{item.type}</Tag>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {item.utr_number ? (
                                                        <Tag color="green" className="font-mono font-semibold">
                                                            {item.utr_number}
                                                        </Tag>
                                                    ) : (
                                                        <span className="text-ink-3 font-mono">-</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {item.status === 'Approved' ? (
                                                        <Tag color="success">Approved</Tag>
                                                    ) : item.status === 'Rejected' ? (
                                                        <Tag color="error">Rejected</Tag>
                                                    ) : (
                                                        <Tag color="warning">{item.status}</Tag>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <Button
                                                        size="small"
                                                        onClick={() => setSelectedDetailWithdrawal(item)}
                                                    >
                                                        Details
                                                    </Button>
                                                </td>
                                                <td className="py-2.5 px-3 text-[11px] text-ink-3">{item.date_str || '-'}</td>
                                                <td className="py-2.5 px-3 text-[11px] text-success font-medium">
                                                    {item.approved_at_str || '-'}
                                                </td>
                                                <td className="py-2.5 px-3 text-[11px] text-error font-medium">
                                                    {item.rejected_at_str || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* APPROVAL MODAL */}
            <Modal
                title="Approve & Settle Payout"
                open={Boolean(approveModalItem)}
                onCancel={() => setApproveModalItem(null)}
                onOk={handleApproveConfirm}
                confirmLoading={isApproving}
                okText="Confirm & Complete Payout"
                okButtonProps={{ style: { backgroundColor: 'var(--success)', borderColor: 'var(--success)' } }}
            >
                {approveModalItem && (
                    <div className="space-y-3 pt-2 text-xs">
                        <div className="bg-surface-2 p-3 rounded border border-line space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-ink-3">Amount to Transfer:</span>
                                <span className="font-bold text-success text-sm">
                                    ₹{approveModalItem.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">A/C Holder Name:</span>
                                <span className="font-semibold text-ink">
                                    {approveModalItem.account_name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Bank Account Number:</span>
                                <span className="font-mono font-semibold text-ink">
                                    {approveModalItem.account_no}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">IFSC Code:</span>
                                <span className="font-mono font-semibold text-ink">
                                    {approveModalItem.ifsc_code}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Bank Transfer UTR / Ref Number <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="e.g. 665428117649"
                                value={approvalUtr}
                                onChange={(e) => setApprovalUtr(e.target.value)}
                                autoFocus
                            />
                            <p className="text-[11px] text-ink-3 mt-1">
                                Client balance is debited and settlement dashboard updated upon confirmation.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* REJECTION MODAL */}
            <Modal
                title="Reject Withdrawal"
                open={Boolean(rejectModalItem)}
                onCancel={() => setRejectModalItem(null)}
                onOk={handleRejectConfirm}
                confirmLoading={isRejecting}
                okText="Reject Withdrawal"
                okButtonProps={{ danger: true }}
            >
                {rejectModalItem && (
                    <div className="space-y-3 pt-2 text-xs">
                        <p className="text-ink-3">
                            Withdrawal ID #{rejectModalItem.withdrawal_id} • Amount: ₹{rejectModalItem.amount.toLocaleString('en-IN')}
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Rejection Reason
                            </label>
                            <Select
                                value={rejectReason}
                                onChange={(val) => setRejectReason(val)}
                                className="w-full"
                                options={[
                                    { label: 'Account details mismatch / Bank server failure', value: 'Account details mismatch / Bank server failure' },
                                    { label: 'Incorrect IFSC Code or Branch details', value: 'Incorrect IFSC Code or Branch details' },
                                    { label: 'Daily withdrawal volume limit exceeded', value: 'Daily withdrawal volume limit exceeded' },
                                    { label: 'Account verification pending', value: 'Account verification pending' },
                                    { label: 'Client requested cancellation', value: 'Client requested cancellation' },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* DETAIL MODAL */}
            <Modal
                title={`Settlement Voucher #${selectedDetailWithdrawal?.withdrawal_id || ''}`}
                open={Boolean(selectedDetailWithdrawal)}
                onCancel={() => setSelectedDetailWithdrawal(null)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setSelectedDetailWithdrawal(null)}>
                        Close Voucher
                    </Button>,
                ]}
            >
                {selectedDetailWithdrawal && (
                    <div className="space-y-3 pt-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-line">
                            <span className="text-ink-3">Status</span>
                            <Tag color={selectedDetailWithdrawal.status === 'Approved' ? 'success' : 'error'}>
                                {selectedDetailWithdrawal.status}
                            </Tag>
                        </div>
                        <div className="bg-surface-2 p-3 rounded border border-line space-y-2">
                            <div className="flex justify-between">
                                <span className="text-ink-3">Player Username:</span>
                                <span className="font-bold text-ink">{selectedDetailWithdrawal.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Site / Portal:</span>
                                <span className="font-bold text-primary">{selectedDetailWithdrawal.site}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Disbursed Amount:</span>
                                <span className="font-bold text-sm text-ink">
                                    ₹{selectedDetailWithdrawal.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">A/C Holder Name:</span>
                                <span className="font-semibold text-ink">{selectedDetailWithdrawal.account_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Account Number:</span>
                                <span className="font-mono font-semibold text-ink">{selectedDetailWithdrawal.account_no}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Bank IFSC Code:</span>
                                <span className="font-mono font-semibold text-ink">{selectedDetailWithdrawal.ifsc_code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Bank Transfer UTR:</span>
                                <span className="font-mono font-semibold text-success">
                                    {selectedDetailWithdrawal.utr_number || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Requested Date:</span>
                                <span className="text-ink-2">{selectedDetailWithdrawal.date_str || '-'}</span>
                            </div>
                            {selectedDetailWithdrawal.approved_at_str && (
                                <div className="flex justify-between">
                                    <span className="text-ink-3">Approved Timestamp:</span>
                                    <span className="text-success font-medium">{selectedDetailWithdrawal.approved_at_str}</span>
                                </div>
                            )}
                            {selectedDetailWithdrawal.rejected_at_str && (
                                <div className="flex justify-between">
                                    <span className="text-ink-3">Rejected Timestamp:</span>
                                    <span className="text-error font-medium">{selectedDetailWithdrawal.rejected_at_str}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* CREATE WITHDRAWAL MODAL */}
            <Modal
                title="Create New Client Withdrawal"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onOk={() => handleCreateWithdrawal()}
                confirmLoading={isCreating}
                okText="Submit Request"
            >
                <div className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Client Username <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="e.g. KAASH26"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Portal / Site
                            </label>
                            <Select
                                value={newSite}
                                onChange={(val) => setNewSite(val)}
                                className="w-full"
                                options={[
                                    { label: 'Mastan 247', value: 'Mastan 247' },
                                    { label: 'Mastan365', value: 'Mastan365' },
                                    { label: 'Mastan99', value: 'Mastan99' },
                                    { label: 'Mastanredd', value: 'Mastanredd' },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Withdrawal Amount (₹) <span className="text-error">*</span>
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 5000"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Account Holder Name
                            </label>
                            <Input
                                placeholder="e.g. Kashyap J"
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Bank Name
                            </label>
                            <Input
                                placeholder="e.g. State Bank of India"
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Account Number <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="e.g. 020100050306026"
                                value={newAccountNo}
                                onChange={(e) => setNewAccountNo(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                IFSC Code
                            </label>
                            <Input
                                placeholder="e.g. SBIN0001890"
                                value={newIfsc}
                                onChange={(e) => setNewIfsc(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default WithdrawView
