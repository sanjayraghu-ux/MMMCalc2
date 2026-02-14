/**
 * MetricWorks MMM Pricing Estimator - Logic Controller
 * Updates: 
 * - Dynamic Platform Fee based on Cadence:
 * - Daily: $6,083/mo
 * - 15/mo: $4,500/mo
 * - 2/wk:  $3,033/mo
 * - Others: $2,500/mo (Default)
 */

const inputs = ['products', 'consulting', 'onboard', 'billing'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

/**
 * Generates product configuration rows based on the "Number of Products" input.
 */
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

/**
 * Main calculation engine.
 */
function calculate() {
    updateProductRows();
    const numProducts = parseInt(el.products.value) || 0;
    
    const SUPPORT_PER_PROD = 750;
    const CONSULT_RATE = 250;

    let totalPlatformSum = 0;
    let totalAnnualModels = 0;

    // Iterate through product rows to determine platform fee based on cadence
    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        const annualModels = parseInt(sel.value);
        let monthlyPlatformRate = 2500; // Default/Monthly rate

        // Cadence-based pricing logic
        if (annualModels === 365) {
            monthlyPlatformRate = 6083;
        } else if (annualModels === 180) {
            monthlyPlatformRate = 4500;
        } else if (annualModels === 104) {
            monthlyPlatformRate = 3033;
        }

        totalAnnualModels += annualModels;
        totalPlatformSum += monthlyPlatformRate;
    });

    // 1. Core Recurring Components
    const finalPlatformFee = totalPlatformSum;
    const totalSupport = numProducts * SUPPORT_PER_PROD;
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    
    // 2. Base Monthly Total (Before Discounts)
    const monthlyBaseTotal = finalPlatformFee + totalSupport + consultTotal;

    // 3. Apply Billing Discount
    const billingMultiplier = parseFloat(el.billing.value);
    const monthlyDiscounted = monthlyBaseTotal * billingMultiplier;
    const annualSavings = (monthlyBaseTotal - monthlyDiscounted) * 12;

    // 4. One-Time Setup Costs (Scaled per product)
    const perProductOnboard = parseFloat(el.onboard.value || 0);
    const totalOnboarding = perProductOnboard * numProducts;
    
    // 5. Year 1 Total Investment
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;

    // 6. Unit Economics
    const avgPricePerModel = totalAnnualModels > 0 ? ((monthlyDiscounted * 12) / totalAnnualModels) : 0;

    // --- UI UPDATES ---
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatformFee).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('onboardRate').innerText = '$' + perProductOnboard.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    const savingsEl = document.getElementById('savingsContainer');
    if (annualSavings > 0) {
        savingsEl.style.display = 'inline-block';
        document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();
    } else {
        savingsEl.style.display = 'none';
    }

    // Min Badge Logic (Visible if any product is at the base $2,500 rate)
    const minBadge = document.getElementById('minFeeBadge');
    if (minBadge) {
        const hasBaseRate = Array.from(productContainer.querySelectorAll('.prod-cadence'))
                                 .some(sel => ![365, 180, 104].includes(parseInt(sel.value)));
        minBadge.style.visibility = (hasBaseRate && numProducts > 0) ? 'visible' : 'hidden';
    }
}

function resetCalculator() {
    if (confirm("Reset all estimator values to default?")) {
        el.products.value = 1;
        el.consulting.value = 0;
        el.onboard.value = 15000;
        el.billing.value = "1";
        productContainer.innerHTML = '';
        calculate();
    }
}

function exportPDF() {
    const btn = document.getElementById('exportBtn');
    const captureArea = document.getElementById('capture-area');
    btn.innerText = "Generating PDF...";
    
    const opt = {
        margin: 0.5,
        filename: 'MetricWorks_Proposal.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#0f111a' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(captureArea).save().then(() => {
        btn.innerText = "Export Proposal PDF";
        document.getElementById('successOverlay').style.display = 'flex';
    });
}

function closeSuccess() {
    document.getElementById('successOverlay').style.display = 'none';
}

inputs.forEach(id => {
    if (el[id]) el[id].addEventListener('input', calculate);
});

calculate();
