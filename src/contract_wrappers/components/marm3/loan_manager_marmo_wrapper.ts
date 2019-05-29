import {
  LoanManagerEventArgs,
  LoanManagerEvents,
  LoanManagerRequestedEventArgs,
  LoanManagerApprovedEventArgs,
  LoanManagerCanceledEventArgs
} from '@jpgonzalezra/abi-wrappers';
import { LoanManager } from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractAbi, LogWithDecodedArgs } from 'ethereum-types';;
import { BigNumber } from '@0x/utils';
import { LoanManagerContract } from '@jpgonzalezra/abi-wrappers';
import { Provider, Wallet } from 'marmojs'
import { LoanManagerMarmoContract } from '@jpgonzalezra/marmo-abi-wrappers';
interface RequestLoanParams {
  amount: BigNumber, 
  model:string, 
  oracle: string, 
  borrower:string, 
  salt: BigNumber, 
  expiration: BigNumber, 
  data: string
}

/**
 * This class includes the functionality related to interacting with the LoanManager contract.
 */
export default class LoanManagerMarmoWrapper {
  public abi: ContractAbi = LoanManager.abi;

  protected contract: LoanManagerMarmoContract;

  /**
   * Instantiate LoanManagerWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(contract: string, wallet: Wallet, provider: Provider) {
    this.contract = new LoanManagerMarmoContract(contract, wallet, provider);
  }

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

  
}