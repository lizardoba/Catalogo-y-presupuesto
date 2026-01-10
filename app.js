// ========== CONFIGURACIÓN ==========

const EXCHANGE_RATES = {
  PEN: 1,
  USD: 0.297,
  EUR: 0.255
};

const CURRENCY_SYMBOLS = {
  PEN: 'S/',
  USD: 'US$',
  EUR: '€'
};

let currentCurrency = localStorage.getItem('currency') || 'PEN';
let currentEditId = null;
let tempSubcategories = [];
let currentBudgetItems = [];

// ========== CLASES ==========

class TreatmentManager {
  constructor() {
    this.treatments = this.loadFromStorage();
    if (this.treatments.length === 0) {
      this.loadDefaultData();
    }
  }

  loadFromStorage() {
    const data = localStorage.getItem('dental_treatments');
    return data ? JSON.parse(data) : [];
  }

  saveToStorage() {
    localStorage.setItem('dental_treatments', JSON.stringify(this.treatments));
  }

  loadDefaultData() {
    this.treatments = [
      {
        id: Date.now() + 1,
        nombre: 'Ortodoncia',
        descripcion: 'Alineación dental con brackets',
        precio: 2500,
        imagen: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?fit=crop',
        subcategorias: [
          { id: 1, nombre: 'Brackets Metálicos', precio: 2500 },
          { id: 2, nombre: 'Brackets Autoligado', precio: 3500 },
          { id: 3, nombre: 'Alineadores Invisibles', precio: 4500 }
        ]
      },
      {
        id: Date.now() + 2,
        nombre: 'Endodoncia',
        descripcion: 'Tratamiento de conducto',
        precio: 700,
        imagen: 'https://images.unsplash.com/photo-1606811841689-23db3c34146f?fit=crop',
        subcategorias: [
          { id: 1, nombre: 'Monoradicular', precio: 600 },
          { id: 2, nombre: 'Multiradicular', precio: 1000 }
        ]
      },
      {
        id: Date.now() + 3,
        nombre: 'Limpieza Dental',
        descripcion: 'Profilaxis profesional',
        precio: 120,
        imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?fit=crop',
        subcategorias: []
      },
      {
        id: Date.now() + 4,
        nombre: 'Implante Dental',
        descripcion: 'Reemplazo permanente',
        precio: 3200,
        imagen: 'https://images.unsplash.com/photo-1606811841689-23db3c34146f?fit=crop',
        subcategorias: [
          { id: 1, nombre: 'Implante Unitario', precio: 3200 },
          { id: 2, nombre: 'Implante + Corona', precio: 4500 }
        ]
      },
      {
        id: Date.now() + 5,
        nombre: 'Blanqueamiento',
        descripcion: 'Aclara el color dental',
        precio: 600,
        imagen: 'https://images.unsplash.com/photo-1607613674874-fa165c2c2844?fit=crop',
        subcategorias: [
          { id: 1, nombre: 'En Consultorio', precio: 600 },
          { id: 2, nombre: 'Casero', precio: 400 }
        ]
      }
    ];

    this.saveToStorage();
  }

  add(treatment) {
    treatment.id = Date.now();
    this.treatments.push(treatment);
    this.saveToStorage();
  }

  update(id, treatment) {
    const index = this.treatments.findIndex(t => t.id === id);
    if (index !== -1) {
      this.treatments[index] = { ...treatment, id };
      this.saveToStorage();
    }
  }

  delete(id) {
    this.treatments = this.treatments.filter(t => t.id !== id);
    this.saveToStorage();
  }

  get(id) {
    return this.treatments.find(t => t.id === id);
  }

  getAll() {
    return this.treatments;
  }
}

class BudgetManager {
  constructor() {
    this.budgets = this.loadFromStorage();
  }

  loadFromStorage() {
    const data = localStorage.getItem('dental_budgets');
    return data ? JSON.parse(data) : [];
  }

