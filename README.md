# discord-badge-scraper
a discord selfbot that automatically scans servers and finds users with rare badges. when the account joins a server (or you trigger a manual check), it fetches all members, checks their profile badges via the discord api, and sends results to a webhook in your target server.

## what it does

- detects rare badges: diamond emerald ruby opal nitro badge
- fetches full profile data (nitro tenure, boost level, quest, orbs, etc.) for users with rare badges
- creates a channel per scanned server and posts results via webhook
- supports manual checks with `.check <server_id>`
- allows multiple owners to use commands

## setup

1. clone the repo
```
git clone https://github.com/y4gz/discord-badge-scraper.git
cd discord-badge-scraper
```

2. install dependencies
```
npm install
```

3. edit `config.toml` and fill in your values
```toml
token = "your_token_here"
target_server = "server_id_where_results_go"
target_category = "category_id_for_channels"
command_channel = "channel_id_for_commands"
prefix = "."
owners = ["user_id_1", "user_id_2"]
```

4. run it
```
node index.js
```

## commands

| command | description |
|---|---|
| `.check <server_id>` | manually scan a server the account is in |

## how it works

1. account joins a server (or you use `.check`)
2. fetches up to 10k members via gateway
3. checks `public_flags` bitfield for rare badges
4. fetches full profile via `/users/{id}/profile` for rare users only
5. creates a text channel in your target server under the configured category
6. sends results via webhook with badge emojis

## config

| key | description |
|---|---|
| `token` | your discord account token |
| `target_server` | server id where result channels are created |
| `target_category` | category id for the result channels |
| `command_channel` | channel id where `.check` commands are sent |
| `prefix` | command prefix (default `.`) |
| `owners` | array of user ids allowed to use commands |

## note

this is a selfbot and uses a user token. this is against discord's terms of service. use at your own risk.
cr @ege0x77czz
