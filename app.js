// Données de l'application
let participants = [];
let expenses = [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderParticipants();
    renderExpenses();
    calculateDebts();
});

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

// Sauvegarder les données dans localStorage
function saveData() {
    localStorage.setItem('participants', JSON.stringify(participants));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Ajouter un participant
function addParticipant() {
    const nameInput = document.getElementById('participantName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('⚠️ Veuillez entrer un nom');
        return;
    }
    
    if (participants.includes(name)) {
        alert('⚠️ Ce participant existe déjà');
        return;
    }
    
    participants.push(name);
    nameInput.value = '';
    
    saveData();
    renderParticipants();
    updatePayerSelect();
    updateBeneficiariesList();
    calculateDebts();
}

// Supprimer un participant
function removeParticipant(name) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
        return;
    }
    
    // Vérifier si le participant a des dépenses
    const hasExpenses = expenses.some(exp => 
        exp.payer === name || exp.beneficiaries.includes(name)
    );
    
    if (hasExpenses) {
        alert('⚠️ Ce participant a des dépenses associées. Supprimez-les d\'abord.');
        return;
    }
    
    participants = participants.filter(p => p !== name);
    
    saveData();
    renderParticipants();
    updatePayerSelect();
    updateBeneficiariesList();
    calculateDebts();
}

// Afficher les participants
function renderParticipants() {
    const list = document.getElementById('participantsList');
    
    if (participants.length === 0) {
        list.innerHTML = '<p class="no-data">Aucun participant ajouté</p>';
        return;
    }
    
    list.innerHTML = participants.map(name => `
        <div class="participant-tag">
            <span>${name}</span>
            <button class="remove-btn" onclick="removeParticipant('${name}')">×</button>
        </div>
    `).join('');
}

// Mettre à jour la liste déroulante du payeur
function updatePayerSelect() {
    const select = document.getElementById('expensePayer');
    select.innerHTML = '<option value="">Qui a payé ?</option>';
    
    participants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Mettre à jour la liste des bénéficiaires
function updateBeneficiariesList() {
    const list = document.getElementById('beneficiariesList');
    
    if (participants.length === 0) {
        list.innerHTML = '<p class="no-data">Ajoutez des participants d\'abord</p>';
        return;
    }
    
    list.innerHTML = participants.map(name => `
        <div class="beneficiary-checkbox">
            <input type="checkbox" id="beneficiary-${name}" value="${name}" checked>
            <label for="beneficiary-${name}">${name}</label>
        </div>
    `).join('');
}

// Ajouter une dépense
function addExpense() {
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const payer = document.getElementById('expensePayer').value;
    
    if (!description) {
        alert('⚠️ Veuillez entrer une description');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('⚠️ Veuillez entrer un montant valide');
        return;
    }
    
    if (!payer) {
        alert('⚠️ Veuillez sélectionner qui a payé');
        return;
    }
    
    // Récupérer les bénéficiaires cochés
    const beneficiaries = [];
    participants.forEach(name => {
        const checkbox = document.getElementById(`beneficiary-${name}`);
        if (checkbox && checkbox.checked) {
            beneficiaries.push(name);
        }
    });
    
    if (beneficiaries.length === 0) {
        alert('⚠️ Veuillez sélectionner au moins un bénéficiaire');
        return;
    }
    
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
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expensePayer').value = '';
    updateBeneficiariesList();
    
    saveData();
    renderExpenses();
    calculateDebts();
}

// Supprimer une dépense
function removeExpense(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
        return;
    }
    
    expenses = expenses.filter(exp => exp.id !== id);
    
    saveData();
    renderExpenses();
    calculateDebts();
}

// Afficher les dépenses
function renderExpenses() {
    const list = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        list.innerHTML = '<p class="no-data">Aucune dépense enregistrée</p>';
        return;
    }
    
    list.innerHTML = expenses.map(exp => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-description">${exp.description}</div>
                <div class="expense-details">
                    Payé par <strong>${exp.payer}</strong> pour 
                    <strong>${exp.beneficiaries.join(', ')}</strong>
                </div>
            </div>
            <span class="expense-amount">${exp.amount.toFixed(2)} €</span>
            <button class="expense-delete" onclick="removeExpense(${exp.id})">🗑️</button>
        </div>
    `).join('');
}

// Calculer les dettes
function calculateDebts() {
    const debtsDiv = document.getElementById('debtsCalculation');
    
    if (participants.length === 0 || expenses.length === 0) {
        debtsDiv.innerHTML = '<p class="no-data">Ajoutez des participants et des dépenses pour voir les dettes</p>';
        return;
    }
    
    // Calculer le solde de chaque participant
    const balances = {};
    participants.forEach(p => balances[p] = 0);
    
    expenses.forEach(exp => {
        const sharePerPerson = exp.amount / exp.beneficiaries.length;
        
        // Le payeur a avancé l'argent
        balances[exp.payer] += exp.amount;
        
        // Chaque bénéficiaire doit sa part
        exp.beneficiaries.forEach(beneficiary => {
            balances[beneficiary] -= sharePerPerson;
        });
    });
    
    // Simplifier les dettes
    const debts = simplifyDebts(balances);
    
    if (debts.length === 0) {
        debtsDiv.innerHTML = '<p class="no-data">✅ Tout le monde est à égalité !</p>';
        return;
    }
    
    debtsDiv.innerHTML = debts.map(debt => `
        <div class="debt-item">
            <span><strong>${debt.from}</strong></span>
            <span class="debt-arrow">→</span>
            <span><strong>${debt.to}</strong></span>
            <span class="debt-amount">${debt.amount.toFixed(2)} €</span>
        </div>
    `).join('');
}

// Simplifier les dettes (algorithme de minimisation)
function simplifyDebts(balances) {
    const debts = [];
    
    // Séparer les créditeurs et les débiteurs
    const creditors = [];
    const debtors = [];
    
    for (const [person, balance] of Object.entries(balances)) {
        if (balance > 0.01) {
            creditors.push({ person, amount: balance });
        } else if (balance < -0.01) {
            debtors.push({ person, amount: -balance });
        }
    }
    
    // Trier pour optimiser
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
    
    // Calculer les transactions minimales
    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];
        
        const amount = Math.min(creditor.amount, debtor.amount);
        
        debts.push({
            from: debtor.person,
            to: creditor.person,
            amount: amount
        });
        
        creditor.amount -= amount;
        debtor.amount -= amount;
        
        if (creditor.amount < 0.01) i++;
        if (debtor.amount < 0.01) j++;
    }
    
    return debts;
}

// Tout effacer
function clearAll() {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.')) {
        return;
    }
    
    participants = [];
    expenses = [];
    
    localStorage.clear();
    
    renderParticipants();
    renderExpenses();
    updatePayerSelect();
    updateBeneficiariesList();
    calculateDebts();
}

// Exporter les données
function exportData() {
    const data = {
        participants,
        expenses,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `splitpotes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Permettre l'ajout avec la touche Entrée
document.getElementById('participantName')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addParticipant();
});

document.getElementById('expenseDescription')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('expenseAmount').focus();
});

document.getElementById('expenseAmount')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('expensePayer').focus();
});
