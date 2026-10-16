import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Card,
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
    QrcodeOutlined,
    CopyOutlined,
    CheckOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetAccounts,
    apiUpdateAccount,
} from '@/services/BankAccountsService'
import type { BankAccount } from '@/@types/account'
import { MdAccountBalance, MdQrCode2 } from 'react-icons/md'

const { Title, Text } = Typography

const AccountsView = () => {
    const navigate = useNavigate()

    // Data state
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter bar state
    const [userFilter, setUserFilter] = useState<string>('')
    const [nameFilter, setNameFilter] = useState<string>('')
    const [accountNumberFilter, setAccountNumberFilter] = useState<string>('')
    const [amountRangeFilter, setAmountRangeFilter] = useState<string>('Both')
    const [statusFilter, setStatusFilter] = useState<string>('All')

    // QR Modal State
    const [qrAccount, setQrAccount] = useState<BankAccount | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Load accounts
    const fetchAccounts = async (customParams?: Record<string, any>) => {
        setLoading(true)
        try {
            const params: Record<string, any> = customParams || {
                user: userFilter || undefined,
                name: nameFilter.trim() || undefined,
                account_number: accountNumberFilter.trim() || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            }
            const data = await apiGetAccounts(params)
            setAccounts(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch accounts list
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    // Search submit
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        fetchAccounts()
    }

    // Toggle status (Active / Inactive)
    const handleToggleStatus = async (account: BankAccount) => {
        const newStatus = account.status === 'Active' ? 'Inactive' : 'Active'
        try {
            const updated = await apiUpdateAccount(account.id, {
                status: newStatus,
                is_active: newStatus === 'Active',
            })
            setAccounts((prev) =>
                prev.map((a) => (a.id === account.id ? updated : a))
            )
            toast.push(
                <Notification type="success" title="Status Updated">
                    Account <strong>{account.name}</strong> is now{' '}
                    <strong>{newStatus.toUpperCase()}</strong>!
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Update Failed">
                    Could not update account status.
                </Notification>
            )
        }
    }

    // Copy to clipboard
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.push(
            <Notification type="success" title="Copied" duration={2000}>
                Copied to clipboard: {text}
            </Notification>
        )
        setTimeout(() => setCopiedId(null), 2000)
    }

    // KPI Counters
    const totalAccounts = accounts.length
    const activeAccounts = accounts.filter((a) => a.status === 'Active').length
    const inactiveAccounts = accounts.filter((a) => a.status !== 'Active').length
    const upiAccountsCount = accounts.filter((a) => a.type === 'UPI').length

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Accounts' },
                            { title: 'Payment Gateways' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Bank & Payment Accounts
                        </Title>
                        <Tag color="blue">Gateways</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Corporate bank accounts, UPI VPA channels, and deposit collection gateways
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/accounts/create')}
                    >
                        Add Account
                    </Button>
                    <Button
                        icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                        onClick={() => fetchAccounts()}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* KPI Summary Strip */}
            <Row gutter={[12, 12]}>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Gateways</span>}
                            value={totalAccounts}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Active Channels</span>}
                            value={activeAccounts}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">Live</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Inactive Reserve</span>}
                            value={inactiveAccounts}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--error)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">UPI VPAs</span>}
                            value={upiAccountsCount}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">Channels</span>}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Card */}
            <Card size="small" className="border border-line">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            User
                        </label>
                        <Select
                            value={userFilter || ''}
                            onChange={(val) => setUserFilter(val)}
                            className="w-full"
                            options={[
                                { label: 'All Users', value: '' },
                                { label: 'MASTAN99M', value: 'MASTAN99M' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            A/C Name
                        </label>
                        <Input
                            placeholder="Enter name"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            allowClear
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            A/C Number
                        </label>
                        <Input
                            placeholder="Enter number"
                            value={accountNumberFilter}
                            onChange={(e) => setAccountNumberFilter(e.target.value)}
                            allowClear
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Amount Range
                        </label>
                        <Select
                            value={amountRangeFilter}
                            onChange={(val) => setAmountRangeFilter(val)}
                            className="w-full"
                            options={[
                                { label: 'Both', value: 'Both' },
                                { label: 'Up to 10,000', value: '10000' },
                                { label: 'Up to 20,000', value: '20000' },
                                { label: 'Up to 40,000', value: '40000' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Status
                        </label>
                        <Select
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            className="w-full"
                            options={[
                                { label: 'All', value: 'All' },
                                { label: 'Active', value: 'Active' },
                                { label: 'Inactive', value: 'Inactive' },
                            ]}
                        />
                    </div>

                    <div>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => handleSearch()}
                            className="w-full"
                            loading={loading}
                        >
                            SEARCH
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Accounts Table Card */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                <th className="py-2.5 px-3">USER</th>
                                <th className="py-2.5 px-3">NAME</th>
                                <th className="py-2.5 px-3 text-center">TYPE</th>
                                <th className="py-2.5 px-3">CATEGORY</th>
                                <th className="py-2.5 px-3">A/C NO</th>
                                <th className="py-2.5 px-3">IFSC CODE</th>
                                <th className="py-2.5 px-3">BANK NAME</th>
                                <th className="py-2.5 px-3 text-right">MIN AMOUNT</th>
                                <th className="py-2.5 px-3 text-right">MAX AMOUNT</th>
                                <th className="py-2.5 px-3 text-center">MAX DEPOSIT</th>
                                <th className="py-2.5 px-3 text-center">FOR</th>
                                <th className="py-2.5 px-3 text-center">STATUS</th>
                                <th className="py-2.5 px-3">LAST UPDATE</th>
                                <th className="py-2.5 px-3 text-center">QR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {loading ? (
                                <tr>
                                    <td colSpan={15} className="py-10 text-center text-ink-3 font-medium">
                                        Loading accounts...
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={15} className="py-10 text-center text-ink-3 font-medium">
                                        No Data Available In Table
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((acc, index) => (
                                    <tr
                                        key={acc.id || index}
                                        className="hover:bg-surface-hover transition-colors"
                                    >
                                        <td className="py-2.5 px-3 text-center text-ink-3 font-semibold text-[11px]">
                                            {index + 1}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-ink-2">
                                            {acc.user || 'MASTAN99M'}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-ink whitespace-nowrap">
                                            {acc.name}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag color="geekblue">{acc.type || 'UPI'}</Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 text-[11px] whitespace-nowrap">
                                            {acc.category || 'No Category'}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[11px] text-primary font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>{acc.account_number}</span>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={
                                                        copiedId === `ac-${acc.id}` ? (
                                                            <CheckOutlined className="text-success" />
                                                        ) : (
                                                            <CopyOutlined className="text-xs" />
                                                        )
                                                    }
                                                    onClick={() => handleCopy(acc.account_number, `ac-${acc.id}`)}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 font-mono text-[11px]">
                                            {acc.ifsc_code || '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-2 font-medium text-[11px]">
                                            {acc.bank_name || '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-medium text-ink-2">
                                            {acc.min_amount?.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-ink">
                                            {acc.max_amount?.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-ink-2 text-[11px]">
                                            {acc.max_deposit || 'Both'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag color="cyan">{acc.account_for || 'Deposit'}</Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Button
                                                size="small"
                                                type={acc.status === 'Active' ? 'primary' : 'default'}
                                                danger={acc.status !== 'Active'}
                                                style={acc.status === 'Active' ? { backgroundColor: 'var(--success)', borderColor: 'var(--success)' } : undefined}
                                                onClick={() => handleToggleStatus(acc)}
                                            >
                                                {acc.status}
                                            </Button>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 text-[11px] whitespace-nowrap">
                                            {acc.last_update_str || acc.last_update || '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Button
                                                size="small"
                                                icon={<QrcodeOutlined />}
                                                onClick={() => setQrAccount(acc)}
                                            >
                                                QR
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2.5 bg-surface-2 border-t border-line flex items-center justify-between text-xs text-ink-3">
                    <span>Showing <strong>1</strong> to <strong>{accounts.length}</strong> entries</span>
                    <span className="font-medium text-ink-3">Rolex Payment Gateway Management</span>
                </div>
            </Card>

            {/* QR Code Modal Dialog */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <MdQrCode2 className="text-primary text-lg" />
                        <span>UPI Payment QR Code</span>
                    </div>
                }
                open={!!qrAccount}
                onCancel={() => setQrAccount(null)}
                footer={[
                    <Button key="close" onClick={() => setQrAccount(null)}>
                        Close
                    </Button>,
                    <Button
                        key="copy"
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={() => qrAccount && handleCopy(qrAccount.account_number, 'modal-upi')}
                    >
                        Copy UPI ID
                    </Button>,
                ]}
                width={400}
            >
                {qrAccount && (
                    <div className="py-3 text-center space-y-3">
                        <div className="bg-surface p-3 border border-line rounded-lg inline-block mx-auto">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(
                                    qrAccount.account_number
                                )}&pn=${encodeURIComponent(qrAccount.name)}&cu=INR`}
                                alt="UPI QR Code"
                                className="w-44 h-44 mx-auto"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-ink-3 uppercase font-semibold">Beneficiary Name</div>
                            <div className="font-bold text-ink">{qrAccount.name}</div>
                            <div className="font-mono text-xs font-semibold text-primary bg-primary-subtle px-2 py-0.5 rounded inline-block border border-primary-subtle mt-1">
                                {qrAccount.account_number}
                            </div>
                            <div className="text-[11px] text-ink-3 pt-1">
                                Min: ₹{qrAccount.min_amount} | Max: ₹{qrAccount.max_amount}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default AccountsView
