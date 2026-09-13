// Compatibility endpoint for one short segment. Whole narrations use studio-job.
const {jsonHandler} = require('./_store');
const {generateAudioChunk} = require('./_voice');
module.exports = jsonHandler(async (b,res)=>res.json({success:true,...await generateAudioChunk(String(b.text || ''),b.engine || 'gemini',b.voice || {},b.lang)}));
