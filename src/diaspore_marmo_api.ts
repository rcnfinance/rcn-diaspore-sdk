import {
    RequestParams,
    LendParams,
    PayParams,
    WithdrawParams,
    WithdrawPartialParams,
    ApproveRequestParams,
    DiasporeWeb3CostructorParams
} from './diaspore_api'

import { Wallet, Provider } from 'marmojs';
import assert from './utils/assert';
import { DiasporeAbstractAPI } from './diaspore_abstract_api';

/**
 * @param provider The Marmo3 provider
 * @param wallet The wallet for sign
 */
export interface DiasporeMarmoCostructorParams extends DiasporeWeb3CostructorParams {
    subProvider: Provider;
    wallet: Wallet;
}

export class DiasporeMarmoAPI extends DiasporeAbstractAPI {

   /**
     * Instantiates a new DiasporeMarmoAPI instance.
     * @return  An instance of the DiasporeMarmoCostructorParams class.
     */
    public constructor(params: DiasporeMarmoCostructorParams) {
        super(params)
        if (params.diasporeRegistryAddress !== undefined) {
            assert.isETHAddressHex('diasporeRegistryAddress', params.diasporeRegistryAddress);
        }

    }

    public request = async (params: RequestParams): Promise<string> => {
        //TODO: implement
    }

    public lend = async (params: LendParams) => {
        //TODO: implement
    }

    public pay = async (params: PayParams) => {
        //TODO: implement
    }

    public payToken = async (params: PayParams) => {
        //TODO: implement
    }

    public withdraw = async (params: WithdrawParams) => {
        //TODO: implement
    }

    public withdrawPartial = async (params: WithdrawPartialParams) => {
        //TODO: implement
    }

    public approveRequest = async (params: ApproveRequestParams) => {
        //TODO: implement
    }

}
