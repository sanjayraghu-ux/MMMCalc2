const inputs = ['brands', 'products', 'consulting', 'cadence', 'customCadenceValue'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

function updateProductFields() {
    const count = parseInt(el.products.value);
    const existingFields = productContainer.querySelectorAll('.product-name-row').length;

    if (count > existingFields) {
        for (let i = existingFields + 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'product-name-row';
            div.innerHTML = `<span>Product ${i}:</span><input type="text" placeholder="e.g. Q1 Campaign" class="prod-name">`;
            productContainer.appendChild(div);
        }
    } else if (count < existingFields) {
        for (let i = existingFields; i > count; i--) {
            productContainer.removeChild(productContainer.lastChild);
        }
    }
}

function calculate() {
    updateProductFields();

    // 1. Cadence Logic
    let modelsPerYear = el.cadence.value === 'custom' 
        ? parseFloat(el.customCadenceValue.value) 
        : parseFloat(el.cadence.value);
    
    document.getElementById('customCadenceBox').style.display = 
        (el.cadence.value === 'custom') ? 'block' : 'none';

    // 2. Pricing Levers
    const MIN_PLATFORM_FEE = 2500;
    const SUPPORT_FEE = 750;
    const CONSULTING_RATE = 250;
    const ONBOARDING = 5000;

    // Platform Fee = $1500 base + ($500 per brand) + ($200 per product) 
    // multiplied by a cadence factor (e.g. daily updates cost 1.5x monthly)
    let cadenceFactor = 1 + (modelsPerYear / 365) * 0.5; 
    let calcPlatform = (1500 + (el.brands.value * 500) + (el.products.value * 200)) * cadenceFactor;
    
    const platformFee = Math.max(MIN_PLATFORM_FEE, calcPlatform);
    const consultingFee = el.consulting.value * CONSULTING_RATE;
    const monthlyTotal = platformFee + SUPPORT_FEE + consultingFee;
    const yearOneTotal = (monthlyTotal * 12) + ONBOARDING;

    // 3. UI Updates
    document.getElementById('brandLabel').innerText = el.brands.value;
    document.getElementById('productLabel').innerText = el.products.value;
    document.getElementById('consultLabel').innerText = el.consulting.value;
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyTotal).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOneTotal).toLocaleString();
    
    document.getElementById('minFeeBadge').style.visibility = 
        (platformFee === MIN_PLATFORM_FEE) ? 'visible' : 'hidden';
}

// Listeners
inputs.forEach(id => el[id].addEventListener('input', calculate));
el['cadence'].addEventListener('change', calculate);
calculate();
