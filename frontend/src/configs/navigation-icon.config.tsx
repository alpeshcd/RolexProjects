import {
    DashboardOutlined,
    SearchOutlined,
    TeamOutlined,
    BankOutlined,
    DollarCircleOutlined,
    ArrowUpOutlined,
    UsergroupAddOutlined,
    FileTextOutlined,
    BarChartOutlined,
    KeyOutlined,
    AppstoreOutlined,
    MenuFoldOutlined
} from '@ant-design/icons'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <AppstoreOutlined className="text-base text-gray-500" />,
    dashboard: <DashboardOutlined className="text-base text-blue-500" />,
    globalSearch: <SearchOutlined className="text-base text-gray-500" />,
    clients: <TeamOutlined className="text-base text-gray-500" />,
    accounts: <BankOutlined className="text-base text-gray-500" />,
    deposit: <DollarCircleOutlined className="text-base text-green-600" />,
    withdraw: <ArrowUpOutlined className="text-base text-rose-500" />,
    extraUsers: <UsergroupAddOutlined className="text-base text-gray-500" />,
    statement: <FileTextOutlined className="text-base text-gray-500" />,
    siteStats: <BarChartOutlined className="text-base text-gray-500" />,
    changePassword: <KeyOutlined className="text-base text-gray-500" />,
    collapseMenu: <MenuFoldOutlined />,
}

export default navigationIcon
