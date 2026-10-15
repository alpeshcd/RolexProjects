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

    return (
        <div className="space-y-5 max-w-[1600px] mx-auto">
            {/* Page Header with Breadcrumb and Actions */}
            <div className="bg-white dark:bg-[#1f1f1f] p-5 rounded-lg border border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb
                        items={[
                            { title: 'Home' },
                            { title: 'Dashboard' }
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0 }}>
                            Operations Dashboard
                        </Title>
                        <Tag color="blue">{userRole}</Tag>
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

            {/* Quick Navigation Cards (Simple, Decent Ant Design Look) */}
            <div>
                <Text strong className="text-xs uppercase text-gray-500 mb-2 block tracking-wider">
                    Quick Navigation
                </Text>
                <Row gutter={[12, 12]}>
                    <Col xs={12} sm={8} lg={4}>
                        <Card
                            hoverable
                            size="small"
                            onClick={() => navigate('/clients')}
                            className="text-center rounded-lg border-[#f0f0f0] dark:border-[#303030]"
                        >
                            <TeamOutlined className="text-xl text-blue-500 mb-1 block" />
                            <Text strong className="text-xs block">Clients</Text>
                            <Tag color="blue" className="mt-1 m-0 text-[10px]">{stats.new_clients} Registered</Tag>
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card
                            hoverable
                            size="small"
                            onClick={() => navigate('/deposit')}
                            className="text-center rounded-lg border-[#f0f0f0] dark:border-[#303030]"
                        >
                            <DollarCircleOutlined className="text-xl text-green-500 mb-1 block" />
                            <Text strong className="text-xs block">Deposit List</Text>
                            <Tag color="green" className="mt-1 m-0 text-[10px]">{stats.total_deposits_count} Deposits</Tag>
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card
                            hoverable
                            size="small"
                            onClick={() => navigate('/deposits/utr-entry')}
                            className="text-center rounded-lg border-[#f0f0f0] dark:border-[#303030]"
                        >
                            <CheckCircleOutlined className="text-xl text-cyan-500 mb-1 block" />
                            <Text strong className="text-xs block">UTR Entry</Text>
                            <Tag color="cyan" className="mt-1 m-0 text-[10px]">Verification</Tag>
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card
                            hoverable
                            size="small"
                            onClick={() => navigate('/withdraw')}
                            className="text-center rounded-lg border-[#f0f0f0] dark:border-[#303030]"
                        >
                            <ArrowUpOutlined className="text-xl text-rose-500 mb-1 block" />
                            <Text strong className="text-xs block">Withdrawals</Text>
                            <Tag color="volcano" className="mt-1 m-0 text-[10px]">{stats.pending_withdrawals_count} Pending</Tag>
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card
                            hoverable
                            size="small"
                            onClick={() => navigate('/accounts')}
                            className="text-center rounded-lg border-[#f0f0f0] dark:border-[#303030]"
                        >
                            <BankOutlined className="text-xl text-purple-500 mb-1 block" />
                            <Text strong className="text-xs block">Bank Accounts</Text>
                            <Tag color="purple" className="mt-1 m-0 text-[10px]">Gateways</Tag>
                        </Card>
                    </Col>
                    <Col xs={12} sm={8} lg={4}>
                        <Card
                            hoverable
                            size="small"
                            onClick={() => navigate('/global-search')}
                            className="text-center rounded-lg border-[#f0f0f0] dark:border-[#303030]"
                        >
                            <SearchOutlined className="text-xl text-gray-500 mb-1 block" />
                            <Text strong className="text-xs block">Global Search</Text>
                            <Tag className="mt-1 m-0 text-[10px]">Cross-Portal</Tag>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Core Financial Performance Statistics */}
            <div>
                <Text strong className="text-xs uppercase text-gray-500 mb-2 block tracking-wider">
                    Deposit & Payout Metrics
                </Text>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Total Deposits</span>}
                                value={stats.total_deposits}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.total_deposits_count} Requests</span>
                                <Tag color="blue">{depositApprovalRate}% Rate</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Approved Deposits</span>}
                                value={stats.approved_deposits}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px', color: '#52c41a' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.approved_deposits_count} Approved</span>
                                <Tag color="green">Settled</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Rejected Deposits</span>}
                                value={stats.rejected_deposits}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px', color: '#ff4d4f' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.rejected_deposits_count} Rejected</span>
                                <Tag color="red">Unmatched</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Total Withdrawals</span>}
                                value={stats.total_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.total_withdrawals_count} Payouts</span>
                                <Tag color="purple">{withdrawalApprovalRate}% Paid</Tag>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Operational Payouts & FTD Row */}
            <div>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pending Withdrawals</span>}
                                value={stats.pending_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px', color: '#d46b08' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.pending_withdrawals_count} Payouts Pending</span>
                                <Button
                                    size="small"
                                    type="primary"
                                    danger
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
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Approved Withdrawals</span>}
                                value={stats.approved_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px', color: '#52c41a' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.approved_withdrawals_count} Disbursed</span>
                                <Tag color="green">Cleared</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Rejected Withdrawals</span>}
                                value={stats.rejected_withdrawals}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px', color: '#ff4d4f' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.rejected_withdrawals_count} Cancelled</span>
                                <Tag>Void</Tag>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            size="small"
                            className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                        >
                            <Statistic
                                title={<span className="text-xs text-gray-500">Total FTD</span>}
                                value={stats.total_ftd}
                                prefix="₹"
                                valueStyle={{ fontWeight: 700, fontSize: '24px' }}
                            />
                            <Divider style={{ margin: '10px 0' }} />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{stats.total_ftd_count} First Deposits</span>
                                <Tag color="cyan">Conversion</Tag>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Ant Design Analytics & Settlement Breakdown */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <FundOutlined className="text-blue-500" />
                                <span>Volume & Clearance Performance</span>
                            </div>
                        }
                        extra={
                            <Tag color={netTurnover >= 0 ? 'green' : 'volcano'}>
                                Net: ₹{Number(netTurnover).toLocaleString('en-IN')}
                            </Tag>
                        }
                        className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                    >
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <Text strong>Deposit Inflow Clearance</Text>
                                    <Text type="secondary">₹{Number(stats.approved_deposits).toLocaleString('en-IN')} / ₹{Number(stats.total_deposits).toLocaleString('en-IN')}</Text>
                                </div>
                                <Progress
                                    percent={depositApprovalRate}
                                    strokeColor="#52c41a"
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
                                    strokeColor="#1677ff"
                                />
                            </div>

                            <Divider style={{ margin: '12px 0' }} />

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title={<span className="text-xs text-gray-500">Processed Txns</span>}
                                        value={stats.total_deposits_count + stats.total_withdrawals_count}
                                        valueStyle={{ fontSize: '18px', fontWeight: 600 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span className="text-xs text-gray-500">Cleared Deposits</span>}
                                        value={stats.approved_deposits_count}
                                        valueStyle={{ fontSize: '18px', fontWeight: 600, color: '#52c41a' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span className="text-xs text-gray-500">Cleared Payouts</span>}
                                        value={stats.approved_withdrawals_count}
                                        valueStyle={{ fontSize: '18px', fontWeight: 600, color: '#1677ff' }}
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
                                <BankOutlined className="text-green-600" />
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
                        className="rounded-lg border-[#f0f0f0] dark:border-[#303030] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <Text strong className="text-xs">ICICI Corporate Bank</Text>
                                <Badge status="success" text={<span className="text-xs text-gray-600 dark:text-gray-400">Active</span>} />
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <Text strong className="text-xs">HDFC Gateway Account</Text>
                                <Badge status="success" text={<span className="text-xs text-gray-600 dark:text-gray-400">Active</span>} />
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <Text strong className="text-xs">UPI Auto-Reconciliation</Text>
                                <Badge status="success" text={<span className="text-xs text-gray-600 dark:text-gray-400">Active</span>} />
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <SafetyCertificateOutlined className="text-green-600" /> 256-Bit SSL Enforced
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
