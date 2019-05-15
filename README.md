## @ripio/diaspore-contract-wrappers

Smart TS wrappers for RCN diaspore smart contracts.

## Installation

**Install**

```bash
npm install @ripio/diaspore-contract-wrappers --save
```

**Import**

```javascript
import { DiasporeAPI } from '@ripio/rcn-diaspore-sdk';
```

If your project is in [TypeScript](https://www.typescriptlang.org/), add the following to your `tsconfig.json`:

```json
"compilerOptions": {
    "typeRoots": ["node_modules/@0x/typescript-typings/types", "node_modules/@types"],
}
```

## Sandbox

We provide a sandbox dev server to manually play with the package in the browser

To boot it up:

```
yarn start
```

This will generate a git-ignored sandbox.ts file you can edit locally
to start playing around with the code

## Contributing

We strongly recommend that the community help us make improvements and determine the future direction of the protocol. To report bugs within this package, please create an issue in this repository.

### Install dependencies

If you don't have yarn workspaces enabled (Yarn < v1.0) - enable them:

```bash
yarn config set workspaces-experimental true
```

Then install dependencies

```bash
yarn install
```

### Build

To build this package and all other monorepo packages that it depends on, run the following from the monorepo root directory:

```bash
yarn build
```

or continuously rebuild on change:

```bash
yarn watch
```

### Clean

```bash
yarn clean
```

### Lint

```bash
yarn lint
```

### Testing

This project uses Jest to do unit testing on the contract wrappers.

```bash
yarn jest
```

## Deployment

** Pending, should run a prepublish script on CI or use Semantic Releases**


## Example (metamask provider)

```js
import { Provider } from 'ethereum-types';
import { RPCSubprovider, Web3ProviderEngine, MetamaskSubprovider, RedundantSubprovider } from '@0x/subproviders';
import { ApiConstructorParams, GetBalanceParams } from './src/diaspore_api';
import { DiasporeAPI } from './src';

window.addEventListener('load', async () => {
    console.log("START")

    const providerEngine: Provider = await getProviderEngine();
    const params: ApiConstructorParams = {
        provider: providerEngine,
        diasporeRegistryAddress: '0xbfdb9397842776dbf3c0e3160e941d1542ab0365',
    };
    const diasporeApi = new DiasporeAPI(params)

    const balance = await diasporeApi.getBalance({});
    console.log(balance);
    
    console.log("END")
});

async function getProviderEngine(): Promise<Web3ProviderEngine> {
    const providerEngine = new Web3ProviderEngine();
    const injectedProviderIfExists = await getInjectedProviderIfExists();
    let networkId = 3;
    if (injectedProviderIfExists !== undefined) {
      try {
        providerEngine.addProvider(new MetamaskSubprovider(injectedProviderIfExists));
        networkId = Number((injectedProviderIfExists as any).networkVersion);
      } catch (err) {
        // Ignore error and proceed with networkId undefined
      }
    }
    interface IPublicNodeUrlsByNetworkId {
      [networkId: number]: string[];
    }
    const INFURA_API_KEY = 'df26f7df62b843c0a2b4e1f10e5d5b83';
    const configs = {
      PUBLIC_NODE_URLS_BY_NETWORK_ID: {
        1: [`https://mainnet.infura.io/${INFURA_API_KEY}`],
        3: [`https://ropsten.infura.io/${INFURA_API_KEY}`],
        15: ['http://127.0.0.1:8545'],
      } as IPublicNodeUrlsByNetworkId,
    };
    const publicNodeUrlsIfExistsForNetworkId = configs.PUBLIC_NODE_URLS_BY_NETWORK_ID[networkId];
    const rpcSubproviders = publicNodeUrlsIfExistsForNetworkId.map(publicNodeUrl => {
      return new RPCSubprovider(publicNodeUrl);
    });
    providerEngine.addProvider(new RedundantSubprovider(rpcSubproviders));
    providerEngine.start();
    return providerEngine;
  }

  async function getInjectedProviderIfExists(): Promise<Provider | undefined> {
    let injectedProviderIfExists = (window as any).ethereum;
    if (injectedProviderIfExists !== undefined) {
      if (injectedProviderIfExists.enable !== undefined) {
        try {
          await injectedProviderIfExists.enable();
        } catch (err) {
          return undefined;
        }
      }
    } else {
      const injectedWeb3IfExists = (window as any).web3;
      if (injectedWeb3IfExists !== undefined && injectedWeb3IfExists.currentProvider !== undefined) {
        injectedProviderIfExists = injectedWeb3IfExists.currentProvider;
      } else {
        return undefined;
      }
    }
    return injectedProviderIfExists;
  }
  ```