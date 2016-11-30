const { findStrategy } = require('media-strategies')
const { sendMessage, onMessage } = require('./browser')

let playing = false
let tracking = false
let title = ''
let url = document.URL
let strategy = findStrategy(url)
if (strategy) {
  const player = require('media-strategies/strategies/' + strategy)
  sendMessage({ action: 'option', option: player.playerName }, (enabled) => {
    if (enabled === 'true') {
      title = player.getTitle().replace(/^\s+|\s+$/g, '')
      sendMessage({ action: 'option', option: 'ignored' }, (ignored) => {
        if (ignored) {
          if (!ignored.includes(title))
            setTimeout(track, 2000)
        }
        else setTimeout(track, 2000)
      })
    }
  })

  if (player.getPlaying) {
    onMessage((request, sender, sendResponse) => {
      if (request == 'pause') {
        if (player.getPlaying())
          player.playPause()
      }
      if (request == 'play') {
        if (!player.getPlaying())
          player.playPause()
      }
    })
  }

  const track = () => {
    sendMessage({
      action: 'connect',
      title,
      episode: player.getEpisode(),
    }, (response) => {
      tracking = response
      if (tracking) {
        if (player.getPlaying) {
          let sync = setInterval(() => {
            if (tracking) {
              let progress = Math.floor((player.getPlayhead() / player.getLength()) * 100)
              if (progress > 80 || url != document.URL)
                tracking = false
              sendMessage({
                action: 'playhead',
                playhead: progress
              }, (proceed) => {
                tracking = proceed
              })
              if (playing == true && !player.getPlaying()) {
                playing = false
                sendMessage({ action: 'pause' })
              }
              else if (playing == false && player.getPlaying()) {
                playing = true
                sendMessage({ action: 'play' })
              }
            }
            else clearInterval(sync)
          }, 1000)
        }
      }
    })
  }
}
