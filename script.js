const inputs = ['products', 'consulting', 'onboard', 'billing'];
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

function duplicateLastProduct() {
    const currentVal = parseInt(el.products.value);
    if (currentVal < 20) {
        const rows = productContainer.querySelectorAll('.prod-cadence');
        const lastCadence = rows.length > 0 ? rows[rows.length - 1].value : "12";
        
        el.products.value = currentVal + 1;
        updateProductRows();
        
        const newRows = productContainer.querySelectorAll('.prod-cadence');
        newRows[newRows.length - 1].value = lastCadence;
        calculate();
    }
}

function calculate() {
    updateProductRows();
    const numProducts = parseInt(el.products.value) || 0;
    
    const MIN_PLATFORM = 2500;
    const SUPPORT_RATE = 750;
    const CONSULT_RATE = 250;

    let totalPlatformSum = 0;
    let totalAnnualModels = 0;

    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        const annualModels = parseInt(sel.value);
        let costPerModel = 450;
        if (annualModels >= 365) costPerModel = 200;
        else if (annualModels >= 180) costPerModel = 300;
        else if (annualModels >= 104) costPerModel = 350;

        totalAnnualModels += annualModels;
        totalPlatformSum += (annualModels * costPerModel) / 12;
    });

    const finalPlatformFee = Math.max(MIN_PLATFORM, totalPlatformSum);
    const totalSupport = numProducts * SUPPORT_RATE;
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    const monthlyBaseTotal = finalPlatformFee + totalSupport + consultTotal;

    const billingMultiplier = parseFloat(el.billing.value);
    const monthlyDiscounted = monthlyBaseTotal * billingMultiplier;
    const annualSavings = (monthlyBaseTotal - monthlyDiscounted) * 12;

    const totalOnboarding = parseFloat(el.onboard.value || 0) * numProducts;
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;

    const avgPricePerModel = totalAnnualModels > 0 ? ((monthlyDiscounted * 12) / totalAnnualModels) : 0;

    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatformFee).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    const savingsEl = document.getElementById('savingsContainer');
    savingsEl.style.display = annualSavings > 0 ? 'inline-block' : 'none';
    if (annualSavings > 0) document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();

    document.getElementById('minFeeBadge').style.visibility = (finalPlatformFee === MIN_PLATFORM) ? 'visible' : 'hidden';
}

function resetCalculator() {
    if (confirm("Reset everything?")) {
        el.products.value = 1; el.consulting.value = 0; el.onboard.value = 15000; el.billing.value = "1";
        productContainer.innerHTML = ''; calculate();
    }
}

function exportPDF() {
    const btn = document.getElementById('exportBtn');
    btn.innerText = "Generating PDF...";
    html2pdf().from(document.getElementById('capture-area')).save().then(() => {
        btn.innerText = "Export Proposal PDF";
        document.getElementById('successOverlay').style.display = 'flex';
    });
}

function closeSuccess() { document.getElementById('successOverlay').style.display = 'none'; }

inputs.forEach(id => el[id].addEventListener('input', calculate));
el.billing.addEventListener('change', calculate);
calculate();
