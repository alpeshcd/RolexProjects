import type { ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import ChangePassword from './pages/ChangePassword'
import EventPage from './pages/EventPage'
import Home from './pages/Home'
import Login from './pages/Login'
import MyBets from './pages/MyBets'
import Statement from './pages/Statement'

function RequireAuth({ children }: { children: ReactNode }) {
    const { ready, account } = useAuth()
    if (!ready) return <div className="loading full">Loading…</div>
    if (!account) return <Navigate to="/login" replace />
    return <>{children}</>
}

function NotFound() {
    return (
        <div className="empty-panel">
            This page doesn't exist. <Link to="/home">Go to matches</Link>
        </div>
    )
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
                        <Route path="/bets" element={<MyBets />} />
                        <Route path="/statement" element={<Statement />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