  saveToStorage() {
    localStorage.setItem('dental_budgets', JSON.stringify(this.budgets));
  }

  add(budget) {
    budget.id = Date.now();
    budget.date = new Date().toISOString();
    this.budgets.push(budget);
    this.saveToStorage();
  }

  delete(id) {
    this.budgets = this.budgets.filter(b => b.id !== id);
    this.saveToStorage();
  }

  getAll() {
    return this.budgets;
  }
}

const manager = new TreatmentManager();
const budgetManager = new BudgetManager();

// ========== FUNCIONES DE MONEDA ==========

function formatPrice(price) {
  const rate = EXCHANGE_RATES[currentCurrency];
  const symbol = CURRENCY_SYMBOLS[currentCurrency];
  const converted = price * rate;
  return `${symbol} ${converted.toFixed(2)}`;
}

const currencySelector = document.getElementById('currencySelector');
currencySelector.value = currentCurrency;

currencySelector.addEventListener('change', function () {
  currentCurrency = this.value;
  localStorage.setItem('currency', currentCurrency);
  renderAll();
  updateSubcategorySelectOptions();
  renderBudgetItems();
});

// ========== FUNCIONES DE UI ==========

function showSuccess(msg) {
  const el = document.getElementById('successMessage');
  el.innerHTML = `<div class="success-message">${msg}</div>`;
  setTimeout(() => (el.innerHTML = ''), 3000);
}

function openModal(treatmentId = null) {
  tempSubcategories = [];
  document.getElementById('treatmentName').value = '';
  document.getElementById('treatmentDesc').value = '';
  document.getElementById('treatmentPrice').value = '';
  document.getElementById('treatmentImage').value = '';

  if (treatmentId) {
    const t = manager.get(treatmentId);
    if (t) {
      currentEditId = treatmentId;
      document.getElementById('modalTitle').textContent = 'Editar Tratamiento';
      document.getElementById('treatmentName').value = t.nombre;
      document.getElementById('treatmentDesc').value = t.descripcion;
      document.getElementById('treatmentPrice').value = t.precio || '';
      document.getElementById('treatmentImage').value = t.imagen || '';
      tempSubcategories = t.subcategorias ? [...t.subcategorias] : [];
    }
  } else {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Tratamiento';
  }

  renderModalSubs();
  document.getElementById('treatmentModal').classList.add('active');
}

function closeModal() {
  document.getElementById('treatmentModal').classList.remove('active');
  currentEditId = null;
  tempSubcategories = [];
}

function addSubcategory() {
  const name = document.getElementById('subName').value.trim();
  const price = parseFloat(document.getElementById('subPrice').value);

  if (!name || !price) {
    alert('Ingresa nombre y precio');
    return;
  }

  tempSubcategories.push({
    id: Date.now(),
    nombre: name,
    precio: price
  });

  document.getElementById('subName').value = '';
  document.getElementById('subPrice').value = '';
  renderModalSubs();
}

function removeSubcategory(id) {
  tempSubcategories = tempSubcategories.filter(s => s.id !== id);
  renderModalSubs();
}

function renderModalSubs() {
  const container = document.getElementById('subcategoriesList');

  if (tempSubcategories.length === 0) {
    container.innerHTML = '<p class="empty-state">Sin subcategorías</p>';
    return;
  }

  container.innerHTML = tempSubcategories
    .map(
      sub => `
      <div class="budget-card__item">
        <span>${sub.nombre}</span>
        <span>${formatPrice(sub.precio)}</span>
        <button class="btn btn-secondary" style="flex:0;" onclick="removeSubcategory(${sub.id})">🗑️</button>
      </div>
    `
    )
    .join('');
}

function isValidImageUrl(url) {
  if (!url) return true;
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  } catch {
    return false;
  }
}

