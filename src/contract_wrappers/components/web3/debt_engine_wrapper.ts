import {
  DebtEngineEventArgs,
  DebtEngineEvents,
  DebtEnginePaidEventArgs,
  DebtEngineWithdrawnEventArgs
} from '@jpgonzalezra/abi-wrappers';
import { DebtEngine } from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractAbi, LogWithDecodedArgs } from 'ethereum-types';
import { schemas } from '@0x/json-schemas';
import ContractWrapper from './../../contract_wrapper';
import assert from '../../../utils/assert';
import { BigNumber } from '@0x/utils';


import {
  TxParams,
  GetLogsAsyncParams,
  SubscribeAsyncParams,
  EventCallback,
  Subscribe,
  GetLogs,
} from '../../../types';
import { DebtEngineContract } from '@jpgonzalezra/abi-wrappers';
import DebtEngineClient from '../common/debt_engine_model_client';

interface DebtEngineWithdrawSubscribeAsyncParams extends SubscribeAsyncParams {
  eventName: DebtEngineEvents.Withdrawn;
  callback: EventCallback<DebtEngineWithdrawnEventArgs>;
}

interface DebtEnginePaidSubscribeAsyncParams extends SubscribeAsyncParams {
  eventName: DebtEngineEvents.Paid;
  callback: EventCallback<DebtEnginePaidEventArgs>;
}

interface DebtEngineSubscribeAsyncParams extends Subscribe {
  (params: DebtEnginePaidSubscribeAsyncParams): Promise<string>;
  (params: DebtEngineWithdrawSubscribeAsyncParams): Promise<string>;
}

interface DebtEngineLogsAsyncParams extends GetLogs {
}


/**
 * This class includes the functionality related to interacting with the DebtEngine contract.
 */
export default class DebtEngineWrapper extends ContractWrapper {
  public abi: ContractAbi = DebtEngine.abi;

  private static PATH: string = ''; 
  protected contract: Promise<DebtEngineContract>;
  protected client: DebtEngineClient;

  /**
   * Instantiate DebtEngineWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(web3Wrapper: Web3Wrapper, contract: Promise<DebtEngineContract>) {
    super(web3Wrapper, contract);
    this.contract = contract;
    this.client = new DebtEngineClient()
  }

  public pay = async (id: string, origin: string, oracleData: string) => {
    const amount = await this.client.getAmountToPay(id);
    console.log(amount)
    return (await this.contract).pay.sendTransactionAsync(id, amount, origin, oracleData)
  }

  public payToken = async (id: string, origin: string, oracleData: string) => {
    //TODO:
  }

  public withdraw = async (id: string, to: string) => {
    return (await this.contract).withdraw.sendTransactionAsync(id, to);
  }

  public withdrawPartial = async (id: string, to: string, amount: BigNumber) => {
    return (await this.contract).withdrawPartial.sendTransactionAsync(id, to, amount);
  }
  
  public withdrawBatch = async (ids: string[], to: string) => {
    return (await this.contract).withdrawBatch.sendTransactionAsync(ids, to);
  }
  
  /**
   * Subscribe to an event type emitted by the contract.
   * @return Subscription token used later to unsubscribe
   */
  public subscribeAsync: DebtEngineSubscribeAsyncParams = async <ArgsType extends DebtEngineEventArgs>(
    params: SubscribeAsyncParams,
  ): Promise<string> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, DebtEngineEvents);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    assert.isFunction('callback', params.callback);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const subscriptionToken = this.subscribeInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.indexFilterValues,
      DebtEngine.abi,
      params.callback,
      params.isVerbose,
    );
    return subscriptionToken;
  };

  /**
   * Gets historical logs without creating a subscription
   * @return Array of logs that match the parameters
   */
  public getLogsAsync: DebtEngineLogsAsyncParams = async <ArgsType extends DebtEngineEventArgs>(
    params: GetLogsAsyncParams,
  ): Promise<LogWithDecodedArgs<ArgsType>[]> => {
    assert.doesBelongToStringEnum('eventName', params.eventName, DebtEngineEvents);
    assert.doesConformToSchema('blockRange', params.blockRange, schemas.blockRangeSchema);
    assert.doesConformToSchema('indexFilterValues', params.indexFilterValues, schemas.indexFilterValuesSchema);
    const normalizedContractAddress = (await this.contract).address.toLowerCase();
    const logs = await this.getLogsAsyncInternal<ArgsType>(
      normalizedContractAddress,
      params.eventName,
      params.blockRange,
      params.indexFilterValues,
      DebtEngine.abi,
    );
    return logs;
  };

}