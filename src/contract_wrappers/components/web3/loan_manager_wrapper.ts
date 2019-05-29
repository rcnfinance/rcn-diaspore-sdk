import {
  LoanManagerEventArgs,
  LoanManagerEvents,
  LoanManagerRequestedEventArgs,
  LoanManagerApprovedEventArgs,
  LoanManagerCanceledEventArgs
} from '@jpgonzalezra/abi-wrappers';
import { LoanManager } from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractAbi, LogWithDecodedArgs } from 'ethereum-types';
import { schemas } from '@0x/json-schemas';
import ContractWrapper from '../../contract_wrapper';
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
import { LoanManagerContract } from '@jpgonzalezra/abi-wrappers';

interface RequestedSubscribeAsyncParams extends SubscribeAsyncParams {
  eventName: LoanManagerEvents.Requested;
  callback: EventCallback<LoanManagerRequestedEventArgs>;
}

interface ApprovedSubscribeAsyncParams extends SubscribeAsyncParams {
  eventName: LoanManagerEvents.Approved;
  callback: EventCallback<LoanManagerApprovedEventArgs>;
}

interface CanceledSubscribeAsyncParams extends SubscribeAsyncParams {
  eventName: LoanManagerEvents.Canceled;
  callback: EventCallback<LoanManagerCanceledEventArgs>;
}

interface LoanManagerSubscribeAsyncParams extends Subscribe {
  (params: RequestedSubscribeAsyncParams): Promise<string>;
  (params: ApprovedSubscribeAsyncParams): Promise<string>;
  (params: CanceledSubscribeAsyncParams): Promise<string>;
}

interface LoanManagerLogsAsyncParams extends GetLogs {
  // logs TODO:
}

interface RequestLoanParams {
  amount: BigNumber, 
  model:string, 
  oracle: string, 
  borrower:string, 
  salt: BigNumber, 
  expiration: BigNumber, 
  data: string
}

interface GetIdParams {
  amount: BigNumber, 
  borrower: string, 
  creator: string, 
  model: string, 
  oracle: string, 
  salt: BigNumber, 
  expiration: BigNumber, 
  data: string
}

interface LendRequestParams {
  id: string,
  oracleData: string, 
  cosigner: string,
  cosignerLimit: BigNumber, 
  cosignerData: string
}

interface RegistreApproveRequestParams {
  id: string,
  signature: string
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
   * Calls
   */
  public getBorrower = async (id: string) => {
    return (await this.contract).getBorrower1.callAsync(id);
  }

  public getCreator = async (id: string) => {
    return (await this.contract).getCreator1.callAsync(id);
  }
  public getOracle = async (id: string) => {
    return (await this.contract).getOracle1.callAsync(id);
  }
  
  public getCurrency = async (id: string) => {
    return (await this.contract).getCurrency1.callAsync(id);
  }
  
  public getAmount = async (id: string) => {
    return (await this.contract).getAmount1.callAsync(id);
  }
  
  public getExpirationRequest = async (id: string) => {
    return (await this.contract).getExpirationRequest1.callAsync(id);
  }
  public getApproved = async (id: string) => {
    return (await this.contract).getApproved1.callAsync(id);
  }
  
  public getDueTime = async (id: string) => {
    return (await this.contract).getDueTime1.callAsync(id);
  }
  
  public getClosingObligation = async (id: string) => {
    return (await this.contract).getClosingObligation1.callAsync(id);
  }
  
  public getLoanData = async (id: string) => {
    return (await this.contract).getLoanData1.callAsync(id);
  }

  public getStatus = async (id: string) => {
    return (await this.contract).getStatus1.callAsync(id);
  }
  
  public calcId = async (params: GetIdParams) => {
    return (await this.contract).calcId.callAsync(
      params.amount, 
      params.borrower, 
      params.creator, 
      params.model, 
      params.oracle, 
      params.salt, 
      params.expiration, 
      params.data
    );
  }

  public isCanceled = async (id: string) => {
    return (await this.contract).cancel.callAsync(id);
  }
  /**
   *  Send Transactions
   */

  public requestLoan = async (params: RequestLoanParams) => {
    
    return (await this.contract).requestLoan.sendTransactionAsync(
      params.amount, 
      params.model, 
      params.oracle, 
      params.borrower, 
      params.salt, 
      params.expiration, 
      params.data
    );
  };

  public approveRequest = async (id: string) => {
    return (await this.contract).approveRequest.sendTransactionAsync(id);
  }

  public registerApproveRequest = async (params: RegistreApproveRequestParams) => {
    return (await this.contract).registerApproveRequest.sendTransactionAsync(
      params.id, 
      params.signature
    );
  }

  public lend = async (params: LendRequestParams) => {
    return (await this.contract).lend.sendTransactionAsync(
      params.id,
      params.oracleData, 
      params.cosigner,
      params.cosignerLimit, 
      params.cosignerData
    );
  }

  public cancel = async (id: string) => {
    return (await this.contract).cancel.sendTransactionAsync(id);
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

}