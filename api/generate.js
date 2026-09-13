const {jsonHandler,failure} = require('./_store');
const {generateText} = require('./_text');
module.exports = jsonHandler(async (body,res) => {
  if (typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 160000) throw failure('Prompt inválido.',400);
  // One bounded call, including token acquisition and response decoding.
  // Long episodes use studio-job so retries never regenerate the whole story.
  const out = await generateText(body.prompt,{blocks:!body.sinBloques});
  return res.json({success:true,...out});
});
