import { getState, addRecord, deleteRecordById, setCurrentMonth, getRecordsByMonth } from "../state.js";

export function initTracker() {
  const hbIncomeName = document.getElementById("hbIncomeName");
  const hbIncomeAmount = document.getElementById("hbIncomeAmount");
  const hbAddIncome = document.getElementById("hbAddIncome");
  const hbExpenceName = document.getElementById("hbExpenceName");
  const hbExpenseAmount = document.getElementById("hbExpenseAmount");
  const hbExpenceCat = document.getElementById("hbExpenceCat");
  const hbAddExpence = document.getElementById("hbAddExpence");
  const hbIncomeList = document.getElementById("hbIncomeList");
  const hbExpenceList = document.getElementById("hbExpenceList");
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  const currentMonthLabel = document.getElementById('currentMonthLabel');
  const hbIncomeDate = document.getElementById('hbIncomeDate');
  const hbExpenseDate = document.getElementById('hbExpenseDate');

  const today = new Date().toISOString().slice(0, 10); // '2026-08-04'
  hbIncomeDate.value = today;
  hbExpenseDate.value = today;

  hbAddIncome.addEventListener("click", function () {
    const name = hbIncomeName.value;
    const amount = Number(hbIncomeAmount.value);

    if (name === "" || isNaN(amount) || amount <= 0) {
      alert("Заполните все поля корректно");
      return; // Выходим, не добавляем запись
    }

    let record = {
      id: Date.now(),  
      type: "income",
      month: hbIncomeDate.value.slice(0, 7),
      name: name,
      amount: amount,
      date: new Date(hbIncomeDate.value + 'T00:00:00'),
    };

    addRecord(record);
    hbIncomeName.value = "";
    hbIncomeAmount.value = "";

    renderList(hbIncomeList, hbExpenceList);
  });

  hbAddExpence.addEventListener("click", function () {
    const name = hbExpenceName.value;
    const amount = Number(hbExpenseAmount.value);
    const category = hbExpenceCat.options[hbExpenceCat.selectedIndex].text;

    if (name === "" || isNaN(amount) || amount <= 0) {
      alert("Заполните все поля корректно");
      return; // Выходим, не добавляем запись
    }

    let record = {
      id: Date.now(),  
      type: "expense",
      month: hbExpenseDate.value.slice(0, 7),
      name: name,
      amount: amount,
      category: category,
      date: new Date(hbExpenseDate.value + 'T00:00:00'),
    };

    addRecord(record);
    hbExpenceName.value = "";
    hbExpenseAmount.value = "";
    hbExpenceCat.value = "";

    renderList(hbIncomeList, hbExpenceList);
  });

  prevMonth.addEventListener('click', function() {
    const state = getState();
    const newMonth = shiftMonth(state.currentMonth, -1);
    setCurrentMonth(newMonth);
    updateMonthLabel();
    renderList(hbIncomeList, hbExpenceList);
});

  nextMonth.addEventListener("click", function () {
    const state = getState();
    const newMonth = shiftMonth(state.currentMonth, 1);
    setCurrentMonth(newMonth);
    updateMonthLabel();
    renderList(hbIncomeList, hbExpenceList);
  });

  function shiftMonth(currentMonth, direction) {
    const [year, month] = currentMonth.split("-").map(Number);

    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }

    const monthStr = String(newMonth).padStart(2, "0");
    return `${newYear}-${monthStr}`;
  }

  updateMonthLabel();
  renderList(hbIncomeList, hbExpenceList);
};
   
