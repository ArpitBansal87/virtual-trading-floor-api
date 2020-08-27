const url = require('url');

async function streamToObject (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}

async function getParams(req) {
  const queryObject = url.parse(req.url, true).query;

  return queryObject;
}

module.exports = {getRequestBody: streamToObject, getParams};