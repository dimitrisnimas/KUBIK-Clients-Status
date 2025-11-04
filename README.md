# Website Status Checker

A simple, clean, and modern web application to monitor the status of multiple websites in real-time. This tool provides a clear overview of which sites are up or down, their response times, and their associated hosting packages.

![Website Status Checker Screenshot](https://i.imgur.com/example.png) <!-- It's recommended to replace this with an actual screenshot of your application -->

## Features

- **Real-time Status Monitoring**: Checks website status asynchronously without reloading the page.
- **Clear Status Indicators**: Uses color-coded badges (`Up`, `Down`, `Warning`, `Hosting Off`) for at-a-glance understanding.
- **Response Time**: Measures and displays the response time for each website.
- **Handles Various Scenarios**:
    - Differentiates between a site being down (e.g., 4xx/5xx errors) and network issues.
    - Specifically flags SSL certificate issues.
    - Includes a timeout for unresponsive sites.
- **Manual Status Override**: Allows setting a manual status (like "Hosting Off") for sites that shouldn't be checked automatically.
- **Responsive Design**: The interface is fully responsive and works well on desktops, tablets, and mobile devices.
- **Zero Dependencies**: Built with vanilla HTML, CSS, and JavaScript. No frameworks or external libraries are needed.

## How It Works

The application uses the browser's `fetch` API to make requests to each website listed. To overcome Cross-Origin Resource Sharing (CORS) restrictions that would normally prevent a browser from directly checking the status of a third-party domain, all requests are routed through a free CORS proxy, `corsproxy.io`.

The script interprets the HTTP status codes returned by the proxy:
- **2xx and 3xx codes** are considered `Up`.
- **4xx and 5xx codes** are considered `Down`.
- A specific **526 code** (Invalid SSL Certificate from Cloudflare) is flagged as a `Warning`.
- Network errors or timeouts result in a `Down (Error)` or `Down (Timeout)` status.

## How to Use

Customizing the list of websites to monitor is straightforward.

1.  Open the `script.js` file.
2.  Locate the `websites` constant array.
3.  Add, edit, or remove objects in the array to match the websites you want to monitor.

Each website is an object with the following structure:

```javascript
const websites = [
    { 
        name: "Website Display Name", 
        url: "https://example.com", 
        hosting: "Associated Hosting Plan" 
    },
    { 
        name: "Another Website", 
        url: "https://anotherexample.com", 
        hosting: "Hosting Package 2" 
    },
    // Use 'manualStatus' to skip the live check and display a fixed status
    { 
        name: "Offline Project", 
        url: "https://offline-project.com", 
        hosting: "N/A", 
        manualStatus: "Hosting Off" 
    },
    // ... add more websites here
];
```

## Running Locally

No special setup is required. Simply open the `index.html` file in your web browser to run the application.

## Technologies Used

-   **HTML5**
-   **CSS3** (with Google Fonts for typography)
-   **Vanilla JavaScript (ES6+)**

## Credits

This project was created and is powered by **Dimitris Nimas**.
