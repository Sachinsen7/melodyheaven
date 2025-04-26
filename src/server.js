import dotenv from "dotenv";
import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
];

dotenv.config();
let currentAccessToken = null;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:3000/callback",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.use(express.static(join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public", "index.html"));
});

app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.log("Callback error:", error);
    res.send(`Callback error ${error}`);
  }

  console.log("authorization code:", code);

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expire_in = data.body["expires_in"];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      currentAccessToken = access_token;

      console.log("access_token", access_token);
      console.log("refresh_token", refresh_token);
      console.log(
        `Successfully got the accesss token expires in : ${expire_in}`
      );

      res.send("Connected!, Now You can Close the Window");

      setInterval(async (req, res) => {
        try {
          const data = await spotifyApi.refreshAccessToken();
          currentAccessToken = data.body["access_token"];
          console.log(
            "The access token has been refreshed",
            currentAccessToken
          );

          spotifyApi.setAccessToken(currentAccessToken);
        } catch (error) {
          console.log("Token refresh failed:", error);
        }
      }, (expire_in / 2) * 1000);
    })
    .catch((error) => {
      console.log("error getting token:", error);
      res.send(`Error Getting token: `, error);
    });
});

app.get("/get-token", (req, res) => {
  console.log("current token", currentAccessToken);
  if (currentAccessToken) {
    res.json({ access_token: currentAccessToken });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.listen(3000, () => {
  console.log("Server is listening at port: http://localhost:3000");
});
