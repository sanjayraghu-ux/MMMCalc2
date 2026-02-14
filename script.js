/**
 * MetricWorks MMM Pricing Estimator - Logic Controller
 * Features: 
 * - Linear scaling: Platform Fee ($2,500/prod) and Support ($750/prod)
 * - Dynamic product configuration rows
 * - Billing discount application (10% Bi-Annual, 20% Annual)
 * - Unit economic metrics: Total Models/Year & Avg. Price per Model
 */

const inputs = ['products', 'consulting', 'onboard', 'billing'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

/**
 * Generates or removes product configuration rows based on the "Number of Products" input.
 * Each row allows for a custom product name and cadence selection.
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
            // Re-calculate whenever a specific product cadence is changed
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
 * Updates all financial and volume metrics based on current inputs.
 */
function calculate() {
    updateProductRows();
    const numProducts = parseInt(el.products.value) || 0;
    
    // Constant Rates
    const PLATFORM_PER_PROD = 2500; 
    const SUPPORT_PER_PROD = 750;
    const CONSULT_RATE = 250;

    let totalAnnualModels = 0;

    // Sum up the annual model volume from all product rows
    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        totalAnnualModels += parseInt(sel.value);
    });

    // 1. Calculate Core Recurring Components (Linear Scaling)
    const finalPlatformFee = numProducts * PLATFORM_PER_PROD;
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
    
    // 5. Year 1 Total Investment (TCV)
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;

    // 6. Unit Economics (Cost per Model)
    // Formula: Total Annual Recurring Service Cost / Total Models Produced
    const avgPricePerModel = totalAnnualModels > 0 ? ((monthlyDiscounted * 12) / totalAnnualModels) : 0;

    // --- UI UPDATES ---

    // Primary Pricing
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    
    // Breakdown Components
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatformFee).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('onboardRate').innerText = '$' + perProductOnboard.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    
    // Discount and Volume Metrics
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    // Savings Badge Logic
    const savingsEl = document.getElementById('savingsContainer');
    if (annualSavings > 0) {
        savingsEl.style.display = 'inline-block';
        document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();
    } else {
        savingsEl.style.display = 'none';
    }

    // Min Fee Badge Visibility
    // Since Platform scales linearly starting at $2,500, this is visible for 1 product
    const minBadge = document.getElementById('minFeeBadge');
    if (minBadge) {
        minBadge.style.visibility = (numProducts === 1) ? 'visible' : 'hidden';
    }
}

/**
 * Resets the estimator to the default 1-product state.
 */
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

/**
 * Exports the current dashboard view to a PDF file.
 */
function exportPDF() {
    const btn = document.getElementById('exportBtn');
    const captureArea = document.getElementById('capture-area');
    
    btn.innerText = "Generating PDF...";
    
    const opt = {
        margin: 0.5,
        filename: 'MetricWorks_MMM_Proposal.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#0f111a' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(captureArea).save().then(() => {
        btn.innerText = "Export Proposal PDF";
        document.getElementById('successOverlay').style.display = 'flex';
    });
}

/**
 * Closes the success modal.
 */
function closeSuccess() {
    document.getElementById('successOverlay').style.display = 'none';
}

// Event Listeners for Real-time Calculation
inputs.forEach(id => {
    if (el[id]) {
        el[id].addEventListener('input', calculate);
    }
});

// Initial load
calculate();
