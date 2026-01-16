// Main entry point for the portfolio
console.log("Welcome to Woong's Portfolio!");

// Add any global interactive behavior here
// e.g., smooth scroll for anchor links (native CSS usually handles this but JS can be smoother)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
