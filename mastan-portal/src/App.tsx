import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import ChangePassword from './pages/ChangePassword'
import CreateUser from './pages/CreateUser'
import Downline from './pages/Downline'
import EventPage from './pages/EventPage'
import Home from './pages/Home'
import Login from './pages/Login'
import { MultiMarket, NotFound, PendingReport, UnsettledBets } from './pages/MarketPages'
import Results from './pages/Results'
import Profile from './pages/Profile'
import Statement from './pages/Statement'
import { PENDING_REPORTS } from './menus'

function RequireAuth({ children }: { children: ReactNode }) {
    const { ready, account } = useAuth()
    if (!ready) return <div className="loading full">Loading…</div>
    if (!account) return <Navigate to="/login" replace />
    return <>{children}</>
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        element={
                            <RequireAuth>
                                <Layout />
                            </RequireAuth>
                        }
                    >
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/sport/:sportId" element={<Home />} />
                        <Route path="/event/:eventId" element={<EventPage />} />
                        <Route path="/market/multi" element={<MultiMarket />} />
                        <Route path="/market/unsettled" element={<UnsettledBets />} />
                        <Route path="/market/results" element={<Results />} />
                        <Route path="/clients/downline" element={<Downline />} />
                        <Route path="/clients/super-master" element={<Downline />} />
                        <Route path="/clients/blocked" element={<Downline />} />
                        <Route path="/create/:role" element={<CreateUser />} />
                        <Route path="/reports/statement" element={<Statement />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        {Object.keys(PENDING_REPORTS).map((path) => (
                            <Route key={path} path={path} element={<PendingReport />} />
                        ))}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
