
import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { E2E_CONF } from '../conf';
import { DiasporeFactory } from '../../src/diaspore_factory';
import { Provider, Wallet, DefaultConf } from 'marmojs';
const crypto = require('crypto')

test("Request a loan using Marmo", async () => {
    // Create Web3 Provider
    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new RPCSubprovider(E2E_CONF.node));
    providerEngine.start();

    // Instanciate MarmoJS
    DefaultConf.ROPSTEN.asDefault();

    // Create pk
    const privateKey = crypto.randomBytes(64).toString('hex');
    const diaspore = DiasporeFactory.getMarmoDiasporeAPI(
        E2E_CONF.directory,
        providerEngine,
        new Provider(E2E_CONF.node, E2E_CONF.marmo.relayer),
        new Wallet(privateKey)
    );

    console.log(new Wallet(privateKey).address);
});
