// Données de l'application
let participants = [];
let expenses = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateUI();
});

// Sauvegarder les données dans localStorage
function saveData() {
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Charger les données depuis localStorage
function loadData() {
    const savedParticipants = localStorage.getItem('participants');
    const savedExpenses = localStorage.getItem('expenses');
    
    if (savedParticipants) {
        participants = JSON.parse(savedParticipants);
    }
    
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
}

// Ajouter un participant
function addParticipant() {
    const input = document.getElementById('participant-name');
    const name = input.value.trim();
    
    if (name === '') {
        alert('Veuillez entrer un nom');
        return;
    }
    
    if (participants.includes(name)) {
        alert('Ce participant existe déjà');
        return;
    }
    
    participants.push(name);
    input.value = '';
    saveData();
    updateUI();
}

// Supprimer un participant
function removeParticipant(name) {
    if (confirm(`Supprimer ${name} ? Cela supprimera aussi toutes ses dépenses.`)) {
        participants = participants.filter(p => p !== name);
        // Supprimer les dépenses liées à ce participant
        expenses = expenses.filter(e => e.payer !== name && !e.beneficiaries.includes(name));
        saveData();
        updateUI();
    }
}

// Ajouter une dépense
function addExpense() {
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const payer = document.getElementById('expense-payer').value;
    
    // Récupérer les bénéficiaires cochés
    const beneficiaryCheckboxes = document.querySelectorAll('#expense-beneficiaries input[type="checkbox"]:checked');
    const beneficiaries = Array.from(beneficiaryCheckboxes).map(cb => cb.value);
    
    // Validation
    if (description === '') {
        alert('Veuillez entrer une description');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    if (payer === '') {
        alert('Veuillez sélectionner qui a payé');
        return;
    }
    
    if (beneficiaries.length === 0) {
        alert('Veuillez sélectionner au moins un bénéficiaire');
        return;
    }
    
    // Créer la dépense
    const expense = {
        id: Date.now(),
        description,
        amount,
        payer,
        beneficiaries,
        date: new Date().toISOString()
    };
    
    expenses.push(expense);
    
    // Réinitialiser le formulaire
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-payer').value = '';
    document.querySelectorAll('#expense-beneficiaries input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    saveData();
    updateUI();
}

// Supprimer une dépense
function removeExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveData();
    updateUI();
}

// Calculer les dettes entre participants
function calculateDebts() {
    // Créer un objet pour suivre les balances de chaque participant
    const balances = {};
    
    // Initialiser les balances à 0
    participants.forEach(p => {
        balances[p] = 0;
    });
    
    // Calculer les balances
    expenses.forEach(expense => {
        const amountPerPerson = expense.amount / expense.beneficiaries.length;
        
        // Le payeur a avancé l'argent
        balances[expense.payer] += expense.amount;
        
        // Chaque bénéficiaire doit sa part
        expense.beneficiaries.forEach(beneficiary => {
            balances[beneficiary] -= amountPerPerson;
        });
    });
    
    // Créer des listes de débiteurs et créditeurs
    const debtors = [];  // Ceux qui doivent de l'argent
    const creditors = []; // Ceux à qui on doit de l'argent
    
    for (const [person, balance] of Object.entries(balances)) {
        if (balance < -0.01) {  // Doit de l'argent (avec tolérance pour les erreurs d'arrondi)
            debtors.push({ name: person, amount: -balance });
        } else if (balance > 0.01) {  // A avancé de l'argent
            creditors.push({ name: person, amount: balance });
        }
    }
    
    // Calculer les transactions optimales
    const transactions = [];
    
    // Trier par montant décroissant
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    let i = 0, j = 0;
    
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        const amount = Math.min(debtor.amount, creditor.amount);
        
        if (amount > 0.01) {  // Ignorer les montants très petits
            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: amount
            });
        }
        
        debtor.amount -= amount;
        creditor.amount -= amount;
        
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }
    
    return transactions;
}

// Mettre à jour l'interface
function updateUI() {
    updateParticipantsList();
    updateExpenseForm();
    updateExpensesList();
    updateDebtsSummary();
}

// Mettre à jour la liste des participants
function updateParticipantsList() {
    const list = document.getElementById('participants-list');
    
    if (participants.length === 0) {
        list.innerHTML = '<div class="no-data">Aucun participant. Ajoutez-en un pour commencer !</div>';
        return;
    }
    
    list.innerHTML = participants.map(p => `
        <div class="participant-tag">
            <span>${p}</span>
            <button onclick="removeParticipant('${p}')">×</button>
        </div>
    `).join('');
}

// Mettre à jour le formulaire de dépense
function updateExpenseForm() {
    const payerSelect = document.getElementById('expense-payer');
    const beneficiariesDiv = document.getElementById('expense-beneficiaries');
    
    // Mettre à jour le select du payeur
    payerSelect.innerHTML = '<option value="">Sélectionner...</option>' +
        participants.map(p => `<option value="${p}">${p}</option>`).join('');
    
    // Mettre à jour les checkboxes des bénéficiaires
    if (participants.length === 0) {
        beneficiariesDiv.innerHTML = '<div class="no-data">Ajoutez des participants d\'abord</div>';
    } else {
        beneficiariesDiv.innerHTML = participants.map(p => `
            <div class="beneficiary-checkbox">
                <input type="checkbox" id="ben-${p}" value="${p}">
                <label for="ben-${p}">${p}</label>
            </div>
        `).join('');
    }
}

// Mettre à jour la liste des dépenses
function updateExpensesList() {
    const list = document.getElementById('expenses-list');
    
    if (expenses.length === 0) {
        list.innerHTML = '<div class="no-data">Aucune dépense enregistrée</div>';
        return;
    }
    
    list.innerHTML = expenses.map(e => {
        const date = new Date(e.date).toLocaleDateString('fr-FR');
        return `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-title">${e.description}</div>
                    <div class="expense-details">
                        Payé par <strong>${e.payer}</strong> pour ${e.beneficiaries.join(', ')} • ${date}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="expense-amount">${e.amount.toFixed(2)} €</span>
                    <button onclick="removeExpense(${e.id})" class="btn btn-danger btn-small">×</button>
                </div>
            </div>
        `;
    }).join('');
}

// Mettre à jour le résumé des dettes
function updateDebtsSummary() {
    const summary = document.getElementById('debts-summary');
    
    if (participants.length === 0 || expenses.length === 0) {
        summary.innerHTML = '<div class="no-data">Ajoutez des participants et des dépenses pour voir le résumé</div>';
        return;
    }
    
    const debts = calculateDebts();
    
    if (debts.length === 0) {
        summary.innerHTML = '<div class="no-data">🎉 Tout le monde est à jour ! Aucune dette.</div>';
        return;
    }
    
    summary.innerHTML = debts.map(d => `
        <div class="debt-item">
            <div class="debt-description">
                <strong>${d.from}</strong> doit <strong>${d.to}</strong>
            </div>
            <div class="debt-amount">${d.amount.toFixed(2)} €</div>
        </div>
    `).join('');
}

// Tout effacer
function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.')) {
        participants = [];
        expenses = [];
        saveData();
        updateUI();
    }
}

// Permettre l'ajout avec la touche Entrée
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (document.activeElement.id === 'participant-name') {
            addParticipant();
        }
    }
});
