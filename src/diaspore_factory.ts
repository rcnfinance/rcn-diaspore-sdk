import { Provider } from 'ethereum-types';
import {
    Wallet,
    Provider as MarmoProvider
} from 'marmojs';
import { BigNumber } from '@0x/utils';
import { DiasporeWeb3API } from './diaspore_web3_api';
import { DiasporeMarmoAPI, DiasporeMarmoCostructorParams } from './diaspore_marmo_api';
import { DiasporeWeb3ConstructorParams } from './diaspore_api';


export class DiasporeFactory {

    public static getWeb3DiasporeAPI(
        diasporeRegistryAddress: string,
        provider: Provider,
        defaultGasPrice?: BigNumber): DiasporeWeb3API {

        const params: DiasporeWeb3ConstructorParams = {
            provider: provider,
            diasporeRegistryAddress: diasporeRegistryAddress,
            defaultGasPrice: defaultGasPrice
        }

        return new DiasporeWeb3API(params);

    }

    public static getMarmoDiasporeAPI(
        mainProvider: Provider,
        diasporeRegistryAddress: string,
        subProvider: MarmoProvider,
        wallet: Wallet,
        defaultGasPrice?: BigNumber): DiasporeMarmoAPI {

        const params: DiasporeMarmoCostructorParams = {
            provider: mainProvider,
            diasporeRegistryAddress: diasporeRegistryAddress,
            defaultGasPrice: defaultGasPrice,
            subProvider: subProvider,
            wallet: wallet
        }

        return new DiasporeMarmoAPI(params);

    }
}