// portfolio-maker-scripts.js
// This script now assumes Firebase app, auth, db, and functions are initialized globally by firebase-init.js

document.addEventListener('DOMContentLoaded', async () => {
    // Await the global Firebase initialization promise
    if (typeof window.firebaseInitializedPromise === 'undefined') {
        console.error("firebaseInitializedPromise is not defined. Ensure firebase-init.js is loaded before this script.");
        window.showMessageBox("Application error: Firebase initialization script missing.", "error");
        return;
    }

    const firebaseInitSuccess = await window.firebaseInitializedPromise;
    if (!firebaseInitSuccess) {
        console.error("Firebase global initialization failed. Cannot proceed with portfolio generator.");
        window.showMessageBox("Application error: Firebase failed to initialize.", "error");
        return;
    }

    const generatePortfolioBtn = document.querySelector('.generate-portfolio-btn');
    const portfolioContent = document.getElementById('portfolioContent');
    const portfolioLinkContainer = document.getElementById('portfolioLinkContainer');
    const projectsList = document.querySelector('.projects-list');

    // Function to generate the portfolio
    function generatePortfolio() {
        console.log('generatePortfolio: Function called.');
        try {
            portfolioContent.innerHTML = ''; // Clear previous content
            portfolioLinkContainer.innerHTML = ''; // Clear previous link

            const selectedProjects = projectsList.querySelectorAll('input[type="checkbox"]:checked');
            console.log('generatePortfolio: Number of selected projects:', selectedProjects.length);


            if (selectedProjects.length === 0) {
                portfolioLinkContainer.innerHTML = '<p class="placeholder-text">Please select at least one project to generate a portfolio.</p>';
                window.showMessageBox('Please select at least one project to generate a portfolio.', 'error'); // Use window.showMessageBox
                return;
            }

            selectedProjects.forEach(project => {
                const title = project.getAttribute('data-title');
                const description = project.getAttribute('data-description');
                const image = project.getAttribute('data-image');
                const link = project.getAttribute('data-link');

                const portfolioItem = document.createElement('div');
                portfolioItem.className = 'portfolio-item';
                portfolioItem.innerHTML = `
                    <h3>${title}</h3>
                    <img src="${image}" alt="${title}" onerror="this.onerror=null;this.src='https://placehold.co/400x250/cccccc/333333?text=Image+Not+Found';">
                    <p>${description}</p>
                    <a href="${link}" target="_blank">View Project</a>
                `;

                portfolioContent.appendChild(portfolioItem);
            });

            // Generate download link for the portfolio HTML
            const portfolioHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>My ProjeX Portfolio</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
                        .portfolio-container { max-width: 900px; margin: 20px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        h1 { text-align: center; color: #2F6E26; margin-bottom: 30px; }
                        .portfolio-item { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
                        .portfolio-item:last-child { border-bottom: none; }
                        .portfolio-item h3 { color: #343a40; margin-bottom: 10px; font-size: 1.5em; }
                        .portfolio-item img { max-width: 100%; height: auto; display: block; margin-bottom: 15px; border-radius: 8px; }
                        .portfolio-item p { color: #6c757d; margin-bottom: 10px; }
                        .portfolio-item a { display: inline-block; background-color: #2a7c2f; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; transition: background-color 0.3s ease; }
                        .portfolio-item a:hover { background-color: #3fa847; }
                    </style>
                </head>
                <body>
                    <div class="portfolio-container">
                        <h1>My ProjeX Portfolio</h1>
                        ${portfolioContent.innerHTML}
                    </div>
                </body>
                </html>
            `;
            const blob = new Blob([portfolioHtml], { type: 'text/html;charset=utf-8' });
            const downloadUrl = URL.createObjectURL(blob);

            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = 'my_projex_portfolio.html';
            downloadLink.innerText = 'Download Portfolio as HTML';
            downloadLink.className = 'download-link'; // Add a class for styling
            portfolioLinkContainer.appendChild(downloadLink);

            // Clean up the URL object when no longer needed
            downloadLink.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
            });
        } catch (error) {
            console.error('generatePortfolio: An error occurred:', error);
            window.showMessageBox('An error occurred during portfolio generation. Check console for details.', 'error'); // Use window.showMessageBox
        }
    }

    // Attach event listener to the generate button
    if (generatePortfolioBtn) {
        generatePortfolioBtn.addEventListener('click', generatePortfolio);
    } else {
        console.error('portfolio-maker-scripts.js: Generate Portfolio button with class ".generate-portfolio-btn" not found.');
    }
});
