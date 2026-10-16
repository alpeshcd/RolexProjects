import { useState } from 'react'
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
    BankOutlined,
    UploadOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateAccount } from '@/services/BankAccountsService'

const { Title, Text } = Typography

const AddAccountView = () => {
    const navigate = useNavigate()

    // Form state
    const [accountType, setAccountType] = useState<string>('UPI')
    const [accountCategory, setAccountCategory] = useState<string>('No Category')
    const [isOnlyWithdrawal, setIsOnlyWithdrawal] = useState<string>('No')
    const [bankName, setBankName] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [accountNumber, setAccountNumber] = useState<string>('')
    const [ifscCode, setIfscCode] = useState<string>('')
    const [minAmount, setMinAmount] = useState<string>('100')
    const [maxAmount, setMaxAmount] = useState<string>('20000')
    const [maxDepositAmount, setMaxDepositAmount] = useState<string>('Both')
    const [status, setStatus] = useState<string>('Active')
    const [submitting, setSubmitting] = useState<boolean>(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !accountNumber.trim()) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Name and Account number / UPI ID are required
                </Notification>
            )
            return
        }

        setSubmitting(true)
        try {
            await apiCreateAccount({
                user: 'MASTAN99M',
                name: name.trim(),
                type: accountType,
                category: accountCategory,
                is_only_withdrawal: isOnlyWithdrawal === 'Yes',
                account_for: isOnlyWithdrawal === 'Yes' ? 'Withdraw' : 'Deposit',
                bank_name: bankName.trim() || undefined,
                account_number: accountNumber.trim(),
                ifsc_code: ifscCode.trim() || undefined,
                min_amount: parseFloat(minAmount) || 100,
                max_amount: parseFloat(maxAmount) || 20000,
                max_deposit: maxDepositAmount,
                status: status,
            })

            toast.push(
                <Notification type="success" title="Account Gateway Created">
                    Payment account <strong>{name.toUpperCase()}</strong> added successfully!
                </Notification>
            )

            navigate('/accounts')
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to create payment account'
            toast.push(
                <Notification type="danger" title="Error">
                    {msg}
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
                            { title: <Link to="/accounts">Accounts</Link> },
                            { title: 'Add Gateway' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Add Payment Gateway Account
                        </Title>
                        <Tag color="blue">Create</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Configure corporate bank accounts, UPI endpoints, and deposit routing limits
                    </Text>
                </div>

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/accounts')}
                >
                    Back to Accounts
                </Button>
            </div>

            {/* Form Card */}
            <Card
                size="small"
                title={
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <BankOutlined className="text-primary" />
                        <span>Account Gateway Details</span>
                    </div>
                }
                className="border border-line"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Account Type <span className="text-error">*</span>
                            </label>
                            <Select
                                value={accountType}
                                onChange={(val) => setAccountType(val)}
                                className="w-full"
                                options={[
                                    { label: 'UPI', value: 'UPI' },
                                    { label: 'Bank Account', value: 'BANK' },
                                    { label: 'QR Code', value: 'QR' },
                                    { label: 'USDT / Crypto', value: 'CRYPTO' },
                                ]}
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Account Category
                            </label>
                            <Select
                                value={accountCategory}
                                onChange={(val) => setAccountCategory(val)}
                                className="w-full"
                                options={[
                                    { label: 'No Category', value: 'No Category' },
                                    { label: 'VIP Accounts', value: 'VIP Accounts' },
                                    { label: 'High Value (50K+)', value: 'High Value' },
                                    { label: 'Standard Pool', value: 'Standard' },
                                ]}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Is only for Withdrawal?
                            </label>
                            <Select
                                value={isOnlyWithdrawal}
                                onChange={(val) => setIsOnlyWithdrawal(val)}
                                className="w-full"
                                options={[
                                    { label: 'No (Deposits & Both)', value: 'No' },
                                    { label: 'Yes (Only for Payouts)', value: 'Yes' },
                                ]}
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Bank Name
                            </label>
                            <Input
                                placeholder="e.g. Yes Bank, Axis, BharatPe"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Beneficiary Name <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="e.g. DEEPAK NARAYAN"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Account number / UPI ID <span className="text-error">*</span>
                            </label>
                            <Input
                                placeholder="Enter UPI VPA or Bank A/C"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                required
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                IFSC Code
                            </label>
                            <Input
                                placeholder="Enter IFSC Code"
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value)}
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Minimum amount (₹)
                            </label>
                            <Input
                                type="number"
                                placeholder="Minimum amount"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Maximum amount (₹)
                            </label>
                            <Input
                                type="number"
                                placeholder="Maximum amount"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                            />
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Maximum Deposit amount
                            </label>
                            <Select
                                value={maxDepositAmount}
                                onChange={(val) => setMaxDepositAmount(val)}
                                className="w-full"
                                options={[
                                    { label: 'Both (No ceiling)', value: 'Both' },
                                    { label: 'Limit to ₹50,000', value: '50000' },
                                    { label: 'Limit to ₹1,00,000', value: '100000' },
                                    { label: 'Limit to ₹2,00,000', value: '200000' },
                                ]}
                            />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                QR Code Image (Optional)
                            </label>
                            <div className="border border-dashed border-line-strong rounded-lg p-2 flex items-center gap-2">
                                <UploadOutlined className="text-primary" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="text-xs text-ink-3"
                                />
                            </div>
                        </Col>

                        <Col xs={24} sm={12}>
                            <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                Status
                            </label>
                            <Select
                                value={status}
                                onChange={(val) => setStatus(val)}
                                className="w-full"
                                options={[
                                    { label: 'Active (Open for deposits)', value: 'Active' },
                                    { label: 'Inactive (Reserve pool)', value: 'Inactive' },
                                ]}
                            />
                        </Col>
                    </Row>

                    <div className="pt-4 border-t border-line flex justify-end gap-3">
                        <Button onClick={() => navigate('/accounts')}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            icon={<CheckOutlined />}
                        >
                            {submitting ? 'Adding Gateway...' : 'Add Account'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default AddAccountView
