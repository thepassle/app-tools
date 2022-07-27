/**
 * @param {string} jsonPrefix
 * @returns {import('../index').Plugin}
 */
export function jsonPrefixPlugin(jsonPrefix) {
  let responseType;
  return {
    beforeFetch: ({responseType: type}) => {
      responseType = type;
    },
    afterFetch: async (res) => {
      if(jsonPrefix && responseType === 'json') {
        let responseAsText = await res.text();
        
        if(responseAsText.startsWith(jsonPrefix)) {
          responseAsText = responseAsText.substring(jsonPrefix.length);
        }

        return new Response(responseAsText, res);
      }
      return res;
    }
  }
}

export const jsonPrefix = jsonPrefixPlugin(`)]}',\n`);