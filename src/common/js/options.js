const { getVersion, sendMessage } = require('./browser')

const loginDiv = document.getElementById('login')
const userField = document.getElementById('username')
const passField = document.getElementById('password')
const loginButton = document.getElementById('submit')
const userDiv = document.getElementById('user')
const avatar = document.getElementById('avatar')
const name = document.getElementById('name')
const logoutButton = document.getElementById('logout')
const sitesDiv = document.getElementById('sites')
const save = document.getElementById('save')

const sites = [
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

const init = () => {
  sites.map((site) => {
    localStorage.setItem(site, true)
  })
}

const loadUser = () => {
  sendMessage({ action: 'user' }, (user) => {
    avatar.src = user.avatar.original
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
  }, loadUser())
}

save.onclick = (event) => {
  sites.map((site) => {
    let id = site.toLowerCase().replace(' ', '-')
    let checkbox = document.getElementById(id)
    localStorage.setItem(site, checkbox.checked)
  })
}

let oldVersion = localStorage.getItem('version')
let newVersion = getVersion()
if (oldVersion != newVersion) {
  if (oldVersion == null)
    init()
  localStorage.setItem('version', newVersion)
}

loadUser()
loadSites()
