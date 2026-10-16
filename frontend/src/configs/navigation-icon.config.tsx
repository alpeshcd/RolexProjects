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
    home: <AppstoreOutlined className="text-[17px]" />,
    dashboard: <DashboardOutlined className="text-[17px]" />,
    globalSearch: <SearchOutlined className="text-[17px]" />,
    clients: <TeamOutlined className="text-[17px]" />,
    accounts: <BankOutlined className="text-[17px]" />,
    deposit: <DollarCircleOutlined className="text-[17px]" />,
    withdraw: <ArrowUpOutlined className="text-[17px]" />,
    extraUsers: <UsergroupAddOutlined className="text-[17px]" />,
    statement: <FileTextOutlined className="text-[17px]" />,
    siteStats: <BarChartOutlined className="text-[17px]" />,
    changePassword: <KeyOutlined className="text-[17px]" />,
    collapseMenu: <MenuFoldOutlined />,
}

export default navigationIcon
