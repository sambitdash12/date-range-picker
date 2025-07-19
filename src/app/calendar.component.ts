import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface DayData {
  date: Date;
  count: number;
  isSelected?: boolean;
  isInRange?: boolean;
  isStartDate?: boolean;
  isEndDate?: boolean;
  isDisabled?: boolean;
}

interface MonthData {
  year: number;
  month: number;
  monthName: string;
  days: DayData[];
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class DateRangePickerComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  dayHeaderList = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  visibleMonths: MonthData[] = [];
  currentDate = new Date();
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  errorMessage = '';
  rangeError = false;
  maxRange= 2 ; // Maximum range in months
  minRange = 0; // Minimum range in months

  ngOnInit() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    this.selectedStartDate = today;
    this.selectedEndDate = null;
    this.range.patchValue({ start: today, end: null });
  
    this.setStartingMonthAndUpdateView(today);
  
    this.range.valueChanges.subscribe(value => {
      if (value.start) {
        this.selectedStartDate = value.start;
        this.selectedEndDate = value.end || null;
        this.setStartingMonthAndUpdateView(value.start);
      }
      this.updateCalendarSelection();
    });
  }

  getVisibleMonths() {
    this.visibleMonths = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + i, 1);
      const monthData = this.generateMonthData(date);
      this.visibleMonths.push(monthData);
    }
  }

  generateMonthData(date: Date): MonthData {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
  
    const days: DayData[] = [];
    const currentDate = new Date(startDate);
  
    const today = new Date();
    today.setHours(0,0,0,0);
  
    for (let i = 0; i < 35; i++) {
      const dayDate = new Date(currentDate);
      // Disable if before today and belongs to the current displayed month
      const isInMonth = dayDate.getMonth() === month;
      const isDisabled = isInMonth && dayDate < today;
      days.push({
        date: dayDate,
        count: 0,
        isDisabled
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return {
      year,
      month,
      monthName,
      days
    };
  }
  

  generateMockData() {
    this.visibleMonths.forEach(month => {
      month.days.forEach(day => {
        if (
          day.date &&
          day.date.getMonth() === month.month &&
          !day.isDisabled
        ) {
          day.count = Math.floor(Math.random() * 1500) + 1000;
        } else {
          day.count = 0;
        }
      });
    });
  }

  handleDateSelection(day: DayData) {
    if (
      !day.date ||
      day.date.getMonth() !== this.getMonthForDay(day) ||
      day.isDisabled // Don't allow selecting disabled days
    ) return;
  
    const {min, max} = this.getDateRange();
  
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      this.selectedStartDate = day.date;
      this.selectedEndDate = null;
      this.range.patchValue({ start: day.date, end: null });
    } else if (this.selectedStartDate && !this.selectedEndDate) {
      let tentativeStart = this.selectedStartDate;
      let tentativeEnd = day.date;
      if (tentativeEnd < tentativeStart) {
        [tentativeStart, tentativeEnd] = [tentativeEnd, tentativeStart];
      }
      // Check if out of range and set Error
      this.isInRangeOfRequiredMonths(tentativeStart, tentativeEnd);
      this.selectedStartDate = tentativeStart;
      this.selectedEndDate = tentativeEnd;
      this.range.patchValue({ start: tentativeStart, end: tentativeEnd });
    }
    this.updateCalendarSelection();
  }
  

  getMonthForDay(day: DayData): number {
    for (const month of this.visibleMonths) {
      if (month.days.includes(day)) {
        return month.month;
      }
    }
    return -1;
  }
// Get Previous Month
  getPreviousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.getVisibleMonths();
    this.generateMockData();
    this.updateCalendarSelection();
  }

  // Get Next Month
  getNextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.getVisibleMonths();
    this.generateMockData();
    this.updateCalendarSelection();
  }

  updateCalendarSelection() {
    this.visibleMonths.forEach(month => {
      month.days.forEach(day => {
        if (!day.date) return;

        day.isSelected = false;
        day.isInRange = false;
        day.isStartDate = false;
        day.isEndDate = false;

        if (this.selectedStartDate && this.isSameDay(day.date, this.selectedStartDate)) {
          day.isStartDate = true;
          day.isSelected = true;
        }

        if (this.selectedEndDate && this.isSameDay(day.date, this.selectedEndDate)) {
          day.isEndDate = true;
          day.isSelected = true;
        }

        if (this.selectedStartDate && this.selectedEndDate) {
          if (day.date > this.selectedStartDate && day.date < this.selectedEndDate) {
            day.isInRange = true;
          }
        }
      });
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getMonthYearDisplay(): string {
    const firstMonth = this.visibleMonths[0];
    const lastMonth = this.visibleMonths[this.visibleMonths.length - 1];
    
    if (firstMonth.year === lastMonth.year) {
      return `${firstMonth.monthName} - ${lastMonth.monthName} ${firstMonth.year}`;
    } else {
      return `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
    }
  }

  getDateRange(): { min: Date, max: Date } {
    const firstMonth = this.visibleMonths[0];
    const lastMonth = this.visibleMonths[this.visibleMonths.length - 1];
    const min = new Date(firstMonth.year, firstMonth.month, 1);
    const lastDay = new Date(lastMonth.year, lastMonth.month + 1, 0);
    const max = lastDay;
    return { min, max };
  }

  isCurrentMonth(): boolean {
    const today = new Date();
    return (
      this.currentDate.getFullYear() === today.getFullYear() &&
      this.currentDate.getMonth() === today.getMonth()
    );
  }

  setStartingMonthAndUpdateView(startDate: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const baseYear = today.getFullYear();
    const baseMonth = today.getMonth();
    let newBase: Date;
    if (
      startDate.getFullYear() < baseYear ||
      (startDate.getFullYear() === baseYear && startDate.getMonth() < baseMonth)
    ) {
      newBase = new Date(baseYear, baseMonth, 1); // Never before current month
    } else {
      newBase = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }
    this.currentDate = newBase;
    this.getVisibleMonths(); 
    this.generateMockData();  
    this.updateCalendarSelection();
  }

  isInRangeOfRequiredMonths(start: Date, end: Date): void {
    let startYear = start.getFullYear();
    let startMonth = start.getMonth();
    let endYear = end.getFullYear();
    let endMonth = end.getMonth();
  
    if (start > end) {
      [startYear, startMonth, endYear, endMonth] = [endYear, endMonth, startYear, startMonth];
    }
  
    let diff = (endYear - startYear) * 12 + (endMonth - startMonth);
    if(diff > this.maxRange || diff < this.minRange){
      this.errorMessage = `You can only select a date range between ${this.minRange} and ${this.maxRange} months.`;
      this.rangeError = true;
      this.selectedStartDate = null;
      this.selectedEndDate = null;
      this.range.patchValue({ start: null, end: null });
      this.updateCalendarSelection();
    }else{
      this.errorMessage = '';
      this.rangeError = false;
    }
  }
}
