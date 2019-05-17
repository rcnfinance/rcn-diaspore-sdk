import {
  InstallmentsModelEventArgs,
  InstallmentsModelEvents
} from '@jpgonzalezra/abi-wrappers';
import { InstallmentsModel } from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractAbi, LogWithDecodedArgs } from 'ethereum-types';
import { schemas } from '@0x/json-schemas';
import ContractWrapper from '../contract_wrapper';
import assert from '../../utils/assert';
import { BigNumber } from '@0x/utils';

import {
  TxParams,
  GetLogsAsyncParams,
  SubscribeAsyncParams,
  EventCallback,
  Subscribe,
  GetLogs,
} from '../../types';
import { InstallmentsModelContract } from '@jpgonzalezra/abi-wrappers';

interface InstallmentsModelSubscribeAsyncParams extends Subscribe {
  // Subscriptors TODO:
}

interface InstallmentsModelLogsAsyncParams extends GetLogs {
  // logs TODO:
}


/**
 * This class includes the functionality related to interacting with the InstallmentsModel contract.
 */
export default class InstallmentsModelWrapper extends ContractWrapper {
  public abi: ContractAbi = InstallmentsModel.abi;

  protected contract: Promise<InstallmentsModelContract>;

  /**
   * Instantiate InstallmentsModelWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(web3Wrapper: Web3Wrapper, contract: Promise<InstallmentsModelContract>) {
    super(web3Wrapper, contract);
    this.contract = contract;
  }

  public encodeData = async (cuota: BigNumber, interestRate: BigNumber, installments: BigNumber, duration: BigNumber, timeUnit: number | BigNumber) => {
    return (await this.contract).encodeData.callAsync(cuota, interestRate, installments, duration, timeUnit);
  };

  public create = async (id: string, data: string) => {
    return (await this.contract).create.sendTransactionAsync(id, data)
  }

  public isValid = async (data: string) => {
    return (await this.contract).validate.callAsync(data);
  } 

  /**
   * Subscribe to an event type emitted by the contract.
   * @return Subscription token used later to unsubscribe
   */
  public subscribeAsync: InstallmentsModelSubscribeAsyncParams = async <ArgsType extends InstallmentsModelEventArgs>(
    params: SubscribeAsyncParams,
  ): Promise<string> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, InstallmentsModelEvents);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    assert.isFunction('callback', params.callback);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const subscriptionToken = this.subscribeInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.indexFilterValues,
      InstallmentsModel.abi,
      params.callback,
      params.isVerbose,
    );
    return subscriptionToken;
  };

  /**
   * Gets historical logs without creating a subscription
   * @return Array of logs that match the parameters
   */
  public getLogsAsync: InstallmentsModelLogsAsyncParams = async <ArgsType extends InstallmentsModelEventArgs>(
    params: GetLogsAsyncParams,
  ): Promise<LogWithDecodedArgs<ArgsType>[]> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, InstallmentsModelEvents);
    assert.doesConformToSchema('blockRange', params.blockRange, schemas.blockRangeSchema);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const logs = await this.getLogsAsyncInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.blockRange,
      params.indexFilterValues,
      InstallmentsModel.abi,
    );
    return logs;
  };

}