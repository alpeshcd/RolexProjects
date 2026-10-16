import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Card,
    Button,
    Input,
    Tag,
    Progress,
    Space,
    Breadcrumb,
    Typography,
    Row,
    Col,
} from 'antd'
import {
    KeyOutlined,
    CheckOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiChangePassword } from '@/services/StatementsService'

const { Title, Text } = Typography

const ChangePasswordView = () => {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [loading, setLoading] = useState(false)

    // Calculate password strength
    const calculateStrength = (pwd: string) => {
        let score = 0
        if (pwd.length >= 6) score += 25
        if (pwd.length >= 8) score += 25
        if (/[A-Z]/.test(pwd)) score += 25
        if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25
        return score
    }

    const strength = calculateStrength(newPassword)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!oldPassword.trim()) {
            toast.push(
                <Notification title="Missing Password" type="warning">
                    Please enter your current administrative password.
                </Notification>
            )
            return
        }

        if (newPassword !== confirmPassword) {
            toast.push(
                <Notification title="Mismatch" type="danger">
                    New password and confirmation do not match.
                </Notification>
            )
            return
        }

        if (newPassword.length < 6) {
            toast.push(
                <Notification title="Weak Password" type="warning">
                    Password must be at least 6 characters long.
                </Notification>
            )
            return
        }

        setLoading(true)
        try {
            const res = await apiChangePassword({
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
                otp_code: otpCode.trim() || undefined,
            })
            toast.push(
                <Notification title="Success" type="success">
                    {res.message || 'Password changed successfully!'}
                </Notification>
            )
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setOtpCode('')
        } catch (err: any) {
            toast.push(
                <Notification title="Update Failed" type="danger">
                    {err?.response?.data?.detail || 'Failed to update password.'}
                </Notification>
            )
        } finally {
            setLoading(false)
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
                            { title: 'Security' },
                            { title: 'Change Password' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Change Administrative Password
                        </Title>
                        <Tag color="red">Security</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Ensure your Rolex exchange administrative account uses strong, rotating authentication credentials.
                    </Text>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {/* Form Card */}
                <Col xs={24} md={16}>
                    <Card
                        size="small"
                        title={
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <KeyOutlined className="text-primary" />
                                <span>Update Credentials</span>
                            </div>
                        }
                        className="border border-line"
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Current Password <span className="text-error">*</span>
                                </label>
                                <Input.Password
                                    placeholder="Enter current password..."
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    New Password <span className="text-error">*</span>
                                </label>
                                <Input.Password
                                    placeholder="Enter new strong password..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-[11px] text-ink-3 mb-1">
                                            <span>Password Strength</span>
                                            <span>{strength}%</span>
                                        </div>
                                        <Progress
                                            percent={strength}
                                            showInfo={false}
                                            size="small"
                                            strokeColor={
                                                strength <= 25 ? 'var(--error)' : strength <= 50 ? 'var(--warning)' : 'var(--success)'
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    Confirm New Password <span className="text-error">*</span>
                                </label>
                                <Input.Password
                                    placeholder="Re-enter new password..."
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                                    2FA OTP Code (Optional)
                                </label>
                                <Input
                                    placeholder="6-digit authenticator code (if enabled)"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                />
                            </div>

                            <div className="pt-3 border-t border-line flex justify-end">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<CheckOutlined />}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </Card>
                </Col>

                {/* Security Guidelines Sidebar */}
                <Col xs={24} md={8}>
                    <Card
                        size="small"
                        title={
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <SafetyCertificateOutlined className="text-primary" />
                                <span>Security Recommendations</span>
                            </div>
                        }
                        className="border border-line"
                    >
                        <div className="text-xs text-ink-2 space-y-2.5">
                            <p>For administrative and financial security, adhere to these guidelines:</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                                <li>Minimum 8 characters with numbers and symbols.</li>
                                <li>Rotate credentials every 30-60 days.</li>
                                <li>Do not reuse previous 3 passwords.</li>
                                <li>Do not share operator logins across staff members.</li>
                            </ul>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ChangePasswordView
