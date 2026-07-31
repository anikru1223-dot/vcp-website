'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Loader } from 'lucide-react';
import { validateEmail, validatePhone, formatPhoneNumber } from '@/lib/utils';

interface InquiryFormProps {
    plotNumber: number;
    onClose: () => void;
    onSuccess?: (data: any) => void;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function InquiryForm({ plotNumber, onClose, onSuccess }: InquiryFormProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        message: '',
    });

    const [formState, setFormState] = useState<FormState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errorMessage) setErrorMessage('');
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            setErrorMessage('Please enter your full name');
            return false;
        }

        if (!formData.phone.trim()) {
            setErrorMessage('Please enter your phone number');
            return false;
        }

        if (!validatePhone(formData.phone)) {
            setErrorMessage('Please enter a valid 10-digit phone number');
            return false;
        }

        if (!formData.email.trim()) {
            setErrorMessage('Please enter your email address');
            return false;
        }

        if (!validateEmail(formData.email)) {
            setErrorMessage('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setFormState('loading');

        try {
            // Submit inquiry to API
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plot_id: plotNumber.toString(),
                    full_name: formData.fullName,
                    phone: formatPhoneNumber(formData.phone),
                    email: formData.email,
                    message: formData.message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit inquiry');
            }

            const data = await response.json();

            setFormState('success');

            // Call success callback
            if (onSuccess) {
                onSuccess(data);
            }

            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            setFormState('error');
            setErrorMessage('Failed to submit inquiry. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 30 }}
                >
                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </motion.button>

                    <AnimatePresence mode="wait">
                        {formState === 'success' ? (
                            /* Success State */
                            <motion.div
                                key="success"
                                className="p-12 text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <motion.div
                                    className="w-16 h-16 bg-[#4b5c42] rounded-full flex items-center justify-center mx-auto mb-6"
                                    animate={{ scale: [0.8, 1.1, 1] }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Check size={32} className="text-white" />
                                </motion.div>

                                <h3 className="text-2xl font-bold text-[#0b1120] mb-2 font-display">
                                    Thank You!
                                </h3>

                                <p className="text-[#57544c] mb-6">
                                    Your inquiry for Plot {plotNumber} has been submitted successfully.
                                </p>

                                <div className="bg-[#e3be86] bg-opacity-20 border border-[#b8894a] border-opacity-30 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-[#0b1120]">
                                        📥 <strong>Brochure Download</strong> has started automatically. Check your downloads folder.
                                    </p>
                                </div>

                                <p className="text-xs text-[#8f6a38]">
                                    Our team will contact you within 24 hours with complete details.
                                </p>
                            </motion.div>
                        ) : (
                            /* Form State */
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="p-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Header */}
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                    <h2 className="text-2xl font-bold text-[#0b1120] mb-1 font-display">
                                        Interested in Plot {plotNumber}?
                                    </h2>
                                    <p className="text-sm text-[#57544c] mb-6">
                                        Fill in your details and we'll get back to you soon.
                                    </p>
                                </motion.div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <motion.div
                                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600">{errorMessage}</p>
                                    </motion.div>
                                )}

                                {/* Full Name */}
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <label className="block text-sm font-semibold text-[#0b1120] mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        disabled={formState === 'loading'}
                                        className="w-full px-4 py-3 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 transition disabled:opacity-50"
                                    />
                                </motion.div>

                                {/* Phone Number */}
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <label className="block text-sm font-semibold text-[#0b1120] mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#0b1120]">+91</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            disabled={formState === 'loading'}
                                            className="flex-1 px-4 py-3 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 transition disabled:opacity-50"
                                        />
                                    </div>
                                    <p className="text-xs text-[#8f6a38] mt-1">Must be 10 digits</p>
                                </motion.div>

                                {/* Email */}
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <label className="block text-sm font-semibold text-[#0b1120] mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com"
                                        disabled={formState === 'loading'}
                                        className="w-full px-4 py-3 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 transition disabled:opacity-50"
                                    />
                                </motion.div>

                                {/* Message */}
                                <motion.div
                                    className="mb-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <label className="block text-sm font-semibold text-[#0b1120] mb-2">
                                        Message (Optional)
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Any questions or requirements?"
                                        rows={3}
                                        disabled={formState === 'loading'}
                                        className="w-full px-4 py-3 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 transition resize-none disabled:opacity-50"
                                    />
                                </motion.div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={formState === 'loading'}
                                    whileHover={{ scale: formState === 'loading' ? 1 : 1.02 }}
                                    whileTap={{ scale: formState === 'loading' ? 1 : 0.98 }}
                                    className="w-full py-4 bg-gradient-to-r from-[#e3be86] to-[#b8894a] text-[#0b1120] font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {formState === 'loading' ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                                <Loader size={18} />
                                            </motion.div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Inquiry'
                                    )}
                                </motion.button>

                                {/* Terms */}
                                <p className="text-xs text-[#8f6a38] text-center mt-4">
                                    We respect your privacy. Your data will only be used for property inquiries.
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}