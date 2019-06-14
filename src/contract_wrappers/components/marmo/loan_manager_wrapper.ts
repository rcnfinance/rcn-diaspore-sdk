import { BigNumber } from '@0x/utils';
import LoanManagerWrapper from './../web3/loan_manager_wrapper';
import { LoanManagerMarmoContract, Response } from '@jpgonzalezra/marmo-abi-wrappers';
import { Wallet, Provider } from 'marmojs';
import { LendRequestParams } from './../../../diaspore_api';

interface RequestLoanParams {
  amount: BigNumber,
  model: string,
  oracle: string,
  borrower: string,
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

interface RegistreApproveRequestParams {
  id: string,
  signature: string
}

/**
 * This class includes the functionality related to interacting with the LoanManager contract.
 */
export default class LoanManagerMarmoWrapper {


  protected wrapper: LoanManagerWrapper;
  protected contract: LoanManagerMarmoContract;


  /**
   * Instantiate LoanManagerMarmoWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(loanManagerWrapper: LoanManagerWrapper, address: Promise<string>, wallet: Wallet, provider: Provider) {
    this.contract = new LoanManagerMarmoContract(address, wallet, provider);
    this.wrapper = loanManagerWrapper;
  }

  /**
   * Calls
   */
  public getBorrower = async (id: string) => {
    return await this.wrapper.getBorrower(id);
  }

  public getCreator = async (id: string) => {
    return await this.wrapper.getCreator(id);
  }
  public getOracle = async (id: string) => {
    return await this.wrapper.getOracle(id);
  }

  public getCurrency = async (id: string) => {
    return await this.wrapper.getCurrency(id);
  }

  public getAmount = async (id: string) => {
    return (await this.wrapper).getAmount(id);
  }

  public getExpirationRequest = async (id: string) => {
    return await this.wrapper.getExpirationRequest(id)
  }
  public getApproved = async (id: string) => {
    return await this.wrapper.getApproved(id);
  }

  public getDueTime = async (id: string) => {
    return await this.wrapper.getDueTime(id);
  }

  public getClosingObligation = async (id: string) => {
    return await this.wrapper.getClosingObligation(id);
  }

  public getLoanData = async (id: string) => {
    return await this.wrapper.getLoanData(id);
  }

  public getStatus = async (id: string) => {
    return await this.wrapper.getStatus(id);
  }

  public calcId = async (params: GetIdParams) => {
    return await this.wrapper.calcId(params);
  }

  public isCanceled = async (id: string) => {
    return await this.wrapper.cancel(id);
  }

  /**
   *  Send Transactions
   */
  public requestLoan = async (params: RequestLoanParams) => {
    const response: Response = await this.contract.requestLoan(
      params.amount,
      params.model, 
      params.oracle, 
      params.borrower, 
      params.salt, 
      params.expiration, 
      params.data
    );
    return response.txHash;
  }

  public approveRequest = async (id: string) => {
    this.contract.approveRequest(id);
  }

  public registerApproveRequest = async (params: RegistreApproveRequestParams) => {
    this.contract.registerApproveRequest(params.id, params.signature);
  }

  public lend = async (params: LendRequestParams) => {
    const response: Response = await this.contract.lend(
      params.id, 
      params.oracleData, 
      params.cosigner, 
      params.cosignerLimit, 
      params.cosignerData
    )
    return response.txHash
  }

  public cancel = async (id: string) => {
    this.contract.cancel(id)
  }

}