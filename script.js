const inputs = ['brands', 'products', 'cadence', 'customCadenceValue', 'consulting', 'onboard', 'handoff'];
const el = {};
inputs.forEach(id => el[id] = document.getElementById(id));

const productContainer = document.getElementById('productNameInputs');

function updateProductInputs() {
    const count = parseInt(el.products.value);
    const existing = productContainer.querySelectorAll('.product-name-row').length;

    if (count > existing) {
        for (let i = existing + 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'product-name-row';
            div.innerHTML = `<span>Product ${i}:</span><input type="text" placeholder="Product Name" class="prod-input">`;
            productContainer.appendChild(div);
        }
    } else if (count < existing) {
        for (let i = existing; i > count; i--) {
            productContainer.removeChild(productContainer.lastChild);
        }
    }
}

function calculate() {
    updateProductInputs();

    const numBrands = parseInt(el.brands.value);
    const numProducts = parseInt(el.products.value);
    const consultHours = parseInt(el.consulting.value);
    
    let modelsPerYear = el.cadence.value === 'custom' 
        ? parseFloat(el.customCadenceValue.value || 0) 
        : parseFloat(el.cadence.value);
    
    document.getElementById('customCadenceBox').style.display = (el.cadence.value === 'custom') ? 'block' : 'none';

    const MIN_PLATFORM = 2500;
    const SUPPORT = 750;
    const CONSULT_RATE = 250;
    
    const frequencyMultiplier = 1 + (Math.min(modelsPerYear, 365) / 365) * 0.6;
    let baseComplexity = 1000 + (numBrands * 600) + (numProducts * 300);
    
    const calculatedPlatform = baseComplexity * frequencyMultiplier;
    const finalPlatform = Math.max(MIN_PLATFORM, calculatedPlatform);
    
    const consultTotal = consultHours * CONSULT_RATE;
    const monthlyRecurring = finalPlatform + SUPPORT + consultTotal;
    
    const setupFees = parseFloat(el.onboard.value || 0) + parseFloat(el.handoff.value || 0);
    const yearOneTotal = (monthlyRecurring * 12) + setupFees;

    document.getElementById('brandLabel').innerText = numBrands;
    document.getElementById('productLabel').innerText = numProducts;
    document.getElementById('consultLabel').innerText = consultHours;
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyRecurring).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOneTotal).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatform).toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + setupFees.toLocaleString();
    
    document.getElementById('minFeeBadge').style.visibility = (finalPlatform === MIN_PLATFORM) ? 'visible' : 'hidden';
}

function exportPDF() {
    const element = document.getElementById('capture-area');
    const opt = {
        margin: 0.2,
        filename: 'MetricWorks_MMM_Proposal.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#1e293b' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

inputs.forEach(id => {
    const eventType = (id === 'cadence') ? 'change' : 'input';
    el[id].addEventListener(eventType, calculate);
});

calculate();
