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


## Examples

### RequestLoan

```js
const providerEngine: Provider = await getProviderEngine();
const params: ApiConstructorParams = {
    provider: providerEngine,
    diasporeRegistryAddress: '0xbfdb9397842776dbf3c0e3160e941d1542ab0365',
};
const diasporeApi = new DiasporeAPI(params)

const amount: BigNumber = new BigNumber(140);
const salt: BigNumber = new BigNumber(1);
const expiration: BigNumber = new BigNumber(Math.floor(new Date().getTime() + 86400 * 365));
const borrower: string = await diasporeApi.getAccount();
const cuota: BigNumber = new BigNumber(140);
const interestRate: BigNumber = new BigNumber(toInterestRate(240));
const installments: BigNumber = new BigNumber(10);
const duration: BigNumber = new BigNumber(86400 * 30 * 10);
const timeUnit: number | BigNumber = new BigNumber(86400 * 30); // secInDay * secInMonth

const callback = (err: any, log: any) => {
  if (err) {
      console.log(err)
  } else {
      console.log("subscription response: ", log)
  }
}
const requestParam = { amount, borrower, salt, expiration, cuota, interestRate, installments, duration, timeUnit, callback }
const idSubscription: string = await diasporeApi.requestLoan(requestParam);

```