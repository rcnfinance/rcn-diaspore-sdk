import { RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { Provider, Wallet, DefaultConf } from 'marmojs';
import { BigNumber } from '@0x/utils';
import * as crypto from 'crypto';
import { E2E_CONF } from '../conf';
import { DiasporeFactory } from '../../src/diaspore_factory';


test("Request a loan using Marmo", async () => {
    // Create Web3 Provider
    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new RPCSubprovider(E2E_CONF.node));
    providerEngine.start();

    // Instanciate MarmoJS
    DefaultConf.ROPSTEN.asDefault();

    // Create pk
    const privateKey = `0x${crypto.randomBytes(32).toString("hex")}`;
    const wallet = new Wallet(privateKey);
    const diaspore = DiasporeFactory.getMarmoDiasporeAPI(
        E2E_CONF.directory,
        providerEngine,
        new Provider(E2E_CONF.node, E2E_CONF.marmo.relayer),
        wallet
    );

    const receipt: string = await diaspore.request({
        amount: new BigNumber("1"),
        borrower: wallet.address,
        salt: new BigNumber("0"),
        expiration: new BigNumber("900000000"),
        cuota: new BigNumber("12"),
        interestRate: new BigNumber("90"),
        installments: new BigNumber("90"),
        duration: new BigNumber("86400"),
        timeUnit: 1
    });

    expect(receipt).not.toBe("");
});
