const { getVersion, sendMessage, setIcon } = require('./browser')

const loginDiv = document.getElementById('login')
const userField = document.getElementById('username')
const passField = document.getElementById('password')
const loginButton = document.getElementById('submit')
const userDiv = document.getElementById('user')
const avatar = document.getElementById('avatar')
const name = document.getElementById('name')
const logoutButton = document.getElementById('logout')
const grayscale = document.getElementById('grayscale')
const sitesDiv = document.getElementById('sites')
const save = document.getElementById('save')
const ignoredTitle = document.getElementById('ignored-title')
const ignored = document.getElementById('ignored')
const ignoreSave = document.getElementById('ignore-save')
const version = document.getElementById('version')

const sites = [
  '9anime',
  'Anime Haven',
  'Anime Twist',
  'Crunchyroll',
  'Daisuki',
  'Funimation',
  'Hulu',
  'KissAnime',
  'Masterani',
  'MoeTube',
  'Netflix',
  'VIZ'
]

const initSites = () => {
  sites.map((site) => {
    if (!localStorage.getItem(site))
      localStorage.setItem(site, true)
  })
}

const loadUser = () => {
  if (localStorage.getItem('token')) {
    sendMessage({ action: 'user' }, (user) => {
      if (user.avatar)
        avatar.src = user.avatar.medium
      name.innerHTML = user.name
      logoutButton.onclick = (event) => {
        sendMessage({ action: 'logout' })
        userDiv.style = 'display:none;'
        loginDiv.style = 'display:inline;'
      }
      loginDiv.style = 'display:none;'
      userDiv.style = 'display:inline;'
    })
  }
}

const loadSites = () => {
  sites.map((site) => {
    let id = site.toLowerCase().replace(' ', '-')
    let enabled = localStorage.getItem(site)

    sitesDiv.innerHTML +=
      `<div>
        <label>
          <input type="checkbox" id="${id}" ${enabled === 'true' ? 'checked' : ''}/>
          ${site}
        </label>
      </div>`
  })
}

const loadIgnored = () => {
  let titles = localStorage.getItem('ignored')
  if (!titles || titles == 'undefined') {
    ignoredTitle.style = 'display:none;'
    ignoreSave.style = 'display:none;'
  }
  else {
    let boxes = titles.split(',')
    boxes.filter((title, index) => {
      return index < boxes.length - 1
    }).map((title, index) => {
      ignored.innerHTML +=
        `<div>
          <label>
            <input type="checkbox" id="${index}" checked />
            ${title}
          </label>
        </div>`
    })
  }
}

passField.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.keyCode == 13)
      loginButton.click();
})

loginButton.onclick = (event) => {
  sendMessage({
    action: 'login',
    username: userField.value,
    password: passField.value
  }, (success) => {
    if (success)
      loadUser()
  })
}

grayscale.onchange = (event) => {
  localStorage.setItem('grayscale', grayscale.checked)
  setIcon()
}

save.onclick = (event) => {
  sites.map((site) => {
    let id = site.toLowerCase().replace(' ', '-')
    let checkbox = document.getElementById(id)
    localStorage.setItem(site, checkbox.checked)
  })
}

ignoreSave.onclick = (event) => {
  let titles = localStorage.getItem('ignored')
  let boxes = titles.split(',')
  boxes.filter((title, index) => {
    return index < boxes.length - 1
  }).map((title, index) => {
    let t = document.getElementById(index)
    if (!t.checked)
      localStorage.setItem('ignored', titles.replace(title + ','), '')
  })
  location.reload()
}

let oldVersion = localStorage.getItem('version')
let newVersion = getVersion()
version.innerHTML = 'v' + newVersion
version.href = `https://github.com/matthewdias/kitsu-updater/releases/tag/${newVersion}`
if (oldVersion != newVersion) {
  initSites()
  localStorage.setItem('version', newVersion)
}

let gray = localStorage.getItem('grayscale')
if (gray == 'true')
  grayscale.checked = true

loadUser()
loadSites()
loadIgnored()
