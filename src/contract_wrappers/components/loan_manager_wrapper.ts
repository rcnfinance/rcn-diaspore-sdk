import {
  LoanManagerEventArgs,
  LoanManagerEvents
} from '@jpgonzalezra/abi-wrappers';
import { LoanManager } from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractAbi, LogWithDecodedArgs } from 'ethereum-types';
import { schemas } from '@0x/json-schemas';
import ContractWrapper from '../contract_wrapper';
import assert from '../../utils/assert';
import {
  TxParams,
  GetLogsAsyncParams,
  SubscribeAsyncParams,
  EventCallback,
  Subscribe,
  GetLogs,
} from '../../types';
import { LoanManagerContract } from '@jpgonzalezra/abi-wrappers';

interface LoanManagerSubscribeAsyncParams extends Subscribe {
  // Subscriptors TODO:
}

interface LoanManagerLogsAsyncParams extends GetLogs {
  // logs TODO:
}


/**
 * This class includes the functionality related to interacting with the LoanManager contract.
 */
export default class LoanManagerWrapper extends ContractWrapper {
  public abi: ContractAbi = LoanManager.abi;

  protected contract: Promise<LoanManagerContract>;

  /**
   * Instantiate LoanManagerWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(web3Wrapper: Web3Wrapper, contract: Promise<LoanManagerContract>) {
    super(web3Wrapper, contract);
    this.contract = contract;
  }

  /**
   * Subscribe to an event type emitted by the contract.
   * @return Subscription token used later to unsubscribe
   */
  public subscribeAsync: LoanManagerSubscribeAsyncParams = async <ArgsType extends LoanManagerEventArgs>(
    params: SubscribeAsyncParams,
  ): Promise<string> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, LoanManagerEvents);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    assert.isFunction('callback', params.callback);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const subscriptionToken = this.subscribeInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.indexFilterValues,
      LoanManager.abi,
      params.callback,
      params.isVerbose,
    );
    return subscriptionToken;
  };

  /**
   * Gets historical logs without creating a subscription
   * @return Array of logs that match the parameters
   */
  public getLogsAsync: LoanManagerLogsAsyncParams = async <ArgsType extends LoanManagerEventArgs>(
    params: GetLogsAsyncParams,
  ): Promise<LogWithDecodedArgs<ArgsType>[]> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, LoanManagerEvents);
    assert.doesConformToSchema('blockRange', params.blockRange, schemas.blockRangeSchema);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const logs = await this.getLogsAsyncInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.blockRange,
      params.indexFilterValues,
      LoanManager.abi,
    );
    return logs;
  };

  /**
   * business logic
   */
  //TODO:

}