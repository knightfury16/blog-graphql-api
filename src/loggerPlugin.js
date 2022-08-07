export const myPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    console.log('Requested query: ', requestContext.request.operationName);
    console.log('Variables: ', requestContext.request.variables);
  }
};
