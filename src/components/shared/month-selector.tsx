'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
    value: string; // Format: YYYY-MM
    onChange: (monthKey: string) => void;
    className?: string;
}

/**
 * Month selector component for navigating time-based data
 * Returns monthKey in format YYYY-MM for use with time-indexed queries
 */
export function MonthSelector({ value, onChange, className = '' }: MonthSelectorProps) {
    const currentDate = value ? new Date(`${value}-01`) : new Date();

    const handlePrevMonth = () => {
        const prevMonth = subMonths(currentDate, 1);
        onChange(format(prevMonth, 'yyyy-MM'));
    };

    const handleNextMonth = () => {
        const nextMonth = addMonths(currentDate, 1);
        onChange(format(nextMonth, 'yyyy-MM'));
    };

    const handleToday = () => {
        onChange(format(new Date(), 'yyyy-MM'));
    };

    const displayMonth = format(currentDate, 'MMMM yyyy');
    const isCurrentMonth = value === format(new Date(), 'yyyy-MM');

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 min-w-[160px] justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{displayMonth}</span>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {!isCurrentMonth && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToday}
                    className="h-8"
                >
                    Today
                </Button>
            )}
        </div>
    );
}
