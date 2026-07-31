'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Loader, Trash2 } from 'lucide-react';

interface AdminUploadProps {
    plotNumber: number;
    onUploadSuccess?: (media: any) => void;
    existingMedia?: Array<{ id: string; media_type: 'photo' | 'video'; file_url: string; file_name: string }>;
    onMediaDelete?: (mediaId: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function AdminUpload({
    plotNumber,
    onUploadSuccess,
    existingMedia = [],
    onMediaDelete,
}: AdminUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [selectedMediaType, setSelectedMediaType] = useState<'photo' | 'video'>('photo');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        const file = files[0];
        if (!file) return;

        // Validate file
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            setErrorMessage('File size must be less than 50MB');
            setUploadState('error');
            return;
        }

        const validPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

        const isValidPhoto = validPhotoTypes.includes(file.type);
        const isValidVideo = validVideoTypes.includes(file.type);

        if (!isValidPhoto && !isValidVideo) {
            setErrorMessage('Please upload a valid photo or video file');
            setUploadState('error');
            return;
        }

        const mediaType = isValidPhoto ? 'photo' : 'video';
        setSelectedMediaType(mediaType);

        // Upload file
        await uploadFile(file, mediaType);
    };

    const uploadFile = async (file: File, mediaType: 'photo' | 'video') => {
        setUploadState('uploading');
        setErrorMessage('');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('plotId', plotNumber.toString());
            formData.append('mediaType', mediaType);

            const xhr = new XMLHttpRequest();

            // Progress tracking
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', async () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    setUploadState('success');
                    setSuccessMessage(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully!`);

                    // Reset form
                    setTimeout(() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                        setUploadProgress(0);
                        setUploadState('idle');
                        setSuccessMessage('');

                        if (onUploadSuccess) {
                            onUploadSuccess(response);
                        }
                    }, 2000);
                } else {
                    throw new Error('Upload failed');
                }
            });

            xhr.addEventListener('error', () => {
                setUploadState('error');
                setErrorMessage('Failed to upload file. Please try again.');
            });

            xhr.open('POST', '/api/media');
            xhr.send(formData);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadState('error');
            setErrorMessage('An error occurred during upload. Please try again.');
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Upload Area */}
            <motion.div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${dragActive
                        ? 'border-[#b8894a] bg-[#e3be86] bg-opacity-10'
                        : 'border-[#b8894a] border-opacity-30 bg-[#f5f1e6]'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                whileHover={{ borderColor: '#b8894a' }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleChange}
                    className="hidden"
                    disabled={uploadState === 'uploading'}
                />

                <AnimatePresence mode="wait">
                    {uploadState === 'uploading' ? (
                        <motion.div
                            key="uploading"
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-flex p-4 bg-[#b8894a] bg-opacity-20 rounded-full mb-4"
                            >
                                <Loader size={32} className="text-[#b8894a]" />
                            </motion.div>
                            <p className="text-[#0b1120] font-semibold mb-2">Uploading...</p>
                            <div className="w-64 h-2 bg-[#b8894a] bg-opacity-20 rounded-full mx-auto overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#b8894a] to-[#e3be86]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-sm text-[#8f6a38] mt-2">{Math.round(uploadProgress)}%</p>
                        </motion.div>
                    ) : uploadState === 'success' ? (
                        <motion.div
                            key="success"
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <motion.div
                                animate={{ scale: [0.8, 1.1, 1] }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex p-4 bg-[#4b5c42] bg-opacity-20 rounded-full mb-4"
                            >
                                <Check size={32} className="text-[#4b5c42]" />
                            </motion.div>
                            <p className="text-[#0b1120] font-semibold mb-2">{successMessage}</p>
                        </motion.div>
                    ) : uploadState === 'error' ? (
                        <motion.div
                            key="error"
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
                                <AlertCircle size={32} className="text-red-600" />
                            </div>
                            <p className="text-red-600 font-semibold mb-2">Upload Failed</p>
                            <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setUploadState('idle')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Try Again
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            className="text-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="inline-flex p-4 bg-[#b8894a] bg-opacity-20 rounded-full mb-4">
                                <Upload size={32} className="text-[#b8894a]" />
                            </div>
                            <p className="text-[#0b1120] font-semibold mb-1">Drag & drop your file here</p>
                            <p className="text-sm text-[#8f6a38]">or click to browse (Max 50MB)</p>
                            <p className="text-xs text-[#b8894a] mt-3">Supports JPG, PNG, MP4, and more</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Existing Media */}
            {existingMedia.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    <h3 className="text-lg font-bold text-[#0b1120] font-display">
                        Uploaded Media ({existingMedia.length})
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {existingMedia.map((media, index) => (
                            <motion.div
                                key={media.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative bg-[#f5f1e6] rounded-lg overflow-hidden border border-[#b8894a] border-opacity-20 aspect-square"
                            >
                                {media.media_type === 'photo' ? (
                                    <img
                                        src={media.file_url}
                                        alt={media.file_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#0b1120] flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-2xl mb-2">🎬</p>
                                            <p className="text-xs text-[#b8894a]">Video</p>
                                        </div>
                                    </div>
                                )}

                                {/* Delete Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (onMediaDelete) {
                                            onMediaDelete(media.id);
                                        }
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                                    title="Delete media"
                                >
                                    <Trash2 size={16} />
                                </motion.button>

                                {/* Type Badge */}
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 rounded text-xs text-white font-bold">
                                    {media.media_type === 'photo' ? '📷 Photo' : '🎬 Video'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-[#e3be86] bg-opacity-10 border border-[#b8894a] border-opacity-20 rounded-lg"
            >
                <h4 className="font-bold text-[#0b1120] mb-2 text-sm">📸 Upload Tips</h4>
                <ul className="text-xs text-[#57544c] space-y-1">
                    <li>• Upload 2-3 high-quality photos per plot</li>
                    <li>• Videos should be under 50MB</li>
                    <li>• Supported formats: JPG, PNG, MP4</li>
                    <li>• Photos appear in the user interface immediately</li>
                </ul>
            </motion.div>
        </div>
    );
}