export function renderList(hbIncomeList, hbExpenceList) {
  const categoryStats = document.getElementById('categoryStats');
  categoryStats.innerHTML = "";
  const state = getState();
  const allRecords = getRecordsByMonth(state.currentMonth);
  const hbBalance = document.getElementById("hbBalance");
  let totalIncome = 0;
  let totalExpense = 0;

  // Оставить только доходы
  const incomeRecords = allRecords.filter(function (record) {
    return record.type === "income";
  });

  // Оставить только расходы
  const expenseRecords = allRecords.filter(function (record) {
    return record.type === "expense";
  });

  hbIncomeList.innerHTML = "";

  if (incomeRecords.length === 0) {
    hbIncomeList.innerHTML =
      '<div class="hb-empty">Нет записей за этот месяц. Начните добавлять доходы и расходы.</div>';
  } else {
    const grouped = {};

    incomeRecords.forEach(function (item) {
      const dateObj = new Date(item.date);
      const day = dateObj.getDate();
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(item);
    });

    Object.keys(grouped).forEach(function (day) {
      // 1. Создать заголовок дня
      const dayHeader = document.createElement("div");
      dayHeader.textContent = day + " августа";
      hbIncomeList.appendChild(dayHeader);

      // 2. Отрисовать записи этого дня
      grouped[day].forEach(function (item) {
        // Создать div для записи
        const div = document.createElement("div");
        div.textContent = `${item.name}: ${item.amount} ₽`;
        // Создать кнопку удаления
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌ Удалить";
        deleteBtn.style.marginLeft = "10px";
        // Добавить в hbIncomeList
        div.appendChild(deleteBtn);
        hbIncomeList.appendChild(div);
        // Повесить обработчик удаления
        deleteBtn.addEventListener("click", function () {
          deleteRecordById(item.id);
          renderList(hbIncomeList, hbExpenceList);
        });

        totalIncome += item.amount;
      });
    });
  };

  hbExpenceList.innerHTML = "";

  if (expenseRecords.length === 0) {
    hbExpenceList.innerHTML =
      '<div class="hb-empty">Нет записей за этот месяц. Начните добавлять доходы и расходы.</div>';
  } else {
    const groupedExpenses = {};

    expenseRecords.forEach(function (item) {
      const dateObj = new Date(item.date);
      const day = dateObj.getDate();
      if (!groupedExpenses[day]) {
        groupedExpenses[day] = [];
      }
      groupedExpenses[day].push(item);
    });
    Object.keys(groupedExpenses).forEach(function (day) {
      // 1. Создать заголовок дня (как для доходов)
      const dayHeader = document.createElement('div');
      dayHeader.textContent = day + ' августа';
      hbExpenceList.appendChild(dayHeader);

      groupedExpenses[day].forEach(function(item) {
        const div = document.createElement("div");
        div.textContent = `${item.category} - ${item.name}: ${item.amount} ₽`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌ Удалить";
        deleteBtn.style.marginLeft = "10px";

        div.appendChild(deleteBtn);
        hbExpenceList.appendChild(div);

        deleteBtn.addEventListener("click", function () {
          deleteRecordById(item.id);
          renderList(hbIncomeList, hbExpenceList);
        });
        

        totalExpense += item.amount;
      });

    });
  };

  const balance = totalIncome - totalExpense;
  hbBalance.textContent = `Баланс: ${balance.toLocaleString("ru-RU")} ₽`;
  // Расходы по категориям
  const categoryTotals = {};
  expenseRecords.forEach(function (item) {
    if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += item.amount;
  });

  const categoryColors = {
    '🏠 Жильё': '#ff9900',
    '🛒 Продукты': '#4caf50',
    '🚗 Транспорт': '#2196f3',
    '💡 Коммунальные услуги': '#9c27b0',
    '👶 Дети': '#e91e63',
    '💳 Кредит': '#ff1744',
    '🏥 Здоровье': '#00e676',
    '📚 Образование': '#448aff',
    '🎬 Развлечения': '#ffab00 ',
    '👕 Одежда': '#e040fb'
};

  // Отрисовка
  Object.keys(categoryTotals).forEach(function(category) {
    const catHeader = document.createElement('div');
    catHeader.textContent = `${category}: ${categoryTotals[category]} ₽`;
    catHeader.style.color = categoryColors[category] || '#f8fafc';
    categoryStats.appendChild(catHeader);
  });

  document.getElementById('totalIncome').textContent = `${totalIncome.toLocaleString('ru-RU')} ₽`;
  document.getElementById('totalExpense').textContent = `${totalExpense.toLocaleString('ru-RU')} ₽`;
}

function updateMonthLabel() {
    const state = getState();
    const currentMonth = state.currentMonth;
    const labelElement = document.getElementById('currentMonthLabel');
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const [year, month] = currentMonth.split('-');
    const monthName = monthNames[parseInt(month) - 1];
    
    labelElement.textContent = `${monthName} ${year}`;
}