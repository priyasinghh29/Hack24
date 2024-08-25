document.querySelectorAll('.filters select').forEach(select => {
    select.addEventListener('focus', function() {
        const rect = this.getBoundingClientRect();
        const bottomSpace = window.innerHeight - rect.bottom;
        const selectHeight = this.offsetHeight;

        if (bottomSpace < selectHeight) {
            // If not enough space below, adjust position
            this.style.position = 'absolute';
            this.style.top = `${rect.top - selectHeight}px`;
            this.style.left = `${rect.left}px`;
            this.style.zIndex = '1000'; // Ensure dropdown is on top
        } else {
            // Reset position if enough space
            this.style.position = 'relative';
            this.style.top = 'auto';
            this.style.left = 'auto';
            this.style.zIndex = 'auto';
        }
    });
});

