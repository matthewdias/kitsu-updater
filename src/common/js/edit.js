const { sendMessage, navigateTo } = require('./browser')

const getParameterByName = (name) => {
  let match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search)
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}
const animeId = getParameterByName('anime')
const playerEpisode = getParameterByName('episode')
const title = getParameterByName('title').replace(/^\s+|\s+$/g, '')

const animeLink = document.getElementById('anime-link')
const poster = document.getElementById('poster')
const animeSelect = document.getElementById('anime-select')
const animeSave = document.getElementById('anime-save')
const ignore = document.getElementById('ignore')
const episodeLink = document.getElementById('episode-link')
const thumbnail = document.getElementById('thumbnail')
const episodeSelect = document.getElementById('episode-select')
const episodeSave = document.getElementById('episode-save')
const status = document.getElementById('status')
const reconsuming = document.getElementById('reconsuming')
const reconsumes = document.getElementById('reconsumes')
const rating = document.getElementById('rating')
const progress = document.getElementById('progress')
const progressCount = document.getElementById('progress-count')
const saveButton = document.getElementById('save')

sendMessage({ action: 'sendpause', anime: animeId })
sendMessage({ action: 'anime', id: animeId }, (anime) => {
  animeLink.href = `https://kitsu.io/anime/${anime.slug}`
  poster.src = anime.posterImage.original
  animeSave.disabled = true
  let ignored = localStorage.getItem('ignored')
  ignore.checked = ignored && ignored.includes(title)
  episodeLink.href = `https://kitsu.io/anime/${anime.slug}`
  episodeSave.disabled = true
  reconsuming.disabled = true
  reconsumes.value = 0
  reconsumes.disabled = true
  rating.disabled = true
  progress.value = 0
  progressCount.innerHTML = ` / ${anime.episodeCount ? anime.episodeCount : '-'}`
  progress.disabled = true
  sendMessage({ action: 'search', query: title }, (results) => {
    results.map((anime) => {
      animeSelect.innerHTML += `<option value="${anime.id}"${
        (anime.id == animeId) ? ' selected' : ''
      }>${anime.canonicalTitle} [${anime.subtype}]</option>`
    })
  })
  sendMessage({ action: 'episodes', anime: animeId }, (episodes) => {
    let episode = episodes[playerEpisode - 1]
    if (episode) {
      if (episode.thumbnail)
        thumbnail.src = episode.thumbnail.original
      episodes.map((episode, index) => {
        let ep = `<option value="${index + 1}"`
        if (playerEpisode == index + 1)
          ep += ' selected'
        ep += '>'
        if (episode.seasonNumber)
          ep += episode.seasonNumber + 'x'
        ep += episode.number
        if (episode.canonicalTitle)
          ep += ': ' + episode.canonicalTitle
        episodeSelect.innerHTML += ep
      })
    }
  })
  sendMessage({ action: 'entry', id: animeId }, (response) => {
    if (response.success) {
      let { entry } = response
      reconsuming.disabled = false
      reconsumes.disabled = false
      rating.disabled = false
      progress.disabled = false
      status.value = entry.status
      reconsuming.checked = entry.reconsuming
      reconsumes.value = entry.reconsumeCount
      if (entry.rating)
        rating.value = entry.rating
      progress.value = parseInt(entry.progress)
    }
  })

  animeSelect.onchange = (event) => {
    animeSave.disabled = animeSelect.value == animeId
  }

  animeSave.onclick = (event) => {
    sendMessage({ action: 'modify', anime: animeId, correction: animeSelect.value })
    navigateTo(`html/edit.html?anime=${animeSelect.value}&title=${title}&episode=${playerEpisode}`)
  }

  ignore.onchange = (event) => {
    let ignored = localStorage.getItem('ignored')
    if (!ignored || ignored == 'undefined')
      ignored = ''
    if (ignore.checked) {
      localStorage.setItem('ignored', ignored + title + ',')
    }
    else {
      localStorage.setItem('ignored', ignored.replace(title + ','), '')
    }
  }

  episodeSelect.onchange = (event) => {
    episodeSave.disabled = episodeSelect.value == parseInt(playerEpisode)
  }

  episodeSave.onclick = (event) => {
    let correction = parseInt(episodeSelect.value)
    sendMessage({ action: 'editepisode', anime: animeId, episode: correction })
    navigateTo(`html/edit.html?anime=${animeId}&title=${title}&episode=${correction}`)
  }

  status.onchange = (event) => {
    let untracked = status.value == 'untracked'
    reconsuming.disabled = untracked
    reconsumes.disabled = untracked
    rating.disabled = untracked
    progress.disabled = untracked
  }

  save.onclick = (event) => {
    let data = {
      status: status.value == 'untracked' ? null : status.value,
      reconsuming: reconsuming.checked,
      reconsumeCount: parseInt(reconsumes.value),
      rating: rating.value == 'unrated' ? null : rating.value,
      progress: parseInt(progress.value)
    }
    sendMessage({ action: 'entry', id: animeId }, (response) => {
      if (response.success) {
        let { entry } = response
        let oldStatus = entry.status
        data.id = entry.id
        if (status.value != 'untracked') {
          sendMessage({ action: 'update', entry: data }, (entry) => {
            if (oldStatus != entry.status) {
              if (entry.status == 'current')
                sendMessage({ action: 'inject', anime: animeId })
              else if (oldStatus == 'current') {
                sendMessage({ action: 'untrack', anime: animeId })
              }
            }
          })
        }
        else
          sendMessage({ action: 'remove', id: entry.id, anime: animeId })
      }
      else {
        data.anime = { id: parseInt(anime.id) }
        data.user = { id: parseInt(localStorage.getItem('id')) }
        sendMessage({ action: 'create', entry: data }, (entry) => {
          if (entry.status == 'current')
            sendMessage({ action: 'inject', anime: animeId })
        })
      }
    })
  }
})
