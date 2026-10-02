set dotenv-load := true
set shell := ["bash", "-c"]

project_root := justfile_directory()
app := project_root + "/apps/whos-jev"

# Live through TypeSafe when TYPESAFE_API_KEY is set (copy .env.example to .env).
# JEV_BACKEND=mock forces the offline deterministic mock.

# Build the Vue app, then serve the lab on port 4399. Kills any listener already on the port, opens the browser.
web:
    cd "{{app}}/web" && npm run build
    lsof -tiTCP:4399 -sTCP:LISTEN | xargs -r kill
    (sleep 1 && explorer.exe http://127.0.0.1:4399) &
    cd "{{app}}" && npm run -s web
