/**
 * @param {string} jsonPrefix
 * @returns {import('../index.js').Plugin}
 */
export function jsonPrefixPlugin(jsonPrefix) {
  let responseType;
  return {
    name: "jsonPrefix",
    beforeFetch: ({ responseType: type }) => {
      responseType = type;
    },
    afterFetch: async ({ response }) => {
      if (jsonPrefix && responseType === "json") {
        let responseAsText = await response.text();

        if (responseAsText.startsWith(jsonPrefix)) {
          responseAsText = responseAsText.substring(jsonPrefix.length);
        }

        return new Response(responseAsText, response);
      }
      return response;
    },
  };
}

export const jsonPrefix = jsonPrefixPlugin(`)]}',\n`);
