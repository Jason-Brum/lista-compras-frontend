// src/context/ModalContext.jsx
import React, { createContext, useContext, useState, useRef } from 'react';
import { useTheme } from './ThemeContext'; // <-- Importe useTheme diretamente aqui

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        type: 'alert', // 'alert' | 'confirm'
        onConfirm: () => {},
        onCancel: () => {},
    });

    const resolveRef = useRef(null);
    const rejectRef = useRef(null);

    const showAlert = (message) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                message,
                type: 'alert',
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {},
            });
        });
    };

    const showConfirm = (message) => {
        return new Promise((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject; 

            setModalState({
                isOpen: true,
                message,
                type: 'confirm',
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    if (resolveRef.current) resolveRef.current(true);
                },
                onCancel: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                    if (resolveRef.current) resolveRef.current(false);
                },
            });
        });
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {modalState.isOpen && (
                <CustomModal
                    message={modalState.message}
                    type={modalState.type}
                    onConfirm={modalState.onConfirm}
                    onCancel={modalState.onCancel}
                />
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    return useContext(ModalContext);
};

// Componente do Modal Customizado
const CustomModal = ({ message, type, onConfirm, onCancel }) => {
    // AQUI ESTÁ A CORREÇÃO: Pegar o tema diretamente do useTheme()
    const { theme, themes } = useTheme(); 

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
                 style={{ backgroundColor: themes[theme].primaryColor, color: themes[theme].textColor, borderColor: themes[theme].accentColor, borderWidth: '1px' }}>
                <p className="text-center mb-4 text-lg">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-md font-medium"
                        style={{ backgroundColor: themes[theme].accentColor, color: themes[theme].textColor }}
                    >
                        OK
                    </button>
                    {type === 'confirm' && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 rounded-md font-medium border"
                            style={{ backgroundColor: 'transparent', color: themes[theme].textColor, borderColor: themes[theme].accentColor }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};