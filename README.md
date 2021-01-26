# BotMadeHere

## Current Features

- Send private notification to all subscribed users when a youtube video drops
- Send private notification to all subscribed users when a patreon is posted
- Subscribe to above lists
- A help window for above commands
- Cooldown to prevent Bot spam
- Grizzly

## A config file also needs to be included

The file must be named `config.json` and included in the same directory as the index.ts file

```json
{
    "prefix": "!",
    "name": "Bot Made Here",
    "db_user": "",
    "db_pass": "",
    "db_name": "",
    "db_host": "",
    "cooldownTime": 2,
    "token": ""
}
```
