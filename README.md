<a href="https://chrome.google.com/webstore/detail/kitsu-updater/maaganaggnnofcmkongapkhkjlehedfj"><img src="https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png"/></a>

### Supported Sites

- 9anime
- AnimaKAI
- Anime Haven*
- Anime Twist
- Crunchyroll*
- Daisuki*
- Funimation*
- GogoAnime*
- Hulu*
- KissAnime
- Masterani*
- MoeTube
- Netflix**
- SuperAnime
- VIZ*

\* These sites do not support automatic updating, and must be manually updated via the popup

** Netflix support is only for the new interface, which has not rolled out to all users yet

### Development

`npm install && npm run build`

```
build
|-- chrome
|-- firefox
`-- safari
dist
|-- chrome
|-- firefox
`-- safari
src
|-- browser
|   |-- chrome
|   |-- firefox
|   `-- safari
`-- common
    |-- css
    |-- html
    |-- img
    `-- js
```
