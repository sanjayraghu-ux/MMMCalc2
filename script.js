function calculate() {
    updateProductRows();
    const numProducts = parseInt(el.products.value) || 0;
    
    // Updated Fixed Rates
    const PLATFORM_PER_PROD = 2500; // New: Fixed scaling per product
    const SUPPORT_PER_PROD = 750;
    const CONSULT_RATE = 250;

    let totalAnnualModels = 0;

    // We still iterate to count the models for your volume metrics
    productContainer.querySelectorAll('.prod-cadence').forEach(sel => {
        totalAnnualModels += parseInt(sel.value);
    });

    // NEW LOGIC: Platform Fee scales linearly like Support
    const finalPlatformFee = numProducts * PLATFORM_PER_PROD;
    const totalSupport = numProducts * SUPPORT_PER_PROD;
    
    // 2. Base Monthly Recurring (Before Discount)
    const consultTotal = (parseInt(el.consulting.value) || 0) * CONSULT_RATE;
    const monthlyBaseTotal = finalPlatformFee + totalSupport + consultTotal;

    // 3. Apply Billing Multiplier
    const billingMultiplier = parseFloat(el.billing.value);
    const monthlyDiscounted = monthlyBaseTotal * billingMultiplier;
    const annualSavings = (monthlyBaseTotal - monthlyDiscounted) * 12;

    // 4. One-Time Setup (Scaled per product)
    const totalOnboarding = parseFloat(el.onboard.value || 0) * numProducts;
    
    // 5. Final Year 1 TCO
    const yearOne = (monthlyDiscounted * 12) + totalOnboarding;

    // VOLUME METRICS
    const avgPricePerModel = totalAnnualModels > 0 ? ((monthlyDiscounted * 12) / totalAnnualModels) : 0;

    // Update UI
    document.getElementById('monthlyTotal').innerText = Math.round(monthlyDiscounted).toLocaleString();
    document.getElementById('yearOneTotal').innerText = Math.round(yearOne).toLocaleString();
    document.getElementById('platformCost').innerText = '$' + Math.round(finalPlatformFee).toLocaleString();
    document.getElementById('supportCost').innerText = '$' + totalSupport.toLocaleString();
    document.getElementById('consultCost').innerText = '$' + consultTotal.toLocaleString();
    document.getElementById('oneTimeTotal').innerText = '$' + totalOnboarding.toLocaleString();
    document.getElementById('discountTag').innerText = Math.round((1 - billingMultiplier) * 100) + '%';
    document.getElementById('totalModelsCount').innerText = totalAnnualModels.toLocaleString();
    document.getElementById('avgModelPrice').innerText = '$' + Math.round(avgPricePerModel).toLocaleString();
    
    // Toggle Savings Badge
    const savingsEl = document.getElementById('savingsContainer');
    savingsEl.style.display = annualSavings > 0 ? 'inline-block' : 'none';
    if (annualSavings > 0) document.getElementById('totalSavings').innerText = Math.round(annualSavings).toLocaleString();

    // The badge is now effectively redundant since 1 product = $2,500, but we'll keep the logic
    document.getElementById('minFeeBadge').style.visibility = (finalPlatformFee <= 2500 && numProducts > 0) ? 'visible' : 'hidden';
}
