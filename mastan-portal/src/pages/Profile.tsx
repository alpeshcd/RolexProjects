import { Link } from 'react-router-dom'
import { useAccount, useAuth } from '../auth/AuthContext'
import { usePageTitle } from '../components/Layout'
import { fmtAmount, fmtDateTime } from '../lib/format'

export default function Profile() {
    usePageTitle('Profile')
    const me = useAccount()
    const { portal } = useAuth()
    const rows: [string, string][] = [
        ['Username', me.username],
        ['Full Name', me.full_name ?? '-'],
        ['Account Type', me.role_label],
        ['Domain', portal ? `${portal.brand_name} (${portal.domain_url})` : me.domain_key],
        ['Balance', fmtAmount(me.balance)],
        ['Exposure', fmtAmount(me.exposure)],
        ['Credit Reference', fmtAmount(me.credit_reference)],
        ['Partnership', `${me.partnership}%`],
        ['Created On', fmtDateTime(me.created_at)],
    ]
    return (
        <div className="page-panel narrow">
            <div className="form-card">
                <table className="profile-table">
                    <tbody>
                        {rows.map(([label, value]) => (
                            <tr key={label}>
                                <th>{label}</th>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="form-actions">
                    <Link to="/change-password" className="btn btn-primary">
                        Change Password
                    </Link>
                </div>
            </div>
        </div>
    )
}
