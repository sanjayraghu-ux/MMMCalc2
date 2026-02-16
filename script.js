const inputs = ['products', 'consulting', 'onboard', 'billing'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

function updatePreparedBy() {
    const val = document.getElementById('preparedFor').value;
    document.getElementById('preparedForDisplay').innerText = val ? `Prepared For: ${val}` : '';
}

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
    const SUPPORT_RATE = 750;
    const CONSULT_RATE = 250;

    let totalPlatformSum = 0;
    let totalAnnualModels = 0;

    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        const annualModels = parseInt(sel.value);
        let monthlyRate = 2500; 
        if (annualModels === 365) monthlyRate = 6083;
        else if (annualModels === 180) monthlyRate = 4500;
        else if (annualModels === 104) monthlyRate = 3033;
        totalAnnualModels += annualModels;
        totalPlatformSum += monthlyRate;
    });

    const totalSupport = numProducts * SUPPORT_RATE;
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    const monthlyBase = totalPlatformSum + totalSupport + consultTotal;
    const billingMultiplier = parseFloat(el.billing.value);
    const monthlyDiscounted = monthlyBase * billingMultiplier;
    const annualSavings = (monthlyBase - monthlyDiscounted) * 12;
    const totalOnboarding = parseFloat(el.onboard.value || 0) * numProducts;
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;
    const avgPrice = totalAnnualModels > 0 ? ((monthlyDiscounted * 12) / totalAnnualModels) : 0;

    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(totalPlatformSum).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPrice).toLocaleString();

    const savingsEl = document.getElementById('savingsContainer');
    savingsEl.style.display = annualSavings > 0 ? 'inline-block' : 'none';
    if (annualSavings > 0) document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();

    const hasBaseRate = Array.from(productContainer.querySelectorAll('.prod-cadence')).some(sel => ![365, 180, 104].includes(parseInt(sel.value)));
    document.getElementById('minFeeBadge').style.visibility = (hasBaseRate && numProducts > 0) ? 'visible' : 'hidden';
}

function resetCalculator() {
    el.products.value = 1; el.consulting.value = 0; el.onboard.value = 15000; el.billing.value = "1";
    document.getElementById('preparedFor').value = '';
    updatePreparedBy();
    productContainer.innerHTML = ''; calculate();
}

function exportPDF() {
    const btn = document.getElementById('exportBtn');
    const element = document.getElementById('capture-area');
    const clientName = document.getElementById('preparedFor').value || "Client";
    
    btn.innerText = "Generating PDF...";
    const opt = {
        margin: [0.1, 0.1],
        filename: `MetricWorks_Proposal_${clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, scrollY: 0, windowHeight: element.scrollHeight, height: element.scrollHeight },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = "Export Proposal PDF";
        document.getElementById('successOverlay').style.display = 'flex';
    });
}

function closeSuccess() { document.getElementById('successOverlay').style.display = 'none'; }
inputs.forEach(id => el[id].addEventListener('input', calculate));
el.billing.addEventListener('change', calculate);
calculate();
