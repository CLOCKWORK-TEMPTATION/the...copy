export interface LineItem {
    code: string;
    description: string;
    amount: number;
    unit: string;
    rate: number;
    total: number;
    notes?: string;
    lastModified?: string;
}

export interface Category {
    code: string;
    name: string;
    items: LineItem[];
    total: number;
    description?: string;
}

export interface Section {
    id: string;
    name: string;
    categories: Category[];
    total: number;
    description?: string;
    color?: string;
}

export interface Budget {
    sections: Section[];
    grandTotal: number;
    currency: string;
    metadata?: {
        title?: string;
        director?: string;
        producer?: string;
        productionCompany?: string;
        shootingDays?: number;
        locations?: string[];
        genre?: string;
    };
}

export interface SecurityRisk {
    bondFee: { percent: number; total: number };
    contingency: { percent: number; total: number };
    credits: { percent: number; total: number };
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'calculating' | 'complete' | 'error';

export interface SavedBudget {
    id: string;
    name: string;
    budget: Budget;
    script: string;
    date: string;
    thumbnail?: string;
    tags?: string[];
}

export interface BudgetTemplate {
    id: string;
    name: string;
    description: string;
    budget: Budget;
    icon: string;
    category: 'feature' | 'short' | 'documentary' | 'commercial' | 'music-video';
}

export interface ChartData {
    name: string;
    value: number;
    percentage?: string;
    color?: string;
}

export interface ExportOptions {
    format: 'csv' | 'pdf' | 'json' | 'excel';
    includeZeroValues: boolean;
    includeDetails: boolean;
    includeCharts: boolean;
}

export interface UserPreferences {
    language: 'en' | 'ar' | 'es' | 'fr';
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    dateFormat: string;
    notifications: boolean;
    autoSave: boolean;
}

export interface ComparisonData {
    budget1: SavedBudget;
    budget2: SavedBudget;
    differences: {
        section: string;
        category: string;
        difference: number;
        percentage: number;
    }[];
}

export interface AnalyticsData {
    totalBudgets: number;
    averageBudget: number;
    mostExpensiveCategory: string;
    costPerShootingDay: number;
    budgetEfficiency: number;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
}

export interface AIAnalysis {
    summary: string;
    recommendations: string[];
    riskFactors: string[];
    costOptimization: string[];
    shootingSchedule: {
        totalDays: number;
        phases: {
            preProduction: number;
            production: number;
            postProduction: number;
        };
    };
}