function saveTreatment() {
  const name = document.getElementById('treatmentName').value.trim();
  const desc = document.getElementById('treatmentDesc').value.trim();
  const price = parseFloat(document.getElementById('treatmentPrice').value) || 0;
  const image = document.getElementById('treatmentImage').value.trim();

  if (!name) {
    alert('Ingresa el nombre del tratamiento');
    return;
  }

  if (image && !isValidImageUrl(image)) {
    if (!confirm('La URL de imagen parece inválida. ¿Guardar de todos modos?')) {
      return;
    }
  }

  const treatment = {
    nombre: name,
    descripcion: desc,
    precio: price,
    imagen: image,
    subcategorias: tempSubcategories
  };

  if (currentEditId) {
    manager.update(currentEditId, treatment);
    showSuccess('✅ Tratamiento actualizado');
  } else {
    manager.add(treatment);
    showSuccess('✅ Tratamiento creado');
  }

  closeModal();
  renderAll();
}

function deleteTreatment(id) {
  if (confirm('¿Eliminar este tratamiento?')) {
    manager.delete(id);
    showSuccess('✅ Tratamiento eliminado');
    renderAll();
  }
}

function renderTreatmentCard(treatment, showButtons = false) {
  const hasSubs = treatment.subcategorias && treatment.subcategorias.length > 0;
  const showBasePrice = !hasSubs && treatment.precio > 0;
  const priceHTML = showBasePrice
    ? `<div class="service-card__price">${formatPrice(treatment.precio)}</div>`
    : '';

  let subsHTML = '';
  if (hasSubs) {
    subsHTML += '<div class="service-card__description"><strong>💊 Opciones:</strong></div>';
    subsHTML += '<div class="budget-card__items">';
    treatment.subcategorias.forEach(sub => {
      subsHTML += `
        <div class="budget-card__item">
          <span>${sub.nombre}</span>
          <span>${formatPrice(sub.precio)}</span>
        </div>
      `;
    });
    subsHTML += '</div>';
  }

  const imgHTML = treatment.imagen
    ? `<img src="${treatment.imagen}" alt="${treatment.nombre}" />`
    : '';

  const buttonsHTML = showButtons
    ? `
      <div class="service-card__buttons">
        <button class="btn btn-primary" onclick="openModal(${treatment.id})">✏️ Editar</button>
        <button class="btn btn-secondary" onclick="deleteTreatment(${treatment.id})">🗑️</button>
      </div>
    `
    : '';

  return `
    <article class="service-card">
      ${imgHTML}
      <div class="service-card__content">
        <h3 class="service-card__title">${treatment.nombre}</h3>
        <p class="service-card__description">${treatment.descripcion || ''}</p>
        ${priceHTML}
        ${subsHTML}
        ${buttonsHTML}
      </div>
    </article>
  `;
}

function renderAll() {
  const treatments = manager.getAll();

  document.getElementById('servicesGrid').innerHTML =
    treatments.length > 0
      ? treatments.map(t => renderTreatmentCard(t, false)).join('')
      : '<p class="empty-state">Sin tratamientos</p>';

  document.getElementById('manageGrid').innerHTML =
    treatments.length > 0
      ? treatments.map(t => renderTreatmentCard(t, true)).join('')
      : '<p class="empty-state">Sin tratamientos</p>';

  populateTreatmentSelect();
  renderSavedBudgets();
}

// ========== PRESUPUESTOS ==========

function populateTreatmentSelect() {
  const select = document.getElementById('treatmentSelect');
  select.innerHTML = '<option value="">-- Selecciona un tratamiento --</option>';

  manager.getAll().forEach(t => {
    select.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
  });
}

function updateSubcategorySelectOptions() {
  const treatmentId = parseInt(document.getElementById('treatmentSelect').value);
  const subSelect = document.getElementById('subcategorySelect');

  subSelect.innerHTML = '<option value="">-- Sin subcategoría --</option>';
  subSelect.disabled = true;

  if (treatmentId) {
    const treatment = manager.get(treatmentId);
    if (treatment && treatment.subcategorias && treatment.subcategorias.length > 0) {
      subSelect.disabled = false;
      treatment.subcategorias.forEach(sub => {
        subSelect.innerHTML += `<option value="${sub.id}" data-price="${sub.precio}">
          ${sub.nombre} - ${formatPrice(sub.precio)}
        </option>`;
      });
    }
  }
}

