const {
  getVersion,
  sendMessageToContent,
  onMessage,
  onRemoved,
  onUpdated,
  inject,
  openTab,
  setIcon,
  contextMenu
} = require('./browser')
const Manager = require('./manager')
const manager = new Manager()
if (chrome) {
  const manifest = chrome.runtime.getManifest()
}

let oldVersion = localStorage.getItem('version')
let newVersion = getVersion()
if (oldVersion != newVersion) {
  if (oldVersion == null)
    openTab('html/options.html')
}

setIcon()

contextMenu({
  title: 'Search Anime',
  contexts: [ 'selection' ],
  onclick: (info) => {
    let { selectionText } = info
    openTab('https://staging.kitsu.io/anime?text=' + selectionText)
  }
})

contextMenu({
  title: 'Search Manga',
  contexts: [ 'selection' ],
  onclick: (info) => {
    let { selectionText } = info
    openTab('https://staging.kitsu.io/manga?text=' + selectionText)
  }
})

onRemoved((tabId) => {
  manager.removePlayer(tabId)
})

onUpdated((tabId, changeInfo, tab) => {
  if (chrome && manager.players[tabId] && changeInfo.url) {
    let strategies = manifest.content_scripts[0].matches
    let inj = false
    strategies.map((strategy) => {
      let match = strategy.substring(0, strategy.length - 1)
      if (changeInfo.url.indexOf(match) != -1)
        inj = true
    })
    if (inj)
      inject(tabId, 'js/content.js')
    else
      manager.removePlayer(tabId)
  }
})

onMessage((request, sender, sendResponse) => {
  if (request.action == 'option') {
    sendResponse(localStorage.getItem(request.option))
    return
  }
  if (request.action == 'connect') {
    manager.addPlayer(sender.tab.id, request.title, request.episode, () => {
      sendResponse(true)
    })
    return
  }
  if (request.action == 'inject') {
    manager.getTabFromAnime(request.anime, (tab) => {
      inject(tab, 'js/content.js')
    })
    return
  }
  if (request.action == 'modify') {
    manager.getTabFromAnime(request.anime, (tab) => {
      manager.setAnime(tab, request.correction)
    })
    return
  }
  if (request.action == 'editepisode') {
    manager.getTabFromAnime(request.anime, (tab) => {
      manager.editEpisode(tab, request.episode)
    })
    return
  }
  if (request.action == 'playhead') {
    manager.playhead(sender.tab.id, request.playhead, (proceed) => {
      sendResponse(proceed)
    })
    return
  }
  if (request.action == 'play') {
    manager.play(sender.tab.id)
    return
  }
  if (request.action == 'pause') {
    manager.pause(sender.tab.id)
    return
  }
  if (request.action == 'sendplay') {
    manager.getTabFromAnime(request.anime, (tab) => {
      sendMessageToContent(tab, 'play')
    })
    return
  }
  if (request.action == 'sendpause') {
    manager.getTabFromAnime(request.anime, (tab) => {
      sendMessageToContent(tab, 'pause')
    })
    return
  }
  if (request.action == 'login') {
    manager.kitsu.login(request.username, request.password)
    return
  }
  if (request.action == 'user') {
    manager.kitsu.getUser().then((user) => {
      sendResponse(user)
    })
    return
  }
  if (request.action == 'anime') {
    manager.kitsu.getAnime(request.id).then((anime) => {
      sendResponse(anime)
    })
    return
  }
  if (request.action == 'search') {
    manager.kitsu.searchAnime(request.query).then((results) => {
      sendResponse(results)
    })
    return
  }
  if (request.action == 'episodes') {
    manager.kitsu.getEpisodes(request.anime).then((episodes) => {
      sendResponse(episodes)
    })
    return
  }
  if (request.action == 'entry') {
    manager.kitsu.getEntryForAnime(request.id).then((entry) => {
      sendResponse({ success: true, entry })
    }).catch((error) => {
      sendResponse({ success: false })
    })
    return
  }
  if (request.action == 'create') {
    manager.kitsu.createEntry(request.entry).then((entry) => {
      sendResponse(entry)
    })
    return
  }
  if (request.action == 'update') {
    manager.kitsu.updateEntry(request.entry).then((entry) => {
      sendResponse(entry)
    })
    return
  }
  if (request.action == 'remove') {
    manager.kitsu.removeEntry(request.id).then(() => {
      manager.getTabFromAnime(request.anime, (tab) => {
        manager.stopTracking(tab)
      })
    })
    return
  }
  if (request.action == 'untrack') {
    manager.getTabFromAnime(request.anime, (tab) => {
      manager.stopTracking(tab)
    })
    return
  }
})
