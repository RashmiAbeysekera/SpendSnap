/**
 * SpendSnap - Student Weekly Budget & Expense Tracker
 * Embedded Single-Page Application logic
 */

(function () {
  'use strict';

  // API Endpoints
  const API_EXPENSES = '/api/expenses';
  const API_INCOMES = '/api/incomes';
  const API_WEEKLY_BUDGET = '/api/budgets/weekly';

  // Application State
  const state = {
    // Current focused periods
    selectedMonth: new Date(),
    selectedWeekDate: new Date(), // Any date in the selected week (Mon-Sun)
    activePeriod: 'month',        // 'week' | 'month' | 'all' | 'custom'

    // Data stores
    expenses: [],           // Current list filtered for table
    weeklyExpenses: [],     // Expenses for the selected week
    weeklyIncomes: [],      // Incomes for the selected week
    weeklyAllowance: 5000,  // Stored weekly allowance (defaults to Rs. 5,000)

    // UI state
    isLoading: false,
    editingExpenseId: null,
    deletingExpenseId: null,
  };

  // Color palette for Categories in Charts & Badges
  const CATEGORY_COLORS = {
    'Food & Canteen': '#E65100',
    'Food & Dining': '#E65100',
    'Groceries': '#2E7D32',
    'Transport & Bus': '#0288D1',
    'Transport': '#0288D1',
    'Education & Prints': '#7B1FA2',
    'Utilities & Data': '#00796B',
    'Utilities': '#00796B',
    'Entertainment': '#F57F17',
    'Personal Care': '#5D4037',
    'Personal': '#5D4037',
    'Shopping': '#C2185B',
    'Other': '#78909C',
  };

  // DOM Elements
  const el = {
    // Header & Actions
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    openAddIncomeBtn: document.getElementById('openAddIncomeBtn'),

    // Week Navigation & Budget Metrics
    prevWeekBtn: document.getElementById('prevWeekBtn'),
    nextWeekBtn: document.getElementById('nextWeekBtn'),
    selectedWeekRange: document.getElementById('selectedWeekRange'),
    weekIsCurrentBadge: document.getElementById('weekIsCurrentBadge'),
    jumpCurrentWeekBtn: document.getElementById('jumpCurrentWeekBtn'),
    weekAllowanceVal: document.getElementById('weekAllowanceVal'),
    editAllowanceBtn: document.getElementById('editAllowanceBtn'),
    weekIncomeVal: document.getElementById('weekIncomeVal'),
    weekIncomeMeta: document.getElementById('weekIncomeMeta'),
    incomeCountBadge: document.getElementById('incomeCountBadge'),
    viewIncomesBtn: document.getElementById('viewIncomesBtn'),
    weekExpensesVal: document.getElementById('weekExpensesVal'),
    weekExpenseCountMeta: document.getElementById('weekExpenseCountMeta'),
    weekBalanceVal: document.getElementById('weekBalanceVal'),
    balanceCard: document.getElementById('balanceCard'),
    balanceStatusBadge: document.getElementById('balanceStatusBadge'),
    budgetProgressBar: document.getElementById('budgetProgressBar'),
    budgetProgressFill: document.getElementById('budgetProgressFill'),
    budgetProgressLabel: document.getElementById('budgetProgressLabel'),
    budgetRemainingLabel: document.getElementById('budgetRemainingLabel'),
    studentBudgetText: document.getElementById('studentBudgetText'),

    // Chart
    chartWeekLabel: document.getElementById('chartWeekLabel'),
    chartEmptyState: document.getElementById('chartEmptyState'),
    chartDataContainer: document.getElementById('chartDataContainer'),
    pieChartSvg: document.getElementById('pieChartSvg'),
    chartCenterTotal: document.getElementById('chartCenterTotal'),
    chartLegendContainer: document.getElementById('chartLegendContainer'),

    // Month Navigation & Metrics
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    selectedMonthName: document.getElementById('selectedMonthName'),
    jumpCurrentMonthBtn: document.getElementById('jumpCurrentMonthBtn'),
    monthTotalSpent: document.getElementById('monthTotalSpent'),
    monthAverageDaily: document.getElementById('monthAverageDaily'),
    monthTransactionCount: document.getElementById('monthTransactionCount'),
    monthActiveDays: document.getElementById('monthActiveDays'),
    monthTopCategory: document.getElementById('monthTopCategory'),
    monthTopCategoryAmount: document.getElementById('monthTopCategoryAmount'),
    monthBadge: document.getElementById('monthBadge'),

    // Filter Controls
    searchQuery: document.getElementById('searchQuery'),
    filterCategory: document.getElementById('filterCategory'),
    filterStartDate: document.getElementById('filterStartDate'),
    filterEndDate: document.getElementById('filterEndDate'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    resultsCount: document.getElementById('resultsCount'),
    periodChips: document.querySelectorAll('.chip[data-period]'),

    // Table States
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),
    errorState: document.getElementById('errorState'),
    errorMessageText: document.getElementById('errorMessageText'),
    retryBtn: document.getElementById('retryBtn'),
    tableWrapper: document.getElementById('tableWrapper'),
    expensesTableBody: document.getElementById('expensesTableBody'),

    // Add / Edit Expense Modal
    expenseModal: document.getElementById('expenseModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    expenseForm: document.getElementById('expenseForm'),
    expenseIdInput: document.getElementById('expenseId'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseDate: document.getElementById('expenseDate'),
    expenseNote: document.getElementById('expenseNote'),
    saveExpenseBtn: document.getElementById('saveExpenseBtn'),
    saveBtnSpinner: document.getElementById('saveBtnSpinner'),
    saveBtnText: document.getElementById('saveBtnText'),
    formAlertBox: document.getElementById('formAlertBox'),
    amountError: document.getElementById('amountError'),
    categoryError: document.getElementById('categoryError'),
    dateError: document.getElementById('dateError'),
    noteError: document.getElementById('noteError'),

    // Edit Allowance Modal
    allowanceModal: document.getElementById('allowanceModal'),
    closeAllowanceModalBtn: document.getElementById('closeAllowanceModalBtn'),
    cancelAllowanceBtn: document.getElementById('cancelAllowanceBtn'),
    allowanceForm: document.getElementById('allowanceForm'),
    allowanceWeekLabel: document.getElementById('allowanceWeekLabel'),
    allowanceInput: document.getElementById('allowanceInput'),
    allowanceError: document.getElementById('allowanceError'),
    allowanceBtnSpinner: document.getElementById('allowanceBtnSpinner'),

    // Add Income Modal
    incomeModal: document.getElementById('incomeModal'),
    closeIncomeModalBtn: document.getElementById('closeIncomeModalBtn'),
    cancelIncomeBtn: document.getElementById('cancelIncomeBtn'),
    incomeForm: document.getElementById('incomeForm'),
    incomeFormAlert: document.getElementById('incomeFormAlert'),
    incomeAmount: document.getElementById('incomeAmount'),
    incomeDate: document.getElementById('incomeDate'),
    incomeSource: document.getElementById('incomeSource'),
    incomeAmountError: document.getElementById('incomeAmountError'),
    incomeDateError: document.getElementById('incomeDateError'),
    saveIncomeSpinner: document.getElementById('saveIncomeSpinner'),

    // View Incomes Modal
    incomesListModal: document.getElementById('incomesListModal'),
    incomesListSubtitle: document.getElementById('incomesListSubtitle'),
    closeIncomesListBtn: document.getElementById('closeIncomesListBtn'),
    closeIncomesListFooterBtn: document.getElementById('closeIncomesListFooterBtn'),
    incomesListAddMoreBtn: document.getElementById('incomesListAddMoreBtn'),
    incomesListEmpty: document.getElementById('incomesListEmpty'),
    incomesListContainer: document.getElementById('incomesListContainer'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    deleteBtnSpinner: document.getElementById('deleteBtnSpinner'),
    deleteBtnText: document.getElementById('deleteBtnText'),
    deletePreviewCategory: document.getElementById('deletePreviewCategory'),
    deletePreviewAmount: document.getElementById('deletePreviewAmount'),
    deletePreviewDate: document.getElementById('deletePreviewDate'),

    // Calculator Elements
    calcDisplay: document.getElementById('calcDisplay'),
    calcExpression: document.getElementById('calcExpression'),
    calcClearHistoryBtn: document.getElementById('calcClearHistoryBtn'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),
  };

  // =========================================================================
  // Formatting & Date Utilities
  // =========================================================================

  /**
   * Currency formatter for Sri Lankan Rupees (Rs.)
   */
  function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Rs. 0.00';
    return (
      'Rs. ' +
      num.toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, monthIndex, day));
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(d);
    }
    return dateStr;
  }

  function getTodayString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function toIsoDate(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Calculates Monday (00:00) and Sunday (23:59:59) for any given Date object.
   */
  function getMondayAndSunday(d) {
    const date = new Date(d);
    const day = date.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      monday,
      sunday,
      startStr: toIsoDate(monday),
      endStr: toIsoDate(sunday),
    };
  }

  function getMonthDateRange(dateObj) {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const lastDay = new Date(Date.UTC(y, m + 1, 0));

    const startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(
      lastDay.getUTCDate()
    ).padStart(2, '0')}`;
    return { startStr, endStr };
  }

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function getCategoryClass(category) {
    if (!category) return 'cat-other';
    const cat = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (cat.includes('canteen') || cat.includes('food') || cat.includes('din')) return 'cat-food-canteen';
    if (cat.includes('grocer')) return 'cat-groceries';
    if (cat.includes('bus') || cat.includes('transp')) return 'cat-transport-bus';
    if (cat.includes('print') || cat.includes('edu') || cat.includes('book')) return 'cat-education-prints';
    if (cat.includes('data') || cat.includes('util') || cat.includes('bill')) return 'cat-utilities-data';
    if (cat.includes('shop')) return 'cat-shopping';
    if (cat.includes('entertain') || cat.includes('movie')) return 'cat-entertainment';
    if (cat.includes('person')) return 'cat-personal-care';
    return 'cat-other';
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success)"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--danger)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--maroon-700)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHtml(message)}</span>
    `;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // API Calls
  // =========================================================================

  async function apiGetExpenses(params = {}) {
    const url = new URL(API_EXPENSES, window.location.origin);
    if (params.category) url.searchParams.set('category', params.category);
    if (params.startDate) url.searchParams.set('startDate', params.startDate);
    if (params.endDate) url.searchParams.set('endDate', params.endDate);

    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error((await parseError(res)).message || 'Failed to fetch expenses');
    return await res.json();
  }

  async function apiCreateExpense(data) {
    const res = await fetch(API_EXPENSES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await parseError(res);
      const e = new Error(err.message || 'Failed to create expense');
      e.validationErrors = err.validationErrors;
      throw e;
    }
    return await res.json();
  }

  async function apiUpdateExpense(id, data) {
    const res = await fetch(`${API_EXPENSES}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await parseError(res);
      const e = new Error(err.message || 'Failed to update expense');
      e.validationErrors = err.validationErrors;
      throw e;
    }
    return await res.json();
  }

  async function apiDeleteExpense(id) {
    const res = await fetch(`${API_EXPENSES}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error((await parseError(res)).message || 'Failed to delete expense');
  }

  // Weekly Budget API
  async function apiGetWeeklyBudget(weekStartDate) {
    const url = new URL(API_WEEKLY_BUDGET, window.location.origin);
    url.searchParams.set('weekStartDate', weekStartDate);
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error((await parseError(res)).message || 'Failed to fetch weekly budget');
    return await res.json();
  }

  async function apiSetWeeklyBudget(weekStartDate, allowance) {
    const res = await fetch(API_WEEKLY_BUDGET, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ weekStartDate, allowance }),
    });
    if (!res.ok) throw new Error((await parseError(res)).message || 'Failed to update allowance');
    return await res.json();
  }

  // Income API
  async function apiGetIncomes(startDate, endDate) {
    const url = new URL(API_INCOMES, window.location.origin);
    if (startDate) url.searchParams.set('startDate', startDate);
    if (endDate) url.searchParams.set('endDate', endDate);
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error((await parseError(res)).message || 'Failed to fetch incomes');
    return await res.json();
  }

  async function apiCreateIncome(data) {
    const res = await fetch(API_INCOMES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await parseError(res);
      const e = new Error(err.message || 'Failed to record income');
      e.validationErrors = err.validationErrors;
      throw e;
    }
    return await res.json();
  }

  async function apiDeleteIncome(id) {
    const res = await fetch(`${API_INCOMES}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error((await parseError(res)).message || 'Failed to delete income');
  }

  async function parseError(response) {
    try {
      return await response.json();
    } catch {
      return { message: `Request failed (${response.status})` };
    }
  }

  // =========================================================================
  // Main Data Load & Synchronization
  // =========================================================================

  async function loadData() {
    state.isLoading = true;
    showLoading();

    try {
      // 1. Fetch Weekly Budget & Extra Income for active week
      const week = getMondayAndSunday(state.selectedWeekDate);
      const [budgetRes, weekIncomes, weekExpenses] = await Promise.all([
        apiGetWeeklyBudget(week.startStr),
        apiGetIncomes(week.startStr, week.endStr),
        apiGetExpenses({ startDate: week.startStr, endDate: week.endStr }),
      ]);

      state.weeklyAllowance = parseFloat(budgetRes.allowance) || 5000;
      state.weeklyIncomes = weekIncomes;
      state.weeklyExpenses = weekExpenses;

      // Update Weekly Dashboard & Pie Chart
      updateWeeklyDashboard(week);
      renderWeeklyPieChart();

      // 2. Fetch Monthly Expenses for the monthly stats
      const monthRange = getMonthDateRange(state.selectedMonth);
      const monthExpenses = await apiGetExpenses({
        startDate: monthRange.startStr,
        endDate: monthRange.endStr,
      });
      updateMonthlyStats(monthExpenses);

      // 3. Fetch expenses for the History Table based on active filter controls
      const tableFilterParams = {};
      const cat = el.filterCategory.value.trim();
      if (cat) tableFilterParams.category = cat;

      const startDate = el.filterStartDate.value;
      const endDate = el.filterEndDate.value;
      if (startDate) tableFilterParams.startDate = startDate;
      if (endDate) tableFilterParams.endDate = endDate;

      state.expenses = await apiGetExpenses(tableFilterParams);
      applyClientSearch();

      state.isLoading = false;
    } catch (err) {
      state.isLoading = false;
      showError(err.message);
    }
  }

  // =========================================================================
  // Weekly Budget Calculation & UI Updates
  // =========================================================================

  function updateWeeklyDashboard(week) {
    const now = new Date();
    const currentWeekMon = getMondayAndSunday(now).startStr;
    const isCurrentWeek = week.startStr === currentWeekMon;

    el.weekIsCurrentBadge.textContent = isCurrentWeek ? 'This Week' : 'Selected Week';
    el.selectedWeekRange.textContent = `${formatDate(week.startStr)} – ${formatDate(week.endStr)}`;
    el.chartWeekLabel.textContent = isCurrentWeek ? 'This Week' : 'Selected Week';

    // 1. Allowance
    el.weekAllowanceVal.textContent = formatCurrency(state.weeklyAllowance);

    // 2. Extra Income
    let totalIncome = 0;
    state.weeklyIncomes.forEach((inc) => {
      totalIncome += parseFloat(inc.amount) || 0;
    });
    el.weekIncomeVal.textContent = formatCurrency(totalIncome);
    el.incomeCountBadge.textContent = `${state.weeklyIncomes.length} ${state.weeklyIncomes.length === 1 ? 'entry' : 'entries'}`;

    // 3. Week Expenses
    let totalWeeklyExpenses = 0;
    state.weeklyExpenses.forEach((exp) => {
      totalWeeklyExpenses += parseFloat(exp.amount) || 0;
    });
    el.weekExpensesVal.textContent = formatCurrency(totalWeeklyExpenses);
    el.weekExpenseCountMeta.textContent = `${state.weeklyExpenses.length} ${state.weeklyExpenses.length === 1 ? 'expense' : 'expenses'} recorded`;

    // 4. Current Balance = Allowance + Extra Income - Expenses
    const totalFunds = state.weeklyAllowance + totalIncome;
    const balance = totalFunds - totalWeeklyExpenses;
    el.weekBalanceVal.textContent = formatCurrency(balance);

    // Balance Card Styling & Status
    el.balanceCard.classList.remove('balance-healthy', 'balance-warning', 'balance-overspent');
    el.balanceStatusBadge.classList.remove('badge-healthy', 'badge-warning', 'badge-danger');
    el.budgetProgressFill.classList.remove('fill-healthy', 'fill-warning', 'fill-overspent');

    let spentPct = totalFunds > 0 ? (totalWeeklyExpenses / totalFunds) * 100 : totalWeeklyExpenses > 0 ? 100 : 0;
    const clampedFillPct = Math.min(Math.max(spentPct, 0), 100);
    el.budgetProgressFill.style.width = `${clampedFillPct}%`;

    if (balance < 0) {
      // Overspent
      const overspentAmount = Math.abs(balance);
      el.balanceCard.classList.add('balance-overspent');
      el.balanceStatusBadge.classList.add('badge-danger');
      el.balanceStatusBadge.textContent = 'Overspent 🚨';
      el.budgetProgressFill.classList.add('fill-overspent');
      el.budgetProgressLabel.textContent = `Allowance Spent: ${spentPct.toFixed(0)}% (Over by ${formatCurrency(overspentAmount)})`;
      el.budgetRemainingLabel.textContent = `Negative Balance: -${formatCurrency(overspentAmount)}`;
      el.studentBudgetText.textContent = 'Budget alert: You have exceeded your weekly funds. Reduce non-essential spending!';
    } else if (totalFunds > 0 && spentPct >= 80) {
      // Low Budget (<20% remaining)
      el.balanceCard.classList.add('balance-warning');
      el.balanceStatusBadge.classList.add('badge-warning');
      el.balanceStatusBadge.textContent = 'Budget Low ⚠️';
      el.budgetProgressFill.classList.add('fill-warning');
      el.budgetProgressLabel.textContent = `Allowance Spent: ${spentPct.toFixed(0)}%`;
      el.budgetRemainingLabel.textContent = `${formatCurrency(balance)} Remaining`;
      el.studentBudgetText.textContent = 'Heads up! Under 20% of your funds remaining for this week. Plan meals carefully!';
    } else {
      // Healthy
      el.balanceCard.classList.add('balance-healthy');
      el.balanceStatusBadge.classList.add('badge-healthy');
      el.balanceStatusBadge.textContent = 'On Track 🎯';
      el.budgetProgressFill.classList.add('fill-healthy');
      el.budgetProgressLabel.textContent = totalFunds === 0 ? 'Allowance Spent: 0%' : `Allowance Spent: ${spentPct.toFixed(0)}%`;
      el.budgetRemainingLabel.textContent = `${formatCurrency(balance)} Remaining`;
      el.studentBudgetText.textContent = 'Great pacing! You are on track to stay comfortably within your weekly budget.';
    }
  }

  // =========================================================================
  // Lightweight Accessible Category Pie / Donut Chart (SVG)
  // =========================================================================

  function renderWeeklyPieChart() {
    const expenses = state.weeklyExpenses;

    if (!expenses || expenses.length === 0) {
      el.chartEmptyState.classList.remove('hidden');
      el.chartDataContainer.classList.add('hidden');
      return;
    }

    el.chartEmptyState.classList.add('hidden');
    el.chartDataContainer.classList.remove('hidden');

    // Aggregate category totals
    let total = 0;
    const catTotals = {};
    expenses.forEach((item) => {
      const amt = parseFloat(item.amount) || 0;
      total += amt;
      const cat = item.category || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + amt;
    });

    el.chartCenterTotal.textContent = formatCurrency(total);

    // Sort categories descending
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    // Build SVG Donut Slices
    // Center at (120, 120), Outer R = 90, Inner R = 55
    const cx = 120;
    const cy = 120;
    const rOuter = 95;
    const rInner = 60;

    let cumulativeAngle = 0;
    let svgPathsHtml = '';
    let legendHtml = '';

    sortedCats.forEach(([cat, amount]) => {
      const fraction = total > 0 ? amount / total : 0;
      const sliceAngle = fraction * 2 * Math.PI;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      const pctStr = (fraction * 100).toFixed(1) + '%';
      const color = CATEGORY_COLORS[cat] || '#8D6E63';

      // SVG Donut Path calculations
      const x1Outer = cx + rOuter * Math.cos(startAngle);
      const y1Outer = cy + rOuter * Math.sin(startAngle);
      const x2Outer = cx + rOuter * Math.cos(endAngle);
      const y2Outer = cy + rOuter * Math.sin(endAngle);

      const x1Inner = cx + rInner * Math.cos(endAngle);
      const y1Inner = cy + rInner * Math.sin(endAngle);
      const x2Inner = cx + rInner * Math.cos(startAngle);
      const y2Inner = cy + rInner * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      // Handle edge case of single slice (360 degrees)
      let dPath = '';
      if (sortedCats.length === 1 || fraction >= 0.999) {
        // Draw two halves to prevent SVG arc 360 bug
        dPath = `
          M ${cx} ${cy - rOuter}
          A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy + rOuter}
          A ${rOuter} ${rOuter} 0 1 0 ${cx} ${cy - rOuter}
          M ${cx} ${cy - rInner}
          A ${rInner} ${rInner} 0 1 1 ${cx} ${cy + rInner}
          A ${rInner} ${rInner} 0 1 1 ${cx} ${cy - rInner}
          Z
        `;
      } else {
        dPath = `
          M ${x1Outer} ${y1Outer}
          A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}
          L ${x1Inner} ${y1Inner}
          A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}
          Z
        `;
      }

      svgPathsHtml += `
        <path 
          class="pie-slice" 
          d="${dPath}" 
          fill="${color}"
          data-category="${escapeHtml(cat)}"
          data-amount="${escapeHtml(formatCurrency(amount))}"
          data-pct="${pctStr}">
          <title>${escapeHtml(cat)}: ${formatCurrency(amount)} (${pctStr})</title>
        </path>
      `;

      // Legend Item
      legendHtml += `
        <div class="legend-item" title="${escapeHtml(cat)}: ${pctStr}">
          <div class="legend-left">
            <span class="legend-color-dot" style="background-color: ${color}"></span>
            <span class="legend-name">${escapeHtml(cat)}</span>
          </div>
          <div>
            <span class="legend-amount">${formatCurrency(amount)}</span>
            <span class="text-muted" style="font-size:0.75rem; margin-left:4px;">(${pctStr})</span>
          </div>
        </div>
      `;
    });

    el.pieChartSvg.innerHTML = svgPathsHtml;
    el.chartLegendContainer.innerHTML = legendHtml;
  }

  // =========================================================================
  // Compact Student Calculator Logic
  // =========================================================================

  const calcState = {
    display: '0',
    expression: '',
    firstOperand: null,
    operator: null,
    waitingForSecondOperand: false,
  };

  function updateCalcDisplay() {
    el.calcDisplay.textContent = calcState.display;
    el.calcExpression.textContent = calcState.expression || '\u00A0';
  }

  function calcInputDigit(digit) {
    if (calcState.waitingForSecondOperand) {
      calcState.display = String(digit);
      calcState.waitingForSecondOperand = false;
    } else {
      calcState.display = calcState.display === '0' ? String(digit) : calcState.display + digit;
    }
    updateCalcDisplay();
  }

  function calcInputDecimal() {
    if (calcState.waitingForSecondOperand) {
      calcState.display = '0.';
      calcState.waitingForSecondOperand = false;
      updateCalcDisplay();
      return;
    }
    if (!calcState.display.includes('.')) {
      calcState.display += '.';
    }
    updateCalcDisplay();
  }

  function calcHandleOperator(nextOperator) {
    const inputValue = parseFloat(calcState.display);

    if (calcState.operator && calcState.waitingForSecondOperand) {
      calcState.operator = nextOperator;
      calcState.expression = `${calcState.firstOperand} ${getOpSymbol(nextOperator)}`;
      updateCalcDisplay();
      return;
    }

    if (calcState.firstOperand === null && !isNaN(inputValue)) {
      calcState.firstOperand = inputValue;
    } else if (calcState.operator) {
      const result = calcPerformCalculation(calcState.operator, calcState.firstOperand, inputValue);
      calcState.display = `${parseFloat(result.toFixed(6))}`;
      calcState.firstOperand = result;
    }

    calcState.waitingForSecondOperand = true;
    calcState.operator = nextOperator;
    calcState.expression = `${calcState.firstOperand} ${getOpSymbol(nextOperator)}`;
    updateCalcDisplay();
  }

  function calcPerformCalculation(operator, first, second) {
    switch (operator) {
      case 'add':
        return first + second;
      case 'subtract':
        return first - second;
      case 'multiply':
        return first * second;
      case 'divide':
        return second === 0 ? 0 : first / second;
      case 'percent':
        return (first * second) / 100;
      default:
        return second;
    }
  }

  function getOpSymbol(op) {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '−';
      case 'multiply': return '×';
      case 'divide': return '÷';
      case 'percent': return '%';
      default: return '';
    }
  }

  function calcEquals() {
    const inputValue = parseFloat(calcState.display);
    if (calcState.operator && !calcState.waitingForSecondOperand) {
      const result = calcPerformCalculation(calcState.operator, calcState.firstOperand, inputValue);
      calcState.expression = `${calcState.firstOperand} ${getOpSymbol(calcState.operator)} ${inputValue} =`;
      calcState.display = `${parseFloat(result.toFixed(6))}`;
      calcState.firstOperand = result;
      calcState.operator = null;
      calcState.waitingForSecondOperand = false;
      updateCalcDisplay();
    }
  }

  function calcClear() {
    calcState.display = '0';
    calcState.expression = '';
    calcState.firstOperand = null;
    calcState.operator = null;
    calcState.waitingForSecondOperand = false;
    updateCalcDisplay();
  }

  function calcBackspace() {
    if (calcState.waitingForSecondOperand) return;
    if (calcState.display.length > 1) {
      calcState.display = calcState.display.slice(0, -1);
    } else {
      calcState.display = '0';
    }
    updateCalcDisplay();
  }

  function setupCalculator() {
    const calcCard = document.querySelector('.calculator-card');
    if (!calcCard) return;

    calcCard.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const num = btn.dataset.num;
      const action = btn.dataset.action;

      if (num !== undefined) {
        calcInputDigit(num);
      } else if (action === 'decimal') {
        calcInputDecimal();
      } else if (action === 'clear') {
        calcClear();
      } else if (action === 'backspace') {
        calcBackspace();
      } else if (action === 'equals') {
        calcEquals();
      } else if (action) {
        calcHandleOperator(action);
      }
    });

    el.calcClearHistoryBtn.addEventListener('click', calcClear);

    // Keyboard support for calculator
    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in form inputs/modals
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        calcInputDigit(e.key);
      } else if (e.key === '.') {
        calcInputDecimal();
      } else if (e.key === '+') {
        calcHandleOperator('add');
      } else if (e.key === '-') {
        calcHandleOperator('subtract');
      } else if (e.key === '*') {
        calcHandleOperator('multiply');
      } else if (e.key === '/') {
        e.preventDefault();
        calcHandleOperator('divide');
      } else if (e.key === '%') {
        calcHandleOperator('percent');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calcEquals();
      } else if (e.key === 'Backspace') {
        calcBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        calcClear();
      }
    });
  }

  // =========================================================================
  // Monthly Stats Calculation
  // =========================================================================

  function updateMonthlyStats(monthExpenses) {
    const monthName = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(state.selectedMonth);

    el.selectedMonthName.textContent = monthName;

    const now = new Date();
    const isCurrentRealMonth =
      now.getFullYear() === state.selectedMonth.getFullYear() &&
      now.getMonth() === state.selectedMonth.getMonth();

    el.monthBadge.textContent = isCurrentRealMonth ? 'Current Month' : 'Selected Month';

    if (!monthExpenses || monthExpenses.length === 0) {
      el.monthTotalSpent.textContent = 'Rs. 0.00';
      el.monthAverageDaily.textContent = 'Daily average: Rs. 0.00';
      el.monthTransactionCount.textContent = '0';
      el.monthActiveDays.textContent = 'Across 0 spending days';
      el.monthTopCategory.textContent = '—';
      el.monthTopCategoryAmount.textContent = 'No data recorded';
      return;
    }

    let total = 0;
    const categoryTotals = {};
    const activeDates = new Set();

    monthExpenses.forEach((exp) => {
      const amt = parseFloat(exp.amount) || 0;
      total += amt;
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      if (exp.date) activeDates.add(exp.date);
    });

    let topCat = '—';
    let topCatAmt = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > topCatAmt) {
        topCatAmt = amt;
        topCat = cat;
      }
    }

    const daysInMonth = new Date(
      state.selectedMonth.getFullYear(),
      state.selectedMonth.getMonth() + 1,
      0
    ).getDate();
    const dailyAvg = total / daysInMonth;

    el.monthTotalSpent.textContent = formatCurrency(total);
    el.monthAverageDaily.textContent = `Daily average: ${formatCurrency(dailyAvg)}`;
    el.monthTransactionCount.textContent = monthExpenses.length;
    el.monthActiveDays.textContent = `Across ${activeDates.size} active ${
      activeDates.size === 1 ? 'day' : 'days'
    }`;
    el.monthTopCategory.textContent = topCat;
    el.monthTopCategoryAmount.textContent = `${formatCurrency(topCatAmt)} spent`;
  }

  // =========================================================================
  // Table Rendering & Filters
  // =========================================================================

  function applyClientSearch() {
    const query = el.searchQuery.value.trim().toLowerCase();
    let displayList = state.expenses;

    if (query) {
      displayList = state.expenses.filter((item) => {
        const noteMatch = item.note && item.note.toLowerCase().includes(query);
        const catMatch = item.category && item.category.toLowerCase().includes(query);
        return noteMatch || catMatch;
      });
    }

    renderTable(displayList);
  }

  function renderTable(list) {
    hideAllStates();

    const count = list.length;
    el.resultsCount.textContent = `${count} ${count === 1 ? 'expense' : 'expenses'} found`;

    if (count === 0) {
      el.tableWrapper.classList.add('hidden');
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');
    el.tableWrapper.classList.remove('hidden');

    el.expensesTableBody.innerHTML = list
      .map((item) => {
        const catClass = getCategoryClass(item.category);
        const formattedAmount = formatCurrency(item.amount);
        const formattedDate = formatDate(item.date);
        const noteHtml = item.note
          ? `<span class="expense-note-col">${escapeHtml(item.note)}</span>`
          : `<span class="note-empty">No note</span>`;

        return `
          <tr data-id="${item.id}">
            <td class="expense-date-col">${formattedDate}</td>
            <td>
              <span class="category-badge ${catClass}">
                ${escapeHtml(item.category)}
              </span>
            </td>
            <td>${noteHtml}</td>
            <td class="expense-amount-col">${formattedAmount}</td>
            <td>
              <div class="table-actions">
                <button class="btn-action-icon edit-btn" data-id="${item.id}" title="Edit expense" aria-label="Edit expense">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="btn-action-icon delete-btn" data-id="${item.id}" title="Delete expense" aria-label="Delete expense">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function showLoading() {
    el.loadingState.classList.remove('hidden');
    el.emptyState.classList.add('hidden');
    el.errorState.classList.add('hidden');
    el.tableWrapper.classList.add('hidden');
    el.resultsCount.textContent = 'Updating...';
  }

  function showError(msg) {
    el.loadingState.classList.add('hidden');
    el.emptyState.classList.add('hidden');
    el.tableWrapper.classList.add('hidden');
    el.errorState.classList.remove('hidden');
    el.errorMessageText.textContent = msg || 'Could not communicate with the API server.';
    el.resultsCount.textContent = 'Error';
  }

  function hideAllStates() {
    el.loadingState.classList.add('hidden');
    el.errorState.classList.add('hidden');
  }

  // =========================================================================
  // Modal Handlers: Expense (Add / Edit / Delete)
  // =========================================================================

  function openAddExpenseModal() {
    state.editingExpenseId = null;
    el.modalTitle.textContent = 'Add New Expense';
    el.expenseForm.reset();
    el.expenseIdInput.value = '';
    el.expenseDate.value = getTodayString();
    clearExpenseValidation();
    el.formAlertBox.classList.add('hidden');
    el.saveBtnText.textContent = 'Save Expense';
    el.expenseModal.classList.remove('hidden');
    setTimeout(() => el.expenseAmount.focus(), 50);
  }

  function openEditExpenseModal(expense) {
    state.editingExpenseId = expense.id;
    el.modalTitle.textContent = 'Edit Expense';
    el.expenseForm.reset();
    el.expenseIdInput.value = expense.id;
    el.expenseAmount.value = expense.amount;
    el.expenseCategory.value = expense.category;
    el.expenseDate.value = expense.date;
    el.expenseNote.value = expense.note || '';
    clearExpenseValidation();
    el.formAlertBox.classList.add('hidden');
    el.saveBtnText.textContent = 'Update Expense';
    el.expenseModal.classList.remove('hidden');
    setTimeout(() => el.expenseAmount.focus(), 50);
  }

  function closeExpenseModal() {
    el.expenseModal.classList.add('hidden');
    el.expenseForm.reset();
    state.editingExpenseId = null;
  }

  function clearExpenseValidation() {
    el.expenseAmount.classList.remove('is-invalid');
    el.expenseCategory.classList.remove('is-invalid');
    el.expenseDate.classList.remove('is-invalid');
    el.expenseNote.classList.remove('is-invalid');

    el.amountError.textContent = '';
    el.categoryError.textContent = '';
    el.dateError.textContent = '';
    el.noteError.textContent = '';
  }

  async function handleExpenseSubmit(e) {
    e.preventDefault();
    clearExpenseValidation();
    el.formAlertBox.classList.add('hidden');

    let isValid = true;
    const amt = parseFloat(el.expenseAmount.value);
    if (isNaN(amt) || amt <= 0) {
      el.expenseAmount.classList.add('is-invalid');
      el.amountError.textContent = 'Amount must be greater than zero.';
      isValid = false;
    }

    const cat = el.expenseCategory.value.trim();
    if (!cat) {
      el.expenseCategory.classList.add('is-invalid');
      el.categoryError.textContent = 'Please select a category.';
      isValid = false;
    }

    const dateVal = el.expenseDate.value.trim();
    if (!dateVal) {
      el.expenseDate.classList.add('is-invalid');
      el.dateError.textContent = 'Please choose a date.';
      isValid = false;
    }

    if (!isValid) return;

    const payload = {
      amount: amt,
      category: cat,
      date: dateVal,
      note: el.expenseNote.value.trim() || null,
    };

    el.saveBtnSpinner.classList.remove('hidden');
    el.saveExpenseBtn.disabled = true;

    try {
      if (state.editingExpenseId) {
        await apiUpdateExpense(state.editingExpenseId, payload);
        closeExpenseModal();
        showToast('Expense updated successfully!', 'success');
      } else {
        await apiCreateExpense(payload);
        closeExpenseModal();
        showToast('Expense created successfully!', 'success');
      }
      await loadData();
    } catch (err) {
      if (err.validationErrors) {
        if (err.validationErrors.amount) {
          el.expenseAmount.classList.add('is-invalid');
          el.amountError.textContent = err.validationErrors.amount;
        }
        if (err.validationErrors.category) {
          el.expenseCategory.classList.add('is-invalid');
          el.categoryError.textContent = err.validationErrors.category;
        }
        if (err.validationErrors.date) {
          el.expenseDate.classList.add('is-invalid');
          el.dateError.textContent = err.validationErrors.date;
        }
        el.formAlertBox.textContent = 'Please fix the errors indicated below.';
        el.formAlertBox.classList.remove('hidden');
      } else {
        el.formAlertBox.textContent = err.message || 'Error saving expense.';
        el.formAlertBox.classList.remove('hidden');
      }
    } finally {
      el.saveBtnSpinner.classList.add('hidden');
      el.saveExpenseBtn.disabled = false;
    }
  }

  function openDeleteModal(expense) {
    state.deletingExpenseId = expense.id;
    el.deletePreviewCategory.textContent = expense.category;
    el.deletePreviewAmount.textContent = formatCurrency(expense.amount);
    el.deletePreviewDate.textContent = formatDate(expense.date);
    el.deleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    el.deleteModal.classList.add('hidden');
    state.deletingExpenseId = null;
  }

  async function handleConfirmDelete() {
    if (!state.deletingExpenseId) return;

    el.deleteBtnSpinner.classList.remove('hidden');
    el.confirmDeleteBtn.disabled = true;

    try {
      await apiDeleteExpense(state.deletingExpenseId);
      closeDeleteModal();
      showToast('Expense deleted successfully', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      el.deleteBtnSpinner.classList.add('hidden');
      el.confirmDeleteBtn.disabled = false;
    }
  }

  // =========================================================================
  // Modal Handlers: Edit Weekly Allowance
  // =========================================================================

  function openAllowanceModal() {
    const week = getMondayAndSunday(state.selectedWeekDate);
    el.allowanceWeekLabel.textContent = `${formatDate(week.startStr)} – ${formatDate(week.endStr)}`;
    el.allowanceInput.value = state.weeklyAllowance;
    el.allowanceError.textContent = '';
    el.allowanceModal.classList.remove('hidden');
    setTimeout(() => el.allowanceInput.focus(), 50);
  }

  function closeAllowanceModal() {
    el.allowanceModal.classList.add('hidden');
  }

  async function handleAllowanceSubmit(e) {
    e.preventDefault();
    const val = parseFloat(el.allowanceInput.value);
    if (isNaN(val) || val < 0) {
      el.allowanceError.textContent = 'Please enter a valid allowance (0 or greater).';
      return;
    }

    const week = getMondayAndSunday(state.selectedWeekDate);
    el.allowanceBtnSpinner.classList.remove('hidden');

    try {
      await apiSetWeeklyBudget(week.startStr, val);
      closeAllowanceModal();
      showToast('Weekly allowance updated!', 'success');
      await loadData();
    } catch (err) {
      el.allowanceError.textContent = err.message || 'Failed to update allowance.';
    } finally {
      el.allowanceBtnSpinner.classList.add('hidden');
    }
  }

  // =========================================================================
  // Modal Handlers: Extra Income (Add & View List)
  // =========================================================================

  function openIncomeModal() {
    el.incomeForm.reset();
    el.incomeDate.value = getTodayString();
    el.incomeAmountError.textContent = '';
    el.incomeDateError.textContent = '';
    el.incomeFormAlert.classList.add('hidden');
    el.incomeModal.classList.remove('hidden');
    setTimeout(() => el.incomeAmount.focus(), 50);
  }

  function closeIncomeModal() {
    el.incomeModal.classList.add('hidden');
  }

  async function handleIncomeSubmit(e) {
    e.preventDefault();
    el.incomeAmountError.textContent = '';
    el.incomeDateError.textContent = '';
    el.incomeFormAlert.classList.add('hidden');

    const amt = parseFloat(el.incomeAmount.value);
    if (isNaN(amt) || amt <= 0) {
      el.incomeAmountError.textContent = 'Please enter an income amount greater than zero.';
      return;
    }

    const dateVal = el.incomeDate.value;
    if (!dateVal) {
      el.incomeDateError.textContent = 'Date is required.';
      return;
    }

    const payload = {
      amount: amt,
      date: dateVal,
      source: el.incomeSource.value.trim() || null,
    };

    el.saveIncomeSpinner.classList.remove('hidden');

    try {
      await apiCreateIncome(payload);
      closeIncomeModal();
      showToast('Income recorded successfully!', 'success');
      await loadData();
    } catch (err) {
      el.incomeFormAlert.textContent = err.message || 'Failed to record income.';
      el.incomeFormAlert.classList.remove('hidden');
    } finally {
      el.saveIncomeSpinner.classList.add('hidden');
    }
  }

  function openIncomesListModal() {
    const week = getMondayAndSunday(state.selectedWeekDate);
    el.incomesListSubtitle.textContent = `Week of ${formatDate(week.startStr)} – ${formatDate(week.endStr)}`;

    if (state.weeklyIncomes.length === 0) {
      el.incomesListEmpty.classList.remove('hidden');
      el.incomesListContainer.innerHTML = '';
    } else {
      el.incomesListEmpty.classList.add('hidden');
      el.incomesListContainer.innerHTML = state.weeklyIncomes
        .map(
          (inc) => `
        <li class="income-item" data-id="${inc.id}">
          <div class="income-item-left">
            <span class="income-item-source">${escapeHtml(inc.source || 'Extra Pocket Money')}</span>
            <span class="income-item-date">${formatDate(inc.date)}</span>
          </div>
          <div class="income-item-right">
            <span class="income-item-amount">+${formatCurrency(inc.amount)}</span>
            <button class="btn-action-icon delete-income-btn" data-id="${inc.id}" title="Delete income entry">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </li>
      `
        )
        .join('');
    }

    el.incomesListModal.classList.remove('hidden');
  }

  function closeIncomesListModal() {
    el.incomesListModal.classList.add('hidden');
  }

  async function handleDeleteIncome(id) {
    try {
      await apiDeleteIncome(id);
      showToast('Income entry deleted', 'info');
      await loadData();
      openIncomesListModal(); // refresh list
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // =========================================================================
  // Navigation & Filter Event Handlers
  // =========================================================================

  function changeWeek(direction) {
    const d = new Date(state.selectedWeekDate);
    d.setDate(d.getDate() + direction * 7);
    state.selectedWeekDate = d;

    // If currently filtered by week, update table date controls
    if (state.activePeriod === 'week') {
      const week = getMondayAndSunday(state.selectedWeekDate);
      el.filterStartDate.value = week.startStr;
      el.filterEndDate.value = week.endStr;
    }

    loadData();
  }

  function jumpToCurrentWeek() {
    state.selectedWeekDate = new Date();
    setPeriodFilter('week');
  }

  function changeMonth(direction) {
    const current = state.selectedMonth;
    state.selectedMonth = new Date(current.getFullYear(), current.getMonth() + direction, 1);

    if (state.activePeriod === 'month') {
      const range = getMonthDateRange(state.selectedMonth);
      el.filterStartDate.value = range.startStr;
      el.filterEndDate.value = range.endStr;
    }

    loadData();
  }

  function jumpToCurrentMonth() {
    state.selectedMonth = new Date();
    setPeriodFilter('month');
  }

  function setPeriodFilter(period) {
    state.activePeriod = period;
    el.periodChips.forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.period === period);
    });

    if (period === 'week') {
      const week = getMondayAndSunday(state.selectedWeekDate);
      el.filterStartDate.value = week.startStr;
      el.filterEndDate.value = week.endStr;
    } else if (period === 'month') {
      const range = getMonthDateRange(state.selectedMonth);
      el.filterStartDate.value = range.startStr;
      el.filterEndDate.value = range.endStr;
    } else if (period === 'all') {
      el.filterStartDate.value = '';
      el.filterEndDate.value = '';
    }

    loadData();
  }

  function resetFilters() {
    el.searchQuery.value = '';
    el.filterCategory.value = '';
    setPeriodFilter('month');
  }

  // =========================================================================
  // Event Listeners Initialization
  // =========================================================================

  function setupEventListeners() {
    // Expense Add & Modals
    el.openAddModalBtn.addEventListener('click', openAddExpenseModal);
    el.emptyStateAddBtn.addEventListener('click', openAddExpenseModal);
    el.closeModalBtn.addEventListener('click', closeExpenseModal);
    el.cancelModalBtn.addEventListener('click', closeExpenseModal);
    el.expenseForm.addEventListener('submit', handleExpenseSubmit);

    // Delete Modal
    el.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    el.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    el.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Allowance Modal
    el.editAllowanceBtn.addEventListener('click', openAllowanceModal);
    el.closeAllowanceModalBtn.addEventListener('click', closeAllowanceModal);
    el.cancelAllowanceBtn.addEventListener('click', closeAllowanceModal);
    el.allowanceForm.addEventListener('submit', handleAllowanceSubmit);

    // Income Modals
    el.openAddIncomeBtn.addEventListener('click', openIncomeModal);
    el.closeIncomeModalBtn.addEventListener('click', closeIncomeModal);
    el.cancelIncomeBtn.addEventListener('click', closeIncomeModal);
    el.incomeForm.addEventListener('submit', handleIncomeSubmit);

    el.viewIncomesBtn.addEventListener('click', openIncomesListModal);
    el.closeIncomesListBtn.addEventListener('click', closeIncomesListModal);
    el.closeIncomesListFooterBtn.addEventListener('click', closeIncomesListModal);
    el.incomesListAddMoreBtn.addEventListener('click', () => {
      closeIncomesListModal();
      openIncomeModal();
    });

    el.incomesListContainer.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-income-btn');
      if (delBtn) {
        const id = parseInt(delBtn.dataset.id, 10);
        handleDeleteIncome(id);
      }
    });

    // Close on backdrop click
    [el.expenseModal, el.allowanceModal, el.incomeModal, el.incomesListModal, el.deleteModal].forEach(
      (modal) => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.add('hidden');
        });
      }
    );

    // Week Navigation
    el.prevWeekBtn.addEventListener('click', () => changeWeek(-1));
    el.nextWeekBtn.addEventListener('click', () => changeWeek(1));
    el.jumpCurrentWeekBtn.addEventListener('click', jumpToCurrentWeek);

    // Month Navigation
    el.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    el.nextMonthBtn.addEventListener('click', () => changeMonth(1));
    el.jumpCurrentMonthBtn.addEventListener('click', jumpToCurrentMonth);

    // Filter Chips
    el.periodChips.forEach((chip) => {
      chip.addEventListener('click', () => setPeriodFilter(chip.dataset.period));
    });

    // Filter Inputs
    el.filterCategory.addEventListener('change', () => loadData());
    el.filterStartDate.addEventListener('change', () => setPeriodFilter('custom'));
    el.filterEndDate.addEventListener('change', () => setPeriodFilter('custom'));
    el.resetFiltersBtn.addEventListener('click', resetFilters);
    el.searchQuery.addEventListener('input', applyClientSearch);
    el.retryBtn.addEventListener('click', () => loadData());

    // Table Actions (Edit & Delete via delegation)
    el.expensesTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const deleteBtn = e.target.closest('.delete-btn');

      if (editBtn) {
        const id = parseInt(editBtn.dataset.id, 10);
        const expense = state.expenses.find((item) => item.id === id);
        if (expense) openEditExpenseModal(expense);
      } else if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id, 10);
        const expense = state.expenses.find((item) => item.id === id);
        if (expense) openDeleteModal(expense);
      }
    });

    // Global Escape key to close any active modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        el.expenseModal.classList.add('hidden');
        el.allowanceModal.classList.add('hidden');
        el.incomeModal.classList.add('hidden');
        el.incomesListModal.classList.add('hidden');
        el.deleteModal.classList.add('hidden');
      }
    });

    // Calculator setup
    setupCalculator();
  }

  // =========================================================================
  // App Bootstrapping
  // =========================================================================

  function init() {
    setupEventListeners();

    // Default to this month for table filter
    const monthRange = getMonthDateRange(state.selectedMonth);
    el.filterStartDate.value = monthRange.startStr;
    el.filterEndDate.value = monthRange.endStr;

    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
