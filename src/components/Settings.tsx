import React, { useState, useEffect } from 'react';
import { storageUtils } from '../utils/storage';
import { initializeApiClient } from '../../services/gemini';

interface SettingsProps {
    isOpen: boolean;
    onApiKeyUpdate: (apiKey: string) => void;
    onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onApiKeyUpdate, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    // Load existing API key on component mount
    useEffect(() => {
        if (isOpen) {
            const existingApiKey = storageUtils.getApiKey();
            if (existingApiKey) {
                setApiKey(existingApiKey);
                setValidationResult('valid');
            }
        }
    }, [isOpen]);

    // Validate API key format
    const validateApiKeyFormat = (key: string): boolean => {
        // Gemini API key should start with "AIza" and be 39 characters long
        return key.startsWith('AIza') && key.length === 39;
    };

    // Test API key by making a simple request
    const validateApiKey = async (key: string): Promise<boolean> => {
        if (!validateApiKeyFormat(key)) {
            setValidationResult('invalid');
            return false;
        }

        setIsValidating(true);
        try {
            await initializeApiClient(key);
            setValidationResult('valid');
            return true;
        } catch (error) {
            console.error('API key validation failed:', error);
            setValidationResult('invalid');
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        setValidationResult(null);
    };

    const handleSaveApiKey = async () => {
        if (!apiKey.trim()) return;

        const isValid = await validateApiKey(apiKey.trim());

        if (isValid) {
            storageUtils.setApiKey(apiKey.trim());
            onApiKeyUpdate(apiKey.trim());
            onClose();
        }
    };

    const handleClearApiKey = () => {
        storageUtils.removeApiKey();
        setApiKey('');
        setValidationResult(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-mutsumi-surface/90 backdrop-blur-xl border border-mutsumi-border/30 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-mutsumi-border/20">
                    <h2 className="text-xl font-serif text-mutsumi-text font-semibold">设置</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-mutsumi-dim hover:text-mutsumi-text hover:bg-mutsumi-surface/50 transition-all"
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-serif text-mutsumi-text font-medium">Gemini API Key</h3>
                            {validationResult === 'valid' && <span className="text-xs text-mutsumi-glow">已连接</span>}
                            {validationResult === 'invalid' && <span className="text-xs text-red-400">无效</span>}
                        </div>

                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                placeholder="输入您的Gemini API Key"
                                className="w-full px-4 py-3 rounded-xl"
                                disabled={isValidating}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showApiKey ? '隐藏' : '显示'}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleSaveApiKey}>保存</button>
                            {apiKey && <button onClick={handleClearApiKey}>清除</button>}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-mutsumi-border/20">
                    <button onClick={onClose} className="w-full py-2">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
