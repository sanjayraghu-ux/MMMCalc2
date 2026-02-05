const inputs = ['products', 'consulting', 'onboard'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

function updateProductRows() {
    const count = parseInt(el.products.value) || 0;
    const existingRows = productContainer.querySelectorAll('.product-row').length;

    if (count > existingRows) {
        for (let i = existingRows + 1; i <= count; i++) {
            const row = document.createElement('div');
            row.className = 'product-row';
            row.innerHTML = `
                <input type="text" placeholder="Product ${i} Name" class="prod-name">
                <select class="prod-cadence">
                    <option value="365">Daily (365/yr)</option>
                    <option value="180">15 per month (180/yr)</option>
                    <option value="104">2 per week (104/yr)</option>
                    <option value="52">1 per week (52/yr)</option>
                    <option value="12" selected>Monthly (12/yr)</option>
                </select>
            `;
            productContainer.appendChild(row);
            row.querySelector('.prod-cadence').addEventListener('change', calculate);
        }
    } else if (count < existingRows) {
        for (let i = existingRows; i > count; i--) {
            productContainer.removeChild(productContainer.lastChild);
        }
    }
}

function calculate() {
    updateProductRows();
    const numProducts = parseInt(el.products.value) || 0;
    const MIN_PLATFORM = 2500;
    const SUPPORT = 750;
    const CONSULT_RATE = 250;

    // 1. Logic: Sum of all product costs
    let totalProductCost = 0;
    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        const annual = parseInt(sel.value);
        let rate = 450;
        if (annual >= 365) rate = 200;
        else if (annual >= 180) rate = 300;
        else if (annual >= 104) rate = 350;
        
        // Cost = (Units per Year * Price per Unit) / 12 Months
        totalProductCost += (annual * rate) / 12;
    });

    // 2. Aggregate Platform with $2,500 Floor
    const finalPlatform = Math.max(MIN_PLATFORM, totalProductCost);
    
    // 3. Totals
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    const monthlyTotal = finalPlatform + SUPPORT + consultTotal;
    
    const perProductOnboard = parseFloat(el.onboard.value || 0);
    const totalOnboarding = perProductOnboard * numProducts;
    
    // 4. Year 1 Total = (Sum of Monthly * 12) + Sum of Onboarding
    const yearOne = (monthlyTotal * 12) + totalOnboarding;

    // UI Updates
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyTotal).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatform).toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('onboardRate').innerText = '$' + perProductOnboard.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    
    const badge = document.getElementById('minFeeBadge');
    badge.style.visibility = (finalPlatform === MIN_PLATFORM) ? 'visible' : 'hidden';
}

function resetCalculator() {
    if (confirm("Reset all estimator values?")) {
        el.products.value = 1; el.consulting.value = 0; el.onboard.value = 15000;
        productContainer.innerHTML = ''; calculate();
    }
}

function exportPDF() {
    html2pdf().from(document.getElementById('capture-area')).save().then(() => {
        document.getElementById('successOverlay').style.display = 'flex';
    });
}

function closeSuccess() { document.getElementById('successOverlay').style.display = 'none'; }

inputs.forEach(id => el[id].addEventListener('input', calculate));
calculate();
