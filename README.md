# 📺 TogetherTube

_TogetherTube is a YouTube client that brings YouTube and playback sync together!_

![](./assets/images/landing.png)
![](./assets/images/active.png)
![](./assets/images/videosync.gif)

<table style="margin-left: auto; margin-right: auto;">
    <tr>
        <td align="center"><a href="#live-demo">💻Live demo<a></td>
        <td align="center"><a href="#the-concept">💡 The Concept<a></td>
        <td align="center"><a href="#features">📝Features <a></td>
        <td align="center"><a href="#-youtube-player-api">📺 YouTube Player API<a></td>
        <td align="center"><a href="#-youtube-data-api">📖 YouTube Data API<a></td>
        <td align="center"><a href="#data-lifecycle-diagram">🔄 Data lifecycle diagram<a></td>
        <td align="center"><a href="#-installation">🤖 Installation<a></td>
        <td align="center"><a href="#-sources">🤝 Sources<a></td>
        <td align="center"><a href="#-license">📝 License<a></td>
    </tr>
</table>

## 💻Live demo

[Link to the demo](https://real-time-web-2021.herokuapp.com/)

## 💡The concept

TogetherTube is a YouTube client that brings YouTube and playback sync together using Socket.io. Users can enter a YouTube URL in the search bar to open a player. On that page, they'll be greeted with the desired video along a live chat and related videos.

<details>
    <summary>Concept 1</summary>
    The first concept was similar to the final concept. Unlike the final version, it used an oauth login screen that would allow personalized rooms. The main difference was to control your other devices/tabs. After a review, it became clear that it should focus on the multi-user aspect rather than single-user&multi-device.
    <img src='./assets/images/concept1.png'>
</details>

<details>
    <summary>The (final) concept </summary>
    While processing the feedback on my first concept, I decided to follow the multi-user comment. In this iteration I focussed on syncing playback and adding more multi-user features (the chat) and applied them in the concept. To improve and stimulate usage and UX, I stripped away the login and personalization such as playlists and custom rooms.
    <img src="./assets/images/concept2.png">
    Here's how the data will flow within the application.
    <img src='./assets/images/concept2_data.png'>
</details>

## 📝Features

- Search any YouTube video
- Play any YouTube video
- Watch any YouTube video together
- Chat together on any YouTube video
- Get related videos on any YouTube video
- Save TogetherTube as PWA on your device

### MoSCoW
**Must haves**

*Core functionality*   
- [x] Create room by YouTube link
- [x] Count of members in a room

*Player*
- [x] Play video in the room 

*Chat*   
- [x] Chat with other viewers
- [x] Cache messages and restrict chat history to one hour

*Related videos*   
- [x] Display related videos
- [x] Related video creates and joins new room
- [x] Cache related videos on an external DB

**Should haves**

*Core functionality*
- [x] Mobile friendly layout
- [x] A search bar to paste links and open new rooms

*Player*
- [x] Sync position in the video with the room 
- [x] Sync the playback state with the room 

*Chat*
- [x] Know when others join the room
- [x] Have a name when chatting if not anonymous

**Could haves**

*Core functionality*
- [x] Custom playbar 
- [X] Video title as tab title
- [ ] Creating playlists starting from current video

**Won't have this time**
- [ ] User roles for playback controls
- [ ] Manually searching videos
- [ ] Redirect to next video in related videos section

## 📺 YouTube Player API

**Source**: [link to iframe API](https://developers.google.com/youtube/iframe_api_reference)

The YouTube player API provides an iFrame wherein the video player is found. The API supports two different approaches; automatically where the iFrame player embeds a video link, then renders it in the iFrame: 

```html
<iframe id="ytplayer" type="text/html" width="640" height="360"
  src="YouTubeLinkGoesHere?autoplay=1&origin=http://example.com/"
  frameborder="0"></iframe>
```

In this case, the player takes the given url source along with its parameters `?autoplay=1&origin=http://example.com/"` to generate a video player within the iframe. The parameters are optional and can be expended with additional parameters found in the documentation: [link to additional parameters](https://developers.google.com/youtube/player_parameters).

The manual approach, however, is different. This approach needs an additional piece of javascript to render the iframe. The main advantages are: 
* Programmatically change sources
* Handle player events manually
* Retrieve additional meta data 

For this project, we're using the manual way to handle `data` events: 
* state: `1` - video is playing
* state: `2` - video is paused
* state: `3` - video is seeking

Knowing this, we can use javascript to interact with the `Player` object, which contains methods such as `pauseVideo()`, `playVideo()`, `seekTo()`, and other interactions normally found in the UI. [See complete list](https://developers.google.com/youtube/iframe_api_reference#Functions)

## 📖 YouTube Data API
**Source**: [link to YouTube Data API](https://developers.google.com/youtube/v3)

This project uses the YouTube Data API to retrieve and render related videos to the video that is currently playing. To achieve that, the `Search` endpoint is used: [link to the Search endpoint](https://developers.google.com/youtube/v3/docs/search). This endpoint takes a video id and returns videos related to it. The data returned contains the following from which only the snippets are used: 

```JSON
{
    "kind": "youtube#searchResult",
    "etag": etag,
    "id": {
        "kind": string,
        "videoId": string,
        "channelId": string,
        "playlistId": string
    },
    "snippet": {
        "publishedAt": datetime,
        "channelId": string,
        "title": string,
        "description": string,
        "thumbnails": {
        (key): {
            "url": string,
            "width": unsigned integer,
            "height": unsigned integer
        }
        },
        "channelTitle": string,
        "liveBroadcastContent": string
    }
}
```

## 🔄Data lifecycle diagram

![](./assets/images/data_lifecycle_diagram.png)

### Real-time events
1. **State**    
The `state` event handles the seeking events sent from the client and broadcasts it to other clients. The state contains the `roomid`, `timestamp`, and `playstate`
```javascript 
{
  id: String,
  playing: Boolean,
  timestamp: Number,
  room: String
}
```
2. **Playback**    
The `playback` event handles the playback state of a give room. The array contains a room name and its playback state that is emitted to other clients connected to that room. The playback state is a boolean that plays the video on true and pauses it on false.
```javascript
{ 
  room: String, 
  state: Boolean 
}
```
3. **Message**   
The `message` event handles the sent messages from clients. The client emits a `message` event which is fetched by the server, the server caches the message using the `cacheMessage` function, and then emits the received message object to the entire room which is then rendered to in the DOM.
```JSON
{
  "roomName": [
    {
      "name": String,
      "message": String,
      "timestamp": Number,
      "room": String
    }
  ]
}
```

### Caching data 

This projects optimizes data storage and tries to serve them as efficiently as possible. The two features that handle data, the related videos and messages, are stored and managed differently.

**Related cache**  
It is created when the user opens a room that has not been cached previously. The cache has the following structure:

```JSON
{
  "roomId": [
    {
        "kind": "youtube#searchResult",
        "etag": etag,
        "id": {
            "kind": string,
            "videoId": string,
            "channelId": string,
            "playlistId": string
        },
        "snippet": {
            "publishedAt": datetime,
            "channelId": string,
            "title": string,
            "description": string,
            "thumbnails": {
            (key): {
                "url": string,
                "width": unsigned integer,
                "height": unsigned integer
            }
            },
            "channelTitle": string,
            "liveBroadcastContent": string
        }
    }
  ]
}
```

While the related videos is a nice-to-have feature, it is not essential to the core functionality. Therefore, it has been decided to load the related cache in `async`. Furthermore, in consideration to the API quota limit, the cache is hosted on a remote, cloud-based Redis database. This does add some latency; the application fetches data over the internet, transforms the data, then sends it to the client over the internet.

**Messages cache**  
The messages are cached in a local JSON file called `messagesCache` with the following structure:

```JSON
{
  "roomName": [
    {
      "name": String,
      "message": String,
      "timestamp": Number,
      "room": String
    }
  ]
}
```
The chat functionality is instant messaging therefore it is essential to fetch, save, and send data as fast as possible. That considered, it has been decided that storing messages in a local file is the preferred method.

## 🤖 Installation

**Dependencies**
* Node
* [Express](http://npmjs.com/package/express) `^4.17.1`
* [EJS](https://www.npmjs.com/package/ejs) `^3.1.6`
* [Dotenv](https://www.npmjs.com/package/dotenv) `^8.2.0`
* [Body-parser](https://www.npmjs.com/package/body-parser) `^1.19.0`
* [Socket.io](https://www.npmjs.com/package/socket.io) `^4.0.1`
* [Axios](https://www.npmjs.com/package/axios) `^0.21.1`
* [Async-redis](https://www.npmjs.com/package/async-redis) `^1.1.7`
* [Lowdb](https://www.npmjs.com/package/lowdb) `^1.0.0`


**Get a YouTube API key**  
Requirements:

- Google account
- Redis database

Get your Youtube API key:

1. Open the cloud console [link](https://console.cloud.google.com/apis/dashboard)
2. Create a project
3. Open the project
4. Go to the `API Console`
5. Enable `YouTube Data API v3`
6. Copy your API key to the `.env` file in project root

Set up Redis database:

- Local:
  - Windows: [guide](https://redislabs.com/blog/redis-on-windows-10/)
  - MacOS using `homebrew`: `brew install redis`
  - Unix using buildtools: [download binary](https://redis.io/download)
- Cloud (preferred method)
  1. Create an account at [RedisLabs](https://redislabs.com/try-free/)
  2. Copy credentials to the `.env` in project root

**Run the project:**

1. Install dependencies
   `npm install`
2. Run project
   `npm start`

## 🤝 Sources

- [Youtube Iframe API](https://developers.google.com/youtube/iframe_api_reference)
- [Youtube Data API v3](https://developers.google.com/youtube/v3)
- [Youtube Data API v3 - Search](https://developers.google.com/youtube/v3/docs/search)
- [Socket.io v4 - Documentation](https://socket.io/docs/v4)
- [Async-Redis - Documentation](https://www.npmjs.com/package/async-redis)
- [Shabier - lowdb functions](https://github.com/sjagoori/Read-it/blob/master/modules/cache.js)
- [Shabier - async-redis functions](https://github.com/sjagoori/Read-it/blob/f78ea967bda688cfb08b0fd65dee2bfc8168fb89/modules/cache.js)

## 📝 License

[GPLv3](https://choosealicense.com/licenses/gpl-3.0/)

![](https://visitor-badge.laobi.icu/badge?page_id=sjagoori.realtime-web)
