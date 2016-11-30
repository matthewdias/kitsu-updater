const getVersion = () => {
  if (chrome.runtime)
    return chrome.runtime.getManifest().version
}

const sendMessage = (message, callback) => {
  if (chrome.runtime)
    chrome.runtime.sendMessage(message, callback)
}

const sendMessageToContent = (id, message) => {
  if (chrome.tabs)
    chrome.tabs.sendMessage(id, message)
}

const onMessage = (listener) => {
  if (chrome) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      listener(request, sender, sendResponse)
      return true
    })
  }
}

const onRemoved = (listener) => {
  if (chrome) {
    chrome.tabs.onRemoved.addListener((tabId) => {
      listener(tabId)
    })
  }
}

const onUpdated = (listener) => {
  if (chrome) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      listener(tabId, changeInfo, tab)
    })
  }
}

const inject = (tabId, file) => {
  if (chrome)
    chrome.tabs.executeScript(tabId, { file: file })
}

const openTab = (page) => {
  if (chrome)
    chrome.tabs.create({ url: chrome.extension.getURL(page) })
}

const openPopup = (page) => {
  if (chrome) {
    chrome.windows.create({
      url: chrome.extension.getURL(page),
      type: 'popup',
      width: 500,
      height: 500
    })
  }
}

const navigateTo = (location) => {
  if (chrome) {
    window.location.replace(chrome.extension.getURL(location))
  }
}

const getViews = () => {
  if (chrome)
    return chrome.extension.getViews()
}

const setPopup = (options) => {
  let { tabId, title, popup } = options
  if (chrome) {
    if (title) {
      chrome.browserAction.setTitle({ tabId, title })
    }
    if (popup) {
      chrome.browserAction.setPopup({ tabId, popup })
    }
  }
}

module.exports = { getVersion, sendMessage, sendMessageToContent, onMessage, onRemoved, onUpdated, inject, openTab, openPopup, navigateTo, getViews, setPopup }
