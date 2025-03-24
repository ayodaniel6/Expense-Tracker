'strict mode';

class ExpenseTracker {
	constructor() {
		// initialise expense array (load from localstorage if available)
		this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
		this.filteredExpenses = null;
		this._renderExpenses();
		this._setupEventListener();
	}

	// Helper function to generate a unique ID
	_generateId() {
		const timestamp = Date.now().toString(36); // 36 based timestamp
		const randomString = Math.random().toString(36).substring(2, 6); // Random string
		return `${timestamp}-${randomString}`;
	}

	// Generate UUID (this is a crypto API in modern browser that generate random UUID)
	// _generateId() {
	// 	return crypto.randomUUID()
	// }

	_capitalizeWord(description) {
		return description.charAt(0).toUpperCase() + description.slice(1);
	}

	// Date
	_getDate() {
		const date = new Date();
		return {
			time: `${date.toLocaleTimeString()}`,
			date: `${date.toISOString().split('T')[0]}`,
		};
	}

	// Automatically classify an expense based on description or category
	_classifyExpense(description) {
		// change all to lower case
		const lowerDescription = description.toLowerCase();

		// keywords to mapping
		const keywords = {
			Food: ['food', 'restaurant', 'lunch', 'breakfast', 'dinner'],
			Transport: ['transport', 'fuel', 'bus', 'cab'],
			Utility: ['electricity', 'water', 'internet', 'utilities', 'data'],
			Entertainment: ['movie', 'game', 'netflix', 'entertainment'],
		};

		// Dynamically matching the keywords
		for (const [key, keyword] of Object.entries(keywords)) {
			if (keyword.some(words => lowerDescription.includes(words)))
				return key;
		}
		return 'Other';
	}

	// Add expense
	_addExpense(amount, description) {
		const category = this._classifyExpense(description);

		// Create object for new expense
		const newExpense = {
			id: this._generateId(),
			amount: parseFloat(amount),
			category,
			date: this._getDate().date,
			time: this._getDate().time,
			description: this._capitalizeWord(description),
		};

		// Add and Display expense to localStorage
		this.expenses.push(newExpense);
		this._saveExpense();
		this._renderExpenses();
	}

	// Render Expense to Page
	_renderExpenses() {
		const tbody = document.querySelector('#expenseTable tbody');

		// swapping either the filteredExpenses to be displayed or the full expenses
		this.expensesToRender =
			this.filteredExpenses !== null
				? this.filteredExpenses
				: this.expenses || [];

		// clear table
		tbody.innerHTML = '';

		// Add each expense to the table
		this.expensesToRender.forEach(expense => {
			const row = document.createElement('tr');
			row.innerHTML = `
                <td> ${expense.id} </td>
                <td> ${expense.date} </td>
                <td> ${expense.time} </td>
                <td> ${expense.category} </td>
                <td> ${expense.amount} </td>
                <td> ${expense.description} </td>
                <td> 
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
			tbody.appendChild(row);
		});

		// Update total Expense
		this._updateExpense();
	}

	// Get total Expense
	_updateExpense() {
		const totals = this._calcExpenses();

		document.getElementById('dailyExpenses').textContent =
			totals.daily.toFixed(2);
		document.getElementById('monthlyExpenses').textContent =
			totals.month.toFixed(2);
		document.getElementById('totalExpenses').textContent =
			totals.all.toFixed(2);
	}

	// Delete Expenses
	_deleteExpense(id) {
		this.expenses = this.expenses.filter(expense => expense.id !== id);
		this._saveExpense();
		this._renderExpenses();
	}

	// Save Expense to localStorage
	_saveExpense() {
		localStorage.setItem('expenses', JSON.stringify(this.expenses));
	}

	// Calculate Expenses for the day, month and the all total
	_calcExpenses() {
		const today = new Date().toISOString().split('T')[0];
		const currentMonth = new Date().getMonth() + 1;
		const currentYear = new Date().getFullYear();

		return {
			daily: this.expensesToRender
				.filter(expense => expense.date === today)
				.reduce((sum, expense) => sum + expense.amount, 0),

			month: this.expensesToRender
				.filter(expense => {
					const [year, month] = expense.date.split('-');
					return (
						parseInt(year) === currentMonth &&
						parseInt(month) === currentYear
					);
				})
				.reduce((sum, expense) => sum + expense.amount, 0),

			all: this.expensesToRender.reduce(
				(sum, expense) => sum + expense.amount,
				0
			),
		};
	}

	// Filter by category
	_filterByCategory(category) {
		this.filteredExpenses = this.expenses.filter(
			expense => expense.category.toLowerCase() === category.toLowerCase()
		);

		// incase there's no filtered expense
		if (this.filteredExpenses.length === 0) {
			alert('No expense found for this category!');
		}

		this._renderExpenses();
	}

	_clearFilter() {
		this.filteredExpenses = null;
		document.getElementById('filterInput').value = '';
		this._renderExpenses();
	}

	// Setup Event Listener
	_setupEventListener() {
		document.getElementById('expenseForm').addEventListener('submit', e => {
			e.preventDefault();
			const amount = document.getElementById('amount').value;
			const description = document.getElementById('description').value;

			this._addExpense(amount, description);

			// reset form
			e.target.reset();
		});

		// click to delete expense
		document
			.querySelector('#expenseTable tbody')
			.addEventListener('click', e => {
				if (e.target.classList.contains('delete-btn')) {
					const id = e.target.dataset.id;
					this._deleteExpense(id);
				}
			});

		// filter button
		document.getElementById('filterBtn').addEventListener('click', e => {
			e.preventDefault();
			const category = document.getElementById('filterInput').value;
			if (category) {
				this._filterByCategory(category);
			}
		});

		// clear filter button click
		document.getElementById('clearFilter').addEventListener('click', e => {
			e.preventDefault();
			this._clearFilter();
		});
	}
}

// Initialise the ExpenseTracker
const expenseTracker = new ExpenseTracker();

// expenseTracker._addExpense(700, 'Giveaway');
