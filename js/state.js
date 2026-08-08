const initialState = {
    currentMonth: '2026-08',
    records: []
};

let state = { ...initialState };

function getState() {
  return { ...state };
};

function addRecord(record) {
  state.records.push(record); 
  saveState(); 
};

function deleteRecord(index) {
    state.records.splice(index, 1);
    saveState();
};

function clearRecords() {
    state.records = []; 
    saveState();        
};

function saveState() {
    localStorage.setItem('expenseTracker', JSON.stringify(state));
};

function loadState() {
    const data = localStorage.getItem('expenseTracker');

    if(data) {
        state = JSON.parse(data);
    }
};

function deleteRecordById(id) {
    const index = state.records.findIndex(function(item) {
        return item.id === id;
    });
    
    if (index !== -1) {
        state.records.splice(index, 1);
        saveState();
    }
};

function setCurrentMonth(month) {
    state.currentMonth = month;
    saveState();
};

function getRecordsByMonth(month) {
    return state.records.filter(function(record) {
        return record.month === month;
    });
}

export { getState, addRecord, deleteRecord, clearRecords, loadState, deleteRecordById, setCurrentMonth, getRecordsByMonth }

