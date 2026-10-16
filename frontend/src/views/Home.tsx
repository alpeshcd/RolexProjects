import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import { apiGetDashboardStats, apiGetMe, type DashboardStatsData } from '@/services/AuthService'
import {
    Card,
    Row,
    Col,
    Statistic,
    Tag,
    Button,
    Space,
    Progress,
    Badge,
    Breadcrumb,
    Typography,
    Divider,
    Alert
} from 'antd'
import {
    ReloadOutlined,
    PlusOutlined,
    ArrowUpOutlined,
    DollarCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    BankOutlined,
    SearchOutlined,
    RightOutlined,
    SafetyCertificateOutlined,
    FundOutlined,
    SwapOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const Home = () => {
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)

    const [isRefreshing, setIsRefreshing] = useState(false)

    const [stats, setStats] = useState<DashboardStatsData>({
        new_clients: 13,
        total_ftd: 0,
        total_ftd_count: 0,
        total_deposits: 76720,
        total_deposits_count: 59,
        approved_deposits: 59120,
        approved_deposits_count: 37,
        rejected_deposits: 17600,
        rejected_deposits_count: 22,
        total_withdrawals: 189810,
        total_withdrawals_count: 25,
        pending_withdrawals: 7000,
        pending_withdrawals_count: 1,
        approved_withdrawals: 154283,
        approved_withdrawals_count: 18,
        rejected_withdrawals: 28527,
        rejected_withdrawals_count: 6,
    })

    const loadData = () => {
        setIsRefreshing(true)
        Promise.all([
            apiGetMe().then((me) => {
                if (me) setUser(me)
            }).catch(() => {}),
            apiGetDashboardStats().then((data) => {
                if (data) setStats(data)
            }).catch(() => {})
        ]).finally(() => {
            setTimeout(() => setIsRefreshing(false), 400)
        })
    }

    useEffect(() => {
        loadData()
    }, [])

    const username = user?.full_name || user?.userName || (user as any)?.username || 'Admin'
    const userRole = ((user as any)?.role || 'Super Master').toUpperCase()

    const totalDepositAmt = stats.total_deposits || 1
    const depositApprovalRate = Math.round((stats.approved_deposits / totalDepositAmt) * 100)
    const totalWithdrawalAmt = stats.total_withdrawals || 1
    const withdrawalApprovalRate = Math.round((stats.approved_withdrawals / totalWithdrawalAmt) * 100)
    const netTurnover = (stats.total_deposits || 0) - (stats.total_withdrawals || 0)

    const quickLinks = [
        { label: 'Clients', meta: `${stats.new_clients} users`, path: '/clients', icon: <TeamOutlined /> },
        { label: 'Deposit List', meta: `${stats.total_deposits_count} deposits`, path: '/deposit', icon: <DollarCircleOutlined /> },
        { label: 'UTR Entry', meta: 'Verification', path: '/deposits/utr-entry', icon: <CheckCircleOutlined /> },
        { label: 'Withdrawals', meta: `${stats.pending_withdrawals_count} pending`, path: '/withdraw', icon: <ArrowUpOutlined /> },
        { label: 'Bank Accounts', meta: 'Gateways', path: '/accounts', icon: <BankOutlined /> },
        { label: 'Global Search', meta: 'Lookup', path: '/global-search', icon: <SearchOutlined /> },
    ]

    return (
        <div className="space-y-4 w-full">
            {/* Page Header with Breadcrumb and Actions */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: 'Home' },
                            { title: 'Dashboard' }
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Operations Dashboard
                        </Title>
                        <Tag color="cyan">{userRole}</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Welcome back, <strong>{username}</strong>. Real-time operations and payment settlement ledger.
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/deposit')}
                    >
                        New Deposit
                    </Button>
                    <Button
                        icon={<CheckCircleOutlined />}
                        onClick={() => navigate('/deposits/utr-entry')}
                    >
                        Verify UTR
                    </Button>
                    <Button
                        icon={<ReloadOutlined spin={isRefreshing} />}
                        onClick={loadData}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* Quick Navigation */}
            <div>
                <div className="section-label mb-2.5">Quick Navigation</div>
                <Row gutter={[12, 12]}>
                    {quickLinks.map((item) => (
                        <Col key={item.path} xs={12} sm={8} lg={4}>
                            <button
                                type="button"
                                onClick={() => navigate(item.path)}
                                className="group w-full panel p-3.5 flex flex-col items-start gap-3 text-left hover:border-primary transition-colors"
                            >
                                <span className="icon-chip h-9 w-9 text-base shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {item.icon}
                                </span>
                                <span className="min-w-0 w-full">
                                    <span className="block text-[13px] font-semibold text-ink truncate">{item.label}</span>
                                    <span className="block text-[11px] text-ink-3 truncate">{item.meta}</span>
                                </span>
                            </button>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Core Financial Performance Statistics */}
            <div>
                <div className="section-label mb-2.5">Deposit & Payout Metrics</div>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Total Deposits</span>}
                                value={stats.total_deposits}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.total_deposits_count} Requests</span>
                                <Tag color="blue">{depositApprovalRate}% Rate</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Approved Deposits</span>}
                                value={stats.approved_deposits}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px', color: 'var(--success)' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.approved_deposits_count} Approved</span>
                                <Tag color="green">Settled</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Rejected Deposits</span>}
                                value={stats.rejected_deposits}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px', color: 'var(--error)' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.rejected_deposits_count} Rejected</span>
                                <Tag color="red">Unmatched</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Total Withdrawals</span>}
                                value={stats.total_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.total_withdrawals_count} Payouts</span>
                                <Tag color="purple">{withdrawalApprovalRate}% Paid</Tag>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Operational Payouts & FTD Row */}
            <div>
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-warning font-medium">Pending Withdrawals</span>}
                                value={stats.pending_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px', color: 'var(--warning)' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.pending_withdrawals_count} Pending</span>
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => navigate('/withdraw')}
                                    className="text-xs h-6 px-2"
                                >
                                    Approve
                                </Button>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Approved Withdrawals</span>}
                                value={stats.approved_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px', color: 'var(--success)' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.approved_withdrawals_count} Disbursed</span>
                                <Tag color="green">Cleared</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Rejected Withdrawals</span>}
                                value={stats.rejected_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px', color: 'var(--error)' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.rejected_withdrawals_count} Cancelled</span>
                                <Tag>Void</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="border-line"
                        >
                            <Statistic
                                title={<span className="text-xs text-ink-3">Total FTD</span>}
                                value={stats.total_ftd}
                                prefix="₹"
                                valueStyle={{ fontWeight: 600, fontSize: '18px' }}
                            />
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-ink-3">{stats.total_ftd_count} First Deposits</span>
                                <Tag color="cyan">Conversion</Tag>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Ant Design Analytics & Settlement Breakdown */}
            <Row gutter={[12, 12]}>
                <Col xs={24} lg={16}>
                    <Card
                        size="small"
                        title={
                            <div className="flex items-center gap-2">
                                <span className="icon-chip h-7 w-7 text-sm"><FundOutlined /></span>
                                <span>Volume & Clearance Performance</span>
                            </div>
                        }
                        extra={
                            <Tag color={netTurnover >= 0 ? 'green' : 'volcano'}>
                                Net: ₹{Number(netTurnover).toLocaleString('en-IN')}
                            </Tag>
                        }
                        className="border-line"
                    >
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <Text strong>Deposit Inflow Clearance</Text>
                                    <Text type="secondary">₹{Number(stats.approved_deposits).toLocaleString('en-IN')} / ₹{Number(stats.total_deposits).toLocaleString('en-IN')}</Text>
                                </div>
                                <Progress
                                    percent={depositApprovalRate}
                                    strokeColor="var(--success)"
                                    status="active"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <Text strong>Withdrawal Disbursal Rate</Text>
                                    <Text type="secondary">₹{Number(stats.approved_withdrawals).toLocaleString('en-IN')} / ₹{Number(stats.total_withdrawals).toLocaleString('en-IN')}</Text>
                                </div>
                                <Progress
                                    percent={withdrawalApprovalRate}
                                    strokeColor="var(--primary)"
                                />
                            </div>

                            <Divider style={{ margin: '12px 0' }} />

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title={<span className="text-xs text-ink-3">Processed Txns</span>}
                                        value={stats.total_deposits_count + stats.total_withdrawals_count}
                                        valueStyle={{ fontSize: '18px', fontWeight: 600 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span className="text-xs text-ink-3">Cleared Deposits</span>}
                                        value={stats.approved_deposits_count}
                                        valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span className="text-xs text-ink-3">Cleared Payouts</span>}
                                        value={stats.approved_withdrawals_count}
                                        valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--info)' }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <span className="icon-chip h-7 w-7 text-sm"><BankOutlined /></span>
                                <span>Banking Gateways</span>
                            </div>
                        }
                        extra={
                            <Button
                                type="link"
                                size="small"
                                onClick={() => navigate('/accounts')}
                                className="p-0 text-xs"
                            >
                                Manage <RightOutlined />
                            </Button>
                        }
                        className="border-line"
                        size="small"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-2 border border-line">
                                <Text strong className="text-xs">ICICI Corporate Bank</Text>
                                <Badge status="success" text={<span className="text-xs text-ink-2">Active</span>} />
                            </div>
                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-2 border border-line">
                                <Text strong className="text-xs">HDFC Gateway Account</Text>
                                <Badge status="success" text={<span className="text-xs text-ink-2">Active</span>} />
                            </div>
                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-2 border border-line">
                                <Text strong className="text-xs">UPI Auto-Reconciliation</Text>
                                <Badge status="success" text={<span className="text-xs text-ink-2">Active</span>} />
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs text-ink-3">
                                <span className="flex items-center gap-1">
                                    <SafetyCertificateOutlined className="text-primary" /> 256-Bit SSL Enforced
                                </span>
                                <Badge status="processing" text={<span className="text-xs">Online</span>} />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Home
