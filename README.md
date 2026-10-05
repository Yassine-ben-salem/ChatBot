# WonderWorld ChatBot

A full-stack AI assistant that answers guest questions about a fictional theme
park, **WonderWorld**. Visitors ask about ticket prices, opening hours, and
attractions in natural language, and the bot answers from a curated knowledge
base instead of inventing details.

## Architecture

A Bun workspaces monorepo. The root `index.ts` boots both packages together
via `concurrently`.

```
ai-app/
├── index.ts                 # runs server + client concurrently
├── packages/
│   ├── server/               # Express 5 API (port 3000)
│   │   ├── routes.ts                # route table
│   │   ├── controllers/             # request validation + HTTP concerns
│   │   ├── services/chat.service.ts # prompt assembly + LLM orchestration
│   │   ├── repositories/            # conversation storage
│   │   ├── llm/client.ts            # OpenAI SDK -> OpenRouter
│   │   ├── middleware/              # session cookie, rate limiting
│   │   └── prompts/                 # system template + knowledge base
│   └── client/                # React 19 + Vite SPA (port 5173)
│       └── src/components/chat/      # ChatBot, ChatMessages, ChatInput, TypingIndicator
```

## Tech stack

**Runtime & language:** Bun · TypeScript 6 (strict)
**Backend:** Express 5 · Zod · express-rate-limit · OpenAI SDK (pointed at OpenRouter)
**Frontend:** React 19 · Vite 8 · Tailwind CSS 4 · shadcn/ui · react-hook-form · react-markdown
**Tooling:** concurrently · Husky · lint-staged · Prettier

## How the assistant is grounded

`prompts/chatBot.txt` is a template containing a `{{parkInfo}}` placeholder.
At startup, the server reads `prompts/WonderWorld.md` and substitutes it in,
producing a system prompt that casts the model as a WonderWorld support
agent, restricts it to park-related questions, and instructs it not to
fabricate information.

To retarget the bot at a different domain, replace those two files — no code
changes required.

## Getting started

Requires [Bun](https://bun.com).

```bash
bun install
```

Create `packages/server/.env`:

```
OPENAI_API_KEY=<your OpenRouter key>
CLIENT_ORIGIN=http://localhost:5173
```

Then start both packages:

```bash
bun run dev      # server on :3000, client on :5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to
`http://localhost:3000`, so the client only ever makes same-origin requests.

## Scripts

| Command             | Description                                  |
| -------------------- | --------------------------------------------- |
| `bun run dev`         | Run server and client concurrently            |
| `bun run build`       | Type-check and build the client for production |
| `bun run start`       | Start the API in production mode              |
| `bun run test`        | Run the server test suite                     |
| `bun run typecheck`   | Type-check both packages                      |


## Testing

Tests use Bun's built-in runner:

```bash
bun test
```
## Project status

Active development.
