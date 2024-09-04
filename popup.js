document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTab = tabs[0];
        var currentUrl = currentTab.url;
        var messageElement = document.getElementById('message');
        var linkedinSearchDiv = document.getElementById('linkedinSearch');
        var searchTitleSpan = document.getElementById('searchTitle');
        var searchLocationSpan = document.getElementById('searchLocation');
        var colorModeSwitch = document.getElementById('color_mode');
        var seenCheckbox = document.getElementById('seen');
        var appliedCheckbox = document.getElementById('applied');

        // Verify is user is in Linkedin Job Search url
        if (currentUrl.includes('linkedin.com') && currentUrl.includes('/jobs/search/')) {
            linkedinSearchDiv.style.display = 'block';
            messageElement.style.display = 'none';

            // Update the switch state on load
            var initialIsAndMode = !colorModeSwitch.checked;

            // Send the initial state to content.js
            chrome.tabs.sendMessage(currentTab.id, {
                action: "searchAndHighlight",
                isAndMode: initialIsAndMode
            }, function (response) {
                if (response) {
                    // Update HTML pop-up with searched title and location
                    if (response.searchTitle) {
                        searchTitleSpan.textContent = response.searchTitle;
                    }
                    if (response.searchLocation) {
                        searchLocationSpan.textContent = response.searchLocation;
                    }
                }
            });

            // Event listener for the switch
            colorModeSwitch.addEventListener('change', function () {
                var isAndMode = !colorModeSwitch.checked; // Adjusted to match logic

                // Send the switch state to content.js
                chrome.tabs.sendMessage(currentTab.id, {
                    action: "searchAndHighlight",
                    isAndMode: isAndMode
                });
            });

            // Event listener for the "Seen" checkbox
            seenCheckbox.addEventListener('change', function () {
                chrome.tabs.sendMessage(currentTab.id, {
                    action: "updateSeen",
                    seen: seenCheckbox.checked
                });
            });

            // Event listener for the "Applied" checkbox
            appliedCheckbox.addEventListener('change', function () {
                chrome.tabs.sendMessage(currentTab.id, {
                    action: "updateApplied",
                    applied: appliedCheckbox.checked
                });
            });

            // If NOT on Linkedin, display warning message    
        } else {
            linkedinSearchDiv.style.display = 'none';
            messageElement.style.display = 'block';
        }
    });
});
