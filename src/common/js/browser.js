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
  if (chrome) {
    let url = ''
    if (page.includes('http'))
      url = page
    else url = chrome.extension.getURL(page)
    chrome.tabs.create({ url })
  }
}

const openPopup = (page) => {
  if (chrome) {
    let url = ''
    if (page.includes('http'))
      url = page
    else url = chrome.extension.getURL(page)
    chrome.windows.create({
      url,
      type: 'popup',
      width: 500,
      height: 500
    })
  }
}

const navigateTo = (location) => {
  if (chrome) {
    let url = ''
    if (location.includes('http'))
      url = location
    else url = chrome.extension.getURL(location)
    window.location.replace(url)
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

const setIcon = () => {
  let grayscale = localStorage.getItem('grayscale')
  if (grayscale == 'true') {
    chrome.browserAction.setIcon({
      path: {
        16: '../img/icongray16.png',
        32: '../img/icongray32.png',
        128: '../img/icongray128.png'
      }
    })
  }
  else {
    chrome.browserAction.setIcon({
      path: {
        16: '../img/icon16.png',
        32: '../img/icon32.png',
        128: '../img/icon128.png'
      }
    })
  }
}

const contextMenu = (options) => {
  if (chrome) {
    chrome.contextMenus.create(options)
  }
}

module.exports = { getVersion, sendMessage, sendMessageToContent, onMessage, onRemoved, onUpdated, inject, openTab, openPopup, navigateTo, getViews, setPopup, setIcon, contextMenu }
