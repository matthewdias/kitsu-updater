const Kitsu = require('./kitsu')
const { openPopup, getViews, setPopup } = require('./browser')

class Manager {
  constructor() {
    this.players = []
    this.kitsu = new Kitsu()
    let token = localStorage.getItem('token')
    let refresh = localStorage.getItem('refresh')
    if (token && refresh) {
      this.kitsu.refresh(token, refresh).then((authToken) => {
        let { access_token, refresh_token } = authToken.data
        localStorage.setItem('token', access_token)
        localStorage.setItem('refresh', refresh_token)
        this.kitsu.authenticate(access_token)
      })
    }
  }

  addPlayer(id, title, episode, callback) {
    this.players[id] = { title, episode }
    this.kitsu.searchAnime(title).then((results) => {
      let anime = results[0]
      this.setAnime(id, anime.id).then((result) => {
        let { entry, animeTitle, popup } = result
        let body = 'Not in Library | Click to start tracking'
        if (entry) {
          if (entry.status == 'current') {
            this.players[id].tracking = true
            if (callback)
              callback()
            body = `Progress: ${entry.progress}/${anime.episodeCount ? anime.episodeCount : '-'} | Click to modify`
          }
          else {
            let status = null
            if (entry.status == 'planned') { status = 'Plan to Watch' }
            if (entry.status == 'completed') { status = 'Completed' }
            if (entry.status == 'on_hold') { status = 'On Hold' }
            if (entry.status == 'dropped') { status = 'Dropped' }
            body = `Status: ${status} | Click to start tracking`
          }
        }
        let n = new Notification(animeTitle, {
          body,
          icon: anime.posterImage.original
        })
        n.onclick = (event) => {
          openPopup(popup)
        }
        setTimeout(n.close.bind(n), 5000)
        // send start
      })
    })
  }

  setAnime(id, anime) {
    this.players[id].anime = anime
    this.players[id].tracking = false
    return new Promise((pass, fail) => {
      this.kitsu.getAnime(anime).then((anime) => {
        let { title, episode } = this.players[id]
        let animeTitle = anime.canonicalTitle
        if (anime.showType != 'movie' || anime.episodeCount > 1)
          animeTitle += ` Episode ${episode}`
        let popup = `html/edit.html?anime=${anime.id}&title=${title}&episode=${episode}`
        setPopup({
          tabId: id,
          title: animeTitle,
          popup
        })
        this.kitsu.getEntryForAnime(anime.id).then((entry) => {
          this.players[id].entry = entry.id
          pass({ entry, animeTitle, popup })
        }).catch((error) => {
          pass({ entry: null, animeTitle, popup })
        })
      })
    })
  }

  editEpisode(id, episode) {
    this.players[id].episode = episode
  }

  getTabFromAnime(id, callback) {
    for (let p in this.players) {
      if (this.players[p].anime == id) {
        if (callback)
          callback(parseInt(p))
        return
      }
    }
  }

  playhead(id, progress, callback) {
    if (this.players[id].tracking) {
      this.players[id].playhead = progress
      if (progress > 80) {
        this.stop(id)
      }
      callback(true)
    }
    else
      callback(false)
  }

  play(id) {
    // send start
    this.players[id].playing = true
  }

  pause(id) {
    // send pause
    this.players[id].playing = false
  }

  stop(id) {
    let { anime, entry, episode, playhead, title } = this.players[id]
    this.kitsu.getAnime(anime).then((anime) => {
      this.kitsu.getEntry(entry).then((entry) => {
        if (episode > entry.progress) {
          let data = { id: entry.id, progress: episode }
          if (episode == anime.episodeCount) {
            data.status = 'completed'
            if (entry.reconsuming) {
              data.reconsuming = false
              data.reconsumeCount = entry.reconsumeCount + 1
            }
          }
          this.kitsu.updateEntry(data).then((entry) => {
            let ntitle = anime.canonicalTitle
            if (anime.showType != 'movie' || anime.episodeCount > 1)
              ntitle += ` Episode ${episode}`
            let n = new Notification(ntitle, {
              body: `Submitting: ${episode}/${anime.episodeCount ? anime.episodeCount : '-'} | Click to modify`,
              icon: anime.posterImage.original
            })
            n.onclick = (event) => {
              openPopup(`html/edit.html?anime=${anime.id}&title=${title}&episode=${episode}`)
            }
          })
        }
      })
    })
  }

  stopTracking(id) {
    if (this.players[id])
      this.players[id].tracking = false
  }

  removePlayer(id) {
    if (this.players[id]) {
      if (this.players[id].tracking)
        this.stop(id)
      let views = getViews()
      views.map((view) => {
        if (view.location.href.includes(this.players[id].anime))
          view.close()
      })
      this.players.splice(this.players.indexOf(id), 1)
    }
  }
}

module.exports = Manager
