// Initialize empty search strings & Flag to check if search has been performed
let searchTitleRaw = "";
let searchLocationRaw = "";
let searchPerformed = false;
let isAndMode = true; // Default to AND mode
let seenMode = false; // Default to "seen" mode off
let appliedMode = false; // Default to "applied" mode off

function getSearchedDataAndHighlight() {
    // Retrieve job TITLE and LOCATION search data
    const inputTitle = document.querySelector('input[data-job-search-box-keywords-input-trigger]');
    const searchTitle = inputTitle ? inputTitle.getAttribute('data-job-search-box-keywords-input-trigger') : '';

    const inputLocation = document.querySelector('input[data-job-search-box-location-input-trigger]');
    const searchLocation = inputLocation ? inputLocation.getAttribute('data-job-search-box-location-input-trigger') : '';

    // Update variables
    searchTitleRaw = searchTitle;
    searchLocationRaw = searchLocation;
    searchPerformed = true;

    // Deploy highlight function 
    highlightJobPostings();

    // Send data back to popup
    return { searchTitle: searchTitle, searchLocation: searchLocation };
}

function highlightJobPostings() {
    if (!searchPerformed) {
        return; // Do nothing if search hasn't been performed
    }

    // Turn job TITLE and LOCATION search data to lowercase
    const searchTitle = searchTitleRaw.toLowerCase();
    const searchLocation = searchLocationRaw.toLowerCase();

    // Identify job postings containers
    const jobCards = document.querySelectorAll('div[data-view-name="job-card"]');

    // For each job posting container
    jobCards.forEach(card => {
        // Reset to default background and text color
        card.style.backgroundColor = '';
        const textElements = card.querySelectorAll('*');
        textElements.forEach(element => {
            element.style.color = '';
        });

        // Identify job TITLE and LOCATION style to modify later
        const jobTitleStyle = card.querySelector('a[aria-label]');
        const jobLocationStyle = card.querySelector('li.job-card-container__metadata-item');

        // Identify the job posting TITLE and LOCATION, and adjust all to lowercase
        const jobTitle = card.querySelector('a[aria-label]').getAttribute('aria-label');
        const jobLocation = card.querySelector('li.job-card-container__metadata-item');

        if (jobTitle && jobLocation) {
            const jobTitleText = jobTitle.toLowerCase();
            const jobLocationText = jobLocation.textContent.trim().toLowerCase();

            // Check if posting is selected right now
            const isActive = card.classList.contains('jobs-search-results-list__list-item--active');

            // If posting is selected, clear styles
            if (isActive) {
                card.style.backgroundColor = '';
                // Select all text-containing elements within the card and change their color to white
                textElements.forEach(element => {
                    element.style.color = '';
                });
            } else {
                // If not active
                // AND Mode: If the TITLE and LOCATION searched, match with the TITLE/LOCATION in the job posting
                if (isAndMode) {
                    if (jobTitleText.includes(searchTitle) && jobLocationText.includes(searchLocation)) {
                        card.style.backgroundColor = '#82bef7';
                        // Select all text-containing elements within the card and change their color to white
                        textElements.forEach(element => {
                            const style = window.getComputedStyle(element);
                            if (element.textContent.trim() && style.color !== 'rgb(255, 255, 255)') {
                                element.style.color = 'black';
                            }
                        });
                        if (jobTitleStyle) jobTitleStyle.style.color = 'black';
                        if (jobLocationStyle) jobLocationStyle.style.color = 'black';
                    }
                } else {
                    // OR mode: If the TITLE or LOCATION searched, match with the TITLE/LOCATION in the job posting
                    if (jobTitleText.includes(searchTitle) || jobLocationText.includes(searchLocation)) {
                        card.style.backgroundColor = '#a5f5cd';
                        textElements.forEach(element => {
                            const style = window.getComputedStyle(element);
                            if (element.textContent.trim() && style.color !== 'rgb(255, 255, 255)') {
                                element.style.color = 'black';
                            }
                        });
                        if (jobTitleStyle) jobTitleStyle.style.color = 'black';
                        if (jobLocationStyle) jobLocationStyle.style.color = 'black';
                    }
                }
            }
        }
    });
    // Apply the "Seen" mode style
    seenModeStyle();
    // Apply the "Applied" mode style
    appliedModeStyle();
}

function seenModeStyle() {
    seenOrApplied(seenMode, ['Visto', 'Viewed', 'Visualizzato'], '#0A66C2');
}

function appliedModeStyle() {
    seenOrApplied(appliedMode, ['Solicitados', 'Applied', 'Candidature inoltrate'], '#01754F');
}

function seenOrApplied(stateType, validConditions, backgroundColor) {
    const items = document.querySelectorAll('li.job-card-container__footer-item.job-card-container__footer-job-state.t-bold');
    items.forEach(item => {
        const textContent = item.textContent.trim();
        // Check if the text content includes any of the valid conditions
        const matchesCondition = validConditions.some(condition => textContent.includes(condition));

        if (matchesCondition) {
            if (stateType) {
                item.style.backgroundColor = backgroundColor;
                item.style.color = 'white';
                item.style.width = '150px';
                item.style.justifyContent = 'center';
                item.style.borderRadius = '10px';
            } else {
                item.style.color = '';
                item.style.backgroundColor = '';
                item.style.width = '';
                item.style.justifyContent = '';
                item.style.borderRadius = '';
            }
        }
    });
}

// An observer keeps applying the highlight as the page loads
const observer = new MutationObserver(() => {
    highlightJobPostings();
});
observer.observe(document.body, { childList: true, subtree: true });

// Receives the action call from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "searchAndHighlight") {
        isAndMode = request.isAndMode; // Update the mode based on message
        const response = getSearchedDataAndHighlight();
        sendResponse(response);
    } else if (request.action === "updateSeen") {
        seenMode = request.seen;
        seenModeStyle();
    } else if (request.action === "updateApplied") {
        appliedMode = request.applied;
        appliedModeStyle();
    }
});
