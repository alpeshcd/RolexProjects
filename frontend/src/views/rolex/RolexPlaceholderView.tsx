import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Tag, Button, Breadcrumb, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface RolexPlaceholderProps {
    title: string
    subtitle?: string
}

const RolexPlaceholderView: React.FC<RolexPlaceholderProps> = ({ 
    title, 
    subtitle = "This screen will be populated based on your provided screenshot." 
}) => {
    const navigate = useNavigate()

    return (
        <div className="space-y-4 w-full">
            {/* Top Bar Row: Title & Breadcrumbs */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: title },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            {title}
                        </Title>
                        <Tag color="cyan">Module</Tag>
                    </div>
                </div>

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/home')}
                >
                    Back to Dashboard
                </Button>
            </div>

            {/* Content Container using Ant Design Card */}
            <Card size="small" className="border border-line text-center py-10">
                <Title level={4} style={{ marginBottom: 8 }}>
                    {title} Module
                </Title>
                <Text type="secondary" className="text-xs block max-w-md mx-auto mb-6">
                    {subtitle}
                </Text>
                <div className="flex items-center justify-center gap-3">
                    <Tag color="blue">Rolex Operations</Tag>
                    <Button
                        type="primary"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/home')}
                    >
                        Back to Home
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default RolexPlaceholderView
