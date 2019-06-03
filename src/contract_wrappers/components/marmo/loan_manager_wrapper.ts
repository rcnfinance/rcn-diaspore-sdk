import { BigNumber } from '@0x/utils';
import LoanManagerWrapper from './../web3/loan_manager_wrapper';
import { LoanManagerMarmoContract } from '@jpgonzalezra/marmo-abi-wrappers';
import { Wallet, Provider } from 'marmojs';

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

    this.contract.requestLoan.sendTransactionAsync(
      params.amount,
      params.model, 
      params.oracle, 
      params.borrower, 
      params.salt, 
      params.expiration, 
      params.data
    );
  
  }

  public approveRequest = async (id: string) => {
    // TODO:
  }

  public registerApproveRequest = async (params: RegistreApproveRequestParams) => {
    // TODO:
  }

  public lend = async (params: LendRequestParams) => {
    // TODO:
  }

  public cancel = async (id: string) => {
    // TODO:
  }

}