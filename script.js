/**
 * MetricWorks MMM Pricing Estimator - Logic Controller
 * * Calculation Rules:
 * - Platform Fee per Cadence: Daily ($6,083), 15/mo ($4,500), 2/wk ($3,033), Monthly ($2,500)
 * - Support Fee: Fixed $750 per product
 * - Onboarding Fee: Fixed $15,000 per product (One-time)
 * - Billing Discounts: Monthly (0%), Bi-Annual (10%), Annual (20%)
 */

const inputs = ['products', 'consulting', 'onboard', 'billing'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

/**
 * Syncs the number of product configuration rows with the input value
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
 * Core Calculation Logic
 */
function calculate() {
    updateProductRows();
    const numProducts = parseInt(el.products.value) || 0;
    
    // Constants
    const SUPPORT_PER_PROD = 750;
    const CONSULT_RATE = 250;

    let totalPlatformSum = 0;
    let totalAnnualModels = 0;

    // 1. Calculate Platform Fees and Model Volume per product
    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        const annualModels = parseInt(sel.value);
        let monthlyPlatformRate = 2500; // Default

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

    // 2. Calculate Service Totals
    const totalSupport = numProducts * SUPPORT_PER_PROD;
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    const monthlyBaseTotal = totalPlatformSum + totalSupport + consultTotal;

    // 3. Apply Billing Discount
    const billingMultiplier = parseFloat(el.billing.value);
    const monthlyDiscounted = monthlyBaseTotal * billingMultiplier;
    const annualSavings = (monthlyBaseTotal - monthlyDiscounted) * 12;

    // 4. Calculate Scaling Onboarding Fee
    const perProductOnboard = parseFloat(el.onboard.value || 0);
    const totalOnboarding = perProductOnboard * numProducts;
    
    // 5. Calculate Year 1 Total (TCV)
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;

    // 6. Calculate Average Price Per Model
    // Based on annual recurring service cost divided by annual model volume
    const annualServiceCost = monthlyDiscounted * 12;
    const avgPricePerModel = totalAnnualModels > 0 ? (annualServiceCost / totalAnnualModels) : 0;

    // --- UI UPDATES ---

    // Primary Totals
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    
    // Line Item Breakdown
    document.getElementById('platformCost').innerText = '$' + Math.round(totalPlatformSum).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('onboardRate').innerText = '$' + perProductOnboard.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    
    // Metrics & Discounts
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    // Savings Badge
    const savingsEl = document.getElementById('savingsContainer');
    if (annualSavings > 0) {
        savingsEl.style.display = 'inline-block';
        document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();
    } else {
        savingsEl.style.display = 'none';
    }

    // Badge Logic: Visibility
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
        margin: 0,
        filename: 'MetricWorks_Investment_Summary.pdf',
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

// Initial Listeners
inputs.forEach(id => {
    if (el[id]) el[id].addEventListener('input', calculate);
});

// Initialize on load
calculate();
