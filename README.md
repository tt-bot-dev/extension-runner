<!--
Copyright (C) 2021 tt.bot dev team
 
This file is part of tt.bot's extension runner.
 
tt.bot's extension runner is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
 
tt.bot's extension runner is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
 
You should have received a copy of the GNU Affero General Public License
along with tt.bot's extension runner.  If not, see <http://www.gnu.org/licenses/>.
-->
# @tt-bot-dev/extension-runner (tt.bot's extension runner)
[![Discord][discord shield]][discord invite] [![Add me!][tt.bot add shield]][tt.bot invite]
[![Build Status][gh shield]][gh]

@tt-bot-dev/extension-runner is the heart of tt.bot's extensions powered using `isolate-vm`.

## What are extensions and what do they do?
Extensions (obviously) extend the base tt.bot with community-made features. While the current extension system provides tools to make non-standard commands, it can be easily wrapped for other activities. For security reasons, the untrusted user code runs in a separate thread using a separate JavaScript environment (using `isolated-vm`) and the public API wraps the underlying [Eris](https://github.com/abalabahaha/eris) objects in the main JavaScript thread.

[discord shield]: https://discordapp.com/api/guilds/195865382039453697/widget.png?style=shield
[discord invite]: https://discord.gg/pGN5dMq
[tt.bot add shield]: https://img.shields.io/badge/tt.bot-add%20to%20your%20server-008800.svg
[tt.bot invite]: https://discordapp.com/oauth2/authorize?scope=bot&client_id=195506253806436353
[gh shield]: https://github.com/tt-bot-dev/extension-runner/workflows/lint/badge.svg
[gh]: https://github.com/tt-bot-dev/extension-runner
