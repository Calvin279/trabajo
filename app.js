class HoursTracker {
    constructor() {
        this.hoursForm = document.getElementById('hoursForm');
        this.tableBody = document.getElementById('tableBody');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.notificationContainer = document.getElementById('notificationContainer');
        
        this.records = JSON.parse(localStorage.getItem('hoursRecords')) || [];
        
        this.initEventListeners();
        this.renderTable();
    }

    initEventListeners() {
        this.hoursForm.addEventListener('submit', this.handleSubmit.bind(this));
        this.searchButton.addEventListener('click', this.searchRecords.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const rank = document.getElementById('rank').value;
        const entryTime = new Date(document.getElementById('entryTime').value);
        const exitTime = new Date(document.getElementById('exitTime').value);
        
        const workedTime = this.calculateWorkedTime(entryTime, exitTime);
        
        const record = {
            name,
            rank,
            date: entryTime.toLocaleDateString(),
            entryTime: entryTime.toLocaleTimeString(),
            exitTime: exitTime.toLocaleTimeString(),
            workedTimeMinutes: workedTime
        };
        
        this.records.push(record);
        this.saveRecords();
        this.renderTable();
        this.checkHoursCompliance(record);
        
        this.hoursForm.reset();
    }

    calculateWorkedTime(entryTime, exitTime) {
        const diffMs = exitTime - entryTime;
        return Math.floor(diffMs / (1000 * 60));
    }

    checkHoursCompliance(record) {
        const weeklyMinutes = this.calculateWeeklyMinutes(record.name);
        
        if (weeklyMinutes < 3 * 60) {
            this.showNotification(`${record.name} no cumple con las 3 horas mínimas`);
        }
    }

    calculateWeeklyMinutes(name) {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        
        return this.records
            .filter(record => {
                const recordDate = new Date(record.date.split('/').reverse().join('-'));
                return record.name === name && recordDate >= startOfWeek;
            })
            .reduce((total, record) => total + record.workedTimeMinutes, 0);
    }

    renderTable(filteredRecords = null) {
        const recordsToRender = filteredRecords || this.records;
        
        this.tableBody.innerHTML = '';
        
        recordsToRender.forEach(record => {
            const weeklyMinutes = this.calculateWeeklyMinutes(record.name);
            const isHoursFulfilled = weeklyMinutes >= 28 * 60;
            
            const row = document.createElement('tr');
            row.classList.add(isHoursFulfilled ? 'hours-fulfilled' : 'hours-not-fulfilled');
            
            row.innerHTML = `
                <td>${record.name}</td>
                <td>${record.rank}</td>
                <td>${record.date}</td>
                <td>${record.entryTime}</td>
                <td>${record.exitTime}</td>
                <td>${this.formatMinutesToHMS(record.workedTimeMinutes)}</td>
            `;
            
            this.tableBody.appendChild(row);
        });
    }

    formatMinutesToHMS(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const secs = Math.floor((minutes * 60) % 60);
        return `${hours}h ${mins}m ${secs}s`;
    }

    searchRecords() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        const filteredRecords = this.records.filter(record => 
            record.name.toLowerCase().includes(searchTerm)
        );
        
        this.renderTable(filteredRecords);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveRecords() {
        localStorage.setItem('hoursRecords', JSON.stringify(this.records));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HoursTracker();
});