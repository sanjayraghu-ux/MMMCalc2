const inputs = ['products', 'consulting', 'onboard', 'billing'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

// Injects a row for every product defined in the count
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
            // Ensure changing a cadence triggers a recalculation
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
    const SUPPORT_RATE = 750;
    const CONSULT_RATE = 250;

    let totalPlatformSum = 0;
    let totalAnnualModels = 0;

    // Iterate through each specific product row to calculate custom complexity
    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        const annualModels = parseInt(sel.value);
        let costPerModel = 450; 
        
        if (annualModels >= 365) costPerModel = 200;
        else if (annualModels >= 180) costPerModel = 300;
        else if (annualModels >= 104) costPerModel = 350;

        totalAnnualModels += annualModels;
        totalPlatformSum += (annualModels * costPerModel) / 12;
    });

    // Apply the account-level platform floor
    const finalPlatformFee = Math.max(MIN_PLATFORM, totalPlatformSum);
    const totalSupport = numProducts * SUPPORT_RATE;
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    
    const billingMultiplier = parseFloat(el.billing.value);
    const monthlyDiscounted = (finalPlatformFee + totalSupport + consultTotal) * billingMultiplier;
    
    const totalOnboarding = parseFloat(el.onboard.value || 0) * numProducts;
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;

    // Average price per model calculation for the breakdown metrics
    const avgPricePerModel = totalAnnualModels > 0 ? ((monthlyDiscounted * 12) / totalAnnualModels) : 0;

    // UI Updates
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatformFee).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    // Minimum badge visibility logic
    document.getElementById('minFeeBadge').style.visibility = (finalPlatformFee === MIN_PLATFORM) ? 'visible' : 'hidden';
}

inputs.forEach(id => el[id].addEventListener('input', calculate));
el.billing.addEventListener('change', calculate);
calculate();
