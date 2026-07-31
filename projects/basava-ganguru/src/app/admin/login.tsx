'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

type LoginState = 'idle' | 'loading' | 'error';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginState, setLoginState] = useState<LoginState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setErrorMessage('Please enter both username and password');
            setLoginState('error');
            return;
        }

        setLoginState('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();

            // Store token
            localStorage.setItem('admin_token', data.token);

            // Redirect to dashboard
            router.push('/admin/dashboard');
        } catch (error) {
            setLoginState('error');
            setErrorMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b1120] to-[#1b2540] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-[#e3be86] to-[#b8894a] rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🏘️</span>
                        </div>
                        <h1 className="text-3xl font-bold text-[#0b1120] font-display mb-2">Admin Access</h1>
                        <p className="text-sm text-[#8f6a38]">Basava Ganguru Dashboard</p>
                    </motion.div>

                    {/* Error Message */}
                    {loginState === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{errorMessage}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <label className="block text-sm font-semibold text-[#0b1120] mb-2">Username</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3 text-[#b8894a]" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    disabled={loginState === 'loading'}
                                    className="w-full pl-10 pr-4 py-3 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 disabled:opacity-50"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-sm font-semibold text-[#0b1120] mb-2">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-[#b8894a]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={loginState === 'loading'}
                                    className="w-full pl-10 pr-4 py-3 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 disabled:opacity-50"
                                />
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            type="submit"
                            disabled={loginState === 'loading'}
                            whileHover={{ scale: loginState === 'loading' ? 1 : 1.02 }}
                            whileTap={{ scale: loginState === 'loading' ? 1 : 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-[#e3be86] to-[#b8894a] text-[#0b1120] font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loginState === 'loading' ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                        <Loader size={20} />
                                    </motion.div>
                                    Logging in...
                                </>
                            ) : (
                                '🔓 Access Dashboard'
                            )}
                        </motion.button>
                    </form>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 p-4 bg-[#e3be86] bg-opacity-10 border border-[#b8894a] border-opacity-20 rounded-lg text-sm text-[#8f6a38]"
                    >
                        <p className="font-semibold mb-2">Demo Credentials:</p>
                        <p>Username: <code className="font-mono font-bold">admin</code></p>
                        <p>Password: <code className="font-mono font-bold">admin123</code></p>
                        <p className="mt-3 text-xs opacity-75">⚠️ Change credentials in production environment</p>
                    </motion.div>

                    {/* Footer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="text-center text-xs text-[#8f6a38] mt-6"
                    >
                        Authorized personnel only • Session logging enabled
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}