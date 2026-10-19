import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
    Popconfirm,
    Tooltip,
} from 'antd'
import {
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
    RiseOutlined,
    UserAddOutlined,
    CloseOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetDirectMasters,
    apiCreateDirectMaster,
    apiUpdateDirectMaster,
    apiDeleteDirectMaster,
    apiGetParties,
    apiCreateParty,
} from '@/services/DirectMasterService'
import { apiGetPortals } from '@/services/GlobalSearchService'
import type { DirectMaster, Party, ThirdPartyInput } from '@/@types/directMaster'
import type { DomainPortal } from '@/@types/globalSearch'

const { Title, Text } = Typography

/** Draft row in the "Third Parties" sub-table before the record is saved. */
type DraftThirdParty = ThirdPartyInput & { party_name: string }

const DirectMasterView = () => {
    // Data
    const [records, setRecords] = useState<DirectMaster[]>([])
    const [portals, setPortals] = useState<DomainPortal[]>([])
    const [purchaseParties, setPurchaseParties] = useState<Party[]>([])
    const [sellerParties, setSellerParties] = useState<Party[]>([])
    const [thirdParties, setThirdParties] = useState<Party[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [exchange, setExchange] = useState<string | undefined>(undefined)
    const [admin, setAdmin] = useState<string>('')
    const [purchasePartyId, setPurchasePartyId] = useState<number | undefined>(undefined)
    const [purchaseRate, setPurchaseRate] = useState<string>('')
    const [sellerPartyId, setSellerPartyId] = useState<number | undefined>(undefined)
    const [sellerRate, setSellerRate] = useState<string>('')
    const [credit, setCredit] = useState<string>('')
    const [draftThirdParties, setDraftThirdParties] = useState<DraftThirdParty[]>([])
    const [submitting, setSubmitting] = useState<boolean>(false)

    // Third-party picker row
    const [tpPartyId, setTpPartyId] = useState<number | undefined>(undefined)
    const [tpCommission, setTpCommission] = useState<string>('')

    // Filters
    const [exchangeFilter, setExchangeFilter] = useState<string>('All')
    const [adminFilter, setAdminFilter] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('All')

    // Add-party modal
    const [partyModalOpen, setPartyModalOpen] = useState<boolean>(false)
    const [newPartyName, setNewPartyName] = useState<string>('')
    const [newPartyType, setNewPartyType] = useState<string>('All')
    const [newPartyContact, setNewPartyContact] = useState<string>('')

    const loadParties = async () => {
        try {
            const [p, s, t] = await Promise.all([
                apiGetParties('Purchase'),
                apiGetParties('Seller'),
                apiGetParties('Third'),
            ])
            setPurchaseParties(p)
            setSellerParties(s)
            setThirdParties(t)
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to load party list
                </Notification>
            )
        }
    }

    const fetchRecords = async (useFilters = true) => {
        setLoading(true)
        try {
            const params = useFilters
                ? {
                      exchange: exchangeFilter !== 'All' ? exchangeFilter : undefined,
                      admin: adminFilter.trim() || undefined,
                      status: statusFilter !== 'All' ? statusFilter : undefined,
                  }
                : undefined
            setRecords(await apiGetDirectMasters(params))
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch Direct Master records
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadParties()
        apiGetPortals()
            .then(setPortals)
            .catch(() => undefined)
        fetchRecords(false)
    }, [])

    const exchangeOptions = useMemo(
        () =>
            portals.map((p) => ({
                label: p.domain_title || p.brand_name,
                value: p.domain_key,
            })),
        [portals]
    )

    const partyOptions = (list: Party[]) =>
        list.map((p) => ({ label: p.name, value: p.id }))

    // Live preview of the spread while the form is being filled
    const previewSpread = useMemo(() => {
        const pr = parseFloat(purchaseRate)
        const sr = parseFloat(sellerRate)
        if (isNaN(pr) || isNaN(sr)) return null
        const spread = pr - sr
        const commission = draftThirdParties.reduce((sum, r) => sum + (r.commission || 0), 0)
        return {
            spread,
            commission,
            net: spread * (1 - commission / 100),
        }
    }, [purchaseRate, sellerRate, draftThirdParties])

    const resetForm = () => {
        setEditingId(null)
        setExchange(undefined)
        setAdmin('')
        setPurchasePartyId(undefined)
        setPurchaseRate('')
        setSellerPartyId(undefined)
        setSellerRate('')
        setCredit('')
        setDraftThirdParties([])
        setTpPartyId(undefined)
        setTpCommission('')
    }

    const handleAddThirdParty = () => {
        if (!tpPartyId) {
            toast.push(
                <Notification type="warning" title="Select Third Party">
                    Pick a third party before adding the row
                </Notification>
            )
            return
        }
        if (draftThirdParties.some((r) => r.party_id === tpPartyId)) {
            toast.push(
                <Notification type="warning" title="Already Added">
                    That third party is already on this record
                </Notification>
            )
            return
        }
        const party = thirdParties.find((p) => p.id === tpPartyId)
        setDraftThirdParties((prev) => [
            ...prev,
            {
                party_id: tpPartyId,
                party_name: party?.name || '',
                commission: parseFloat(tpCommission) || 0,
            },
        ])
        setTpPartyId(undefined)
        setTpCommission('')
    }

    const handleRemoveThirdParty = (partyId: number) => {
        setDraftThirdParties((prev) => prev.filter((r) => r.party_id !== partyId))
    }

    const handleSubmit = async () => {
        if (!exchange || !admin.trim() || !purchasePartyId || !sellerPartyId) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Exchange, Admin, Purchase Party and Seller Party are required
                </Notification>
            )
            return
        }
        const pr = parseFloat(purchaseRate)
        const sr = parseFloat(sellerRate)
        if (isNaN(pr) || isNaN(sr)) {
            toast.push(
                <Notification type="warning" title="Required Fields">
                    Purchase Rate and Seller Rate must be numbers
                </Notification>
            )
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                exchange,
                exchange_title: exchangeOptions.find((o) => o.value === exchange)?.label,
                admin: admin.trim(),
                purchase_party_id: purchasePartyId,
                purchase_rate: pr,
                seller_party_id: sellerPartyId,
                seller_rate: sr,
                credit: credit.trim() ? parseFloat(credit) : undefined,
                third_parties: draftThirdParties.map(({ party_id, commission }) => ({
                    party_id,
                    commission,
                })),
            }

            if (editingId) {
                await apiUpdateDirectMaster(editingId, payload)
                toast.push(
                    <Notification type="success" title="Record Updated">
                        Direct Master <strong>{admin.toUpperCase()}</strong> updated
                    </Notification>
                )
            } else {
                await apiCreateDirectMaster(payload)
                toast.push(
                    <Notification type="success" title="Record Added">
                        Direct Master <strong>{admin.toUpperCase()}</strong> added
                    </Notification>
                )
            }

            resetForm()
            fetchRecords(false)
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Error">
                    {err?.response?.data?.detail || 'Failed to save Direct Master record'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (rec: DirectMaster) => {
        setEditingId(rec.id)
        setExchange(rec.exchange)
        setAdmin(rec.admin)
        setPurchasePartyId(rec.purchase_party_id)
        setPurchaseRate(String(rec.purchase_rate))
        setSellerPartyId(rec.seller_party_id)
        setSellerRate(String(rec.seller_rate))
        setCredit(rec.credit != null ? String(rec.credit) : '')
        setDraftThirdParties(
            rec.third_parties.map((t) => ({
                party_id: t.party_id,
                party_name: t.party_name || '',
                commission: t.commission,
            }))
        )
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (rec: DirectMaster) => {
        try {
            await apiDeleteDirectMaster(rec.id)
            setRecords((prev) => prev.filter((r) => r.id !== rec.id))
            if (editingId === rec.id) resetForm()
            toast.push(
                <Notification type="success" title="Deleted">
                    Record for <strong>{rec.admin}</strong> removed
                </Notification>
            )
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to delete record
                </Notification>
            )
        }
    }

    const handleToggleStatus = async (rec: DirectMaster) => {
        const newStatus = rec.status === 'Active' ? 'Inactive' : 'Active'
        try {
            const updated = await apiUpdateDirectMaster(rec.id, { status: newStatus })
            setRecords((prev) => prev.map((r) => (r.id === rec.id ? updated : r)))
        } catch {
            toast.push(
                <Notification type="danger" title="Error">
                    Could not update status
                </Notification>
            )
        }
    }

    const handleCreateParty = async () => {
        if (!newPartyName.trim()) return
        try {
            await apiCreateParty({
                name: newPartyName.trim(),
                type: newPartyType,
                contact: newPartyContact.trim() || undefined,
            })
            await loadParties()
            toast.push(
                <Notification type="success" title="Party Added">
                    <strong>{newPartyName.toUpperCase()}</strong> is now available in the dropdowns
                </Notification>
            )
            setPartyModalOpen(false)
            setNewPartyName('')
            setNewPartyType('All')
            setNewPartyContact('')
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Error">
                    {err?.response?.data?.detail || 'Failed to add party'}
                </Notification>
            )
        }
    }

    // KPI strip
    const totalRecords = records.length
    const activeRecords = records.filter((r) => r.status === 'Active').length
    const totalCredit = records.reduce((sum, r) => sum + (r.credit || 0), 0)
    const avgSpread = totalRecords
        ? records.reduce((sum, r) => sum + (r.spread || 0), 0) / totalRecords
        : 0

    const labelCls =
        'block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1'

    return (
        <div className="space-y-4 w-full">
            {/* Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Direct Master' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <RiseOutlined className="text-[18px]" />
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Direct Master Management
                        </Title>
                        <Tag color="blue">Rates</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Purchase and seller rates per exchange admin, with third-party commission splits
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        icon={<UserAddOutlined />}
                        onClick={() => setPartyModalOpen(true)}
                    >
                        Add Party
                    </Button>
                    <Button
                        icon={<ReloadOutlined className={loading ? 'animate-spin' : ''} />}
                        onClick={() => fetchRecords()}
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
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Records</span>}
                            value={totalRecords}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Active</span>}
                            value={activeRecords}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--success)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Total Credit</span>}
                            value={totalCredit}
                            precision={2}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" className="border border-line">
                        <Statistic
                            title={<span className="text-xs uppercase text-ink-3 font-medium">Avg Spread</span>}
                            value={avgSpread}
                            precision={4}
                            valueStyle={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Add / Edit form */}
            <Card
                size="small"
                className="border border-line"
                title={
                    <span className="text-xs text-ink-3 font-normal">
                        {editingId ? `Edit Direct Master Record #${editingId}` : 'Add New Direct Master Record'}
                    </span>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                    <div>
                        <label className={labelCls}>Exchange *</label>
                        <Select
                            value={exchange}
                            onChange={setExchange}
                            className="w-full"
                            placeholder="Select Exchange"
                            options={exchangeOptions}
                            showSearch
                            optionFilterProp="label"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Admin *</label>
                        <Input
                            value={admin}
                            onChange={(e) => setAdmin(e.target.value)}
                            placeholder="Enter Admin Name"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Purchase Party *</label>
                        <Select
                            value={purchasePartyId}
                            onChange={setPurchasePartyId}
                            className="w-full"
                            placeholder="Select Purchase Party"
                            options={partyOptions(purchaseParties)}
                            showSearch
                            optionFilterProp="label"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Purchase Rate *</label>
                        <Input
                            value={purchaseRate}
                            onChange={(e) => setPurchaseRate(e.target.value)}
                            placeholder="e.g. 0.0250"
                            type="number"
                            step="0.0001"
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Seller Party *</label>
                        <Select
                            value={sellerPartyId}
                            onChange={setSellerPartyId}
                            className="w-full"
                            placeholder="Select Seller Party"
                            options={partyOptions(sellerParties)}
                            showSearch
                            optionFilterProp="label"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Seller Rate *</label>
                        <Input
                            value={sellerRate}
                            onChange={(e) => setSellerRate(e.target.value)}
                            placeholder="e.g. 0.0200"
                            type="number"
                            step="0.0001"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Credit</label>
                        <Input
                            value={credit}
                            onChange={(e) => setCredit(e.target.value)}
                            placeholder="Credit"
                            type="number"
                        />
                    </div>
                    <div className="flex items-end">
                        {previewSpread && (
                            <div className="w-full rounded border border-line bg-surface-2 px-3 py-2 text-[11px] leading-5">
                                <div className="flex justify-between">
                                    <span className="text-ink-3">Spread</span>
                                    <span className="font-bold text-ink">
                                        {previewSpread.spread.toFixed(4)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink-3">Commission</span>
                                    <span className="font-medium text-ink-2">
                                        {previewSpread.commission.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-ink-3">Net</span>
                                    <span className="font-bold text-primary">
                                        {previewSpread.net.toFixed(4)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Third Parties */}
                <div className="mt-5 pt-4 border-t border-line">
                    <div className="text-sm font-semibold text-ink mb-3">Third Parties</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                        <div>
                            <label className={labelCls}>Third Party</label>
                            <Select
                                value={tpPartyId}
                                onChange={setTpPartyId}
                                className="w-full"
                                placeholder="Select Third Party"
                                options={partyOptions(thirdParties)}
                                showSearch
                                optionFilterProp="label"
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Commission (%)</label>
                            <Input
                                value={tpCommission}
                                onChange={(e) => setTpCommission(e.target.value)}
                                placeholder="Commission"
                                type="number"
                                step="0.01"
                                onPressEnter={handleAddThirdParty}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Action</label>
                            <Tooltip title="Add third party">
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={handleAddThirdParty}
                                    style={{
                                        color: 'var(--success)',
                                        borderColor: 'var(--success)',
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>

                    {draftThirdParties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {draftThirdParties.map((row) => (
                                <Tag
                                    key={row.party_id}
                                    closable
                                    closeIcon={<CloseOutlined />}
                                    onClose={() => handleRemoveThirdParty(row.party_id)}
                                    color="geekblue"
                                    className="py-1 px-2"
                                >
                                    {row.party_name} — {row.commission}%
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <Button type="primary" onClick={handleSubmit} loading={submitting}>
                        {editingId ? 'Update Record' : 'Add Record'}
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={resetForm}>
                        {editingId ? 'Cancel' : 'Clear'}
                    </Button>
                </div>
            </Card>

            {/* Filter bar */}
            <Card size="small" className="border border-line">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <div>
                        <label className={labelCls}>Exchange</label>
                        <Select
                            value={exchangeFilter}
                            onChange={setExchangeFilter}
                            className="w-full"
                            options={[{ label: 'All', value: 'All' }, ...exchangeOptions]}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Admin</label>
                        <Input
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            placeholder="Search admin name"
                            allowClear
                            onPressEnter={() => fetchRecords()}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Status</label>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-full"
                            options={[
                                { label: 'All', value: 'All' },
                                { label: 'Active', value: 'Active' },
                                { label: 'Inactive', value: 'Inactive' },
                            ]}
                        />
                    </div>
                    <div>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => fetchRecords()}
                            className="w-full"
                            loading={loading}
                        >
                            SEARCH
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Records table */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3 w-10 text-center">NO</th>
                                <th className="py-2.5 px-3">EXCHANGE</th>
                                <th className="py-2.5 px-3">ADMIN</th>
                                <th className="py-2.5 px-3">PURCHASE PARTY</th>
                                <th className="py-2.5 px-3 text-right">PUR. RATE</th>
                                <th className="py-2.5 px-3">SELLER PARTY</th>
                                <th className="py-2.5 px-3 text-right">SELL RATE</th>
                                <th className="py-2.5 px-3 text-right">SPREAD</th>
                                <th className="py-2.5 px-3">THIRD PARTIES</th>
                                <th className="py-2.5 px-3 text-right">NET</th>
                                <th className="py-2.5 px-3 text-right">CREDIT</th>
                                <th className="py-2.5 px-3 text-center">STATUS</th>
                                <th className="py-2.5 px-3">CREATED</th>
                                <th className="py-2.5 px-3 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {loading ? (
                                <tr>
                                    <td colSpan={14} className="py-10 text-center text-ink-3 font-medium">
                                        Loading records...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="py-10 text-center text-ink-3 font-medium">
                                        No Data Available In Table
                                    </td>
                                </tr>
                            ) : (
                                records.map((rec, index) => (
                                    <tr key={rec.id} className="hover:bg-surface-hover transition-colors">
                                        <td className="py-2.5 px-3 text-center text-ink-3 font-semibold text-[11px]">
                                            {index + 1}
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-2 text-[11px] whitespace-nowrap">
                                            {rec.exchange_title || rec.exchange}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-ink whitespace-nowrap">
                                            {rec.admin}
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                                            {rec.purchase_party_name || '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-medium text-ink-2">
                                            {rec.purchase_rate?.toFixed(4)}
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                                            {rec.seller_party_name || '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-medium text-ink-2">
                                            {rec.seller_rate?.toFixed(4)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-ink">
                                            {rec.spread?.toFixed(4)}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            {rec.third_parties.length === 0 ? (
                                                <span className="text-ink-3">-</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {rec.third_parties.map((t) => (
                                                        <Tag key={t.id} color="geekblue" className="text-[10px] m-0">
                                                            {t.party_name} {t.commission}%
                                                        </Tag>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-primary">
                                            {rec.net_spread?.toFixed(4)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-ink-2">
                                            {rec.credit != null ? rec.credit.toFixed(2) : '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Button
                                                size="small"
                                                type={rec.status === 'Active' ? 'primary' : 'default'}
                                                danger={rec.status !== 'Active'}
                                                style={
                                                    rec.status === 'Active'
                                                        ? {
                                                              backgroundColor: 'var(--success)',
                                                              borderColor: 'var(--success)',
                                                          }
                                                        : undefined
                                                }
                                                onClick={() => handleToggleStatus(rec)}
                                            >
                                                {rec.status}
                                            </Button>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 text-[11px] whitespace-nowrap">
                                            {rec.created_at_str || '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                            <Space size={4}>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEdit(rec)}
                                                />
                                                <Popconfirm
                                                    title="Delete this record?"
                                                    okText="Delete"
                                                    okButtonProps={{ danger: true }}
                                                    onConfirm={() => handleDelete(rec)}
                                                >
                                                    <Button size="small" danger icon={<DeleteOutlined />} />
                                                </Popconfirm>
                                            </Space>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Party modal */}
            <Modal
                title="Add Party"
                open={partyModalOpen}
                onCancel={() => setPartyModalOpen(false)}
                onOk={handleCreateParty}
                okText="Add Party"
            >
                <div className="space-y-3 pt-2">
                    <div>
                        <label className={labelCls}>Party Name *</label>
                        <Input
                            value={newPartyName}
                            onChange={(e) => setNewPartyName(e.target.value)}
                            placeholder="Enter party name"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Usable As</label>
                        <Select
                            value={newPartyType}
                            onChange={setNewPartyType}
                            className="w-full"
                            options={[
                                { label: 'All dropdowns', value: 'All' },
                                { label: 'Purchase Party only', value: 'Purchase' },
                                { label: 'Seller Party only', value: 'Seller' },
                                { label: 'Third Party only', value: 'Third' },
                            ]}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Contact</label>
                        <Input
                            value={newPartyContact}
                            onChange={(e) => setNewPartyContact(e.target.value)}
                            placeholder="Mobile number (optional)"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default DirectMasterView
