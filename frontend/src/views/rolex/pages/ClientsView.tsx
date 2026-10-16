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
    SearchOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    DollarOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiGetUsers } from '@/services/AuthService'
import { apiGetPortals } from '@/services/GlobalSearchService'
import type { User } from '@/@types/auth'
import type { DomainPortal } from '@/@types/globalSearch'

const { Title, Text } = Typography

const ClientsView = () => {
    const navigate = useNavigate()

    // Data state
    const [clients, setClients] = useState<User[]>([])
    const [portals, setPortals] = useState<DomainPortal[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter bar state
    const [selectedDomain, setSelectedDomain] = useState<string>('')
    const [usernameFilter, setUsernameFilter] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [selectedSource, setSelectedSource] = useState<string>('')
    const [depositCountFilter, setDepositCountFilter] = useState<string>('')

    // Action Modals State
    const [actionModalType, setActionModalType] = useState<'statement' | 'deposit' | 'withdraw' | null>(null)
    const [activeClient, setActiveClient] = useState<User | null>(null)

    // Load clients with current filter values
    const fetchClients = async (overrideParams?: Record<string, any>) => {
        setLoading(true)
        try {
            const params: Record<string, any> = overrideParams || {
                domain: selectedDomain || undefined,
                username: usernameFilter.trim() || undefined,
                source: selectedSource || undefined,
                deposit_count: depositCountFilter ? parseInt(depositCountFilter, 10) : undefined,
            }
            const data = await apiGetUsers(params)
            setClients(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch dynamic clients list
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    // Load initial portals for domain dropdown
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const portalData = await apiGetPortals()
                setPortals(portalData)
            } catch (e) {
                // Ignore
            }
            fetchClients()
        }
        loadInitialData()
    }, [])

    // Search filter submit
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        fetchClients()
    }

    // Reset filters
    const handleReset = () => {
        setSelectedDomain('')
        setUsernameFilter('')
        setStartDate('')
        setEndDate('')
        setSelectedSource('')
        setDepositCountFilter('')
        fetchClients({})
    }

    // Open Action Modal
    const handleOpenAction = (type: 'statement' | 'deposit' | 'withdraw', client: User) => {
        setActiveClient(client)
        setActionModalType(type)
    }

    // Compute KPI metrics for summary badges
    const totalClientsCount = clients.length
    const activeClientsCount = clients.filter((c) => c.is_active !== false).length
    const totalBalanceSum = clients.reduce((acc, c) => acc + (c.balance || 0), 0)
    const signupClientsCount = clients.filter((c) => c.source?.toLowerCase() === 'signup').length

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Clients' },
                            { title: 'Client Directory' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Client Directory
                        </Title>
                        <Tag color="purple">Directory</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Real-time exchange accounts, player master mapping, and transaction history
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/clients/create')}
                    >
                        Add Client
                    </Button>
                    <Button
                        icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                        onClick={() => fetchClients()}
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
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Clients</span>}
                            value={totalClientsCount}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Active Accounts</span>}
                            value={activeClientsCount}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                            suffix={<span className="text-xs font-normal text-ink-3">Live</span>}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Cumulative Balance</span>}
                            value={totalBalanceSum}
                            prefix="₹"
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Direct Signups</span>}
                            value={signupClientsCount}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--tag-purple)' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Card */}
            <Card size="small" className="border border-line">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Domain
                        </label>
                        <Select
                            value={selectedDomain || ''}
                            onChange={(val) => setSelectedDomain(val)}
                            className="w-full"
                            options={[
                                { label: 'All Domains', value: '' },
                                ...portals.map((p) => ({
                                    label: p.domain_title,
                                    value: p.domain_title,
                                })),
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Username
                        </label>
                        <Input
                            placeholder="Username"
                            value={usernameFilter}
                            onChange={(e) => setUsernameFilter(e.target.value)}
                            allowClear
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2 py-1 bg-surface border border-line-strong rounded text-xs"
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
                            className="w-full px-2 py-1 bg-surface border border-line-strong rounded text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Source
                        </label>
                        <Select
                            value={selectedSource || ''}
                            onChange={(val) => setSelectedSource(val)}
                            className="w-full"
                            options={[
                                { label: 'All Sources', value: '' },
                                { label: 'Signup', value: 'Signup' },
                                { label: 'Admin', value: 'Admin' },
                                { label: 'Referral', value: 'Referral' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Deposit Count
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g. 5"
                            value={depositCountFilter}
                            onChange={(e) => setDepositCountFilter(e.target.value)}
                            allowClear
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => handleSearch()}
                            className="flex-1"
                            loading={loading}
                        >
                            Filter
                        </Button>
                        <Button onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Clients Table Card */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                <th className="py-2.5 px-3">DOMAIN / SITE</th>
                                <th className="py-2.5 px-3">MASTER</th>
                                <th className="py-2.5 px-3">CLIENT ID</th>
                                <th className="py-2.5 px-3">USERNAME</th>
                                <th className="py-2.5 px-3 text-right">BALANCE</th>
                                <th className="py-2.5 px-3 text-center">DEPOSITS</th>
                                <th className="py-2.5 px-3 text-center">SOURCE</th>
                                <th className="py-2.5 px-3 text-center">STATUS</th>
                                <th className="py-2.5 px-3">CREATED AT</th>
                                <th className="py-2.5 px-3 text-center min-w-[280px]">QUICK ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="py-10 text-center text-ink-3 font-medium">
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-10 text-center text-ink-3 font-medium">
                                        No Data Available In Table
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client, index) => (
                                    <tr
                                        key={client.id || index}
                                        className="hover:bg-surface-hover transition-colors"
                                    >
                                        <td className="py-2.5 px-3 text-center text-ink-3 font-semibold text-[11px]">
                                            {index + 1}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <Tag color="cyan">{client.site || client.master || 'Mastan365'}</Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 font-mono text-[11px]">
                                            {client.master || 'mastan365.com'}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono font-medium text-ink-2">
                                            #{client.client_id || 2619000 + (client.id as number)}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-ink">
                                            {client.username}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-ink">
                                            ₹{(client.balance || 0).toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <span className="font-semibold text-primary">
                                                {client.deposit_count || 0}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag color={client.source === 'Signup' ? 'blue' : 'default'}>
                                                {client.source || 'Admin'}
                                            </Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag color={client.is_active !== false ? 'success' : 'error'}>
                                                {client.is_active !== false ? 'Active' : 'Disabled'}
                                            </Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 text-[11px] whitespace-nowrap">
                                            {client.created_on || client.created_at || '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Space size="small">
                                                <Button
                                                    size="small"
                                                    danger
                                                    icon={<FileTextOutlined />}
                                                    onClick={() => handleOpenAction('statement', client)}
                                                >
                                                    Statement
                                                </Button>
                                                <Button
                                                    size="small"
                                                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                                    icon={<CreditCardOutlined />}
                                                    onClick={() => handleOpenAction('deposit', client)}
                                                >
                                                    Deposit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                                                    icon={<DollarOutlined />}
                                                    onClick={() => handleOpenAction('withdraw', client)}
                                                >
                                                    Withdraw
                                                </Button>
                                            </Space>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2.5 bg-surface-2 border-t border-line flex items-center justify-between text-xs text-ink-3">
                    <span>Showing <strong>1</strong> to <strong>{clients.length}</strong> entries</span>
                    <span className="font-medium text-ink-3">Rolex Exchange Live Database</span>
                </div>
            </Card>

            {/* Quick Action Modal */}
            <Modal
                title={`Client Action: ${actionModalType?.toUpperCase() || ''}`}
                open={!!actionModalType}
                onCancel={() => setActionModalType(null)}
                footer={[
                    <Button key="close" onClick={() => setActionModalType(null)}>
                        Close
                    </Button>,
                    <Button
                        key="navigate"
                        type="primary"
                        onClick={() => {
                            if (!activeClient) return
                            const targetRoute =
                                actionModalType === 'statement'
                                    ? `/statement?user=${activeClient.username}`
                                    : actionModalType === 'deposit'
                                    ? `/deposits/history?user=${activeClient.username}`
                                    : `/withdrawals/history?user=${activeClient.username}`
                            setActionModalType(null)
                            navigate(targetRoute)
                        }}
                    >
                        Open Full {actionModalType?.toUpperCase()} Page →
                    </Button>,
                ]}
            >
                {activeClient && actionModalType && (
                    <div className="space-y-3 pt-2 text-xs">
                        <div className="bg-surface-2 p-3 rounded border border-line space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-ink-3">Username:</span>
                                <span className="font-bold text-ink text-sm">{activeClient.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-ink-3">Portal:</span>
                                <Tag color="cyan">{activeClient.site || activeClient.master}</Tag>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-ink-3">Current Balance:</span>
                                <span className="font-bold text-success">
                                    ₹{(activeClient.balance || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-ink-3">Deposit Count:</span>
                                <span className="font-semibold text-ink">{activeClient.deposit_count || 0}</span>
                            </div>
                        </div>

                        <div className="p-3 bg-primary-subtle border border-primary-subtle rounded text-primary">
                            {actionModalType === 'statement' && (
                                <p>Viewing live statement ledger records for client <strong>{activeClient.username}</strong>.</p>
                            )}
                            {actionModalType === 'deposit' && (
                                <p>Client has completed <strong>{activeClient.deposit_count || 0}</strong> deposits. You can check UTR receipts and approved amounts.</p>
                            )}
                            {actionModalType === 'withdraw' && (
                                <p>Viewing withdrawal payout history and settlement status for client <strong>{activeClient.username}</strong>.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default ClientsView
