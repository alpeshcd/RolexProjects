import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Card,
    Button,
    Input,
    Select,
    Tag,
    Space,
    Breadcrumb,
    Typography,
    Row,
    Col,
} from 'antd'
import {
    ArrowLeftOutlined,
    CheckOutlined,
    UserAddOutlined,
    GlobalOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateClientFromForm } from '@/services/AuthService'
import { apiGetPortals } from '@/services/GlobalSearchService'

const { Title, Text } = Typography

const DEFAULT_MASTERS = [
    { label: 'Mastan777(mastan247.club)', value: 'Mastan777(mastan247.club)', site: 'Mastan247' },
    { label: 'Mastan365m(mastan365.com)', value: 'Mastan365m(mastan365.com)', site: 'Mastan365' },
    { label: 'Mastan99m(mastan99.com)', value: 'Mastan99m(mastan99.com)', site: 'Mastan99' },
    { label: 'Mastanreddymas(mastanreddy.com)', value: 'Mastanreddymas(mastanreddy.com)', site: 'Mastanredd' },
]

const AddClientsView = () => {
    const navigate = useNavigate()
    const [masterList, setMasterList] = useState<{ label: string; value: string; site: string }[]>(DEFAULT_MASTERS)
    const [selectedMaster, setSelectedMaster] = useState<string>(DEFAULT_MASTERS[0].value)
    const [referralCode, setReferralCode] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [submitting, setSubmitting] = useState<boolean>(false)

    useEffect(() => {
        const loadPortals = async () => {
            try {
                const portals = await apiGetPortals()
                if (portals && portals.length > 0) {
                    setMasterList(
                        portals.map((p) => ({
                            label: p.domain_title,
                            value: p.domain_title,
                            site: p.domain_key,
                        }))
                    )
                    setSelectedMaster(portals[0].domain_title)
                }
            } catch (err) {
                // Keep default
            }
        }
        loadPortals()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim() || !password.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Username and Password are required.
                </Notification>
            )
            return
        }

        setSubmitting(true)
        try {
            const client = await apiCreateClientFromForm({
                master: selectedMaster,
                referral_code: referralCode.trim() || undefined,
                username: username.trim(),
                password: password.trim(),
            })

            toast.push(
                <Notification type="success" title="Client Created Successfully">
                    Client <strong>{client.username}</strong> registered under{' '}
                    <strong>{client.site || client.master}</strong>!
                </Notification>
            )

            navigate('/clients')
        } catch (err: any) {
            const errMsg = err?.response?.data?.detail || 'Failed to create client'
            toast.push(
                <Notification type="danger" title="Error">
                    {errMsg}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-4 w-full max-w-4xl mx-auto">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: <Link to="/clients">Clients</Link> },
                            { title: 'Add Client' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Add New Client
                        </Title>
                        <Tag color="purple">Register</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Provision credentials and assign to an exchange master agent
                    </Text>
                </div>

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/clients')}
                >
                    Back to Clients
                </Button>
            </div>

            {/* Form Card */}
            <Card
                size="small"
                title={
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <UserAddOutlined className="text-primary" />
                        <span>Client Registration Form</span>
                    </div>
                }
                className="border border-line"
            >
                {/* Master quick select tags */}
                <div className="mb-4 pb-3 border-b border-line">
                    <div className="text-xs text-ink-3 font-semibold uppercase tracking-wider mb-2">
                        Quick Select Master Portal
                    </div>
                    <Space wrap>
                        {masterList.map((m) => (
                            <Tag.CheckableTag
                                key={m.value}
                                checked={selectedMaster === m.value}
                                onChange={() => setSelectedMaster(m.value)}
                                style={{
                                    border: '1px solid var(--line-strong)',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            >
                                <GlobalOutlined className="mr-1" />
                                {m.label.split('(')[0]}
                            </Tag.CheckableTag>
                        ))}
                    </Space>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Master Portal <span className="text-error">*</span>
                            </label>
                            <Select
                                value={selectedMaster}
                                onChange={(val) => setSelectedMaster(val)}
                                className="w-full"
                                options={masterList.map((m) => ({
                                    label: m.label,
                                    value: m.value,
                                }))}
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Referral Code
                            </label>
                            <Input
                                placeholder="e.g. ROLEX100 (Optional)"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Username <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="e.g. ROLEX_PLAYER99"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Password <span className="text-error">*</span>
                            </label>
                            <Input.Password
                                placeholder="Enter secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Col>
                    </Row>

                    <div className="pt-4 border-t border-line flex justify-end gap-3">
                        <Button onClick={() => navigate('/clients')}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            icon={<CheckOutlined />}
                        >
                            {submitting ? 'Creating Client...' : 'Create Client Account'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default AddClientsView
