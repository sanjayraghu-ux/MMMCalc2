function duplicateLastProduct() {
    const productsInput = document.getElementById('products');
    const currentVal = parseInt(productsInput.value);
    if (currentVal < 20) {
        productsInput.value = currentVal + 1;
        
        // Grab the cadence from the last existing row to apply to the new one
        const rows = productContainer.querySelectorAll('.prod-cadence');
        const lastCadence = rows.length > 0 ? rows[rows.length - 1].value : "12";
        
        updateProductRows();
        
        // Apply the duplicated cadence to the newly created row
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
        else if (annualModels >= 52) costPerModel = 450;

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

    // VOLUME METRICS CALCULATION
    const totalServiceInvestmentAnnual = monthlyDiscounted * 12;
    const avgPricePerModel = totalAnnualModels > 0 
        ? (totalServiceInvestmentAnnual / totalAnnualModels) 
        : 0;

    // Update UI
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatformFee).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    
    // Update New Metrics
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    const savingsEl = document.getElementById('savingsContainer');
    if (annualSavings > 0) {
        savingsEl.style.display = 'inline-block';
        document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();
    } else {
        savingsEl.style.display = 'none';
    }

    const badge = document.getElementById('minFeeBadge');
    badge.style.visibility = (finalPlatformFee === MIN_PLATFORM) ? 'visible' : 'hidden';
}
