// Function to check website status using the corsproxy.io proxy
async function checkWebsiteStatus(url, timeout = 10000) {
    // Using corsproxy.io as the CORS proxy. It forwards the original status code.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const startTime = performance.now();
    try {
        const response = await fetch(proxyUrl, {
            signal: controller.signal
        });
        const endTime = performance.now();
        clearTimeout(timeoutId);
        
        const responseTimeMs = Math.round(endTime - startTime);

        // A 526 status code (Invalid SSL Certificate) from Cloudflare is a special case.
        if (response.status === 526) {
            return { status: 'Up (check ssl certificate)', responseTime: `${responseTimeMs} ms` };
        }
        
        // Status codes 2xx and 3xx are considered "Up".
        if (response.status >= 200 && response.status < 400) {
            return { status: 'Up', responseTime: `${responseTimeMs} ms` };
        } else {
            return { status: `Down (${response.status})`, responseTime: 'N/A' };
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return { status: 'Down (Timeout)', responseTime: 'N/A' };
        }
        // This could be a network error or the proxy itself is down.
        return { status: 'Down (Error)', responseTime: 'N/A' };
    }
}

// Function to update the status table
function updateStatusTable(websites) {
    const tableBody = document.querySelector('#status-table tbody');
    tableBody.innerHTML = ''; // Clear existing table content

    websites.forEach(website => {
        const row = document.createElement('tr');

        // Website Name cell
        const websiteCell = document.createElement('td');
        websiteCell.classList.add('website');
        websiteCell.textContent = website.name;
        row.appendChild(websiteCell);

        // Status cell with a badge
        const statusCell = document.createElement('td');
        statusCell.classList.add('status');
        const statusBadge = document.createElement('span');
        statusBadge.classList.add('status-badge', 'loading');
        statusBadge.textContent = 'Loading';
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Response Time cell
        const responseTimeCell = document.createElement('td');
        responseTimeCell.classList.add('response-time');
        responseTimeCell.textContent = '...';
        row.appendChild(responseTimeCell);

        // Hosting Package cell
        const hostingCell = document.createElement('td');
        hostingCell.classList.add('hosting-package');
        hostingCell.textContent = website.hosting;
        row.appendChild(hostingCell);

        tableBody.appendChild(row);

        // If a manual status is set, display it and skip the check.
        if (website.manualStatus) {
            statusBadge.textContent = website.manualStatus;
            statusBadge.classList.remove('loading');
            statusBadge.classList.add('hosting-off');
            responseTimeCell.textContent = 'N/A';
            return; // Skip to the next website
        }

        // Check website status and update the row
        checkWebsiteStatus(website.url).then(data => {
            statusBadge.textContent = data.status;
            statusBadge.classList.remove('loading');
            
            if (data.status.toLowerCase().includes('down') || data.status.toLowerCase().includes('error')) {
                statusBadge.classList.add('down');
            } else if (data.status.toLowerCase().includes('check ssl')) {
                statusBadge.classList.add('warning');
            } else {
                statusBadge.classList.add('up');
            }
            
            responseTimeCell.textContent = data.responseTime;
        });
    });
}

// List of websites to check
const websites = [
    { name: "Dimitris Nimas", url: "https://dimitrisnimas.gr", hosting: "GitHub" },
    { name: "Kubik Digital", url: "https://kubik.gr", hosting: "GitHub" },
    { name: "O Babis Platanos", url: "https://obabisplatanos.gr", hosting: "GitHub" },
    { name: "Tzepeto Bar", url: "https://tzepetobar.gr/", hosting: "Shared Hosting (USA)" },
    { name: "SEPAM", url: "https://sepam.gr", hosting: "Business Hosting (GR)" },
    { name: "Computer Mathematica", url: "https://computermathematica.gr", hosting: "Shared Hosting (GR)" },
    { name: "Be Vintage", url: "https://bevintage.gr", hosting: "Shared Hosting (GR)" },
    { name: "Code Mentor", url: "https://codementor.gr", hosting: "Business Hosting (USA)" },
    { name: "Sauvage Night Club", url: "https://sauvagenightclub.eu", hosting: "N/A", manualStatus: "DEACTIVATED" },
	{ name: "Tolidis Parts", url: "https://tolidisparts.gr", hosting: "VPS (GR)" },
	{ name: "6 GEMS", url: "https://6gems.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Solar Projects", url: "https://solarprojects.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Resenco Energy", url: "https://sauvagenightclub.eu", hosting: "Coming Soon - Shared Hosting (GR)" },
	{ name: "Auto Tol", url: "https://autotol.gr", hosting: "Shared Hosting (GR)" },
];

// Initialize the status check when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTable(websites);
});