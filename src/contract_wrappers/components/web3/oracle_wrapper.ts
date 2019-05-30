import {
  OracleEventArgs,
  OracleEvents
} from '@jpgonzalezra/abi-wrappers';
import { Oracle } from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractAbi, LogWithDecodedArgs } from 'ethereum-types';
import { schemas } from '@0x/json-schemas';
import ContractWrapper from './../../contract_wrapper';
import assert from '../../../utils/assert';
import { BigNumber } from '@0x/utils';
import axios, { AxiosResponse } from 'axios';
import * as ethUtil from 'ethereumjs-util';


import {
  TxParams,
  GetLogsAsyncParams,
  SubscribeAsyncParams,
  EventCallback,
  Subscribe,
  GetLogs,
} from '../../../types';
import { OracleContract } from '@jpgonzalezra/abi-wrappers';

interface OracleSubscribeAsyncParams extends Subscribe {
  // Subscriptors TODO:
}

interface OracleLogsAsyncParams extends GetLogs {
  // logs TODO:
}


/**
 * This class includes the functionality related to interacting with the Oracle contract.
 */
export default class OracleWrapper extends ContractWrapper {
  public abi: ContractAbi = Oracle.abi;

  private static PATH: string = 'https://oracle.ripio.com/rate/'; 
  protected contract: Promise<OracleContract>;

  /**
   * Instantiate OracleWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(web3Wrapper: Web3Wrapper, contract: Promise<OracleContract>) {
    super(web3Wrapper, contract);
    this.contract = contract;
  }

  public async getOracleData(currency: string): Promise<string> {
    
    const currencyHex: string = ethUtil.bufferToHex(new Buffer(ethUtil.setLengthRight(currency, 32)));
    return axios.get(OracleWrapper.PATH).then(response => {
        let data = '0x'; 
        response.data.forEach(function(item: any) {
          if (item.currency === currencyHex) {
            data = item.data;
          }
        })
        return data;
    })

  }

  /**
   * Subscribe to an event type emitted by the contract.
   * @return Subscription token used later to unsubscribe
   */
  public subscribeAsync: OracleSubscribeAsyncParams = async <ArgsType extends OracleEventArgs>(
    params: SubscribeAsyncParams,
  ): Promise<string> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, OracleEvents);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    assert.isFunction('callback', params.callback);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const subscriptionToken = this.subscribeInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.indexFilterValues,
      Oracle.abi,
      params.callback,
      params.isVerbose,
    );
    return subscriptionToken;
  };

  /**
   * Gets historical logs without creating a subscription
   * @return Array of logs that match the parameters
   */
  public getLogsAsync: OracleLogsAsyncParams = async <ArgsType extends OracleEventArgs>(
    params: GetLogsAsyncParams,
  ): Promise<LogWithDecodedArgs<ArgsType>[]> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, OracleEvents);
    assert.doesConformToSchema('blockRange', params.blockRange, schemas.blockRangeSchema);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const logs = await this.getLogsAsyncInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.blockRange,
      params.indexFilterValues,
      Oracle.abi,
    );
    return logs;
  };

}