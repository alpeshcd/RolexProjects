import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
    Divider,
    message,
} from 'antd'
import {
    ReloadOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    SearchOutlined,
    FileTextOutlined,
    EyeOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetDeposits,
    apiCreateDeposit,
    apiApproveDeposit,
    apiRejectDeposit,
    apiGetUTRs,
    apiCreateUTR,
    apiRemoveUTR,
} from '@/services/DepositsService'
import { apiGetActiveAccounts } from '@/services/BankAccountsService'
import type { Deposit, UTREntry } from '@/@types/deposit'
import type { BankAccount } from '@/@types/account'
import {
    HiSearch,
    HiRefresh,
    HiCheck,
    HiX,
    HiTrash,
    HiOutlineDocumentText,
    HiCreditCard,
    HiCash,
    HiOutlinePhotograph,
    HiOutlineClock,
    HiCheckCircle,
    HiXCircle,
    HiLightningBolt,
    HiFilter,
} from 'react-icons/hi'
import { MdAccountBalance, MdCheckCircle, MdCancel, MdReceiptLong } from 'react-icons/md'

type TabType = 'pending' | 'history' | 'utr-entry' | 'utr-pending' | 'utr-removed'

const { Title, Text } = Typography

const DepositView = () => {
    const location = useLocation()
    const navigate = useNavigate()

    // Determine initial active tab based on route pathname
    const getInitialTab = (): TabType => {
        const path = location.pathname.toLowerCase()
        // Most specific first: /deposits/utr-entry/removed-list also contains "utr-entry"
        if (path.includes('removed')) return 'utr-removed'
        if (path.includes('history')) return 'history'
        if (path.includes('utr-pending')) return 'utr-pending'
        if (path.includes('utr-entry')) return 'utr-entry'
        return 'pending'
    }

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab())

    // Deposits state
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [loadingDeposits, setLoadingDeposits] = useState<boolean>(true)

    // Active Bank/UPI Accounts for dropdown
    const [accounts, setAccounts] = useState<BankAccount[]>([])

    // Quick UTR Box state (Screenshot 1 top row)
    const [quickUtr, setQuickUtr] = useState<string>('')
    const [quickAccount, setQuickAccount] = useState<string>('')
    const [quickAmount, setQuickAmount] = useState<string>('')
    const [isSubmittingQuick, setIsSubmittingQuick] = useState<boolean>(false)

    const queryUser = new URLSearchParams(location.search).get('user') || new URLSearchParams(location.search).get('username') || ''

    // Filter state for Pending Deposits (Screenshot 1 row 2)
    const [pendingUtrFilter, setPendingUtrFilter] = useState<string>('')
    const [pendingUserFilter, setPendingUserFilter] = useState<string>(queryUser)
    const [pendingAccountFilter, setPendingAccountFilter] = useState<string>('')
    const [pendingStatusFilter, setPendingStatusFilter] = useState<string>('Pending')
    const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('Client')

    // Filter state for Deposit History (Screenshot 2)
    const [histDomainFilter, setHistDomainFilter] = useState<string>('')
    const [histStatusFilter, setHistStatusFilter] = useState<string>('')
    const [histTypeFilter, setHistTypeFilter] = useState<string>('')
    const [histUserFilter, setHistUserFilter] = useState<string>(queryUser)
    const [histUtrFilter, setHistUtrFilter] = useState<string>('')
    const [histStartDate, setHistStartDate] = useState<string>('')
    const [histEndDate, setHistEndDate] = useState<string>('')

    // UTR Entries State (Screenshots 3, 4, 5)
    const [utrs, setUtrs] = useState<UTREntry[]>([])
    const [loadingUtrs, setLoadingUtrs] = useState<boolean>(false)
    const [newUtrNumber, setNewUtrNumber] = useState<string>('')
    const [newUtrAccount, setNewUtrAccount] = useState<string>('')
    const [newUtrAmount, setNewUtrAmount] = useState<string>('')
    const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false)

    // Removed UTR filter (Screenshot 5)
    const [removedUtrSearch, setRemovedUtrSearch] = useState<string>('')

    // Proof Modal State
    const [selectedProofDeposit, setSelectedProofDeposit] = useState<Deposit | null>(null)

    // Load active bank accounts for select boxes
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const accs = await apiGetActiveAccounts()
                setAccounts(accs)
                if (accs.length > 0) {
                    setQuickAccount(accs[0].name + ' : ' + accs[0].account_number)
                    setNewUtrAccount(accs[0].name + ' : ' + accs[0].account_number)
                }
            } catch (e) {
                // Ignore
            }
        }
        loadAccounts()
    }, [])

    // Load deposits based on active tab
    const fetchDepositsList = async (statusParam?: string) => {
        setLoadingDeposits(true)
        try {
            const data = await apiGetDeposits({
                status: statusParam,
                username: activeTab === 'pending' ? pendingUserFilter : histUserFilter || undefined,
                utr_number: activeTab === 'pending' ? pendingUtrFilter : histUtrFilter || undefined,
                domain: activeTab === 'history' ? histDomainFilter || undefined : undefined,
                type: activeTab === 'pending' ? (pendingTypeFilter !== 'All' ? pendingTypeFilter : undefined) : histTypeFilter || undefined,
            })
            setDeposits(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch deposits
                </Notification>
            )
        } finally {
            setLoadingDeposits(false)
        }
    }

    // Load UTRs
    const fetchUtrsList = async (status: string, search?: string) => {
        setLoadingUtrs(true)
        try {
            const data = await apiGetUTRs({
                status: status,
                utr_number: search || undefined,
            })
            setUtrs(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to load UTR list
                </Notification>
            )
        } finally {
            setLoadingUtrs(false)
        }
    }

    // Effect on tab change
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchDepositsList('Pending')
        } else if (activeTab === 'history') {
            fetchDepositsList(histStatusFilter || undefined)
        } else if (activeTab === 'utr-pending') {
            fetchUtrsList('PENDING')
        } else if (activeTab === 'utr-removed') {
            fetchUtrsList('REMOVED', removedUtrSearch)
        }
    }, [activeTab])

    // Quick UTR Submit (Screenshot 1 top row)
    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!quickUtr.trim() || !quickAmount.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    UTR Number and Amount are required.
                </Notification>
            )
            return
        }

        setIsSubmittingQuick(true)
        try {
            await apiCreateUTR({
                utr_number: quickUtr.trim(),
                account_name: quickAccount || 'Default Gateway',
                amount: parseFloat(quickAmount) || 0,
            })

            toast.push(
                <Notification type="success" title="UTR Verified & Logged">
                    UTR <strong>{quickUtr.trim()}</strong> for ₹{quickAmount} recorded successfully!
                </Notification>
            )

            setQuickUtr('')
            setQuickAmount('')
            fetchDepositsList('Pending')
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Submission Failed">
                    {err?.response?.data?.detail || 'Failed to submit UTR'}
                </Notification>
            )
        } finally {
            setIsSubmittingQuick(false)
        }
    }

    // Approve Deposit
    const handleApprove = async (dep: Deposit) => {
        try {
            const updated = await apiApproveDeposit(dep.id)
            setDeposits((prev) => prev.map((d) => (d.id === dep.id ? updated : d)))
            toast.push(
                <Notification type="success" title="Deposit Approved">
                    ₹{dep.amount.toLocaleString()} credited to <strong>{dep.username}</strong>!
                </Notification>
            )
            // If in pending tab, remove from view
            if (activeTab === 'pending') {
                setDeposits((prev) => prev.filter((d) => d.id !== dep.id))
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Approval Failed">
                    Could not approve deposit.
                </Notification>
            )
        }
    }

    // Reject Deposit
    const handleReject = async (dep: Deposit) => {
        try {
            const updated = await apiRejectDeposit(dep.id)
            setDeposits((prev) => prev.map((d) => (d.id === dep.id ? updated : d)))
            toast.push(
                <Notification type="warning" title="Deposit Rejected">
                    Deposit #{dep.deposit_id} of ₹{dep.amount.toLocaleString()} marked Rejected.
                </Notification>
            )
            if (activeTab === 'pending') {
                setDeposits((prev) => prev.filter((d) => d.id !== dep.id))
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Rejection Failed">
                    Could not reject deposit.
                </Notification>
            )
        }
    }

    // Submit UTR Entry Form (Screenshot 3)
    const handleUtrEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUtrNumber.trim() || !newUtrAmount.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    UTR Number and Amount are required
                </Notification>
            )
            return
        }

        setIsSubmittingUtr(true)
        try {
            await apiCreateUTR({
                utr_number: newUtrNumber.trim(),
                account_name: newUtrAccount || 'Standard Bank Gateway',
                amount: parseFloat(newUtrAmount) || 0,
            })

            toast.push(
                <Notification type="success" title="UTR Logged">
                    UTR Entry #{newUtrNumber.trim()} added to pending queue!
                </Notification>
            )

            setNewUtrNumber('')
            setNewUtrAmount('')
            setActiveTab('utr-pending')
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Error">
                    {err?.response?.data?.detail || 'Failed to add UTR'}
                </Notification>
            )
        } finally {
            setIsSubmittingUtr(false)
        }
    }

    // Delete / Remove Pending UTR (Screenshot 4 Trash icon)
    const handleRemoveUtr = async (utrId: number) => {
        try {
            await apiRemoveUTR(utrId)
            setUtrs((prev) => prev.filter((u) => u.id !== utrId))
            toast.push(
                <Notification type="success" title="UTR Removed">
                    Entry moved to Removed UTR list.
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to remove UTR
                </Notification>
            )
        }
    }

    return (
        <div className="space-y-4 w-full">
            {/* Top Modern Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Deposits & UTR' },
                            {
                                title:
                                    activeTab === 'history'
                                        ? 'Deposit History'
                                        : activeTab === 'utr-entry'
                                        ? 'UTR Entry'
                                        : activeTab === 'utr-pending'
                                        ? 'UTR Pending'
                                        : activeTab === 'utr-removed'
                                        ? 'Removed UTRs'
                                        : 'Pending Deposits',
                            },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Deposit & UTR Operations
                        </Title>
                        <Tag color="cyan">Ledger</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Real-time bank deposits, client transaction verification, and automated UTR reconciliations
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            if (activeTab === 'pending' || activeTab === 'history') {
                                fetchDepositsList(activeTab === 'pending' ? 'Pending' : undefined)
                            } else {
                                fetchUtrsList(activeTab === 'utr-pending' ? 'PENDING' : 'REMOVED')
                            }
                        }}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* Ant Design Sub-Navigation Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as TabType)}
                items={[
                    {
                        key: 'pending',
                        label: `Pending Deposits (${deposits.filter((d) => d.status === 'Pending').length})`,
                    },
                    {
                        key: 'history',
                        label: 'Deposit History',
                    },
                    {
                        key: 'utr-entry',
                        label: 'UTR Entry',
                    },
                    {
                        key: 'utr-pending',
                        label: 'UTR Pending List',
                    },
                    {
                        key: 'utr-removed',
                        label: 'Removed UTR List',
                    },
                ]}
            />

            <div>
                {/* -------------------- TAB 1: PENDING DEPOSITS & QUICK UTR (SCREENSHOT 1) -------------------- */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {/* Quick UTR Box */}
                        <Card
                            size="small"
                            className="border-line"
                            title={<span className="text-xs font-semibold uppercase tracking-wider text-primary">Instant UTR Verification Entry</span>}
                        >
                            <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        UTR Number:
                                    </label>
                                    <Input
                                        placeholder="Enter UTR number"
                                        value={quickUtr}
                                        onChange={(e) => setQuickUtr(e.target.value)}
                                        className="font-mono font-semibold"
                                    />
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        Account:
                                    </label>
                                    <Select
                                        value={quickAccount || undefined}
                                        onChange={setQuickAccount}
                                        className="w-full"
                                        placeholder="Select account"
                                        options={accounts.map((a) => ({
                                            value: `${a.name} : ${a.account_number}`,
                                            label: `${a.name} (${a.type} - ${a.account_number})`,
                                        }))}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        Amount:
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="₹ Amount"
                                        value={quickAmount}
                                        onChange={(e) => setQuickAmount(e.target.value)}
                                        prefix="₹"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmittingQuick}
                                        block
                                    >
                                        SUBMIT
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Search Filter Bar */}
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    fetchDepositsList(pendingStatusFilter !== 'All' ? pendingStatusFilter : undefined)
                                }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
                            >
                                <div>
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        UTR Number:
                                    </label>
                                    <Input
                                        placeholder="Filter by UTR"
                                        value={pendingUtrFilter}
                                        onChange={(e) => setPendingUtrFilter(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        Username:
                                    </label>
                                    <Input
                                        placeholder="Filter by username"
                                        value={pendingUserFilter}
                                        onChange={(e) => setPendingUserFilter(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        Account:
                                    </label>
                                    <Select
                                        value={pendingAccountFilter || undefined}
                                        onChange={(val) => setPendingAccountFilter(val || '')}
                                        className="w-full"
                                        placeholder="All Accounts"
                                        allowClear
                                        options={[
                                            { value: '', label: 'All Accounts' },
                                            ...accounts.map((a) => ({ value: a.name, label: a.name })),
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        Status:
                                    </label>
                                    <Select
                                        value={pendingStatusFilter}
                                        onChange={setPendingStatusFilter}
                                        className="w-full"
                                        options={[
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'Rejected', label: 'Rejected' },
                                            { value: 'All', label: 'All' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        Type:
                                    </label>
                                    <Select
                                        value={pendingTypeFilter}
                                        onChange={setPendingTypeFilter}
                                        className="w-full"
                                        options={[
                                            { value: 'Client', label: 'Client' },
                                            { value: 'Manual', label: 'Manual' },
                                            { value: 'All', label: 'All' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        icon={<SearchOutlined />}
                                    >
                                        REFRESH
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Pending Table */}
                        <Card
                            size="small"
                            className="border-line"
                            styles={{ body: { padding: 0 } }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-surface-2 border-b border-line text-[11px] font-semibold text-ink-2 uppercase tracking-wider">
                                            <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                            <th className="py-2.5 px-3">ID</th>
                                            <th className="py-2.5 px-3">SITE</th>
                                            <th className="py-2.5 px-3">USERNAME</th>
                                            <th className="py-2.5 px-3">ACCOUNT</th>
                                            <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                            <th className="py-2.5 px-3">UTR NUMBER</th>
                                            <th className="py-2.5 px-3 text-center">TYPE</th>
                                            <th className="py-2.5 px-3 text-center">STATUS</th>
                                            <th className="py-2.5 px-3 text-center">ACTION</th>
                                            <th className="py-2.5 px-3">DATE</th>
                                            <th className="py-2.5 px-3">APPROVED AT</th>
                                            <th className="py-2.5 px-3">REJECTED AT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line text-xs">
                                        {loadingDeposits ? (
                                            <tr>
                                                <td colSpan={13} className="py-10 text-center text-ink-3 font-medium">
                                                    Loading pending deposits...
                                                </td>
                                            </tr>
                                        ) : deposits.length === 0 ? (
                                            <tr>
                                                <td colSpan={13} className="py-10 text-center text-ink-3 font-medium">
                                                    No Pending Deposits Available
                                                </td>
                                            </tr>
                                        ) : (
                                            deposits.map((dep, index) => (
                                                <tr key={dep.id || index} className="hover:bg-surface-hover transition-colors">
                                                    <td className="py-2 px-3 text-center text-ink-3 font-medium">{index + 1}</td>
                                                    <td className="py-2 px-3 font-mono font-medium text-ink-2">{dep.deposit_id}</td>
                                                    <td className="py-2 px-3 font-medium text-primary">{dep.site}</td>
                                                    <td className="py-2 px-3 font-semibold text-ink">{dep.username}</td>
                                                    <td className="py-2 px-3 text-ink-2">{dep.account_name || 'BharatPe UPI'}</td>
                                                    <td className="py-2 px-3 text-right font-bold text-success">₹{dep.amount.toLocaleString()}</td>
                                                    <td className="py-2 px-3 font-mono text-ink">{dep.utr_number}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Tag className="m-0 text-[10px]">{dep.type}</Tag>
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Tag color="gold" className="m-0 text-[10px] uppercase font-semibold">
                                                            {dep.status}
                                                        </Tag>
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Space size={4}>
                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                icon={<CheckOutlined />}
                                                                onClick={() => handleApprove(dep)}
                                                                className="bg-success h-6 px-1.5"
                                                                title="Approve & Credit Client"
                                                            />
                                                            <Button
                                                                size="small"
                                                                danger
                                                                icon={<CloseOutlined />}
                                                                onClick={() => handleReject(dep)}
                                                                className="h-6 px-1.5"
                                                                title="Reject Deposit"
                                                            />
                                                            <Button
                                                                size="small"
                                                                icon={<EyeOutlined />}
                                                                onClick={() => setSelectedProofDeposit(dep)}
                                                                className="h-6 px-1.5"
                                                                title="View Proof"
                                                            />
                                                        </Space>
                                                    </td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{dep.date_str || '—'}</td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{dep.approved_at_str || '—'}</td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{dep.rejected_at_str || '—'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* -------------------- TAB 2: DEPOSIT HISTORY (SCREENSHOT 2) -------------------- */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {/* Search Filters Card */}
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    fetchDepositsList(histStatusFilter || undefined)
                                }}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            Domain:
                                        </label>
                                        <Select
                                            value={histDomainFilter || undefined}
                                            onChange={(val) => setHistDomainFilter(val || '')}
                                            className="w-full"
                                            placeholder="All Domains"
                                            allowClear
                                            options={[
                                                { value: '', label: 'All Domains' },
                                                { value: 'Mastan99', label: 'Mastan99' },
                                                { value: 'Mastan365', label: 'Mastan365' },
                                                { value: 'Mastanredd', label: 'Mastanredd' },
                                                { value: 'Mastan247', label: 'Mastan247' },
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            Status:
                                        </label>
                                        <Select
                                            value={histStatusFilter || undefined}
                                            onChange={(val) => setHistStatusFilter(val || '')}
                                            className="w-full"
                                            placeholder="All Statuses"
                                            allowClear
                                            options={[
                                                { value: '', label: 'All Statuses' },
                                                { value: 'Approved', label: 'Approved' },
                                                { value: 'Rejected', label: 'Rejected' },
                                                { value: 'Pending', label: 'Pending' },
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            Type:
                                        </label>
                                        <Select
                                            value={histTypeFilter || undefined}
                                            onChange={(val) => setHistTypeFilter(val || '')}
                                            className="w-full"
                                            placeholder="All Types"
                                            allowClear
                                            options={[
                                                { value: '', label: 'All Types' },
                                                { value: 'Client', label: 'Client' },
                                                { value: 'Manual', label: 'Manual' },
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            Username:
                                        </label>
                                        <Input
                                            placeholder="Enter username"
                                            value={histUserFilter}
                                            onChange={(e) => setHistUserFilter(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            UTR Number:
                                        </label>
                                        <Input
                                            placeholder="Enter UTR number"
                                            value={histUtrFilter}
                                            onChange={(e) => setHistUtrFilter(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            Start Date:
                                        </label>
                                        <Input
                                            type="date"
                                            value={histStartDate}
                                            onChange={(e) => setHistStartDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                            End Date:
                                        </label>
                                        <Input
                                            type="date"
                                            value={histEndDate}
                                            onChange={(e) => setHistEndDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            icon={<SearchOutlined />}
                                        >
                                            SEARCH
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Card>

                        {/* Deposit History Table */}
                        <Card
                            size="small"
                            className="border-line"
                            styles={{ body: { padding: 0 } }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-surface-2 border-b border-line text-[11px] font-semibold text-ink-2 uppercase tracking-wider">
                                            <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                            <th className="py-2.5 px-3">ID</th>
                                            <th className="py-2.5 px-3">SITE</th>
                                            <th className="py-2.5 px-3">USERNAME</th>
                                            <th className="py-2.5 px-3">MASTER</th>
                                            <th className="py-2.5 px-3">ADDED BY</th>
                                            <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                            <th className="py-2.5 px-3 text-center">TYPE</th>
                                            <th className="py-2.5 px-3">UTR NUMBER</th>
                                            <th className="py-2.5 px-3 text-center">STATUS</th>
                                            <th className="py-2.5 px-3 text-center">ACTION</th>
                                            <th className="py-2.5 px-3">DATE</th>
                                            <th className="py-2.5 px-3">APPROVED AT</th>
                                            <th className="py-2.5 px-3">REJECTED AT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line text-xs">
                                        {loadingDeposits ? (
                                            <tr>
                                                <td colSpan={14} className="py-12 text-center text-ink-3 font-medium">
                                                    Loading deposit records...
                                                </td>
                                            </tr>
                                        ) : deposits.length === 0 ? (
                                            <tr>
                                                <td colSpan={14} className="py-12 text-center text-ink-3 font-medium">
                                                    No Data Available In Table
                                                </td>
                                            </tr>
                                        ) : (
                                            deposits.map((dep, index) => (
                                                <tr key={dep.id || index} className="hover:bg-surface-hover transition-colors">
                                                    <td className="py-2 px-3 text-center text-ink-3 font-medium">{index + 1}</td>
                                                    <td className="py-2 px-3 font-mono text-ink-2 font-medium">{dep.deposit_id}</td>
                                                    <td className="py-2 px-3 font-medium text-ink">{dep.site}</td>
                                                    <td className="py-2 px-3 font-semibold text-ink">{dep.username}</td>
                                                    <td className="py-2 px-3 text-ink-2">{dep.master}</td>
                                                    <td className="py-2 px-3 text-ink-2">{dep.added_by}</td>
                                                    <td className="py-2 px-3 text-right font-bold text-ink">
                                                        ₹{dep.amount.toLocaleString()}
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Tag className="m-0 text-[10px]">{dep.type}</Tag>
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-ink">{dep.utr_number}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Tag
                                                            color={dep.status === 'Approved' ? 'green' : 'red'}
                                                            className="m-0 text-[10px] uppercase font-semibold"
                                                        >
                                                            {dep.status}
                                                        </Tag>
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Button
                                                            size="small"
                                                            icon={<EyeOutlined />}
                                                            onClick={() => setSelectedProofDeposit(dep)}
                                                            className="h-6 px-2 text-xs"
                                                        >
                                                            Proof
                                                        </Button>
                                                    </td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{dep.date_str || '—'}</td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{dep.approved_at_str || '-'}</td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{dep.rejected_at_str || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* -------------------- TAB 3: UTR ENTRY FORM (SCREENSHOT 3) -------------------- */}
                {activeTab === 'utr-entry' && (
                    <div className="max-w-xl mx-auto">
                        <Card
                            size="small"
                            className="border-line"
                            title={
                                <div>
                                    <span className="text-sm font-semibold block">UTR Verification Entry</span>
                                    <Text type="secondary" className="text-xs font-normal">
                                        Pre-register banking payment receipts for instant matching
                                    </Text>
                                </div>
                            }
                        >
                            <form onSubmit={handleUtrEntrySubmit} className="space-y-4 py-2">
                                <div>
                                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1.5">
                                        UTR Number: *
                                    </label>
                                    <Input
                                        required
                                        placeholder="Enter UTR Number"
                                        value={newUtrNumber}
                                        onChange={(e) => setNewUtrNumber(e.target.value)}
                                        className="font-mono font-semibold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1.5">
                                            Account: *
                                        </label>
                                        <Select
                                            value={newUtrAccount || undefined}
                                            onChange={setNewUtrAccount}
                                            className="w-full"
                                            options={accounts.map((a) => ({
                                                value: `${a.name} : ${a.account_number}`,
                                                label: `${a.name} : ${a.account_number}`,
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1.5">
                                            Amount (₹): *
                                        </label>
                                        <Input
                                            type="number"
                                            required
                                            min="1"
                                            placeholder="Enter Amount"
                                            value={newUtrAmount}
                                            onChange={(e) => setNewUtrAmount(e.target.value)}
                                            prefix="₹"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmittingUtr}
                                        block
                                    >
                                        Add UTR Entry
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {/* -------------------- TAB 4: UTR PENDING LIST (SCREENSHOT 4) -------------------- */}
                {activeTab === 'utr-pending' && (
                    <Card
                        size="small"
                        className="border-line"
                        title={<span className="text-xs font-semibold uppercase tracking-wider">UTR Pending List</span>}
                        extra={
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => setActiveTab('utr-entry')}
                            >
                                Add UTR
                            </Button>
                        }
                        styles={{ body: { padding: 0 } }}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-surface-2 border-b border-line text-[11px] font-semibold text-ink-2 uppercase tracking-wider">
                                        <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                        <th className="py-2.5 px-3">ID</th>
                                        <th className="py-2.5 px-3">MASTER</th>
                                        <th className="py-2.5 px-3">ADDED BY</th>
                                        <th className="py-2.5 px-3">ACCOUNT</th>
                                        <th className="py-2.5 px-3">UTR NUMBER</th>
                                        <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                        <th className="py-2.5 px-3 text-center">STATUS</th>
                                        <th className="py-2.5 px-3">DATE</th>
                                        <th className="py-2.5 px-3 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line text-xs">
                                    {loadingUtrs ? (
                                        <tr>
                                            <td colSpan={10} className="py-10 text-center text-ink-3 font-medium">
                                                Loading pending UTRs...
                                            </td>
                                        </tr>
                                    ) : utrs.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="py-10 text-center text-ink-3 font-medium">
                                                No Pending UTRs Found
                                            </td>
                                        </tr>
                                    ) : (
                                        utrs.map((utr, index) => (
                                            <tr key={utr.id || index} className="hover:bg-surface-hover transition-colors">
                                                <td className="py-2 px-3 text-center text-ink-3 font-medium">{index + 1}</td>
                                                <td className="py-2 px-3 font-mono font-medium text-ink-2">{utr.utr_id}</td>
                                                <td className="py-2 px-3 font-medium text-ink">{utr.master}</td>
                                                <td className="py-2 px-3 text-ink-2">{utr.added_by}</td>
                                                <td className="py-2 px-3 font-medium text-ink">{utr.account_name}</td>
                                                <td className="py-2 px-3 font-mono text-ink font-semibold">{utr.utr_number}</td>
                                                <td className="py-2 px-3 text-right font-bold text-ink">₹{utr.amount.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <Tag color="gold" className="m-0 text-[10px] uppercase font-semibold">
                                                        {utr.status}
                                                    </Tag>
                                                </td>
                                                <td className="py-2 px-3 text-ink-3 text-[11px] whitespace-nowrap">{utr.date_str || '—'}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <Button
                                                        size="small"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => handleRemoveUtr(utr.id)}
                                                        className="h-6 px-1.5"
                                                        title="Remove UTR from Pending"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* -------------------- TAB 5: REMOVED UTR LIST (SCREENSHOT 5) -------------------- */}
                {activeTab === 'utr-removed' && (
                    <div className="space-y-4">
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    fetchUtrsList('REMOVED', removedUtrSearch)
                                }}
                                className="flex flex-col sm:flex-row items-end gap-3 max-w-lg"
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-[11px] font-bold text-ink-2 uppercase tracking-wider mb-1">
                                        UTR Number:
                                    </label>
                                    <Input
                                        placeholder="Enter UTR Number"
                                        value={removedUtrSearch}
                                        onChange={(e) => setRemovedUtrSearch(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                >
                                    SEARCH
                                </Button>
                            </form>
                        </Card>

                        <Card
                            size="small"
                            className="border-line"
                            styles={{ body: { padding: 0 } }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-surface-2 border-b border-line text-[11px] font-semibold text-ink-2 uppercase tracking-wider">
                                            <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                            <th className="py-2.5 px-3">ID</th>
                                            <th className="py-2.5 px-3">REMOVED BY</th>
                                            <th className="py-2.5 px-3">MASTER</th>
                                            <th className="py-2.5 px-3">UTR NUMBER</th>
                                            <th className="py-2.5 px-3 text-right">AMOUNT</th>
                                            <th className="py-2.5 px-3">DATE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line text-xs">
                                        {utrs.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-10 text-center text-ink-3 font-medium">
                                                    No Removed UTR Records Found
                                                </td>
                                            </tr>
                                        ) : (
                                            utrs.map((u, index) => (
                                                <tr key={u.id || index} className="hover:bg-surface-hover transition-colors">
                                                    <td className="py-2 px-3 text-center text-ink-3 font-medium">{index + 1}</td>
                                                    <td className="py-2 px-3 font-mono font-medium">{u.utr_id}</td>
                                                    <td className="py-2 px-3 font-medium text-error">{u.removed_by || 'MASTAN99M'}</td>
                                                    <td className="py-2 px-3 text-ink-2">{u.master}</td>
                                                    <td className="py-2 px-3 font-mono text-ink">{u.utr_number}</td>
                                                    <td className="py-2 px-3 text-right font-bold text-ink">₹{u.amount.toFixed(2)}</td>
                                                    <td className="py-2 px-3 text-ink-3 text-[11px]">{u.date_str || '—'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Proof Receipt Modal */}
            <Modal
                open={!!selectedProofDeposit}
                onCancel={() => setSelectedProofDeposit(null)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setSelectedProofDeposit(null)}>
                        Close Proof
                    </Button>
                ]}
                title="Deposit Payment Proof"
                width={480}
            >
                {selectedProofDeposit && (
                    <div className="py-2 text-center">
                        {/* Transaction Receipt Box */}
                        <div className="bg-surface-2 border border-line rounded-lg p-3.5 text-left space-y-2 mb-3 text-xs">
                            <div className="flex justify-between">
                                <span className="text-ink-3">Deposit ID:</span>
                                <span className="font-mono font-bold text-ink">#{selectedProofDeposit.deposit_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Client:</span>
                                <span className="font-bold text-primary">{selectedProofDeposit.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Amount:</span>
                                <span className="font-bold text-success text-sm">₹{selectedProofDeposit.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">UTR / Ref:</span>
                                <span className="font-mono font-bold text-ink bg-surface px-2 py-0.5 rounded border border-line">{selectedProofDeposit.utr_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Status:</span>
                                <Tag color={selectedProofDeposit.status === 'Approved' ? 'green' : 'red'}>
                                    {selectedProofDeposit.status}
                                </Tag>
                            </div>
                        </div>

                        {/* Payment Slip Simulation / Display */}
                        <div className="border border-line rounded-lg p-5 bg-surface mb-3">
                            <CheckOutlined className="text-success text-3xl mb-2" />
                            <div className="font-bold text-base text-ink">UPI Transfer Successful</div>
                            <div className="text-xs text-ink-3 mt-1">Ref ID: {selectedProofDeposit.utr_number}</div>
                            <div className="text-lg font-bold text-ink mt-2">₹{selectedProofDeposit.amount.toLocaleString()}.00</div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default DepositView
