let accessToken;
const clientID = '8b2dabf9bd624e319ebf5020ae72516e';
let redirectURI = process.env.REACT_APP_REDIRECT; //'http://localhost:3000'

const Spotify = {
    getAccessToken(term='') {
        if (accessToken) {
            return accessToken;
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1])
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }
        
        const accessURL = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
            client_id: clientID,
            response_type: 'token',
            redirect_uri: redirectURI,
            scope: 'playlist-modify-public',
            state: term
        });
        window.location = accessURL;
    },

    search(term) {
        const accessToken = Spotify.getAccessToken(term=term);
        const headers = {Authorization: `Bearer ${accessToken}`};
        const params = new URLSearchParams({
            type: 'track',
            q: term
        });
        return fetch('https://api.spotify.com/v1/search?' + params, {
            headers: headers
        }).then(response =>
            response.json()
        ).then(jsonResponse => {
            return !jsonResponse.tracks ? [] : 
            jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }))
        })
    },

    savePlayList(name, trackURIs) {
        if (!name || !trackURIs.length) {
            return Promise.resolve();
        }
        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`}
        let userID;
        return fetch('https://api.spotify.com/v1/me',{
            headers: headers
        }).then(
            response => response.json()
        ).then(jsonResponse => {
            userID = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: name})
            }).then(
                response => response.json()
            ).then(jsonResponse => {
                const playlistID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackURIs})
                })
            })
        })
    }
}

export default Spotify;
