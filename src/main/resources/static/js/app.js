/**
 * SpendSnap - Personal Expense Tracker Frontend
 * Connects directly to Spring Boot backend at /api/expenses
 */

(function () {
  'use strict';

  const API_BASE = '/api/expenses';

  // State Management
  const state = {
    expenses: [],
    filteredExpenses: [],
    selectedMonth: new Date(), // Year & Month focus for dashboard
    activePeriod: 'month', // 'month' | 'all' | 'custom'
    isLoading: false,
    editingExpenseId: null,
    deletingExpenseId: null,
  };

  // DOM Elements
  const elements = {
    // Header & Navigation
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    selectedMonthName: document.getElementById('selectedMonthName'),
    jumpCurrentMonthBtn: document.getElementById('jumpCurrentMonthBtn'),

    // Dashboard Cards
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

    // Table & States
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),
    errorState: document.getElementById('errorState'),
    errorMessageText: document.getElementById('errorMessageText'),
    retryBtn: document.getElementById('retryBtn'),
    tableWrapper: document.getElementById('tableWrapper'),
    expensesTableBody: document.getElementById('expensesTableBody'),

    // Add/Edit Modal
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

    // Field Error Spans
    amountError: document.getElementById('amountError'),
    categoryError: document.getElementById('categoryError'),
    dateError: document.getElementById('dateError'),
    noteError: document.getElementById('noteError'),

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

    // Toast
    toastContainer: document.getElementById('toastContainer'),
  };

  // =========================================================================
  // Formatting Utilities
  // =========================================================================

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '$0.00';
    return currencyFormatter.format(amount);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    // Format YYYY-MM-DD cleanly using UTC to prevent timezone shifting
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

  function getMonthDateRange(dateObj) {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const firstDay = new Date(Date.UTC(y, m, 1));
    const lastDay = new Date(Date.UTC(y, m + 1, 0));

    const startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay.getUTCDate()).padStart(2, '0')}`;
    return { startStr, endStr };
  }

  function getCategoryClass(category) {
    if (!category) return 'cat-other';
    const cat = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (cat.includes('grocer')) return 'cat-groceries';
    if (cat.includes('food') || cat.includes('din')) return 'cat-food-dining';
    if (cat.includes('transp') || cat.includes('car') || cat.includes('fuel')) return 'cat-transport';
    if (cat.includes('util') || cat.includes('bill')) return 'cat-utilities';
    if (cat.includes('shop')) return 'cat-shopping';
    if (cat.includes('entertain') || cat.includes('movie')) return 'cat-entertainment';
    if (cat.includes('health') || cat.includes('med')) return 'cat-health';
    if (cat.includes('person')) return 'cat-personal';
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
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success)"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--danger)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--maroon-700)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHtml(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

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

  async function fetchExpensesFromApi(params = {}) {
    const url = new URL(API_BASE, window.location.origin);
    if (params.category) url.searchParams.set('category', params.category);
    if (params.startDate) url.searchParams.set('startDate', params.startDate);
    if (params.endDate) url.searchParams.set('endDate', params.endDate);

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const err = await parseErrorResponse(response);
      throw new Error(err.message || `Server error (${response.status})`);
    }

    return await response.json();
  }

  async function createExpenseApi(data) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      const error = new Error(errorData.message || 'Failed to create expense');
      error.status = response.status;
      error.validationErrors = errorData.validationErrors;
      throw error;
    }

    return await response.json();
  }

  async function updateExpenseApi(id, data) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      const error = new Error(errorData.message || 'Failed to update expense');
      error.status = response.status;
      error.validationErrors = errorData.validationErrors;
      throw error;
    }

    return await response.json();
  }

  async function deleteExpenseApi(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await parseErrorResponse(response);
      throw new Error(errorData.message || 'Failed to delete expense');
    }
  }

  async function parseErrorResponse(response) {
    try {
      return await response.json();
    } catch {
      return { message: `Request failed with status ${response.status}` };
    }
  }

  // =========================================================================
  // Data Loading & Filtering Pipeline
  // =========================================================================

  async function loadData() {
    state.isLoading = true;
    showLoading();

    try {
      // Build API query parameters based on active filters
      const apiParams = {};
      const cat = elements.filterCategory.value.trim();
      if (cat) apiParams.category = cat;

      const startDate = elements.filterStartDate.value;
      const endDate = elements.filterEndDate.value;
      if (startDate) apiParams.startDate = startDate;
      if (endDate) apiParams.endDate = endDate;

      // 1. Fetch filtered list for the table
      const listData = await fetchExpensesFromApi(apiParams);
      state.expenses = listData;

      // 2. Fetch all expenses for currently focused month to calculate Dashboard Stats
      const monthRange = getMonthDateRange(state.selectedMonth);
      const monthData = await fetchExpensesFromApi({
        startDate: monthRange.startStr,
        endDate: monthRange.endStr,
      });

      // Update Dashboard Stats with monthData
      updateDashboardStats(monthData);

      // Apply client-side text search (note/description)
      applyClientSearch();

      state.isLoading = false;
    } catch (err) {
      state.isLoading = false;
      showError(err.message);
    }
  }

  function applyClientSearch() {
    const query = elements.searchQuery.value.trim().toLowerCase();
    if (!query) {
      state.filteredExpenses = [...state.expenses];
    } else {
      state.filteredExpenses = state.expenses.filter((item) => {
        const noteMatch = item.note && item.note.toLowerCase().includes(query);
        const catMatch = item.category && item.category.toLowerCase().includes(query);
        return noteMatch || catMatch;
      });
    }

    renderTable();
  }

  // =========================================================================
  // Dashboard Metrics Calculation
  // =========================================================================

  function updateDashboardStats(monthExpenses) {
    const monthName = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(state.selectedMonth);

    elements.selectedMonthName.textContent = monthName;

    // Is it current real month?
    const now = new Date();
    const isCurrentRealMonth =
      now.getFullYear() === state.selectedMonth.getFullYear() &&
      now.getMonth() === state.selectedMonth.getMonth();

    elements.monthBadge.textContent = isCurrentRealMonth ? 'Current Month' : 'Selected Month';

    if (!monthExpenses || monthExpenses.length === 0) {
      elements.monthTotalSpent.textContent = '$0.00';
      elements.monthAverageDaily.textContent = 'Daily average: $0.00';
      elements.monthTransactionCount.textContent = '0';
      elements.monthActiveDays.textContent = 'Across 0 spending days';
      elements.monthTopCategory.textContent = '—';
      elements.monthTopCategoryAmount.textContent = 'No data recorded';
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

    // Top Category
    let topCat = '—';
    let topCatAmt = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > topCatAmt) {
        topCatAmt = amt;
        topCat = cat;
      }
    }

    // Days in this month for daily average
    const daysInMonth = new Date(
      state.selectedMonth.getFullYear(),
      state.selectedMonth.getMonth() + 1,
      0
    ).getDate();
    const dailyAvg = total / daysInMonth;

    elements.monthTotalSpent.textContent = formatCurrency(total);
    elements.monthAverageDaily.textContent = `Daily average: ${formatCurrency(dailyAvg)}`;
    elements.monthTransactionCount.textContent = monthExpenses.length;
    elements.monthActiveDays.textContent = `Across ${activeDates.size} active ${activeDates.size === 1 ? 'day' : 'days'}`;
    elements.monthTopCategory.textContent = topCat;
    elements.monthTopCategoryAmount.textContent = `${formatCurrency(topCatAmt)} spent`;
  }

  // =========================================================================
  // Rendering Table & States
  // =========================================================================

  function renderTable() {
    hideAllStates();

    const count = state.filteredExpenses.length;
    elements.resultsCount.textContent = `${count} ${count === 1 ? 'expense' : 'expenses'} found`;

    if (count === 0) {
      elements.tableWrapper.classList.add('hidden');
      elements.emptyState.classList.remove('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');
    elements.tableWrapper.classList.remove('hidden');

    elements.expensesTableBody.innerHTML = state.filteredExpenses
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
    elements.loadingState.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.tableWrapper.classList.add('hidden');
    elements.resultsCount.textContent = 'Updating...';
  }

  function showError(msg) {
    elements.loadingState.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.tableWrapper.classList.add('hidden');
    elements.errorState.classList.remove('hidden');
    elements.errorMessageText.textContent = msg || 'Could not communicate with the API server.';
    elements.resultsCount.textContent = 'Error';
  }

  function hideAllStates() {
    elements.loadingState.classList.add('hidden');
    elements.errorState.classList.add('hidden');
  }

  // =========================================================================
  // Modal Handlers (Add / Edit)
  // =========================================================================

  function openAddModal() {
    state.editingExpenseId = null;
    elements.modalTitle.textContent = 'Add New Expense';
    elements.expenseForm.reset();
    elements.expenseIdInput.value = '';
    elements.expenseDate.value = getTodayString();
    clearValidationErrors();
    hideFormAlert();
    elements.saveBtnText.textContent = 'Save Expense';
    elements.expenseModal.classList.remove('hidden');
    setTimeout(() => elements.expenseAmount.focus(), 50);
  }

  function openEditModal(expense) {
    state.editingExpenseId = expense.id;
    elements.modalTitle.textContent = 'Edit Expense';
    elements.expenseForm.reset();
    elements.expenseIdInput.value = expense.id;
    elements.expenseAmount.value = expense.amount;
    elements.expenseCategory.value = expense.category;
    elements.expenseDate.value = expense.date;
    elements.expenseNote.value = expense.note || '';
    clearValidationErrors();
    hideFormAlert();
    elements.saveBtnText.textContent = 'Update Expense';
    elements.expenseModal.classList.remove('hidden');
    setTimeout(() => elements.expenseAmount.focus(), 50);
  }

  function closeExpenseModal() {
    elements.expenseModal.classList.add('hidden');
    elements.expenseForm.reset();
    state.editingExpenseId = null;
  }

  // =========================================================================
  // Modal Handlers (Delete Confirmation)
  // =========================================================================

  function openDeleteModal(expense) {
    state.deletingExpenseId = expense.id;
    elements.deletePreviewCategory.textContent = expense.category;
    elements.deletePreviewAmount.textContent = formatCurrency(expense.amount);
    elements.deletePreviewDate.textContent = formatDate(expense.date);
    elements.deleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    elements.deleteModal.classList.add('hidden');
    state.deletingExpenseId = null;
  }

  async function handleConfirmDelete() {
    if (!state.deletingExpenseId) return;

    elements.deleteBtnSpinner.classList.remove('hidden');
    elements.confirmDeleteBtn.disabled = true;

    try {
      await deleteExpenseApi(state.deletingExpenseId);
      closeDeleteModal();
      showToast('Expense deleted successfully', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      elements.deleteBtnSpinner.classList.add('hidden');
      elements.confirmDeleteBtn.disabled = false;
    }
  }

  // =========================================================================
  // Form Validation & Submission
  // =========================================================================

  function clearValidationErrors() {
    elements.expenseAmount.classList.remove('is-invalid');
    elements.expenseCategory.classList.remove('is-invalid');
    elements.expenseDate.classList.remove('is-invalid');
    elements.expenseNote.classList.remove('is-invalid');

    elements.amountError.textContent = '';
    elements.categoryError.textContent = '';
    elements.dateError.textContent = '';
    elements.noteError.textContent = '';
  }

  function showFormAlert(message) {
    elements.formAlertBox.textContent = message;
    elements.formAlertBox.classList.remove('hidden');
  }

  function hideFormAlert() {
    elements.formAlertBox.classList.add('hidden');
    elements.formAlertBox.textContent = '';
  }

  function validateExpenseForm() {
    clearValidationErrors();
    hideFormAlert();
    let isValid = true;

    const amountVal = parseFloat(elements.expenseAmount.value);
    if (isNaN(amountVal) || amountVal <= 0) {
      elements.expenseAmount.classList.add('is-invalid');
      elements.amountError.textContent = 'Please enter a valid amount greater than zero.';
      isValid = false;
    }

    const catVal = elements.expenseCategory.value.trim();
    if (!catVal) {
      elements.expenseCategory.classList.add('is-invalid');
      elements.categoryError.textContent = 'Please select a category.';
      isValid = false;
    }

    const dateVal = elements.expenseDate.value.trim();
    if (!dateVal) {
      elements.expenseDate.classList.add('is-invalid');
      elements.dateError.textContent = 'Please choose a date.';
      isValid = false;
    }

    const noteVal = elements.expenseNote.value;
    if (noteVal && noteVal.length > 255) {
      elements.expenseNote.classList.add('is-invalid');
      elements.noteError.textContent = 'Note must not exceed 255 characters.';
      isValid = false;
    }

    return isValid;
  }

  async function handleExpenseFormSubmit(e) {
    e.preventDefault();

    if (!validateExpenseForm()) {
      return;
    }

    const payload = {
      amount: parseFloat(elements.expenseAmount.value),
      category: elements.expenseCategory.value.trim(),
      date: elements.expenseDate.value,
      note: elements.expenseNote.value.trim() || null,
    };

    elements.saveBtnSpinner.classList.remove('hidden');
    elements.saveExpenseBtn.disabled = true;

    try {
      if (state.editingExpenseId) {
        await updateExpenseApi(state.editingExpenseId, payload);
        closeExpenseModal();
        showToast('Expense updated successfully!', 'success');
      } else {
        await createExpenseApi(payload);
        closeExpenseModal();
        showToast('Expense created successfully!', 'success');
      }
      await loadData();
    } catch (err) {
      if (err.validationErrors) {
        // Map backend validation errors to fields
        if (err.validationErrors.amount) {
          elements.expenseAmount.classList.add('is-invalid');
          elements.amountError.textContent = err.validationErrors.amount;
        }
        if (err.validationErrors.category) {
          elements.expenseCategory.classList.add('is-invalid');
          elements.categoryError.textContent = err.validationErrors.category;
        }
        if (err.validationErrors.date) {
          elements.expenseDate.classList.add('is-invalid');
          elements.dateError.textContent = err.validationErrors.date;
        }
        if (err.validationErrors.note) {
          elements.expenseNote.classList.add('is-invalid');
          elements.noteError.textContent = err.validationErrors.note;
        }
        showFormAlert('Please fix the errors indicated below.');
      } else {
        showFormAlert(err.message || 'An error occurred while saving the expense.');
      }
    } finally {
      elements.saveBtnSpinner.classList.add('hidden');
      elements.saveExpenseBtn.disabled = false;
    }
  }

  // =========================================================================
  // Period & Filter Management
  // =========================================================================

  function setPeriodFilter(period) {
    state.activePeriod = period;
    elements.periodChips.forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.period === period);
    });

    if (period === 'month') {
      const range = getMonthDateRange(state.selectedMonth);
      elements.filterStartDate.value = range.startStr;
      elements.filterEndDate.value = range.endStr;
    } else if (period === 'all') {
      elements.filterStartDate.value = '';
      elements.filterEndDate.value = '';
    }
    // If 'custom', we leave the existing date inputs as they are

    loadData();
  }

  function changeMonth(direction) {
    const current = state.selectedMonth;
    state.selectedMonth = new Date(current.getFullYear(), current.getMonth() + direction, 1);
    
    // If currently filtered by month, update date inputs as well
    if (state.activePeriod === 'month') {
      const range = getMonthDateRange(state.selectedMonth);
      elements.filterStartDate.value = range.startStr;
      elements.filterEndDate.value = range.endStr;
    }

    loadData();
  }

  function jumpToCurrentMonth() {
    state.selectedMonth = new Date();
    setPeriodFilter('month');
  }

  function resetFilters() {
    elements.searchQuery.value = '';
    elements.filterCategory.value = '';
    setPeriodFilter('month');
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================

  function setupEventListeners() {
    // Open Add Modal
    elements.openAddModalBtn.addEventListener('click', openAddModal);
    elements.emptyStateAddBtn.addEventListener('click', openAddModal);

    // Modal close buttons
    elements.closeModalBtn.addEventListener('click', closeExpenseModal);
    elements.cancelModalBtn.addEventListener('click', closeExpenseModal);
    elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    // Close on backdrop click
    elements.expenseModal.addEventListener('click', (e) => {
      if (e.target === elements.expenseModal) closeExpenseModal();
    });
    elements.deleteModal.addEventListener('click', (e) => {
      if (e.target === elements.deleteModal) closeDeleteModal();
    });

    // Form submit
    elements.expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Month Navigation
    elements.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    elements.nextMonthBtn.addEventListener('click', () => changeMonth(1));
    elements.jumpCurrentMonthBtn.addEventListener('click', jumpToCurrentMonth);

    // Filter Chips
    elements.periodChips.forEach((chip) => {
      chip.addEventListener('click', () => setPeriodFilter(chip.dataset.period));
    });

    // Filter Inputs (debounced or on change)
    elements.filterCategory.addEventListener('change', () => loadData());
    elements.filterStartDate.addEventListener('change', () => {
      setPeriodFilter('custom');
    });
    elements.filterEndDate.addEventListener('change', () => {
      setPeriodFilter('custom');
    });
    elements.resetFiltersBtn.addEventListener('click', resetFilters);

    // Instant Search
    elements.searchQuery.addEventListener('input', applyClientSearch);

    // Retry Button
    elements.retryBtn.addEventListener('click', () => loadData());

    // Table Actions (Edit & Delete via event delegation)
    elements.expensesTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const deleteBtn = e.target.closest('.delete-btn');

      if (editBtn) {
        const id = parseInt(editBtn.dataset.id, 10);
        const expense = state.expenses.find((item) => item.id === id);
        if (expense) openEditModal(expense);
      } else if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id, 10);
        const expense = state.expenses.find((item) => item.id === id);
        if (expense) openDeleteModal(expense);
      }
    });

    // Keyboard Shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!elements.expenseModal.classList.contains('hidden')) {
          closeExpenseModal();
        }
        if (!elements.deleteModal.classList.contains('hidden')) {
          closeDeleteModal();
        }
      }
    });
  }

  // =========================================================================
  // Initialize Application
  // =========================================================================

  function init() {
    setupEventListeners();
    // Default to this month
    const range = getMonthDateRange(state.selectedMonth);
    elements.filterStartDate.value = range.startStr;
    elements.filterEndDate.value = range.endStr;
    loadData();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
