let lastActiveTab = {
	"id": 0,
	"pinned": false
};
let loadInBackground = true;

browser.storage.local.get("loadInBackground").then(function(res) {
	if (res.loadInBackground === undefined) {
		loadInBackground = true;

		browser.storage.local.set({
			"loadInBackground": true
		});
	} else {
		loadInBackground = res.loadInBackground;
	}
});

browser.storage.onChanged.addListener(function(changes) {
	if (changes["loadInBackground"]) {
		loadInBackground = changes["loadInBackground"].newValue;
	}
});

browser.tabs.onActivated.addListener(function(activeInfo) {
	browser.tabs.get(activeInfo.tabId).then(function(activeTab) {
		lastActiveTab = {
			"id": activeTab.id,
			"pinned": activeTab.pinned
		};
	});
});

browser.tabs.onCreated.addListener(function(tab) {
	if (lastActiveTab.pinned) {
		browser.tabs.query({
			"currentWindow": true,
			"pinned": true
		})
		.then(function(tabs) {
			if (tab.index == tabs.length) {
				browser.tabs.move(tab.id, {
					index: -1
				})
				.then(function() {
					// in all cases scroll tab bar to the right
					browser.tabs.update(tab.id, { active: true }).then(function(updatedTab) {
						if (loadInBackground) {
							// update to opener tab
							browser.tabs.update(updatedTab.openerTabId, { active: true });
						}
					});
				});
			}
		});
	}
});
