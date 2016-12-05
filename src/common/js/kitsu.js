const OAuth2 = require('client-oauth2')
const JsonApi = require('devour-client')
const baseUrl = 'https://staging.kitsu.io/api'

class Kitsu {
  constructor() {
    this.auth = new OAuth2({
      clientId: 'dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd',
      clientSecret: '54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151',
      accessTokenUri: baseUrl + '/oauth/token'
    })

    this.jsonApi = new JsonApi({ apiUrl: baseUrl + '/edge' })

    this.jsonApi.define('user', {
      name: '',
      avatar: { original: '' }
    })

    this.jsonApi.define('anime', {
      titles: {
        en: '',
        en_jp: '',
        ja_jp: ''
      },
      canonicalTitle: '',
      slug: '',
      posterImage: { original: '' },
      episodeCount: '',
      showType: '',
      episodes: {
        jsonApi: 'hasMany',
        type: 'episodes'
      }
    }, { collectionPath: 'anime' })

    this.jsonApi.define('episode', {
      titles: {
        en_jp: ''
      },
      canonicalTitle: '',
      seasonNumber: '',
      number: '',
      synopsis: '',
      airdate: '',
      length: '',
      thumbnail: { original: ''},
      media: {
        jsonApi: 'hasOne',
        type: 'anime'
      }
    })

    this.jsonApi.define('libraryEntry', {
      status: '',
      progress: '',
      reconsuming: '',
      reconsumeCount: '',
      private: '',
      rating: '',
      media: {
        jsonApi: 'hasOne',
        type: 'anime'
      },
      user: {
        jsonApi: 'hasOne',
        type: 'users'
      }
    }, { collectionPath: 'library-entries' })
  }

  authenticate(token) {
    this.jsonApi.headers['Authorization'] = `Bearer ${token}`
  }

  login(username, password) {
    this.auth.owner.getToken(username, password).then((user) => {
      localStorage.setItem('username', username)
      localStorage.setItem('token', user.accessToken)
      localStorage.setItem('refresh', user.refreshToken)
      this.getUser().then((user) => { localStorage.setItem('id', user.id) })
      this.authenticate(user.accessToken)
    })
  }

  logout(callback) {
    localStorage.removeItem('id')
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    callback()
  }

  getUser() {
    return new Promise((pass, fail) => {
      this.jsonApi.findAll('user', {
        filter: {
          name: localStorage.getItem('username')
        }
      }).then((users) => {
        pass(users[0])
      })
    })
  }

  getAnime(id) {
    return new Promise((pass, fail) => {
      this.jsonApi.find('anime', id).then((anime) => {
        pass(anime)
      })
    })
  }

  searchAnime(query) {
    return new Promise((pass, fail) => {
      this.jsonApi.findAll('anime', {
        filter: {
          text: query
        }
      }).then((anime) => {
        pass(anime)
      })
    })
  }

  getEpisodes(anime) {
    return new Promise((pass, fail) => {
      this.jsonApi.findAll('anime', {
        filter: { id: anime },
        include: 'episodes'
      }).then((anime) => {
        let { episodes } = anime[0]
        episodes.sort((a, b) => {
          if (a.seasonNumber != b.seasonNumber)
            return a.seasonNumber - b.seasonNumber
          return a.number - b.number
        })
        pass(episodes)
      })
    })
  }

  createEntry(entry) {
    return new Promise((pass, fail) => {
      this.jsonApi.create('libraryEntry', entry).then((entry) => {
        pass(entry)
      })
    })
  }

  getEntry(id) {
    return new Promise((pass, fail) => {
      this.jsonApi.find('libraryEntry', id).then((entry) => {
        pass(entry)
      })
    })
  }

  getEntryForAnime(id) {
    return new Promise((pass, fail) => {
      this.jsonApi.findAll('libraryEntry', {
        filter: {
          userId: localStorage.getItem('id'),
          mediaId: id
        }
      }).then((entries) => {
        if (entries[0])
          pass(entries[0])
        else
          fail(Error('none'))
      })
    })
  }

  updateEntry(entry) {
    return new Promise((pass, fail) => {
      this.jsonApi.update('libraryEntry', entry).then((entry) => {
        pass(entry)
      })
    })
  }

  removeEntry(id) {
    return new Promise((pass, fail) => {
      this.jsonApi.destroy('libraryEntry', id).then((entry) => {
        pass(entry)
      })
    })
  }
}

module.exports = Kitsu
