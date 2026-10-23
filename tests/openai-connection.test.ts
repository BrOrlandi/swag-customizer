import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveConnection } from '../server/utils/openai-connection'
const defaults = { chatModel:'gpt-4o', imageModel:'gpt-image-1.5', routerChatModel:'cx/gpt-6.1-sol', routerBaseURL:'https://gateway.example.com/v1' }
test('provider routing keeps credentials on fixed server-side endpoints and preserves provider model IDs', () => {
  assert.equal(resolveConnection({},defaults).baseURL,'https://api.openai.com/v1')
  const router = resolveConnection({ provider:'9router',chatModel:'ag/gemini-3-flash' },defaults)
  assert.equal(router.baseURL,'https://gateway.example.com/v1')
  assert.equal(router.chatModel,'ag/gemini-3-flash')
  assert.equal(resolveConnection({provider:'9router'},defaults).chatModel,'cx/gpt-6.1-sol')
  assert.throws(() => resolveConnection({provider:'9router'},{...defaults,routerBaseURL:''}),{statusCode:400})
  assert.throws(() => resolveConnection({provider:'http://127.0.0.1'},defaults),{statusCode:400})
  assert.throws(() => resolveConnection({chatModel:'model\r\nmalicious'},defaults),{statusCode:400})
})