document.getElementById('treatmentSelect').addEventListener('change', updateSubcategorySelectOptions);

function addToBudget() {
  const treatmentId = parseInt(document.getElementById('treatmentSelect').value);

  if (!treatmentId) {
    alert('Selecciona un tratamiento');
    return;
  }

  const treatment = manager.get(treatmentId);
  const subId = document.getElementById('subcategorySelect').value;

  let item = {
    treatmentId: treatment.id,
    treatmentName: treatment.nombre,
    subcategoryId: null,
    subcategoryName: null,
    price: treatment.precio
  };

  if (subId) {
    const sub = treatment.subcategorias.find(s => s.id == subId);
    if (sub) {
      item.subcategoryId = sub.id;
      item.subcategoryName = sub.nombre;
      item.price = sub.precio;
    }
  }

  currentBudgetItems.push(item);
  renderBudgetItems();
}

function renderBudgetItems() {
  const tbody = document.getElementById('budgetItems');
  tbody.innerHTML = '';

  let total = 0;

  currentBudgetItems.forEach((item, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${item.treatmentName}</td>
        <td>${item.subcategoryName || '—'}</td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <button class="btn btn-secondary" onclick="removeBudgetItem(${index})">🗑️</button>
        </td>
      </tr>
    `;
    total += item.price;
  });

  document.getElementById('budgetTotal').textContent = formatPrice(total);
}

function removeBudgetItem(index) {
  currentBudgetItems.splice(index, 1);
  renderBudgetItems();
}

function clearBudget() {
  currentBudgetItems = [];
  document.getElementById('budgetClientName').value = '';
  document.getElementById('treatmentSelect').value = '';
  document.getElementById('subcategorySelect').innerHTML = '<option value="">-- Sin subcategoría --</option>';
  document.getElementById('subcategorySelect').disabled = true;
  renderBudgetItems();
}

function saveBudget() {
  if (currentBudgetItems.length === 0) {
    alert('Agrega al menos un tratamiento');
    return;
  }

  const clientName =
    document.getElementById('budgetClientName').value.trim() || 'Cliente sin nombre';
  const total = currentBudgetItems.reduce((sum, item) => sum + item.price, 0);

  budgetManager.add({
    clientName,
    items: currentBudgetItems,
    total
  });

  showSuccess('✅ Presupuesto guardado');
  clearBudget();
  renderSavedBudgets();
}

function renderSavedBudgets() {
  const container = document.getElementById('savedBudgets');
  const budgets = budgetManager.getAll();

  if (budgets.length === 0) {
    container.innerHTML = '<p class="empty-state">Sin presupuestos guardados</p>';
    return;
  }

  container.innerHTML = budgets
    .map(budget => {
      const date = new Date(budget.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const itemsHTML = budget.items
        .map(
          item => `
          <div class="budget-card__item">
            <span>${item.treatmentName}${item.subcategoryName ? ' - ' + item.subcategoryName : ''}</span>
            <span>${formatPrice(item.price)}</span>
          </div>
        `
        )
        .join('');

      return `
        <article class="budget-card">
          <div class="budget-card__header">
            <div>
              <div class="budget-card__title">${budget.clientName}</div>
              <div class="budget-card__date">${date}</div>
            </div>
            <div>${formatPrice(budget.total)}</div>
          </div>
          <div class="budget-card__items">
            ${itemsHTML}
          </div>
          <div class="budget-card__actions">
            <button class="btn btn-primary" onclick="printBudget(${budget.id})">🖨️ Imprimir</button>
            <button class="btn btn-success" onclick="sendWhatsApp(${budget.id})">📱 WhatsApp</button>
            <button class="btn btn-secondary" onclick="deleteBudget(${budget.id})">🗑️</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function deleteBudget(id) {
  if (confirm('¿Eliminar este presupuesto?')) {
    budgetManager.delete(id);
    showSuccess('✅ Presupuesto eliminado');
    renderSavedBudgets();
  }
}

function printBudget(budgetId) {
  const budget =
    typeof budgetId === 'string' && budgetId.startsWith('temp_')
      ? window.__tempBudget
      : budgetManager.getAll().find(b => b.id === budgetId);

  if (!budget) return;

  const date = new Date(budget.date).toLocaleDateString('es-ES');
  let rowsHTML = '';

  budget.items.forEach(item => {
    rowsHTML += `
      <tr>
        <td>${item.treatmentName}</td>
        <td>${item.subcategoryName || '—'}</td>
        <td>${formatPrice(item.price)}</td>
      </tr>
    `;
  });

  const html = `
    <html>
      <head>
        <title>Presupuesto - ${budget.clientName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #218C8D; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #218C8D; color: white; }
          .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Presupuesto Dental</h1>
        <p><strong>Cliente:</strong> ${budget.clientName}</p>
        <p><strong>Fecha:</strong> ${date}</p>

        <table>
          <thead>
            <tr>
              <th>Tratamiento</th>
              <th>Subcategoría</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <div class="total">TOTAL: ${formatPrice(budget.total)}</div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          };
        </script>
      </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    alert('Permite ventanas emergentes para imprimir');
  }
}

function printCurrentBudget() {
  if (currentBudgetItems.length === 0) {
    alert('No hay items en el presupuesto');
    return;
  }

  const clientName =
    document.getElementById('budgetClientName').value.trim() || 'Cliente';
  const total = currentBudgetItems.reduce((sum, item) => sum + item.price, 0);

  window.__tempBudget = {
    id: 'temp_' + Date.now(),
    clientName,
    items: [...currentBudgetItems],
    total,
    date: new Date().toISOString()
  };

  printBudget(window.__tempBudget.id);
}

function sendWhatsApp(id) {
  const budget = budgetManager.getAll().find(b => b.id === id);
  if (!budget) return;

  let message = `*Presupuesto Dental*\n\n*Cliente:* ${budget.clientName}\n\n*Tratamientos:*\n`;
  budget.items.forEach(item => {
    const sub = item.subcategoryName ? ` (${item.subcategoryName})` : '';
    message += `• ${item.treatmentName}${sub}: ${formatPrice(item.price)}\n`;
  });
  message += `\n*TOTAL:* ${formatPrice(budget.total)}`;

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ========== EXPORT/IMPORT ==========

function exportJSON() {
  const data = JSON.stringify(manager.getAll(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tratamientos_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showSuccess('✅ JSON descargado');
}

function copyJSON() {
  const data = JSON.stringify(manager.getAll(), null, 2);
  navigator.clipboard
    .writeText(data)
    .then(() => {
      showSuccess('✅ Copiado al portapapeles');
    })
    .catch(() => {
      alert('Error al copiar. Intenta manualmente.');
    });
}

function importJSON() {
  document.getElementById('importFile').click();
}

document.getElementById('importFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data)) {
        data.forEach(t => {
          t.id = Date.now() + Math.random();
          if (t.subcategorias) {
            t.subcategorias.forEach(s => (s.id = Date.now() + Math.random()));
          }
        });
        manager.treatments = data;
        manager.saveToStorage();
        showSuccess('✅ Datos importados');
        renderAll();
      } else {
        alert('Formato JSON inválido');
      }
    } catch (e) {
      alert('Error al leer el archivo');
    }
  };
  reader.readAsText(file);
});

// ========== TABS ==========

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const tabName = this.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// ========== INICIALIZACIÓN ==========

window.addEventListener('DOMContentLoaded', function () {
  renderAll();
});

// Cerrar modal al hacer clic fuera
document.getElementById('treatmentModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});
