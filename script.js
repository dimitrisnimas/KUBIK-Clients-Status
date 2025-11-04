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

// List of websites to check
const websites = [
	{ name: "Resenco Energy", url: "https://dimitrisnimas.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Tolidis Parts", url: "https://tolidisparts.gr", hosting: "VPS (GR)" },
	{ name: "Auto Tol", url: "https://autotol.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Solar Projects", url: "https://solarprojects.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Be Vintage", url: "https://bevintage.gr", hosting: "Shared Hosting (GR)" },
	{ name: "6 GEMS", url: "https://6gems.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Computer Mathematica", url: "https://computermathematica.gr", hosting: "Shared Hosting (GR)" },
	{ name: "Tzepeto Bar", url: "https://tzepetobar.gr/", hosting: "Business Hosting (USA)" },
    { name: "SEPAM", url: "https://sepam.gr", hosting: "Business Hosting (GR)" },
	{ name: "Code Mentor", url: "https://codementor.gr", hosting: "Business Hosting (USA)" },
    { name: "Sauvage Night Club", url: "https://sauvagenightclub.eu", hosting: "", manualStatus: "DEACTIVATED" },
    { name: "O Babis Platanos", url: "https://obabisplatanos.gr", hosting: "GitHub" },
	{ name: "Dimitris Nimas", url: "https://dimitrisnimas.gr", hosting: "GitHub" },
    { name: "Kubik Digital", url: "https://kubik.gr", hosting: "GitHub" },
];

const containerEl = document.getElementById("status-container");
const updatedEl = document.getElementById("last-updated");
const refreshBtn = document.getElementById("refresh-btn");
const globalBadge = document.getElementById("global-badge");
const globalDot = globalBadge.querySelector(".dot");
const globalText = document.getElementById("global-text");

let isRefreshing = false;

// Function to render the website statuses
async function renderStatuses() {
    if (isRefreshing) return;
    isRefreshing = true;
    refreshBtn.disabled = true;
    
    containerEl.innerHTML = ''; // Clear previous content
    globalDot.className = 'dot dot-unknown';
    globalText.textContent = 'Checking...';

    const card = document.createElement("div");
    card.className = "card";
    containerEl.appendChild(card);

    const checkPromises = websites.map(website => {
        const projectContainer = document.createElement('div');
        projectContainer.className = 'project-container';

        const statusDetails = `
            <div class="status-details">
                <span class="response-time">...</span>
                <span class="pill loading">Loading...</span>
            </div>
        `;

        projectContainer.innerHTML = `
            <div class="project-line">
                <span class="project-name">${website.name}</span>
                ${statusDetails}
            </div>
            <div class="service-details">Hosting: ${website.hosting}</div>
        `;
        card.appendChild(projectContainer);
        
        const responseTimeEl = projectContainer.querySelector('.response-time');
        const statusPill = projectContainer.querySelector('.pill');

        if (website.manualStatus) {
            responseTimeEl.textContent = 'N/A';
            statusPill.textContent = website.manualStatus;
            statusPill.classList.remove('loading');
            statusPill.classList.add('unknown');
            return Promise.resolve({ status: 'manual' });
        }

        return checkWebsiteStatus(website.url).then(data => {
            statusPill.textContent = data.status;
            statusPill.classList.remove('loading');
            
            if (data.status.toLowerCase().includes('down') || data.status.toLowerCase().includes('error')) {
                statusPill.classList.add('danger');
            } else if (data.status.toLowerCase().includes('check ssl')) {
                statusPill.classList.add('warn');
            } else {
                statusPill.classList.add('success');
            }
            
            responseTimeEl.textContent = data.responseTime;
            return data;
        });
    });

    const results = await Promise.allSettled(checkPromises);
    
    const statuses = results
        .filter(r => r.status === 'fulfilled' && r.value.status)
        .map(r => r.value.status.toLowerCase());
    
    let worstStatus = 'success';
    if (statuses.some(s => s.includes('down') || s.includes('error'))) {
        worstStatus = 'danger';
    } else if (statuses.some(s => s.includes('check ssl'))) {
        worstStatus = 'warn';
    }

    globalDot.className = 'dot';
    if (worstStatus === 'danger') {
        globalDot.classList.add('dot-danger');
        globalText.textContent = 'Major Outage';
    } else if (worstStatus === 'warn') {
        globalDot.classList.add('dot-warn');
        globalText.textContent = 'Degraded Performance';
    } else {
        globalDot.classList.add('dot-success');
        globalText.textContent = 'All Systems Operational';
    }

    const now = new Date();
    updatedEl.textContent = "Last Updated: " + now.toLocaleString();
    
    isRefreshing = false;
    refreshBtn.disabled = false;
}

// Initialize and set up refresh logic
document.addEventListener('DOMContentLoaded', () => {
    renderStatuses();
    refreshBtn.addEventListener('click', renderStatuses);
});
