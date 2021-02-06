import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AuthenticationService } from '@app/core';
// Apollo
import { Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const uri = 'http://localhost:4000/graphql';

@NgModule({
    exports: [HttpClientModule, HttpLinkModule],
})
export class GraphQLModule {
    constructor (
        private apollo: Apollo,
        private httpLink: HttpLink,
        private auth$: AuthenticationService,
    ) {
        const http = this.httpLink.create({ uri });

        // Create a WebSocket link:
        const wsLink = new WebSocketLink({
            uri: `ws://localhost:4000/graphql`,
            options: {
                reconnect: true
            }
        });

        const terminatingLink = split(
            ({ query }) => {
                const def = getMainDefinition(query);
                return def.kind === 'OperationDefinition' && def.operation === 'subscription';
            },
            wsLink,
            http
        );

        const authLink = new ApolloLink((operation, forward) => {
            const vm = this;
            operation.setContext(({ headers = {}, localToken = vm.auth$.getToken() }: any) => {
                if (localToken) {
                    // headers['x-token'] = localToken;
                    headers['authorization'] = `Bearer ${localToken}`;
                }

                return {
                    headers
                };
            });

            return forward(operation);
        });

        const errorLink = onError(({ graphQLErrors, networkError }) => {
            console.log('graphQLErrors: ', graphQLErrors);
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, locations, path }) => {
                    console.log(`GRAPHQL ERROR: ${message}`);
                    const messageError: any | string = message;
                    const error = messageError.error;
                    if (
                        message === 'NOT_AUTHENTICATED' ||
                        message === 'Token error: invalid signature' ||
                        message === 'Token error: jwt expired' ||
                        error === 'Forbidden'
                    ) {
                        // this.auth$.logout();
                        this.auth$.redirectLogoutOnSessionExpired();
                    }
                });
            }

            console.log('networkError: ', networkError);
            if (networkError) {
                if (networkError['statusCode'] === 401) {
                    this.auth$.logout();
                    this.auth$.redirectLogoutOnSessionExpired();
                }

                networkError['error'].errors.forEach((err: any) => {
                    if (err.message === 'Context creation failed: Your session expired. Sign in again.') {
                        this.auth$.logout();
                        this.auth$.redirectLogoutOnSessionExpired();
                    }
                });
            }
        });

        const link = ApolloLink.from([authLink, errorLink, terminatingLink]);

        const cache = new InMemoryCache();

        const options: any = {
            link,
            cache,
        };

        // Create Apollo client
        this.apollo.create(options);
    }
}
