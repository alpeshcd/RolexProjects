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
    Radio,
} from 'antd'
import {
    ReloadOutlined,
    PlusOutlined,
    SearchOutlined,
    DollarOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetPortals,
    apiRefreshPortal,
    apiSearchClients,
    apiCreatePortalClient,
} from '@/services/GlobalSearchService'
import { apiUpdateUserBalance } from '@/services/AuthService'
import type { DomainPortal, GlobalSearchClient } from '@/@types/globalSearch'

const { Title, Text } = Typography

const GlobalSearchView = () => {
    const navigate = useNavigate()
    // Portals state
    const [portals, setPortals] = useState<DomainPortal[]>([])
    const [loadingPortals, setLoadingPortals] = useState<boolean>(true)
    const [refreshingId, setRefreshingId] = useState<number | null>(null)

    // Search filter state
    const [selectedDomain, setSelectedDomain] = useState<string>('')
    const [usernameInput, setUsernameInput] = useState<string>('')
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [searchResults, setSearchResults] = useState<GlobalSearchClient[]>([])

    // Add Client Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
    const [addDomain, setAddDomain] = useState<string>('mastan247.club')
    const [addUsername, setAddUsername] = useState<string>('')
    const [addFullName, setAddFullName] = useState<string>('')
    const [addPassword, setAddPassword] = useState<string>('')
    const [addBalance, setAddBalance] = useState<string>('5000')
    const [addUpline, setAddUpline] = useState<string>('MASTAN99M')
    const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false)

    // Quick Balance Update Modal State
    const [isBalModalOpen, setIsBalModalOpen] = useState<boolean>(false)
    const [selectedClient, setSelectedClient] = useState<GlobalSearchClient | null>(null)
    const [balAmount, setBalAmount] = useState<string>('1000')
    const [balOperation, setBalOperation] = useState<'deposit' | 'withdraw'>('deposit')
    const [isSubmittingBal, setIsSubmittingBal] = useState<boolean>(false)

    // Load initial portal stats
    const fetchPortals = async () => {
        setLoadingPortals(true)
        try {
            const data = await apiGetPortals()
            setPortals(data)
        } catch (err) {
            console.error('Error fetching portals:', err)
        } finally {
            setLoadingPortals(false)
        }
    }

    useEffect(() => {
        fetchPortals()
    }, [])

    // Refresh a single portal card
    const handleRefreshPortal = async (portalId: number) => {
        setRefreshingId(portalId)
        try {
            const updated = await apiRefreshPortal(portalId)
            setPortals((prev) =>
                prev.map((p) => (p.id === portalId ? updated : p))
            )
            toast.push(
                <Notification type="success" title="Portal Refreshed">
                    Live balance and wallet stats reloaded.
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Refresh Failed">
                    Could not refresh portal data.
                </Notification>
            )
        } finally {
            setRefreshingId(null)
        }
    }

    // Execute Global Search
    const handleSearch = async (e?: React.FormEvent, customDomain?: string) => {
        if (e) e.preventDefault()
        const domainToUse = customDomain !== undefined ? customDomain : selectedDomain
        
        setIsSearching(true)
        setHasSearched(true)
        try {
            const results = await apiSearchClients({
                // 'all' tells the backend this is a real search across every domain
                domain: domainToUse || 'all',
                username: usernameInput.trim() || undefined,
            })
            setSearchResults(results)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Search Error">
                    Failed to query client database.
                </Notification>
            )
        } finally {
            setIsSearching(false)
        }
    }

    // Trigger Search from a specific domain card
    const handleCardSearchClick = (portal: DomainPortal) => {
        setSelectedDomain(portal.domain_url)
        handleSearch(undefined, portal.domain_url)
    }

    // Open Add Client modal with prefilled domain
    const handleOpenAddClient = (portal?: DomainPortal) => {
        if (portal) {
            setAddDomain(portal.domain_url)
        } else if (selectedDomain) {
            setAddDomain(selectedDomain)
        } else {
            setAddDomain('mastan247.club')
        }
        setAddUsername('')
        setAddFullName('')
        setAddPassword('')
        setAddBalance('5000')
        setIsAddModalOpen(true)
    }

    // Submit Add Client
    const handleSubmitAddClient = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!addUsername.trim() || !addPassword.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Username and Password are required.
                </Notification>
            )
            return
        }

        setIsSubmittingAdd(true)
        try {
            const created = await apiCreatePortalClient({
                domain: addDomain,
                username: addUsername.trim(),
                full_name: addFullName.trim() || addUsername.trim(),
                password: addPassword.trim(),
                balance: parseFloat(addBalance) || 0,
                upline: addUpline,
                upline_share: (parseFloat(addBalance) || 0) * 0.1,
            })

            toast.push(
                <Notification type="success" title="Client Created">
                    Client <strong>{created.username}</strong> successfully added under{' '}
                    <strong>{created.domain}</strong>!
                </Notification>
            )

            setIsAddModalOpen(false)
            fetchPortals()
            if (hasSearched) {
                handleSearch()
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.detail || 'Failed to create client'
            toast.push(
                <Notification type="danger" title="Error">
                    {errMsg}
                </Notification>
            )
        } finally {
            setIsSubmittingAdd(false)
        }
    }

    // Open Quick Balance Update modal
    const handleOpenBalModal = (client: GlobalSearchClient) => {
        setSelectedClient(client)
        setBalAmount('1000')
        setBalOperation('deposit')
        setIsBalModalOpen(true)
    }

    // Submit Quick Balance Update
    const handleSubmitBalanceUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!selectedClient) return
        const amt = parseFloat(balAmount)
        if (isNaN(amt) || amt <= 0) {
            toast.push(
                <Notification type="warning" title="Invalid Amount">
                    Please enter a valid positive amount.
                </Notification>
            )
            return
        }

        setIsSubmittingBal(true)
        try {
            await apiUpdateUserBalance(selectedClient.id, {
                amount: amt,
                operation: balOperation,
            })

            toast.push(
                <Notification type="success" title="Balance Updated">
                    Successfully {balOperation === 'deposit' ? 'credited' : 'debited'} ₹{amt.toLocaleString()}{' '}
                    to {selectedClient.username}
                </Notification>
            )

            setIsBalModalOpen(false)
            fetchPortals()
            handleSearch()
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to update balance'
            toast.push(
                <Notification type="danger" title="Transaction Failed">
                    {msg}
                </Notification>
            )
        } finally {
            setIsSubmittingBal(false)
        }
    }

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Exchange Search' },
                            { title: 'Global Search' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Global Exchange Search
                        </Title>
                        <Tag color="gold">Multi-Portal</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Cross-exchange player lookup, live balance queries, and instant wallet adjustment.
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenAddClient()}
                    >
                        Add Client
                    </Button>
                    <Button
                        icon={<ReloadOutlined className={loadingPortals ? 'animate-spin' : ''} />}
                        onClick={fetchPortals}
                    >
                        Refresh Portals
                    </Button>
                </Space>
            </div>

            {/* 4 Top Domain Portal Cards Grid */}
            <Row gutter={[12, 12]}>
                {portals.map((portal) => (
                    <Col xs={24} sm={12} lg={6} key={portal.id}>
                        <Card
                            size="small"
                            className="border border-line"
                            title={
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs uppercase text-primary">
                                        {portal.domain_title}
                                    </span>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ReloadOutlined className={refreshingId === portal.id ? 'animate-spin text-primary' : ''} />}
                                        onClick={() => handleRefreshPortal(portal.id)}
                                    />
                                </div>
                            }
                        >
                            <div className="grid grid-cols-3 text-center py-2 border-b border-line mb-3">
                                <div>
                                    <span className="text-[10px] text-ink-3 font-semibold uppercase block">Balance</span>
                                    <span className="font-bold text-xs text-ink mt-0.5 block truncate">
                                        ₹{portal.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-ink-3 font-semibold uppercase block">P/L</span>
                                    <span className="font-bold text-xs text-ink mt-0.5 block truncate">
                                        ₹{portal.pl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-ink-3 font-semibold uppercase block">Wallet</span>
                                    <span className="font-bold text-xs text-ink mt-0.5 block truncate">
                                        ₹{portal.client_wallet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>

                            <Space className="w-full justify-between">
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleOpenAddClient(portal)}
                                >
                                    Add Client
                                </Button>
                                <Button
                                    size="small"
                                    icon={<SearchOutlined />}
                                    onClick={() => handleCardSearchClick(portal)}
                                >
                                    Filter
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filter / Search Form Box */}
            <Card size="small" className="border border-line">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Domain
                        </label>
                        <Select
                            value={selectedDomain}
                            onChange={(val) => setSelectedDomain(val)}
                            className="w-full"
                            options={[
                                { label: 'All Domains', value: '' },
                                ...portals.map((p) => ({
                                    label: p.domain_title,
                                    value: p.domain_url,
                                })),
                            ]}
                        />
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Username
                        </label>
                        <Input
                            placeholder="Enter username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onPressEnter={() => handleSearch()}
                            allowClear
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => handleSearch()}
                            className="w-full"
                            loading={isSearching}
                        >
                            SEARCH
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Search Results Table */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3 w-16 text-center">S.NO</th>
                                <th className="py-2.5 px-3">DOMAIN</th>
                                <th className="py-2.5 px-3">USERNAME</th>
                                <th className="py-2.5 px-3 text-right">BALANCE</th>
                                <th className="py-2.5 px-3 text-center">LAST UPDATED</th>
                                <th className="py-2.5 px-3 text-center min-w-[280px]">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {searchResults.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-ink-3 font-medium">
                                        No Data Available In Table
                                    </td>
                                </tr>
                            ) : (
                                searchResults.map((client, index) => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-surface-hover transition-colors"
                                    >
                                        <td className="py-2.5 px-3 text-center text-ink-3 font-semibold text-[11px]">
                                            {client.s_no || index + 1}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <Tag color="cyan">{client.domain_title || client.domain}</Tag>
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-ink">
                                            {client.username}
                                            {client.full_name && client.full_name !== client.username && (
                                                <span className="text-[11px] font-normal text-ink-3 block">
                                                    {client.full_name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-ink">
                                            ₹{client.balance.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-ink-3 text-[11px]">
                                            {client.last_updated || '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Space size="small" wrap>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    icon={<DollarOutlined />}
                                                    onClick={() => handleOpenBalModal(client)}
                                                >
                                                    Balance
                                                </Button>
                                                <Button
                                                    size="small"
                                                    danger
                                                    onClick={() => navigate(`/statement?user=${client.username}`)}
                                                >
                                                    Statement
                                                </Button>
                                                <Button
                                                    size="small"
                                                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                                    onClick={() => navigate(`/deposits/history?user=${client.username}`)}
                                                >
                                                    Deposit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                                                    onClick={() => navigate(`/withdrawals/history?user=${client.username}`)}
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
            </Card>

            {/* Modal: ADD CLIENT */}
            <Modal
                title="Add Client To Domain"
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onOk={() => handleSubmitAddClient()}
                confirmLoading={isSubmittingAdd}
                okText="Create Client"
            >
                <div className="space-y-3 pt-2 text-xs">
                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Target Domain <span className="text-error">*</span>
                        </label>
                        <Select
                            value={addDomain}
                            onChange={(val) => setAddDomain(val)}
                            className="w-full"
                            options={portals.map((p) => ({
                                label: p.domain_title,
                                value: p.domain_url,
                            }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Username <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="e.g. ROLEX_USER77"
                                value={addUsername}
                                onChange={(e) => setAddUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Full Name / Phone
                            </label>
                            <Input
                                placeholder="e.g. John Doe"
                                value={addFullName}
                                onChange={(e) => setAddFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Password <span className="text-error">*</span>
                            </label>
                            <Input.Password
                                placeholder="Enter password"
                                value={addPassword}
                                onChange={(e) => setAddPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Initial Balance (₹)
                            </label>
                            <Input
                                type="number"
                                value={addBalance}
                                onChange={(e) => setAddBalance(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal: QUICK BALANCE TRANSFER */}
            <Modal
                title="Client Balance Transfer"
                open={isBalModalOpen}
                onCancel={() => setIsBalModalOpen(false)}
                onOk={() => handleSubmitBalanceUpdate()}
                confirmLoading={isSubmittingBal}
                okText="Confirm Transfer"
            >
                {selectedClient && (
                    <div className="space-y-3 pt-2 text-xs">
                        <div className="bg-surface-2 p-3 rounded border border-line space-y-1">
                            <div className="flex justify-between">
                                <span className="text-ink-3">Client:</span>
                                <span className="font-bold text-ink">{selectedClient.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Domain:</span>
                                <Tag color="cyan">{selectedClient.domain_title || selectedClient.domain}</Tag>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-3">Current Balance:</span>
                                <span className="font-bold text-success text-sm">₹{selectedClient.balance.toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Operation Type
                            </label>
                            <Radio.Group
                                value={balOperation}
                                onChange={(e) => setBalOperation(e.target.value)}
                                buttonStyle="solid"
                                className="w-full flex"
                            >
                                <Radio.Button value="deposit" className="flex-1 text-center">
                                    + Deposit / Credit
                                </Radio.Button>
                                <Radio.Button value="withdraw" className="flex-1 text-center">
                                    - Withdraw / Debit
                                </Radio.Button>
                            </Radio.Group>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Amount (₹) <span className="text-error">*</span>
                            </label>
                            <Input
                                type="number"
                                value={balAmount}
                                onChange={(e) => setBalAmount(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default GlobalSearchView
