"use client";

import React from "react";
import {
    Info,
    Undo,
    Redo,
    Save,
    FileDown,
    History,
    MessageSquare,
    Lightbulb,
    Stethoscope,
    Download,
    Mic,
} from "lucide-react";

interface MainHeaderProps {
    onInfo?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onSave?: () => void;
    onFileDownload?: () => void;
    onHistory?: () => void;
    onComment?: () => void;
    onTips?: () => void;
    onMedicalServices?: () => void;
    onDownload?: () => void;
    onMic?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

const MainHeader: React.FC<MainHeaderProps> = ({
    onInfo,
    onUndo,
    onRedo,
    onSave,
    onFileDownload,
    onHistory,
    onComment,
    onTips,
    onMedicalServices,
    onDownload,
    onMic,
    canUndo = false,
    canRedo = false,
}) => {
    return (
        <div className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
            {/* Left Section: Info and Undo/Redo */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onInfo}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="معلومات"
                >
                    <Info size={20} />
                </button>

                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" role="separator" />

                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`rounded p-1 transition-colors ${canUndo
                        ? "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        : "cursor-not-allowed text-gray-300 dark:text-gray-600"
                        }`}
                    title="تراجع"
                >
                    <Undo size={20} />
                </button>

                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={`rounded p-1 transition-colors ${canRedo
                        ? "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        : "cursor-not-allowed text-gray-300 dark:text-gray-600"
                        }`}
                    title="إعادة"
                >
                    <Redo size={20} />
                </button>

                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" role="separator" />
            </div>

            {/* Middle Section: Navigation Items */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onSave}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="حفظ"
                >
                    <Save size={20} />
                </button>
                <button
                    onClick={onFileDownload}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="تنزيل الملف"
                >
                    <FileDown size={20} />
                </button>
                <button
                    onClick={onHistory}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="السجل"
                >
                    <History size={20} />
                </button>
                <button
                    onClick={onComment}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="تعليق"
                >
                    <MessageSquare size={19} className="mt-[2px]" />
                </button>

                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" role="separator" />

                <button
                    onClick={onTips}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="نصائح وتحديثات"
                >
                    <Lightbulb size={20} />
                </button>
                <button
                    onClick={onMedicalServices}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="تشخيص النص"
                >
                    <Stethoscope size={19} />
                </button>
            </div>

            {/* Right Section: Extras */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onDownload}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="تنزيل"
                >
                    <Download size={19} />
                </button>
                <button
                    onClick={onMic}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    title="ميكروفون"
                >
                    <Mic size={19} />
                </button>
            </div>
        </div>
    );
};

export default MainHeader;
