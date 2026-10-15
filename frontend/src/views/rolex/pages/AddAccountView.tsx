import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateAccount } from '@/services/BankAccountsService'
import {
    HiArrowLeft,
    HiCreditCard,
    HiQrcode,
    HiCheckCircle,
    HiUpload,
    HiShieldCheck,
} from 'react-icons/hi'
import { MdAccountBalance } from 'react-icons/md'

const AddAccountView = () => {
    const navigate = useNavigate()

    // Form state matching Screenshot 2
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
        <div className="min-h-screen bg-[#f8fafc] pb-16">
            {/* Top Modern Header */}
            <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/accounts')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-sm transition-colors"
                            title="Back to accounts list"
                        >
                            <HiArrowLeft />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-6 bg-teal-600 rounded-full inline-block"></span>
                                <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight uppercase">
                                    ADD PAYMENT GATEWAY ACCOUNT
                                </h1>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 pl-4.5 font-medium">
                                Configure bank accounts, UPI endpoints, and deposit routing limits
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Link to="/home" className="hover:text-teal-700 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link to="/accounts" className="hover:text-teal-700 transition-colors">
                            List
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800 font-bold">Add</span>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                    {/* Header Strip */}
                    <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg text-teal-200 backdrop-blur-xs">
                                <MdAccountBalance />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm md:text-base tracking-wide">
                                    Add Account Gateway
                                </h2>
                                <span className="text-xs text-teal-200/90 block">
                                    Provision new UPI VPA or corporate bank account for deposits & withdrawals
                                </span>
                            </div>
                        </div>
                        <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block border border-white/20">
                            Instant Gateway Activation
                        </span>
                    </div>

                    {/* Form Body matching Screenshot 2 */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 bg-[#f9fafb]">
                        {/* Row 1: Account Type | Account Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Account Type: *
                                </label>
                                <select
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="BANK">Bank Account</option>
                                    <option value="QR">QR Code</option>
                                    <option value="CRYPTO">USDT / Crypto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Account Category:
                                </label>
                                <select
                                    value={accountCategory}
                                    onChange={(e) => setAccountCategory(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                >
                                    <option value="No Category">No Category</option>
                                    <option value="VIP Accounts">VIP Accounts</option>
                                    <option value="High Value">High Value (50K+)</option>
                                    <option value="Standard">Standard Pool</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Is only for Withdrawal? | Bank Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Is only for Withdrawal?:
                                </label>
                                <select
                                    value={isOnlyWithdrawal}
                                    onChange={(e) => setIsOnlyWithdrawal(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                >
                                    <option value="No">No (Used for Deposits & Both)</option>
                                    <option value="Yes">Yes (Only for Payouts)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Bank Name:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Bank name (e.g. Yes Bank, Axis, BharatPe)"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-medium"
                                />
                            </div>
                        </div>

                        {/* Row 3: Name | Account number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Beneficiary Name: *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter name (e.g. DEEPAK NARAYAN)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-bold uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Account number / UPI ID: *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter UPI VPA or Bank Account number"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-mono font-medium"
                                />
                            </div>
                        </div>

                        {/* Row 4: IFSC Code | Minimum amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    IFSC Code:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter IFSC Code (For Bank transfers)"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-mono uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Minimum amount (₹):
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="10"
                                    placeholder="Enter Minimum amount"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-bold"
                                />
                            </div>
                        </div>

                        {/* Row 5: Maximum amount | Maximum Deposit amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Maximum amount (₹):
                                </label>
                                <input
                                    type="number"
                                    min="100"
                                    step="500"
                                    placeholder="Enter Maximum amount"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Maximum Deposit amount:
                                </label>
                                <select
                                    value={maxDepositAmount}
                                    onChange={(e) => setMaxDepositAmount(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                >
                                    <option value="Both">Both (No deposit ceiling)</option>
                                    <option value="50000">Limit to ₹50,000</option>
                                    <option value="100000">Limit to ₹1,00,000</option>
                                    <option value="200000">Limit to ₹2,00,000</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 6: QR Code File | Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    QR Code:
                                </label>
                                <div className="border border-slate-300 border-dashed rounded-xl p-3 bg-white flex items-center gap-3">
                                    <HiUpload className="text-teal-600 text-xl shrink-0" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="text-xs text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Auto-generated UPI QR code will also be provided automatically if not uploaded.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Status:
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-2xs"
                                >
                                    <option value="Active">Active (Immediately open for deposits)</option>
                                    <option value="Inactive">Inactive (Keep in reserve pool)</option>
                                </select>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 flex items-center gap-3 text-xs text-teal-900 mt-4">
                            <HiShieldCheck className="text-teal-700 text-2xl shrink-0" />
                            <div>
                                <span className="font-bold block">Live Gateway Routing</span>
                                <span className="text-teal-800 text-[11px]">
                                    Once saved as <strong>Active</strong>, this payment endpoint will be available for clients in the Deposit module and UTR Verification system.
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => navigate('/accounts')}
                                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs text-slate-700 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto bg-[#008080] hover:bg-[#006e6e] active:scale-98 text-white text-xs font-bold px-8 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <HiCheckCircle className="text-base" />
                                <span>{submitting ? 'Adding Gateway...' : 'Add Account'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddAccountView
